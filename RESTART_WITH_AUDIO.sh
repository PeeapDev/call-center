#!/bin/bash

echo "=========================================="
echo "RESTARTING CALL CENTER WITH AUDIO FIX"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Create recordings directory
echo -e "${YELLOW}Step 1: Creating recordings directory...${NC}"
mkdir -p asterisk-recordings
chmod 777 asterisk-recordings
echo -e "${GREEN}✓ Recordings directory created${NC}"
echo ""

# Step 2: Stop Asterisk
echo -e "${YELLOW}Step 2: Stopping Asterisk...${NC}"
docker compose -f docker-compose.asterisk.yml down
sleep 2
echo -e "${GREEN}✓ Asterisk stopped${NC}"
echo ""

# Step 3: Start Asterisk with new config
echo -e "${YELLOW}Step 3: Starting Asterisk with WebRTC audio support...${NC}"
docker compose -f docker-compose.asterisk.yml up -d
sleep 5
echo -e "${GREEN}✓ Asterisk started${NC}"
echo ""

# Step 4: Check if Asterisk is running
echo -e "${YELLOW}Step 4: Checking Asterisk status...${NC}"
if docker ps | grep -q callcenter-asterisk; then
    echo -e "${GREEN}✓ Asterisk container is running${NC}"
else
    echo -e "${RED}✗ Asterisk container failed to start${NC}"
    echo "Check logs: docker logs callcenter-asterisk"
    exit 1
fi
echo ""

# Step 5: Wait for Asterisk to initialize
echo -e "${YELLOW}Step 5: Waiting for Asterisk to initialize (10 seconds)...${NC}"
sleep 10
echo -e "${GREEN}✓ Asterisk should be ready${NC}"
echo ""

# Step 6: Test ARI connection
echo -e "${YELLOW}Step 6: Testing ARI connection...${NC}"
if curl -s -u callcenter:change_me_ari http://localhost:8088/ari/asterisk/info > /dev/null; then
    echo -e "${GREEN}✓ ARI is responding${NC}"
else
    echo -e "${RED}✗ ARI is not responding${NC}"
    echo "Check Asterisk logs: docker logs callcenter-asterisk"
fi
echo ""

# Step 7: Show PJSIP endpoints
echo -e "${YELLOW}Step 7: Checking PJSIP WebRTC endpoints...${NC}"
docker exec callcenter-asterisk asterisk -rx "pjsip show endpoints" | grep -E "1001|1002|1003|Endpoint"
echo ""

# Step 8: Backend status
echo -e "${YELLOW}Step 8: Checking backend status...${NC}"
if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on port 3001${NC}"
    echo -e "${YELLOW}You may want to restart it to reconnect to Asterisk:${NC}"
    echo "  cd backend && npm run start:dev"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo "Start it with: cd backend && npm run start:dev"
fi
echo ""

# Step 9: Frontend status
echo -e "${YELLOW}Step 9: Checking frontend status...${NC}"
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running on port 3000${NC}"
else
    echo -e "${RED}✗ Frontend is not running${NC}"
    echo "Start it with: cd frontend && npm run dev"
fi
echo ""

# Final instructions
echo "=========================================="
echo -e "${GREEN}ASTERISK RESTART COMPLETE!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo ""
echo "1. RESTART BACKEND (important!):"
echo "   cd backend"
echo "   npm run start:dev"
echo "   (Look for: 'Asterisk ARI Connected ✓')"
echo ""
echo "2. TEST AUDIO:"
echo "   - Register as agent with WebRTC phone"
echo "   - Dial 999 for echo test"
echo "   - You should hear your own voice"
echo ""
echo "3. TEST CALL WITH RECORDING:"
echo "   - Make a call to 117"
echo "   - Check ./asterisk-recordings/ folder after call"
echo "   - Recording should appear as .wav file"
echo ""
echo "4. CHECK CALL LOGS:"
echo "   - Go to admin dashboard"
echo "   - Check 'Active Calls' during call"
echo "   - Check 'Call Recordings' after call"
echo ""
echo -e "${GREEN}ALL SYSTEMS READY!${NC}"
echo ""
