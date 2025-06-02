// app.js
App({
    globalData: {
      // API配置
      apiBase: 'http://localhost:3000/api', // 开发环境，正式环境需要改为实际域名
      
      // 用户数据
      userInfo: null,
      
      // 当前表单会话
      currentSession: null,
      
      // 当前规划数据
      currentPlan: null,
      
      // 系统信息
      systemInfo: null
    },
  
    onLaunch() {
      console.log('AI旅行规划小程序启动');
      
      // 获取系统信息
      this.getSystemInfo();
      
      // 初始化用户会话
      this.initUserSession();
      
      // 检查更新
      this.checkForUpdate();
    },
  
    onShow(options) {
      console.log('小程序显示', options);
    },
  
    onHide() {
      console.log('小程序隐藏');
    },
  
    onError(msg) {
      console.error('小程序错误:', msg);
    },
  
    // 获取系统信息
    getSystemInfo() {
      wx.getSystemInfo({
        success: (res) => {
          this.globalData.systemInfo = res;
          console.log('系统信息:', res);
        },
        fail: (err) => {
          console.error('获取系统信息失败:', err);
        }
      });
    },
  
    // 初始化用户会话
    initUserSession() {
      // 尝试从本地存储获取会话信息
      const sessionId = wx.getStorageSync('currentSessionId');
      if (sessionId) {
        this.globalData.currentSession = { sessionId };
        console.log('恢复会话:', sessionId);
      }
    },
  
    // 检查小程序更新
    checkForUpdate() {
      if (wx.canIUse('getUpdateManager')) {
        const updateManager = wx.getUpdateManager();
        
        updateManager.onCheckForUpdate((res) => {
          console.log('检查更新:', res.hasUpdate);
        });
  
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            }
          });
        });
  
        updateManager.onUpdateFailed(() => {
          console.log('更新失败');
        });
      }
    },
  
    // 设置当前会话
    setCurrentSession(sessionData) {
      this.globalData.currentSession = sessionData;
      if (sessionData && sessionData.sessionId) {
        wx.setStorageSync('currentSessionId', sessionData.sessionId);
      }
    },
  
    // 清除当前会话
    clearCurrentSession() {
      this.globalData.currentSession = null;
      this.globalData.currentPlan = null;
      wx.removeStorageSync('currentSessionId');
    },
  
    // 设置当前规划
    setCurrentPlan(planData) {
      this.globalData.currentPlan = planData;
    }
  });