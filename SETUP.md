# 🚀 Local Development Setup

This guide will help you set up the SoshlOps application for local development.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Clerk account (free tier available)
- Supabase account (free tier available)

## Step 1: Clone and Install

```bash
git clone <repository-url>
cd socialmedia-os
npm install
```

## Step 2: Set Up Clerk Authentication

### 2.1 Create a Clerk Account

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up or log in
3. Click "Create Application"
4. Name it "SoshlOps Dev" (or any name you prefer)
5. Select authentication methods (recommended: Email + Google)
6. Click "Create Application"

### 2.2 Get Your Clerk Keys

1. In the Clerk Dashboard, go to **API Keys** in the left sidebar
2. Copy the **Publishable Key** (starts with `pk_test_...`)
3. Keep this page open - you'll need it for the next step

### 2.3 Configure Clerk Paths

1. In Clerk Dashboard → **Configure** → **Paths**
2. Set these paths:
   - **Sign-in URL:** `/Signin`
   - **Sign-up URL:** `/Signin`
   - **After sign-in URL:** `/Dashboard`
   - **After sign-up URL:** `/Dashboard`
3. Click **Save**

## Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Name:** SoshlOps Dev
   - **Database Password:** (save this somewhere secure)
   - **Region:** Choose closest to you
5. Click "Create new project" (takes ~2 minutes)

### 3.2 Get Your Supabase Keys

1. Once the project is ready, go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - KEEP THIS SECRET!

## Step 4: Create .env File

1. In the project root, create a file named `.env`:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Supabase Database
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Replace the placeholder values with your actual keys from steps 2 and 3

## Step 5: Run the Development Server

```bash
npm run dev
```

The app should now be running at [http://localhost:5173](http://localhost:5173)

## Step 6: Test Authentication

1. Navigate to [http://localhost:5173/Signin](http://localhost:5173/Signin)
2. You should see the Clerk sign-in form
3. Sign up with your email or Google account
4. After signing in, you should be redirected to the Dashboard

## Troubleshooting

### "Authentication Not Configured" Error

- **Cause:** The `.env` file doesn't exist or `VITE_CLERK_PUBLISHABLE_KEY` is missing
- **Fix:** Create `.env` file and add your Clerk publishable key (see Step 4)
- **Note:** After creating/modifying `.env`, you MUST restart the dev server (`Ctrl+C`, then `npm run dev`)

### Clerk Form Doesn't Appear

- **Check:** Browser console for errors (F12 → Console tab)
- **Check:** Verify `VITE_CLERK_PUBLISHABLE_KEY` starts with `pk_test_` or `pk_live_`
- **Check:** Ensure you restarted the dev server after creating `.env`

### "Invalid publishable key" Error

- **Cause:** The Clerk key is incorrect or from a different environment
- **Fix:** Double-check you copied the full key from Clerk Dashboard → API Keys

### Social OAuth Not Working (LinkedIn, X, Meta)

- **This is expected:** Social media OAuth requires:
  1. Supabase Edge Functions to be deployed
  2. OAuth apps configured on LinkedIn, X, and Meta developer portals
  3. Redirect URIs set up correctly
- **For now:** Basic authentication with Clerk will work for testing the app

## Optional: Set Up Social Media OAuth (Advanced)

If you want to test LinkedIn, X (Twitter), or Meta (Facebook) connections:

1. Follow the guide in `docs/OAUTH_SETUP.md` (if it exists)
2. You'll need to:
   - Create developer apps on each platform
   - Deploy Supabase Edge Functions
   - Configure OAuth redirect URIs
   - Set additional environment variables

This is not required for basic app functionality.

## Next Steps

- ✅ Authentication working? Start exploring the codebase
- ✅ Build features? Check `src/pages/` for main app pages
- ✅ Need help? Check browser console for errors
- ✅ Want to contribute? See `CONTRIBUTING.md` (if it exists)

## Quick Reference

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Clerk auth public key | `pk_test_...` |
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase public key | `eyJ...` |
| `ENCRYPTION_KEY` | 🟡 Optional | For encrypting social tokens | 64-char hex |
| `LINKEDIN_CLIENT_ID` | 🟡 Optional | LinkedIn OAuth | From LinkedIn dev portal |
| `X_CLIENT_ID` | 🟡 Optional | X (Twitter) OAuth | From X dev portal |
| `META_CLIENT_ID` | 🟡 Optional | Meta OAuth | From Meta dev portal |

### Common Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint
```

---

**Built with:** React + Vite + Clerk + Supabase + Tailwind CSS
