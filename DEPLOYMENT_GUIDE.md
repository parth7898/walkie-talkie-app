# 🚀 Server Deployment Guide

## Quick Deploy Options

### Option 1: Railway.app (Easiest - Recommended)

1. **Create account**: https://railway.app
2. **Create new project**
3. **Deploy from GitHub** or upload files
4. **Add environment variables** (if needed)
5. **Get deployment URL**: `https://your-app.railway.app`

**Steps:**
```bash
# 1. Create server folder
mkdir walkie-server
cd walkie-server

# 2. Copy standalone-server.js
cp ../standalone-server.js ./server.js

# 3. Create package.json
cat > package.json << 'EOF'
{
  "name": "walkie-talkie-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.8.3"
  }
}
EOF

# 4. Install dependencies
npm install

# 5. Test locally
npm start

# 6. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main

# 7. Deploy on Railway
# - Connect GitHub repo
# - Railway will auto-deploy
```

---

### Option 2: Render.com (Free Tier)

1. **Create account**: https://render.com
2. **New Web Service**
3. **Connect GitHub repo**
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Get URL**: `https://your-app.onrender.com`

**render.yaml** (optional):
```yaml
services:
  - type: web
    name: walkie-talkie-server
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: PORT
        value: 10000
```

---

### Option 3: Heroku (Classic)

```bash
# 1. Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# 2. Login
heroku login

# 3. Create app
heroku create walkie-talkie-server

# 4. Deploy
git push heroku main

# 5. Get URL
heroku open
```

**Procfile**:
```
web: node server.js
```

---

### Option 4: Vercel (Serverless)

⚠️ **Note**: Socket.IO doesn't work well with Vercel serverless functions.
Use Railway or Render instead.

---

### Option 5: Your Own VPS (DigitalOcean, AWS, etc.)

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (process manager)
sudo npm install -g pm2

# 4. Upload files
scp -r walkie-server user@your-server-ip:/home/user/

# 5. Start server
cd walkie-server
npm install
pm2 start server.js --name walkie-server

# 6. Setup auto-restart
pm2 startup
pm2 save

# 7. Setup Nginx reverse proxy (optional)
sudo apt install nginx
```

**Nginx config** (`/etc/nginx/sites-available/walkie`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📱 Update Mobile App

After deploying server, update your app:

**File: `app/page.js`**

```javascript
// Change this line:
const SOCKET_SERVER = "https://your-server.railway.app"; // Your deployed URL

// Update socket connection:
socketRef.current = io(SOCKET_SERVER, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Remove this line (no longer needed):
// await fetch("/api/socket");
```

---

## 🧪 Test Deployment

```bash
# Test health endpoint
curl https://your-server.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-27T12:00:00.000Z"}

# Test Socket.IO connection (using wscat)
npm install -g wscat
wscat -c wss://your-server.railway.app
```

---

## 📊 Monitor Server

### Railway:
- Dashboard shows logs, metrics
- Auto-scaling available

### Render:
- Free tier: 512MB RAM
- Logs in dashboard
- Auto-deploy on git push

### PM2 (VPS):
```bash
pm2 status
pm2 logs walkie-server
pm2 monit
```

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid |
|----------|-----------|------|
| Railway | $5 credit/month | $5/month |
| Render | 750 hours/month | $7/month |
| Heroku | Discontinued | $7/month |
| VPS | - | $5-10/month |

**Recommendation**: Railway.app (easiest + reliable)

---

## 🔒 Security (Production)

Update `standalone-server.js`:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://your-app-domain.com",
      "capacitor://localhost", // For mobile app
      "http://localhost:3000" // For development
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

---

## 🎯 Quick Start (Railway)

```bash
# 1. One-click deploy
# Visit: https://railway.app/new

# 2. Click "Deploy from GitHub"

# 3. Select your repo

# 4. Railway auto-detects Node.js

# 5. Get URL from dashboard

# 6. Update app/page.js with URL

# 7. Build APK!
```

---

**You're ready to deploy! 🚀**
