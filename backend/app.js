const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
  origin: ['http://localhost', 'https://servicewechat.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 中间件
const validationMiddleware = require('./middleware/validation');

// 全局中间件
app.use(validationMiddleware.sanitizeInput);

// 路由
const planRoutes = require('./routes/plan');
const assistantRoutes = require('./routes/assistant');
const formRoutes = require('./routes/form');

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
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
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