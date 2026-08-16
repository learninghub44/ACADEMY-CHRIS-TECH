// Supabase Edge Function: paystack-webhook
// This function handles Paystack webhook events

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

// Verify Paystack webhook signature
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );

    const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const signatureArray = new Uint8Array(signed);
    const computedSignature = Array.from(signatureArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return computedSignature === signature;
  } catch {
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get webhook signature
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("No signature provided");
      return new Response("No signature", { status: 400 });
    }

    // Get request body as text for signature verification
    const body = await req.text();

    // Get Paystack webhook secret
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const webhookSecret = Deno.env.get("PAYSTACK_WEBHOOK_SECRET") || paystackSecretKey;

    if (!webhookSecret) {
      throw new Error("Paystack webhook secret not configured");
    }

    // Verify signature
    const isValid = await verifySignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    const { event, data } = payload;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event) {
      case "charge.success":
        await handleChargeSuccess(supabase, data);
        break;

      case "charge.failed":
        await handleChargeFailed(supabase, data);
        break;

      case "charge.reversed":
        await handleChargeReversed(supabase, data);
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return new Response(
      JSON.stringify({ status: "success" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleChargeSuccess(supabase: any, data: any) {
  const { reference, amount, currency, customer, metadata } = data;

  // Check if payment already exists
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("paystack_reference", reference)
    .single();

  if (existingPayment) {
    // Update status if pending
    if (existingPayment.status === "pending") {
      await supabase
        .from("payments")
        .update({
          status: "successful",
          paid_at: new Date().toISOString(),
        })
        .eq("id", existingPayment.id);
    }
    return;
  }

  // Get student and enrollment from metadata
  const studentId = metadata?.student_id;
  const enrollmentId = metadata?.enrollment_id;

  if (!studentId || !enrollmentId) {
    console.error("Missing student_id or enrollment_id in metadata");
    return;
  }

  // Verify enrollment belongs to student
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, course_id, courses(fee)")
    .eq("id", enrollmentId)
    .eq("student_id", studentId)
    .single();

  if (!enrollment) {
    console.error("Enrollment not found");
    return;
  }

  // Calculate outstanding balance
  const { data: existingPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("enrollment_id", enrollmentId)
    .eq("status", "successful");

  const totalPaid = (existingPayments || []).reduce(
    (sum: number, p: any) => sum + p.amount,
    0
  );
  const paymentAmount = amount / 100; // Convert from kobo/pesewas

  // Record the payment
  await supabase.from("payments").insert({
    student_id: studentId,
    enrollment_id: enrollmentId,
    amount: paymentAmount,
    currency: currency || "KES",
    paystack_reference: reference,
    payment_method: "paystack",
    status: "successful",
    paid_at: new Date().toISOString(),
  });

  console.log(`Payment recorded: ${reference} - ${paymentAmount} ${currency}`);
}

async function handleChargeFailed(supabase: any, data: any) {
  const { reference } = data;

  // Update payment status if exists
  await supabase
    .from("payments")
    .update({ status: "failed" })
    .eq("paystack_reference", reference);

  console.log(`Payment failed: ${reference}`);
}

async function handleChargeReversed(supabase: any, data: any) {
  const { reference } = data;

  // Update payment status if exists
  await supabase
    .from("payments")
    .update({ status: "reversed" })
    .eq("paystack_reference", reference);

  console.log(`Payment reversed: ${reference}`);
}
