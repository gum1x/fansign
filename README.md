# Fansign Generator

A Next.js application for generating custom fansigns with AI-powered text rendering and image processing.

## Features

- Multiple fansign styles (Classic, Bophouse, LIV, Times Square, etc.)
- AI-powered handwriting text rendering
- User authentication and credit system
- Cryptocurrency payments via OxaPay
- Real-time image processing

## Setup

### 1. Environment Variables

Create a `.env.local` file and add your environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.netlify.app

# Payment Configuration (OxaPay)
OXAPAY_MERCHANT_KEY=your-oxapay-merchant-key

# Security
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-app.netlify.app
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the migrations in the `supabase/migrations` folder
3. Copy your project URL and keys to your environment variables

### 3. OxaPay Setup

1. Create an OxaPay merchant account
2. Set your callback URL to: `https://your-app.netlify.app/api/payments/callback`
3. Copy your merchant key to your environment variables

### 4. Deployment

This app is configured for Netlify deployment with dynamic functionality:

1. Connect your GitHub repository to Netlify
2. Set your environment variables in Netlify dashboard
3. Deploy

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

## Architecture

This is a **dynamic site** with:
- Server-side API routes for authentication and payments
- Database integration with Supabase
- Real-time payment processing
- Secure environment variable handling
- Full-stack functionality

For production deployment, make sure to:
1. Set all environment variables in your hosting platform
2. Configure your Supabase database
3. Set up OxaPay merchant account
4. Test all API endpoints