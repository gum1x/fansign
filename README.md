# Fansign Generator

A Next.js application for generating custom fansigns with AI-powered text rendering and image processing.

## Features

- Multiple fansign styles (Classic, Bophouse, LIV, Times Square, etc.)
- AI-powered handwriting text rendering
- User authentication and credit system
- Cryptocurrency payments via OxaPay
- Real-time image processing

## Netlify Deployment

### Required Environment Variables

Set these in your Netlify project dashboard (Site settings → Environment variables):

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Security (Required)
NEXTAUTH_SECRET=your-32-character-random-secret-key

# Payment Configuration (Optional)
OXAPAY_MERCHANT_KEY=your-oxapay-merchant-key
```

**⚠️ IMPORTANT**: When copying your Supabase keys, make sure there are **NO extra spaces, newlines, or quotes**. Copy the key exactly as shown in your Supabase dashboard.

**Note**: Netlify automatically provides `URL` and `DEPLOY_URL` which will be used for `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL`. You don't need to set these manually unless you want to override them.

### Step-by-Step Netlify Setup

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18 (set in Environment variables: `NODE_VERSION=18`)

3. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add the required variables listed above
   - **CRITICAL**: When pasting Supabase keys, ensure no extra characters:
     - ✅ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - ❌ `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
     - ❌ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n`

4. **Supabase Setup**
   - Create a [Supabase](https://supabase.com) project
   - Go to Settings → API to get your keys
   - **Copy keys carefully** - no quotes, no newlines, no extra spaces
   - Run the SQL migrations in the Query Editor:
     ```sql
     -- Copy and paste the contents of supabase/migrations/20250616010557_dry_hall.sql
     -- Then copy and paste the contents of supabase/migrations/20250616013732_small_cell.sql
     ```

5. **Generate Secrets**
   - For `NEXTAUTH_SECRET`, generate a random 32-character string:
     ```bash
     openssl rand -base64 32
     ```

6. **Deploy**
   - Netlify will automatically deploy when you push to your main branch
   - Your app will be available at `https://your-site-name.netlify.app`

### Common Netlify Issues

#### ❌ "Invalid Header Value" Error
This happens when your Supabase keys have extra characters:
- **Problem**: `"Bearer \n=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
- **Solution**: Re-copy your Supabase keys without quotes or newlines
- **Fix**: In Netlify dashboard, delete and re-add the environment variables

#### ❌ Build Failures
- Ensure all required environment variables are set
- Check Netlify deploy logs for specific error messages
- Make sure Supabase credentials are correct and properly formatted

#### ❌ Environment Variables Not Loading
- Netlify doesn't read `.env.local` files
- All environment variables must be set in the Netlify dashboard
- After adding variables, trigger a new deploy

### How to Fix Environment Variable Issues

1. **Go to Netlify Dashboard**
2. **Click Site settings → Environment variables**
3. **Delete problematic variables**
4. **Re-add them carefully**:
   - Copy from Supabase dashboard
   - Paste directly (no quotes)
   - Ensure no extra spaces or newlines
   - Save each variable
5. **Trigger new deploy**

### OxaPay Setup (Optional)

For cryptocurrency payments:

1. Create an [OxaPay](https://oxapay.com) merchant account
2. Set your callback URL to: `https://your-site.netlify.app/api/payments/callback`
3. Add your merchant key to `OXAPAY_MERCHANT_KEY`

## Railway Deployment

### Required Environment Variables

Set these in your Railway project dashboard:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Security (Required)
NEXTAUTH_SECRET=your-32-character-random-secret-key

# Payment Configuration (Optional)
OXAPAY_MERCHANT_KEY=your-oxapay-merchant-key
```

**Note**: Railway automatically provides `RAILWAY_STATIC_URL` which will be used for `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL`. You don't need to set these manually unless you want to override them.

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables in .env.local
# IMPORTANT: No quotes, no newlines, no extra spaces

# Run development server
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

## Troubleshooting

### 🔧 Environment Variable Issues

**Problem**: `TypeError: Headers.set: "Bearer \n=eyJ..." is an invalid header value`

**Solution**:
1. Go to Netlify/Railway dashboard → Environment variables
2. Delete `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
3. Go to your Supabase dashboard → Settings → API
4. Copy the keys **exactly** as shown (no quotes, no newlines)
5. Paste them back into Netlify/Railway variables
6. Redeploy

### 🔧 Build Issues
- Ensure all required environment variables are set
- Check deployment logs for specific error messages
- Don't manually set URL variables - let the platform handle them

### 🔧 Database Issues
- Verify Supabase URL and keys are correct and clean
- Ensure database migrations have been run
- Check Supabase dashboard for connection issues

### 🔧 Authentication Issues
- Verify `NEXTAUTH_SECRET` is set and secure
- Let platform auto-configure URLs via platform-provided variables
- Ensure Supabase RLS policies are properly configured

For more help, check the deployment logs or contact support.