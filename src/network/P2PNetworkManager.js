/**
 * P2P Network Manager for React Native
 * Handles peer connections, discovery, and message routing
 */

import TcpSocket from 'react-native-tcp-socket';
import { P2PProtocol, MessageType, Message } from '../protocol/P2PProtocol';

export class PeerInfo {
  constructor(address, port, nickname = null) {
    this.address = address;
    this.port = port;
    this.nickname = nickname;
    this.lastSeen = Date.now();
    this.hopCount = 1;
  }

  get key() {
    return `${this.address}:${this.port}`;
  }
}

export class P2PNetworkManager {
  constructor(port = 8888, nickname = null) {
    this.port = port;
    this.nickname = nickname || `mobile_${port}`;
    this.protocol = new P2PProtocol();
    
    // Network state
    this.peers = new Map(); // key: "ip:port", value: PeerInfo
    this.connections = new Map(); // key: "ip:port", value: socket
    this.server = null;
    this.isRunning = false;
    
    // Event callbacks
    this.onMessage = null;
    this.onPeerJoined = null;
    this.onPeerLeft = null;
    this.onConnectionError = null;
    
    // Message handlers
    this.messageHandlers = {
      [MessageType.PING]: this.handlePing.bind(this),
      [MessageType.PONG]: this.handlePong.bind(this),
      [MessageType.PEER_DISCOVERY]: this.handlePeerDiscovery.bind(this),
      [MessageType.PEER_ANNOUNCEMENT]: this.handlePeerAnnouncement.bind(this),
      [MessageType.CHAT_MESSAGE]: this.handleChatMessage.bind(this),
    };
  }

  /**
   * Start the P2P network node
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        this.isRunning = true;
        
        // Create TCP server
        this.server = TcpSocket.createServer((socket) => {
          this.handleIncomingConnection(socket);
        });

        this.server.listen({ port: this.port, host: '0.0.0.0' }, (error) => {
          if (error) {
            reject(error);
            return;
          }
          
          console.log(`P2P node started on port ${this.port}`);
          
          // Start cleanup task
          this.startCleanupTask();
          
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('Server error:', error);
          if (this.onConnectionError) {
            this.onConnectionError(error);
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the P2P network node
   */
  stop() {
    this.isRunning = false;
    
    // Close all connections
    this.connections.forEach((socket, key) => {
      socket.destroy();
    });
    this.connections.clear();
    
    // Stop server
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    
    console.log('P2P node stopped');
  }

  /**
   * Connect to a specific peer
   */
  connectToPeer(address, port) {
    return new Promise((resolve, reject) => {
      const peerKey = `${address}:${port}`;
      
      if (this.connections.has(peerKey)) {
        resolve(true); // Already connected
        return;
      }

      const socket = TcpSocket.createConnection({
        port: port,
        host: address,
        timeout: 10000
      });

      socket.on('connect', () => {
        console.log(`Connected to peer ${peerKey}`);
        
        // Add connection
        this.connections.set(peerKey, socket);
        
        // Add peer info
        const peer = new PeerInfo(address, port);
        this.peers.set(peerKey, peer);
        
        // Setup message handling
        this.setupSocketHandlers(socket, peerKey);
        
        // Send peer announcement
        this.sendPeerAnnouncement(socket);
        
        if (this.onPeerJoined) {
          this.onPeerJoined(peer);
        }
        
        resolve(true);
      });

      socket.on('error', (error) => {
        console.error(`Failed to connect to ${peerKey}:`, error);
        reject(error);
      });
    });
  }

  /**
   * Send a chat message to all connected peers
   */
  sendMessage(text, ttl = 3) {
    const message = this.protocol.createChatMessage(text, ttl);
    this.broadcastMessage(message);
    
    // Trigger local message event
    if (this.onMessage) {
      this.onMessage(this.nickname, text, true);
    }
  }

  /**
   * Get list of connected peers
   */
  getPeerList() {
    return Array.from(this.peers.values()).map(peer => ({
      address: peer.address,
      port: peer.port,
      nickname: peer.nickname,
      lastSeen: peer.lastSeen,
      hopCount: peer.hopCount
    }));
  }

  /**
   * Handle incoming connection
   */
  handleIncomingConnection(socket) {
    const peerAddress = socket.remoteAddress;
    const peerPort = socket.remotePort;
    const peerKey = `${peerAddress}:${peerPort}`;
    
    console.log(`Incoming connection from ${peerKey}`);
    
    // Add connection
    this.connections.set(peerKey, socket);
    
    // Add temporary peer info
    const peer = new PeerInfo(peerAddress, peerPort);
    this.peers.set(peerKey, peer);
    
    // Setup message handling
    this.setupSocketHandlers(socket, peerKey);
    
    if (this.onPeerJoined) {
      this.onPeerJoined(peer);
    }
  }

  /**
   * Setup socket event handlers
   */
  setupSocketHandlers(socket, peerKey) {
    let messageBuffer = Buffer.alloc(0);
    
    socket.on('data', (data) => {
      try {
        // Append new data to buffer
        messageBuffer = Buffer.concat([messageBuffer, Buffer.from(data)]);
        
        // Process complete messages
        while (messageBuffer.length >= 4) {
          // Read message length (first 4 bytes)
          const messageLength = messageBuffer.readUInt32BE(0);
          
          if (messageBuffer.length >= 4 + messageLength) {
            // Extract complete message
            const messageData = messageBuffer.slice(4, 4 + messageLength);
            messageBuffer = messageBuffer.slice(4 + messageLength);
            
            // Process message
            const message = this.protocol.deserialize(new Uint8Array(messageData));
            if (message && !this.protocol.isDuplicate(message.msgId)) {
              this.handleMessage(message, peerKey);
            }
          } else {
            // Not enough data for complete message
            break;
          }
        }
      } catch (error) {
        console.error('Error processing data:', error);
      }
    });

    socket.on('close', () => {
      console.log(`Connection closed: ${peerKey}`);
      this.handlePeerDisconnect(peerKey);
    });

    socket.on('error', (error) => {
      console.error(`Socket error for ${peerKey}:`, error);
      this.handlePeerDisconnect(peerKey);
    });
  }

  /**
   * Handle peer disconnect
   */
  handlePeerDisconnect(peerKey) {
    const peer = this.peers.get(peerKey);
    
    this.connections.delete(peerKey);
    this.peers.delete(peerKey);
    
    if (peer && this.onPeerLeft) {
      this.onPeerLeft(peer);
    }
  }

  /**
   * Handle received message
   */
  handleMessage(message, fromPeerKey) {
    const handler = this.messageHandlers[message.msgType];
    if (handler) {
      handler(message, fromPeerKey);
    }
    
    // Forward message if TTL > 0 (mesh routing)
    if (message.ttl > 0) {
      message.ttl -= 1;
      this.forwardMessage(message, fromPeerKey);
    }
  }

  /**
   * Handle ping message
   */
  handlePing(message, fromPeerKey) {
    const pong = new Message(
      MessageType.PONG,
      1,
      this.protocol.generateMessageId(),
      new Uint8Array(0)
    );
    this.sendToPeer(pong, fromPeerKey);
  }

  /**
   * Handle pong message
   */
  handlePong(message, fromPeerKey) {
    const peer = this.peers.get(fromPeerKey);
    if (peer) {
      peer.lastSeen = Date.now();
    }
  }

  /**
   * Handle peer discovery message
   */
  handlePeerDiscovery(message, fromPeerKey) {
    try {
      const peerInfo = this.protocol.decodeJSONPayload(message);
      console.log('Peer discovery:', peerInfo);
    } catch (error) {
      console.error('Invalid peer discovery message:', error);
    }
  }

  /**
   * Handle peer announcement message
   */
  handlePeerAnnouncement(message, fromPeerKey) {
    try {
      const peerData = this.protocol.decodeJSONPayload(message);
      const peer = this.peers.get(fromPeerKey);
      
      if (peer && peerData.nickname) {
        peer.nickname = peerData.nickname;
        peer.lastSeen = Date.now();
      }
    } catch (error) {
      console.error('Invalid peer announcement:', error);
    }
  }

  /**
   * Handle chat message
   */
  handleChatMessage(message, fromPeerKey) {
    try {
      const text = this.protocol.decodeTextPayload(message);
      const peer = this.peers.get(fromPeerKey);
      const sender = peer?.nickname || fromPeerKey;
      
      if (this.onMessage) {
        this.onMessage(sender, text, false);
      }
    } catch (error) {
      console.error('Invalid chat message:', error);
    }
  }

  /**
   * Broadcast message to all connected peers
   */
  broadcastMessage(message) {
    this.forwardMessage(message);
  }

  /**
   * Forward message to peers (excluding specified peer)
   */
  forwardMessage(message, excludePeerKey = null) {
    const serializedMessage = this.protocol.serialize(message);
    const lengthBuffer = Buffer.allocUnsafe(4);
    lengthBuffer.writeUInt32BE(serializedMessage.length, 0);
    const fullMessage = Buffer.concat([lengthBuffer, Buffer.from(serializedMessage)]);
    
    this.connections.forEach((socket, peerKey) => {
      if (peerKey !== excludePeerKey) {
        try {
          socket.write(fullMessage);
        } catch (error) {
          console.error(`Failed to send to ${peerKey}:`, error);
        }
      }
    });
  }

  /**
   * Send message to specific peer
   */
  sendToPeer(message, peerKey) {
    const socket = this.connections.get(peerKey);
    if (socket) {
      const serializedMessage = this.protocol.serialize(message);
      const lengthBuffer = Buffer.allocUnsafe(4);
      lengthBuffer.writeUInt32BE(serializedMessage.length, 0);
      const fullMessage = Buffer.concat([lengthBuffer, Buffer.from(serializedMessage)]);
      
      try {
        socket.write(fullMessage);
      } catch (error) {
        console.error(`Failed to send to ${peerKey}:`, error);
      }
    }
  }

  /**
   * Send peer announcement to socket
   */
  sendPeerAnnouncement(socket) {
    const announcement = this.protocol.createPeerAnnouncement({
      nickname: this.nickname,
      timestamp: Date.now()
    });
    
    const serializedMessage = this.protocol.serialize(announcement);
    const lengthBuffer = Buffer.allocUnsafe(4);
    lengthBuffer.writeUInt32BE(serializedMessage.length, 0);
    const fullMessage = Buffer.concat([lengthBuffer, Buffer.from(serializedMessage)]);
    
    socket.write(fullMessage);
  }

  /**
   * Start cleanup task for stale peers
   */
  startCleanupTask() {
    const cleanup = () => {
      if (!this.isRunning) return;
      
      const now = Date.now();
      const staleThreshold = 5 * 60 * 1000; // 5 minutes
      
      const stalePeers = [];
      this.peers.forEach((peer, key) => {
        if (now - peer.lastSeen > staleThreshold) {
          stalePeers.push(key);
        }
      });
      
      stalePeers.forEach(peerKey => {
        this.handlePeerDisconnect(peerKey);
      });
      
      // Schedule next cleanup
      setTimeout(cleanup, 60000); // Run every minute
    };
    
    setTimeout(cleanup, 60000);
  }
}
