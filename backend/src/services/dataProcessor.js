class DataProcessor {
    // 处理旅行规划数据
    processPlanData(rawData) {
      try {
        console.log('处理规划数据:', rawData);
  
        // 标准化数据格式
        const processedData = {
          summary: {
            title: this.extractPlanTitle(rawData.initial_plan),
            description: rawData.initial_plan || '',
            total_days: this.calculateTotalDays(rawData),
            estimated_cost: this.extractCost(rawData.initial_plan)
          },
          
          hotels: this.processHotelInfo(rawData.hotel_info),
          
          itinerary: this.processItinerary(rawData.final_plan),
          
          recommendations: this.extractRecommendations(rawData.final_plan),
          
          // 原始数据保留
          raw_data: {
            initial_plan: rawData.initial_plan,
            hotel_info: rawData.hotel_info,
            final_plan: rawData.final_plan
          }
        };
  
        return processedData;
  
      } catch (error) {
        console.error('处理规划数据失败:', error);
        
        // 返回基础格式
        return {
          summary: {
            title: '旅行规划',
            description: rawData.initial_plan || '规划生成中...',
            total_days: 1,
            estimated_cost: '待确定'
          },
          hotels: this.processHotelInfo(rawData.hotel_info),
          itinerary: rawData.final_plan || '详细行程规划中...',
          recommendations: [],
          raw_data: rawData
        };
      }
    }
  
    // 处理酒店信息
    processHotelInfo(hotelData) {
      if (!hotelData || !Array.isArray(hotelData)) {
        return [];
      }
  
      return hotelData.map((hotel, index) => ({
        id: `hotel_${index + 1}`,
        name: hotel.name || `推荐酒店${index + 1}`,
        location: hotel.location || '',
        price_range: hotel.price || hotel.price_range || '价格待确定',
        rating: hotel.rating || 0,
        features: hotel.features || hotel.amenities || [],
        description: hotel.description || '',
        contact: hotel.contact || {},
        images: hotel.images || []
      }));
    }
  
    // 处理行程数据
    processItinerary(itineraryText) {
      if (!itineraryText) {
        return {
          days: [],
          text: ''
        };
      }
  
      try {
        // 尝试解析日程安排
        const days = this.parseItineraryDays(itineraryText);
        
        return {
          days: days,
          text: itineraryText,
          total_days: days.length
        };
  
      } catch (error) {
        console.error('解析行程失败:', error);
        return {
          days: [],
          text: itineraryText,
          total_days: 0
        };
      }
    }
  
    // 解析日程
    parseItineraryDays(text) {
      const days = [];
      
      // 使用正则表达式匹配"第X天"或"Day X"格式
      const dayPattern = /第(\d+)天[：:](.*?)(?=第\d+天|$)/gs;
      const dayPattern2 = /Day\s*(\d+)[：:](.*?)(?=Day\s*\d+|$)/gis;
      
      let matches = [...text.matchAll(dayPattern)];
      
      if (matches.length === 0) {
        matches = [...text.matchAll(dayPattern2)];
      }
  
      matches.forEach((match, index) => {
        const dayNumber = parseInt(match[1]);
        const content = match[2].trim();
        
        days.push({
          day: dayNumber,
          title: `第${dayNumber}天`,
          content: content,
          activities: this.parseActivities(content)
        });
      });
  
      // 如果没有找到日程格式，按行分割
      if (days.length === 0) {
        const lines = text.split('\n').filter(line => line.trim());
        lines.forEach((line, index) => {
          if (line.trim()) {
            days.push({
              day: index + 1,
              title: `第${index + 1}天`,
              content: line.trim(),
              activities: []
            });
          }
        });
      }
  
      return days;
    }
  
    // 解析活动
    parseActivities(content) {
      // 简单的活动解析，寻找时间格式
      const timePattern = /(\d{1,2}:\d{2})\s*[：:-]\s*([^；;。.\n]+)/g;
      const activities = [];
      
      let match;
      while ((match = timePattern.exec(content)) !== null) {
        activities.push({
          time: match[1],
          activity: match[2].trim()
        });
      }
  
      return activities;
    }
  
    // 提取规划标题
    extractPlanTitle(initialPlan) {
      if (!initialPlan) return '旅行规划';
      
      // 尝试提取第一句话作为标题
      const firstSentence = initialPlan.split(/[。！？.!?]/)[0];
      
      if (firstSentence.length > 50) {
        return '精彩旅行规划';
      }
      
      return firstSentence || '旅行规划';
    }
  
    // 计算总天数
    calculateTotalDays(rawData) {
      try {
        // 从行程文本中提取天数
        const finalPlan = rawData.final_plan || '';
        const dayMatches = finalPlan.match(/第(\d+)天/g);
        
        if (dayMatches) {
          const maxDay = Math.max(...dayMatches.map(match => 
            parseInt(match.match(/\d+/)[0])
          ));
          return maxDay;
        }
        
        return 1;
      } catch (error) {
        return 1;
      }
    }
  
    // 提取费用信息
    extractCost(text) {
      if (!text) return '待确定';
      
      // 查找金额模式
      const costPatterns = [
        /(\d+(?:,\d{3})*)\s*元/,
        /￥(\d+(?:,\d{3})*)/,
        /(\d+(?:,\d{3})*)\s*RMB/i
      ];
      
      for (const pattern of costPatterns) {
        const match = text.match(pattern);
        if (match) {
          return `￥${match[1]}`;
        }
      }
      
      return '待确定';
    }
  
    // 提取推荐信息
    extractRecommendations(text) {
      const recommendations = [];
      
      // 简单的推荐提取逻辑
      const lines = text.split('\n');
      
      lines.forEach(line => {
        if (line.includes('推荐') || line.includes('建议')) {
          recommendations.push({
            type: 'general',
            content: line.trim()
          });
        }
      });
      
      return recommendations;
    }
  
    // 格式化日期
    formatDate(dateString) {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
      } catch (error) {
        return dateString;
      }
    }
  
    // 验证数据完整性
    validatePlanData(data) {
      const errors = [];
      
      if (!data.initial_plan) {
        errors.push('缺少初始规划');
      }
      
      if (!data.final_plan) {
        errors.push('缺少详细行程');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  }
  
  module.exports = new DataProcessor();