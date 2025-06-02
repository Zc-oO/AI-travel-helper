require('dotenv').config();

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // AI服务配置
  aiService: {
    baseURL: process.env.AI_SERVICE_URL,
    apiKey: process.env.AI_SERVICE_API_KEY
  },

  // 数据库配置
  database: {
    url: process.env.DATABASE_URL
  },

  // 安全配置
  security: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'app.log'
  }
}; 