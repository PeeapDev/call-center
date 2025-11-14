# Complete IVR Setup Guide - Ministry of Education

## 🎤 IVR (Interactive Voice Response) Setup

---

## 📋 Overview

Your IVR menu will greet callers and route them based on their selection:

```
Incoming Call
    ↓
Time Check (Business Hours?)
    ↓
IVR Menu: "Thank you for calling Ministry of Education..."
    ↓
Press 1: Exam Inquiries → exam_queue
Press 2: Teacher Complaints → teacher_queue  
Press 3: Facilities → facilities_queue
Press 4: Other Services → general_queue
Press 0: Speak to Operator
```

---

## 🔧 Step 1: Create Voice Prompts

### **Option A: Text-to-Speech (Quick Start)**

Use online TTS services to create voice prompts:

**Tools:**
- https://www.naturalreaders.com
- https://ttsreader.com
- https://www.text2speech.org
- Google Cloud Text-to-Speech

### **Script for Main Menu**

```
Thank you for calling the Ministry of Education Sierra Leone.

For Exam Inquiries and Results, press 1.
For Teacher Complaints and Issues, press 2.
For School Facilities and Infrastructure, press 3.
For other services, press 4.
To speak with an operator, press 0.
```

### **Script for After Hours**

```
Thank you for calling the Ministry of Education.
Our office hours are Monday to Friday, 9 AM to 5 PM.
Please leave a message after the tone, and we will return your call.
```

### **Script for Please Wait**

```
Please wait while we connect you to an available agent.
```

### **Convert to Audio Files**

1. Generate MP3 files from TTS
2. Convert to proper format:

```bash
# Install sox if needed
brew install sox

# Convert to Asterisk format (8kHz, mono, gsm)
sox main-menu.mp3 -r 8000 -c 1 main-menu.gsm

# Or use WAV format
sox main-menu.mp3 -r 8000 -c 1 main-menu.wav
```

### **Place Audio Files**

```bash
# Copy to Asterisk sounds directory
cp *.gsm /Users/soft-touch/Desktop/project/callcenter/docker/asterisk/sounds/custom/
# or
cp *.wav /Users/soft-touch/Desktop/project/callcenter/docker/asterisk/sounds/custom/
```

---

## 🔧 Step 2: Configure Asterisk IVR

### **Create IVR Dialplan**

Edit: `/Users/soft-touch/Desktop/project/callcenter/docker/asterisk/conf/extensions.conf`

```ini
[from-external]
; Main entry point for incoming calls
exten => _X.,1,NoOp(Incoming call from ${CALLERID(num)})
same => n,Set(CHANNEL(language)=en)
same => n,Goto(time-check,s,1)

[time-check]
; Check if within business hours
exten => s,1,NoOp(Checking business hours)
same => n,GotoIfTime(09:00-17:00,mon-fri,*,*?ivr-main,s,1)
same => n,Goto(ivr-after-hours,s,1)

[ivr-main]
; Main IVR menu
exten => s,1,NoOp(Main IVR Menu)
same => n,Answer()
same => n,Wait(1)
same => n,Set(TIMEOUT(digit)=5)
same => n,Set(TIMEOUT(response)=10)
same => n,Set(__IVR_LEVEL=1)
same => n(menu),Background(custom/main-menu)
same => n,WaitExten(10)
same => n,Playback(invalid)
same => n,Goto(menu)

; Option 1: Exam Inquiries
exten => 1,1,NoOp(Exam Inquiries - Option 1)
same => n,Set(IVR_SELECTION=1)
same => n,Playback(custom/please-wait)
same => n,Set(QUEUE_PRIO=5)
same => n,Queue(exam_queue,tT,,,300,,,exam-wrapper)
same => n,Voicemail(100@ministry,u)
same => n,Hangup()

; Option 2: Teacher Complaints
exten => 2,1,NoOp(Teacher Complaints - Option 2)
same => n,Set(IVR_SELECTION=2)
same => n,Playback(custom/please-wait)
same => n,Set(QUEUE_PRIO=4)
same => n,Queue(teacher_queue,tT,,,300,,,teacher-wrapper)
same => n,Voicemail(101@ministry,u)
same => n,Hangup()

; Option 3: Facilities
exten => 3,1,NoOp(Facilities - Option 3)
same => n,Set(IVR_SELECTION=3)
same => n,Playback(custom/please-wait)
same => n,Set(QUEUE_PRIO=3)
same => n,Queue(facilities_queue,tT,,,300,,,facilities-wrapper)
same => n,Voicemail(102@ministry,u)
same => n,Hangup()

; Option 4: Other Services
exten => 4,1,NoOp(Other Services - Option 4)
same => n,Set(IVR_SELECTION=4)
same => n,Playback(custom/please-wait)
same => n,Set(QUEUE_PRIO=2)
same => n,Queue(general_queue,tT,,,300,,,general-wrapper)
same => n,Voicemail(103@ministry,u)
same => n,Hangup()

; Option 0: Operator
exten => 0,1,NoOp(Operator)
same => n,Set(IVR_SELECTION=0)
same => n,Playback(custom/please-wait)
same => n,Dial(SIP/operator,30,tT)
same => n,Voicemail(100@ministry,u)
same => n,Hangup()

; Invalid option
exten => i,1,Playback(invalid)
same => n,Goto(s,menu)

; Timeout
exten => t,1,Playback(custom/goodbye)
same => n,Hangup()

[ivr-after-hours]
; After hours message and voicemail
exten => s,1,NoOp(After Hours)
same => n,Answer()
same => n,Wait(1)
same => n,Playback(custom/after-hours)
same => n,Voicemail(100@ministry,u)
same => n,Hangup()

[exam-wrapper]
; Context for exam queue calls
exten => s,1,NoOp(Exam Call Wrapper)
same => n,Set(CALLERID(name)=Exam Dept)
same => n,Return()

[teacher-wrapper]
; Context for teacher queue calls
exten => s,1,NoOp(Teacher Call Wrapper)
same => n,Set(CALLERID(name)=Teacher Dept)
same => n,Return()

[facilities-wrapper]
; Context for facilities queue calls
exten => s,1,NoOp(Facilities Call Wrapper)
same => n,Set(CALLERID(name)=Facilities Dept)
same => n,Return()

[general-wrapper]
; Context for general queue calls
exten => s,1,NoOp(General Call Wrapper)
same => n,Set(CALLERID(name)=General Dept)
same => n,Return()
```

---

## 🔧 Step 3: Configure Queues

Edit: `/Users/soft-touch/Desktop/project/callcenter/docker/asterisk/conf/queues.conf`

```ini
[general]
persistentmembers = yes
monitor-type = MixMonitor
monitor-format = wav

[exam_queue]
strategy = ringall
timeout = 30
retry = 5
maxlen = 50
announce = custom/exam-announce
announce-frequency = 60
announce-holdtime = yes
announce-position = yes
periodic-announce = custom/please-hold
periodic-announce-frequency = 30
musicclass = default
member => SIP/agent001
member => SIP/agent002

[teacher_queue]
strategy = rrmemory
timeout = 30
retry = 5
maxlen = 50
announce = custom/teacher-announce
announce-frequency = 60
announce-holdtime = yes
musicclass = default
member => SIP/agent003
member => SIP/agent004

[facilities_queue]
strategy = leastrecent
timeout = 30
retry = 5
maxlen = 50
announce = custom/facilities-announce
announce-frequency = 60
musicclass = default
member => SIP/agent005
member => SIP/agent006

[general_queue]
strategy = random
timeout = 30
retry = 5
maxlen = 50
announce = custom/general-announce
announce-frequency = 60
musicclass = default
member => SIP/agent007
member => SIP/agent008
```

---

## 🔧 Step 4: Configure Voicemail

Edit: `/Users/soft-touch/Desktop/project/callcenter/docker/asterisk/conf/voicemail.conf`

```ini
[general]
format = wav49|gsm|wav
maxmessage = 180
maxgreet = 60
skipms = 3000
maxsilence = 10
silencethreshold = 128
emaildateformat = %A, %B %d, %Y at %r

[ministry]
100 => 1234,Exam Department,exam@education.gov.sl
101 => 1234,Teacher Department,teacher@education.gov.sl
102 => 1234,Facilities Department,facilities@education.gov.sl
103 => 1234,General Inquiries,general@education.gov.sl
```

---

## 🔧 Step 5: Configure SIP Accounts

Edit: `/Users/soft-touch/Desktop/project/callcenter/docker/asterisk/conf/pjsip.conf`

```ini
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0

[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:8089

; Agent SIP accounts
[agent001]
type=endpoint
context=agents
disallow=all
allow=ulaw
allow=alaw
auth=agent001
aors=agent001

[agent001]
type=auth
auth_type=userpass
password=secure_password_001
username=agent001

[agent001]
type=aor
max_contacts=1

; Repeat for agent002, agent003, etc...

[operator]
type=endpoint
context=agents
disallow=all
allow=ulaw
allow=alaw
auth=operator
aors=operator

[operator]
type=auth
auth_type=userpass
password=operator_password
username=operator

[operator]
type=aor
max_contacts=1
```

---

## 🔧 Step 6: Test IVR

### **Method 1: CLI Testing**

```bash
# Connect to Asterisk console
docker exec -it asterisk asterisk -r

# Test dialplan
dialplan show ivr-main

# Originate test call
channel originate Local/s@ivr-main application Playback demo-congrats

# Check queue status
queue show exam_queue

# Exit console
exit
```

### **Method 2: SIP Phone Testing**

1. Install softphone (Zoiper, X-Lite, MicroSIP)
2. Configure with agent credentials
3. Dial the IVR extension
4. Test menu options

### **Method 3: WebRTC Testing**

```javascript
// Test from frontend
const testIVR = async () => {
  const response = await fetch('http://localhost:3001/routing/simulate', {
    method: 'GET',
    params: {
      callerNumber: '+23277123456',
      ivrOption: '1',
      currentTime: '10:00'
    }
  });
  
  console.log(await response.json());
};
```

---

## 📊 Step 7: Monitor IVR Performance

### **Asterisk CLI Commands**

```bash
# Show active calls
core show channels

# Show queue statistics
queue show

# Show specific queue
queue show exam_queue

# Reload dialplan
dialplan reload

# Reload queues
queue reload

# Show channel variables
core show channel CHANNEL_NAME
```

### **Log Files**

```bash
# View call logs
tail -f /var/log/asterisk/full

# View queue logs
tail -f /var/log/asterisk/queue_log

# View messages
tail -f /var/log/asterisk/messages
```

---

## 🎨 Optional: Advanced IVR Features

### **Multi-Level IVR**

```ini
[ivr-exam-submenu]
exten => s,1,NoOp(Exam Submenu)
same => n,Background(custom/exam-submenu)
same => n,WaitExten(10)

exten => 1,1,Goto(exam-results,s,1)
exten => 2,1,Goto(exam-schedule,s,1)
exten => 9,1,Goto(ivr-main,s,1)  ; Return to main menu
```

### **Callback Option**

```ini
exten => 5,1,NoOp(Callback Request)
same => n,Playback(custom/callback-request)
same => n,Read(callback_number,custom/enter-number,10)
same => n,System(echo "${CALLERID(num)},${callback_number}" >> /tmp/callbacks.txt)
same => n,Playback(custom/callback-confirmed)
same => n,Hangup()
```

### **Language Selection**

```ini
[ivr-language]
exten => s,1,NoOp(Language Selection)
same => n,Background(custom/language-select)
same => n,WaitExten(10)

exten => 1,1,Set(CHANNEL(language)=en)
same => n,Goto(ivr-main,s,1)

exten => 2,1,Set(CHANNEL(language)=krio)
same => n,Goto(ivr-main,s,1)
```

---

## 📝 Voice Prompt Scripts (Professional)

### **Main Menu (English)**

```
"Thank you for calling the Ministry of Education Sierra Leone.

Your call is important to us.

For exam inquiries, results, and certification, press 1.
For teacher registration, complaints, and welfare, press 2.
For school facilities, infrastructure, and maintenance, press 3.
For all other services, press 4.
To speak with an operator, press 0.

To hear this menu again, please stay on the line."
```

### **Main Menu (Krio)**

```
"Tenki fo kol di Ministry of Education Sierra Leone.

Una kol impotant to wi.

Fo exam tins, rizolt, en satifiket, pres 1.
Fo ticha rijistreshon, komplent, en welfea, pres 2.
Fo skul fasiliti, infrastrokchor, en mentinens, pres 3.
Fo oda savis dem, pres 4.
Fo tok to operator, pres 0."
```

### **After Hours**

```
"Thank you for calling the Ministry of Education.

Our office hours are Monday through Friday, 9:00 AM to 5:00 PM.

Please leave your name, contact number, and a brief message after the tone.
We will return your call during our next business day.

Thank you."
```

### **Queue Announcements**

```
"Your call is being connected to the Exam Department.
Current wait time is approximately [X] minutes.
Thank you for your patience."
```

---

## 🚀 Quick Start Commands

```bash
# 1. Create sounds directory
mkdir -p /Users/soft-touch/Desktop/project/callcenter/docker/asterisk/sounds/custom

# 2. Generate voice prompts (use TTS website)
# Download as MP3

# 3. Convert to Asterisk format
cd /path/to/downloaded/prompts
sox main-menu.mp3 -r 8000 -c 1 main-menu.gsm

# 4. Copy to Asterisk
cp *.gsm /Users/soft-touch/Desktop/project/callcenter/docker/asterisk/sounds/custom/

# 5. Restart Asterisk
docker restart asterisk

# 6. Test IVR
docker exec -it asterisk asterisk -r
dialplan show ivr-main
```

---

## ✅ Testing Checklist

- [ ] Voice prompts created and converted
- [ ] Files copied to Asterisk sounds directory
- [ ] Extensions.conf configured
- [ ] Queues.conf configured
- [ ] Voicemail.conf configured
- [ ] PJSIP.conf configured with agents
- [ ] Asterisk restarted
- [ ] Dialplan loaded (no errors)
- [ ] Test call placed
- [ ] All menu options work
- [ ] Queue routing works
- [ ] Voicemail records properly
- [ ] After hours message plays
- [ ] Recordings audible and clear

---

## 🆘 Troubleshooting

### **Problem: "File not found" error**
```bash
# Check if file exists
ls -la /Users/soft-touch/Desktop/project/callcenter/docker/asterisk/sounds/custom/

# Check file format
file main-menu.gsm

# Regenerate with correct format
sox main-menu.mp3 -r 8000 -c 1 -e gsm main-menu.gsm
```

### **Problem: Menu doesn't work**
```bash
# Check dialplan syntax
docker exec asterisk asterisk -x "dialplan show ivr-main"

# Reload dialplan
docker exec asterisk asterisk -x "dialplan reload"

# Check for errors
docker logs asterisk
```

### **Problem: No agents in queue**
```bash
# Add agent dynamically
docker exec asterisk asterisk -x "queue add member SIP/agent001 to exam_queue"

# Check queue members
docker exec asterisk asterisk -x "queue show exam_queue"
```

---

## 🎉 Your IVR is Ready!

Call flow:
1. Incoming call → Time check
2. If business hours → Main IVR menu
3. Press option → Route to queue
4. Agent answers → Call connected
5. If no answer → Voicemail

**Test now by simulating calls through the routing API!** 📞
