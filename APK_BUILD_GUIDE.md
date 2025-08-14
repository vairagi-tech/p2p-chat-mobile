# 📱 P2P Chat Mobile - APK Build Guide

This guide shows you how to generate an APK file for the P2P Chat mobile app using different methods.

## 🚀 Quick Methods Overview

| Method | Difficulty | Time | Requirements |
|--------|------------|------|-------------|
| **Method 1: EAS Build (Cloud)** | ⭐ Easy | 10-15 min | Expo account |
| **Method 2: Expo Build (Local)** | ⭐⭐ Medium | 5-10 min | Android SDK |
| **Method 3: Manual Build** | ⭐⭐⭐ Hard | 30+ min | Full dev setup |

---

## 🌟 Method 1: EAS Build (Recommended)

**Pros**: Easy, no local setup needed, cloud building
**Cons**: Requires Expo account, internet connection

### Step 1: Install EAS CLI
```bash
cd /home/vairagi/p2p-chat-mobile

# Install EAS CLI locally (already done)
npm install eas-cli --save-dev
```

### Step 2: Setup Expo Account
```bash
# Login to Expo (create account if needed)
npx eas login

# Initialize EAS project
npx eas build:configure
```

### Step 3: Build APK
```bash
# Build APK for testing (preview build)
npx eas build --platform android --profile preview

# Or build production APK
npx eas build --platform android --profile production
```

### Step 4: Download APK
- EAS will provide a download link
- Install on your Android device
- Share with others for testing

---

## 🔧 Method 2: Expo Development Build (Local)

**Pros**: Local build, faster iterations
**Cons**: Requires Android SDK setup

### Step 1: Check Android SDK
```bash
# Check if Android SDK is installed
echo $ANDROID_HOME
adb --version
```

### Step 2: Install Android Dependencies
```bash
# Install Android SDK if not present
sudo apt update
sudo apt install android-sdk

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Step 3: Build Development APK
```bash
# Start Expo development build
npx expo run:android

# This creates a debug APK at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🛠️ Method 3: Manual Gradle Build

**Pros**: Full control, customizable
**Cons**: Complex setup, requires Android development knowledge

### Step 1: Eject from Expo (if needed)
```bash
# Only if you need native code access
npx expo eject
```

### Step 2: Build with Gradle
```bash
cd android

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# APK will be in:
# android/app/build/outputs/apk/debug/app-debug.apk
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎯 Quick & Easy Method (Recommended for Testing)

If you just want to test the app quickly, use this simple approach:

### Step 1: Create Expo Account
```bash
# Go to https://expo.dev and create a free account
# Then login:
npx eas login
```

### Step 2: Build APK in Cloud
```bash
cd /home/vairagi/p2p-chat-mobile

# Build preview APK (fastest)
npx eas build --platform android --profile preview --non-interactive
```

### Step 3: Install on Device
- EAS will give you a download URL
- Open URL on Android device
- Download and install APK
- Enable "Install from Unknown Sources" if needed

---

## 📱 Testing the APK

### Install on Device
```bash
# If you have device connected via USB
adb install path/to/your-app.apk

# Or share APK file and install manually on device
```

### Test P2P Functionality
1. Install APK on multiple devices
2. Connect devices to same WiFi network
3. Open app on each device with different nicknames
4. Use `/connect <ip:port>` to connect peers
5. Start chatting across devices!

---

## 🔒 Production Build Considerations

### Code Signing
For production APKs, you'll need to sign them:

```bash
# Generate keystore
keytool -genkey -v -keystore p2p-chat-key.keystore -alias p2p-chat -keyalg RSA -keysize 2048 -validity 10000

# Add to app.json or eas.json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.p2pchat"
    }
  }
}
```

### App Configuration
Make sure to update `app.json`:

```json
{
  "expo": {
    "name": "P2P Chat",
    "slug": "p2p-chat-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1976D2"
    },
    "android": {
      "package": "com.p2pchat.mobile",
      "versionCode": 1,
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.ACCESS_WIFI_STATE"
      ]
    }
  }
}
```

---

## ⚡ Quick Start Script

I'll create a script to automate the APK build process:

```bash
#!/bin/bash
# build-apk.sh - Quick APK builder

echo "🚀 Building P2P Chat APK..."

# Check if EAS is available
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npm not found. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if logged in to Expo
echo "🔐 Checking Expo login..."
if ! npx eas whoami &> /dev/null; then
    echo "Please login to Expo:"
    npx eas login
fi

# Build APK
echo "🏗️ Building APK (this may take 10-15 minutes)..."
npx eas build --platform android --profile preview --non-interactive

echo "✅ Build complete! Check your Expo dashboard for download link."
echo "📱 Install the APK on your Android device and start chatting!"
```

---

## 🎉 Summary

**For Quick Testing**: Use Method 1 (EAS Build) - just need an Expo account
**For Development**: Use Method 2 (Local Build) - requires Android SDK
**For Production**: Use Method 3 (Manual) - full control and signing

The **easiest way** is to run:
```bash
npx eas login
npx eas build --platform android --profile preview
```

This will build your APK in the cloud and give you a download link!

🎯 **Next Steps**: Once you have the APK, install it on multiple Android devices, connect them to the same WiFi network, and test the P2P chat functionality between them!
