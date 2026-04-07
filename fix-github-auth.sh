#!/bin/bash

echo "🔧 GitHub Authentication Fix"
echo "============================"
echo ""
echo "GitHub no longer accepts passwords. You need a Personal Access Token (PAT)."
echo ""

# Check current remote
echo "Current remote URL:"
git remote -v
echo ""

echo "Step 1: Create a Personal Access Token"
echo "--------------------------------------"
echo "1. Go to: https://github.com/settings/tokens/new"
echo "2. Token name: akdraw-deploy"
echo "3. Expiration: 90 days (or No expiration)"
echo "4. Select scopes:"
echo "   ☑️ repo (Full control of private repositories)"
echo "   ☑️ workflow (if you want to update GitHub Actions)"
echo "5. Click 'Generate token'"
echo "6. COPY THE TOKEN IMMEDIATELY (you can't see it again!)"
echo ""

echo "Step 2: Update Git Remote URL"
echo "-----------------------------"
echo "Run this command with your token:"
echo ""
echo "   git remote set-url origin https://ajaykumawat98:YOUR_TOKEN@github.com/ajaykumawat98/akdraw.git"
echo ""

echo "Step 3: Push again"
echo "------------------"
echo "   git push -u origin main"
echo ""

echo "Alternative: Use SSH (more secure)"
echo "----------------------------------"
echo "1. Generate SSH key:"
echo "   ssh-keygen -t ed25519 -C 'your@email.com'"
echo ""
echo "2. Add to GitHub:"
echo "   cat ~/.ssh/id_ed25519.pub"
echo "   Copy output → https://github.com/settings/keys → New SSH key"
echo ""
echo "3. Update remote:"
echo "   git remote set-url origin git@github.com:ajaykumawat98/akdraw.git"
echo ""
echo "4. Push:"
echo "   git push -u origin main"
echo ""

read -p "Press Enter after you've created your token..."

echo ""
echo "Enter your Personal Access Token:"
echo "(Token will not be displayed for security)"
read -s TOKEN

echo ""
echo "Updating remote URL with token..."
git remote set-url origin "https://ajaykumawat98:${TOKEN}@github.com/ajaykumawat98/akdraw.git"

echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Code pushed to GitHub."
    echo ""
    echo "Removing token from remote URL for security..."
    git remote set-url origin https://github.com/ajaykumawat98/akdraw.git
else
    echo ""
    echo "❌ Push failed. Check your token and try again."
fi
