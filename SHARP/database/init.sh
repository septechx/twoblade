#!/bin/bash

echo "What is your domain name? (e.g., twoblade.com)"
read DOMAIN

# Create .env file
cat > "../.env" << EOF
DOMAIN_NAME=${DOMAIN}
DATABASE_URL=postgres://postgres:REPLACE_ME@localhost:5432/postgres
SHARP_PORT=5000
EOF

echo "Created .env"

MODERATION_DIR="../../website/websocket/src"
mkdir -p "$MODERATION_DIR"
cat > "$MODERATION_DIR/moderation.ts" << EOF
// Moderation service for websocket connections
// Created by init.sh

export function checkHardcore(msg: string): boolean {
    // Placeholder implementation - should be replaced with actual detection
    return true;
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