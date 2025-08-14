/**
 * Main Chat Screen Component
 * Provides the chat interface for P2P messaging
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { P2PNetworkManager } from '../network/P2PNetworkManager';

const ChatScreen = ({ route, navigation }) => {
  const { nickname, port } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [peers, setPeers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('Connecting...');
  
  const networkManager = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    initializeNetwork();
    
    return () => {
      if (networkManager.current) {
        networkManager.current.stop();
      }
    };
  }, []);

  const initializeNetwork = async () => {
    try {
      networkManager.current = new P2PNetworkManager(port, nickname);
      
      // Set up event handlers
      networkManager.current.onMessage = handleMessage;
      networkManager.current.onPeerJoined = handlePeerJoined;
      networkManager.current.onPeerLeft = handlePeerLeft;
      networkManager.current.onConnectionError = handleConnectionError;
      
      // Start the network
      await networkManager.current.start();
      setIsConnected(true);
      setNetworkStatus('Connected');
      
      // Add system message
      addSystemMessage(`🚀 P2P Chat started on port ${port}`);
      addSystemMessage(`📱 Your nickname: ${nickname}`);
      addSystemMessage(`💡 Tip: Use commands like /connect <ip:port> to connect to peers`);
      
    } catch (error) {
      console.error('Failed to start network:', error);
      setNetworkStatus('Connection Failed');
      Alert.alert('Connection Error', 'Failed to start P2P network: ' + error.message);
    }
  };

  const handleMessage = (sender, text, isOwn) => {
    const message = {
      id: Date.now() + Math.random(),
      sender,
      text,
      timestamp: new Date(),
      isOwn,
      type: 'message'
    };
    
    setMessages(prev => [...prev, message]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const handlePeerJoined = (peer) => {
    setPeers(prev => [...prev.filter(p => p.key !== peer.key), peer]);
    addSystemMessage(`→ ${peer.nickname || peer.key} joined the network`);
  };

  const handlePeerLeft = (peer) => {
    setPeers(prev => prev.filter(p => p.key !== peer.key));
    addSystemMessage(`← ${peer.nickname || peer.key} left the network`);
  };

  const handleConnectionError = (error) => {
    addSystemMessage(`⚠️ Connection error: ${error.message}`);
  };

  const addSystemMessage = (text) => {
    const message = {
      id: Date.now() + Math.random(),
      sender: 'System',
      text,
      timestamp: new Date(),
      isOwn: false,
      type: 'system'
    };
    
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    
    if (text.startsWith('/')) {
      handleCommand(text.substring(1));
    } else {
      if (networkManager.current && peers.length > 0) {
        networkManager.current.sendMessage(text);
        setInputText('');
      } else {
        Alert.alert('No Peers', 'Connect to peers first using /connect command');
      }
    }
  };

  const handleCommand = (command) => {
    const [cmd, ...args] = command.split(' ');
    const argString = args.join(' ');
    
    switch (cmd.toLowerCase()) {
      case 'connect':
        if (argString.includes(':')) {
          const [host, portStr] = argString.split(':');
          const targetPort = parseInt(portStr);
          
          if (host && targetPort) {
            connectToPeer(host, targetPort);
          } else {
            addSystemMessage('❌ Invalid format. Use: /connect <ip:port>');
          }
        } else {
          addSystemMessage('❌ Invalid format. Use: /connect <ip:port>');
        }
        break;
        
      case 'peers':
      case 'who':
        showPeerList();
        break;
        
      case 'ping':
        if (networkManager.current) {
          const pingMessage = networkManager.current.protocol.createPing();
          networkManager.current.broadcastMessage(pingMessage);
          addSystemMessage('📡 Ping sent to all peers');
        }
        break;
        
      case 'help':
        showHelp();
        break;
        
      case 'clear':
        setMessages([]);
        addSystemMessage('🧹 Chat cleared');
        break;
        
      default:
        addSystemMessage(`❌ Unknown command: /${cmd}. Type /help for available commands.`);
    }
    
    setInputText('');
  };

  const connectToPeer = async (host, port) => {
    try {
      addSystemMessage(`🔌 Connecting to ${host}:${port}...`);
      await networkManager.current.connectToPeer(host, port);
      addSystemMessage(`✅ Connected to ${host}:${port}`);
    } catch (error) {
      addSystemMessage(`❌ Failed to connect to ${host}:${port}: ${error.message}`);
    }
  };

  const showPeerList = () => {
    if (peers.length === 0) {
      addSystemMessage('📭 No peers connected');
      return;
    }
    
    addSystemMessage(`👥 Connected peers (${peers.length}):`);
    peers.forEach(peer => {
      const nickname = peer.nickname || 'Unknown';
      const lastSeen = new Date(peer.lastSeen).toLocaleTimeString();
      addSystemMessage(`  • ${nickname} (${peer.address}:${peer.port}) - Last seen: ${lastSeen}`);
    });
  };

  const showHelp = () => {
    const helpText = [
      '💬 P2P Chat Commands:',
      '/connect <ip:port> - Connect to peer',
      '/peers or /who - List connected peers',
      '/ping - Ping all peers',
      '/clear - Clear chat history',
      '/help - Show this help',
      '',
      '📝 Just type a message to send to all peers'
    ];
    
    helpText.forEach(line => addSystemMessage(line));
  };

  const renderMessage = ({ item }) => {
    const messageStyle = item.type === 'system' 
      ? styles.systemMessage 
      : item.isOwn 
        ? styles.ownMessage 
        : styles.peerMessage;
    
    const textStyle = item.type === 'system' 
      ? styles.systemMessageText 
      : item.isOwn 
        ? styles.ownMessageText 
        : styles.peerMessageText;

    return (
      <View style={[styles.messageContainer, messageStyle]}>
        {item.type !== 'system' && (
          <Text style={styles.senderName}>
            {item.sender} • {item.timestamp.toLocaleTimeString()}
          </Text>
        )}
        <Text style={textStyle}>{item.text}</Text>
      </View>
    );
  };

  const getStatusColor = () => {
    if (networkStatus === 'Connected') return '#4CAF50';
    if (networkStatus === 'Connection Failed') return '#F44336';
    return '#FF9800';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>P2P Chat</Text>
          <Text style={styles.headerSubtitle}>
            {nickname} • {peers.length} peers • 
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {' ' + networkStatus}
            </Text>
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message or /command..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E3F2FD',
    fontSize: 12,
    marginTop: 2,
  },
  statusText: {
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: '#1976D2',
    alignSelf: 'flex-end',
    marginLeft: '20%',
  },
  peerMessage: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    marginRight: '20%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  systemMessage: {
    backgroundColor: '#FFF3E0',
    alignSelf: 'center',
    marginHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  ownMessageText: {
    color: '#FFF',
    fontSize: 16,
  },
  peerMessageText: {
    color: '#333',
    fontSize: 16,
  },
  systemMessageText: {
    color: '#F57C00',
    fontSize: 14,
    fontStyle: 'italic',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  sendButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatScreen;
