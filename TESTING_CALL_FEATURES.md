# Testing Call Features - Quick Start Guide

## ✅ System is Running!

- **Backend API**: http://localhost:3001  
- **Frontend App**: http://localhost:3000  
- **API Health**: http://localhost:3001/health  

---

## 🎯 Quick Test Checklist

### 1. Login & Dashboard Access
1. Visit http://localhost:3000
2. Click "Login" or visit http://localhost:3000/login
3. Use demo account:
   - **Email**: `admin@education.gov`
   - **Password**: `admin123`
4. You'll be redirected to the dashboard

### 2. Test Call Routing
**Location**: Dashboard → "Call Routing" (sidebar)

#### A. Create Routing Rules
```bash
# Via API (Backend test)
curl -X POST http://localhost:3001/routing \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VIP Fast Track",
    "priority": 1,
    "conditions": {
      "callerIdPattern": "+232123*",
      "timeRange": "09:00-17:00"
    },
    "destinationType": "queue",
    "destination": "vip_queue",
    "enabled": true
  }'
```

#### B. Via Frontend
1. Go to "Call Routing" page
2. Click "Add Rule" (or use existing seed rules)
3. Fill in:
   - Name: "Exam Complaints"
   - Priority: 1-10 (lower = higher priority)
   - Conditions: IVR option, time range, etc.
   - Destination: Queue name
4. Click "Save"

#### C. Seed Default Rules
Click the "Seed Default Rules" button to create:
- Business Hours routing
- After Hours voicemail
- VIP fast-track
- IVR menu routing

### 3. Test Call Flow Builder
**Location**: Dashboard → "Flow Builder" (sidebar)

#### Features to Test:
1. **Add Nodes**:
   - Click any node type on the left sidebar
   - Drag it around the canvas
   - Try adding: IVR → Queue → Hang Up

2. **Connect Nodes**:
   - Drag from one node's bottom to another node's top
   - Create a flow path

3. **Save Flow**:
   - Enter flow name (top input)
   - Click "Save Flow"
   - Check "Saved Flows" panel on right

4. **Load Flow**:
   - Click "Load" on any saved flow
   - It appears on canvas

5. **Export**:
   - Click "Export JSON" → downloads JSON file
   - Click "Export Dialplan" → downloads Asterisk config

### 4. Test Call Simulation
**Via Frontend** (Call Routing page):
1. Scroll to "Test Call Simulator"
2. Enter a phone number (e.g., `+23277123456`)
3. Select IVR option (1-4)
4. Click "Simulate Call"
5. See which routing rule matched and destination

**Via API**:
```bash
curl "http://localhost:3001/routing/simulate?callerNumber=%2B23277123456&ivrOption=1"
```

### 5. Test WebRTC Setup Page
**Location**: Dashboard → "WebRTC Setup" (sidebar)

#### Features:
1. **System Requirements Check**:
   - Browser compatibility
   - Microphone access
   - Camera access (if needed)

2. **Asterisk Configuration**:
   - Shows sample PJSIP config
   - SIP credentials
   - WebSocket setup

3. **Test Call** (Mock):
   - Click "Start Test Call"
   - Simulates connection
   - Shows status updates

### 6. Test My Calls Interface
**Location**: Dashboard → "My Calls" (sidebar)

#### Features:
1. **Active Calls Tab**:
   - Shows simulated incoming call
   - Call controls: Mute, Hold, Speaker, Transfer
   - Call notes area
   - Timer

2. **Call History Tab**:
   - List of past calls
   - Duration, status, notes
   - Callback button

### 7. Test Agent Dashboard
**Login as Agent**:
- **Email**: `agent@education.gov`
- **Password**: `agent123`

#### Agent-Specific Features:
- Simplified dashboard
- Today's calls count
- Average call time
- Active call interface
- Quick stats

---

## 🧪 API Testing

### Call Routing APIs

#### 1. Get All Routing Rules
```bash
curl http://localhost:3001/routing
```

#### 2. Create New Rule
```bash
curl -X POST http://localhost:3001/routing \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teacher Complaints",
    "priority": 3,
    "conditions": {"ivrOption": "2"},
    "destinationType": "queue",
    "destination": "teacher_queue",
    "enabled": true,
    "context": "ministry-main",
    "extension": "teacher_handler"
  }'
```

#### 3. Update Rule
```bash
curl -X PUT http://localhost:3001/routing/1 \
  -H "Content-Type: application/json" \
  -d '{"priority": 2, "enabled": false}'
```

#### 4. Delete Rule
```bash
curl -X DELETE http://localhost:3001/routing/1
```

#### 5. Regenerate Asterisk Dialplan
```bash
curl http://localhost:3001/routing/regenerate-dialplan
```
Then check: `docker/asterisk/conf/extensions_custom.conf`

#### 6. Simulate Call Routing
```bash
# Basic simulation
curl "http://localhost:3001/routing/simulate?callerNumber=%2B23277123456&ivrOption=1"

# With time
curl "http://localhost:3001/routing/simulate?callerNumber=%2B23277987654&ivrOption=3&currentTime=14:30"

# After hours
curl "http://localhost:3001/routing/simulate?callerNumber=%2B23276555555&currentTime=20:00"
```

---

## 🎨 Frontend Call Features

### 1. Main Dashboard (Admin/Supervisor)
**URL**: http://localhost:3000/dashboard

#### Features:
- **Real-time Stats** (mock data):
  - Active calls count
  - Agents available
  - Average wait time
  - Calls today

- **Active Calls List**:
  - Caller, agent, duration
  - Live timer animation

- **Agent Status**:
  - Name, status, current call
  - Color-coded badges

- **Analytics Charts**:
  - Call volume by hour
  - Sentiment analysis
  - Agent performance

### 2. Call Routing Configuration
**URL**: http://localhost:3000/dashboard/routing

#### Features:
- **Routing Rules Table**:
  - Priority, name, conditions, destination
  - Enable/disable toggle
  - Edit/Delete actions

- **Call Simulator**:
  - Test routing logic
  - See matched rule
  - Visual feedback

- **Seed/Delete Actions**:
  - Quick setup with defaults
  - Clear all rules

### 3. Call Flow Builder
**URL**: http://localhost:3000/dashboard/call-flow-builder

#### Features:
- **Visual Canvas**:
  - Drag & drop nodes
  - Connect with edges
  - Zoom & pan controls

- **Node Types**:
  - Start Call (green)
  - IVR Menu (blue)
  - Queue (purple)
  - Condition (orange)
  - Voicemail (gray)
  - Hang Up (red)
  - Time Check (yellow)

- **Controls**:
  - Save to localStorage
  - Load saved flows
  - Export JSON/Dialplan
  - Mini-map navigation

### 4. My Calls Interface
**URL**: http://localhost:3000/dashboard/my-calls

#### Features:
- **Active Call Simulation**:
  - Incoming call alert
  - Answer/Decline buttons
  - Call controls (mute, hold, etc.)
  - Real-time timer
  - Notes area

- **Call History**:
  - Past calls list
  - Duration, type, status
  - Callback functionality
  - Notes display

### 5. WebRTC Setup Guide
**URL**: http://localhost:3000/dashboard/webrtc-setup

#### Features:
- **System Check**:
  - Browser compatibility
  - Microphone permission
  - WebRTC support

- **Configuration Guide**:
  - Asterisk PJSIP setup
  - SIP credentials
  - WebSocket configuration

- **Test Call**:
  - Simulated connection test
  - Status feedback

---

## 📞 Real Call Integration (Next Steps)

### To Connect Real Asterisk:

#### 1. Start Asterisk (if using Docker)
```bash
cd /Users/soft-touch/Desktop/project/callcenter
docker-compose up -d asterisk
```

#### 2. Update Backend `.env`
```env
ASTERISK_ENABLED=true
ASTERISK_HOST=localhost
ASTERISK_PORT=8088
ASTERISK_USERNAME=admin
ASTERISK_PASSWORD=asterisk
```

#### 3. Restart Backend
```bash
cd backend
npm run start:dev
```

#### 4. Test Asterisk Connection
```bash
curl http://localhost:3001/asterisk/status
```

### To Make Real Calls:

#### Option A: SIP Phone
1. Configure a SIP client (Zoiper, X-Lite, etc.)
2. Use PJSIP credentials from Asterisk config
3. Register to Asterisk
4. Dial extension defined in routing rules

#### Option B: WebRTC (Browser-based)
1. Use JsSIP or similar library
2. Connect via WebSocket to Asterisk
3. Register SIP account
4. Make/receive calls in browser

---

## 🧪 Testing Scenarios

### Scenario 1: Business Hours Routing
```bash
# During business hours (9am-5pm)
curl "http://localhost:3001/routing/simulate?callerNumber=%2B23277123456&currentTime=10:00&ivrOption=1"
# Expected: Routes to exam_queue

# After hours (6pm)
curl "http://localhost:3001/routing/simulate?callerNumber=%2B23277123456&currentTime=18:00"
# Expected: Routes to voicemail
```

### Scenario 2: VIP Fast Track
```bash
# VIP number pattern
curl "http://localhost:3001/routing/simulate?callerNumber=%2B232123456789&ivrOption=1"
# Expected: Higher priority routing

# Regular number
curl "http://localhost:3001/routing/simulate?callerNumber=%2B23277999888&ivrOption=1"
# Expected: Standard queue
```

### Scenario 3: IVR Menu Routing
```bash
# Press 1: Exam Issues
curl "http://localhost:3001/routing/simulate?ivrOption=1"

# Press 2: Teacher Complaints
curl "http://localhost:3001/routing/simulate?ivrOption=2"

# Press 3: Facilities
curl "http://localhost:3001/routing/simulate?ivrOption=3"

# Press 4: Other
curl "http://localhost:3001/routing/simulate?ivrOption=4"
```

---

## 🎭 Demo User Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@education.gov | admin123 | Full access, all features |
| **Supervisor** | supervisor@education.gov | super123 | Monitoring, routing, flow builder |
| **Agent** | agent@education.gov | agent123 | Simplified dashboard, call handling |
| **Analyst** | analyst@education.gov | analyst123 | Analytics only |
| **Auditor** | auditor@education.gov | auditor123 | View-only access |

---

## 📊 What's Currently Working (Mock/Simulation)

✅ User authentication & RBAC  
✅ Dashboard with mock statistics  
✅ Call routing configuration UI  
✅ Call routing API (CRUD)  
✅ Call simulation logic  
✅ Asterisk dialplan generation  
✅ Call flow builder (visual)  
✅ Flow save/load/export  
✅ Agent call interface (simulated)  
✅ Call history tracking (mock)  
✅ WebRTC setup guide  
✅ System requirements check  

---

## 🚧 What Needs Real Integration

🔧 Actual Asterisk PBX connection  
🔧 Real SIP call handling  
🔧 WebRTC signaling  
🔧 Call recording storage  
🔧 Live call transfer  
🔧 Conference calling  
🔧 IVR voice prompts  
🔧 Call queue management  

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Restart backend
cd backend
npm run start:dev
```

### Frontend Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Restart frontend
cd frontend
npm run dev
```

### Database Issues
```bash
# Delete and recreate database
cd backend
rm callcenter.db
npm run start:dev
# TypeORM will recreate with synchronize:true
```

### API Not Responding
```bash
# Test backend health
curl http://localhost:3001/health

# Check logs in terminal where backend is running
```

---

## 📱 Quick Access URLs

- **Main App**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **Call Routing**: http://localhost:3000/dashboard/routing
- **Flow Builder**: http://localhost:3000/dashboard/call-flow-builder
- **My Calls**: http://localhost:3000/dashboard/my-calls
- **WebRTC Setup**: http://localhost:3000/dashboard/webrtc-setup
- **API Health**: http://localhost:3001/health
- **API Docs**: http://localhost:3001/routing

---

## 🎉 Start Testing Now!

1. Open http://localhost:3000
2. Login as admin (admin@education.gov / admin123)
3. Explore the dashboard
4. Try the Call Flow Builder
5. Test Call Routing simulation
6. Check out the Agent interface

Everything is running and ready to test! 🚀
