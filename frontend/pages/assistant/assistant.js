// pages/assistant/assistant.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    messages: [],
    inputText: '',
    isTyping: false,
    scrollTop: 0,
    scrollIntoView: '',
    currentLocation: '',
    quickSuggestions: [
      '推荐附近的美食',
      '有什么好玩的景点？',
      '帮我找个住宿',
      '附近有什么购物的地方？',
      '推荐一个安静的咖啡厅'
    ]
  },

  onLoad(options) {
    console.log('Assistant 页面加载');
    this.requestLocation();
  },

  onShow() {
    // 滚动到底部
    this.scrollToBottom();
  },

  // 获取用户位置
  requestLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        console.log('获取位置成功:', res);
        // 这里可以调用地图API获取具体地址
        this.setData({
          currentLocation: '当前位置' // 实际应该是具体地址
        });
      },
      fail: (err) => {
        console.log('获取位置失败:', err);
        this.setData({
          currentLocation: '位置获取失败'
        });
      }
    });
  },

  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 发送消息
  async sendMessage() {
    const message = this.data.inputText.trim();
    if (!message || this.data.isTyping) return;

    // 添加用户消息
    this.addMessage('user', message);
    
    // 清空输入框
    this.setData({
      inputText: '',
      isTyping: true
    });

    try {
      // 调用AI助手API
      const response = await api.assistant.chat({
        message: message,
        location: this.data.currentLocation,
        chat_history: this.getRecentMessages()
      });

      if (response.success) {
        // 添加AI回复
        this.addMessage('ai', response.data.reply, response.data.suggestions);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      this.addMessage('ai', '抱歉，我暂时无法回答您的问题，请稍后重试。');
    } finally {
      this.setData({ isTyping: false });
    }
  },

  // 发送快捷消息
  sendQuickMessage(e) {
    const message = e.currentTarget.dataset.message;
    this.setData({ inputText: message });
    this.sendMessage();
  },

  // 添加消息
  addMessage(type, content, recommendations = null) {
    const messageId = Date.now();
    const message = {
      id: messageId,
      type: type,
      content: content,
      time: this.formatTime(new Date()),
      recommendations: recommendations
    };

    this.setData({
      messages: [...this.data.messages, message],
      scrollIntoView: `msg-${messageId}`
    });

    // 延迟滚动到底部
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  // 获取最近的消息历史
  getRecentMessages() {
    return this.data.messages.slice(-6).map(msg => ({
      type: msg.type,
      content: msg.content
    }));
  },

  // 滚动到底部
  scrollToBottom() {
    const query = wx.createSelectorQuery();
    query.select('.chat-area').boundingClientRect();
    query.select('.messages-list').boundingClientRect();
    query.exec((res) => {
      if (res[1] && res[0]) {
        const scrollTop = res[1].height - res[0].height;
        if (scrollTop > 0) {
          this.setData({ scrollTop: scrollTop });
        }
      }
    });
  },

  // 选择推荐项
  selectRecommendation(e) {
    const rec = e.currentTarget.dataset.rec;
    
    wx.showActionSheet({
      itemList: ['查看详情', '获取路线', '收藏'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.viewRecommendationDetail(rec);
            break;
          case 1:
            this.getRoute(rec);
            break;
          case 2:
            this.saveRecommendation(rec);
            break;
        }
      }
    });
  },

  // 查看推荐详情
  viewRecommendationDetail(rec) {
    wx.showModal({
      title: rec.name,
      content: `类型: ${rec.type}\n评分: ${rec.rating}\n\n${rec.description || '暂无详细介绍'}`,
      showCancel: false
    });
  },

  // 获取路线
  getRoute(rec) {
    if (rec.location) {
      wx.openLocation({
        latitude: rec.location.lat || 0,
        longitude: rec.location.lng || 0,
        name: rec.name,
        address: rec.location.address || '',
        fail: () => {
          wx.showToast({
            title: '无法获取路线',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '位置信息不可用',
        icon: 'none'
      });
    }
  },

  // 保存推荐
  saveRecommendation(rec) {
    try {
      const savedRecs = wx.getStorageSync('savedRecommendations') || [];
      savedRecs.push({
        ...rec,
        savedAt: new Date().toISOString()
      });
      wx.setStorageSync('savedRecommendations', savedRecs);
      
      wx.showToast({
        title: '已收藏',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '收藏失败',
        icon: 'none'
      });
    }
  },

  // 推荐餐厅
  async recommendRestaurant() {
    this.requestRecommendation('restaurant', '推荐附近的美食餐厅');
  },

  // 推荐景点
  async recommendAttraction() {
    this.requestRecommendation('attraction', '推荐附近的旅游景点');
  },

  // 推荐住宿
  async recommendHotel() {
    this.requestRecommendation('hotel', '推荐附近的住宿');
  },

  // 请求推荐
  async requestRecommendation(type, message) {
    if (this.data.isTyping) return;

    // 添加用户消息
    this.addMessage('user', message);
    this.setData({ isTyping: true });

    try {
      const response = await api.assistant.getRecommendation({
        location: this.data.currentLocation,
        request_type: type,
        preferences: [],
        budget_range: 'medium'
      });

      if (response.success) {
        this.addMessage('ai', `为您推荐了几个不错的${this.getTypeLabel(type)}：`, response.data);
      }
    } catch (error) {
      console.error('获取推荐失败:', error);
      this.addMessage('ai', '抱歉，获取推荐失败，请稍后重试。');
    } finally {
      this.setData({ isTyping: false });
    }
  },

  // 获取类型标签
  getTypeLabel(type) {
    const labels = {
      'restaurant': '餐厅',
      'attraction': '景点',
      'hotel': '住宿',
      'bar': '酒吧',
      'shopping': '购物场所'
    };
    return labels[type] || '推荐';
  }
});