const WebSocket = require('ws');
const aiService = require('./ai-service');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.sessions = new Map();
    this.init();
  }

  init() {
    this.wss.on('connection', (ws, req) => {
      const sessionId = this.getSessionId(req);
      this.sessions.set(sessionId, ws);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          const response = await aiService.handleConversation(data.message, sessionId);
          
          ws.send(JSON.stringify({
            type: 'message',
            data: response
          }));
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        }
      });

      ws.on('close', () => {
        this.sessions.delete(sessionId);
      });
    });
  }

  getSessionId(req) {
    // 从请求头或URL中获取会话ID
    const sessionId = req.headers['x-session-id'] || 
                     new URL(req.url, 'ws://localhost').searchParams.get('sessionId');
    return sessionId;
  }

  // 广播消息给所有连接的客户端
  broadcast(message) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // 发送消息给特定会话
  sendToSession(sessionId, message) {
    const ws = this.sessions.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

module.exports = WebSocketService; 