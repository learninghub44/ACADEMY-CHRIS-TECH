// Supabase Edge Function: verify-payment
// This function verifies Paystack payments server-side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request body
    const { reference, enrollment_id, amount, student_id } = await req.json();

    // Validate required fields
    if (!reference || !enrollment_id || !amount || !student_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Failed to verify transaction with Paystack",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transaction = paystackData.data;

    // Verify transaction details
    if (transaction.status !== "success") {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Transaction was not successful",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify amount (Paystack amount is in kobo/pesewas)
    const expectedAmountInKobo = amount * 100;
    if (transaction.amount !== expectedAmountInKobo) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Amount mismatch",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify currency
    if (transaction.currency !== "KES") {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Currency mismatch",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate payment
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("paystack_reference", reference)
      .single();

    if (existingPayment) {
      return new Response(
        JSON.stringify({
          status: "success",
          message: "Payment already processed",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify enrollment belongs to student
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, course_id, courses(fee)")
      .eq("id", enrollment_id)
      .eq("student_id", student_id)
      .single();

    if (!enrollment) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Enrollment not found",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate outstanding balance to prevent overpayment
    const { data: existingPayments } = await supabase
      .from("payments")
      .select("amount")
      .eq("enrollment_id", enrollment_id)
      .eq("status", "successful");

    const totalPaid = (existingPayments || []).reduce(
      (sum, p) => sum + p.amount,
      0
    );
    const outstandingBalance = enrollment.courses.fee - totalPaid;

    if (amount > outstandingBalance) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Payment amount exceeds outstanding balance",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        student_id,
        enrollment_id,
        amount,
        currency: "KES",
        paystack_reference: reference,
        payment_method: "paystack",
        status: "successful",
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Return success response
    return new Response(
      JSON.stringify({
        status: "success",
        message: "Payment verified and recorded successfully",
        payment_id: payment.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
