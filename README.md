# Fansign Generator

A Next.js application for generating custom fansigns with AI-powered text rendering and image processing.

## Features

- Multiple fansign styles (Classic, Bophouse, LIV, Times Square, etc.)
- AI-powered handwriting text rendering
- User authentication and credit system
- Cryptocurrency payments via OxaPay
- Real-time image processing

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

### Step-by-Step Railway Setup

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Set Environment Variables**
   - Go to your project dashboard
   - Click "Variables" tab
   - Add the required variables listed above
   - **Important**: Don't set `NEXT_PUBLIC_APP_URL` or `NEXTAUTH_URL` - Railway will handle these automatically

3. **Supabase Setup**
   - Create a [Supabase](https://supabase.com) project
   - Go to Settings → API to get your keys
   - Run the SQL migrations in the Query Editor:
     ```sql
     -- Copy and paste the contents of supabase/migrations/20250616010557_dry_hall.sql
     -- Then copy and paste the contents of supabase/migrations/20250616013732_small_cell.sql
     ```

4. **Generate Secrets**
   - For `NEXTAUTH_SECRET`, generate a random 32-character string:
     ```bash
     openssl rand -base64 32
     ```

5. **Deploy**
   - Railway will automatically deploy when you push to your main branch
   - Your app will be available at `https://your-app.railway.app`

### Common Railway Issues

#### URL Format Error
If you see "Invalid URL" errors, make sure you're NOT setting `NEXT_PUBLIC_APP_URL` manually. Railway provides `RAILWAY_STATIC_URL` which the app will automatically format correctly.

#### Build Failures
- Ensure all required environment variables are set
- Check Railway logs for specific error messages
- Make sure Supabase credentials are correct

### OxaPay Setup (Optional)

For cryptocurrency payments:

1. Create an [OxaPay](https://oxapay.com) merchant account
2. Set your callback URL to: `https://your-app.railway.app/api/payments/callback`
3. Add your merchant key to `OXAPAY_MERCHANT_KEY`

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables in .env.local

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

### Build Issues
- Ensure all required environment variables are set
- Check Railway logs for specific error messages
- Don't manually set URL variables - let Railway handle them

### Database Issues
- Verify Supabase URL and keys are correct
- Ensure database migrations have been run
- Check Supabase dashboard for connection issues

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set and secure
- Let Railway auto-configure URLs via `RAILWAY_STATIC_URL`
- Ensure Supabase RLS policies are properly configured

For more help, check the Railway logs or contact support.