# 📱 Android APK Build Guide - Walkie Talkie App

## 🎯 Overview

Aapka Next.js Walkie Talkie app ko Android APK me convert karne ke liye **Capacitor** use kar rahe hain.

## ⚠️ IMPORTANT: Server-Side Limitation

**Problem:** 
- Next.js static export (`output: 'export'`) me **API routes kaam nahi karte**
- Aapka `/pages/api/socket.js` server-side hai
- Mobile app me server nahi chal sakta

**Solution Options:**

### Option 1: External Socket.IO Server (Recommended)
Alag se Socket.IO server deploy karo:

```bash
# Separate server project banao
mkdir walkie-talkie-server
cd walkie-talkie-server
npm init -y
npm install socket.io express
```

**Server Code (`server.js`):**
```javascript
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);
  });

  socket.on('audio-message', (data) => {
    const { roomId, audio } = data;
    socket.to(roomId).emit('audio-message', { audio });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Deploy Options:**
- **Heroku** (Free tier available)
- **Railway.app** (Easy deployment)
- **Render.com** (Free tier)
- **Your own VPS**

**Update Client Code:**
```javascript
// app/page.js me change karo
const SOCKET_SERVER = "https://your-server.herokuapp.com"; // Your deployed server URL

socketRef.current = io(SOCKET_SERVER, {
  transports: ['websocket', 'polling']
});
```

### Option 2: Use WebRTC (Peer-to-Peer)
Socket.IO ki jagah WebRTC use karo - direct peer-to-peer connection:
- No server needed
- Better for voice/video
- More complex implementation

### Option 3: Firebase Realtime Database
Firebase use karo messaging ke liye:
- Free tier available
- Easy setup
- Good for small apps

---

## 📦 APK Build Steps (After Server Setup)

### Step 1: Install Android Studio
```bash
# Download from: https://developer.android.com/studio
# Install Android SDK
```

### Step 2: Build Next.js Static Export
```bash
npm run export
```

This creates `out/` folder with static files.

### Step 3: Add Android Platform
```bash
npm run cap:init
```

### Step 4: Sync Files to Android
```bash
npm run cap:sync
```

### Step 5: Open in Android Studio
```bash
npm run cap:open
```

### Step 6: Build APK in Android Studio
1. Android Studio open hoga
2. **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
3. Wait for build to complete
4. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔧 Capacitor Configuration

**File: `capacitor.config.json`**
```json
{
  "appId": "com.walkietalkie.app",
  "appName": "Walkie Talkie",
  "webDir": "out",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}
```

---

## 📱 Android Permissions

**File: `android/app/src/main/AndroidManifest.xml`**

Add these permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
```

---

## 🚀 Quick Build Command

```bash
# Complete build process
npm run build:android
```

This will:
1. Build Next.js static export
2. Sync files to Android
3. Open Android Studio

---

## 🧪 Testing APK

### On Emulator:
1. Android Studio me emulator start karo
2. Run button click karo

### On Real Device:
1. Phone me **Developer Options** enable karo
2. **USB Debugging** enable karo
3. USB se connect karo
4. Android Studio me device select karo
5. Run karo

### Install APK Directly:
```bash
# APK file phone me transfer karo
# File manager se open karo
# Install karo (Unknown sources allow karna padega)
```

---

## 📊 Build Variants

### Debug APK (Testing)
```
android/app/build/outputs/apk/debug/app-debug.apk
```
- Large size
- Not optimized
- For testing only

### Release APK (Production)
1. Generate signing key:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Build > Generate Signed Bundle / APK
3. Select APK
4. Create new keystore or use existing
5. Build release APK

---

## 🎨 App Icon & Splash Screen

### Add App Icon:
```bash
# Place icon in: android/app/src/main/res/
# Different sizes:
# - mipmap-hdpi (72x72)
# - mipmap-mdpi (48x48)
# - mipmap-xhdpi (96x96)
# - mipmap-xxhdpi (144x144)
# - mipmap-xxxhdpi (192x192)
```

### Add Splash Screen:
Use Capacitor plugin:
```bash
npm install @capacitor/splash-screen
```

---

## ⚡ Performance Tips

1. **Optimize Images**: Use WebP format
2. **Minimize Bundle**: Remove unused dependencies
3. **Enable Proguard**: For smaller APK size
4. **Use CDN**: For static assets

---

## 🐛 Common Issues

### Issue 1: "API routes not working"
**Solution:** Use external server (see Option 1 above)

### Issue 2: "Notifications not showing"
**Solution:** Add notification permissions in AndroidManifest.xml

### Issue 3: "Audio not recording"
**Solution:** Add RECORD_AUDIO permission

### Issue 4: "APK too large"
**Solution:** 
- Enable Proguard
- Remove unused dependencies
- Use release build

---

## 📝 Complete Workflow

```bash
# 1. Setup external Socket.IO server
# Deploy to Heroku/Railway

# 2. Update client code with server URL
# Edit app/page.js

# 3. Build static export
npm run export

# 4. Initialize Android
npm run cap:init

# 5. Sync files
npm run cap:sync

# 6. Open Android Studio
npm run cap:open

# 7. Build APK
# In Android Studio: Build > Build APK

# 8. Install on device
# Transfer APK and install
```

---

## 🎯 Next Steps

1. **Deploy Socket.IO Server** (Most Important!)
2. **Update client code** with server URL
3. **Test locally** with `npm run dev`
4. **Build APK** following steps above
5. **Test on real device**
6. **Publish to Play Store** (optional)

---

## 📞 Support

For issues:
- Check console logs in Chrome DevTools
- Check Android Logcat in Android Studio
- Test on multiple devices

**Happy Building! 🚀**
