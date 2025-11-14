# 🚀 ngrok Setup Instructions

## ⚠️ Important: You Need to Authenticate ngrok First

ngrok requires a free account and auth token. Here's how to set it up:

---

## Step 1: Sign Up for ngrok (FREE)

1. Go to: **https://dashboard.ngrok.com/signup**
2. Sign up with email or GitHub
3. Verify your email

---

## Step 2: Get Your Auth Token

1. After login, go to: **https://dashboard.ngrok.com/get-started/your-authtoken**
2. Copy your auth token (looks like: `2abc123def456...`)

---

## Step 3: Configure ngrok

```bash
# Add your auth token (only need to do this once)
ngrok config add-authtoken YOUR_TOKEN_HERE

# Example:
# ngrok config add-authtoken 2abc123def456ghi789jkl
```

---

## Step 4: Start ngrok Tunnels

### Terminal 1: Backend Tunnel
```bash
cd /Users/soft-touch/Desktop/project/callcenter
ngrok http 3001 --log=stdout > ngrok-backend.log 2>&1 &

# Check the URL
curl http://127.0.0.1:4040/api/tunnels | grep public_url

# Or open ngrok dashboard
open http://127.0.0.1:4040
```

### Terminal 2: Frontend Tunnel
```bash
# Start frontend tunnel on different port
ngrok http 3000 --log=stdout > ngrok-frontend.log 2>&1 &

# Check the URL
curl http://127.0.0.1:4041/api/tunnels | grep public_url
```

---

## Step 5: Update Frontend Configuration

After starting ngrok, update your frontend `.env.local`:

```bash
cd /Users/soft-touch/Desktop/project/callcenter/frontend

# Replace with YOUR actual ngrok backend URL
echo "NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-NGROK-URL.ngrok-free.app" > .env.local

# Restart frontend
npm run dev
```

---

## Step 6: Access Your App

Open your frontend ngrok URL in browser:
```
https://YOUR-FRONTEND-NGROK-URL.ngrok-free.app
```

---

## 🎯 Quick Copy-Paste Setup

```bash
# 1. Sign up at ngrok.com and get auth token
open https://dashboard.ngrok.com/signup

# 2. Configure auth token (replace with your token)
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE

# 3. Start backend tunnel
cd /Users/soft-touch/Desktop/project/callcenter
ngrok http 3001

# Keep this terminal open
# Copy the HTTPS URL shown (e.g., https://abc123.ngrok-free.app)

# 4. In a NEW terminal, update frontend
cd /Users/soft-touch/Desktop/project/callcenter/frontend
echo "NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL-HERE" > .env.local

# 5. Start frontend tunnel in ANOTHER terminal
ngrok http 3000

# Copy the frontend URL and open in browser
```

---

## ✅ Verification

### Check Backend Tunnel
```bash
curl https://YOUR-BACKEND-NGROK-URL/health
```

### Check Frontend
Open in browser:
```
https://YOUR-FRONTEND-NGROK-URL
```

---

## 🆘 Troubleshooting

### "authentication failed"
- You need to run: `ngrok config add-authtoken YOUR_TOKEN`
- Get token from: https://dashboard.ngrok.com/get-started/your-authtoken

### "tunnel not found"
- Wait 5 seconds after starting ngrok
- Check: `open http://127.0.0.1:4040`

### "port already in use"
- Make sure your backend/frontend servers are running
- Check with: `lsof -i :3000` and `lsof -i :3001`

---

## 📱 For Mobile Testing

Once ngrok is running, your HTTPS URL will work on mobile devices:

1. Open ngrok frontend URL on mobile browser
2. Login
3. Grant microphone permission
4. Test WebRTC calls!

---

## 🔥 Pro Tip: Static URL (Paid Feature)

Free ngrok gives random URLs that change each time.

For $8/month, you can get:
- Static domain
- More connections
- Faster speeds

Upgrade at: https://dashboard.ngrok.com/billing/subscription

---

## Next: After ngrok is Running

Once you have ngrok URLs:

1. ✅ Your app will have HTTPS
2. ✅ WebRTC will work
3. ✅ Microphone permission will be granted
4. ✅ Mobile testing enabled
5. ✅ Agent calling ready

**Get your auth token now and let's continue!** 🚀
