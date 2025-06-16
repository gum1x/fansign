// Environment variable validation and defaults
// Safe environment variable access that works during build time

function getEnvVar(key: string, defaultValue: string = ''): string {
  try {
    return process.env[key] || defaultValue
  } catch (error) {
    console.warn(`Warning: Could not access environment variable ${key}`)
    return defaultValue
  }
}

function formatUrl(url: string): string {
  if (!url || url === 'undefined' || url === 'null') {
    return 'http://localhost:3000'
  }
  
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  
  return url
}

// Check if we're in build mode
const isBuildMode = process.env.NODE_ENV === 'production' && (
  typeof window === 'undefined' && 
  !process.env.RAILWAY_ENVIRONMENT
)

export const env = {
  // Database - safe defaults for build time
  NEXT_PUBLIC_SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'placeholder-key'),

  // App URL - Railway integration with safe fallbacks
  NEXT_PUBLIC_APP_URL: formatUrl(
    getEnvVar('NEXT_PUBLIC_APP_URL') || 
    getEnvVar('RAILWAY_STATIC_URL') || 
    'http://localhost:3000'
  ),

  // Payment - safe default
  OXAPAY_MERCHANT_KEY: getEnvVar('OXAPAY_MERCHANT_KEY', 'placeholder-key'),

  // Security - safe defaults
  NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET', 'development-secret-key-32-chars-long'),
  NEXTAUTH_URL: formatUrl(
    getEnvVar('NEXTAUTH_URL') || 
    getEnvVar('RAILWAY_STATIC_URL') || 
    getEnvVar('NEXT_PUBLIC_APP_URL') || 
    'http://localhost:3000'
  ),

  // Node environment
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  // Environment checks
  isProduction: getEnvVar('NODE_ENV') === 'production',
  isDevelopment: getEnvVar('NODE_ENV') === 'development',
  isBuild: isBuildMode,
  
  // Railway detection
  isRailway: !!getEnvVar('RAILWAY_ENVIRONMENT'),
}

// Validate required environment variables (only in runtime, not build time)
export function validateEnv() {
  // Skip validation during build time
  if (env.isBuild || typeof window === 'undefined') {
    return
  }

  if (env.isProduction && env.isRailway) {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET'
    ]

    const missingVars = requiredVars.filter(varName => {
      const value = getEnvVar(varName)
      return !value || value.includes('placeholder') || value.trim() === ''
    })

    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`)
    } else {
      console.log('✅ All required environment variables are configured')
    }
  }
}

// Only validate if we're in the browser (client-side)
if (typeof window !== 'undefined') {
  validateEnv()
}