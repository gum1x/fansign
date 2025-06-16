// Environment variable validation and defaults
export const env = {
  // Database
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',

  // App
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Payment
  OXAPAY_MERCHANT_KEY: process.env.OXAPAY_MERCHANT_KEY || 'placeholder-merchant-key',

  // Security
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-key',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',

  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Check if we're in production
  isProduction: process.env.NODE_ENV === 'production',
  
  // Check if we're in development
  isDevelopment: process.env.NODE_ENV === 'development',
}

// Validate required environment variables in production
export function validateEnv() {
  if (env.isProduction) {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_APP_URL',
      'NEXTAUTH_SECRET'
    ]

    const missingVars = requiredVars.filter(varName => {
      const value = process.env[varName]
      return !value || value.includes('placeholder')
    })

    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing or placeholder environment variables: ${missingVars.join(', ')}`)
      console.warn('⚠️ Some features may not work correctly in production')
    }
  }
}

// Call validation on import
validateEnv()