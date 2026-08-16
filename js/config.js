// ChrisTech Academy - Configuration
// IMPORTANT: Only public/anon keys should be here. Never expose secret keys.

const CONFIG = {
  // Supabase Configuration (Public Anon Key only)
  SUPABASE_URL: 'https://jpzyczuqnwjuybzjrrwn.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_Q_lQpXCdECMLfMHDg5kIDg_nfnUmEOa',

  // Paystack Configuration (Public Key only)
  PAYSTACK_PUBLIC_KEY: 'pk_live_66e9a8d01db43b7d893731df4386f9bfc2d67697',

  // Application Settings
  APP_NAME: 'ChrisTech Academy',
  APP_SHORT_NAME: 'CTA',
  CURRENCY: 'KES',
  CURRENCY_SYMBOL: 'KES',

  // Student Number Format
  STUDENT_NUMBER_PREFIX: 'CTA',
  STUDENT_NUMBER_FORMAT: (year, seq) => `CTA/${year}/${String(seq).padStart(4, '0')}`,

  // Certificate Number Format
  CERTIFICATE_PREFIX: 'CTA-CERT',
  CERTIFICATE_FORMAT: (year, seq) => `CTA-CERT-${year}-${String(seq).padStart(5, '0')}`,

  // File Upload Limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],

  // Payment Settings
  MIN_PAYMENT: 100, // Minimum payment in KES
  PAYMENT_CURRENCY: 'KES',

  // Academy Information
  ACADEMY: {
    name: 'ChrisTech Academy',
    tagline: 'Empowering Digital Skills',
    email: 'support@christech.co.ke',
    phone: '+254 701 059 192',
    address: 'Nairobi, Kenya',
    website: 'https://christech.co.ke'
  },

  // Status Constants
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    SUCCESSFUL: 'successful',
    FAILED: 'failed',
    REVERSED: 'reversed'
  },

  // Enrollment Status
  ENROLLMENT_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    DROPPED: 'dropped',
    SUSPENDED: 'suspended'
  },

  // Learning Modes
  LEARNING_MODES: {
    ONLINE: 'online',
    PHYSICAL: 'physical',
    HYBRID: 'hybrid'
  },

  // Fee Payment Status
  FEE_STATUS: {
    UNPAID: 'unpaid',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid'
  },

  // Document Status
  DOCUMENT_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  // Attendance Status
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late'
  }
};

// Freeze configuration to prevent modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.STATUS);
Object.freeze(CONFIG.PAYMENT_STATUS);
Object.freeze(CONFIG.ENROLLMENT_STATUS);
Object.freeze(CONFIG.LEARNING_MODES);
Object.freeze(CONFIG.FEE_STATUS);
Object.freeze(CONFIG.DOCUMENT_STATUS);
Object.freeze(CONFIG.ATTENDANCE_STATUS);
