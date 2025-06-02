// pages/plan/step2/step2.js
const app = getApp();
const api = require('../../../utils/api');

Page({
  data: {
    selectedType: '',
    errorMessage: '',
    canContinue: false,
    companionTypes: [
      {
        key: 'solo',
        label: '只有我😊',
        description: '只属于我的独自旅行',
        emoji: '🧳'
      },
      {
        key: 'couple',
        label: '与情侣一起💕',
        description: '尽可能平衡地调整预算',
        emoji: '💑'
      },
      {
        key: 'family',
        label: '与家人一起',
        description: '高品质体验的旅行费用',
        emoji: '👨‍👩‍👧‍👦'
      },
      {
        key: 'friends',
        label: '与朋友们一起',
        description: '高品质体验的旅行费用',
        emoji: '👫'
      },
      {
        key: 'business',
        label: '商务旅行💼',
        description: '自行安排，没有预算要求',
        emoji: '💼'
      }
    ]
  },

  onLoad(options) {
    console.log('Step2 页面加载');
    this.checkSession();
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

  // 选择同行类型
  selectCompanionType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: type,
      canContinue: true,
      errorMessage: ''
    });
  },

  // 继续下一步
  async continue() {
    if (!this.data.selectedType) {
      this.setData({
        errorMessage: '请选择同行类型'
      });
      return;
    }

    try {
      const session = app.globalData.currentSession;
      const response = await api.form.submitStep2(session.sessionId, {
        companion_type: this.data.selectedType
      });

      if (response.success) {
        wx.navigateTo({
          url: '/pages/plan/step3/step3'
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