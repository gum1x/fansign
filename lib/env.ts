// Environment variable validation and defaults
export const env = {
  // Database
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // App - Fix Railway URL format
  NEXT_PUBLIC_APP_URL: (() => {
    const url = process.env.NEXT_PUBLIC_APP_URL || process.env.RAILWAY_STATIC_URL || 'http://localhost:3000'
    // Ensure URL has protocol
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  })(),

  // Payment
  OXAPAY_MERCHANT_KEY: process.env.OXAPAY_MERCHANT_KEY || '',

  // Security
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-key',
  NEXTAUTH_URL: (() => {
    const url = process.env.NEXTAUTH_URL || process.env.RAILWAY_STATIC_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    // Ensure URL has protocol
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  })(),

  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Check if we're in production
  isProduction: process.env.NODE_ENV === 'production',
  
  // Check if we're in development
  isDevelopment: process.env.NODE_ENV === 'development',

  // Check if we're in build mode (Railway detection)
  isBuild: process.env.NODE_ENV === 'production' && (
    !process.env.RAILWAY_ENVIRONMENT || 
    process.env.RAILWAY_STATIC_URL === undefined
  ),
}

// Validate required environment variables in production
export function validateEnv() {
  // Skip validation during build time
  if (env.isBuild) {
    console.log('⚠️ Skipping environment validation during build')
    return
  }

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
      return !value || value.trim() === ''
    })

    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`)
      console.warn('⚠️ Some features may not work correctly in production')
    } else {
      console.log('✅ All required environment variables are configured')
    }
  }
}

// Call validation on import, but only if not in build mode
if (!env.isBuild) {
  validateEnv()
}