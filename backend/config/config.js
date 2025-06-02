module.exports = {
    // 服务器配置
    PORT: process.env.PORT || 3000,
    
    // 大模型API配置
    MODEL_API_URL: process.env.MODEL_API_URL || 'http://localhost:5000',
    MODEL_API_TIMEOUT: 30000,
    
    // 跨域配置
    CORS_ORIGINS: [
      'http://localhost',
      'https://servicewechat.com',
      'https://developers.weixin.qq.com'
    ],
    
    // 缓存配置
    CACHE_TTL: 30 * 60 * 1000, // 30分钟
    
    // 限流配置
    RATE_LIMIT: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 每个IP最多100次请求
    },
    
    // 环境配置
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // 日志配置
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
  };