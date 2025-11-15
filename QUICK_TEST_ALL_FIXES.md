# 🚀 Quick Test Guide - All Fixes

## 1️⃣ Restart Backend (Fresh Start)

```bash
cd backend

# Kill any running instance
lsof -ti:3001 | xargs kill -9

# Start fresh
npm run start:dev
```

**Wait for**:
```
[Nest] application successfully started
```

---

## 2️⃣ Test Human-Readable Errors

### Test Offline Error:
1. Open mobile app
2. **Turn OFF WiFi** on phone
3. Try to make a call
4. **✅ Expected**: 
   - Alert: "Cannot Make Call"
   - Message: "Network connection issue. Please check your internet and try again."
   - Buttons: [Try Again] [Call 117] [Cancel]

### Test Online:
1. Turn WiFi back ON
2. Try call again
3. **✅ Expected**: Call connects normally

---

## 3️⃣ Test WhatsApp-Style Caching

### Test 1: Data Preload
1. **Close app completely** (swipe away)
2. **Open app again**
3. **Check logs** in terminal:
   ```
   📦 Preloading essential data...
   ✅ IVR options cached
   ✅ FAQs cached
   ✅ Emergency contacts cached
   ✅ Essential data cached for offline use
   ```

### Test 2: Offline Mode
1. Login to app
2. Make 1-2 calls
3. **Close app completely**
4. **Turn OFF WiFi**
5. **Reopen app**
6. **✅ Expected**:
   - App opens instantly (no loading!)
   - Still logged in
   - History screen shows past calls
   - Profile screen loads immediately
   - No errors about network

---

## 4️⃣ Test Queue Position #1 Fix

### Test:
1. Make sure no other calls are active
2. Make a call from mobile
3. **✅ Expected Alert**:
   - Title: "Next in Line"
   - Message: "You are next! An agent will answer shortly. Please stay on the line."
   - (NOT "You are #1 in queue. Estimated wait: 3 minutes")

### Make Second Call:
1. Don't hang up first call
2. Make second call from another device
3. **✅ Expected**:
   - Title: "In Queue"
   - Message: "You are #2 in queue. Estimated wait: 3 minutes."

---

## 5️⃣ Test Web Dashboard Call Reception

### Setup:
1. **Open web dashboard** in browser: `http://localhost:3000`
2. **Open Browser Console** (Press F12)
3. **Open Backend Terminal** (keep visible)

### Test:
1. **Make call** from mobile app
2. **Check Backend Logs**:
   ```bash
   📢 Notified agents about incoming call abc-123
      Caller: User_xxx (+232 76 123 456)
      Queue: Exam Malpractice Queue (IVR Option: 1)
   👥 Total connected agents: 1        ← MUST be > 0!
      - Your Name (2000): available
   ✅ Broadcasted call to 1 connected agents
   ```

3. **Check Browser Console**:
   ```javascript
   > call:incoming {
       callId: "abc-123",
       callerName: "User_xxx",
       phoneNumber: "+232 76 123 456",
       ivrOption: "1",
       queueName: "Exam Malpractice Queue",
       timestamp: "2025-01-15T..."
     }
   ```

4. **Check Dashboard UI**:
   - Call should appear in "Incoming Calls" list
   - Shows caller number, service type, timestamp

### If "0 connected agents":
**Problem**: Web dashboard not connected to WebSocket

**Solution**:
1. Refresh web dashboard page
2. Check browser console for WebSocket errors
3. Make sure backend is running on port 3001
4. Check Network tab in browser DevTools

---

## 6️⃣ Test Flow Builder Templates

### List Templates:
```bash
curl http://localhost:3001/flow-builder/templates | jq
```

**✅ Expected**: JSON array with 3 templates:
- simple-four-option (default)
- advanced-multilevel
- emergency-hotline

### Get Active Flow:
```bash
curl http://localhost:3001/flow-builder/active | jq
```

**✅ Expected**: Returns the default simple-four-option template

### Switch to Emergency Template:
```bash
curl -X POST http://localhost:3001/flow-builder/active/emergency-hotline
```

**✅ Expected**:
```json
{
  "success": true,
  "message": "Flow template \"Emergency Hotline IVR\" is now active"
}
```

### Verify Switch:
```bash
curl http://localhost:3001/flow-builder/active | jq '.name'
```

**✅ Expected**: `"Emergency Hotline IVR"`

---

## 📊 Checklist

Copy this and check off as you test:

```
[ ] ✅ Backend started successfully
[ ] ✅ Mobile app opens without errors
[ ] ✅ Offline error shows friendly message
[ ] ✅ Cache preloads on app startup
[ ] ✅ App works offline (history, profile)
[ ] ✅ Queue position #1 says "Next in Line"
[ ] ✅ Queue position 2+ shows correct wait time
[ ] ✅ Backend logs show "Broadcasting incoming call"
[ ] ✅ Backend logs show connected agents > 0
[ ] ✅ Browser console receives call:incoming event
[ ] ✅ Web dashboard shows call in UI
[ ] ✅ Flow builder returns 3 templates
[ ] ✅ Can switch active template
[ ] ✅ Active flow endpoint works
```

---

## 🐛 Common Issues

### Issue: "0 connected agents"
**Fix**: 
1. Make sure you're logged in on web dashboard
2. Check if dashboard registered as agent
3. Look for "Agent registered" message in backend logs

### Issue: "Still seeing technical errors"
**Fix**:
- Make sure mobile app reloaded the new code
- Close app completely and reopen
- Check you're using the latest code

### Issue: "Cache not preloading"
**Fix**:
- Check terminal logs for "📦 Preloading"
- Make sure `cache.service.ts` is properly imported in App.tsx
- Try restarting the app

### Issue: "Queue position still shows 3 min for #1"
**Fix**:
- Restart backend (code changed)
- Make a new call
- Check backend logs for estimated wait time = 0

### Issue: "Flow builder endpoints return 404"
**Fix**:
- Check if `FlowBuilderModule` is imported in `app.module.ts`
- Restart backend
- Verify URL: `http://localhost:3001/flow-builder/templates`

---

## ✅ Success Indicators

If you see **ALL** of these, everything is working:

1. ✅ **Friendly error messages** when offline
2. ✅ **Data preloads** in background (see logs)
3. ✅ **App works offline** (history, profile accessible)
4. ✅ **Position #1** says "Next in Line" (not "in queue")
5. ✅ **Backend broadcasts** to connected agents (see logs)
6. ✅ **Web dashboard receives** call:incoming events
7. ✅ **3 flow templates** available via API
8. ✅ **Can switch** active template

---

## 🎉 All Good? Next Steps

1. **Test with real phone number** (yours)
2. **Test web dashboard** claiming calls
3. **Test full call flow** end-to-end
4. **Choose TTS provider** for IVR voice
5. **Record professional audio** (optional)
6. **Deploy to production**

---

**Need Help?**

Check the detailed guide: `FIXES_AND_IMPROVEMENTS.md`

For IVR voice setup, let me know which provider you prefer:
- Google Cloud TTS (recommended)
- Amazon Polly
- Microsoft Azure Speech
- Or pre-recorded audio files
