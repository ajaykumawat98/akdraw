# 🚀 Complete Deployment Guide

**Your Setup:**
- GitHub: `ajaykumawat98/akdraw`
- Backend + Database: Render (Free)
- Frontend: Vercel (Free)

---

## Step 1: Push Fixed Code to GitHub

```bash
cd akdraw-app

# Configure git (if not done)
git config user.name "ajaykumawat98"
git config user.email "ajaykumawat98@gmail.com"

# Set remote with your Personal Access Token
git remote set-url origin https://ajaykumawat98:YOUR_GITHUB_TOKEN@github.com/ajaykumawat98/akdraw.git

# Push
git add .
git commit -m "Fix deployment configs for Render and Vercel"
git push origin main

# Remove token from URL for security
git remote set-url origin https://github.com/ajaykumawat98/akdraw.git
```

**Get your GitHub token:** https://github.com/settings/tokens/new
- Name: `deploy`
- Check: `repo` scope
- Generate and copy the token (starts with `ghp_`)

---

## Step 2: Deploy Backend to Render

### Method A: Using Blueprint (Auto)

1. Go to: https://dashboard.render.com/blueprints
2. Click **"New Blueprint Instance"**
3. Connect GitHub repo: `ajaykumawat98/akdraw`
4. Render will auto-create:
   - ✅ PostgreSQL database
   - ✅ Backend API server
5. Wait 3-5 minutes for deployment
6. Copy your backend URL: `https://akdraw-backend.onrender.com`

### Method B: Manual Web Service

If blueprint fails:

1. Go to: https://dashboard.render.com/new/web-service
2. Connect your GitHub repo
3. Configure:
   - **Name:** `akdraw-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run migrate && npm start`
4. Click **Advanced** → Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=(leave empty for now)
   DB_PORT=5432
   DB_USER=akdraw
   DB_PASSWORD=(leave empty for now)
   DB_NAME=akdraw
   JWT_SECRET=(generate random string)
   FRONTEND_URL=https://akdraw.vercel.app
   ```
5. Click **Create Web Service**
6. Create PostgreSQL: https://dashboard.render.com/new/database
   - Name: `akdraw-postgres`
   - Copy the "Internal Connection String"
   - Update DB_HOST, DB_PASSWORD in your web service env vars

---

## Step 3: Deploy Frontend to Vercel

### Method A: Web Interface

1. Go to: https://vercel.com/new
2. Import GitHub repo: `ajaykumawat98/akdraw`
3. Configure Project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as root)
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
4. **DO NOT add Environment Variables yet**
5. Click **Deploy**

### Method B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd akdraw-app/frontend
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name? akdraw
# - Directory? ./ (current)
```

---

## Step 4: Connect Backend to Frontend

### Add Environment Variable in Vercel

1. Get your Render backend URL (from Step 2)
   - Example: `https://akdraw-backend.onrender.com`

2. Go to Vercel Dashboard: https://vercel.com/dashboard
3. Click your `akdraw` project
4. Go to **Settings** tab → **Environment Variables**
5. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://akdraw-backend.onrender.com` (your actual URL)
6. Click **Save**

### Redeploy Frontend

1. In Vercel Dashboard, go to **Deployments** tab
2. Find the latest deployment
3. Click the **...** menu → **Redeploy**
4. Click **Redeploy** to confirm

---

## Step 5: Verify Everything Works

### Check Backend
```bash
curl https://akdraw-backend.onrender.com/health
```
Should return: `{"status":"ok"}`

### Check Frontend
1. Open: `https://akdraw.vercel.app`
2. You should see the landing page
3. Click "Get Started" → Register
4. Create a canvas
5. Add text boxes and shapes

### Test Real-time Collaboration
1. Open `https://akdraw.vercel.app` in two different browsers
2. Login with different accounts (or same account)
3. Open the same canvas
4. You should see each other's cursors!

---

## 🆘 Troubleshooting

### Render Build Fails
**Error:** Cannot find module 'express'

**Fix:**
1. Go to Render Dashboard → `akdraw-backend` → **Settings**
2. Change **Build Command** to: `npm install && npm run build`
3. Click **Save Changes**
4. Click **Manual Deploy** → **Deploy Latest Commit**

### Vercel "Secret does not exist"
**Fix:** Remove any `@` references from `vercel.json` (already fixed in latest code)

### "Cannot connect to backend"
**Check:**
1. `VITE_API_URL` must have `https://` not `http://`
2. No trailing slash: `https://api.example.com` not `https://api.example.com/`
3. Backend must show as "Live" on Render Dashboard

### Database connection errors
**Fix:**
1. Render Dashboard → `akdraw-postgres` → **Connect**
2. Copy the Internal URL
3. Update `DB_HOST` in `akdraw-backend` env vars
4. Redeploy backend

### CORS errors in browser console
**Fix:**
1. Render Dashboard → `akdraw-backend` → **Settings**
2. Update `FRONTEND_URL` to match your actual Vercel URL
3. Redeploy backend

---

## 📊 Your Final URLs

| Service | Expected URL |
|---------|--------------|
| **Frontend** | `https://akdraw.vercel.app` |
| **Backend API** | `https://akdraw-backend.onrender.com` |
| **GitHub Repo** | `https://github.com/ajaykumawat98/akdraw` |

---

## 🔄 Updating Your App

To push updates:

```bash
cd akdraw-app

# Make changes
git add .
git commit -m "Your update message"
git push origin main

# Vercel auto-deploys frontend
# Render auto-deploys backend (if auto-deploy is enabled)
```

---

## ✅ Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Render backend deployed and "Live"
- [ ] PostgreSQL database "Available"
- [ ] Vercel frontend deployed
- [ ] `VITE_API_URL` env var set in Vercel
- [ ] Frontend redeployed with env var
- [ ] Can register/login on the app
- [ ] Can create and edit canvases

**Estimated time:** 10-15 minutes total
