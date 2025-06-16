# Fansign Generator

A Next.js application for generating custom fansigns with AI-powered text rendering and image processing.

## Features

- Multiple fansign styles (Classic, Bophouse, LIV, Times Square, etc.)
- AI-powered handwriting text rendering
- User authentication and credit system
- Cryptocurrency payments via OxaPay
- Real-time image processing

## Setup

### 1. Configuration

All API keys and configuration are now hardcoded in the `lib/config.ts` file. You need to update the following values:

```typescript
export const config = {
  // Supabase Configuration
  supabase: {
    url: "https://your-project.supabase.co", // Replace with your actual Supabase URL
    anonKey: "your-supabase-anon-key-here", // Replace with your actual anon key
    serviceRoleKey: "your-supabase-service-role-key-here", // Replace with your actual service role key
  },

  // Payment Configuration (OxaPay)
  payment: {
    merchantKey: "your-oxapay-merchant-key-here", // Replace with your actual OxaPay merchant key
  },

  // Security
  auth: {
    secret: "your-nextauth-secret-here", // Replace with a random secret
  },
}
```

**⚠️ SECURITY WARNING**: Hardcoding API keys in source code is NOT recommended for production applications as it exposes sensitive information. This approach should only be used for development/demo purposes.

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the migrations in the `supabase/migrations` folder
3. Copy your project URL and keys to `lib/config.ts`

### 3. OxaPay Setup

1. Create an OxaPay merchant account
2. Set your callback URL to: `https://your-app.netlify.app/api/payments/callback`
3. Copy your merchant key to `lib/config.ts`

### 4. Deployment

This app is configured for Netlify deployment:

1. Connect your GitHub repository to Netlify
2. Deploy (no environment variables needed since they're hardcoded)

## Development

```bash
npm install
npm run dev
```

## Health Check

Visit `/api/health` to check the status of all services.

## Database Schema

The app uses the following main tables:
- `users` - User accounts with credits
- `generations` - Fansign generation history
- `payments` - Payment transactions

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/generate` - Generate fansign
- `POST /api/payments/create-payment` - Create payment
- `GET /api/payments/status/[trackId]` - Check payment status
- `POST /api/payments/callback` - Payment webhook
- `GET /api/health` - Health check

## Technologies

- Next.js 15
- Supabase (Database & Auth)
- TypeScript
- Tailwind CSS
- Canvas API for image processing
- OxaPay for cryptocurrency payments

## Security Note

This configuration exposes API keys in the source code. For production applications, you should:

1. Use environment variables instead of hardcoded values
2. Set up proper CI/CD with secret management
3. Use server-side API routes to protect sensitive keys
4. Implement proper authentication and authorization