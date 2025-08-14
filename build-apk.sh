#!/bin/bash
# build-apk.sh - Quick APK builder for P2P Chat Mobile

echo "🚀 P2P Chat Mobile - APK Builder"
echo "================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the p2p-chat-mobile directory."
    exit 1
fi

# Check if Node.js is available
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npm not found. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

# Check if EAS CLI is available
echo "🔧 Checking EAS CLI..."
if ! npx eas --version &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install eas-cli --save-dev
fi

echo "✅ EAS CLI ready"

# Check Expo login status
echo "🔐 Checking Expo login..."
if ! npx eas whoami &> /dev/null; then
    echo "⚠️  You need to login to Expo to build APK"
    echo "   1. Go to https://expo.dev and create a free account"
    echo "   2. Run: npx eas login"
    echo ""
    read -p "Do you want to login now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx eas login
        if [ $? -ne 0 ]; then
            echo "❌ Login failed. Please try again."
            exit 1
        fi
    else
        echo "❌ Expo login required for building APK. Exiting."
        exit 1
    fi
else
    EXPO_USER=$(npx eas whoami)
    echo "✅ Logged in as: $EXPO_USER"
fi

# Configure EAS build if needed
if [ ! -f "eas.json" ]; then
    echo "⚙️  Configuring EAS build..."
    npx eas build:configure
fi

echo "✅ EAS configuration ready"

# Show build options
echo ""
echo "📱 Build Options:"
echo "1. Preview APK (for testing) - Recommended"
echo "2. Production APK (for release)"
echo ""
read -p "Choose build type (1 or 2, default is 1): " build_choice

if [ "$build_choice" = "2" ]; then
    BUILD_PROFILE="production"
    echo "🏗️  Building production APK..."
else
    BUILD_PROFILE="preview"
    echo "🏗️  Building preview APK..."
fi

# Start the build
echo ""
echo "⏳ Starting APK build (this may take 10-15 minutes)..."
echo "   You can close this terminal - the build continues in the cloud"
echo ""

npx eas build --platform android --profile $BUILD_PROFILE

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 APK Build Initiated Successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Check your build status: https://expo.dev/"
    echo "2. Download APK when build completes"
    echo "3. Install on Android device"
    echo "4. Enable 'Install from Unknown Sources' if prompted"
    echo "5. Test P2P chat functionality!"
    echo ""
    echo "💡 Pro Tips:"
    echo "• Install on multiple devices for testing"
    echo "• Connect devices to same WiFi network"
    echo "• Use different nicknames (Alice, Bob, Charlie)"
    echo "• Connect with /connect <ip:port> command"
    echo ""
    echo "🌟 Build initiated! Check Expo dashboard for progress."
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
