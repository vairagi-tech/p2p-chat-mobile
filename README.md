# P2P Chat Mobile

A decentralized peer-to-peer messaging app for React Native, bringing the power of mesh networking to mobile devices.

## Features

🚀 **Decentralized Architecture**
- No central servers required
- Pure peer-to-peer communication
- Mesh network with multi-hop routing
- Works entirely on local networks

📱 **Mobile-First Design**
- Beautiful React Native UI
- Touch-friendly interface  
- Real-time messaging
- Responsive design for all screen sizes

🔒 **Privacy & Security**
- No account registration
- No phone numbers required
- Local network only
- Ephemeral messaging

⚡ **High Performance**
- Efficient binary protocol
- Automatic message deduplication
- Smart routing with TTL
- Connection management

## Screenshots

> Coming soon - Screenshots of the mobile interface

## Installation

### Prerequisites

- Node.js 16+ 
- React Native development environment
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd p2p-chat-mobile

# Install dependencies  
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)  
npm run ios

# Run on Web
npm run web
```

## Usage

### Getting Started

1. **Launch the app** on your mobile device
2. **Enter a nickname** (2-20 characters)
3. **Choose a port** (default 8888)
4. **Start P2P Chat**

### Connecting to Peers

#### Method 1: Quick Setup Presets
- Use Alice:8888, Bob:8889, Charlie:8890 presets
- Great for testing with multiple devices

#### Method 2: Custom Connection  
- Enter unique nickname and port
- Share your IP:Port with friends
- Use `/connect <ip:port>` command to connect

### Chat Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/connect <ip:port>` | Connect to specific peer | `/connect 192.168.1.100:8888` |
| `/peers` or `/who` | List connected peers | `/who` |
| `/ping` | Ping all connected peers | `/ping` |
| `/help` | Show available commands | `/help` |
| `/clear` | Clear chat history | `/clear` |

### Sending Messages

- Type any message (without `/`) and tap **Send**
- Messages automatically route through the mesh network
- See real-time delivery status
- View peer connection status in header

## Architecture

### Protocol Compatibility

The React Native app implements the same binary protocol as the Python version:

```
Header: 8 bytes
[Type:1][TTL:1][MessageID:4][Length:2][Payload:variable]
```

This means the mobile app can communicate directly with:
- Python desktop version
- Other mobile instances  
- Any implementation using the same protocol

### Network Stack

- **Transport Layer**: TCP sockets via `react-native-tcp-socket`
- **Protocol Layer**: Binary message serialization
- **Application Layer**: React Native UI components

### Key Components

```
src/
├── protocol/
│   └── P2PProtocol.js         # Binary protocol implementation
├── network/
│   └── P2PNetworkManager.js   # Network connection management  
└── screens/
    ├── SetupScreen.js         # Initial setup/configuration
    └── ChatScreen.js          # Main chat interface
```

## Development

### File Structure

```
p2p-chat-mobile/
├── src/
│   ├── protocol/           # Protocol implementation
│   ├── network/           # Network management
│   ├── screens/           # React Native screens
│   └── components/        # Reusable UI components
├── android/               # Android-specific files
├── ios/                   # iOS-specific files (if applicable)  
├── App.js                 # Main app component
└── package.json          # Dependencies and scripts
```

### Adding Features

1. **New Message Types**: Add to `MessageType` enum in protocol
2. **UI Components**: Create in `src/components/`
3. **New Screens**: Add to `src/screens/` and update navigation
4. **Network Features**: Extend `P2PNetworkManager`

### Testing

```bash
# Test on multiple devices
npm run android    # Device 1
npm run android    # Device 2
npm run android    # Device 3

# Use different presets
# Alice:8888, Bob:8889, Charlie:8890

# Connect and test messaging
/connect <peer-ip>:<peer-port>
```

## Compatibility

### Cross-Platform Communication

The mobile app is fully compatible with:
- ✅ Python desktop version (from main project)
- ✅ Other React Native instances
- ✅ Any client implementing the same binary protocol

### Platform Support

- ✅ **Android**: Full support with TCP sockets
- ⚠️ **iOS**: May require additional configuration for network permissions
- ✅ **Web**: Limited networking capabilities (development/demo only)

## Troubleshooting

### Common Issues

**Connection Failed**
- Check device IP addresses are on same network
- Verify port numbers don't conflict
- Ensure firewall/security settings allow connections

**Peers Not Connecting**  
- Try direct IP connection: `/connect 192.168.1.100:8888`
- Check both devices are on same WiFi network
- Restart the app and try again

**Messages Not Sending**
- Verify peers are connected: `/who`  
- Check connection status in header
- Try pinging peers: `/ping`

### Network Requirements

- WiFi network (recommended)
- Same subnet for direct connections
- No corporate firewall blocking peer connections
- Mobile hotspot works for testing

## Roadmap

🚧 **In Development**
- [ ] Peer discovery via UDP broadcast
- [ ] File sharing capabilities
- [ ] End-to-end encryption
- [ ] Push notifications for background messages

🔮 **Future Plans** 
- [ ] Bluetooth mesh networking
- [ ] Voice messages
- [ ] Group chat management
- [ ] QR code connection sharing

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

This project is part of the P2P Chat suite and follows the same licensing terms.

---

**Enjoy decentralized mobile messaging! 📱🌐**
