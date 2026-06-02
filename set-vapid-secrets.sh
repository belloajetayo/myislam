#!/bin/bash
# ============================================================
# My Islam — Set VAPID Secrets in Supabase
# ============================================================
# Usage:
#   1. Get your Supabase Personal Access Token from:
#      https://supabase.com/dashboard/account/tokens
#   2. Run: bash set-vapid-secrets.sh YOUR_SUPABASE_PAT
# ============================================================

PROJECT_REF="lhdksrflshusknopsrzz"
VAPID_PUBLIC_KEY="BGNiIskKFEbs4Fpzoi-F_-_n1D7BNGTVGldFCJd8k0XItL27r6DPrU9wogKC29342IPwkXy0YsS-r3YecBtVX3w"
VAPID_PRIVATE_KEY="e8khHZIaye6s8W31JrTydxxuhl5In9de3RPXCDl4WDM"

PAT="$1"

if [ -z "$PAT" ]; then
  echo "❌  Usage: bash set-vapid-secrets.sh YOUR_SUPABASE_PERSONAL_ACCESS_TOKEN"
  echo ""
  echo "Get your token at: https://supabase.com/dashboard/account/tokens"
  exit 1
fi

echo "🔑 Setting VAPID secrets for project $PROJECT_REF..."

RESPONSE=$(curl -sS -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/secrets" \
  -H "Authorization: Bearer $PAT" \
  -H "Content-Type: application/json" \
  -d "[
    {\"name\": \"VAPID_PUBLIC_KEY\", \"value\": \"$VAPID_PUBLIC_KEY\"},
    {\"name\": \"VAPID_PRIVATE_KEY\", \"value\": \"$VAPID_PRIVATE_KEY\"}
  ]")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "error"; then
  echo ""
  echo "❌ Failed to set secrets. Check your Personal Access Token and try again."
else
  echo ""
  echo "✅ VAPID secrets set successfully!"
  echo ""
  echo "Public Key:  $VAPID_PUBLIC_KEY"
  echo "Private Key: (hidden)"
fi
