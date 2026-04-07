#!/bin/bash

# akdraw Deployment Script
# Username: ajaykumawat98
# Repo: akdraw
# Frontend: Vercel
# Backend: Render

echo "🚀 akdraw Deployment Script"
echo "============================"
echo ""
echo "GitHub: ajaykumawat98/akdraw"
echo "Frontend: Vercel (Free)"
echo "Backend: Render (Free)"
echo "Database: PostgreSQL on Render (Free)"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"

# Step 2: Initialize and push to GitHub
echo ""
echo -e "${BLUE}Step 2: Setting up GitHub repository...${NC}"

if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

git add .
git commit -m "Initial commit: akdraw full-stack network canvas app" || echo "Already committed"
git branch -M main

# Remove existing origin if exists
git remote remove origin 2>/dev/null || true

# Add your GitHub repository
echo "🔗 Adding remote: https://github.com/ajaykumawat98/akdraw.git"
git remote add origin https://github.com/ajaykumawat98/akdraw.git

echo ""
echo -e "${GREEN}✅ GitHub setup complete!${NC}"
echo ""

# Step 3: Push to GitHub
echo -e "${BLUE}Step 3: Pushing to GitHub...${NC}"
echo "This will push all files to: https://github.com/ajaykumawat98/akdraw"
echo ""
read -p "Have you created an empty repository on GitHub? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo ""
    echo "Please create the repository first:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: akdraw"
    echo "3. Keep it Public (or Private if you prefer)"
    echo "4. DON'T initialize with README (we have one already)"
    echo "5. Click 'Create repository'"
    echo "6. Then run this script again"
    exit 0
fi

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Code pushed to GitHub successfully!${NC}"
    echo "📁 Repository: https://github.com/ajaykumawat98/akdraw"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   - Repository doesn't exist (create it first)"
    echo "   - Authentication issues (check git credentials)"
    echo "   - Network issues"
    exit 1
fi

# Step 4: Deployment instructions
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Code is now on GitHub!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}Next: Deploy to Vercel + Render${NC}"
echo ""
echo "📱 FRONTEND (Vercel):"
echo "   1. Go to: https://vercel.com/new"
echo "   2. Import your GitHub repo: ajaykumawat98/akdraw"
echo "   3. Framework Preset: Vite"
echo "   4. Root Directory: ./ (root)"
echo "   5. Build Command: cd frontend && npm run build"
echo "   6. Output Directory: frontend/dist"
echo "   7. Add Environment Variable:"
echo "      Name: VITE_API_URL"
echo "      Value: (leave empty for now, we'll get this from Render)"
echo "   8. Click Deploy"
echo ""
echo "⚙️ BACKEND (Render):"
echo "   1. Go to: https://dashboard.render.com/blueprints"
echo "   2. Click 'New Blueprint Instance'"
echo "   3. Connect your GitHub repo: ajaykumawat98/akdraw"
echo "   4. Render will auto-detect render.yaml and create:"
echo "      - PostgreSQL database"
echo "      - Backend API server"
echo "   5. Wait for deployment (2-3 minutes)"
echo ""
echo "🔗 CONNECT THEM:"
echo "   1. Copy your Render backend URL (e.g., https://akdraw-backend.onrender.com)"
echo "   2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
echo "   3. Add: VITE_API_URL = https://akdraw-backend.onrender.com"
echo "   4. Redeploy frontend"
echo ""
echo -e "${GREEN}✅ Your app will be live at: https://akdraw.vercel.app${NC}"
echo ""
echo "Need help? Check the full guide: DEPLOYMENT.md"
