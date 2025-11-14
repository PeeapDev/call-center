#!/bin/bash

echo "🚀 Starting Complete Testing Environment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Asterisk IP: 192.168.1.17"
echo "   WebSocket: ws://192.168.1.17:8088/ws"
echo "   Agent Registration: http://localhost:3000/agent-register.html"
echo ""

# Check if backend is running
echo -e "${BLUE}1️⃣  Checking Backend...${NC}"
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend is running${NC}"
else
    echo -e "   ${YELLOW}⚠️  Backend not running - starting it...${NC}"
    cd backend
    npm run start:dev > ../logs/backend.log 2>&1 &
    echo "   Backend started (logs: logs/backend.log)"
    cd ..
fi
echo ""

# Check if frontend is running
echo -e "${BLUE}2️⃣  Checking Frontend...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Frontend is running${NC}"
else
    echo -e "   ${YELLOW}⚠️  Frontend not running - starting it...${NC}"
    cd frontend
    npm run dev > ../logs/frontend.log 2>&1 &
    echo "   Frontend started (logs: logs/frontend.log)"
    cd ..
    sleep 3
fi
echo ""

# Open agent registration page
echo -e "${BLUE}3️⃣  Opening Agent Registration Page...${NC}"
sleep 2
open http://localhost:3000/agent-register.html
echo -e "   ${GREEN}✅ Browser opened${NC}"
echo ""

# Start mobile app
echo -e "${BLUE}4️⃣  Starting Mobile App...${NC}"
echo "   Opening in new terminal window..."
echo ""

osascript <<EOF
tell application "Terminal"
    do script "cd '$PWD/mobile-app/ministry-call-center' && clear && echo '📱 Ministry Call Center Mobile App' && echo '===================================' && echo '' && echo '📲 Scan the QR code with Expo Go app on your phone' && echo '' && npm start"
    activate
end tell
EOF

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Testing Environment Started!"
echo -e "==========================================${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "   1️⃣  Browser opened → Agent Registration page"
echo "      - Click '🔵 Agent 1' button"
echo "      - Click '🚀 Register Agent'"
echo "      - Wait for ✅ 'Registered' status"
echo ""
echo "   2️⃣  New terminal opened → Mobile app starting"
echo "      - Wait for QR code to appear"
echo "      - Scan with Expo Go app on your phone"
echo ""
echo "   3️⃣  On Mobile Phone:"
echo "      - Open Expo Go app"
echo "      - Scan QR code"
echo "      - Login (tap 'Citizen Demo')"
echo "      - Tap 'Call Ministry'"
echo "      - Wait for 'Ready' status"
echo "      - Tap 'Call Now'"
echo ""
echo "   4️⃣  Agent Browser:"
echo "      - Wait for incoming call notification"
echo "      - Click '✅ Answer'"
echo "      - Talk and test audio!"
echo ""
echo -e "${GREEN}🎉 Ready to test! Follow the steps above.${NC}"
echo ""
echo "📚 Full guide: START_TESTING.md"
echo ""
