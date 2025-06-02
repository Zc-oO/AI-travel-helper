// 统一的API请求封装
const app = getApp();

// 请求配置
const config = {
  baseURL: app.globalData.apiBase,
  timeout: 10000,
  header: {
    'content-type': 'application/json'
  }
};

// 请求拦截器
const requestInterceptor = (options) => {
  // 添加会话ID
  const sessionId = wx.getStorageSync('currentSessionId');
  if (sessionId) {
    options.header['X-Session-ID'] = sessionId;
  }
  return options;
};

// 响应拦截器
const responseInterceptor = (response) => {
  if (response.statusCode === 401) {
    // 会话过期，清除会话
    app.clearCurrentSession();
    wx.showToast({
      title: '会话已过期，请重新开始',
      icon: 'none'
    });
    return Promise.reject(new Error('会话已过期'));
  }
  return response.data;
};

// 错误处理
const errorHandler = (error) => {
  console.error('请求错误:', error);
  wx.showToast({
    title: error.message || '网络错误，请稍后重试',
    icon: 'none'
  });
  return Promise.reject(error);
};

// 请求方法
const request = (options) => {
  options = {
    ...config,
    ...options,
    url: `${config.baseURL}${options.url}`
  };

  // 应用请求拦截器
  options = requestInterceptor(options);

  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        try {
          const result = responseInterceptor(res);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(errorHandler(error));
      }
    });
  });
};

// API方法
const api = {
  // 旅行规划相关
  plan: {
    // 创建旅行规划
    create: (data) => request({
      url: '/plan/create',
      method: 'POST',
      data
    }),
    // 获取旅行规划详情
    getDetail: (planId) => request({
      url: `/plan/${planId}`,
      method: 'GET'
    })
  },
  
  // 旅行助手相关
  assistant: {
    // 发送消息
    sendMessage: (data) => request({
      url: '/assistant/message',
      method: 'POST',
      data
    }),
    // 获取历史消息
    getHistory: (sessionId) => request({
      url: `/assistant/history/${sessionId}`,
      method: 'GET'
    })
  },
  
  // 表单相关
  form: {
    // 提交表单
    submit: (data) => request({
      url: '/form/submit',
      method: 'POST',
      data
    })
  }
};

module.exports = api; 