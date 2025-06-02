const axios = require('axios');
const config = require('../config');

class AIService {
  constructor() {
    this.baseURL = config.aiService.baseURL;
    this.apiKey = config.aiService.apiKey;
  }

  // 生成旅行规划
  async generateTravelPlan(params) {
    try {
      // 构建大模型需要的参数
      const requestData = {
        destination: params.destination, // 数组
        start_date: params.start_date,   // 字段名对齐
        end_date: params.end_date,
        budget: params.budget,
        people_count: params.people_count,
        preference: params.preference
      };

      const response = await axios.post(
        `${this.baseURL}/plan_trip`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
            // 如果需要API Key，可以加上
            // 'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      // 解析hotel_info为对象
      let data = response.data;
      if (typeof data.hotel_info === 'string') {
        try {
          data.hotel_info = JSON.parse(data.hotel_info);
        } catch (e) {
          // 解析失败，保留原始字符串
        }
      }

      return data;
    } catch (error) {
      console.error('生成旅行规划失败:', error);
      throw new Error('生成旅行规划失败，请稍后重试');
    }
  }

  // 处理实时对话
  async handleConversation(message, sessionId) {
    try {
      const response = await axios.post(`${this.baseURL}/chat`, {
        message,
        sessionId,
        context: 'travel_assistant'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('处理对话失败:', error);
      throw new Error('处理对话失败，请稍后重试');
    }
  }

  // 格式化旅行规划数据
  formatTravelPlan(data) {
    return {
      initialPlan: {
        overview: data.initial_plan.overview,
        dailyPlans: data.initial_plan.daily_plans.map(plan => ({
          day: plan.day,
          activities: plan.activities,
          transportation: plan.transportation,
          meals: plan.meals
        }))
      },
      hotelInfo: {
        recommendations: data.hotel_info.recommendations.map(hotel => ({
          name: hotel.name,
          location: hotel.location,
          price: hotel.price,
          rating: hotel.rating,
          amenities: hotel.amenities
        }))
      },
      finalPlan: {
        summary: data.final_plan.summary,
        budget: data.final_plan.budget,
        tips: data.final_plan.tips
      }
    };
  }
}

module.exports = new AIService(); 