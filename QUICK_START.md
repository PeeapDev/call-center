# 🚀 QUICK START - Call Center System

## ✅ SYSTEM IS NOW RUNNING!

All services are active and ready to use!

---

## 🌐 ACCESS YOUR APP

### **From Your Computer:**
```
http://localhost:3000
```
Click the browser preview button above or open any browser!

### **From Your Phone/Tablet (Same WiFi):**
```
http://192.168.1.241:3000
```

### **From Another Computer (Same WiFi):**
```
http://192.168.1.241:3000
```

---

## 🔑 LOGIN CREDENTIALS

### **Admin (Full Access):**
```
Email: admin@education.gov
Password: admin123
```

### **Test Citizen:**
```
Email: citizen@example.com
Password: citizen123
```

### **Test Agent:**
```
Email: agent@example.com
Password: agent123
```

---

## 🖥️ RUNNING SERVICES

### **Backend** ✅
```
Port: 3001
Local: http://localhost:3001
Public: https://rhett-yearlong-gregory.ngrok-free.dev
Status: RUNNING
```

### **Frontend** ✅
```
Port: 3000
Local: http://localhost:3000
Network: http://192.168.1.241:3000
Status: RUNNING
```

### **Ngrok Tunnel** ✅
```
Backend: https://rhett-yearlong-gregory.ngrok-free.dev
Inspector: http://localhost:4040
Status: ACTIVE
```

---

## ⚠️ IMPORTANT: KEEP TERMINALS OPEN!

You need **3 terminal windows** running:

### **Terminal 1: Backend**
```bash
cd backend
npm run start:dev
```
**Keep this running!** ✅ Currently active

### **Terminal 2: Ngrok**
```bash
ngrok http 3001
```
**Keep this running!** ✅ Currently active

### **Terminal 3: Frontend**
```bash
cd frontend
npm run dev
```
**Keep this running!** ✅ Currently active

**❌ DON'T close any of these terminals or press Ctrl+C!**

---

## 🎯 WHAT TO TEST NOW

### **1. Login and Check Dashboard**
```
1. Open: http://localhost:3000
2. Login: admin@education.gov / admin123
3. View: Real-time dashboard
4. Check: "Backend Connected" status ✅
```

### **2. Create Agent with SIP Credentials**
```
1. Navigate to: /dashboard/hr
2. Click: "Add Agent"
3. Fill form:
   - Name: John Smith
   - Phone: +232 76 111 222
   - Password: agent123
   - Type: Agent
4. Submit
5. IMPORTANT: Copy SIP credentials from modal!
   - Username: john_smith_xxxxxxx
   - Password: 32-character hex
   - Extension: 1000
```

### **3. Test AI Configuration**
```
1. Navigate to: /dashboard/ai-config
2. Upload training document
3. Configure AI settings
4. Test responses
```

### **4. Test Live Chat**
```
1. Open new browser (as citizen)
2. Navigate to: /dashboard/citizen-chat
3. Send message
4. Switch to admin dashboard
5. View message in: /dashboard/chat
6. Reply as staff
```

### **5. Multi-Device Testing**
```
1. Open phone browser
2. Connect to same WiFi
3. Navigate to: http://192.168.1.241:3000
4. Login as citizen
5. Test all features
6. ✅ Everything works!
```

---

## 🔧 IF SOMETHING STOPS WORKING

### **Frontend Not Loading?**

**Check if it's running:**
```bash
lsof -i:3000
```

**If nothing appears, restart:**
```bash
cd frontend
npm run dev
```

### **Backend Not Responding?**

**Check if it's running:**
```bash
lsof -i:3001
```

**If nothing appears, restart:**
```bash
cd backend
npm run start:dev
```

### **Ngrok Tunnel Down?**

**Check if it's running:**
```bash
ps aux | grep ngrok
```

**If nothing appears, restart:**
```bash
ngrok http 3001
```

**Then update frontend config if URL changed:**
```typescript
// frontend/src/lib/config.ts
export const BACKEND_URL = 'https://NEW-URL.ngrok-free.dev';
```

---

## 📱 NETWORK ACCESS TROUBLESHOOTING

### **Can't Access from Phone?**

**Check these:**

1. **Same WiFi?**
   - Phone and computer must be on SAME WiFi network
   - Not guest WiFi or different network

2. **Firewall?**
   ```bash
   # Mac: Allow incoming connections
   System Settings → Network → Firewall → Options
   # Allow Node.js
   ```

3. **Correct IP?**
   ```bash
   # Get your computer's IP
   ifconfig | grep "inet "
   # Use the 192.168.x.x address
   ```

4. **Frontend Running?**
   ```bash
   # Check if accessible locally first
   curl http://localhost:3000
   ```

---

## 💡 PRO TIPS

### **Use Tmux to Keep Everything Running**

```bash
# Install tmux (if not installed)
brew install tmux

# Start session
tmux new -s callcenter

# Split into 3 panes
Ctrl+B then "    # Split horizontal
Ctrl+B then %    # Split vertical

# Run services in each pane:
# Pane 1: cd backend && npm run start:dev
# Pane 2: ngrok http 3001
# Pane 3: cd frontend && npm run dev

# Detach (keeps running in background)
Ctrl+B then D

# Re-attach later
tmux attach -t callcenter
```

### **Check All Services at Once**

```bash
# Quick health check
curl http://localhost:3001/health && \
curl https://rhett-yearlong-gregory.ngrok-free.dev/health && \
curl http://localhost:3000 | head -n 5
```

### **View All Logs**

**Backend logs:** Check Terminal 1
**Ngrok requests:** http://localhost:4040
**Frontend logs:** Check Terminal 3

---

## 🎯 COMPLETE TESTING WORKFLOW

### **Two-Browser Call Simulation**

**Browser 1: Admin**
```
1. http://localhost:3000
2. Login: admin@education.gov / admin123
3. Go to: /dashboard/hr
4. Create agent with SIP credentials
5. Copy credentials
```

**Browser 2: Agent**
```
1. http://localhost:3000 (incognito/private mode)
2. Login: agent@example.com / agent123
3. Go to: /dashboard/webrtc-setup
4. Enter SIP credentials from Browser 1
5. Register WebRTC phone
```

**Browser 3: Citizen**
```
1. http://192.168.1.241:3000 (from phone)
2. Login: citizen@example.com / citizen123
3. Go to: /dashboard/call-dialer
4. Dial agent extension (e.g., 1000)
5. Call connects! 🎉
```

---

## 📊 SYSTEM STATUS CHECK

### **All Green? ✅**

```
✅ Backend: Running on 3001
✅ Frontend: Running on 3000
✅ Ngrok: Tunnel active
✅ Database: Connected
✅ All routes: Mapped
✅ Network access: Working
```

**Everything is ready!**

### **Need Help?**

Check these guides:
- `ASTERISK_WEBRTC_SETUP_GUIDE.md` - Complete WebRTC setup
- `NGROK_SETUP_GUIDE.md` - Ngrok configuration
- `NGROK_MULTIPLE_TUNNELS.md` - Multi-tunnel solutions
- `SYSTEM_STATUS.md` - Detailed system info
- `FIXES_APPLIED.md` - Recent fixes

---

## 🎉 YOU'RE ALL SET!

**Everything is running and accessible!**

**Just open:** http://localhost:3000

**Or from phone:** http://192.168.1.241:3000

**Start testing!** 🚀

---

## ⚡ QUICK COMMANDS REFERENCE

```bash
# Check what's running
lsof -i:3000  # Frontend
lsof -i:3001  # Backend
ps aux | grep ngrok  # Ngrok

# Restart services
cd backend && npm run start:dev
cd frontend && npm run dev
ngrok http 3001

# Kill processes if needed
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
pkill -f ngrok

# View logs
# Backend: Terminal 1
# Ngrok: http://localhost:4040
# Frontend: Terminal 3
```

---

**Happy Testing!** 🎊
