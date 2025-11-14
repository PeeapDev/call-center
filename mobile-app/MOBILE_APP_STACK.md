# Mobile App Stack Recommendation

## 📱 Recommended Stack: **React Native with Expo**

### Why React Native + Expo?

✅ **Single Codebase** - Build for both iOS & Android  
✅ **JavaScript/TypeScript** - Same as your web app  
✅ **Code Sharing** - Share API calls, types, business logic  
✅ **Fast Development** - Hot reload, easy testing  
✅ **WebRTC Support** - Native modules available  
✅ **Large Community** - Extensive libraries and support  

---

## 🛠️ Technology Stack

### **Core Framework**
```
React Native 0.73+ with Expo SDK 50+
```

### **Language**
```
TypeScript (same as web frontend)
```

### **State Management**
```
- Zustand or Redux Toolkit
- React Query for API calls
```

### **Navigation**
```
React Navigation 6.x
```

### **UI Components**
```
- React Native Paper (Material Design)
- NativeBase
- Custom components matching web design
```

### **WebRTC/Calling**
```
- react-native-webrtc (for WebRTC calls)
- react-native-incall-manager (call UI)
- react-native-voip-push-notification (iOS push)
```

### **Authentication**
```
- Async Storage for tokens
- Biometric authentication (Face ID/Touch ID)
```

### **QR Code**
```
- react-native-qrcode-scanner (for attendance)
- react-native-qrcode-svg (generate QR)
```

### **Notifications**
```
- Expo Notifications
- Firebase Cloud Messaging
```

---

## 📦 Project Structure

```
mobile-app/
├── src/
│   ├── api/              # API calls (shared types with web)
│   ├── components/       # Reusable components
│   │   ├── CallInterface.tsx
│   │   ├── QRScanner.tsx
│   │   └── CaseCard.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── calls/
│   │   │   ├── ActiveCallScreen.tsx
│   │   │   ├── CallHistoryScreen.tsx
│   │   │   └── DialerScreen.tsx
│   │   ├── cases/
│   │   │   ├── CaseListScreen.tsx
│   │   │   └── CaseDetailScreen.tsx
│   │   ├── staff/
│   │   │   ├── AttendanceScreen.tsx
│   │   │   └── QRScannerScreen.tsx
│   │   └── dashboard/
│   │       └── DashboardScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── services/
│   │   ├── webrtc.service.ts
│   │   ├── sip.service.ts
│   │   └── notification.service.ts
│   ├── store/            # State management
│   ├── types/            # TypeScript types (shared with web)
│   └── utils/
├── android/              # Android native code
├── ios/                  # iOS native code
├── app.json             # Expo config
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### **1. Initialize Expo Project**

```bash
cd /Users/soft-touch/Desktop/project/callcenter/mobile-app

# Create Expo project
npx create-expo-app@latest ministry-call-center --template blank-typescript

cd ministry-call-center

# Install dependencies
npx expo install react-native-webrtc
npx expo install expo-camera
npx expo install @react-navigation/native
npx expo install @react-navigation/stack
npx expo install react-native-paper
npx expo install expo-secure-store
npx expo install expo-notifications
```

### **2. Install WebRTC Dependencies**

```bash
npm install react-native-webrtc
npm install react-native-incall-manager
npm install @react-native-community/netinfo
npm install react-native-get-random-values
```

### **3. Install UI & Utility Libraries**

```bash
npm install react-native-paper
npm install react-native-vector-icons
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npm install @react-navigation/stack
npm install react-native-gesture-handler
npm install react-native-reanimated
npm install react-native-screens
npm install react-native-safe-area-context
```

### **4. Install Call & QR Features**

```bash
npm install react-native-qrcode-scanner
npm install react-native-qrcode-svg
npm install react-native-permissions
npm install @react-native-voice/voice
```

---

## 📱 Key Features for Mobile App

### **1. Agent Features**
- ✅ Receive incoming calls (WebRTC)
- ✅ Make outbound calls
- ✅ View call queue
- ✅ Access call history
- ✅ Create cases during calls
- ✅ View assigned cases
- ✅ Add notes to cases
- ✅ QR attendance check-in/out

### **2. Supervisor Features**
- ✅ Monitor active calls
- ✅ View agent status
- ✅ Assign cases
- ✅ View analytics
- ✅ Listen to call recordings
- ✅ Staff attendance management

### **3. Admin Features**
- ✅ Full dashboard access
- ✅ System configuration
- ✅ User management
- ✅ Generate reports

### **4. Citizen Features** (Public App)
- ✅ Submit complaints
- ✅ Track case status
- ✅ Call Ministry hotline
- ✅ View FAQs
- ✅ Anonymous chatbot

---

## 🔌 Integration with Backend

### **API Configuration**

```typescript
// src/api/config.ts
export const API_CONFIG = {
  baseURL: 'https://your-domain.com/api', // Your backend
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API endpoints
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },
  staff: {
    checkIn: '/staff/attendance/check-in',
    checkOut: '/staff/attendance/check-out',
  },
  cases: {
    list: '/cases',
    create: '/cases',
    update: (id: string) => `/cases/${id}`,
    linkCall: (id: string) => `/cases/${id}/link-call`,
  },
  calls: {
    active: '/calls/active',
    history: '/calls/history',
  },
};
```

### **WebRTC Configuration**

```typescript
// src/services/webrtc.service.ts
import { RTCPeerConnection, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';

export class WebRTCService {
  private pc: RTCPeerConnection;
  private sipUrl = 'wss://your-asterisk-server.com:8089/ws';

  async initializeCall() {
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' },
      ],
    });

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
    
    return stream;
  }

  async makeCall(extension: string) {
    // SIP/WebRTC call logic
  }
}
```

---

## 📱 Screen Examples

### **Login Screen**
```typescript
// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const response = await fetch('http://your-backend/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    // Store token, navigate to dashboard
  };

  return (
    <View style={styles.container}>
      <Title>Ministry Call Center</Title>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
      />
      <Button mode="contained" onPress={handleLogin}>
        Login
      </Button>
    </View>
  );
};
```

### **QR Scanner for Attendance**
```typescript
// src/screens/staff/QRScannerScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

export const QRScannerScreen = () => {
  const onSuccess = async (e) => {
    const qrCode = e.data; // STAFF-{uuid}
    
    // Check in via API
    const response = await fetch('http://your-backend/staff/attendance/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCode, location: 'Mobile App' }),
    });

    const result = await response.json();
    alert(`Checked in successfully at ${result.checkInTime}`);
  };

  return (
    <QRCodeScanner
      onRead={onSuccess}
      topContent={<Text>Scan your QR code to check in</Text>}
    />
  );
};
```

### **Active Call Screen**
```typescript
// src/screens/calls/ActiveCallScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

export const ActiveCallScreen = ({ route }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.callerName}>John Doe</Text>
      <Text style={styles.callerNumber}>+232 77 123 456</Text>
      <Text style={styles.duration}>{formatDuration(duration)}</Text>

      <View style={styles.controls}>
        <IconButton
          icon={isMuted ? 'microphone-off' : 'microphone'}
          onPress={() => setIsMuted(!isMuted)}
        />
        <IconButton
          icon={isOnHold ? 'play' : 'pause'}
          onPress={() => setIsOnHold(!isOnHold)}
        />
        <IconButton
          icon="phone-hangup"
          onPress={() => {/* End call */}}
          style={{ backgroundColor: 'red' }}
        />
      </View>
    </View>
  );
};
```

---

## 🔐 Security Considerations

### **1. Token Storage**
```typescript
import * as SecureStore from 'expo-secure-store';

// Save token securely
await SecureStore.setItemAsync('authToken', token);

// Retrieve token
const token = await SecureStore.getItemAsync('authToken');
```

### **2. Certificate Pinning**
```typescript
// For production, pin SSL certificates
import { create } from 'axios';

const axiosInstance = create({
  baseURL: 'https://your-api.com',
  // Add certificate pinning
});
```

### **3. Biometric Authentication**
```typescript
import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (hasHardware) {
    const result = await LocalAuthentication.authenticateAsync();
    if (result.success) {
      // Proceed to app
    }
  }
};
```

---

## 🧪 Testing

### **Development**
```bash
# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on physical device (scan QR code)
npx expo start
```

### **Build for Production**
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build --platform all
```

---

## 📦 Alternative Stack Options

### **Option 2: Flutter**
**Pros:**
- Fast performance (native compiled)
- Beautiful UI (Material/Cupertino)
- Single codebase
- Growing community

**Cons:**
- Different language (Dart)
- Can't share code with web easily
- Smaller package ecosystem

### **Option 3: Native (Swift + Kotlin)**
**Pros:**
- Best performance
- Full platform access
- Best user experience

**Cons:**
- Two separate codebases
- Longer development time
- Higher cost

---

## 🎯 Recommendation

**Use React Native with Expo** because:

1. ✅ Same TypeScript/JavaScript as your web app
2. ✅ Can share API types and business logic
3. ✅ Faster development (one codebase, two platforms)
4. ✅ Great WebRTC support
5. ✅ Easy QR scanner integration
6. ✅ Push notifications built-in
7. ✅ Your team already knows React
8. ✅ Hot reload for fast iteration

---

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Native WebRTC](https://github.com/react-native-webrtc/react-native-webrtc)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://reactnativepaper.com/)

---

## 🚀 Next Steps

1. Initialize Expo project (commands above)
2. Set up navigation structure
3. Create login screen
4. Integrate with backend API
5. Implement WebRTC calling
6. Add QR scanner for attendance
7. Build case management UI
8. Test on real devices
9. Deploy to TestFlight (iOS) and Google Play (Android)

---

**Ready to start? Run the initialization commands in the `mobile-app` folder!** 📱
