// 同行类型选项
const COMPANION_TYPES = {
    SOLO: {
      key: 'solo',
      label: '只有我😊',
      description: '只属于我的独自旅行',
      emoji: '🧳'
    },
    COUPLE: {
      key: 'couple',
      label: '与情侣一起💕',
      description: '尽可能平衡地调整预算',
      emoji: '💑'
    },
    FAMILY: {
      key: 'family',
      label: '与家人一起',
      description: '高品质体验的旅行费用',
      emoji: '👨‍👩‍👧‍👦'
    },
    FRIENDS: {
      key: 'friends',
      label: '与朋友们一起',
      description: '高品质体验的旅行费用',
      emoji: '👫'
    },
    BUSINESS: {
      key: 'business',
      label: '商务旅行💼',
      description: '自行安排，没有预算要求',
      emoji: '💼'
    }
  };
  
  // 兴趣标签
  const INTEREST_TAGS = {
    ADVENTURE: { key: 'adventure', label: '探险', color: '#FF6B6B' },
    CAMPING: { key: 'camping', label: '露营', color: '#4ECDC4' },
    BEACH: { key: 'beach', label: '海滩', color: '#45B7D1' },
    NATURE: { key: 'nature', label: '大自然之旅', color: '#96CEB4' },
    RELAX: { key: 'relax', label: '放松身心', color: '#FFEAA7', selected: true },
    ROAD_TRIP: { key: 'road_trip', label: '公路旅行', color: '#FF7675', selected: true },
    CULTURE: { key: 'culture', label: '文化探索', color: '#A29BFE' },
    FOOD: { key: 'food', label: '美食之旅', color: '#FD79A8', selected: true },
    BACKPACK: { key: 'backpack', label: '背包旅行', color: '#E17055', selected: true },
    VACATION: { key: 'vacation', label: '度假游', color: '#00B894' },
    SPORTS: { key: 'sports', label: '清雪运动', color: '#0984E3' },
    WILDLIFE: { key: 'wildlife', label: '野生动物探险之旅', color: '#6C5CE7' },
    HISTORY: { key: 'history', label: '历史文化之旅', color: '#A0522D', selected: true },
    ECO: { key: 'eco', label: '生态旅游', color: '#00B894' }
  };
  
  // 预算档次
  const BUDGET_RANGES = {
    BUDGET: {
      key: 'budget',
      label: '便宜',
      description: '总花费约4000-5000元/人',
      subtitle: '经济实惠且节约开支',
      range: [4000, 5000],
      color: '#FF6B6B'
    },
    BALANCED: {
      key: 'balanced',
      label: '平衡',
      description: '总花费约5000-8000元/人',
      subtitle: '尽可能平衡地调整预算',
      range: [5000, 8000],
      color: '#4ECDC4'
    },
    LUXURY: {
      key: 'luxury',
      label: '豪华',
      description: '总花费约8000-15000元/人',
      subtitle: '高品质体验的旅行费用',
      range: [8000, 15000],
      color: '#45B7D1'
    },
    FLEXIBLE: {
      key: 'flexible',
      label: '灵活',
      description: '您可以输入预期开销范围',
      subtitle: '',
      range: [0, 999999],
      color: '#96CEB4'
    }
  };
  
  // 热门目的地
  const POPULAR_DESTINATIONS = [
    { name: '北京', type: 'domestic', region: '华北', tags: ['历史', '文化', '古迹'] },
    { name: '上海', type: 'domestic', region: '华东', tags: ['现代', '购物', '美食'] },
    { name: '杭州', type: 'domestic', region: '华东', tags: ['自然', '湖泊', '历史'] },
    { name: '成都', type: 'domestic', region: '西南', tags: ['美食', '文化', '熊猫'] },
    { name: '重庆', type: 'domestic', region: '西南', tags: ['火锅', '夜景', '山城'] },
    { name: '西安', type: 'domestic', region: '西北', tags: ['历史', '古都', '文化'] },
    { name: '昆明', type: 'domestic', region: '西南', tags: ['春城', '自然', '民族'] },
    { name: '大理', type: 'domestic', region: '西南', tags: ['古城', '洱海', '风花雪月'] },
    { name: '丽江', type: 'domestic', region: '西南', tags: ['古镇', '雪山', '民族文化'] },
    { name: '三亚', type: 'domestic', region: '华南', tags: ['海滩', '度假', '热带'] },
    { name: '厦门', type: 'domestic', region: '华东', tags: ['海岛', '文艺', '海鲜'] },
    { name: '青岛', type: 'domestic', region: '华东', tags: ['海滨', '啤酒', '欧式建筑'] },
    // 国际目的地
    { name: '东京', type: 'international', region: '亚洲', tags: ['现代', '文化', '美食'] },
    { name: '首尔', type: 'international', region: '亚洲', tags: ['时尚', '美妆', 'K-pop'] },
    { name: '曼谷', type: 'international', region: '亚洲', tags: ['寺庙', '美食', '购物'] },
    { name: '新加坡', type: 'international', region: '亚洲', tags: ['现代', '多元文化', '美食'] },
    { name: '巴黎', type: 'international', region: '欧洲', tags: ['浪漫', '艺术', '时尚'] },
    { name: '伦敦', type: 'international', region: '欧洲', tags: ['历史', '文化', '博物馆'] }
  ];
  
  // API 响应状态码
  const RESPONSE_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  };
  
  // 错误消息
  const ERROR_MESSAGES = {
    MISSING_REQUIRED_FIELDS: '缺少必填字段',
    INVALID_DATE_FORMAT: '日期格式不正确',
    INVALID_BUDGET_RANGE: '预算范围不合理',
    MODEL_SERVICE_ERROR: '大模型服务调用失败',
    DATA_PROCESSING_ERROR: '数据处理失败',
    NETWORK_ERROR: '网络连接失败'
  };
  
  // 成功消息
  const SUCCESS_MESSAGES = {
    PLAN_GENERATED: '旅行规划生成成功',
    RECOMMENDATION_FETCHED: '推荐获取成功',
    CHAT_SUCCESS: '对话成功',
    DATA_SAVED: '数据保存成功'
  };
  
  module.exports = {
    COMPANION_TYPES,
    INTEREST_TAGS,
    BUDGET_RANGES,
    POPULAR_DESTINATIONS,
    RESPONSE_CODES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
  };