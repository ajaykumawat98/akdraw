# 🚀 Deploy akdraw to Vercel + Render (Free)

**Your Setup:**
- GitHub: `ajaykumawat98/akdraw`
- Frontend: Vercel (Free)
- Backend: Render (Free)
- Database: PostgreSQL on Render (Free)

---

## Step 1: Push to GitHub

Run this command in your terminal:

```bash
cd akdraw-app
./deploy.sh
```

Or manually:
```bash
cd akdraw-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ajaykumawat98/akdraw.git
git push -u origin main
```

**Before pushing, create the repo:** https://github.com/new
- Name: `akdraw`
- Public or Private
- DON'T add README (we have one)

---

## Step 2: Deploy Backend to Render

1. Go to: https://dashboard.render.com/blueprints
2. Click **"New Blueprint Instance"**
3. Connect GitHub repo: `ajaykumawat98/akdraw`
4. Render will auto-detect `render.yaml` and create:
   - ✅ PostgreSQL database
   - ✅ Backend API server
5. Wait 2-3 minutes for deployment
6. Copy your backend URL: `https://akdraw-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### Option A: Web Interface (Easiest)

1. Go to: https://vercel.com/new
2. Import GitHub repo: `ajaykumawat98/akdraw`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
4. Add Environment Variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://akdraw-backend.onrender.com` (from Step 2)
5. Click **Deploy**

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd akdraw-app/frontend
vercel --prod

# Set environment variable
vercel env add VITE_API_URL
# Enter: https://akdraw-backend.onrender.com
```

---

## ✅ Your URLs

| Service | URL |
|---------|-----|
| **Frontend** | `https://akdraw.vercel.app` |
| **Backend API** | `https://akdraw-backend.onrender.com` |
| **GitHub** | `https://github.com/ajaykumawat98/akdraw` |

---

## 🔧 Environment Variables

### Vercel (Frontend)
```
VITE_API_URL=https://akdraw-backend.onrender.com
```

### Render (Backend - Auto-configured)
```
NODE_ENV=production
PORT=10000
DB_HOST=(auto-generated)
DB_PASSWORD=(auto-generated)
JWT_SECRET=(auto-generated)
FRONTEND_URL=https://akdraw.vercel.app
```

---

## 🆘 Troubleshooting

### Backend shows "Build Failed"
1. Go to Render Dashboard → akdraw-backend → Logs
2. Check for errors
3. Common fix: Settings → Build Command → Clear cache & redeploy

### Frontend can't connect to backend
1. Check `VITE_API_URL` is set correctly in Vercel
2. Ensure backend URL has `https://` (not http)
3. Redeploy frontend after changing env vars

### Database connection errors
1. Render Dashboard → akdraw-postgres → Connect
2. Check if database is "Available"
3. If not, restart the PostgreSQL service

---

## 📊 Free Tier Limits

| Service | Limits |
|---------|--------|
| **Vercel** | 100GB bandwidth, 6,000 build minutes/month |
| **Render** | 750 hours/month (sleeps after 15 min idle) |
| **PostgreSQL** | 1GB storage, shared CPU |

**Note:** Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

## 🔄 Updates

To update your deployed app:

```bash
# Make changes locally
git add .
git commit -m "Update description"
git push origin main

# Vercel auto-deploys on push
# Render auto-deploys on push
```

---

## 🎉 Success!

Your akdraw app should now be live at:
**https://akdraw.vercel.app**

Share it with others and start drawing network diagrams!
