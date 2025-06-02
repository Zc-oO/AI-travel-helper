// utils/api.js
const app = getApp();

class ApiService {
  constructor() {
    this.baseUrl = '';
    this.timeout = 30000;
  }

  // 获取API基础URL
  getBaseUrl() {
    if (!this.baseUrl) {
      this.baseUrl = app.globalData.apiBase;
    }
    return this.baseUrl;
  }

  // 通用请求方法
  request(options) {
    return new Promise((resolve, reject) => {
      const { url, method = 'GET', data = {}, header = {} } = options;
      
      // 显示加载提示
      if (options.showLoading !== false) {
        wx.showLoading({
          title: options.loadingText || '请稍候...',
          mask: true
        });
      }

      wx.request({
        url: `${this.getBaseUrl()}${url}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...header
        },
        timeout: this.timeout,
        success: (res) => {
          wx.hideLoading();
          
          if (res.statusCode === 200) {
            if (res.data.success) {
              resolve(res.data);
            } else {
              this.handleError(res.data.message || '请求失败', res.data);
              reject(res.data);
            }
          } else {
            this.handleError(`网络错误 ${res.statusCode}`, res);
            reject(res);
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('API请求失败:', err);
          
          let errorMessage = '网络连接失败';
          if (err.errMsg) {
            if (err.errMsg.includes('timeout')) {
              errorMessage = '请求超时，请检查网络连接';
            } else if (err.errMsg.includes('fail')) {
              errorMessage = '网络连接失败，请稍后重试';
            }
          }
          
          this.handleError(errorMessage, err);
          reject(err);
        }
      });
    });
  }

  // 错误处理
  handleError(message, error) {
    console.error('API错误:', message, error);
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  }

  // 表单相关API
  form = {
    // 初始化表单会话
    init: () => {
      return this.request({
        url: '/form/init',
        method: 'POST',
        loadingText: '初始化中...'
      });
    },

    // 获取表单状态
    getStatus: (sessionId) => {
      return this.request({
        url: `/form/status/${sessionId}`,
        method: 'GET',
        showLoading: false
      });
    },

    // 提交步骤1 - 目的地
    submitStep1: (sessionId, data) => {
      return this.request({
        url: `/form/step1/${sessionId}`,
        method: 'POST',
        data,
        loadingText: '保存中...'
      });
    },

    // 提交步骤2 - 同行类型
    submitStep2: (sessionId, data) => {
      return this.request({
        url: `/form/step2/${sessionId}`,
        method: 'POST',
        data,
        loadingText: '保存中...'
      });
    },

    // 提交步骤3 - 日期和交通
    submitStep3: (sessionId, data) => {
      return this.request({
        url: `/form/step3/${sessionId}`,
        method: 'POST',
        data,
        loadingText: '保存中...'
      });
    },

    // 提交步骤4 - 兴趣标签
    submitStep4: (sessionId, data) => {
      return this.request({
        url: `/form/step4/${sessionId}`,
        method: 'POST',
        data,
        loadingText: '保存中...'
      });
    },

    // 提交步骤5 - 预算
    submitStep5: (sessionId, data) => {
      return this.request({
        url: `/form/step5/${sessionId}`,
        method: 'POST',
        data,
        loadingText: '保存中...'
      });
    },

    // 获取表单摘要
    getSummary: (sessionId) => {
      return this.request({
        url: `/form/summary/${sessionId}`,
        method: 'GET',
        loadingText: '加载中...'
      });
    }
  };

  // 旅行规划相关API
  plan = {
    // 从表单生成规划
    generateFromSession: (sessionId) => {
      return this.request({
        url: '/plan/generate-from-session',
        method: 'POST',
        data: { sessionId },
        loadingText: 'AI正在生成行程...',
        timeout: 60000 // 生成规划可能需要更长时间
      });
    },

    // 直接生成规划
    generate: (planData) => {
      return this.request({
        url: '/plan/generate',
        method: 'POST',
        data: planData,
        loadingText: 'AI正在生成行程...',
        timeout: 60000
      });
    },

    // 获取规划详情
    getDetail: (planId) => {
      return this.request({
        url: `/plan/detail/${planId}`,
        method: 'GET',
        loadingText: '加载行程详情...'
      });
    },

    // 修改规划
    modify: (planId, modifications) => {
      return this.request({
        url: `/plan/modify/${planId}`,
        method: 'PUT',
        data: modifications,
        loadingText: '修改中...'
      });
    }
  };

  // 旅行助手相关API
  assistant = {
    // 获取推荐
    getRecommendation: (data) => {
      return this.request({
        url: '/assistant/recommend',
        method: 'POST',
        data,
        loadingText: '获取推荐中...'
      });
    },

    // 聊天对话
    chat: (data) => {
      return this.request({
        url: '/assistant/chat',
        method: 'POST',
        data,
        loadingText: false // 聊天不显示loading
      });
    }
  };
}

// 创建实例
const api = new ApiService();

// 导出API服务
module.exports = api;