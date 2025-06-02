// pages/plan/step5/step5.js
const app = getApp();
const api = require('../../../utils/api');

Page({
  data: {
    selectedBudget: '',
    customBudget: '',
    preference: '',
    errorMessage: '',
    canContinue: false,
    budgetRanges: [
      {
        key: 'budget',
        label: '便宜',
        description: '总花费约4000-5000元/人',
        subtitle: '经济实惠且节约开支'
      },
      {
        key: 'balanced',
        label: '平衡',
        description: '总花费约5000-8000元/人',
        subtitle: '尽可能平衡地调整预算'
      },
      {
        key: 'luxury',
        label: '豪华',
        description: '总花费约8000-15000元/人',
        subtitle: '高品质体验的旅行费用'
      },
      {
        key: 'flexible',
        label: '灵活',
        description: '您可以输入预期开销范围',
        subtitle: ''
      }
    ]
  },

  onLoad(options) {
    console.log('Step5 页面加载');
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

  // 选择预算档次
  selectBudget(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      selectedBudget: key,
      errorMessage: ''
    });
    this.checkCanContinue();
  },

  // 自定义预算输入
  onCustomBudgetInput(e) {
    const value = e.detail.value;
    this.setData({
      customBudget: value
    });
    this.checkCanContinue();
  },

  // 偏好描述输入
  onPreferenceInput(e) {
    this.setData({
      preference: e.detail.value
    });
  },

  // 检查是否可以继续
  checkCanContinue() {
    const { selectedBudget, customBudget } = this.data;
    let canContinue = false;

    if (selectedBudget && selectedBudget !== 'flexible') {
      canContinue = true;
    } else if (selectedBudget === 'flexible' && customBudget && parseFloat(customBudget) > 0) {
      canContinue = true;
    }

    this.setData({ canContinue });
  },

  // 完成设置
  async continue() {
    const { selectedBudget, customBudget, preference } = this.data;

    // 验证输入
    if (!selectedBudget) {
      this.setData({ errorMessage: '请选择预算档次' });
      return;
    }

    if (selectedBudget === 'flexible') {
      if (!customBudget || parseFloat(customBudget) <= 0) {
        this.setData({ errorMessage: '请输入有效的预算金额' });
        return;
      }
      if (parseFloat(customBudget) < 100 || parseFloat(customBudget) > 100000) {
        this.setData({ errorMessage: '预算金额应在100-100000元之间' });
        return;
      }
    }

    try {
      const session = app.globalData.currentSession;
      const requestData = {
        budget_type: selectedBudget,
        preference: preference
      };

      if (selectedBudget === 'flexible') {
        requestData.budget_amount = parseFloat(customBudget);
      }

      const response = await api.form.submitStep5(session.sessionId, requestData);

      if (response.success) {
        // 跳转到摘要页面
        wx.navigateTo({
          url: '/pages/plan/summary/summary'
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