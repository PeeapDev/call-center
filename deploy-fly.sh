#!/bin/bash

# =============================================
# Fly.io Deployment Script for Call Center
# =============================================

set -e

echo "=========================================="
echo "  Call Center - Fly.io Deployment"
echo "=========================================="

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "Installing Fly.io CLI..."
    curl -L https://fly.io/install.sh | sh
    export FLYCTL_INSTALL="/home/$USER/.fly"
    export PATH="$FLYCTL_INSTALL/bin:$PATH"
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo ""
    echo "Please login to Fly.io:"
    flyctl auth login
fi

echo ""
echo "Step 1: Deploying Asterisk PBX..."
echo "=========================================="
flyctl launch --config fly.asterisk.toml --no-deploy --name callcenter-asterisk --yes || true
flyctl deploy --config fly.asterisk.toml

ASTERISK_URL=$(flyctl status --config fly.asterisk.toml --json | grep -o '"hostname":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Asterisk deployed at: $ASTERISK_URL"

echo ""
echo "Step 2: Deploying Backend..."
echo "=========================================="
cd backend
flyctl launch --no-deploy --name callcenter-backend --yes || true

echo ""
echo "Setting backend secrets..."
echo "You will need to provide these values:"
echo ""

# Prompt for secrets
read -p "Enter your Supabase DB Host (e.g., db.xxx.supabase.co): " DB_HOST
read -p "Enter your Supabase DB Password: " DB_PASSWORD
read -p "Enter a JWT Secret (or press Enter for random): " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
fi

flyctl secrets set \
    DB_HOST="$DB_HOST" \
    DB_PORT="5432" \
    DB_USERNAME="postgres" \
    DB_PASSWORD="$DB_PASSWORD" \
    DB_NAME="postgres" \
    JWT_SECRET="$JWT_SECRET" \
    ASTERISK_ARI_URL="http://$ASTERISK_URL:8088/ari" \
    ASTERISK_ARI_USER="callcenter" \
    ASTERISK_ARI_PASSWORD="change_me_ari" \
    NODE_ENV="production"

flyctl deploy

cd ..

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Asterisk: https://callcenter-asterisk.fly.dev"
echo "Backend:  https://callcenter-backend.fly.dev"
echo ""
echo "Next steps:"
echo "1. Deploy frontend to Vercel"
echo "2. Update frontend environment variables"
echo "3. Set up Supabase database"
echo ""
