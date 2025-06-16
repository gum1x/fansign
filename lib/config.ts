// Configuration with hardcoded values
// WARNING: This exposes sensitive information in source code
// Only use this for development/demo purposes

export const config = {
  // Supabase Configuration
  supabase: {
    url: "https://ppylhaipynyuvxvfsftb.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweWxoYWlweW55dXZ4dmZzZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMzY0NzIsImV4cCI6MjA2NTYxMjQ3Mn0.q6UNGH88YsDXIY73jjWk7jqr3RVJ8a4fa--YdmgyuUU",
    serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweWxoYWlweW55dXZ4dmZzZnRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAzNjQ3MiwiZXhwIjoyMDY1NjEyNDcyfQ.ZGfWms9AVxldyJhLki0XI0rQuQE0HL9TlGpqoxHYMr0",
  },

  // App Configuration
  app: {
    url: "https://fansign.netlify.app", // Your deployed app URL
  },

  // Payment Configuration (OxaPay)
  payment: {
    merchantKey: "W4XUVS-6WDI1B-55YR9I-AUQFH4",
  },

  // Security
  auth: {
    secret: "rTLBYSXa3b8ErpqgxJCL63JXdQ6zQLyFEJEY7",
    url: "https://fansign.netlify.app",
  },

  // Environment
  isDevelopment: false, // Set to true for development
  isProduction: true,
}

// Credit packages for payments
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 2.99,
    popular: false
  },
  {
    id: 'credits_25',
    name: '25 Credits',
    credits: 25,
    price: 5.99,
    popular: true
  },
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 9.99,
    popular: false
  },
  {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 17.99,
    popular: false
  }
]

export const GENERATION_COSTS = {
  'sign': 1,
  'bophouse': 1,
  'bophouse-new': 1,
  'liv': 1,
  'liv-digital': 1,
  'poppy': 1,
  'booty': 1,
  'double-monkey': 1,
  'three-cats': 1,
  'times-square': 2,
  'times-square-new': 3,
}