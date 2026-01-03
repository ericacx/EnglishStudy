import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import config from './config';
import authRoutes from './routes/auth';
import wordRoutes from './routes/word';
import wordbookRoutes from './routes/wordbook';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/word', wordRoutes);
app.use('/api/wordbook', wordbookRoutes);

// 健康检查
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 连接数据库并启动服务器
async function start() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ MongoDB connected');

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
