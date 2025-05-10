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
echo ""
echo "To setup your server:"
echo "1. Start the database:"
echo "   cd -"
echo "   docker compose up -d"
echo ""
echo "2. Start the SHARP server:"
echo "   bun main.js"