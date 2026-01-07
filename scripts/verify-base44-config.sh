#!/bin/bash

# Base44 Configuration Verification Script
# Usage: ./scripts/verify-base44-config.sh

echo "========================================="
echo "Base44 Configuration Diagnostic"
echo "========================================="
echo ""

# Check 1: Environment variable
echo "1. Checking environment variable..."
if [ -n "$VITE_BASE44_APP_ID" ]; then
    echo "   ✅ VITE_BASE44_APP_ID is set: $VITE_BASE44_APP_ID"
else
    echo "   ⚠️  VITE_BASE44_APP_ID is NOT set"
    echo "   → Will use hardcoded fallback: 68aceeea253a7630b16aa021"
fi
echo ""

# Check 2: .env file
echo "2. Checking .env file..."
if [ -f ".env" ]; then
    if grep -q "VITE_BASE44_APP_ID" .env; then
        APP_ID=$(grep "VITE_BASE44_APP_ID" .env | cut -d '=' -f2 | tr -d ' "'"'"'')
        echo "   ✅ Found in .env: $APP_ID"
    else
        echo "   ⚠️  .env exists but VITE_BASE44_APP_ID not found"
    fi
else
    echo "   ℹ️  No .env file found (expected for Vercel deployment)"
fi
echo ""

# Check 3: Source code
echo "3. Checking source code..."
HARDCODED_ID=$(grep -o "68aceeea253a7630b16aa021" src/api/base44Client.js)
if [ -n "$HARDCODED_ID" ]; then
    echo "   ℹ️  Fallback app ID in code: $HARDCODED_ID"
    echo "   → This is the PLACEHOLDER (invalid)"
else
    echo "   ⚠️  Could not find app ID in source"
fi
echo ""

# Check 4: Built files
echo "4. Checking built bundle..."
if [ -d "dist" ]; then
    BUILT_ID=$(grep -o "68aceeea253a7630b16aa021" dist/assets/*.js 2>/dev/null | head -1)
    if [ -n "$BUILT_ID" ]; then
        echo "   ⚠️  Build contains PLACEHOLDER app ID"
        echo "   → This will cause 404 errors in production"
    else
        echo "   ℹ️  Could not verify app ID in build (or using env var)"
    fi
else
    echo "   ℹ️  No dist folder found (run: npm run build)"
fi
echo ""

# Check 5: Package versions
echo "5. Checking Base44 SDK version..."
SDK_VERSION=$(grep '"@base44/sdk"' package.json | grep -o '[0-9.]*' | head -1)
echo "   ℹ️  Installed version: $SDK_VERSION"
echo ""

# Summary
echo "========================================="
echo "SUMMARY"
echo "========================================="
echo ""

if [ -z "$VITE_BASE44_APP_ID" ] && [ -f "dist/assets" ]; then
    echo "🔴 CRITICAL: Production will use PLACEHOLDER app ID"
    echo ""
    echo "Required Actions:"
    echo "1. Get your real Base44 app ID from https://base44.com"
    echo "2. Set VITE_BASE44_APP_ID in Vercel environment variables"
    echo "3. Redeploy to production"
    echo ""
    echo "See DEPLOYMENT_FIX_GUIDE.md for detailed instructions"
elif [ -n "$VITE_BASE44_APP_ID" ]; then
    echo "✅ Environment variable is set"
    echo ""
    echo "Next Steps:"
    echo "1. Verify the app ID is correct in Base44 dashboard"
    echo "2. Ensure OAuth redirects are configured for your domain"
    echo "3. Deploy and test authentication"
else
    echo "ℹ️  Local development setup"
    echo ""
    echo "To test locally:"
    echo "1. Create .env file with: VITE_BASE44_APP_ID=<your-real-id>"
    echo "2. Run: npm run dev"
    echo "3. Test at http://localhost:5173"
fi
echo ""
echo "========================================="
