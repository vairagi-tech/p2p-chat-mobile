# 🚀 Quick APK Build Guide - P2P Chat Mobile

## ⚡ Super Quick Method (5 minutes)

### Step 1: Prerequisites
- Have Node.js installed
- Create free account at https://expo.dev

### Step 2: Run Build Script
```bash
cd /home/vairagi/p2p-chat-mobile
./build-apk.sh
```

### Step 3: Wait & Download
- Build takes 10-15 minutes
- Get download link from https://expo.dev
- Install APK on Android device

---

## 🎯 Manual Commands (if you prefer)

```bash
cd /home/vairagi/p2p-chat-mobile

# Login to Expo (one time)
npx eas login

# Build APK
npx eas build --platform android --profile preview

# Check build status
npx eas build:list
```

---

## 📱 Testing Your APK

1. **Download APK** from Expo dashboard
2. **Transfer to Android device** (USB, email, cloud storage)
3. **Enable Unknown Sources** in Android settings
4. **Install APK** by tapping the file
5. **Test P2P functionality**:
   - Install on 2+ devices
   - Connect to same WiFi
   - Use different nicknames
   - Connect with `/connect <ip:port>`
   - Start chatting!

---

## 🔧 Troubleshooting

**Build Failed?**
- Check internet connection
- Verify Expo account login: `npx eas whoami`
- Try again: `npx eas build --platform android --profile preview`

**APK Won't Install?**
- Enable "Install from Unknown Sources" in Android settings
- Check if you have enough storage space
- Try transferring APK file again

**Can't Connect Peers?**
- Ensure both devices on same WiFi network
- Check firewall settings
- Try direct IP connection: `/connect 192.168.1.X:8888`

---

## 🎉 Success!

Once you have the APK working, you've got a fully functional P2P chat app that:
- Works without internet servers
- Connects directly device-to-device
- Routes messages through mesh network
- Maintains privacy and security
- Compatible with Python desktop version

**Enjoy your decentralized messaging app!** 📱🌐💬
