#!/bin/bash

echo "🚀 Starting Ministry Call Center Mobile App"
echo "==========================================="
echo ""

# Navigate to mobile app directory
cd "$(dirname "$0")/mobile-app/ministry-call-center" || exit 1

echo "📱 Mobile App Directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
    echo ""
fi

echo "🎯 Starting Expo development server..."
echo ""
echo "📲 Instructions:"
echo "  1. Install 'Expo Go' app on your phone:"
echo "     - iOS: https://apps.apple.com/app/expo-go/id982107779"
echo "     - Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
echo ""
echo "  2. Scan the QR code that appears below with:"
echo "     - iOS: Camera app"
echo "     - Android: Expo Go app"
echo ""
echo "  3. The Ministry Call Center app will open on your phone!"
echo ""
echo "==========================================="
echo ""

# Start Expo
npm start
