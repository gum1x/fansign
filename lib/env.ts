// Environment variable validation and defaults
// Safe environment variable access that works during build time

function getEnvVar(key: string, defaultValue: string = ''): string {
  try {
    // For Next.js, environment variables are available in process.env
    const value = process.env[key] || defaultValue
    
    // Clean up the value by removing any whitespace, newlines, or quotes
    return value.trim().replace(/^["']|["']$/g, '').replace(/\n/g, '').replace(/\r/g, '')
  } catch (error) {
    console.warn(`Warning: Could not access environment variable ${key}`)
    return defaultValue
  }
}

function formatUrl(url: string): string {
  if (!url || url === 'undefined' || url === 'null' || url.includes('placeholder')) {
    return 'http://localhost:3000'
  }
  
  // Clean the URL first
  url = url.trim().replace(/^["']|["']$/g, '').replace(/\n/g, '').replace(/\r/g, '')
  
  // Handle Netlify URLs that might not have protocol
  if (url.includes('netlify.app') && !url.startsWith('http')) {
    return `https://${url}`
  }
  
  // Handle Railway URLs that might not have protocol
  if (url.includes('railway.app') && !url.startsWith('http')) {
    return `https://${url}`
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
  !process.env.RAILWAY_ENVIRONMENT &&
  !process.env.VERCEL &&
  !process.env.NETLIFY
)

export const env = {
  // Database - safe defaults for build time
  NEXT_PUBLIC_SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'placeholder-key'),

  // App URL - Netlify integration with safe fallbacks
  NEXT_PUBLIC_APP_URL: formatUrl(
    getEnvVar('NEXT_PUBLIC_APP_URL') || 
    getEnvVar('URL') || // Netlify provides this
    getEnvVar('DEPLOY_URL') || // Netlify deploy preview URL
    getEnvVar('RAILWAY_STATIC_URL') || 
    'http://localhost:3000'
  ),

  // Payment - safe default
  OXAPAY_MERCHANT_KEY: getEnvVar('OXAPAY_MERCHANT_KEY', 'placeholder-key'),

  // Security - safe defaults
  NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET', 'development-secret-key-32-chars-long'),
  NEXTAUTH_URL: formatUrl(
    getEnvVar('NEXTAUTH_URL') || 
    getEnvVar('URL') || // Netlify provides this
    getEnvVar('DEPLOY_URL') || // Netlify deploy preview URL
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
  
  // Platform detection
  isRailway: !!getEnvVar('RAILWAY_ENVIRONMENT'),
  isVercel: !!getEnvVar('VERCEL'),
  isNetlify: !!getEnvVar('NETLIFY'),
}

// Validate required environment variables (only in runtime, not build time)
export function validateEnv() {
  // Skip validation during build time
  if (env.isBuild || typeof window === 'undefined') {
    return
  }

  // Check if Supabase credentials are properly configured
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL is not properly configured')
  }
  
  if (!supabaseKey || supabaseKey.includes('placeholder') || supabaseKey === 'placeholder-key') {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is not properly configured')
  }
  
  if (supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('⚠️ Supabase credentials not configured, running in demo mode')
  }

  if (env.isProduction && (env.isRailway || env.isVercel || env.isNetlify)) {
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