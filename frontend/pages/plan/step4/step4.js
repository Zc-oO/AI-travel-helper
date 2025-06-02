// pages/plan/step4/step4.js
const app = getApp();
const api = require('../../../utils/api');

Page({
  data: {
    selectedInterests: [],
    errorMessage: '',
    interestTags: [
      { key: 'adventure', label: '探险', color: '#FF6B6B' },
      { key: 'camping', label: '露营', color: '#4ECDC4' },
      { key: 'beach', label: '海滩', color: '#45B7D1' },
      { key: 'nature', label: '大自然之旅', color: '#96CEB4' },
      { key: 'relax', label: '放松身心', color: '#FFEAA7' },
      { key: 'road_trip', label: '公路旅行', color: '#FF7675' },
      { key: 'culture', label: '文化探索', color: '#A29BFE' },
      { key: 'food', label: '美食之旅', color: '#FD79A8' },
      { key: 'backpack', label: '背包旅行', color: '#E17055' },
      { key: 'vacation', label: '度假游', color: '#00B894' },
      { key: 'sports', label: '清雪运动', color: '#0984E3' },
      { key: 'wildlife', label: '野生动物探险之旅', color: '#6C5CE7' },
      { key: 'history', label: '历史文化之旅', color: '#A0522D' },
      { key: 'eco', label: '生态旅游', color: '#00B894' }
    ]
  },

  onLoad(options) {
    console.log('Step4 页面加载');
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

  // 判断是否已选择
  isSelected(key) {
    return this.data.selectedInterests.includes(key);
  },

  // 切换兴趣选择
  toggleInterest(e) {
    const key = e.currentTarget.dataset.key;
    let selectedInterests = [...this.data.selectedInterests];
    
    const index = selectedInterests.indexOf(key);
    if (index > -1) {
      // 取消选择
      selectedInterests.splice(index, 1);
    } else {
      // 选择（限制最多选择10个）
      if (selectedInterests.length >= 10) {
        wx.showToast({
          title: '最多选择10个标签',
          icon: 'none'
        });
        return;
      }
      selectedInterests.push(key);
    }
    
    this.setData({
      selectedInterests,
      errorMessage: ''
    });
  },

  // 继续下一步
  async continue() {
    try {
      const session = app.globalData.currentSession;
      const response = await api.form.submitStep4(session.sessionId, {
        interests: this.data.selectedInterests
      });

      if (response.success) {
        wx.navigateTo({
          url: '/pages/plan/step5/step5'
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