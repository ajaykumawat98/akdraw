# 🚀 Quick Start Guide

## Step 1: Push to GitHub (5 minutes)

### Option A: Use the Script
```bash
cd akdraw-app
./setup-github.sh
```

### Option B: Manual Commands
```bash
cd akdraw-app

# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: akdraw"

# 4. Add your GitHub repository (replace with yours)
git remote add origin https://github.com/YOUR_USERNAME/akdraw.git

# 5. Push to GitHub
git push -u origin main
```

**Before pushing, create an empty repository on GitHub:**
1. Go to https://github.com/new
2. Name it "akdraw"
3. Don't add README/license (we already have them)
4. Click "Create repository"

---

## Step 2: Deploy Backend + Database (Free Options)

### Option A: Render.com (Recommended - Free Tier)
```bash
./deploy-render.sh
```
Then go to https://dashboard.render.com/blueprints and connect your repo.

### Option B: Railway (Free Tier)
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Option C: Fly.io
```bash
npm i -g flyctl
flyctl launch
flyctl deploy
```

---

## Step 3: Deploy Frontend

### Option A: Vercel (Free & Fast)
```bash
./deploy-vercel.sh
```

### Option B: Netlify
```bash
npm i -g netlify-cli
cd frontend
netlify deploy --prod --dir=dist
```

### Option C: GitHub Pages
1. Go to your repo on GitHub
2. Settings → Pages
3. Source: GitHub Actions
4. Use the provided workflow in `.github/workflows/`

---

## 📋 Complete File Structure

```
akdraw/
├── backend/
│   ├── src/
│   │   ├── db/              # Database schema
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/          # API routes
│   │   ├── services/        # WebSocket service
│   │   └── utils/           # JWT, passwords
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Canvas engine, WebSocket
│   │   ├── pages/           # Home, Login, Canvas, etc.
│   │   ├── stores/          # Zustand stores
│   │   └── utils/           # API client
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── .github/workflows/       # CI/CD
├── docker-compose.yml       # Local development
├── README.md                # Full documentation
├── DEPLOYMENT.md            # Detailed deployment guide
├── setup-github.sh          # GitHub setup script
├── deploy-render.sh         # Render deployment
├── deploy-vercel.sh         # Vercel deployment
└── package.json             # Root package.json
```

**Total files:** ~50 source files + configs

---

## 🌐 Environment Variables Needed

### Backend
```
DB_HOST=
DB_PORT=5432
DB_USER=akdraw
DB_PASSWORD=
DB_NAME=akdraw
JWT_SECRET=
PORT=3001
FRONTEND_URL=
```

### Frontend
```
VITE_API_URL=
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Can register/login
- [ ] Can create a new canvas
- [ ] Can add text boxes and shapes
- [ ] Pan and zoom works
- [ ] Real-time sync works (open two browsers)

---

## 🆘 Need Help?

1. Check the logs: `docker-compose logs` or platform-specific logs
2. Verify database is running and accessible
3. Check CORS settings match your frontend URL
4. Ensure WebSocket connections aren't blocked

**Common Issues:**
- **Database connection failed**: Check DB_HOST and credentials
- **CORS errors**: FRONTEND_URL must match your actual frontend URL
- **WebSocket not connecting**: Some platforms need explicit WebSocket configuration
