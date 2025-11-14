# 📱 Mobile App Troubleshooting Guide

## 🔍 Common Expo Mobile App Errors & Fixes

### Issue Detected:
You got errors when trying to open the Expo mobile app. Let's fix them!

---

## 🚨 Common Errors & Solutions

### 1. Port 8081 Already In Use

**Error:**
```
Port 8081 is running this app in another window
Use port 8082 instead?
```

**Cause:** Expo dev server is already running from previous session

**Solution A: Use Existing Server**
```bash
# The app is already running!
# Just scan the QR code in your terminal
# Or open Expo Go app and it should connect
```

**Solution B: Kill and Restart**
```bash
# Kill the existing process
lsof -ti:8081 | xargs kill -9

# Restart fresh
cd mobile-app/ministry-call-center
npx expo start
```

---

### 2. Module Resolution Errors

**Error:**
```
Unable to resolve module X from Y
```

**Solution:**
```bash
cd mobile-app/ministry-call-center

# Clear cache
npx expo start -c

# Or full reset
rm -rf node_modules
npm install
npx expo start
```

---

### 3. react-native-webrtc Errors

**Error:**
```
Invariant Violation: requireNativeComponent: "RTCView" was not found
```

**Cause:** WebRTC native modules need rebuild

**Solution:**
```bash
cd mobile-app/ministry-call-center

# Clear Expo cache
npx expo start -c

# If on real device, rebuild
# Expo Go doesn't fully support WebRTC
# Need custom dev client
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

---

### 4. Network Request Failed

**Error:**
```
Network request failed
TypeError: Network request failed
```

**Cause:** Backend URL not accessible from mobile device

**Solution:**

**Check API Config:**
```bash
# Edit mobile config
code mobile-app/ministry-call-center/src/config/api.ts
```

Ensure it has:
```typescript
export const API_CONFIG = {
  // For testing on same network
  BASE_URL: 'http://192.168.1.17:3001',
  
  // For ngrok (remote testing)
  // BASE_URL: 'https://rhett-yearlong-gregory.ngrok-free.dev',
  
  WS_URL: 'ws://192.168.1.17:8088/ws',
  ASTERISK_SERVER: '192.168.1.17',
};
```

**Test Backend Accessible:**
```bash
# From your Mac
curl http://192.168.1.17:3001/health

# If fails, check firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node
```

---

### 5. JsSIP Errors

**Error:**
```
JsSIP is not defined
Cannot read property 'UA' of undefined
```

**Cause:** JsSIP library not loaded properly

**Solution:**
The mobile app uses a different approach - we created `MobileWebRTCService` that doesn't need JsSIP from CDN.

**Check File Exists:**
```bash
ls mobile-app/ministry-call-center/src/services/webrtc-mobile.service.ts
```

Should be there with `MobileWebRTCService` class.

---

## 🎯 Quick Fix Checklist

Try these in order:

### ✅ Step 1: Check What's Running
```bash
# Check if backend is running
lsof -i:3001

# Check if Expo is running
lsof -i:8081

# Check if frontend is running
lsof -i:3000
```

### ✅ Step 2: Restart Everything
```bash
# Kill all processes
lsof -ti:3001,3000,8081 | xargs kill -9

# Start backend
cd backend
npm run start:dev

# Start frontend (new terminal)
cd frontend
npm run dev

# Start mobile (new terminal)
cd mobile-app/ministry-call-center
npx expo start -c
```

### ✅ Step 3: Clear All Caches
```bash
cd mobile-app/ministry-call-center

# Clear Expo cache
npx expo start -c

# Clear metro bundler
rm -rf .expo
rm -rf node_modules/.cache

# Clear watchman
watchman watch-del-all

# Restart
npx expo start
```

### ✅ Step 4: Reinstall Dependencies
```bash
cd mobile-app/ministry-call-center

# Remove and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Restart
npx expo start
```

---

## 📱 Correct Startup Sequence

### Terminal 1: Backend
```bash
cd /Users/soft-touch/Desktop/project/callcenter/backend
npm run start:dev

# Should show:
# ✅ Nest application successfully started
# ✅ Listening on port 3001
```

### Terminal 2: Frontend
```bash
cd /Users/soft-touch/Desktop/project/callcenter/frontend
npm run dev

# Should show:
# ✅ Ready on http://localhost:3000
```

### Terminal 3: Mobile App
```bash
cd /Users/soft-touch/Desktop/project/callcenter/mobile-app/ministry-call-center
npx expo start

# Should show:
# ✅ Metro waiting on exp://192.168.1.17:8081
# ✅ QR code displayed
```

### Phone: Expo Go App
```
1. Open Expo Go app
2. Scan QR code from Terminal 3
3. App should load
4. If errors, check Terminal 3 output
```

---

## 🔍 Check Mobile App Health

### Test 1: Can App Load?
```
1. Open Expo Go
2. Scan QR code
3. App should show splash screen
4. Then show login/call screen
```

**If Fails:**
- Check Terminal 3 for errors
- Try `npx expo start -c` (clear cache)

### Test 2: Can Connect to Backend?
```
1. In app, try any API call
2. Check Terminal 1 (backend logs)
3. Should see request logged
```

**If Fails:**
- Check API_CONFIG has correct IP
- Test: `curl http://192.168.1.17:3001/health`
- Check firewall settings

### Test 3: WebRTC Registration?
```
1. In app, go to Call screen
2. Should auto-register SIP
3. Check console for "Registered" message
```

**If Fails:**
- Check Asterisk is running: `sudo asterisk -r`
- Check WS_URL in config
- Test: `curl http://192.168.1.17:8088/ws`

---

## 🛠️ Advanced Troubleshooting

### View Detailed Logs

**Expo Logs:**
```bash
# Show all logs including native
npx expo start --dev-client
```

**React Native Logs:**
```bash
# Android
adb logcat | grep ReactNativeJS

# iOS (if connected)
react-native log-ios
```

**Network Inspector:**
```
1. Shake device in Expo Go
2. Select "Debug Remote JS"
3. Opens Chrome DevTools
4. Check Network tab
```

### Test Without WebRTC

If WebRTC is causing issues, temporarily disable:

```typescript
// In mobile-app/.../CallScreen.tsx
// Comment out WebRTC registration

useEffect(() => {
  // TEMPORARILY DISABLED FOR TESTING
  // webrtcService.register(SIP_CONFIG.uri, SIP_CONFIG.password);
  console.log('WebRTC disabled for testing');
}, []);
```

Then test if app loads and UI works.

---

## 📋 Environment Checklist

### Required for Mobile App:

- ✅ Node.js installed
- ✅ Expo Go app on phone
- ✅ Phone and Mac on same WiFi
- ✅ Backend running on port 3001
- ✅ Asterisk running (for calls)
- ✅ Firewall allows connections
- ✅ Correct IP in API config

### Network Requirements:

```bash
# Your Mac's IP (should match config)
ifconfig | grep "inet "

# Should see something like:
# inet 192.168.1.17

# This IP should be in:
# mobile-app/.../src/config/api.ts
```

---

## 🚀 Fresh Start Commands

If everything is broken, start fresh:

```bash
# 1. Kill all processes
lsof -ti:3001,3000,8081 | xargs kill -9

# 2. Start backend
cd /Users/soft-touch/Desktop/project/callcenter/backend
npm run start:dev &

# 3. Start frontend  
cd /Users/soft-touch/Desktop/project/callcenter/frontend
npm run dev &

# 4. Clear mobile cache and start
cd /Users/soft-touch/Desktop/project/callcenter/mobile-app/ministry-call-center
rm -rf .expo node_modules/.cache
npx expo start -c

# 5. Scan QR code in Expo Go app
```

---

## 📞 Specific Error Solutions

### "Cannot connect to Metro"

**Solution:**
```bash
# Check Metro bundler is running
lsof -i:8081

# If not, start Expo
npx expo start

# If port blocked, use different port
npx expo start --port 8082
```

### "Unable to resolve module @react-native-webrtc"

**Solution:**
```bash
# Reinstall package
npm install react-native-webrtc

# Clear cache
npx expo start -c
```

### "Invariant Violation"

**Solution:**
```bash
# Usually means native module issue
# For Expo Go, some native modules won't work
# Need custom dev client

npx expo prebuild
# Then build for your platform
```

### "Network request failed" (calling backend)

**Solution:**
```bash
# Test backend from Mac
curl http://192.168.1.17:3001/health

# If works, check phone can reach it
# On phone, open browser:
# http://192.168.1.17:3001/health

# If browser fails, check:
# 1. Phone on same WiFi
# 2. Mac firewall settings
# 3. Router allows device communication
```

---

## 🎯 Most Common Solution

**90% of mobile app errors are fixed by:**

```bash
cd mobile-app/ministry-call-center

# Clear everything
rm -rf .expo
rm -rf node_modules/.cache

# Restart with clear cache
npx expo start -c
```

---

## 📱 Testing Checklist

After fixing, verify:

- [ ] Backend responds: `curl http://192.168.1.17:3001/health`
- [ ] Frontend loads: `http://localhost:3000`
- [ ] Expo shows QR code in terminal
- [ ] Expo Go app can scan code
- [ ] App loads on phone
- [ ] No red error screens
- [ ] Can navigate in app
- [ ] Network requests work (check Terminal 1 logs)

---

## 🆘 Still Having Issues?

### Check These Files:

1. **API Config:**
```bash
cat mobile-app/ministry-call-center/src/config/api.ts
# Should have correct IP addresses
```

2. **Package.json:**
```bash
cat mobile-app/ministry-call-center/package.json
# Check all dependencies installed
```

3. **App Entry:**
```bash
cat mobile-app/ministry-call-center/App.tsx
# Should import and render properly
```

### Get More Info:

```bash
# Verbose Expo logging
npx expo start --dev-client --clear

# Check system info
npx expo-doctor

# Check dependencies
npm list --depth=0
```

---

## 📊 Summary

### Most Common Fixes:

1. **Clear Cache**: `npx expo start -c`
2. **Restart Services**: Kill and restart backend, frontend, Expo
3. **Check Network**: Phone and Mac on same WiFi
4. **Verify IPs**: Config matches actual IP addresses
5. **Reinstall**: `rm -rf node_modules && npm install`

### Quick Commands:

```bash
# One-liner to restart everything clean
cd mobile-app/ministry-call-center && rm -rf .expo node_modules/.cache && npx expo start -c
```

---

**If you see specific error messages, let me know and I'll help debug!** 🔧
