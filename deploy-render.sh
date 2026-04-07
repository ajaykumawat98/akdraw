#!/bin/bash

# Deploy akdraw to Render.com
# This creates a render.yaml blueprint file

cat > render.yaml << 'EOF'
services:
  # PostgreSQL Database
  - type: pserv
    name: akdraw-db
    runtime: docker
    plan: starter
    dockerContext: .
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: POSTGRES_USER
        value: akdraw
      - key: POSTGRES_PASSWORD
        generateValue: true
      - key: POSTGRES_DB
        value: akdraw

  # Backend API
  - type: web
    name: akdraw-backend
    runtime: node
    plan: starter
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm run migrate && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DB_HOST
        fromService:
          type: pserv
          name: akdraw-db
          property: host
      - key: DB_PORT
        value: 5432
      - key: DB_USER
        value: akdraw
      - key: DB_PASSWORD
        fromService:
          type: pserv
          name: akdraw-db
          envVarKey: POSTGRES_PASSWORD
      - key: DB_NAME
        value: akdraw
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://akdraw-frontend.onrender.com

  # Frontend
  - type: static
    name: akdraw-frontend
    runtime: static
    buildCommand: cd frontend && npm install && npm run build
    publishPath: ./frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://akdraw-backend.onrender.com
EOF

echo "✅ render.yaml created!"
echo ""
echo "To deploy to Render.com:"
echo "1. Push your code to GitHub first"
echo "2. Go to https://dashboard.render.com/blueprints"
echo "3. Click 'New Blueprint Instance'"
echo "4. Connect your GitHub repository"
echo "5. Render will automatically deploy all services"
echo ""
