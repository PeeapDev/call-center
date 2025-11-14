#!/bin/bash

echo "🚀 Ministry Call Center - Mobile App Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "MOBILE_APP_STACK.md" ]; then
    echo "❌ Please run this script from the mobile-app directory"
    exit 1
fi

# Create React Native project with Expo
echo "📱 Creating React Native project with Expo..."
npx create-expo-app@latest ministry-call-center --template blank-typescript

cd ministry-call-center

echo ""
echo "📦 Installing core dependencies..."
npx expo install @react-navigation/native
npx expo install @react-navigation/native-stack
npx expo install @react-navigation/bottom-tabs
npx expo install react-native-screens
npx expo install react-native-safe-area-context

echo ""
echo "🎨 Installing UI libraries..."
npm install react-native-paper
npm install react-native-vector-icons

echo ""
echo "📞 Installing WebRTC and calling libraries..."
npm install react-native-webrtc
npm install react-native-incall-manager

echo ""
echo "📸 Installing QR code libraries..."
npm install react-native-qrcode-scanner
npm install react-native-qrcode-svg
npx expo install expo-camera

echo ""
echo "🔐 Installing authentication libraries..."
npx expo install expo-secure-store
npx expo install expo-local-authentication

echo ""
echo "🔔 Installing notification libraries..."
npx expo install expo-notifications

echo ""
echo "🌐 Installing networking libraries..."
npm install axios
npm install @tanstack/react-query

echo ""
echo "📊 Installing state management..."
npm install zustand

echo ""
echo "✅ Installation complete!"
echo ""
echo "📱 Project Structure:"
cat > README.md << 'EOF'
# Ministry Call Center Mobile App

## Features
- 📞 WebRTC calling
- 📸 QR code attendance
- 📋 Case management
- 🔔 Push notifications
- 🔐 Biometric authentication

## Run Development Server
\`\`\`bash
npm start
\`\`\`

## Run on iOS
\`\`\`bash
npm run ios
\`\`\`

## Run on Android
\`\`\`bash
npm run android
\`\`\`

## Build for Production
\`\`\`bash
# iOS
eas build --platform ios

# Android
eas build --platform android
\`\`\`
EOF

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. cd ministry-call-center"
echo "2. npm start"
echo "3. Scan QR code with Expo Go app on your phone"
echo ""
echo "📖 See MOBILE_APP_STACK.md for detailed documentation"
