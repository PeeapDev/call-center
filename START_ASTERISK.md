# Start Asterisk with Docker (EASIEST WAY!)

Since Homebrew doesn't have Asterisk on macOS, use Docker instead.

## Prerequisites

1. **Install Docker Desktop for Mac**
   ```bash
   # Download from: https://www.docker.com/products/docker-desktop
   # Or install via Homebrew:
   brew install --cask docker
   ```

2. **Open Docker Desktop** and make sure it's running

## Quick Start

### Step 1: Start Asterisk

```bash
# From your project root
docker compose -f docker-compose.asterisk.yml up -d

# Check if it's running
docker ps | grep asterisk
```

### Step 2: Verify Asterisk is Working

```bash
# Test ARI endpoint
curl -u callcenter:change_me_ari http://localhost:8088/ari/asterisk/info

# Should return JSON with Asterisk version info
```

### Step 3: Access Asterisk CLI

```bash
# Connect to Asterisk CLI
docker exec -it callcenter-asterisk asterisk -rvvv

# Try these commands:
# - ari show status
# - manager show users
# - pjsip show transports
# - core show version
# - exit (to quit)
```

### Step 4: Restart Your Backend

Your backend will automatically detect Asterisk!

```bash
cd backend
npm run start:dev

# Watch for: "Asterisk ARI Connected ✓"
```

### Step 5: Check Dashboard

Open http://localhost:3000/dashboard

You should see **"Asterisk Connected"** instead of "Mock Mode"! 🎉

---

## Useful Docker Commands

```bash
# View Asterisk logs
docker logs -f callcenter-asterisk

# Restart Asterisk
docker restart callcenter-asterisk

# Stop Asterisk
docker compose -f docker-compose.asterisk.yml down

# Access Asterisk CLI
docker exec -it callcenter-asterisk asterisk -rvvv
```

---

## Troubleshooting

### Port 8088 Already in Use?

```bash
# Check what's using the port
lsof -i :8088

# Kill the process or change the port in docker-compose.asterisk.yml
```

### Docker Not Running?

```bash
# Start Docker Desktop
open -a Docker

# Wait for Docker to start, then try again
docker ps
```

### Can't Connect to ARI?

```bash
# Check Asterisk logs
docker logs callcenter-asterisk

# Verify HTTP is enabled
docker exec -it callcenter-asterisk asterisk -rx "http show status"
```

---

## Configuration Files

All Asterisk config files are in `asterisk-config/`:
- `ari.conf` - ARI user credentials
- `http.conf` - HTTP/WebSocket server
- `manager.conf` - AMI credentials
- `pjsip.conf` - SIP endpoints & WebRTC
- `extensions.conf` - Dialplan (call routing)

Edit these files and restart Asterisk:
```bash
docker restart callcenter-asterisk
```

---

## Alternative: Compile from Source

If you prefer to compile Asterisk natively on macOS:

```bash
chmod +x INSTALL_ASTERISK_MACOS.sh
./INSTALL_ASTERISK_MACOS.sh
```

⚠️ **Warning**: This takes 15-20 minutes and requires Xcode Command Line Tools.

---

## What You Get

✅ Asterisk 21 LTS  
✅ ARI (Asterisk REST Interface) on port 8088  
✅ AMI (Asterisk Manager Interface) on port 5038  
✅ WebRTC/WebSocket support  
✅ PJSIP for modern SIP  
✅ Ready for production calls  

Happy calling! 📞
