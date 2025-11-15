# ✅ Mobile App Call API - READY!

## Backend Call Endpoints Implemented

The backend now has all the endpoints needed for the mobile app to make calls!

---

## 🎯 Available Endpoints

### 1. **POST /calls/initiate** - Start a Call
**Mobile app uses this to initiate calls**

**Request:**
```json
{
  "phoneNumber": "+232 76 123 456",
  "ivrOption": "1",
  "callerName": "John Doe"
}
```

**Response (Agent Available):**
```json
{
  "success": true,
  "callId": "uuid-here",
  "assignedAgent": {
    "id": "agent_1",
    "name": "Sarah Johnson",
    "extension": "1001"
  },
  "message": "Connected to Sarah Johnson"
}
```

**Response (Queue - No Agent Available):**
```json
{
  "success": true,
  "callId": "uuid-here",
  "queuePosition": 3,
  "estimatedWait": 8,
  "message": "You are number 3 in queue"
}
```

---

### 2. **GET /calls/:id/status** - Check Call Status

**Request:**
```
GET http://localhost:3001/calls/{callId}/status
```

**Response:**
```json
{
  "callId": "uuid-here",
  "status": "connected",
  "duration": 120,
  "agent": {
    "id": "agent_1",
    "name": "Sarah Johnson",
    "extension": "1001"
  },
  "createdAt": "2025-11-14T17:05:00Z"
}
```

---

### 3. **POST /calls/:id/end** - End a Call

**Request:**
```
POST http://localhost:3001/calls/{callId}/end
```

**Response:**
```json
{
  "success": true,
  "message": "Call ended successfully. Duration: 2m 30s"
}
```

---

### 4. **GET /calls/agents/available** - List Available Agents

**Request:**
```
GET http://localhost:3001/calls/agents/available?queue=1
```

**Response:**
```json
[
  {
    "id": "agent_1",
    "name": "Sarah Johnson",
    "extension": "1001",
    "skills": ["Exam Malpractice Queue", "Teacher Complaints Queue"]
  }
]
```

---

### 5. **GET /calls** - Get All Calls

**Request:**
```
GET http://localhost:3001/calls?limit=50
```

**Response:**
```json
[
  {
    "id": "uuid",
    "phoneNumber": "+232 76 123 456",
    "callerName": "John Doe",
    "status": "ended",
    "ivrOption": "1",
    "queueName": "Exam Malpractice Queue",
    "assignedAgentName": "Sarah Johnson",
    "durationSeconds": 180,
    "createdAt": "2025-11-14T17:05:00Z",
    "endedAt": "2025-11-14T17:08:00Z"
  }
]
```

---

## 🤖 Mock Agents (For Testing)

The system includes 3 mock agents that simulate real agent availability:

| Agent | Extension | Skills (IVR Options) | Status |
|-------|-----------|---------------------|--------|
| Sarah Johnson | 1001 | 1, 2 (Exam, Teachers) | Available |
| Mohamed Kamara | 1002 | 2, 3 (Teachers, Facilities) | Available |
| Fatmata Sesay | 1003 | 1, 3, 4 (Exam, Facilities, General) | Available |

### IVR Option Mapping:
- **1** = Exam Malpractice Queue
- **2** = Teacher Complaints Queue
- **3** = School Facilities Queue
- **4** = General Inquiry Queue

---

## 🔄 How It Works

### Call Flow:
```
1. Mobile app: POST /calls/initiate
   ↓
2. Backend: Find available agent with matching skills
   ↓
3. If agent available:
   • Assign call to agent
   • Return agent info
   • Mark agent as "busy"
   ↓
4. If no agent available:
   • Add to queue
   • Calculate position & wait time
   • Return queue info
   ↓
5. Mobile app displays result
   • "Connected to Sarah Johnson" OR
   • "You are #3 in queue, wait: 8 minutes"
   ↓
6. When done: POST /calls/:id/end
   • Calculate duration
   • Free up agent
   • Save call record
```

---

## 🧪 Test the Endpoints

### Using curl:

**1. Initiate a call:**
```bash
curl -X POST http://localhost:3001/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+232 76 123 456",
    "ivrOption": "1",
    "callerName": "Test User"
  }'
```

**2. Check call status:**
```bash
curl http://localhost:3001/calls/{callId}/status
```

**3. End the call:**
```bash
curl -X POST http://localhost:3001/calls/{callId}/end
```

**4. List available agents:**
```bash
curl http://localhost:3001/calls/agents/available
```

**5. View all calls:**
```bash
curl http://localhost:3001/calls
```

---

## 📱 Mobile App Integration

The mobile app is already configured to use these endpoints via `callApiService`:

```typescript
// In CallScreen.tsx
const response = await callApiService.initiateCall({
  phoneNumber: '+232 76 123 456',
  ivrOption: selectedIVR,
  callerName: 'Mobile User',
});

if (response.success) {
  if (response.assignedAgent) {
    // Show: "Connected to Sarah Johnson"
  } else if (response.queuePosition) {
    // Show: "Queue position: 3, wait: 8 minutes"
  }
}
```

---

## 🗄️ Database

All calls are automatically saved to the `calls` table with fields:
- `id` - Unique call ID
- `phoneNumber` - Caller's number
- `callerName` - Caller's name
- `status` - initiated, connected, in_queue, ended, etc.
- `ivrOption` - Selected IVR option (1-4)
- `queueName` - Assigned queue
- `assignedAgentId/Name/Extension` - Agent details
- `queuePosition` - Position in queue
- `durationSeconds` - Call length
- `createdAt` - Call start time
- `endedAt` - Call end time

---

## 🚀 Next Steps to Test

### 1. Test from mobile app:
```bash
cd mobile-app/ministry-call-center
npx expo start
```

### 2. In the app:
- Select an IVR option (e.g., "1. Exam Issues")
- Tap "Call Now"
- Should see: "Connected to Sarah Johnson" or queue position

### 3. Check backend logs:
```
📞 Call {id} assigned to agent Sarah Johnson (1001)
```

### 4. End the call:
- Tap "Hang Up" in mobile app
- Backend logs:
```
✅ Agent Sarah Johnson now available
📴 Call {id} ended after 120 seconds
```

---

## ⚡ Current Limitations (Simulated)

**What Works:**
✅ Call initiation via API  
✅ Agent assignment logic  
✅ Queue management  
✅ Call duration tracking  
✅ Database persistence  
✅ Status checking  

**What's Simulated:**
⚠️ Actual voice calls (no Asterisk integration yet)  
⚠️ Agent status (mock agents, not real dashboard)  
⚠️ Real-time updates (polling, not WebSocket)  

**For Full Implementation:**
- Connect to Asterisk PBX for actual calls
- Integrate with agent dashboard status
- Add WebSocket for real-time updates
- Implement call recording storage

---

## 🎉 Summary

**Backend Status**: ✅ READY - All endpoints working  
**Mobile App Status**: ✅ READY - Already integrated  
**Database**: ✅ READY - Auto-created table  
**Mock Agents**: ✅ READY - 3 agents available  

**You can now test end-to-end call flow from mobile app to backend!** 🚀

---

## 🔗 Related Files

- **Backend**:
  - `backend/src/calls/` - Complete calls module
  - `backend/src/calls/calls.service.ts` - Business logic
  - `backend/src/calls/calls.controller.ts` - API endpoints
  - `backend/src/calls/call.entity.ts` - Database schema

- **Mobile App**:
  - `mobile-app/ministry-call-center/src/services/call-api.service.ts` - API client
  - `mobile-app/ministry-call-center/src/screens/CallScreen.tsx` - UI

---

**Backend running on**: http://localhost:3001  
**Mobile app connects to**: http://192.168.1.17:3001  
**API endpoints**: http://localhost:3001/calls/*
