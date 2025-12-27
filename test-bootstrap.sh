#!/bin/bash

# Test script for bootstrap endpoint
# Usage: ./test-bootstrap.sh <FIREBASE_ID_TOKEN>

if [ -z "$1" ]; then
  echo "❌ Missing Firebase ID token"
  echo ""
  echo "Usage: ./test-bootstrap.sh <FIREBASE_ID_TOKEN>"
  echo ""
  echo "Example:"
  echo "  ./test-bootstrap.sh 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYzEyMzQ1In0...'"
  echo ""
  echo "To get a token:"
  echo "  1. Sign up via your Unreal client"
  echo "  2. Or use: firebase login && firebase auth:get-access-token <email>"
  exit 1
fi

TOKEN="$1"

echo "🧪 Testing POST /api/auth/bootstrap"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

curl -X POST http://localhost:3000/api/auth/bootstrap \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus: %{http_code}\n"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test complete"
