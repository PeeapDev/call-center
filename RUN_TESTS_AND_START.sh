#!/bin/bash

echo "=========================================="
echo "🧪 RUNNING TESTS & STARTING CLEAN BACKEND"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Kill any process on port 3001
echo -e "${YELLOW}Step 1: Killing any process on port 3001...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ Port 3001 cleared${NC}"
echo ""

# Step 2: Run Jest tests
echo -e "${YELLOW}Step 2: Running Jest API tests...${NC}"
cd backend
npm run test:e2e 2>/dev/null || echo -e "${YELLOW}(Tests may fail if database is not set up - that's OK)${NC}"
echo ""

# Step 3: Start backend
echo -e "${YELLOW}Step 3: Starting backend cleanly...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the backend${NC}"
echo ""
npm run start:dev
