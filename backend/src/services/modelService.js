const axios = require('axios');
const config = require('../config');

class ModelService {
  constructor() {
    // 大模型API配置
    this.modelApiUrl = config.MODEL_API_URL || 'http://localhost:5000';
    this.timeout = 30000; // 30秒超时
  }

  // 生成旅行规划
  async generateTravelPlan(planData) {
    try {
      console.log('发送规划请求到大模型:', planData);
      
      // 构建发送给大模型的请求格式
      const modelRequest = {
        destination: planData.destination,
        start_date: planData.start_date,
        end_date: planData.end_date,
        budget: planData.budget,
        people_count: planData.people_count,
        preference: this.buildPreferenceString(planData),
        request_type: 'travel_plan'
      };

      const response = await axios.post(
        `${this.modelApiUrl}/plan_trip`,
        modelRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      console.log('大模型返回数据:', response.data);

      // 检查响应格式
      if (!response.data) {
        throw new Error('大模型返回数据为空');
      }

      // 解析大模型返回的数据
      const parsedData = this.parseModelResponse(response.data);

      return {
        success: true,
        data: parsedData
      };

    } catch (error) {
      console.error('大模型服务调用失败:', error.message);
      
      // 如果大模型服务不可用，返回模拟数据用于开发测试
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('大模型服务不可用，返回模拟数据...');
        return {
          success: true,
          data: this.getMockPlanData(planData)
        };
      }
      
      throw error;
    }
  }

  // 获取推荐
  async getRecommendations(recommendData) {
    try {
      console.log('发送推荐请求到大模型:', recommendData);
      
      const response = await axios.post(
        `${this.modelApiUrl}/recommend`,
        recommendData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('推荐服务调用失败:', error.message);
      
      // 返回模拟推荐数据
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('推荐服务不可用，返回模拟数据...');
        return {
          success: true,
          data: this.getMockRecommendData(recommendData)
        };
      }
      
      throw error;
    }
  }

  // 助手对话
  async chatWithAssistant(chatData) {
    try {
      console.log('发送对话请求到大模型:', chatData);
      
      const response = await axios.post(
        `${this.modelApiUrl}/chat`,
        chatData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('对话服务调用失败:', error.message);
      
      // 返回模拟对话数据
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('对话服务不可用，返回模拟回复...');
        return {
          success: true,
          data: {
            reply: `我理解您说的是"${chatData.message}"。由于大模型服务暂时不可用，这是一个模拟回复。请稍后重试。`,
            suggestions: ['查看附近景点', '推荐美食', '寻找住宿'],
            context: chatData.context
          }
        };
      }
      
      throw error;
    }
  }

  // 修改旅行规划
  async modifyTravelPlan(planId, modifications) {
    try {
      console.log(`修改规划 ${planId}:`, modifications);
      
      const response = await axios.put(
        `${this.modelApiUrl}/plan_trip/${planId}`,
        modifications,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('修改规划服务调用失败:', error.message);
      throw error;
    }
  }

  // 构建偏好字符串
  buildPreferenceString(planData) {
    const preferences = [];
    
    if (planData.companion_type) {
      preferences.push(`同行类型：${planData.companion_type}`);
    }
    
    if (planData.interests && planData.interests.length > 0) {
      preferences.push(`兴趣爱好：${planData.interests.join('、')}`);
    }
    
    if (planData.preference) {
      preferences.push(planData.preference);
    }

    return preferences.join('；');
  }

  // 解析大模型返回数据
  parseModelResponse(rawData) {
    try {
      // 如果大模型返回的是字符串格式的JSON，需要解析
      if (typeof rawData === 'string') {
        // 尝试提取JSON部分
        const jsonMatch = rawData.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          rawData = JSON.parse(jsonMatch[0]);
        }
      }

      // 确保返回标准格式
      return {
        initial_plan: rawData.initial_plan || rawData.plan || '',
        hotel_info: rawData.hotel_info || rawData.hotels || [],
        final_plan: rawData.final_plan || rawData.itinerary || ''
      };

    } catch (error) {
      console.error('解析大模型返回数据失败:', error);
      // 返回原始数据
      return rawData;
    }
  }

  // 获取模拟规划数据
  getMockPlanData(planData) {
    const destinations = Array.isArray(planData.destination) 
      ? planData.destination.join('、') 
      : planData.destination;

    return {
      initial_plan: `根据您的需求，我为您规划了一个${planData.people_count}人的${destinations}旅行。行程时间从${planData.start_date}到${planData.end_date}，预算为${planData.budget}元。`,
      hotel_info: [
        {
          name: "推荐酒店1",
          location: destinations,
          price: "300-500元/晚",
          rating: 4.5,
          features: ["免费WiFi", "早餐", "停车场"]
        },
        {
          name: "推荐酒店2", 
          location: destinations,
          price: "500-800元/晚",
          rating: 4.8,
          features: ["海景房", "游泳池", "健身房"]
        }
      ],
      final_plan: `详细行程安排：\n第1天：抵达${destinations}，入住酒店，市区观光\n第2天：主要景点游览，品尝当地美食\n第3天：自由活动，购物，返程准备\n\n预计总费用：${planData.budget}元，包含住宿、交通、餐饮等。`
    };
  }

  // 获取模拟推荐数据
  getMockRecommendData(recommendData) {
    const recommendations = {
      restaurant: [
        { name: "当地特色餐厅", rating: 4.6, price: "￥￥", cuisine: "本地菜" },
        { name: "网红美食店", rating: 4.4, price: "￥￥￥", cuisine: "融合菜" }
      ],
      attraction: [
        { name: "热门景点A", rating: 4.7, type: "自然风光", distance: "2km" },
        { name: "文化古迹B", rating: 4.5, type: "历史文化", distance: "5km" }
      ],
      bar: [
        { name: "氛围酒吧", rating: 4.3, type: "音乐酒吧", price: "￥￥" },
        { name: "屋顶酒吧", rating: 4.6, type: "景观酒吧", price: "￥￥￥" }
      ]
    };

    return recommendations[recommendData.request_type] || [];
  }
}

module.exports = new ModelService();