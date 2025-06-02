const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const validationMiddleware = require('../middleware/validation');

// 从表单会话生成旅行规划
router.post('/generate-from-session', planController.generateFromSession);

// 直接生成旅行规划（兼容旧版本）
router.post('/generate', validationMiddleware.validatePlanData, planController.generatePlan);

// 获取规划详情
router.get('/detail/:planId', planController.getPlanDetail);

// 修改规划
router.put('/modify/:planId', planController.modifyPlan);

module.exports = router;