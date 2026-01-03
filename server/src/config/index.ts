import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/english_study',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  youdao: {
    appKey: process.env.YOUDAO_APP_KEY || '',
    appSecret: process.env.YOUDAO_APP_SECRET || '',
    apiUrl: 'https://openapi.youdao.com/api',
  },
};
