// 简单的状态管理工具
class Store {
  constructor() {
    this.state = {
      userInfo: null,
      currentSession: null,
      currentPlan: null,
      systemInfo: null
    };
    this.listeners = [];
  }

  // 获取状态
  getState() {
    return this.state;
  }

  // 设置状态
  setState(newState) {
    this.state = {
      ...this.state,
      ...newState
    };
    this.notify();
  }

  // 订阅状态变化
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 通知所有订阅者
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // 清除状态
  clear() {
    this.state = {
      userInfo: null,
      currentSession: null,
      currentPlan: null,
      systemInfo: null
    };
    this.notify();
  }
}

// 创建单例
const store = new Store();

module.exports = store; 