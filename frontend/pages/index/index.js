// pages/index/index.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    recentPlans: []
  },

  onLoad(options) {
    console.log('首页加载', options);
    this.loadRecentPlans();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadRecentPlans();
  },

  // 加载最近的规划
  loadRecentPlans() {
    // 从本地存储获取最近的规划
    const plans = wx.getStorageSync('recentPlans') || [];
    this.setData({
      recentPlans: plans
    });
  },

  // 开始旅行规划
  async startPlanning() {
    try {
      wx.showLoading({ title: '初始化中...' });
      
      // 初始化新的表单会话
      const response = await api.form.init();
      
      if (response.success) {
        // 保存会话信息到全局
        app.setCurrentSession(response.data);
        
        // 跳转到第一步
        wx.navigateTo({
          url: '/pages/plan/step1/step1'
        });
      }
    } catch (error) {
      console.error('初始化失败:', error);
      wx.showToast({
        title: '初始化失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 查看历史规划
  viewPlan(e) {
    const planId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/plan/result/result?planId=${planId}`
    });
  },

  // 跳转到旅行助手
  goToAssistant() {
    wx.switchTab({
      url: '/pages/assistant/assistant'
    });
  }
});