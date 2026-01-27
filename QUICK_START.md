# 🚀 Quick Start - APK Build Kaise Kare

## 📱 3 Simple Steps

### Step 1️⃣: Server Deploy Karo (5 minutes)

```bash
# Railway.app pe jao
https://railway.app

# GitHub se deploy karo ya manual upload
# File: standalone-server.js

# Server URL copy karo
# Example: https://walkie-abc123.railway.app
```

### Step 2️⃣: App Update Karo (2 minutes)

**File: `app/page.js`**

Line 24 ke baad add karo:
```javascript
const SOCKET_SERVER = "https://walkie-abc123.railway.app"; // Apna URL
```

Line 127 ko change karo:
```javascript
// BEFORE:
await fetch("/api/socket");
socketRef.current = io({
  path: "/api/socket",
});

// AFTER:
socketRef.current = io(SOCKET_SERVER, {
  transports: ['websocket', 'polling']
});
```

Line 52 ko bhi change karo (autoRejoinRoom function me):
```javascript
// BEFORE:
await fetch("/api/socket");
socketRef.current = io({
  path: "/api/socket",
});

// AFTER:
socketRef.current = io(SOCKET_SERVER, {
  transports: ['websocket', 'polling']
});
```

### Step 3️⃣: APK Build Karo (10 minutes)

```bash
# 1. Export build
npm run export

# 2. Android add karo (first time only)
npm run cap:init

# 3. Files sync karo
npm run cap:sync

# 4. Android Studio open karo
npm run cap:open

# 5. Android Studio me:
# Build > Build Bundle(s) / APK(s) > Build APK(s)

# 6. APK mil jayega:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✅ Requirements

- ✅ Node.js installed
- ✅ Android Studio installed
- ✅ Internet connection
- ✅ Railway.app account (free)

---

## 🎯 Testing

```bash
# APK phone me transfer karo
# Install karo
# App open karo
# Room join karo
# Test karo!
```

---

## 📞 Help

Agar koi problem ho:

1. **Server check karo:**
   ```bash
   curl https://your-server-url/health
   ```

2. **Logs dekho:**
   - Android Studio > Logcat
   - Browser > Console

3. **Documentation padho:**
   - `APK_BUILD_GUIDE.md` - Detailed guide
   - `DEPLOYMENT_GUIDE.md` - Server deployment
   - `README_COMPLETE.md` - Complete summary

---

**That's it! APK ready! 🎉**
