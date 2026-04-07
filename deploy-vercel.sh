#!/bin/bash

# Deploy frontend to Vercel

echo "🚀 Deploy akdraw Frontend to Vercel"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

cd frontend

# Create vercel.json config
cat > vercel.json << 'EOF'
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
EOF

echo ""
echo "🔧 Configuration created."
echo ""
echo "To deploy:"
echo "1. Make sure you have a Vercel account: https://vercel.com/signup"
echo "2. Run: vercel login"
echo "3. Then run: vercel --prod"
echo ""
echo "Or for automatic deployment:"
echo "   vercel --prod --yes"
echo ""

# Ask if they want to deploy now
echo "Do you want to deploy now? (y/n)"
read DEPLOY

if [ "$DEPLOY" == "y" ] || [ "$DEPLOY" == "Y" ]; then
    vercel --prod
fi
