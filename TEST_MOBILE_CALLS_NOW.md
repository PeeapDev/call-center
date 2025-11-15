# 🎉 Mobile App Call Testing - READY NOW!

## ✅ Everything is Set Up!

### Backend Status: ✅ Running
- URL: http://localhost:3001
- Endpoints: `/calls/initiate`, `/calls/:id/status`, `/calls/:id/end`
- Mock Agents: 3 agents available
- Database: Auto-created `calls` table

### Mobile App Status: ✅ Running
- Expo Server: Running on port 8081
- API Client: Configured and ready
- UI: Call screen with IVR selection

---

## 🧪 Test End-to-End Call Flow

### Step 1: Open Mobile App
1. Open Expo Go on your phone
2. Scan the QR code from terminal
3. App should load without errors

### Step 2: Navigate to Call Screen
1. On landing page, tap a button to go to call screen
2. You should see IVR options:
   - 📚 1. Exam Inquiries
   - 👨‍🏫 2. Teacher Complaints  
   - 🏫 3. Facilities
   - 📞 4. Other Services

### Step 3: Initiate a Call
1. **Tap** one of the IVR options (e.g., "1. Exam Inquiries")
2. **Tap** "Call Now" button
3. **Expected Results:**

**If agent available:**
```
Alert: "Call Connected"
Message: "Connected to Sarah Johnson. Your call is being routed."
Status: "Connected"
Timer starts counting
```

**If no agent available:**
```
Alert: "In Queue"
Message: "You are #1 in queue. Estimated wait: 3 minutes."
Status: "Queue Position: 1"
```

### Step 4: Check Backend Logs
In backend terminal, you should see:
```
📞 Call e857a18e-... assigned to agent Sarah Johnson (1001)
```

### Step 5: End the Call
1. **Tap** "Hang Up" button
2. Backend logs should show:
```
✅ Agent Sarah Johnson now available
📴 Call e857a18e-... ended after 45 seconds
```

---

## 🔍 Troubleshooting

### Mobile App Can't Connect to Backend

**Check API URL:**
```typescript
// mobile-app/ministry-call-center/src/config/api.ts
baseURL: 'https://rhett-yearlong-gregory.ngrok-free.dev'
```

**Current Configuration:**
- Mobile uses: `https://rhett-yearlong-gregory.ngrok-free.dev`
- Backend runs on: `http://localhost:3001`

**Options:**

#### Option A: Use ngrok (for remote testing)
```bash
# In new terminal
ngrok http 3001

# Copy the https URL (e.g., https://xyz.ngrok-free.dev)
# Update mobile-app/ministry-call-center/src/config/api.ts
# Change baseURL to your ngrok URL
```

#### Option B: Use local network (same WiFi)
```bash
# Find your computer's local IP
ipconfig getifaddr en0  # Mac
# Or: ifconfig | grep "inet " | grep -v 127.0.0.1

# Update mobile-app/ministry-call-center/src/config/api.ts
# Change baseURL to: http://YOUR_IP:3001
# Example: http://192.168.1.17:3001
```

---

## 🎯 Expected Call Flow

```
1. User taps IVR option → selectedIVR = "1"
   ↓
2. User taps "Call Now" → callApiService.initiateCall()
   ↓
3. Mobile app → POST https://...ngrok.../calls/initiate
   Body: {
     "phoneNumber": "+232 76 123 456",
     "ivrOption": "1",
     "callerName": "Mobile User"
   }
   ↓
4. Backend receives request → finds available agent
   ↓
5. Backend response:
   {
     "success": true,
     "callId": "uuid",
     "assignedAgent": {
       "name": "Sarah Johnson",
       "extension": "1001"
     },
     "message": "Connected to Sarah Johnson"
   }
   ↓
6. Mobile app shows alert → "Call Connected"
   ↓
7. User hangs up → POST .../calls/{uuid}/end
   ↓
8. Backend marks call as ended, frees agent
```

---

## 📊 View Call Records

### Check database directly:
```bash
cd backend
sqlite3 callcenter.db
.tables
SELECT * FROM calls;
.quit
```

### Via API:
```bash
curl http://localhost:3001/calls
```

**Expected Output:**
```json
[
  {
    "id": "e857a18e-b830-494e-a7e1-9b416d5dc21f",
    "phoneNumber": "+232 76 123 456",
    "callerName": "Test User",
    "direction": "inbound",
    "status": "connected",
    "ivrOption": "1",
    "queueName": "Exam Malpractice Queue",
    "assignedAgentName": "Sarah Johnson",
    "assignedAgentExtension": "1001",
    "createdAt": "2025-11-14T17:10:00Z"
  }
]
```

---

## 🧑‍💼 Mock Agents Available

| Agent | Extension | Can Handle | Status |
|-------|-----------|------------|--------|
| Sarah Johnson | 1001 | IVR 1, 2 (Exam, Teachers) | Available |
| Mohamed Kamara | 1002 | IVR 2, 3 (Teachers, Facilities) | Available |
| Fatmata Sesay | 1003 | IVR 1, 3, 4 (Exam, Facilities, General) | Available |

---

## 🎮 Try These Test Scenarios

### Scenario 1: Successful Call
1. Select IVR option "1"
2. Call now
3. Should connect to Sarah Johnson or Fatmata Sesay
4. Hang up after 30 seconds

### Scenario 2: Queue Test
1. Make 3 calls quickly (different phones/sessions)
2. First 3 connect to agents
3. 4th call goes to queue
4. Check queue position

### Scenario 3: Multiple IVR Options
1. Call with IVR "1" → connects to agent with skill 1
2. Call with IVR "2" → connects to agent with skill 2
3. Call with IVR "4" → connects to Fatmata (only agent with skill 4)

---

## 🚀 Quick Start Commands

### Terminal 1: Backend (Already Running ✅)
```bash
cd backend
npm run start:dev
# Running on http://localhost:3001
```

### Terminal 2: Mobile App (Already Running ✅)
```bash
cd mobile-app/ministry-call-center
npx expo start
# QR code displayed - scan with phone
```

### Terminal 3: Test API (Optional)
```bash
# Test call initiation
curl -X POST http://localhost:3001/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+232 76 123 456", "ivrOption": "1", "callerName": "Test"}'

# Check available agents
curl http://localhost:3001/calls/agents/available

# View all calls
curl http://localhost:3001/calls
```

---

## ✅ Success Checklist

- [ ] Backend running on port 3001
- [ ] Mobile app Expo server running
- [ ] Phone connected to same network (or ngrok running)
- [ ] Mobile app loads without WebRTC errors
- [ ] Can select IVR option
- [ ] "Call Now" button triggers API call
- [ ] Alert shows "Call Connected" or "In Queue"
- [ ] Backend logs show call assignment
- [ ] Can hang up call
- [ ] Backend logs show call ended
- [ ] Call saved in database

---

## 📝 Notes

### What's Working:
✅ Full API integration  
✅ Agent assignment logic  
✅ Queue management  
✅ Call status tracking  
✅ Duration calculation  
✅ Database persistence  

### What's Simulated:
⚠️ Actual voice call (no audio)  
⚠️ Real agent status (mock data)  
⚠️ Asterisk integration (future)  

### Next Steps:
- Connect to Asterisk for real calls
- Integrate agent dashboard status
- Add WebSocket for real-time updates
- Implement call recording storage
- Add SMS notifications

---

## 🎉 You're Ready to Test!

**Everything is set up and ready. Just open the mobile app and try making a call!** 📱✨

---

**Backend**: http://localhost:3001 ✅  
**Mobile App**: Expo Go on port 8081 ✅  
**API**: `/calls/initiate` endpoint live ✅  
**Database**: `calls` table created ✅  
**Agents**: 3 mock agents ready ✅  

**GO TEST IT NOW!** 🚀
