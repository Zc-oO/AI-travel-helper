// pages/plan/step3/step3.js
const app = getApp();
const api = require('../../../utils/api');

Page({
  data: {
    startDate: '',
    endDate: '',
    arrivalTime: '',
    departureTime: '',
    destination: '',
    duration: 0,
    today: '',
    maxDate: '',
    errorMessage: '',
    canContinue: false
  },

  onLoad(options) {
    console.log('Step3 页面加载');
    this.initDateRange();
    this.checkSession();
  },

  // 初始化日期范围
  initDateRange() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 2);

    this.setData({
      today: this.formatDate(today),
      maxDate: this.formatDate(maxDate)
    });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 计算行程天数
  calculateDuration() {
    if (this.data.startDate && this.data.endDate) {
      const start = new Date(this.data.startDate);
      const end = new Date(this.data.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      this.setData({
        duration: diffDays,
        canContinue: diffDays > 0
      });
    }
  },

  // 检查会话状态
  checkSession() {
    const session = app.globalData.currentSession;
    if (!session || !session.sessionId) {
      wx.showModal({
        title: '提示',
        content: '会话已过期，请重新开始',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }
  },

  // 出发日期改变
  onStartDateChange(e) {
    const startDate = e.detail.value;
    this.setData({ 
      startDate,
      errorMessage: '' 
    });
    
    // 如果结束日期早于开始日期，清空结束日期
    if (this.data.endDate && this.data.endDate <= startDate) {
      this.setData({ endDate: '' });
    }
    
    this.calculateDuration();
  },

  // 返回日期改变
  onEndDateChange(e) {
    const endDate = e.detail.value;
    
    if (this.data.startDate && endDate <= this.data.startDate) {
      this.setData({
        errorMessage: '返回日期必须晚于出发日期'
      });
      return;
    }
    
    this.setData({ 
      endDate,
      errorMessage: '' 
    });
    this.calculateDuration();
  },

  // 到达时间改变
  onArrivalTimeChange(e) {
    this.setData({
      arrivalTime: e.detail.value
    });
  },

  // 离开时间改变
  onDepartureTimeChange(e) {
    this.setData({
      departureTime: e.detail.value
    });
  },

  // 到达站点输入
  onDestinationInput(e) {
    this.setData({
      destination: e.detail.value
    });
  },

  // 继续下一步
  async continue() {
    if (!this.data.startDate || !this.data.endDate) {
      this.setData({
        errorMessage: '请选择完整的旅行日期'
      });
      return;
    }

    if (this.data.duration <= 0) {
      this.setData({
        errorMessage: '旅行天数必须大于0天'
      });
      return;
    }

    try {
      const session = app.globalData.currentSession;
      const requestData = {
        start_date: this.data.startDate,
        end_date: this.data.endDate
      };

      // 添加交通信息（如果有填写）
      if (this.data.arrivalTime || this.data.departureTime || this.data.destination) {
        requestData.transportation = {
          arrival_time: this.data.arrivalTime,
          departure_time: this.data.departureTime,
          destination: this.data.destination
        };
      }

      const response = await api.form.submitStep3(session.sessionId, requestData);

      if (response.success) {
        wx.navigateTo({
          url: '/pages/plan/step4/step4'
        });
      }
    } catch (error) {
      console.error('提交失败:', error);
      this.setData({
        errorMessage: error.message || '提交失败，请重试'
      });
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});