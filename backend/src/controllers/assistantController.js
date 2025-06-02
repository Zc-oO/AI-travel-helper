const modelService = require('../services/modelService');

class AssistantController {
  // 获取智能推荐
  async getRecommendation(req, res) {
    try {
      console.log('收到推荐请求:', req.body);
      
      const { 
        location,        // 当前位置
        request_type,    // 请求类型: restaurant, attraction, hotel, bar, etc.
        preferences,     // 用户偏好
        budget_range,    // 预算范围
        current_time     // 当前时间
      } = req.body;

      // 验证必填字段
      if (!location || !request_type) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段: location 或 request_type'
        });
      }

      // 构建推荐请求
      const recommendRequest = {
        location,
        request_type,
        preferences: preferences || [],
        budget_range: budget_range || 'medium',
        current_time: current_time || new Date().toISOString(),
        context: '旅行助手推荐'
      };

      console.log('调用大模型获取推荐...');
      
      // 调用大模型服务
      const modelResponse = await modelService.getRecommendations(recommendRequest);
      
      if (!modelResponse || !modelResponse.success) {
        throw new Error('大模型推荐服务调用失败');
      }

      res.json({
        success: true,
        message: '推荐获取成功',
        data: modelResponse.data
      });

    } catch (error) {
      console.error('获取推荐失败:', error);
      res.status(500).json({
        success: false,
        message: '获取推荐失败',
        error: error.message
      });
    }
  }

  // 与助手对话
  async chatWithAssistant(req, res) {
    try {
      console.log('收到助手对话请求:', req.body);
      
      const { 
        message,         // 用户消息
        context,         // 对话上下文
        location,        // 用户位置
        chat_history     // 聊天历史
      } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: '缺少消息内容'
        });
      }

      // 构建聊天请求
      const chatRequest = {
        message,
        context: context || '旅行助手对话',
        location: location || '',
        chat_history: chat_history || [],
        timestamp: new Date().toISOString()
      };

      console.log('调用大模型进行对话...');
      
      // 调用大模型服务
      const modelResponse = await modelService.chatWithAssistant(chatRequest);
      
      if (!modelResponse || !modelResponse.success) {
        throw new Error('大模型对话服务调用失败');
      }

      res.json({
        success: true,
        message: '对话成功',
        data: {
          reply: modelResponse.data.reply,
          suggestions: modelResponse.data.suggestions || [],
          context_updated: modelResponse.data.context
        }
      });

    } catch (error) {
      console.error('助手对话失败:', error);
      res.status(500).json({
        success: false,
        message: '助手对话失败',
        error: error.message
      });
    }
  }
}

module.exports = new AssistantController();