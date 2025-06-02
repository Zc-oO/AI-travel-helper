const modelService = require('../services/modelService');
const dataProcessor = require('../services/dataProcessor');
const planFormService = require('../services/planFormService');
const validationMiddleware = require('../middleware/validation');

class PlanController {
  // 从表单会话生成旅行规划
  async generateFromSession(req, res) {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: '缺少会话ID'
        });
      }

      console.log('从表单会话生成规划:', sessionId);
      
      // 验证表单完整性
      const validation = planFormService.validateFormCompletion(sessionId);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: '表单信息不完整',
          errors: validation.errors
        });
      }

      // 转换为大模型请求格式
      const modelRequest = planFormService.convertToModelRequest(sessionId);
      
      console.log('调用大模型服务...');
      
      // 调用大模型服务
      const modelResponse = await modelService.generateTravelPlan(modelRequest);
      
      if (!modelResponse || !modelResponse.success) {
        throw new Error('大模型服务调用失败');
      }

      // 处理返回数据
      const processedData = dataProcessor.processPlanData(modelResponse.data);
      
      // 标记表单为已完成
      planFormService.completeForm(sessionId, { planGenerated: true });
      
      res.json({
        success: true,
        message: '旅行规划生成成功',
        data: {
          ...processedData,
          sessionId: sessionId,
          planId: generatePlanId(),
          formData: planFormService.getFormData(sessionId).data
        }
      });

    } catch (error) {
      console.error('从表单生成旅行规划失败:', error);
      res.status(500).json({
        success: false,
        message: '生成旅行规划失败',
        error: error.message
      });
    }
  }
  // 生成旅行规划
  async generatePlan(req, res) {
    try {
      console.log('收到旅行规划请求:', req.body);
      
      const { 
        destination,     // 目的地数组
        start_date,      // 出发日期
        end_date,        // 结束日期
        budget,          // 预算
        people_count,    // 人数
        preference,      // 旅行偏好
        companion_type,  // 同行类型
        interests,       // 兴趣标签
        transportation   // 交通信息
      } = req.body;

      // 验证必填字段
      const requiredFields = ['destination', 'start_date', 'end_date', 'budget', 'people_count'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }

      // 构建大模型请求数据
      const modelRequest = {
        destination,
        start_date,
        end_date,
        budget,
        people_count,
        preference: preference || '',
        companion_type: companion_type || '独自旅行',
        interests: interests || [],
        transportation: transportation || {}
      };

      console.log('调用大模型服务...');
      
      // 调用大模型服务
      const modelResponse = await modelService.generateTravelPlan(modelRequest);
      
      if (!modelResponse || !modelResponse.success) {
        throw new Error('大模型服务调用失败');
      }

      // 处理返回数据
      const processedData = dataProcessor.processPlanData(modelResponse.data);
      
      res.json({
        success: true,
        message: '旅行规划生成成功',
        data: processedData,
        planId: generatePlanId()
      });

    } catch (error) {
      console.error('生成旅行规划失败:', error);
      res.status(500).json({
        success: false,
        message: '生成旅行规划失败',
        error: error.message
      });
    }
  }

  // 获取规划详情
  async getPlanDetail(req, res) {
    try {
      const { planId } = req.params;
      
      // TODO: 从数据库或缓存中获取规划详情
      // 这里先返回模拟数据
      res.json({
        success: true,
        message: '获取规划详情成功',
        data: {
          planId,
          status: 'completed',
          // 其他详情数据...
        }
      });

    } catch (error) {
      console.error('获取规划详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取规划详情失败',
        error: error.message
      });
    }
  }

  // 修改规划
  async modifyPlan(req, res) {
    try {
      const { planId } = req.params;
      const modifications = req.body;
      
      console.log(`修改规划 ${planId}:`, modifications);
      
      // 调用大模型重新生成
      const modelResponse = await modelService.modifyTravelPlan(planId, modifications);
      
      res.json({
        success: true,
        message: '规划修改成功',
        data: modelResponse.data
      });

    } catch (error) {
      console.error('修改规划失败:', error);
      res.status(500).json({
        success: false,
        message: '修改规划失败',
        error: error.message
      });
    }
  }
}

// 生成规划ID
function generatePlanId() {
  return 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

module.exports = new PlanController();