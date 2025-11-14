# 📱 Ministry Call Center Mobile App

React Native mobile app for citizens to call the Ministry of Education Sierra Leone.

## ✨ NEW Features (Enhanced Version)

- 📱 **Phone Number Login** - Citizen & staff authentication
- 🏠 **Landing Dashboard** - Blog posts, FAQs, notices, statistics
- 💬 **AI Chat Assistant** - 24/7 chatbot with backend integration
- 📞 **Call Ministry Hotline** - One-tap calling with IVR
- 🎤 **IVR Navigation** - Easy service selection (Exams, Teachers, Facilities, etc.)
- ⏳ **Queue Management** - Real-time queue status
- 👨‍💼 **Agent Connection** - Direct connection to available agents
- 🔇 **Call Controls** - Mute, speaker, hang up
- 🔐 **Session Persistence** - Stay logged in
- 🎨 **Professional UI** - Ministry branding throughout

## 🚀 Quick Start

### Prerequisites

- Node.js installed
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Run the App

```bash
# 1. Make sure you're in the right directory
cd /Users/soft-touch/Desktop/project/callcenter/mobile-app/ministry-call-center

# 2. Start the development server
npm start

# 3. Scan the QR code with:
#    - iOS: Camera app
#    - Android: Expo Go app
```

## 📱 Testing on Your Phone

### Option 1: Expo Go (Easiest)

1. Install **Expo Go** app from App Store/Play Store
2. Run `npm start` in terminal
3. Scan QR code with:
   - **iOS**: Open Camera app → scan QR → tap notification
   - **Android**: Open Expo Go app → scan QR

### Option 2: iOS Simulator (Mac only)

```bash
npm run ios
```

### Option 3: Android Emulator

```bash
npm run android
```

## 🧪 How to Test

### Test Flow:

1. **Open App** - App loads with Ministry branding
2. **Status Check** - Shows "✅ Online" when ready
3. **Tap "Call Now"** - Initiates call to ministry
4. **IVR Menu** - Select service:
   - 📚 1: Exam Inquiries
   - 👨‍🏫 2: Teacher Complaints
   - 🏫 3: Facilities
   - 📞 4: Other Services
5. **Queue** - Shows "In Queue - Waiting for Agent"
6. **Agent Answers** - Call connected notification
7. **Call Controls** - Use mute, speaker, hang up buttons

### Current Features (Simulated):

✅ Call initiation  
✅ IVR selection  
✅ Queue status  
✅ Agent connection (simulated)  
✅ Call controls UI  

### To Connect Real WebRTC:

When ready to integrate real calling:

1. Configure `src/config/api.ts` with your Asterisk server IP
2. Install WebRTC dependencies:
   ```bash
   npm install react-native-webrtc
   npm install react-native-incall-manager
   ```
3. Update `src/services/webrtc.service.ts` (create it)
4. Replace simulated calls with real WebRTC

## 📂 Project Structure

```
ministry-call-center/
├── App.tsx                      # Main app entry
├── src/
│   ├── config/
│   │   └── api.ts              # API & WebRTC config
│   ├── screens/
│   │   └── CallScreen.tsx      # Main calling screen
│   └── services/               # (Future: WebRTC service)
├── package.json
└── README.md
```

## ⚙️ Configuration

Edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  // Backend URL (ngrok or production)
  baseURL: 'https://rhett-yearlong-gregory.ngrok-free.dev',
  
  // WebRTC settings
  webrtc: {
    wsServer: 'wss://YOUR-ASTERISK-IP:8089/ws',
    sipUri: 'sip:webrtc_user@your-domain.com',
    password: 'mobile_user_password',
  },
  
  // Hotline extension
  hotlineExtension: '1000',
};
```

## 🔧 Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start --clear

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run web version
npm run web
```

## 📱 Testing Scenarios

### Scenario 1: Basic Call

1. Open app
2. Wait for "Online" status
3. Tap "Call Now"
4. Select IVR option (e.g., "1. Exam Inquiries")
5. Wait for simulated agent connection
6. Tap "Hang Up" to end

### Scenario 2: Multiple Options

Test each IVR option to verify routing:
- Option 1 → Exam queue
- Option 2 → Teacher queue
- Option 3 → Facilities queue
- Option 4 → General queue

### Scenario 3: Call Controls

During a call:
- Tap "Mute" → should show mute confirmation
- Tap "Speaker" → should show speaker toggle
- Tap "Hang Up" → should end call cleanly

## 🚀 Building for Production

### iOS (requires Mac + Apple Developer account)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios
```

### Android

```bash
# Build APK
eas build --platform android --profile preview

# Or build for Play Store
eas build --platform android
```

## 🌐 Backend Integration

Current backend URL (ngrok):
```
https://rhett-yearlong-gregory.ngrok-free.dev
```

Update this in `src/config/api.ts` when you have a production URL.

## 🆘 Troubleshooting

### "Unable to start server"
```bash
# Clear cache and restart
npm start --clear
```

### "QR code not working"
- Make sure phone and computer are on same WiFi
- Try typing the IP address manually in Expo Go
- Check firewall settings

### "App crashes on start"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm start --clear
```

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Project Documentation](../../MOBILE_TO_AGENT_TESTING.md)

## 🎉 Ready to Test!

Your mobile app is ready! Run:

```bash
npm start
```

Then scan the QR code with Expo Go app on your phone.

**The app will simulate calls for now. To connect real WebRTC, see the configuration section above.**
