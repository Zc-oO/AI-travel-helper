const { COMPANION_TYPES, BUDGET_RANGES, INTEREST_TAGS, ERROR_MESSAGES } = require('../utils/constants');

class ValidationMiddleware {
  // 验证旅行规划数据
  validatePlanData(req, res, next) {
    try {
      const { 
        destination, 
        start_date, 
        end_date, 
        budget, 
        people_count,
        companion_type,
        interests 
      } = req.body;

      const errors = [];

      // 验证必填字段
      if (!destination || (Array.isArray(destination) && destination.length === 0)) {
        errors.push('目的地不能为空');
      }

      if (!start_date) {
        errors.push('出发日期不能为空');
      }

      if (!end_date) {
        errors.push('结束日期不能为空');
      }

      if (!budget || budget <= 0) {
        errors.push('预算必须大于0');
      }

      if (!people_count || people_count <= 0 || people_count > 20) {
        errors.push('人数必须在1-20之间');
      }

      // 验证日期格式和逻辑
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (isNaN(startDate.getTime())) {
          errors.push('出发日期格式不正确');
        }
        
        if (isNaN(endDate.getTime())) {
          errors.push('结束日期格式不正确');
        }
        
        if (startDate >= endDate) {
          errors.push('结束日期必须晚于出发日期');
        }

        // 检查日期是否太远
        const today = new Date();
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(today.getFullYear() + 2);
        
        if (startDate > maxFutureDate) {
          errors.push('出发日期不能超过两年后');
        }
      }

      // 验证同行类型
      if (companion_type) {
        const validCompanionTypes = Object.values(COMPANION_TYPES).map(type => type.key);
        if (!validCompanionTypes.includes(companion_type)) {
          errors.push('同行类型不合法');
        }
      }

      // 验证兴趣标签
      if (interests && Array.isArray(interests)) {
        const validInterests = Object.values(INTEREST_TAGS).map(tag => tag.key);
        const invalidInterests = interests.filter(interest => !validInterests.includes(interest));
        if (invalidInterests.length > 0) {
          errors.push(`无效的兴趣标签: ${invalidInterests.join(', ')}`);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
          errors: errors
        });
      }

      next();
    } catch (error) {
      console.error('数据验证失败:', error);
      res.status(500).json({
        success: false,
        message: '数据验证过程中发生错误',
        error: error.message
      });
    }
  }

  // 验证推荐请求数据
  validateRecommendationData(req, res, next) {
    try {
      const { location, request_type } = req.body;
      const errors = [];

      if (!location || typeof location !== 'string' || location.trim().length === 0) {
        errors.push('位置信息不能为空');
      }

      if (!request_type || typeof request_type !== 'string') {
        errors.push('请求类型不能为空');
      }

      const validRequestTypes = ['restaurant', 'attraction', 'hotel', 'bar', 'shopping', 'entertainment'];
      if (request_type && !validRequestTypes.includes(request_type)) {
        errors.push(`请求类型必须是以下之一: ${validRequestTypes.join(', ')}`);
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
          errors: errors
        });
      }

      next();
    } catch (error) {
      console.error('推荐数据验证失败:', error);
      res.status(500).json({
        success: false,
        message: '推荐数据验证过程中发生错误',
        error: error.message
      });
    }
  }

  // 验证聊天数据
  validateChatData(req, res, next) {
    try {
      const { message } = req.body;
      const errors = [];

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        errors.push('消息内容不能为空');
      }

      if (message && message.length > 1000) {
        errors.push('消息内容不能超过1000个字符');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
          errors: errors
        });
      }

      next();
    } catch (error) {
      console.error('聊天数据验证失败:', error);
      res.status(500).json({
        success: false,
        message: '聊天数据验证过程中发生错误',
        error: error.message
      });
    }
  }

  // 验证分页参数
  validatePaginationParams(req, res, next) {
    try {
      let { page = 1, limit = 10 } = req.query;
      
      page = parseInt(page);
      limit = parseInt(limit);

      if (isNaN(page) || page < 1) {
        page = 1;
      }

      if (isNaN(limit) || limit < 1 || limit > 100) {
        limit = 10;
      }

      req.pagination = { page, limit };
      next();
    } catch (error) {
      console.error('分页参数验证失败:', error);
      res.status(500).json({
        success: false,
        message: '分页参数验证过程中发生错误',
        error: error.message
      });
    }
  }

  // 通用参数清理
  sanitizeInput(req, res, next) {
    try {
      // 递归清理对象中的字符串
      function cleanObject(obj) {
        if (typeof obj === 'string') {
          return obj.trim();
        }
        
        if (Array.isArray(obj)) {
          return obj.map(item => cleanObject(item));
        }
        
        if (obj && typeof obj === 'object') {
          const cleaned = {};
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              cleaned[key] = cleanObject(obj[key]);
            }
          }
          return cleaned;
        }
        
        return obj;
      }

      req.body = cleanObject(req.body);
      req.query = cleanObject(req.query);
      
      next();
    } catch (error) {
      console.error('输入清理失败:', error);
      res.status(500).json({
        success: false,
        message: '输入数据处理过程中发生错误',
        error: error.message
      });
    }
  }
}

module.exports = new ValidationMiddleware();