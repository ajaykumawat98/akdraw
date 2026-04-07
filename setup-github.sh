#!/bin/bash

# akdraw GitHub Setup Script
# This script will help you push akdraw to GitHub

echo "🚀 akdraw GitHub Setup"
echo "======================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Get GitHub username
echo "Enter your GitHub username:"
read GITHUB_USERNAME

# Get repository name
echo "Enter repository name (default: akdraw):"
read REPO_NAME
REPO_NAME=${REPO_NAME:-akdraw}

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit
echo "💾 Committing files..."
git commit -m "Initial commit: akdraw full-stack network canvas application" || echo "Nothing new to commit"

# Set main branch
git branch -M main

# Add remote
echo "🔗 Adding GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a repository on GitHub: https://github.com/new"
echo "   Name it: $REPO_NAME"
echo "   Make it public or private as you prefer"
echo ""
echo "2. Then push your code with:"
echo "   git push -u origin main"
echo ""
echo "Or run this script with --push to push automatically:"
echo "   ./setup-github.sh --push"
echo ""

# Push if --push flag is provided
if [ "$1" == "--push" ]; then
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    echo ""
    echo "✅ Code pushed to: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
fi
