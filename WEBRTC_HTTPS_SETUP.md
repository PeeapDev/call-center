# WebRTC HTTPS Setup Guide

WebRTC requires HTTPS for security. Here are **4 easy ways** to test WebRTC right now:

---

## 🚀 Quick Options (Best to Worst)

1. **ngrok** - Instant HTTPS tunnel (Recommended) ⭐
2. **localhost** - Self-signed certificate (Quick test)
3. **Cloudflare Tunnel** - Free, permanent tunnel
4. **Deploy to Vercel/Netlify** - Production-ready

---

## Option 1: ngrok (EASIEST & FASTEST) ⭐

### **Install ngrok**
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### **Setup**
```bash
# 1. Sign up at https://ngrok.com (free)
# 2. Get your auth token
ngrok config add-authtoken YOUR_TOKEN_HERE

# 3. Start ngrok tunnel
ngrok http 3000
```

### **Result**
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:3000
```

✅ **Your frontend is now accessible via HTTPS!**

### **Test WebRTC**
1. Open https://abc123.ngrok-free.app in browser
2. Login to dashboard
3. Go to WebRTC setup page
4. Grant microphone permission
5. Test calling!

### **For Backend API**
```bash
# In another terminal
ngrok http 3001

# Get URL like: https://def456.ngrok-free.app
# Update frontend API URL
```

### **Update Frontend .env.local**
```env
NEXT_PUBLIC_API_URL=https://def456.ngrok-free.app
```

---

## Option 2: Self-Signed Certificate (Quick Test)

### **Generate Certificate**
```bash
cd /Users/soft-touch/Desktop/project/callcenter

# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -nodes -sha256 \
  -subj '/CN=localhost' \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -days 365
```

### **Update Frontend (Next.js)**
```bash
cd frontend

# Create custom server
npm install --save-dev https
```

Create `server.js`:
```javascript
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('../ssl/key.pem'),
  cert: fs.readFileSync('../ssl/cert.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});
```

### **Update package.json**
```json
{
  "scripts": {
    "dev": "node server.js",
    "dev:https": "node server.js"
  }
}
```

### **Run with HTTPS**
```bash
npm run dev:https
```

### **Access**
```
https://localhost:3000
```

⚠️ **Browser will show security warning - click "Advanced" → "Proceed to localhost"**

---

## Option 3: Cloudflare Tunnel (FREE & PERMANENT)

### **Install cloudflared**
```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### **Setup**
```bash
# 1. Login (opens browser)
cloudflared tunnel login

# 2. Create tunnel
cloudflared tunnel create ministry-callcenter

# 3. Configure tunnel
cat > ~/.cloudflared/config.yml << EOF
tunnel: ministry-callcenter
credentials-file: /Users/YOUR_USER/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: callcenter.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# 4. Run tunnel
cloudflared tunnel run ministry-callcenter
```

### **Result**
```
https://callcenter.yourdomain.com -> http://localhost:3000
```

✅ **Permanent URL with real SSL certificate!**

---

## Option 4: Deploy to Vercel (PRODUCTION-READY)

### **Deploy Frontend**
```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to Vercel project? No
# - Project name: ministry-callcenter-frontend
# - Directory: ./
# - Build command: npm run build
# - Output directory: .next
```

### **Result**
```
https://ministry-callcenter-frontend.vercel.app
```

### **Deploy Backend** (Use Railway or Render)

#### **Railway**
```bash
cd backend

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init
railway init

# Deploy
railway up
```

#### **Render.com**
1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Select backend folder
5. Build command: `npm install && npm run build`
6. Start command: `npm run start:prod`

### **Update Environment Variables**
In Vercel dashboard:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXTAUTH_URL=https://ministry-callcenter-frontend.vercel.app
```

---

## 🎯 **RECOMMENDED FOR TESTING: ngrok**

### **Complete Setup (5 minutes)**

```bash
# Terminal 1: Backend with ngrok
cd /Users/soft-touch/Desktop/project/callcenter/backend
npm run start:dev

# Terminal 2: ngrok for backend
ngrok http 3001
# Copy URL: https://abc123.ngrok-free.app

# Terminal 3: Frontend
cd /Users/soft-touch/Desktop/project/callcenter/frontend
# Update .env.local
echo "NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app" > .env.local
npm run dev

# Terminal 4: ngrok for frontend
ngrok http 3000
# Copy URL: https://def456.ngrok-free.app
```

### **Access Your App**
```
https://def456.ngrok-free.app
```

✅ **Full HTTPS, ready for WebRTC testing!**

---

## 🔧 WebRTC Configuration

### **Update Asterisk for WebRTC**

Edit `/Users/soft-touch/Desktop/project/callcenter/docker/asterisk/conf/pjsip.conf`:

```ini
[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:8089
external_media_address=YOUR_PUBLIC_IP
external_signaling_address=YOUR_PUBLIC_IP
```

Edit `http.conf`:
```ini
[general]
enabled=yes
bindaddr=0.0.0.0
bindport=8088
tlsenable=yes
tlsbindaddr=0.0.0.0:8089
tlscertfile=/etc/asterisk/keys/asterisk.pem
tlsprivatekey=/etc/asterisk/keys/asterisk.key
```

### **Frontend WebRTC Config**

Create `frontend/src/lib/webrtc.ts`:
```typescript
import JsSIP from 'jssip';

export class WebRTCClient {
  private ua: JsSIP.UA;

  constructor() {
    const socket = new JsSIP.WebSocketInterface('wss://your-asterisk.ngrok.io/ws');
    
    const configuration = {
      sockets: [socket],
      uri: 'sip:agent001@your-domain.com',
      password: 'your-password',
      display_name: 'Agent 001',
    };

    this.ua = new JsSIP.UA(configuration);
  }

  start() {
    this.ua.start();
  }

  makeCall(extension: string) {
    const options = {
      mediaConstraints: { audio: true, video: false },
    };

    this.ua.call(`sip:${extension}@your-domain.com`, options);
  }
}
```

---

## 🧪 Test WebRTC

### **1. Open HTTPS URL**
```
https://your-ngrok-url.ngrok-free.app
```

### **2. Login**
```
admin@education.gov / admin123
```

### **3. Grant Permissions**
Browser will ask for microphone access - click "Allow"

### **4. Test Call**
Go to "WebRTC Setup" page and click "Test Call"

---

## 📱 Mobile Testing

For mobile device testing with ngrok:

```bash
# Start ngrok
ngrok http 3000

# Get URL: https://abc123.ngrok-free.app

# On your mobile phone:
# 1. Open browser
# 2. Go to https://abc123.ngrok-free.app
# 3. Login
# 4. Test WebRTC calls
```

---

## 🔐 Security Notes

### **Production Checklist**
- ✅ Use real SSL certificate (Let's Encrypt)
- ✅ Enable CORS properly
- ✅ Use TURN server for NAT traversal
- ✅ Implement rate limiting
- ✅ Add authentication to WebSocket
- ✅ Use strong Asterisk passwords
- ✅ Enable firewall rules

### **TURN Server Setup** (for production)
```bash
# Install coturn
sudo apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
tls-listening-port=5349
realm=your-domain.com
server-name=turn.your-domain.com
fingerprint
lt-cred-mech
user=username:password
```

---

## 🎯 Quick Start Command (Copy & Paste)

```bash
# Install ngrok
brew install ngrok

# Get auth token from https://ngrok.com
ngrok config add-authtoken YOUR_TOKEN

# Terminal 1: Start backend
cd /Users/soft-touch/Desktop/project/callcenter/backend && npm run start:dev

# Terminal 2: ngrok backend
ngrok http 3001

# Terminal 3: Update frontend and start
cd /Users/soft-touch/Desktop/project/callcenter/frontend
echo "NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-NGROK-URL" > .env.local
npm run dev

# Terminal 4: ngrok frontend
ngrok http 3000

# Open the frontend ngrok URL in browser
# https://YOUR-FRONTEND-NGROK-URL
```

---

## ✅ Verification

### **Check HTTPS**
1. URL starts with `https://`
2. Padlock icon in browser
3. No security warnings (or you bypassed them)

### **Check WebRTC**
1. Open browser console (F12)
2. Type: `navigator.mediaDevices.getUserMedia({ audio: true })`
3. Should prompt for microphone permission
4. No errors in console

### **Check Asterisk WebSocket**
```bash
# Test WebSocket connection
wscat -c wss://your-asterisk-ngrok-url/ws

# Should connect without errors
```

---

## 🆘 Troubleshooting

### **ngrok: "Too many connections"**
- Free plan has limits
- Upgrade to paid plan ($8/month)
- Or use Cloudflare Tunnel (free)

### **Browser: "Certificate invalid"**
- Expected with self-signed cert
- Click "Advanced" → "Proceed anyway"
- Only for testing!

### **WebRTC: "Permission denied"**
- Check browser settings
- Ensure HTTPS is working
- Try different browser

### **Asterisk: "Connection refused"**
- Check Asterisk is running
- Verify WebSocket port 8089 is open
- Check firewall rules

---

## 🎉 You're Ready!

Choose your method:
- **Testing now?** → Use ngrok (5 minutes)
- **Quick local test?** → Self-signed cert (10 minutes)
- **Permanent solution?** → Cloudflare Tunnel (15 minutes)
- **Production deployment?** → Vercel + Railway (30 minutes)

**Start with ngrok - it's the fastest way to test WebRTC right now!** 🚀
