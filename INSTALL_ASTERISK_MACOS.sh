#!/bin/bash
# Install Asterisk on macOS from source

set -e

echo "🚀 Installing Asterisk on macOS..."

# Step 1: Install dependencies
echo "📦 Installing dependencies via Homebrew..."
brew install jansson libedit libxml2 sqlite pjproject ncurses speex

# Step 2: Download Asterisk
echo "⬇️  Downloading Asterisk 21 LTS..."
cd /tmp
wget https://downloads.asterisk.org/pub/telephony/asterisk/asterisk-21-current.tar.gz
tar -xzf asterisk-21-current.tar.gz
cd asterisk-21.*

# Step 3: Configure build
echo "🔧 Configuring build..."
./configure --with-jansson-bundled --with-pjproject-bundled

# Step 4: Select modules (enable ARI)
echo "📋 Selecting modules..."
make menuselect.makeopts
menuselect/menuselect \
  --enable res_ari \
  --enable res_ari_applications \
  --enable res_ari_asterisk \
  --enable res_ari_bridges \
  --enable res_ari_channels \
  --enable res_ari_device_states \
  --enable res_ari_endpoints \
  --enable res_ari_events \
  --enable res_ari_mailboxes \
  --enable res_ari_model \
  --enable res_ari_playbacks \
  --enable res_ari_recordings \
  --enable res_ari_sounds \
  --enable res_http_websocket \
  --enable res_pjsip \
  --enable res_pjsip_session \
  --enable chan_pjsip \
  menuselect.makeopts

# Step 5: Compile and install
echo "🔨 Compiling Asterisk (this may take 10-15 minutes)..."
make -j$(sysctl -n hw.ncpu)

echo "📥 Installing Asterisk (requires sudo)..."
sudo make install
sudo make samples
sudo make config

echo "✅ Asterisk installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Configure ARI in /usr/local/etc/asterisk/ari.conf"
echo "2. Configure HTTP in /usr/local/etc/asterisk/http.conf"
echo "3. Start Asterisk: sudo asterisk"
echo "4. Check status: sudo asterisk -rx 'core show version'"
