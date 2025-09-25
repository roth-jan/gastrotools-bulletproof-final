#!/bin/bash

# Auto-Deploy Script - No more copy/paste from Vercel logs
set -e

echo "🚀 Auto-Deploy Script Started"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run from project root."
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes found. Committing..."
    git add .
    git commit -m "🔧 Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Test build locally first
echo "🔨 Testing local build..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed! Fix errors before deploying."
    npm run build
    exit 1
fi

# Push to GitHub (trigger auto-deploy)
echo "📤 Pushing to GitHub..."
git push origin main

# Wait for Vercel deployment
echo "⏳ Waiting for Vercel deployment..."
sleep 30

# Check if Vercel CLI is available
if command -v vercel >/dev/null 2>&1; then
    echo "📊 Checking deployment status..."
    vercel ls gastrotools-bulletproof | head -5
    
    # Force deploy if auto-deploy failed
    echo "🔄 Force deploying via CLI..."
    vercel --prod --yes --force
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Check: https://gastrotools-bulletproof.vercel.app"
    else
        echo "❌ Deployment failed. Manual intervention needed."
        exit 1
    fi
else
    echo "⚠️  Vercel CLI not available. Manual deployment needed."
fi

echo "🎉 Auto-Deploy Complete!"
echo "======================="