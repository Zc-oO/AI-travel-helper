const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 请求频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});

// 中间件配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://servicewechat.com'] 
    : ['http://localhost:5000', 'http://localhost:3000', 'http://localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);

// 中间件
const validationMiddleware = require('./src/middleware/validation');

// 全局中间件
app.use(validationMiddleware.sanitizeInput);

// 路由
const planRoutes = require('./src/routes/plan');
const assistantRoutes = require('./src/routes/assistant');
const formRoutes = require('./src/routes/form');

// 添加对 /plan_trip 的直接支持
app.post('/plan_trip', (req, res) => {
  req.url = '/api/plan/generate';
  app.handle(req, res);
});

app.use('/api/plan', planRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/form', formRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '旅居小程序后端服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  // 根据错误类型返回不同的状态码
  const statusCode = err.statusCode || 500;
  const errorMessage = process.env.NODE_ENV === 'development' 
    ? err.message 
    : '请稍后重试';

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 旅居小程序后端服务启动成功!`);
  console.log(`🌐 服务地址: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
});

module.exports = app;