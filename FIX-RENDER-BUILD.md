# 🔧 Fix Render Build Error

The build failed because dependencies weren't being installed properly. I've updated the config.

## What Changed

1. **render.yaml** - Changed `rootDir` to `backend` and fixed build command
2. **backend/Dockerfile** - Now properly installs dependencies before building
3. **backend/package.json** - Updated with correct scripts

## How to Redeploy

### Option 1: Manual Deploy on Render

1. Go to: https://dashboard.render.com/web-services
2. Find `akdraw-backend`
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Option 2: Push New Code

```bash
cd akdraw-app

# Configure git (if not done)
git config user.name "ajaykumawat98"
git config user.email "your@email.com"

# Push the fix
git add .
git commit -m "Fix Render build config"
git push origin main
```

### Option 3: Delete and Recreate

If it still fails:

1. Go to: https://dashboard.render.com/web-services
2. Delete `akdraw-backend` service
3. Go to: https://dashboard.render.com/blueprints
4. Delete the blueprint instance
5. Click **"New Blueprint Instance"**
6. Connect your repo again
7. Wait for auto-deploy

---

## 🆘 If Build Still Fails

Go to Render Dashboard → `akdraw-backend` → **Settings** → Change:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run migrate && npm start
```

Then click **Manual Deploy**.

---

## ✅ Expected Flow

1. Render clones your repo
2. `npm install` installs all dependencies
3. `npm run build` compiles TypeScript
4. `npm run migrate` sets up database
5. `npm start` starts the server

**Build takes ~2-3 minutes** (Puppeteer is large).
