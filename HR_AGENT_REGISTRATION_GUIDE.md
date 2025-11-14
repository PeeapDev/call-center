# 📋 HR Agent Registration Guide

## ✅ Agent Registration Now in Dashboard!

Agent WebRTC registration has been integrated into the **Agent Management** page in the admin dashboard. This makes sense from an HR/management perspective - manage your agents and their call capabilities in one place!

---

## 🎯 How to Access

### Login as Admin/Supervisor

```
URL: http://localhost:3000
OR: https://rhett-yearlong-gregory.ngrok-free.dev

Credentials:
- Username: admin@education.gov
- Password: Admin123!
```

### Navigate to Agents Page

1. Login to dashboard
2. Click **"Agents"** in sidebar
3. See Agent Management page with WebRTC registration

---

## 📱 Features on Agent Management Page

### 1. **Overview Statistics**
- **Total Agents**: 6 agents configured
- **On Call**: Currently handling calls
- **Available**: Ready for calls
- **Avg Performance**: Average call duration
- **WebRTC Registered**: 🆕 Agents ready to receive calls

### 2. **WebRTC Configuration Section** (Purple Card)
- **Asterisk Server URL**: Configure WebSocket server
- **JsSIP Status**: Shows if library is loaded
- **Instructions**: Clear guidance for registration

### 3. **Agent List with Registration**
Each agent shows:
- **Name & Avatar**
- **Status Badge**: (on-call, available, break, offline)
- **WebRTC Status**: 🆕 "WebRTC Active" badge when registered
- **Email & SIP Info**: SIP username and extension
- **Call Statistics**: Calls today, avg duration
- **Registration Button**: 🆕 "Register WebRTC" or "Unregister"

---

## 🚀 How to Register Agents

### Step 1: Access Agent Management

1. Login as admin
2. Navigate to **Agents** page
3. See all agents listed

### Step 2: Check Configuration

The WebRTC configuration card shows:
- **Asterisk Server**: `ws://192.168.1.17:8088/ws` (pre-configured)
- **JsSIP Loaded**: Should show green badge

### Step 3: Register Individual Agents

**Option A: Register One Agent**
1. Find agent in the list (e.g., Sarah Johnson)
2. Click **"Register WebRTC"** button (purple)
3. Wait for confirmation
4. Badge changes to **"WebRTC Active"** (purple with checkmark)
5. Button changes to **"Unregister"** (red)

**Option B: Register Multiple Agents**
1. Click **"Register WebRTC"** for each agent
2. Each successful registration shows confirmation
3. WebRTC Registered count increases

**Option C: Register All Agents**
- Simply click through each agent's "Register WebRTC" button
- Monitor the WebRTC Registered stat card
- Should show all 6 agents registered

### Step 4: Monitor Status

- **WebRTC Registered** stat card shows count
- Each registered agent has purple **"WebRTC Active"** badge
- Console shows registration confirmations

---

## 📊 Agent Registration Flow

```
Admin Dashboard
    ↓
Agents Page
    ↓
WebRTC Configuration Section
    ↓
Agent List with Registration Buttons
    ↓
Click "Register WebRTC" for Agent
    ↓
JsSIP connects to Asterisk
    ↓
SIP registration succeeds
    ↓
✅ "WebRTC Active" badge appears
    ↓
Agent ready to receive calls!
```

---

## 🎨 Visual Guide

### Before Registration:
```
╔════════════════════════════════════════╗
║ Sarah Johnson                          ║
║ 🟢 on-call                            ║
║ sarah.johnson@education.gov            ║
║ SIP: agent001 • Ext: 1001             ║
║                                        ║
║ [📞 Register WebRTC]  ← Click this    ║
╚════════════════════════════════════════╝
```

### After Registration:
```
╔════════════════════════════════════════╗
║ Sarah Johnson                          ║
║ 🟢 on-call  ✅ WebRTC Active          ║
║ sarah.johnson@education.gov            ║
║ SIP: agent001 • Ext: 1001             ║
║                                        ║
║ [📴 Unregister]  ← Now can unregister ║
╚════════════════════════════════════════╝
```

---

## 🧪 Testing Agent Registration

### Test 1: Single Agent Registration

1. **Admin Dashboard**: Navigate to Agents
2. **Click**: "Register WebRTC" for Sarah Johnson (agent001)
3. **Expected**: 
   - Console: "✅ Sarah Johnson registered for WebRTC calls"
   - Badge appears: "WebRTC Active"
   - Stat card: "WebRTC Registered: 1"
   - Button: Changes to "Unregister"

### Test 2: Receive Call from Mobile

**After registering agent:**

1. **Mobile App**: Login and navigate to Call screen
2. **Mobile**: Tap "Call Now"
3. **Expected**: Browser shows confirm dialog
   ```
   "Incoming call for Sarah Johnson. Answer?"
   ```
4. **Click**: "OK" to answer
5. **Expected**: Call connects, audio flows

### Test 3: Multiple Agents

1. **Register**: All 6 agents
2. **Mobile**: Make call
3. **Expected**: 
   - First registered agent gets notification
   - OR: All agents ring (queue configuration)
   - First to answer gets the call

### Test 4: Unregister Agent

1. **Find**: Registered agent
2. **Click**: "Unregister" (red button)
3. **Expected**:
   - "WebRTC Active" badge disappears
   - Button changes back to "Register WebRTC"
   - WebRTC Registered count decreases

---

## 📋 Agent Details

| Agent # | Name | SIP Username | Extension | Status |
|---------|------|--------------|-----------|---------|
| 1 | Sarah Johnson | agent001 | 1001 | On Call |
| 2 | Michael Chen | agent002 | 1002 | On Call |
| 3 | Emily Rodriguez | agent003 | 1003 | Available |
| 4 | David Kim | agent004 | 1004 | Break |
| 5 | Lisa Thompson | agent005 | 1005 | Offline |
| 6 | James Wilson | agent006 | 1006 | Available |

**All passwords**: `secure_password_00X` (where X = agent number)

---

## 🔧 Configuration Details

### WebSocket Server URL
```
Default: ws://192.168.1.17:8088/ws
```

**Can be changed**:
- Edit the input field in WebRTC Configuration section
- Changes apply to next registration
- Previous registrations keep their config

### SIP Credentials (Automatic)

When you click "Register WebRTC":
- **URI**: `sip:agent001@192.168.1.17`
- **Password**: `secure_password_001`
- **Display Name**: Agent's actual name
- **Transport**: WebSocket

---

## ✅ Advantages of Dashboard Integration

### 1. **Centralized Management**
- Manage agents and their call capabilities together
- No separate registration page needed
- All in one HR/admin interface

### 2. **Role-Based Access**
- Only admin/supervisor can register agents
- Agents can't register themselves
- Better security and control

### 3. **Visual Feedback**
- See who's registered at a glance
- Purple badges for WebRTC active agents
- Real-time count of registered agents

### 4. **Easy Monitoring**
- Agent status (on-call, available, etc.)
- WebRTC registration status
- Call statistics
- All in one view

### 5. **Quick Actions**
- Register/unregister with one click
- No need to remember credentials
- Automatic configuration

---

## 🆘 Troubleshooting

### Issue: "JsSIP library is still loading"

**Solution**:
- Wait a few seconds for library to load
- Refresh page if badge stays "Loading..."
- Check internet connection

### Issue: "Registration failed: Connection refused"

**Solution**:
- Verify Asterisk is running
- Check WebSocket URL is correct
- Ensure port 8088 is accessible
- Try: `curl http://192.168.1.17:8088/ws`

### Issue: "WebRTC Active" badge doesn't appear

**Solution**:
- Check browser console for errors
- Look for "✅ [Name] registered for WebRTC calls"
- If error appears, check Asterisk credentials
- Verify Asterisk accepts SIP registration

### Issue: Agent doesn't receive calls

**Solutions**:
1. Verify agent is registered (has "WebRTC Active" badge)
2. Check queue membership in Asterisk
3. Ensure mobile app is calling correct extension
4. Look at Asterisk logs for routing issues

---

## 🎯 Complete Testing Workflow

### Preparation (5 minutes)

```bash
# 1. Start backend & frontend (already running)

# 2. Open admin dashboard
open http://localhost:3000

# 3. Login as admin
# Username: admin@education.gov
# Password: Admin123!
```

### Registration (2 minutes)

```
1. Navigate to "Agents" page
2. See 6 agents listed
3. Click "Register WebRTC" for Agent 1 (Sarah Johnson)
4. Wait for "WebRTC Active" badge
5. Repeat for Agent 2, 3, 4 (optional)
```

### Testing Calls (3 minutes)

```
1. Mobile app: Login → Call screen
2. Mobile: Tap "Call Now"
3. Dashboard: Browser shows incoming call notification
4. Dashboard: Click "OK" to answer
5. Mobile ↔ Agent: Test audio both ways
6. Either side: Hang up
7. ✅ Success!
```

---

## 📸 Screenshots

### Agent Management Page:
```
╔══════════════════════════════════════════════╗
║  📊 Stats Cards:                             ║
║  [ Total: 6 ][ On Call: 2 ][ Available: 2 ] ║
║  [ Avg: 4:12 ][ WebRTC: 4 ]                 ║
╠══════════════════════════════════════════════╣
║  🟣 WebRTC Agent Registration                ║
║  Asterisk Server: ws://192.168.1.17:8088/ws  ║
║  [JsSIP Loaded ✅]                           ║
╠══════════════════════════════════════════════╣
║  👤 Sarah Johnson  🟢 on-call  ✅ WebRTC     ║
║  sarah.johnson@education.gov                 ║
║  SIP: agent001 • Ext: 1001                   ║
║  [12 calls] [4:23 avg] [📴 Unregister]      ║
║────────────────────────────────────────────  ║
║  👤 Michael Chen  🟢 on-call  ✅ WebRTC      ║
║  michael.chen@education.gov                  ║
║  SIP: agent002 • Ext: 1002                   ║
║  [9 calls] [3:56 avg] [📴 Unregister]       ║
║────────────────────────────────────────────  ║
║  👤 Emily Rodriguez  🔵 available            ║
║  emily.rodriguez@education.gov               ║
║  SIP: agent003 • Ext: 1003                   ║
║  [11 calls] [5:12 avg] [📞 Register WebRTC] ║
╚══════════════════════════════════════════════╝
```

---

## 🎉 Summary

### ✅ What You Get:

1. **Professional HR Interface**: Manage agents from one place
2. **Easy Registration**: One click to register agents for calls
3. **Visual Status**: See who's registered with purple badges
4. **Real-time Monitoring**: Track registration count
5. **Role-Based**: Only admin/supervisor access
6. **Auto-Configuration**: No manual credential entry

### 🚀 Quick Start:

```
1. Login as admin → Agents page
2. Click "Register WebRTC" for each agent
3. See "WebRTC Active" badges appear
4. Test with mobile call
5. ✅ Agents receive calls!
```

### 📞 Perfect for:

- HR managers setting up new agents
- Supervisors managing agent availability
- Admins configuring call capabilities
- Testing WebRTC before production
- Training new agents

---

**Access Now:**
```
http://localhost:3000/dashboard/agents
```

**Or via ngrok:**
```
https://rhett-yearlong-gregory.ngrok-free.dev/dashboard/agents
```

**Login: admin@education.gov / Admin123!**

---

**Your agent registration is now professional and integrated!** 🎉📞✨
