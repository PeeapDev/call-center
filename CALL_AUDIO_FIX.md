# Call Audio & Call State Issues - COMPLETE FIX

## Issues Identified:

1. ✅ **Call connects but no audio** - WebRTC/Media configuration
2. ✅ **Call state shows "waiting" after answering** - Frontend state management
3. ✅ **Calls not logged** - Database logging missing
4. ✅ **No recordings** - Call recording not enabled

---

## ISSUE 1: No Audio in Calls

### Root Cause:
**WebRTC audio requires proper Asterisk PJSIP configuration**

Your current `asterisk-config/pjsip.conf` needs WebRTC-specific settings:
- DTLS (encrypted media)
- SRTP (secure RTP)
- ICE (NAT traversal)
- WebSocket transport
- Proper codecs (opus, ulaw)

### The Fix:

#### Update `asterisk-config/pjsip.conf`:

```conf
[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:8089
external_media_address=YOUR_PUBLIC_IP
external_signaling_address=YOUR_PUBLIC_IP

[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060

; WebRTC endpoint template
[webrtc_endpoint](!)
type=endpoint
context=from-internal
transport=transport-wss
aors=${EXTEN}
auth=${EXTEN}
use_avpf=yes
force_avp=no
media_encryption=dtls
dtls_auto_generate_cert=yes
dtls_verify=fingerprint
dtls_setup=actpass
ice_support=yes
media_use_received_transport=no
rtcp_mux=yes
allow=!all,opus,ulaw,alaw
webrtc=yes
direct_media=no
rtp_symmetric=yes
rewrite_contact=yes

; AOR template
[webrtc_aor](!)
type=aor
max_contacts=5
remove_existing=yes

; Auth template  
[webrtc_auth](!)
type=auth
auth_type=userpass

; Example WebRTC agents
[1001](webrtc_endpoint)
[1001](webrtc_aor)
[1001](webrtc_auth)
password=agent1001pass

[1002](webrtc_endpoint)
[1002](webrtc_aor)
[1002](webrtc_auth)
password=agent1002pass
```

#### Update `asterisk-config/http.conf`:

```conf
[general]
enabled=yes
bindaddr=0.0.0.0
bindport=8088

; Enable WebSocket for WebRTC
enablestatic=yes
redirect=/index.html

; TLS settings (required for secure WebSocket)
tlsenable=yes
tlsbindaddr=0.0.0.0:8089
tlscertfile=/etc/asterisk/keys/asterisk.pem
tlsprivatekey=/etc/asterisk/keys/asterisk.key
```

#### Update `asterisk-config/extensions.conf`:

```conf
[from-internal]

; Hotline - Emergency number
exten => 117,1,NoOp(Emergency Hotline Call)
  same => n,Answer()
  same => n,Stasis(callcenter,117)
  same => n,Hangup()

; Echo test for WebRTC
exten => 999,1,NoOp(Echo Test)
  same => n,Answer()
  same => n,Wait(1)
  same => n,Playback(demo-echotest)
  same => n,Echo()
  same => n,Hangup()

; Recording context
[recording]
exten => _X.,1,NoOp(Recording Call: ${EXTEN})
  same => n,MixMonitor(/var/spool/asterisk/monitor/${UNIQUEID}.wav)
  same => n,Dial(PJSIP/${EXTEN})
  same => n,Hangup()
```

### Restart Asterisk:

```bash
docker compose -f docker-compose.asterisk.yml down
docker compose -f docker-compose.asterisk.yml up -d

# Check if WebSocket is working
docker logs -f callcenter-asterisk | grep -i websocket
```

---

## ISSUE 2: Call State Shows "Waiting" After Answering

### Root Cause:
Frontend not updating call state when agent answers

### The Fix:

The issue is in the call state management. When an agent answers a call, the backend sends a WebSocket event, but the frontend might not be updating the UI.

#### Check WebSocket Events:

In your browser console, you should see:
```
WebSocket message: {"type":"call_answered","callId":"...","agentId":"..."}
```

If you don't see this, the WebSocket connection is broken.

#### Fix Frontend Call State:

The call component should listen for `call_answered` events and update state to `"talking"`.

Check: `frontend/src/components/AgentCallInterface.tsx` or wherever call state is managed.

---

## ISSUE 3: Calls Not Being Logged

### Root Cause:
Backend not saving call records to database

### The Fix:

Need to ensure the backend saves call records when:
1. Call is initiated
2. Call is answered
3. Call ends

#### Check Backend Call Service:

The `CallsService` should save to database:

```typescript
// When call starts
const call = this.callRepository.create({
  callId: uniqueCallId,
  callerNumber,
  dialedNumber,
  startTime: new Date(),
  status: 'ringing',
});
await this.callRepository.save(call);

// When call answers
call.status = 'talking';
call.answeredTime = new Date();
call.agentId = agentId;
await this.callRepository.save(call);

// When call ends
call.status = 'completed';
call.endTime = new Date();
call.duration = (endTime - startTime) / 1000;
await this.callRepository.save(call);
```

---

## ISSUE 4: Call Recording Not Working

### Root Cause:
Asterisk not configured to record calls

### The Fix:

#### 1. Enable MixMonitor in Dialplan:

In `asterisk-config/extensions.conf`, add recording:

```conf
[from-internal]
exten => 117,1,NoOp(Emergency Hotline Call)
  same => n,Answer()
  ; Start recording BEFORE Stasis
  same => n,Set(MIXMONITOR_FILENAME=${UNIQUEID}.wav)
  same => n,MixMonitor(/var/spool/asterisk/monitor/${MIXMONITOR_FILENAME},b)
  same => n,Stasis(callcenter,117)
  same => n,StopMixMonitor()
  same => n,Hangup()
```

#### 2. Enable Recording in ARI:

When a call is answered via ARI, tell Asterisk to start recording:

```javascript
// In backend when call connects to agent
await asteriskARI.channels.record({
  channelId: callChannelId,
  name: `recording-${callId}`,
  format: 'wav',
  maxDurationSeconds: 3600,
  ifExists: 'overwrite',
});
```

#### 3. Mount Recording Directory in Docker:

Update `docker-compose.asterisk.yml`:

```yaml
services:
  asterisk:
    image: andrius/asterisk:21
    volumes:
      - ./asterisk-config:/etc/asterisk
      - ./asterisk-recordings:/var/spool/asterisk/monitor  # ADD THIS
    ports:
      - "5060:5060/udp"
      - "8088:8088"
      - "8089:8089"
      - "10000-10100:10000-10100/udp"
```

Create the directory:
```bash
mkdir -p asterisk-recordings
chmod 777 asterisk-recordings
```

Now recordings will be saved to `./asterisk-recordings/` on your host machine!

---

## ISSUE 5: Flow Builder - Edit & Save

### Backend APIs (Already Exist):

```
GET  /flow-builder/active             - Get current active flow
POST /flow-builder/active/:templateId - Set flow as active/default
GET  /flow-builder/templates          - Get all templates
POST /flow-builder/custom             - Create new custom flow
PUT  /flow-builder/custom/:id         - Update existing flow
POST /flow-builder/validate           - Validate flow before saving
```

### Frontend Flow Builder:

The visual flow builder you have needs to connect to these APIs.

**To Edit Default Flow**:
1. Load active flow: `GET /flow-builder/active`
2. Make changes in visual editor
3. Validate: `POST /flow-builder/validate`
4. Save as custom flow: `POST /flow-builder/custom`
5. Set as active: `POST /flow-builder/active/your-custom-flow-id`

**The default flow IS active** - you just need to create a copy, edit it, and set it as active.

---

## COMPLETE TEST PROCEDURE:

### Step 1: Update Asterisk Config

```bash
# Stop Asterisk
docker compose -f docker-compose.asterisk.yml down

# Update pjsip.conf, http.conf, extensions.conf as shown above

# Create recordings directory
mkdir -p asterisk-recordings
chmod 777 asterisk-recordings

# Update docker-compose.asterisk.yml to mount recordings

# Start Asterisk
docker compose -f docker-compose.asterisk.yml up -d

# Check logs
docker logs -f callcenter-asterisk
```

### Step 2: Restart Backend

```bash
cd backend
npm run start:dev

# Look for:
# ✓ Asterisk ARI Connected
# ✓ WebSocket Server Started
```

### Step 3: Test WebRTC Audio

1. **Agent Setup**:
   - Login as agent
   - Go to WebRTC Setup page
   - Copy SIP credentials
   - Register WebRTC phone

2. **Make Test Call**:
   - Citizen dials 117
   - Call routes through flow
   - Agent sees incoming call
   - Agent clicks "Answer"

3. **Check Audio**:
   - Agent should hear citizen
   - Citizen should hear agent
   - Check browser console for errors

4. **Check Recording**:
   - After call ends
   - Check `./asterisk-recordings/` folder
   - Should see `.wav` file
   - Go to `/dashboard/recordings`
   - Should see the call listed

### Step 4: Check Call Logs

```bash
# After call ends, check database
# Should have record in calls table with:
# - callId
# - callerNumber
# - agentId
# - startTime, answeredTime, endTime
# - duration
# - recordingUrl
```

---

## Browser Permissions Checklist:

For WebRTC to work, browser needs:

✅ Microphone permission  
✅ HTTPS or localhost (WebRTC requires secure context)  
✅ Modern browser (Chrome, Firefox, Edge, Safari)  
✅ No firewall blocking WebSocket (port 8089)

---

## Quick Debug Commands:

```bash
# Check if Asterisk is running
docker ps | grep asterisk

# Check Asterisk logs
docker logs -f callcenter-asterisk

# Check for WebSocket connections
docker exec -it callcenter-asterisk asterisk -rx "pjsip show endpoints"

# Check active calls
docker exec -it callcenter-asterisk asterisk -rx "core show channels"

# Check recordings
ls -lah ./asterisk-recordings/

# Test echo
# Dial 999 and you should hear your own voice
```

---

## Summary of What Was Fixed:

1. ✅ **Recordings Page** - Removed mock data, connected to real API
2. ⏳ **Audio Issue** - Needs Asterisk WebRTC config update
3. ⏳ **Call State** - Need to check WebSocket event handling
4. ⏳ **Call Logs** - Need to verify backend saves to DB
5. ⏳ **Recordings** - Need to enable MixMonitor in Asterisk
6. ✅ **Flow Builder** - APIs exist, can create/edit/set active flows

---

## Next Steps:

1. Update Asterisk config files as shown above
2. Restart Asterisk Docker container
3. Restart backend
4. Test call with audio
5. Check if recording saves
6. Check if call log appears in database

**All configuration files ready to update!**

Let me know if you want me to create the updated config files for you.
