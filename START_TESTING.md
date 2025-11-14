# 🚀 START TESTING - Complete Guide

## ✅ Configuration Complete!

Your Asterisk IP has been configured: **192.168.1.17**

---

## 🎯 Quick Testing Steps (5 Minutes)

### Step 1: Start Mobile App (Terminal 1)

```bash
cd /Users/soft-touch/Desktop/project/callcenter/mobile-app/ministry-call-center
npm start

# Expo will show QR code
# Scan with Expo Go app on your phone
```

### Step 2: Register Web Agent (Browser)

**Open this URL in your browser:**
```
http://localhost:3000/agent-register.html
```

**Or if frontend is running:**
```
https://rhett-yearlong-gregory.ngrok-free.dev/agent-register.html
```

**Quick Steps:**
1. Click "🔵 Agent 1" button (or select from dropdown)
2. Asterisk URL should already be filled: `ws://192.168.1.17:8088/ws`
3. Click "🚀 Register Agent"
4. Wait for "✅ Registered as Agent 001" message
5. **Agent is now listening for calls!**

### Step 3: Make Test Call (Mobile Phone)

1. **Open app** on phone (scanned QR code)
2. **Login** → Tap "Citizen Demo"
3. **Landing Page** → Tap "📞 Call Ministry"
4. **Call Screen**:
   - Wait for status to show "Ready" (SIP registered)
   - Tap "📞 Call Now"
   - Call initiates!
5. **Web Agent Browser**:
   - 🔔 **Incoming call notification appears!**
   - Shows caller info
   - Click "✅ Answer"
6. **Connected!**:
   - Mobile user can speak
   - Agent can hear
   - Agent speaks
   - Mobile user hears
   - **Real conversation!** ✅

---

## 📱 Detailed Testing Steps

### Mobile App Flow

```
1. Open Expo Go app on phone
2. Scan QR code from terminal
3. App loads → Login screen
4. Tap "Citizen Demo" → Auto-fills phone
5. Tap "Login" → Landing page
6. See welcome message and quick actions
7. Tap "📞 Call Ministry"
8. Call screen appears
9. Status shows: "Initializing..." → "Registering..." → "Ready"
10. Tap "📞 Call Now"
11. Status changes to "Connecting..."
12. Hear ringing or IVR
13. Status: "Connected - Listen for IVR"
14. Tap IVR option (e.g., "1. Exam Inquiries")
15. DTMF tone sent
16. Status: "Routing to Exam Inquiries..."
17. Status: "In Queue - Waiting for Agent"
18. Wait...
19. Agent answers!
20. Status: "Connected to Agent" (may not update immediately)
21. Speak and listen
22. Use mute button if needed
23. Tap "Hang Up" when done
```

### Web Agent Flow

```
1. Open browser
2. Go to http://localhost:3000/agent-register.html
3. See agent registration page
4. Click "🔵 Agent 1" quick button
5. URL auto-filled: ws://192.168.1.17:8088/ws
6. Click "🚀 Register Agent"
7. Logs show:
   - "🔌 Connecting to ws://192.168.1.17:8088/ws..."
   - "✅ Agent 001 registered successfully!"
8. Status: "✅ Registered as Agent 001 - Ready to receive calls!"
9. Wait for incoming call...
10. 📞 Call notification pops up (top-right)
11. Shows: "From: Mobile User" and phone number
12. Ringtone plays
13. Click "✅ Answer"
14. Call connects
15. Hear mobile user speaking
16. Speak back
17. Logs show: "✅ Call connected!" and "🎵 Audio stream connected"
18. Continue conversation
19. Either side hangs up
```

---

## 🧪 Test Scenarios

### Scenario 1: Single Agent Call

**Setup:**
- 1 web agent registered
- 1 mobile user

**Test:**
1. Mobile calls
2. Agent rings
3. Agent answers
4. Conversation
5. Either hangs up

**Expected**: ✅ Full call with audio

### Scenario 2: Multiple Agents

**Setup:**
- Open 4 browser tabs
- Register Agent 1, 2, 3, 4 in each tab

**Test:**
1. Mobile calls
2. **All 4 agents ring simultaneously!**
3. First agent to click "Answer" gets the call
4. Other 3 stop ringing

**Expected**: ✅ Ring-all strategy works

### Scenario 3: IVR Selection

**Setup:**
- 1 agent registered
- Mobile calls

**Test:**
1. Mobile calls
2. Taps "1. Exam Inquiries"
3. DTMF sent
4. Routes to exam queue
5. Agent receives call

**Expected**: ✅ DTMF routing works

### Scenario 4: Mute Function

**Setup:**
- Call in progress

**Test:**
1. Mobile taps "Mute"
2. Mobile icon changes to 🔇
3. Agent can't hear mobile
4. Mobile taps "Unmute"
5. Icon changes to 🎤
6. Agent can hear again

**Expected**: ✅ Mute works

---

## 📊 Success Checklist

### Mobile App:
- [ ] App loads on phone
- [ ] Login successful
- [ ] Landing page displays
- [ ] Navigate to Call screen
- [ ] Status shows "Ready"
- [ ] Can tap "Call Now"
- [ ] Status changes to "Connecting"
- [ ] Hear ringing
- [ ] Can tap IVR buttons
- [ ] DTMF sounds (beep)
- [ ] Status shows "In Queue"
- [ ] Mute button works
- [ ] Hang up works

### Web Agent:
- [ ] Registration page opens
- [ ] Can select agent
- [ ] URL is filled correctly
- [ ] Registration succeeds
- [ ] Status shows "Registered"
- [ ] Incoming call notification appears
- [ ] Ringtone plays
- [ ] Can answer call
- [ ] Audio connects
- [ ] Can hear mobile user clearly
- [ ] Mobile user can hear agent
- [ ] Hang up works

### Overall:
- [ ] Call connects in <5 seconds
- [ ] Audio is clear both ways
- [ ] No echo or feedback
- [ ] Mute function works
- [ ] Hang up is clean
- [ ] Can make multiple calls
- [ ] Multiple agents can register

---

## 🆘 Troubleshooting

### Issue: Mobile Shows "Registration Failed"

**Check:**
```bash
# Verify Asterisk is accessible
curl http://192.168.1.17:8088/ws
# Should show "Upgrade Required" or WebSocket error (normal)

# Check if Asterisk is running
docker ps | grep asterisk
# OR
ps aux | grep asterisk
```

**Solutions:**
1. Ensure Asterisk is running
2. Check firewall allows port 8088
3. Verify both devices on same WiFi network
4. Try restarting Asterisk

### Issue: Agent Registration Fails

**Browser Console Errors:**
- Open F12 → Console tab
- Look for WebSocket errors

**Solutions:**
1. Check Asterisk WebSocket is enabled
2. Verify URL: `ws://192.168.1.17:8088/ws`
3. Check CORS is enabled in Asterisk
4. Try different browser

### Issue: Call Connects But No Audio

**Solutions:**
1. Check microphone permissions on mobile
2. Verify speakers/headphones connected
3. Check network allows UDP (WebRTC)
4. Try with headphones on both sides
5. Check Asterisk codecs (should have opus, ulaw, alaw)

### Issue: Agent Doesn't Ring

**Check:**
1. Agent registration status
2. Queue membership:
```bash
# Asterisk CLI
docker exec -it asterisk asterisk -r
queue show exam_queue
# Should show agent001 as member
```

**Solutions:**
1. Verify routing rules
2. Check IVR dialplan
3. Ensure queue is configured
4. Check Asterisk logs

### Issue: DTMF Not Working

**Solutions:**
1. Check DTMF mode in Asterisk (should be RFC2833)
2. Verify dialplan handles DTMF
3. Look for DTMF in Asterisk logs
4. Test with voice ("press one" vs button)

---

## 🎬 Video Test Demo

### Record Your Test:

1. **Screen record mobile**
2. **Screen record browser**
3. **Test the call**
4. **Show:**
   - Mobile initiating call
   - Agent notification appearing
   - Agent answering
   - Call in progress
   - Audio working (speak on camera)
   - Hang up

---

## 🔍 Monitoring & Logs

### Mobile App Logs

**View in Expo:**
- Shake device → "Debug Remote JS"
- Browser console shows logs

**Look for:**
```
🔌 Connecting to WebRTC server: ws://192.168.1.17:8088/ws
✅ SIP registered successfully
📞 Calling extension: 1000
✅ Call connected
📞 Sent DTMF: 1
```

### Web Agent Logs

**In Browser:**
- Open browser console (F12)
- See JsSIP logs

**Look for:**
```
✅ Agent 001 registered successfully!
📞 Incoming call from: Mobile User (+232...)
✅ Call connected!
🎵 Audio stream connected
```

### Asterisk Logs

**Terminal:**
```bash
# View Asterisk logs
docker logs -f asterisk

# Or enter Asterisk CLI
docker exec -it asterisk asterisk -r

# Show active calls
core show channels

# Show queue
queue show exam_queue
```

---

## 🎉 Expected Results

### When Everything Works:

```
MOBILE                          AGENT
  ↓                               ↓
Login ✅                    Open page ✅
  ↓                               ↓
Go to Call ✅               Register ✅
  ↓                               ↓
Status: "Ready" ✅          Status: "Registered" ✅
  ↓                               ↓
Tap "Call Now" ✅           (Waiting...)
  ↓                               ↓
"Connecting..." ✅          🔔 RING! ✅
  ↓                               ↓
Hear ringing ✅             Notification appears ✅
  ↓                               ↓
Tap IVR button ✅           (Ringing...)
  ↓                               ↓
DTMF sent ✅                Ringtone plays ✅
  ↓                               ↓
"In Queue" ✅               Click "Answer" ✅
  ↓                               ↓
Agent answers! ✅           "Connected!" ✅
  ↓                               ↓
Speak: "Hello" ✅           Hears: "Hello" ✅
  ↓                               ↓
Hears: "Hi there" ✅        Speaks: "Hi there" ✅
  ↓                               ↓
CONVERSATION WORKS! 🎉      CONVERSATION WORKS! 🎉
```

---

## 📞 Quick Reference

### URLs:
- **Mobile Config**: `mobile-app/ministry-call-center/src/config/api.ts`
- **Agent Registration**: `http://localhost:3000/agent-register.html`
- **Frontend**: `https://rhett-yearlong-gregory.ngrok-free.dev`

### IPs:
- **Local Network IP**: 192.168.1.17
- **WebSocket URL**: ws://192.168.1.17:8088/ws

### Credentials:
**Agent 1:**
- Username: agent001
- Password: secure_password_001
- Extension: 1001

**Agent 2-4:** Similar pattern (agent002, agent003, agent004)

**Mobile User:**
- Username: webrtc_user
- Password: mobile_user_password

### Ports:
- Backend: 3001
- Frontend: 3000
- Asterisk HTTP: 8088
- Asterisk WebSocket: 8088/ws

---

## 🚀 Start Testing NOW!

### Terminal 1:
```bash
cd mobile-app/ministry-call-center
npm start
```

### Browser:
```
http://localhost:3000/agent-register.html
```

### Mobile Phone:
```
Scan QR code → Test!
```

---

## 🎊 Success Criteria

✅ Mobile registers (shows "Ready")  
✅ Agent registers (shows "Registered")  
✅ Mobile can call  
✅ Agent sees incoming call  
✅ Agent can answer  
✅ Audio works both ways  
✅ Mute function works  
✅ Hang up is clean  

**If all checked → System works perfectly!** 🎉

---

**Ready? Start testing now!** 🚀📱🔥
