const WebSocket = require('ws');
const pako = require('pako');
const { v4: uuidv4 } = require('uuid');

/**
 * WebSocket语音识别服务器
 * 处理客户端的实时音频流并返回识别结果
 */
class ASRWebSocketServer {
  constructor(port = 3001) {
    this.port = port;
    this.wss = null;
    this.clients = new Map();
    this.qiniuASRUrl = 'wss://openai.qiniu.com/v1/voice/asr';
    this.qiniuToken = 'sk-6e04767d16a9342629f42ef580a485520a46b2b37b84bcf08d4c8066641ec578';
  }

  /**
   * 启动WebSocket服务器
   */
  start() {
    this.wss = new WebSocket.Server({ port: this.port });
    
    this.wss.on('connection', (ws, req) => {
      console.log('新的客户端连接:', req.socket.remoteAddress);
      
      const clientId = uuidv4();
      const client = {
        id: clientId,
        ws: ws,
        qiniuWS: null,
        isConnected: false,
        config: null,
        sequence: 1
      };
      
      this.clients.set(clientId, client);
      
      // 处理客户端消息
      ws.on('message', (data) => {
        this.handleClientMessage(client, data);
      });
      
      ws.on('close', () => {
        console.log('客户端断开连接:', clientId);
        this.cleanupClient(client);
        this.clients.delete(clientId);
      });
      
      ws.on('error', (error) => {
        console.error('客户端WebSocket错误:', error);
        this.cleanupClient(client);
        this.clients.delete(clientId);
      });
      
      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket连接已建立'
      }));
    });
    
    console.log(`ASR WebSocket服务器启动在端口 ${this.port}`);
  }

  /**
   * 处理客户端消息
   */
  handleClientMessage(client, data) {
    try {
      // 如果是二进制数据（音频数据）
      if (Buffer.isBuffer(data)) {
        this.handleAudioData(client, data);
        return;
      }
      
      // 如果是文本数据（配置信息）
      const message = JSON.parse(data.toString());
      
      if (message.type === 'config') {
        this.handleConfigMessage(client, message);
      } else {
        console.log('收到未知消息类型:', message.type);
      }
      
    } catch (error) {
      console.error('处理客户端消息失败:', error);
      client.ws.send(JSON.stringify({
        type: 'error',
        message: '消息格式错误'
      }));
    }
  }

  /**
   * 处理配置消息
   */
  handleConfigMessage(client, config) {
    console.log('收到客户端配置:', config);
    client.config = config;
    
    // 连接到七牛云ASR服务
    this.connectToQiniuASR(client);
  }

  /**
   * 连接到七牛云ASR服务
   */
  connectToQiniuASR(client) {
    try {
      const qiniuWS = new WebSocket(this.qiniuASRUrl, {
        headers: { 
          'Authorization': `Bearer ${this.qiniuToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      client.qiniuWS = qiniuWS;
      
      qiniuWS.on('open', () => {
        console.log('连接到七牛云ASR服务');
        client.isConnected = true;
        
        // 发送配置到七牛云
        this.sendQiniuConfig(client);
      });
      
      qiniuWS.on('message', (data) => {
        this.handleQiniuResponse(client, data);
      });
      
      qiniuWS.on('close', () => {
        console.log('七牛云ASR连接关闭');
        client.isConnected = false;
        
        // 通知客户端
        client.ws.send(JSON.stringify({
          type: 'asr_disconnected',
          message: 'ASR服务连接已断开'
        }));
      });
      
      qiniuWS.on('error', (error) => {
        console.error('七牛云ASR连接错误:', error);
        client.isConnected = false;
        
        // 通知客户端
        client.ws.send(JSON.stringify({
          type: 'asr_error',
          message: 'ASR服务连接失败'
        }));
      });
      
    } catch (error) {
      console.error('连接七牛云ASR服务失败:', error);
      client.ws.send(JSON.stringify({
        type: 'asr_error',
        message: '无法连接ASR服务'
      }));
    }
  }

  /**
   * 生成协议头
   */
  generateHeader(messageType = 1, flags = 1, serial = 1, compress = 1) {
    const header = Buffer.alloc(4);
    header[0] = (1 << 4) | 1;  // 版本和头长度
    header[1] = (messageType << 4) | flags;  // 消息类型和标志
    header[2] = (serial << 4) | compress;  // 序列化方法和压缩
    header[3] = 0;  // 保留
    return header;
  }

  /**
   * 生成协议头后的序列号部分
   */
  generateBeforePayload(sequence) {
    const buf = Buffer.alloc(4);
    buf.writeInt32BE(sequence);
    return buf;
  }

  /**
   * 发送配置到七牛云ASR
   */
  sendQiniuConfig(client) {
    if (!client.qiniuWS || client.qiniuWS.readyState !== WebSocket.OPEN) {
      return;
    }
    
    const config = {
      user: { 
        uid: client.id 
      },
      audio: {
        format: 'pcm',
        sample_rate: 16000,
        bits: 16,
        channel: 1,
        codec: 'raw'
      },
      request: {
        model_name: 'asr',
        enable_punc: true
      }
    };
    
    // 构建协议消息
    const payload = Buffer.from(JSON.stringify(config), 'utf8');
    const compressedPayload = pako.gzip(payload);
    
    const header = this.generateHeader(1, 1, 1, 1);
    const sequence = this.generateBeforePayload(client.sequence++);
    const length = Buffer.alloc(4);
    length.writeInt32BE(compressedPayload.length);
    
    const message = Buffer.concat([
      header,
      sequence,
      length,
      compressedPayload
    ]);
    
    client.qiniuWS.send(message);
    console.log('发送ASR配置到七牛云');
  }

  /**
   * 处理音频数据
   */
  handleAudioData(client, audioData) {
    if (!client.qiniuWS || client.qiniuWS.readyState !== WebSocket.OPEN) {
      console.warn('七牛云ASR连接未就绪');
      return;
    }
    
    try {
      // 压缩音频数据
      const compressed = pako.gzip(audioData);
      
      // 构建消息头
      const header = this.generateHeader(2, 1, 1, 1);
      const sequence = this.generateBeforePayload(client.sequence++);
      const length = Buffer.alloc(4);
      length.writeInt32BE(compressed.length);
      
      const message = Buffer.concat([
        header,
        sequence,
        length,
        compressed
      ]);
      
      client.qiniuWS.send(message);
      
    } catch (error) {
      console.error('发送音频数据失败:', error);
    }
  }

  /**
   * 处理七牛云响应
   */
  handleQiniuResponse(client, data) {
    try {
      // 解析七牛云响应
      const text = this.parseQiniuResponse(data);
      
      if (text) {
        console.log('ASR识别结果:', text);
        
        // 发送识别结果到客户端
        client.ws.send(JSON.stringify({
          type: 'recognition_result',
          text: text,
          isFinal: false  // 可以根据需要判断是否为最终结果
        }));
      }
      
    } catch (error) {
      console.error('处理七牛云响应失败:', error);
    }
  }

  /**
   * 解析七牛云响应
   */
  parseQiniuResponse(data) {
    try {
      if (!Buffer.isBuffer(data)) return '';
      
      const headerSize = data[0] & 0x0f;
      const messageType = data[1] >> 4;
      const messageTypeSpecificFlags = data[1] & 0x0f;
      const serializationMethod = data[2] >> 4;
      const messageCompression = data[2] & 0x0f;
      
      let payload = data.slice(headerSize * 4);
      
      if (messageTypeSpecificFlags & 0x01) {
        payload = payload.slice(4);
      }
      
      if (messageType === 0b1001 && payload.length >= 4) {
        const payloadSize = payload.readInt32BE(0);
        payload = payload.slice(4, 4 + payloadSize);
      }
      
      if (messageCompression === 0b0001) {
        payload = pako.ungzip(payload);
      }
      
      let obj;
      if (serializationMethod === 0b0001) {
        obj = JSON.parse(payload.toString('utf8'));
      } else {
        obj = payload.toString('utf8');
      }
      
      if (obj && obj.result && obj.result.text) return obj.result.text;
      if (obj && obj.payload_msg && obj.payload_msg.result && obj.payload_msg.result.text) {
        return obj.payload_msg.result.text;
      }
      if (typeof obj === 'string') return obj;
      
      return '';
      
    } catch (error) {
      console.error('解析七牛云响应失败:', error);
      return '';
    }
  }

  /**
   * 清理客户端资源
   */
  cleanupClient(client) {
    if (client.qiniuWS) {
      client.qiniuWS.close();
      client.qiniuWS = null;
    }
    client.isConnected = false;
  }

  /**
   * 停止服务器
   */
  stop() {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    this.clients.clear();
    console.log('ASR WebSocket服务器已停止');
  }
}

module.exports = ASRWebSocketServer;