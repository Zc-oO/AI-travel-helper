const express = require('express');
const router = express.Router();
const planFormService = require('../services/planFormService');
const validationMiddleware = require('../middleware/validation');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');

// 初始化表单会话
router.post('/init', (req, res) => {
  try {
    const formSession = planFormService.initFormSession();
    
    res.json({
      success: true,
      message: '表单会话初始化成功',
      data: {
        sessionId: formSession.sessionId,
        currentStep: formSession.step,
        completeness: 0
      }
    });
  } catch (error) {
    console.error('初始化表单会话失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化表单会话失败',
      error: error.message
    });
  }
});

// 获取当前表单状态
router.get('/status/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const formData = planFormService.getFormData(sessionId);
    const validation = planFormService.validateFormCompletion(sessionId);
    
    res.json({
      success: true,
      data: {
        sessionId: formData.sessionId,
        currentStep: formData.step,
        completeness: validation.completeness,
        isValid: validation.isValid,
        errors: validation.errors,
        formData: formData.data,
        createdAt: formData.createdAt,
        updatedAt: formData.updatedAt
      }
    });
  } catch (error) {
    console.error('获取表单状态失败:', error);
    res.status(404).json({
      success: false,
      message: '表单会话不存在或已过期',
      error: error.message
    });
  }
});

// 步骤1：提交目的地
router.post('/step1/:sessionId', validationMiddleware.sanitizeInput, (req, res) => {
  try {
    const { sessionId } = req.params;
    const { destination } = req.body;
    
    if (!destination || (Array.isArray(destination) && destination.length === 0)) {
      return res.status(400).json({
        success: false,
        message: '请选择至少一个目的地'
      });
    }

    const formData = planFormService.updateFormStep(sessionId, 1, { destination });
    
    res.json({
      success: true,
      message: '目的地信息保存成功',
      data: {
        currentStep: formData.step,
        destination: formData.data.destination,
        nextStep: 2
      }
    });
  } catch (error) {
    console.error('保存目的地失败:', error);
    res.status(500).json({
      success: false,
      message: '保存目的地信息失败',
      error: error.message
    });
  }
});

// 步骤2：提交同行类型
router.post('/step2/:sessionId', validationMiddleware.sanitizeInput, (req, res) => {
  try {
    const { sessionId } = req.params;
    const { companion_type } = req.body;
    
    if (!companion_type) {
      return res.status(400).json({
        success: false,
        message: '请选择同行类型'
      });
    }

    const formData = planFormService.updateFormStep(sessionId, 2, { companion_type });
    
    res.json({
      success: true,
      message: '同行类型保存成功',
      data: {
        currentStep: formData.step,
        companion_type: formData.data.companion_type,
        people_count: formData.data.people_count,
        nextStep: 3
      }
    });
  } catch (error) {
    console.error('保存同行类型失败:', error);
    res.status(500).json({
      success: false,
      message: '保存同行类型失败',
      error: error.message
    });
  }
});

// 步骤3：提交日期和交通信息
router.post('/step3/:sessionId', validationMiddleware.sanitizeInput, (req, res) => {
  try {
    const { sessionId } = req.params;
    const { start_date, end_date, transportation, people_count } = req.body;
    
    const errors = [];
    
    if (!start_date) errors.push('请选择出发日期');
    if (!end_date) errors.push('请选择返回日期');
    
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (startDate >= endDate) {
        errors.push('返回日期必须晚于出发日期');
      }
    }
    
    if (people_count && (people_count < 1 || people_count > 20)) {
      errors.push('人数必须在1-20之间');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors
      });
    }

    const stepData = { start_date, end_date };
    if (transportation) stepData.transportation = transportation;
    if (people_count) stepData.people_count = people_count;

    const formData = planFormService.updateFormStep(sessionId, 3, stepData);
    
    res.json({
      success: true,
      message: '日期和交通信息保存成功',
      data: {
        currentStep: formData.step,
        start_date: formData.data.start_date,
        end_date: formData.data.end_date,
        transportation: formData.data.transportation,
        people_count: formData.data.people_count,
        nextStep: 4
      }
    });
  } catch (error) {
    console.error('保存日期信息失败:', error);
    res.status(500).json({
      success: false,
      message: '保存日期信息失败',
      error: error.message
    });
  }
});

// 步骤4：提交兴趣标签
router.post('/step4/:sessionId', validationMiddleware.sanitizeInput, (req, res) => {
  try {
    const { sessionId } = req.params;
    const { interests } = req.body;
    
    // 兴趣标签是可选的，但如果提供了需要验证格式
    let processedInterests = [];
    if (interests) {
      processedInterests = Array.isArray(interests) ? interests : [interests];
    }

    const formData = planFormService.updateFormStep(sessionId, 4, { 
      interests: processedInterests 
    });
    
    res.json({
      success: true,
      message: '兴趣偏好保存成功',
      data: {
        currentStep: formData.step,
        interests: formData.data.interests,
        nextStep: 5
      }
    });
  } catch (error) {
    console.error('保存兴趣偏好失败:', error);
    res.status(500).json({
      success: false,
      message: '保存兴趣偏好失败',
      error: error.message
    });
  }
});

// 步骤5：提交预算信息
router.post('/step5/:sessionId', validationMiddleware.sanitizeInput, (req, res) => {
  try {
    const { sessionId } = req.params;
    const { budget_type, budget_amount, preference } = req.body;
    
    if (!budget_type && !budget_amount) {
      return res.status(400).json({
        success: false,
        message: '请选择预算档次或输入具体预算金额'
      });
    }

    if (budget_amount && (budget_amount < 100 || budget_amount > 100000)) {
      return res.status(400).json({
        success: false,
        message: '预算金额应在100-100000元之间'
      });
    }

    const stepData = {};
    if (budget_type) stepData.budget_type = budget_type;
    if (budget_amount) stepData.budget_amount = budget_amount;
    if (preference) stepData.preference = preference;

    const formData = planFormService.updateFormStep(sessionId, 5, stepData);
    
    // 检查表单完整性
    const validation = planFormService.validateFormCompletion(sessionId);
    
    res.json({
      success: true,
      message: '预算信息保存成功',
      data: {
        currentStep: formData.step,
        budget_type: formData.data.budget_type,
        budget_amount: formData.data.budget_amount,
        preference: formData.data.preference,
        completeness: validation.completeness,
        isReady: validation.isValid,
        canGenerate: validation.isValid
      }
    });
  } catch (error) {
    console.error('保存预算信息失败:', error);
    res.status(500).json({
      success: false,
      message: '保存预算信息失败',
      error: error.message
    });
  }
});

// 获取表单摘要（用于生成行程页面）
router.get('/summary/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const formData = planFormService.getFormData(sessionId);
    const validation = planFormService.validateFormCompletion(sessionId);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: '表单信息不完整，无法生成摘要',
        errors: validation.errors
      });
    }

    // 构建表单摘要
    const summary = {
      sessionId: formData.sessionId,
      tripName: `${formData.data.destination.join('、')}之旅`,
      destination: formData.data.destination,
      companion_type: formData.data.companion_type,
      start_date: formData.data.start_date,
      end_date: formData.data.end_date,
      people_count: formData.data.people_count,
      budget_info: formData.data.budget_type || `￥${formData.data.budget_amount}`,
      interests: formData.data.interests,
      transportation: formData.data.transportation,
      preference: formData.data.preference,
      duration: calculateTripDuration(formData.data.start_date, formData.data.end_date)
    };
    
    res.json({
      success: true,
      message: '表单摘要获取成功',
      data: summary
    });
  } catch (error) {
    console.error('获取表单摘要失败:', error);
    res.status(500).json({
      success: false,
      message: '获取表单摘要失败',
      error: error.message
    });
  }
});

// 转换为大模型请求格式
router.get('/model-request/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const validation = planFormService.validateFormCompletion(sessionId);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: '表单信息不完整，无法生成请求',
        errors: validation.errors
      });
    }

    const modelRequest = planFormService.convertToModelRequest(sessionId);
    
    res.json({
      success: true,
      message: '大模型请求数据生成成功',
      data: modelRequest
    });
  } catch (error) {
    console.error('生成大模型请求失败:', error);
    res.status(500).json({
      success: false,
      message: '生成大模型请求失败',
      error: error.message
    });
  }
});

// 清理过期表单
router.post('/cleanup', (req, res) => {
  try {
    const cleanedCount = planFormService.cleanupExpiredSessions();
    
    res.json({
      success: true,
      message: '表单清理完成',
      data: {
        cleanedSessions: cleanedCount
      }
    });
  } catch (error) {
    console.error('清理表单失败:', error);
    res.status(500).json({
      success: false,
      message: '清理表单失败',
      error: error.message
    });
  }
});

// 获取表单统计信息
router.get('/stats', (req, res) => {
  try {
    const stats = planFormService.getFormStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取表单统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取表单统计失败',
      error: error.message
    });
  }
});

// 工具函数：计算旅行天数
function calculateTripDuration(startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return 1;
  }
}

module.exports = router;