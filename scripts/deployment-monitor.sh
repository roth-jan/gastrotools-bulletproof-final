#!/bin/bash

# Deployment Monitor - Auto-check Vercel status
echo "📊 Deployment Monitor"
echo "===================="

# Function to check build status
check_build() {
    echo "🔍 Checking latest deployment..."
    
    # Get latest deployment info
    LATEST=$(vercel ls gastrotools-bulletproof --limit 1 2>/dev/null | tail -n +3 | head -1)
    
    if [ -z "$LATEST" ]; then
        echo "❌ No deployments found or Vercel CLI not logged in"
        return 1
    fi
    
    STATUS=$(echo "$LATEST" | awk '{print $2}')
    AGE=$(echo "$LATEST" | awk '{print $3}')
    
    echo "Status: $STATUS"
    echo "Age: $AGE"
    
    case "$STATUS" in
        "Ready")
            echo "✅ Deployment successful!"
            return 0
            ;;
        "Building")
            echo "⏳ Still building..."
            return 2
            ;;
        "Error")
            echo "❌ Build failed!"
            return 1
            ;;
        "Queued")
            echo "📋 Queued for build..."
            return 2
            ;;
        *)
            echo "⚠️  Unknown status: $STATUS"
            return 1
            ;;
    esac
}

# Monitor loop
MAX_ATTEMPTS=20
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "Attempt $ATTEMPT/$MAX_ATTEMPTS"
    
    check_build
    BUILD_STATUS=$?
    
    if [ $BUILD_STATUS -eq 0 ]; then
        echo "🎉 Deployment completed successfully!"
        echo "🌐 Live at: https://gastrotools-bulletproof.vercel.app"
        exit 0
    elif [ $BUILD_STATUS -eq 1 ]; then
        echo "💥 Build failed permanently. Manual fix needed."
        
        # Try to get build logs
        echo "📋 Recent deployments:"
        vercel ls gastrotools-bulletproof | head -5
        exit 1
    else
        # Build still in progress
        echo "⏳ Waiting 30 seconds..."
        sleep 30
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

echo "⏰ Timeout: Build taking longer than expected"
echo "📋 Current status:"
vercel ls gastrotools-bulletproof | head -5