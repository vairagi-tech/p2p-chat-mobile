/**
 * P2P Chat Protocol for React Native
 * Implements the same binary protocol as the Python version
 */

export const MessageType = {
  PING: 0x01,
  PONG: 0x02,
  PEER_DISCOVERY: 0x03,
  PEER_ANNOUNCEMENT: 0x04,
  CHAT_MESSAGE: 0x05,
  PRIVATE_MESSAGE: 0x06,
  ROUTING_UPDATE: 0x07,
  ACK: 0x08,
};

export class Message {
  constructor(msgType, ttl, msgId, payload) {
    if (ttl < 0 || ttl > 7) {
      throw new Error('TTL must be between 0 and 7');
    }
    if (payload.length > 65535) {
      throw new Error('Payload too large (max 65535 bytes)');
    }
    
    this.msgType = msgType;
    this.ttl = ttl;
    this.msgId = msgId;
    this.payload = payload;
  }
}

export class P2PProtocol {
  constructor(enableCompression = false) {
    this.enableCompression = enableCompression;
    this.messageCache = new Set(); // For deduplication
    this.HEADER_SIZE = 8; // Type(1) + TTL(1) + ID(4) + Length(2)
    this.MAX_PAYLOAD_SIZE = 65535;
  }

  /**
   * Serialize a message to binary format
   */
  serialize(message) {
    const payload = message.payload;
    const msgType = message.msgType;
    
    // Create header buffer: Type(1) + TTL(1) + ID(4) + Length(2)
    const headerBuffer = new ArrayBuffer(this.HEADER_SIZE);
    const headerView = new DataView(headerBuffer);
    
    headerView.setUint8(0, msgType);
    headerView.setUint8(1, message.ttl);
    headerView.setUint32(2, message.msgId, false); // Big-endian
    headerView.setUint16(6, payload.length, false); // Big-endian
    
    // Combine header and payload
    const result = new Uint8Array(this.HEADER_SIZE + payload.length);
    result.set(new Uint8Array(headerBuffer), 0);
    result.set(payload, this.HEADER_SIZE);
    
    return result;
  }

  /**
   * Deserialize binary data to a message
   */
  deserialize(data) {
    if (data.length < this.HEADER_SIZE) {
      return null;
    }

    const view = new DataView(data.buffer || data);
    
    const msgType = view.getUint8(0);
    const ttl = view.getUint8(1);
    const msgId = view.getUint32(2, false); // Big-endian
    const payloadLength = view.getUint16(6, false); // Big-endian
    
    if (data.length < this.HEADER_SIZE + payloadLength) {
      return null;
    }
    
    const payload = new Uint8Array(data.slice(this.HEADER_SIZE, this.HEADER_SIZE + payloadLength));
    
    try {
      return new Message(msgType, ttl, msgId, payload);
    } catch (error) {
      console.error('Error creating message:', error);
      return null;
    }
  }

  /**
   * Generate a unique message ID
   */
  generateMessageId(content = '') {
    const timestamp = Date.now() & 0xFFFF;
    const random = Math.floor(Math.random() * 0xFFFF);
    
    // Simple hash for content if provided
    let contentHash = 0;
    if (content) {
      for (let i = 0; i < content.length; i++) {
        contentHash = ((contentHash << 5) - contentHash + content.charCodeAt(i)) & 0xFFFF;
      }
    }
    
    return (timestamp << 16) | (random ^ contentHash);
  }

  /**
   * Check if message ID has been seen before
   */
  isDuplicate(msgId) {
    if (this.messageCache.has(msgId)) {
      return true;
    }
    
    // Add to cache with size limit
    this.messageCache.add(msgId);
    if (this.messageCache.size > 10000) {
      // Simple cleanup - remove some entries
      const entries = Array.from(this.messageCache);
      this.messageCache.clear();
      // Keep the most recent half
      entries.slice(entries.length / 2).forEach(id => this.messageCache.add(id));
    }
    
    return false;
  }

  /**
   * Create a ping message
   */
  createPing() {
    return new Message(
      MessageType.PING,
      1,
      this.generateMessageId(),
      new Uint8Array(0)
    );
  }

  /**
   * Create a chat message
   */
  createChatMessage(text, ttl = 3) {
    const encoder = new TextEncoder();
    const payload = encoder.encode(text);
    
    return new Message(
      MessageType.CHAT_MESSAGE,
      ttl,
      this.generateMessageId(text),
      payload
    );
  }

  /**
   * Create a peer discovery message
   */
  createPeerDiscovery(peerInfo) {
    const encoder = new TextEncoder();
    const payload = encoder.encode(JSON.stringify(peerInfo));
    
    return new Message(
      MessageType.PEER_DISCOVERY,
      2,
      this.generateMessageId(JSON.stringify(peerInfo)),
      payload
    );
  }

  /**
   * Create a peer announcement message
   */
  createPeerAnnouncement(peerInfo) {
    const encoder = new TextEncoder();
    const payload = encoder.encode(JSON.stringify(peerInfo));
    
    return new Message(
      MessageType.PEER_ANNOUNCEMENT,
      1,
      this.generateMessageId(),
      payload
    );
  }

  /**
   * Decode text payload from message
   */
  decodeTextPayload(message) {
    const decoder = new TextDecoder();
    return decoder.decode(message.payload);
  }

  /**
   * Decode JSON payload from message
   */
  decodeJSONPayload(message) {
    try {
      const text = this.decodeTextPayload(message);
      return JSON.parse(text);
    } catch (error) {
      console.error('Error decoding JSON payload:', error);
      return null;
    }
  }
}
