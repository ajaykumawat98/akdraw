# Vercel Deployment Setup

## Fix Environment Variable Error

The error occurs because `vercel.json` referenced a secret that doesn't exist yet.

## Solution

### Option 1: Deploy Without Environment Variable First

1. Go to https://vercel.com/new
2. Import your GitHub repo: `ajaykumawat98/akdraw`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (root)
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
4. **DO NOT add any environment variables yet**
5. Click **Deploy**

### Option 2: Add Environment Variable After Backend is Ready

After your Render backend is deployed:

1. Get your backend URL: `https://akdraw-backend.onrender.com`
2. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
3. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://akdraw-backend.onrender.com`
4. Click **Save**
5. Go to **Deployments** tab → Click **...** on latest deployment → **Redeploy**

### Option 3: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy without env vars first
cd akdraw-app/frontend
vercel --prod

# After Render backend is ready, add env var:
vercel env add VITE_API_URL
# Enter: https://akdraw-backend.onrender.com

# Redeploy
vercel --prod
```

## Checklist

- [ ] Deploy backend to Render first (get the URL)
- [ ] Deploy frontend to Vercel
- [ ] Add `VITE_API_URL` environment variable in Vercel
- [ ] Redeploy frontend

## Your URLs Will Be

| Service | URL |
|---------|-----|
| Frontend | `https://akdraw.vercel.app` |
| Backend | `https://akdraw-backend.onrender.com` |

## Troubleshooting

**"Secret does not exist" error:**
- Remove any `@` references from vercel.json
- Add environment variables through Vercel Dashboard instead

**CORS errors:**
- Make sure `FRONTEND_URL` in Render matches your Vercel URL
- Backend must allow requests from frontend domain

**API not connecting:**
- Check that `VITE_API_URL` has `https://` (not http)
- No trailing slash on the URL
