// pages/plan/summary/summary.js
const app = getApp();
const api = require('../../../utils/api');

Page({
  data: {
    tripName: '',
    destination: '',
    companionType: '',
    travelDate: '',
    budgetInfo: '',
    interests: [],
    preference: '',
    isGenerating: false,
    errorMessage: ''
  },

  onLoad(options) {
    console.log('Summary 页面加载');
    this.loadSummaryData();
  },

  // 加载汇总数据
  async loadSummaryData() {
    try {
      const session = app.globalData.currentSession;
      if (!session || !session.sessionId) {
        this.redirectToStart();
        return;
      }

      wx.showLoading({ title: '加载中...' });
      
      const response = await api.form.getSummary(session.sessionId);
      
      if (response.success) {
        const data = response.data;
        this.setData({
          tripName: data.tripName || '',
          destination: Array.isArray(data.destination) ? data.destination.join('、') : data.destination,
          companionType: this.formatCompanionType(data.companion_type),
          travelDate: this.formatTravelDate(data.start_date, data.end_date),
          budgetInfo: data.budget_info || '',
          interests: data.interests || [],
          preference: data.preference || ''
        });
      }
    } catch (error) {
      console.error('加载汇总数据失败:', error);
      this.setData({
        errorMessage: '加载数据失败，请重试'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 格式化同行类型
  formatCompanionType(type) {
    const typeMap = {
      'solo': '独自旅行',
      'couple': '情侣',
      'family': '家人',
      'friends': '朋友',
      'business': '商务'
    };
    return typeMap[type] || type;
  },

  // 格式化旅行日期
  formatTravelDate(startDate, endDate) {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return `${startDate} 至 ${endDate} (${duration}天)`;
  },

  // 修改行程名称
  onTripNameChange(e) {
    this.setData({
      tripName: e.detail.value
    });
  },

  // 编辑目的地
  editDestination() {
    wx.navigateTo({
      url: '/pages/plan/step1/step1?edit=true'
    });
  },

  // 编辑同行者
  editCompanion() {
    wx.navigateTo({
      url: '/pages/plan/step2/step2?edit=true'
    });
  },

  // 编辑日期
  editDate() {
    wx.navigateTo({
      url: '/pages/plan/step3/step3?edit=true'
    });
  },

  // 编辑预算
  editBudget() {
    wx.navigateTo({
      url: '/pages/plan/step5/step5?edit=true'
    });
  },

  // 生成旅行规划
  async generatePlan() {
    if (this.data.isGenerating) return;

    try {
      this.setData({ 
        isGenerating: true,
        errorMessage: '' 
      });

      const session = app.globalData.currentSession;
      if (!session || !session.sessionId) {
        this.redirectToStart();
        return;
      }

      // 调用生成API
      const response = await api.plan.generateFromSession(session.sessionId);

      if (response.success) {
        // 保存规划数据到全局
        app.setCurrentPlan(response.data);
        
        // 保存到本地存储
        this.savePlanToLocal(response.data);
        
        // 跳转到结果页面
        wx.redirectTo({
          url: '/pages/plan/result/result'
        });
      }
    } catch (error) {
      console.error('生成规划失败:', error);
      this.setData({
        errorMessage: error.message || '生成失败，请重试',
        isGenerating: false
      });
    }
  },

  // 保存规划到本地
  savePlanToLocal(planData) {
    try {
      const plans = wx.getStorageSync('recentPlans') || [];
      const newPlan = {
        id: planData.planId || Date.now(),
        title: this.data.tripName || planData.summary?.title || '我的旅行',
        date: new Date().toLocaleDateString(),
        status: '已完成',
        data: planData
      };
      
      // 添加到最前面，保留最近10条
      plans.unshift(newPlan);
      if (plans.length > 10) {
        plans.splice(10);
      }
      
      wx.setStorageSync('recentPlans', plans);
    } catch (error) {
      console.error('保存规划失败:', error);
    }
  },

  // 重定向到开始页面
  redirectToStart() {
    wx.showModal({
      title: '提示',
      content: '会话已过期，请重新开始',
      showCancel: false,
      success: () => {
        wx.redirectTo({
          url: '/pages/index/index'
        });
      }
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});