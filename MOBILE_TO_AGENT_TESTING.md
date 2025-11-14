# 📱 Mobile-to-Agent Call Testing Guide

## Complete Setup & Testing Flow

---

## 🎯 Testing Scenario

**Goal**: Test a citizen calling from mobile app → routed through IVR → answered by agent

```
Mobile User (Citizen)
    ↓ (WebRTC Call)
Asterisk PBX
    ↓ (IVR Selection)
Call Queue
    ↓ (Ring)
Agent 1, Agent 2, Agent 3, Agent 4
    ↓ (First Available Answers)
Call Connected ✅
```

---

## 📋 Prerequisites Checklist

### ✅ Backend Setup
- [ ] Backend running on port 3001
- [ ] ngrok tunnel for backend (HTTPS)
- [ ] Asterisk configured with WebRTC
- [ ] SSL certificates generated
- [ ] PJSIP WebRTC endpoints configured

### ✅ Frontend Setup
- [ ] Frontend running on port 3000
- [ ] ngrok tunnel for frontend (HTTPS)
- [ ] JsSIP library installed
- [ ] WebRTC client implemented

### ✅ Mobile App Setup
- [ ] Expo app initialized
- [ ] WebRTC dependencies installed
- [ ] API configured with backend URL
- [ ] SIP credentials configured

---

## 🚀 Step-by-Step Setup

### Step 1: Configure ngrok (One-Time Setup)

```bash
# 1. Sign up at ngrok.com
open https://dashboard.ngrok.com/signup

# 2. Get your auth token
open https://dashboard.ngrok.com/get-started/your-authtoken

# 3. Configure ngrok (replace with YOUR token)
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 2: Start Backend with ngrok

```bash
# Terminal 1: Start backend
cd /Users/soft-touch/Desktop/project/callcenter/backend
npm run start:dev

# Terminal 2: Start ngrok for backend
ngrok http 3001

# ✅ Copy the HTTPS URL shown (e.g., https://abc123.ngrok-free.app)
# Save this as BACKEND_URL
```

### Step 3: Start Frontend with ngrok

```bash
# Terminal 3: Update frontend config
cd /Users/soft-touch/Desktop/project/callcenter/frontend

# Replace with YOUR backend ngrok URL
echo "NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.ngrok-free.app" > .env.local

# Start frontend
npm run dev

# Terminal 4: Start ngrok for frontend
ngrok http 3000

# ✅ Copy the HTTPS URL shown (e.g., https://def456.ngrok-free.app)
# Save this as FRONTEND_URL
```

### Step 4: Configure Asterisk WebRTC

The configuration files are already created:
- ✅ `docker/asterisk/conf/http.conf` - WebSocket enabled
- ✅ `docker/asterisk/conf/pjsip_webrtc.conf` - WebRTC endpoints
- ✅ `docker/asterisk/keys/asterisk.pem` - SSL certificate

**SIP Credentials Created:**

| User | Username | Password | Extension |
|------|----------|----------|-----------|
| Agent 1 | agent001 | secure_password_001 | 1001 |
| Agent 2 | agent002 | secure_password_002 | 1002 |
| Agent 3 | agent003 | secure_password_003 | 1003 |
| Agent 4 | agent004 | secure_password_004 | 1004 |
| Mobile User | webrtc_user | mobile_user_password | 2000 |

### Step 5: Start Asterisk (if using Docker)

```bash
cd /Users/soft-touch/Desktop/project/callcenter

# If you have docker-compose.yml with Asterisk
docker-compose up -d asterisk

# Or start Asterisk directly
# Follow your existing Asterisk setup
```

---

## 🖥️ Setup Agent Web Clients

### Agent 1 Setup (Browser Tab 1)

1. Open: `https://YOUR-FRONTEND-URL.ngrok-free.app`
2. Login: `agent@education.gov` / `agent123`
3. Go to "My Calls" page
4. Initialize WebRTC:

```javascript
// In browser console (F12)
import { createWebRTCClient } from '@/lib/webrtc-client';

const agent1Client = await createWebRTCClient({
  wsServer: 'wss://YOUR-ASTERISK-IP:8089/ws',
  sipUri: 'sip:agent001@your-domain.com',
  password: 'secure_password_001',
  displayName: 'Agent 001'
});

console.log('✅ Agent 1 registered');
```

### Agent 2, 3, 4 Setup (Additional Browser Tabs)

Repeat the same process in separate browser tabs with different credentials:
- Agent 2: `agent002` / `secure_password_002`
- Agent 3: `agent003` / `secure_password_003`
- Agent 4: `agent004` / `secure_password_004`

---

## 📱 Setup Mobile App

### Initialize Mobile App

```bash
cd /Users/soft-touch/Desktop/project/callcenter/mobile-app

# Run the quick start script
./QUICK_START.sh

cd ministry-call-center
```

### Configure Mobile App

Create `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  // Use your ngrok backend URL
  baseURL: 'https://YOUR-BACKEND-URL.ngrok-free.app',
  
  // WebRTC configuration
  webrtc: {
    wsServer: 'wss://YOUR-ASTERISK-IP:8089/ws',
    sipUri: 'sip:webrtc_user@your-domain.com',
    password: 'mobile_user_password',
    displayName: 'Mobile User'
  },
  
  // Main hotline number (will be routed through IVR)
  hotlineExtension: '1000' // This goes to IVR
};
```

### Create Mobile Calling Screen

Create `src/screens/CallScreen.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { WebRTCClient } from '../services/webrtc.service';
import { API_CONFIG } from '../config/api';

export const CallScreen = () => {
  const [client, setClient] = useState<WebRTCClient | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedIVR, setSelectedIVR] = useState<string | null>(null);

  useEffect(() => {
    initializeWebRTC();
    
    return () => {
      client?.unregister();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isInCall]);

  const initializeWebRTC = async () => {
    try {
      const webrtcClient = new WebRTCClient(API_CONFIG.webrtc);
      await webrtcClient.register();
      setClient(webrtcClient);
      setIsRegistered(true);
      Alert.alert('Success', 'WebRTC registered successfully');
    } catch (error) {
      Alert.alert('Error', `Failed to register: ${error.message}`);
    }
  };

  const makeCall = async () => {
    if (!client || !isRegistered) {
      Alert.alert('Error', 'Not registered');
      return;
    }

    try {
      await client.makeCall(API_CONFIG.hotlineExtension, {
        onConnecting: () => console.log('Connecting...'),
        onConnected: () => {
          setIsInCall(true);
          setCallDuration(0);
          Alert.alert('Connected', 'Call connected! Listen for IVR menu.');
        },
        onEnded: () => {
          setIsInCall(false);
          setSelectedIVR(null);
          Alert.alert('Call Ended', 'Call has ended');
        },
        onFailed: (cause) => {
          setIsInCall(false);
          Alert.alert('Call Failed', cause);
        }
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const sendIVROption = (option: string) => {
    if (!client) return;
    
    client.sendDTMF(option);
    setSelectedIVR(option);
    
    const labels = {
      '1': 'Exam Inquiries',
      '2': 'Teacher Complaints',
      '3': 'Facilities',
      '4': 'Other Services'
    };
    
    Alert.alert('IVR Selection', `Selected: ${labels[option]}`);
  };

  const hangup = () => {
    client?.hangup();
    setIsInCall(false);
    setSelectedIVR(null);
  };

  const toggleMute = () => {
    const isMuted = client?.toggleMute();
    Alert.alert('Mute', isMuted ? 'Muted' : 'Unmuted');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ministry of Education</Text>
      <Text style={styles.subtitle}>Call Center</Text>

      {isRegistered && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✅ Registered</Text>
        </View>
      )}

      {!isInCall ? (
        <View style={styles.dialSection}>
          <Text style={styles.label}>Call Ministry Hotline</Text>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={makeCall}
            disabled={!isRegistered}
          >
            <Text style={styles.callButtonText}>📞 Call Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.activeCallSection}>
          <Text style={styles.callStatus}>📞 Call Active</Text>
          <Text style={styles.duration}>{formatDuration(callDuration)}</Text>

          {!selectedIVR && (
            <>
              <Text style={styles.ivrPrompt}>Select Service:</Text>
              <View style={styles.ivrButtons}>
                <Button mode="contained" onPress={() => sendIVROption('1')}>
                  1. Exams
                </Button>
                <Button mode="contained" onPress={() => sendIVROption('2')}>
                  2. Teachers
                </Button>
                <Button mode="contained" onPress={() => sendIVROption('3')}>
                  3. Facilities
                </Button>
                <Button mode="contained" onPress={() => sendIVROption('4')}>
                  4. Other
                </Button>
              </View>
            </>
          )}

          {selectedIVR && (
            <View style={styles.queueInfo}>
              <Text style={styles.queueText}>
                ⏳ In Queue - Waiting for Agent
              </Text>
              <Text style={styles.queueSubtext}>
                You selected option {selectedIVR}
              </Text>
            </View>
          )}

          <View style={styles.callControls}>
            <IconButton icon="microphone-off" size={30} onPress={toggleMute} />
            <IconButton 
              icon="phone-hangup" 
              size={40} 
              style={styles.hangupButton}
              onPress={hangup} 
            />
          </View>
        </View>
      )}

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>How it works:</Text>
        <Text style={styles.helpText}>1. Tap "Call Now"</Text>
        <Text style={styles.helpText}>2. Listen to IVR menu</Text>
        <Text style={styles.helpText}>3. Select service (1-4)</Text>
        <Text style={styles.helpText}>4. Wait for agent to answer</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dialSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 20,
  },
  callButton: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 50,
    width: 200,
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  activeCallSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callStatus: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  duration: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 30,
  },
  ivrPrompt: {
    fontSize: 18,
    marginBottom: 10,
  },
  ivrButtons: {
    gap: 10,
    marginBottom: 30,
  },
  queueInfo: {
    backgroundColor: '#FFF3CD',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  queueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
  },
  queueSubtext: {
    fontSize: 14,
    color: '#856404',
    marginTop: 5,
  },
  callControls: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  hangupButton: {
    backgroundColor: '#F44336',
  },
  helpSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
```

### Start Mobile App

```bash
# In mobile-app/ministry-call-center directory
npm start

# Scan QR code with Expo Go app on your phone
# Or press 'i' for iOS simulator
# Or press 'a' for Android emulator
```

---

## 🧪 Testing the Complete Flow

### Test Scenario 1: Single Agent Picks Up

**Setup:**
- 1 Agent logged in (Agent 1)
- Mobile user calls

**Steps:**
1. **Mobile**: Tap "Call Now"
2. **Mobile**: Hear IVR menu (simulated)
3. **Mobile**: Press "1" (Exam Inquiries)
4. **Agent 1**: Browser shows incoming call notification
5. **Agent 1**: Click "Answer"
6. **Both**: Call connected! ✅
7. **Test**: Talk to verify audio works both ways
8. **Agent 1**: Click "Hang Up" to end call

**Expected Result:**
- ✅ Call connects to Agent 1
- ✅ Audio works both ways
- ✅ Call ends cleanly

### Test Scenario 2: Multiple Agents (Ring All)

**Setup:**
- 4 Agents logged in (Agent 1, 2, 3, 4)
- Queue strategy: `ringall`

**Steps:**
1. **Mobile**: Make call, select IVR option 1
2. **All Agents**: See incoming call (all ringing)
3. **Agent 2**: Answers first
4. **Other Agents**: Call disappears
5. **Agent 2 & Mobile**: Connected ✅

**Expected Result:**
- ✅ All agents ring
- ✅ First to answer gets the call
- ✅ Other agents stop ringing

### Test Scenario 3: Queue with Wait Time

**Setup:**
- All agents busy
- Mobile user calls

**Steps:**
1. **Mobile**: Make call, select IVR option
2. **Mobile**: Placed in queue, hear hold music
3. **Mobile**: Wait for agent to become available
4. **Agent 1**: Finishes current call
5. **Agent 1**: Automatically gets next call from queue
6. **Agent 1 & Mobile**: Connected ✅

**Expected Result:**
- ✅ Caller waits in queue
- ✅ Automatic distribution when agent available
- ✅ Call connects when agent free

### Test Scenario 4: No Agents Available

**Setup:**
- No agents logged in
- Mobile user calls

**Steps:**
1. **Mobile**: Make call, select IVR option
2. **System**: Queue timeout after 300 seconds
3. **System**: Route to voicemail
4. **Mobile**: Hear voicemail prompt
5. **Mobile**: Leave message

**Expected Result:**
- ✅ Queue timeout triggers
- ✅ Voicemail system activated
- ✅ Message recorded

---

## 📊 Testing Matrix

| Test Case | Agents Available | Expected Result | Status |
|-----------|------------------|-----------------|--------|
| 1 agent, 1 call | Agent 1 | Agent 1 answers | ⬜ |
| 4 agents, 1 call | All 4 | First available answers | ⬜ |
| 2 agents, 3 calls | Agent 1, 2 | 2 connected, 1 in queue | ⬜ |
| No agents | None | Voicemail after timeout | ⬜ |
| IVR option 1 | Agent 1 | Routes to exam queue | ⬜ |
| IVR option 2 | Agent 3 | Routes to teacher queue | ⬜ |
| Call transfer | Agent 1 → 2 | Transfer successful | ⬜ |
| Call hold | Agent 1 | Hold music plays | ⬜ |
| Mute test | Both | Audio mutes correctly | ⬜ |
| Hang up test | Either | Call ends cleanly | ⬜ |

---

## 🔍 Monitoring & Debugging

### Check Agent Registration Status

```bash
# Asterisk CLI
docker exec -it asterisk asterisk -rx "pjsip show endpoints"

# Should show:
# agent001  registered
# agent002  registered
# agent003  registered
# agent004  registered
```

### Check Queue Status

```bash
# Check queue members
docker exec -it asterisk asterisk -rx "queue show exam_queue"

# Check active calls
docker exec -it asterisk asterisk -rx "core show channels"
```

### Check WebRTC Connections

```bash
# Check WebSocket connections
docker exec -it asterisk asterisk -rx "http show status"
```

### Browser Console Debugging

In each agent's browser console:
```javascript
// Check SIP registration
console.log(agent1Client.ua.isRegistered());

// Check call state
console.log(agent1Client.isInCall());

// Monitor WebRTC events
JsSIP.debug.enable('JsSIP:*');
```

### Mobile App Debugging

In Expo:
- Shake device to open developer menu
- Select "Debug Remote JS"
- Check browser console for logs

---

## 📈 Success Metrics

After testing, you should achieve:

✅ **Registration Success Rate**: 100% (all agents register)  
✅ **Call Connection Rate**: >95%  
✅ **Audio Quality**: Clear both ways  
✅ **Queue Distribution**: Fair distribution among agents  
✅ **IVR Selection**: Correct routing per option  
✅ **Transfer Success**: >90%  
✅ **Average Answer Time**: <30 seconds  

---

## 🐛 Common Issues & Solutions

### Issue: Agent Can't Register

**Symptoms**: "Registration failed" error

**Solutions**:
1. Check WebSocket URL is correct
2. Verify Asterisk is running
3. Check PJSIP credentials match
4. Ensure port 8089 is open
5. Check SSL certificate is valid

### Issue: No Audio

**Symptoms**: Call connects but no audio

**Solutions**:
1. Check microphone permissions granted
2. Verify ICE/STUN servers configured
3. Check firewall allows WebRTC ports
4. Test with headphones (avoid echo)
5. Check browser console for errors

### Issue: Call Doesn't Ring Agents

**Symptoms**: Mobile calls but agents don't see it

**Solutions**:
1. Verify queue configuration
2. Check agents are queue members
3. Ensure IVR routes to correct queue
4. Check dialplan syntax
5. Review Asterisk logs

### Issue: Mobile App Won't Connect

**Symptoms**: "Failed to register" on mobile

**Solutions**:
1. Ensure using HTTPS (ngrok URL)
2. Check API_CONFIG has correct URLs
3. Verify network connection
4. Check ngrok tunnels are running
5. Test on web first, then mobile

---

## 🎉 Next Steps After Successful Testing

Once testing is complete:

1. **Document Results**: Fill in testing matrix
2. **Optimize Queue Strategy**: Adjust based on performance
3. **Add More Agents**: Scale to production team size
4. **Configure TURN Server**: For better NAT traversal
5. **Set Up Monitoring**: Real-time dashboard
6. **Record Calls**: Enable call recording
7. **Deploy to Production**: Move from ngrok to proper hosting

---

## 📞 Production Deployment Checklist

- [ ] Get production domain with SSL
- [ ] Configure STUN/TURN servers
- [ ] Set up call recording storage
- [ ] Implement queue callbacks
- [ ] Add supervisor monitoring
- [ ] Configure call analytics
- [ ] Set up alerts for system issues
- [ ] Train agents on system
- [ ] Create user documentation
- [ ] Set up backup Asterisk server

---

## 🆘 Need Help?

If you encounter issues:

1. Check Asterisk logs: `docker logs asterisk`
2. Check backend logs: Terminal where backend is running
3. Check browser console: F12 in agent browsers
4. Check mobile logs: Expo debugger
5. Review configuration files
6. Verify all services are running
7. Test each component individually

---

**You're ready to test mobile-to-agent calling!** 🚀

Start with Step 1 (ngrok authentication) and work through each step systematically.
