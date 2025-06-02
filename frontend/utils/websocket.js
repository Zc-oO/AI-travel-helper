const app = getApp();
const store = require('./store');

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  connect() {
    const sessionId = wx.getStorageSync('currentSessionId');
    if (!sessionId) {
      console.error('No session ID available');
      return;
    }

    const wsUrl = `${app.globalData.wsBase}/chat?sessionId=${sessionId}`;
    
    this.ws = wx.connectSocket({
      url: wsUrl,
      success: () => {
        console.log('WebSocket连接成功');
        this.reconnectAttempts = 0;
      },
      fail: (error) => {
        console.error('WebSocket连接失败:', error);
        this.reconnect();
      }
    });

    this.ws.onOpen(() => {
      console.log('WebSocket已打开');
    });

    this.ws.onMessage((res) => {
      try {
        const message = JSON.parse(res.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('处理消息失败:', error);
      }
    });

    this.ws.onClose(() => {
      console.log('WebSocket已关闭');
      this.reconnect();
    });

    this.ws.onError((error) => {
      console.error('WebSocket错误:', error);
      this.reconnect();
    });
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('达到最大重连次数');
      wx.showToast({
        title: '连接失败，请检查网络',
        icon: 'none'
      });
    }
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send({
        data: JSON.stringify({
          type: 'message',
          message
        })
      });
    } else {
      console.error('WebSocket未连接');
      wx.showToast({
        title: '连接已断开，正在重连',
        icon: 'none'
      });
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case 'message':
        // 更新消息历史
        const currentMessages = store.getState().messages || [];
        store.setState({
          messages: [...currentMessages, message.data]
        });
        break;
      
      case 'error':
        wx.showToast({
          title: message.message,
          icon: 'none'
        });
        break;
      
      default:
        console.warn('未知消息类型:', message.type);
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 创建单例
const wsClient = new WebSocketClient();

module.exports = wsClient; 