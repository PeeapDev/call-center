# 🌐 Using Ngrok for WebRTC Testing

## Why Ngrok?

Ngrok creates a public URL for your local backend, which is essential for:
- ✅ WebRTC testing (requires HTTPS in production)
- ✅ Testing from multiple devices
- ✅ Testing from different networks
- ✅ Webhook integrations
- ✅ Sharing your development environment

---

## 🚀 Quick Setup (2 Minutes!)

### **Step 1: Install Ngrok**

**Mac (using Homebrew):**
```bash
brew install ngrok/ngrok/ngrok
```

**Or download from:** https://ngrok.com/download

**Sign up for free account:** https://dashboard.ngrok.com/signup

**Authenticate:**
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

---

### **Step 2: Start Your Backend**

```bash
cd backend
npm run start:dev
```

Backend will run on `http://localhost:3001`

---

### **Step 3: Start Ngrok**

Open a **new terminal** and run:

```bash
ngrok http 3001
```

You'll see output like this:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3001
```

**Copy the HTTPS URL!** (e.g., `https://abc123.ngrok.io`)

---

### **Step 4: Configure Frontend**

**Option A: Environment Variable (Recommended)**

Create `.env.local` in the `frontend/` folder:

```bash
cd frontend
nano .env.local
```

Add this line (replace with your ngrok URL):
```env
NEXT_PUBLIC_BACKEND_URL=https://abc123.ngrok.io
```

Save and exit (Ctrl+X, then Y, then Enter)

**Option B: Direct Code Change**

Edit `frontend/src/lib/config.ts`:

```typescript
// Change this line:
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// To this (with your ngrok URL):
export const BACKEND_URL = 'https://abc123.ngrok.io';
```

---

### **Step 5: Start Frontend**

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

---

### **Step 6: Test It!**

1. Open browser: `http://localhost:3000`
2. Login as admin: `admin@education.gov` / `admin123`
3. Go to Dashboard
4. **Check health status** - should show "Asterisk Connected" or "Backend Connected"

---

## 📱 ALL API ENDPOINTS NOW USE NGROK!

I've updated **all frontend files** to use the centralized config:

**Updated Files:**
- ✅ `/dashboard/page.tsx` - Main dashboard
- ✅ `/dashboard/hr/page.tsx` - HR management
- ✅ `/dashboard/ai-config/page.tsx` - AI configuration
- ✅ `/dashboard/settings/page.tsx` - Settings
- ✅ `/dashboard/citizen-chat/page.tsx` - Citizen chat

**All API calls now use:**
```typescript
import { API_ENDPOINTS } from '@/lib/config';

// Examples:
fetch(API_ENDPOINTS.health)
fetch(API_ENDPOINTS.hrUsers)
fetch(API_ENDPOINTS.aiChat)
```

---

## 🎯 TESTING WITH TWO BROWSERS

Now you can test the full flow!

### **Browser 1: Admin (Create Agent)**

1. Navigate to: `http://localhost:3000`
2. Login: `admin@education.gov` / `admin123`
3. Go to: **HR Page**
4. Click: **"Add Agent"**
5. Create agent and **copy SIP credentials**

### **Browser 2: Agent (Register Phone)**

1. Navigate to: `http://localhost:3000` (or from another device: `https://YOUR-NGROK-URL`)
2. Login: As the agent you just created
3. Go to: **WebRTC Setup**
4. Enter: SIP credentials from step 1
5. Click: **"Register"**
6. Status: **"Registered"** ✅

### **Browser 3: Citizen (Make Call)**

1. Navigate to: `http://localhost:3000`
2. Login: `citizen@example.com` / `citizen123`
3. Go to: **Call Dialer**
4. Dial: Agent extension (e.g., `1000`)
5. Call: Agent's browser rings!

---

## 🔧 TROUBLESHOOTING

### **"Backend not reachable" Error**

**Check:**
1. ✅ Backend is running: `cd backend && npm run start:dev`
2. ✅ Ngrok is running: `ngrok http 3001`
3. ✅ Ngrok URL is correct in `.env.local` or `config.ts`
4. ✅ Frontend restarted after changing URL

**Test backend directly:**
```bash
curl https://YOUR-NGROK-URL.ngrok.io/health
```

Should return JSON with health status.

---

### **Ngrok Session Expired**

Free ngrok URLs change when you restart ngrok.

**Solution:**
1. Restart ngrok: `ngrok http 3001`
2. Copy new URL
3. Update `.env.local` with new URL
4. Restart frontend: `npm run dev`

**Upgrade to ngrok paid plan** for:
- Static domain
- Longer session timeouts
- More connections

---

### **CORS Errors**

If you see CORS errors in browser console:

**Backend fix** - Add to `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'https://YOUR-NGROK-URL.ngrok.io'],
  credentials: true,
});
```

---

## 🌐 ACCESSING FROM ANOTHER DEVICE

Your ngrok URL is **publicly accessible!**

**From phone/tablet:**
1. Open browser
2. Go to: `https://YOUR-NGROK-URL.ngrok.io`
3. Login and test!

**From another computer:**
1. Open browser
2. Go to: `https://YOUR-NGROK-URL.ngrok.io`
3. Full functionality!

---

## 🔐 SECURITY NOTES

### **Ngrok Free Plan:**
- ✅ Your URL is public but hard to guess
- ✅ HTTPS encrypted
- ⚠️ URL changes on restart
- ⚠️ Session timeout after 8 hours

### **For Production:**
- Use permanent domain
- Add authentication
- Use environment-specific URLs
- Setup CORS properly

---

## 📊 CURRENT CONFIGURATION

**Config File Location:**
```
frontend/src/lib/config.ts
```

**Environment Variable (Optional):**
```
frontend/.env.local
```

**Key Configuration:**
```typescript
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
export const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

export const API_ENDPOINTS = {
  health: `${BACKEND_URL}/health`,
  aiChat: `${BACKEND_URL}/ai/chat`,
  hrUsers: `${BACKEND_URL}/hr/users`,
  // ... all endpoints
};
```

---

## ✅ CHECKLIST

Before testing with ngrok:

- [ ] Backend running (`npm run start:dev`)
- [ ] Ngrok running (`ngrok http 3001`)
- [ ] Ngrok URL copied
- [ ] `.env.local` created with `NEXT_PUBLIC_BACKEND_URL`
- [ ] Frontend restarted (`npm run dev`)
- [ ] Health check working (visit `/dashboard`)
- [ ] No "Backend not reachable" errors

---

## 🎉 YOU'RE READY!

Now you can:
- ✅ Test WebRTC from multiple devices
- ✅ Test live chat system
- ✅ Create agents and have them register
- ✅ Make browser-to-browser calls
- ✅ Share your development environment
- ✅ Test from mobile devices

**All API calls now automatically use ngrok when configured!**

---

## 💡 PRO TIPS

### **Keep Ngrok Running**

Use `tmux` or `screen` to keep ngrok running:
```bash
tmux new -s ngrok
ngrok http 3001
# Press Ctrl+B then D to detach
```

### **Ngrok Web Interface**

While ngrok is running, visit:
```
http://localhost:4040
```

See all requests, responses, and replay them!

### **Static Domain (Paid Plan)**

Get a permanent URL that doesn't change:
```bash
ngrok http 3001 --domain=your-domain.ngrok.io
```

---

## 🔗 USEFUL LINKS

- **Ngrok Dashboard:** https://dashboard.ngrok.com
- **Ngrok Documentation:** https://ngrok.com/docs
- **Free Account:** https://dashboard.ngrok.com/signup
- **Pricing:** https://ngrok.com/pricing

---

**Ready to test WebRTC? Follow the steps above and you're good to go!** 🚀
