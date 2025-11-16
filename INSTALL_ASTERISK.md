# Install Asterisk with ARI on macOS

## Quick Installation Using Homebrew

### Step 1: Install Asterisk

```bash
# Install Asterisk via Homebrew
brew install asterisk

# Or install from source for latest features (optional)
# brew install asterisk --HEAD
```

### Step 2: Configure Asterisk for ARI

Create/edit Asterisk configuration files:

```bash
# Edit http.conf for ARI
sudo nano /usr/local/etc/asterisk/http.conf
```

Add these lines:
```ini
[general]
enabled=yes
bindaddr=0.0.0.0
bindport=8088
tlsenable=no
tlsbindaddr=0.0.0.0:8089
tlscertfile=/usr/local/etc/asterisk/keys/asterisk.pem
tlsprivatekey=/usr/local/etc/asterisk/keys/asterisk.key
```

### Step 3: Configure ARI Users

```bash
# Edit ari.conf
sudo nano /usr/local/etc/asterisk/ari.conf
```

Add:
```ini
[general]
enabled = yes
pretty = yes

[callcenter]
type = user
read_only = no
password = change_me_ari
password_format = plain
```

### Step 4: Configure Manager (AMI)

```bash
# Edit manager.conf
sudo nano /usr/local/etc/asterisk/manager.conf
```

Add:
```ini
[general]
enabled = yes
port = 5038
bindaddr = 0.0.0.0

[callcenter]
secret = change_me_ami
deny=0.0.0.0/0.0.0.0
permit=127.0.0.1/255.255.255.0
read = system,call,log,verbose,agent,user,config,dtmf,reporting,cdr,dialplan
write = system,call,agent,user,config,command,reporting,originate,message
```

### Step 5: Configure SIP (PJSIP)

```bash
# Edit pjsip.conf
sudo nano /usr/local/etc/asterisk/pjsip.conf
```

Add basic transport and endpoint:
```ini
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0

[transport-ws]
type=transport
protocol=ws
bind=0.0.0.0:8088

[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:8089
```

### Step 6: Start Asterisk

```bash
# Start Asterisk
sudo asterisk

# Or restart if already running
sudo asterisk -rx "core restart now"

# Check if running
sudo asterisk -rx "core show version"

# Check ARI status
sudo asterisk -rx "ari show status"

# Check manager status
sudo asterisk -rx "manager show users"
```

### Step 7: Test ARI Connection

```bash
# Test ARI endpoint
curl -X GET \
  http://localhost:8088/ari/asterisk/info \
  -u callcenter:change_me_ari

# Should return Asterisk system info in JSON
```

### Step 8: Update Your Backend .env

Your `.env` is already configured! Just make sure Asterisk is running:

```bash
# Check if Asterisk is listening on port 8088
lsof -i :8088

# Should show:
# COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
# asterisk  XXXX root   XX   IPv4  XXXXXX      0t0  TCP *:8088 (LISTEN)
```

### Step 9: Restart Your Backend

```bash
cd backend
npm run start:dev
```

Check the backend console - it should show:
```
Asterisk ARI Connected ✓
```

---

## Troubleshooting

### Asterisk Won't Start
```bash
# Check logs
sudo tail -f /var/log/asterisk/messages

# Check configuration errors
sudo asterisk -rx "core show config"
```

### ARI Not Responding
```bash
# Verify HTTP is enabled
sudo asterisk -rx "http show status"

# Should show: HTTP Server Status: Enabled
```

### WebRTC Not Connecting
```bash
# Check WebSocket transport
sudo asterisk -rx "pjsip show transports"

# Should show ws and wss transports
```

### Permission Issues
```bash
# Give current user access to Asterisk
sudo chown -R $(whoami) /usr/local/var/lib/asterisk
sudo chown -R $(whoami) /usr/local/var/log/asterisk
sudo chown -R $(whoami) /usr/local/var/spool/asterisk
```

---

## Quick Test Commands

```bash
# Check if Asterisk is running
pgrep asterisk

# Connect to Asterisk CLI
sudo asterisk -rvvv

# In Asterisk CLI:
# - ari show status
# - manager show users  
# - pjsip show endpoints
# - core show version
```

---

## Auto-Start Asterisk on Boot (Optional)

```bash
# Create launchd plist
sudo nano /Library/LaunchDaemons/org.asterisk.asterisk.plist
```

Add:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.asterisk.asterisk</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/sbin/asterisk</string>
        <string>-f</string>
        <string>-vvvg</string>
        <string>-c</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

```bash
# Load and start
sudo launchctl load /Library/LaunchDaemons/org.asterisk.asterisk.plist
```

---

## Next Steps

Once Asterisk is running:
1. Your backend will auto-detect the connection
2. Dashboard will show "Asterisk Connected" instead of "Mock Mode"
3. You can make real calls through the system
4. WebRTC phone registration will work

Happy calling! 📞
