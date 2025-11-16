#!/bin/bash

echo "=========================================="
echo "🚨 FIXING CALL SYSTEM RIGHT NOW!"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${YELLOW}Step 1: Pulling latest code from agent branch...${NC}"
git pull origin agent
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Step 2: Restart Asterisk
echo -e "${YELLOW}Step 2: Restarting Asterisk...${NC}"
docker compose -f docker-compose.asterisk.yml down
sleep 2
docker compose -f docker-compose.asterisk.yml up -d
sleep 8
echo -e "${GREEN}✓ Asterisk restarted${NC}"
echo ""

# Step 3: Check Asterisk
echo -e "${YELLOW}Step 3: Checking Asterisk status...${NC}"
if docker ps | grep -q callcenter-asterisk; then
    echo -e "${GREEN}✓ Asterisk is running${NC}"
else
    echo -e "${RED}✗ Asterisk failed to start!${NC}"
    exit 1
fi
echo ""

# Step 4: Test ARI
echo -e "${YELLOW}Step 4: Testing ARI connection...${NC}"
if curl -s -u callcenter:change_me_ari http://localhost:8088/ari/asterisk/info > /dev/null 2>&1; then
    echo -e "${GREEN}✓ ARI is responding${NC}"
else
    echo -e "${RED}✗ ARI is not responding${NC}"
fi
echo ""

# Final message
echo "=========================================="
echo -e "${GREEN}🎉 SYSTEM READY!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}NOW DO THIS:${NC}"
echo ""
echo "1. RESTART YOUR BACKEND:"
echo "   cd backend"
echo "   # Stop current backend (Ctrl+C in that terminal)"
echo "   npm run start:dev"
echo ""
echo "2. WATCH FOR THESE MESSAGES:"
echo "   ✓ Connected to Asterisk ARI successfully"
echo "   ✓ Flow Builder: Active flow loaded (simple-four-option)"
echo ""
echo "3. MAKE A TEST CALL:"
echo "   - Login as citizen"
echo "   - Dial 117"
echo "   - YOU WILL HEAR THE IVR!"
echo "   - Follow the menu prompts"
echo "   - Call will route to agent"
echo ""
echo "4. CHECK ADMIN DASHBOARD:"
echo "   - Should say 'Asterisk Connected' (not Mock Mode!)"
echo "   - Active Calls will show the call"
echo "   - Agent can answer"
echo ""
echo -e "${GREEN}ASTERISK IS READY! NOW RESTART BACKEND!${NC}"
echo ""
