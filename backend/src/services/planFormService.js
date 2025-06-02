const { COMPANION_TYPES, BUDGET_RANGES, INTEREST_TAGS } = require('../utils/constants');

class PlanFormService {
  constructor() {
    // 内存存储用户表单数据 (生产环境应该用Redis或数据库)
    this.formDataStore = new Map();
    this.sessionTimeout = 30 * 60 * 1000; // 30分钟超时
  }

  // 生成会话ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 初始化表单会话
  initFormSession(sessionId = null) {
    const id = sessionId || this.generateSessionId();
    
    const initialData = {
      sessionId: id,
      createdAt: new Date(),
      updatedAt: new Date(),
      step: 1,
      completed: false,
      data: {
        destination: [],
        companion_type: null,
        start_date: null,
        end_date: null,
        transportation: {},
        interests: [],
        budget_type: null,
        budget_amount: null,
        people_count: 1,
        preference: ''
      }
    };

    this.formDataStore.set(id, initialData);
    this.setSessionTimeout(id);
    
    return initialData;
  }

  // 设置会话超时
  setSessionTimeout(sessionId) {
    setTimeout(() => {
      if (this.formDataStore.has(sessionId)) {
        console.log(`会话 ${sessionId} 已超时，清理数据`);
        this.formDataStore.delete(sessionId);
      }
    }, this.sessionTimeout);
  }

  // 获取表单数据
  getFormData(sessionId) {
    const formData = this.formDataStore.get(sessionId);
    
    if (!formData) {
      throw new Error('会话不存在或已过期');
    }

    // 更新最后访问时间
    formData.updatedAt = new Date();
    this.formDataStore.set(sessionId, formData);
    
    return formData;
  }

  // 更新表单步骤数据
  updateFormStep(sessionId, stepNumber, stepData) {
    const formData = this.getFormData(sessionId);
    
    // 更新步骤和数据
    formData.step = Math.max(formData.step, stepNumber);
    formData.updatedAt = new Date();
    
    // 根据步骤更新对应数据
    switch (stepNumber) {
      case 1: // 目的地
        if (stepData.destination) {
          formData.data.destination = Array.isArray(stepData.destination) 
            ? stepData.destination 
            : [stepData.destination];
        }
        break;
        
      case 2: // 同行类型
        if (stepData.companion_type) {
          formData.data.companion_type = stepData.companion_type;
          // 根据同行类型自动设置人数
          if (stepData.companion_type === 'solo') {
            formData.data.people_count = 1;
          } else if (stepData.companion_type === 'couple') {
            formData.data.people_count = 2;
          }
        }
        break;
        
      case 3: // 日期和交通
        if (stepData.start_date) formData.data.start_date = stepData.start_date;
        if (stepData.end_date) formData.data.end_date = stepData.end_date;
        if (stepData.transportation) formData.data.transportation = stepData.transportation;
        if (stepData.people_count) formData.data.people_count = stepData.people_count;
        break;
        
      case 4: // 兴趣标签
        if (stepData.interests) {
          formData.data.interests = Array.isArray(stepData.interests) 
            ? stepData.interests 
            : [stepData.interests];
        }
        break;
        
      case 5: // 预算
        if (stepData.budget_type) formData.data.budget_type = stepData.budget_type;
        if (stepData.budget_amount) formData.data.budget_amount = stepData.budget_amount;
        if (stepData.preference) formData.data.preference = stepData.preference;
        break;
    }

    this.formDataStore.set(sessionId, formData);
    return formData;
  }

  // 完成表单填写
  completeForm(sessionId, finalData = {}) {
    const formData = this.getFormData(sessionId);
    
    // 合并最终数据
    Object.assign(formData.data, finalData);
    formData.completed = true;
    formData.completedAt = new Date();
    
    this.formDataStore.set(sessionId, formData);
    return formData;
  }

  // 验证表单完整性
  validateFormCompletion(sessionId) {
    const formData = this.getFormData(sessionId);
    const data = formData.data;
    const errors = [];

    // 检查必填字段
    if (!data.destination || data.destination.length === 0) {
      errors.push('请选择目的地');
    }

    if (!data.start_date) {
      errors.push('请选择出发日期');
    }

    if (!data.end_date) {
      errors.push('请选择返回日期');
    }

    if (!data.companion_type) {
      errors.push('请选择同行类型');
    }

    if (!data.budget_type && !data.budget_amount) {
      errors.push('请选择预算档次或输入预算金额');
    }

    return {
      isValid: errors.length === 0,
      errors,
      completeness: this.calculateCompleteness(data)
    };
  }

  // 计算表单完成度
  calculateCompleteness(data) {
    const requiredFields = [
      'destination', 'start_date', 'end_date', 
      'companion_type', 'people_count'
    ];
    
    const optionalFields = [
      'transportation', 'interests', 'budget_type', 
      'budget_amount', 'preference'
    ];

    let completed = 0;
    let total = requiredFields.length + optionalFields.length;

    // 检查必填字段
    requiredFields.forEach(field => {
      if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : true)) {
        completed++;
      }
    });

    // 检查可选字段
    optionalFields.forEach(field => {
      if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : 
          typeof data[field] === 'object' ? Object.keys(data[field]).length > 0 : true)) {
        completed++;
      }
    });

    return Math.round((completed / total) * 100);
  }

  // 转换为大模型请求格式
  convertToModelRequest(sessionId) {
    const formData = this.getFormData(sessionId);
    const data = formData.data;

    // 处理预算
    let budget = data.budget_amount;
    if (!budget && data.budget_type && BUDGET_RANGES[data.budget_type.toUpperCase()]) {
      const budgetRange = BUDGET_RANGES[data.budget_type.toUpperCase()];
      budget = Math.round((budgetRange.range[0] + budgetRange.range[1]) / 2);
    }

    // 构建偏好字符串
    let preference = data.preference || '';
    
    if (data.companion_type && COMPANION_TYPES[data.companion_type.toUpperCase()]) {
      const companionInfo = COMPANION_TYPES[data.companion_type.toUpperCase()];
      preference += ` 同行类型：${companionInfo.label}`;
    }

    if (data.interests && data.interests.length > 0) {
      const interestLabels = data.interests.map(interest => {
        const tag = Object.values(INTEREST_TAGS).find(tag => tag.key === interest);
        return tag ? tag.label : interest;
      });
      preference += ` 兴趣偏好：${interestLabels.join('、')}`;
    }

    return {
      destination: data.destination,
      start_date: data.start_date,
      end_date: data.end_date,
      budget: budget || 5000,
      people_count: data.people_count || 1,
      preference: preference.trim(),
      companion_type: data.companion_type,
      interests: data.interests,
      transportation: data.transportation
    };
  }

  // 获取表单统计信息
  getFormStats() {
    return {
      activeSessions: this.formDataStore.size,
      completedForms: Array.from(this.formDataStore.values()).filter(form => form.completed).length
    };
  }

  // 清理过期会话
  cleanupExpiredSessions() {
    const now = new Date();
    const expiredSessions = [];

    this.formDataStore.forEach((formData, sessionId) => {
      const timeDiff = now - formData.updatedAt;
      if (timeDiff > this.sessionTimeout) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach(sessionId => {
      this.formDataStore.delete(sessionId);
    });

    console.log(`清理了 ${expiredSessions.length} 个过期会话`);
    return expiredSessions.length;
  }
}

module.exports = new PlanFormService();