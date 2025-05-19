#!/bin/bash

echo "What is your domain name? (e.g., twoblade.com)"
read DOMAIN

# Create .env file
cat > "../.env" << EOF
DOMAIN_NAME=${DOMAIN}
DATABASE_URL=postgres://postgres:REPLACE_ME@localhost:5432/postgres
SHARP_PORT=5000
HTTP_PORT=5001

# Optional but required for Turnstile spam prevention in production
# These are the test keys that will accept any token
PRIVATE_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# Used for authentication, must match ../website/.env
JWT_SECRET=REPLACE_ME_WITH_RANDOM_STRING
EOF

echo "Created .env"
echo "NOTE: Replace JWT_SECRET with a secure value (use 'openssl rand -hex 64'). IT MUST MATCH ../website/.env"
echo "NOTE: In production, replace Turnstile key with your actual key from Cloudflare"

MODERATION_DIR="../website/websocket/src"
mkdir -p "$MODERATION_DIR"
cat > "$MODERATION_DIR/moderation.ts" << EOF
// Moderation service for websocket connections
// Created by init.sh

export function checkHardcore(msg: string): boolean {
    // Placeholder implementation - should be replaced with actual detection
    return false;
}
EOF

echo "Created moderation.ts in $MODERATION_DIR"
echo ""
echo "To setup your server:"
echo "1. Start the database:"
echo "   cd -"
echo "   docker compose up -d"
echo ""
echo "2. Start the SHARP server:"
echo "   bun main.js"
