# Deployment Guide

## GitHub Repository Setup

1. **Create a new repository on GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: akdraw full-stack application"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/akdraw.git
   git push -u origin main
   ```

## Local Development

### Option 1: Using Docker (Recommended)

```bash
# Start all services with one command
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run migrate
npm run dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Production Deployment

### Deploy to Render.com

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install && cd backend && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables from `.env.example`

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Deploy to AWS (EC2 + RDS)

1. Create RDS PostgreSQL instance
2. Launch EC2 instance
3. Install Docker on EC2
4. Clone repository and run:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## Environment Variables

### Backend (.env)
```
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=akdraw
DB_PASSWORD=your-secure-password
DB_NAME=akdraw
JWT_SECRET=your-super-secret-key
PORT=3001
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend (.env)
```
VITE_API_URL=https://your-api-url.com
```

## SSL/HTTPS Setup

For production, use a reverse proxy like Nginx or Caddy:

```nginx
server {
    listen 443 ssl;
    server_name akdraw.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5173;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
    }
    
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Monitoring

- Health check endpoint: `GET /health`
- Use PM2 for process management in production
- Set up logging with Winston or similar

## Backup

```bash
# Backup database
docker exec akdraw_postgres_1 pg_dump -U akdraw akdraw > backup.sql

# Restore database
docker exec -i akdraw_postgres_1 psql -U akdraw akdraw < backup.sql
```
