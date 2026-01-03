#!/bin/bash
# EnglishStudy 一键部署脚本
set -e

echo "🚀 开始部署 EnglishStudy 服务..."

# 创建目录
cd /opt && rm -rf english-study && mkdir -p english-study && cd english-study
mkdir -p src/models src/routes src/services src/middleware src/config src/scripts

# ========== 配置文件 ==========
cat > package.json << 'PKGEOF'
{
  "name": "english-study-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node src/scripts/seed-wordbooks.ts"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.10.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^3.0.0",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^25.0.3",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3"
  }
}
PKGEOF

cat > tsconfig.json << 'TSEOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
TSEOF

cat > .env << 'ENVEOF'
PORT=23740
MONGODB_URI=mongodb://localhost:27017/english-study
JWT_SECRET=english-study-jwt-secret-key-2024
ENVEOF

# ========== src/config/index.ts ==========
cat > src/config/index.ts << 'EOF'
import dotenv from 'dotenv';
dotenv.config();
export default {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/english_study',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
EOF

# ========== src/middleware/auth.ts ==========
cat > src/middleware/auth.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '../models';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) { res.status(401).json({ code: 401, message: '请先登录' }); return; }
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) { res.status(401).json({ code: 401, message: '用户不存在' }); return; }
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, message: 'Token 无效或已过期' });
  }
};
EOF

# ========== src/models/index.ts ==========
cat > src/models/index.ts << 'EOF'
export { default as User } from './User';
export { default as Wordbook } from './Wordbook';
export { default as UserWordbook } from './UserWordbook';
export { default as LearningRecord } from './LearningRecord';
export { default as WordCache } from './WordCache';
export { default as WordDetail } from './WordDetail';
EOF

# ========== src/models/User.ts ==========
cat > src/models/User.ts << 'EOF'
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string; password: string; nickname: string; avatar?: string;
  createdAt: Date; updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  nickname: { type: String, required: true, trim: true },
  avatar: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
EOF

# ========== src/models/Wordbook.ts ==========
cat > src/models/Wordbook.ts << 'EOF'
import mongoose, { Document, Schema } from 'mongoose';

export interface IWordbook extends Document {
  name: string; description: string;
  category: 'CET4' | 'CET6' | 'IELTS' | 'TOEFL' | 'GRE' | 'CUSTOM';
  wordCount: number; words: string[]; isPreset: boolean; createdAt: Date;
}

const wordbookSchema = new Schema<IWordbook>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['CET4', 'CET6', 'IELTS', 'TOEFL', 'GRE', 'CUSTOM'], required: true },
  wordCount: { type: Number, default: 0 },
  words: { type: [String], default: [] },
  isPreset: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IWordbook>('Wordbook', wordbookSchema);
EOF

# ========== src/models/UserWordbook.ts ==========
cat > src/models/UserWordbook.ts << 'EOF'
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserWord { word: string; addedAt: Date; source: 'preset' | 'search'; }
export interface IUserWordbook extends Document {
  userId: mongoose.Types.ObjectId; wordbookId?: mongoose.Types.ObjectId;
  customName: string; words: IUserWord[]; createdAt: Date; updatedAt: Date;
}

const userWordSchema = new Schema<IUserWord>({
  word: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
  source: { type: String, enum: ['preset', 'search'], default: 'search' },
}, { _id: false });

const userWordbookSchema = new Schema<IUserWordbook>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wordbookId: { type: Schema.Types.ObjectId, ref: 'Wordbook' },
  customName: { type: String, default: '我的单词本' },
  words: { type: [userWordSchema], default: [] },
}, { timestamps: true });

userWordbookSchema.index({ userId: 1, wordbookId: 1 });
export default mongoose.model<IUserWordbook>('UserWordbook', userWordbookSchema);
EOF

# ========== src/models/LearningRecord.ts ==========
cat > src/models/LearningRecord.ts << 'EOF'
import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningRecord extends Document {
  userId: mongoose.Types.ObjectId; word: string;
  status: 'known' | 'unknown' | 'learning';
  reviewCount: number; correctCount: number;
  lastReviewAt: Date; nextReviewAt: Date; createdAt: Date; updatedAt: Date;
}

const learningRecordSchema = new Schema<ILearningRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  word: { type: String, required: true },
  status: { type: String, enum: ['known', 'unknown', 'learning'], default: 'unknown' },
  reviewCount: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  lastReviewAt: { type: Date, default: Date.now },
  nextReviewAt: { type: Date, default: Date.now },
}, { timestamps: true });

learningRecordSchema.index({ userId: 1, word: 1 }, { unique: true });
learningRecordSchema.index({ userId: 1, nextReviewAt: 1 });
export default mongoose.model<ILearningRecord>('LearningRecord', learningRecordSchema);
EOF

# ========== src/models/WordCache.ts ==========
cat > src/models/WordCache.ts << 'EOF'
import mongoose, { Document, Schema } from 'mongoose';

export interface IWordCache extends Document {
  word: string;
  phonetic: { us: string; uk: string; };
  audioUrl: { us: string; uk: string; };
  definitions: string[]; examples: string[]; cachedAt: Date;
}

const wordCacheSchema = new Schema<IWordCache>({
  word: { type: String, required: true, unique: true, lowercase: true },
  phonetic: { us: { type: String, default: '' }, uk: { type: String, default: '' } },
  audioUrl: { us: { type: String, default: '' }, uk: { type: String, default: '' } },
  definitions: { type: [String], default: [] },
  examples: { type: [String], default: [] },
  cachedAt: { type: Date, default: Date.now },
}, { timestamps: true });

wordCacheSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 604800 });
export default mongoose.model<IWordCache>('WordCache', wordCacheSchema);
EOF

# ========== src/models/WordDetail.ts ==========
cat > src/models/WordDetail.ts << 'EOF'
import mongoose, { Document, Schema } from 'mongoose';

export interface IWordDetail extends Document {
  word: string;
  phonetic: { us: string; uk: string; };
  audioUrl: { us: string; uk: string; };
  definitions: string[]; translation: string; pos: string;
  examples: string[]; tags: string[];
  difficulty: number; frequency: number;
  createdAt: Date; updatedAt: Date;
}

const wordDetailSchema = new Schema<IWordDetail>({
  word: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phonetic: { us: { type: String, default: '' }, uk: { type: String, default: '' } },
  audioUrl: { us: { type: String, default: '' }, uk: { type: String, default: '' } },
  definitions: { type: [String], default: [] },
  translation: { type: String, default: '' },
  pos: { type: String, default: '' },
  examples: { type: [String], default: [] },
  tags: { type: [String], default: [], index: true },
  difficulty: { type: Number, default: 1, min: 1, max: 5 },
  frequency: { type: Number, default: 0 },
}, { timestamps: true });

wordDetailSchema.index({ tags: 1 });
wordDetailSchema.index({ difficulty: 1 });
export default mongoose.model<IWordDetail>('WordDetail', wordDetailSchema);
EOF

# ========== src/services/dictionary.ts ==========
cat > src/services/dictionary.ts << 'EOF'
import axios from 'axios';
import { WordCache, WordDetail } from '../models';

interface FreeDictResponse {
  word: string;
  phonetics: Array<{ text?: string; audio?: string; }>;
  meanings: Array<{ partOfSpeech: string; definitions: Array<{ definition: string; example?: string; }>; }>;
}

export interface WordInfo {
  word: string;
  phonetic: { us: string; uk: string; };
  audioUrl: { us: string; uk: string; };
  definitions: string[];
  translation?: string;
  examples: string[];
}

export async function lookupWord(word: string): Promise<WordInfo | null> {
  const normalizedWord = word.toLowerCase().trim();

  const dbWord = await WordDetail.findOne({ word: normalizedWord });
  if (dbWord) {
    console.log(`[DB] Found: ${normalizedWord}`);
    return { word: dbWord.word, phonetic: dbWord.phonetic, audioUrl: dbWord.audioUrl, definitions: dbWord.definitions, translation: dbWord.translation, examples: dbWord.examples };
  }

  const cached = await WordCache.findOne({ word: normalizedWord });
  if (cached) {
    console.log(`[Cache] Found: ${normalizedWord}`);
    return { word: cached.word, phonetic: cached.phonetic, audioUrl: cached.audioUrl, definitions: cached.definitions, examples: cached.examples };
  }

  try {
    console.log(`[API] Fetching: ${normalizedWord}`);
    const response = await axios.get<FreeDictResponse[]>(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalizedWord)}`, { timeout: 5000 });
    const data = response.data[0];
    if (!data) return null;

    const phonetics = data.phonetics || [];
    const usPhonetic = phonetics.find((p) => p.audio?.includes('us'))?.text || phonetics[0]?.text || '';
    const ukPhonetic = phonetics.find((p) => p.audio?.includes('uk'))?.text || phonetics[0]?.text || '';
    const usAudio = phonetics.find((p) => p.audio?.includes('us'))?.audio || '';
    const ukAudio = phonetics.find((p) => p.audio?.includes('uk'))?.audio || phonetics.find((p) => p.audio)?.audio || '';

    const definitions: string[] = [];
    const examples: string[] = [];
    data.meanings.forEach((meaning) => {
      const pos = meaning.partOfSpeech;
      meaning.definitions.slice(0, 2).forEach((def) => {
        definitions.push(`${pos}. ${def.definition}`);
        if (def.example) examples.push(def.example);
      });
    });

    const wordInfo: WordInfo = { word: normalizedWord, phonetic: { us: usPhonetic, uk: ukPhonetic }, audioUrl: { us: usAudio, uk: ukAudio }, definitions: definitions.slice(0, 5), examples: examples.slice(0, 3) };
    await WordCache.create({ ...wordInfo, cachedAt: new Date() });
    return wordInfo;
  } catch (error: any) {
    if (error.response?.status === 404) { console.log(`[API] Not found: ${normalizedWord}`); return null; }
    console.error('Dictionary API error:', error.message);
    return null;
  }
}

export async function getWordsByTag(tag: string, page: number = 1, limit: number = 20): Promise<{ words: WordInfo[]; total: number; page: number; totalPages: number }> {
  const skip = (page - 1) * limit;
  const [words, total] = await Promise.all([
    WordDetail.find({ tags: tag }).skip(skip).limit(limit).sort({ frequency: -1, word: 1 }),
    WordDetail.countDocuments({ tags: tag }),
  ]);
  return {
    words: words.map((w) => ({ word: w.word, phonetic: w.phonetic, audioUrl: w.audioUrl, definitions: w.definitions, translation: w.translation, examples: w.examples })),
    total, page, totalPages: Math.ceil(total / limit),
  };
}

export async function getAvailableTags(): Promise<{ tag: string; count: number }[]> {
  const result = await WordDetail.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { tag: '$_id', count: 1, _id: 0 } },
  ]);
  return result;
}
EOF

# ========== src/routes/auth.ts ==========
cat > src/routes/auth.ts << 'EOF'
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import config from '../config';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname) { res.status(400).json({ code: 400, message: '请填写完整信息' }); return; }
    const existingUser = await User.findOne({ email });
    if (existingUser) { res.status(400).json({ code: 400, message: '该邮箱已注册' }); return; }
    const user = await User.create({ email, password, nickname });
    const token = jwt.sign({ userId: user._id }, config.jwt.secret, { expiresIn: '7d' });
    res.status(201).json({ code: 200, message: '注册成功', data: { token, user: { id: user._id, email: user.email, nickname: user.nickname } } });
  } catch (error) { console.error('Register error:', error); res.status(500).json({ code: 500, message: '服务器错误' }); }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ code: 400, message: '请输入邮箱和密码' }); return; }
    const user = await User.findOne({ email });
    if (!user) { res.status(401).json({ code: 401, message: '邮箱或密码错误' }); return; }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) { res.status(401).json({ code: 401, message: '邮箱或密码错误' }); return; }
    const token = jwt.sign({ userId: user._id }, config.jwt.secret, { expiresIn: '7d' });
    res.json({ code: 200, message: '登录成功', data: { token, user: { id: user._id, email: user.email, nickname: user.nickname } } });
  } catch (error) { console.error('Login error:', error); res.status(500).json({ code: 500, message: '服务器错误' }); }
});

router.get('/profile', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ code: 200, data: { id: req.user._id, email: req.user.email, nickname: req.user.nickname, avatar: req.user.avatar } });
});

router.put('/profile', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { nickname, avatar } = req.body;
  const updates: any = {};
  if (nickname) updates.nickname = nickname;
  if (avatar) updates.avatar = avatar;
  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
  res.json({ code: 200, message: '更新成功', data: user });
});

export default router;
EOF

# ========== src/routes/word.ts ==========
cat > src/routes/word.ts << 'EOF'
import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { lookupWord, getWordsByTag, getAvailableTags } from '../services/dictionary';
import { LearningRecord, UserWordbook } from '../models';

const router = Router();

router.get('/search', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word } = req.query;
    if (!word || typeof word !== 'string') { res.status(400).json({ code: 400, message: '请输入要查询的单词' }); return; }
    const wordInfo = await lookupWord(word.trim());
    if (!wordInfo) { res.status(404).json({ code: 404, message: '未找到该单词' }); return; }
    res.json({ code: 200, data: wordInfo });
  } catch (error) { console.error('Word search error:', error); res.status(500).json({ code: 500, message: '服务器错误' }); }
});

router.post('/add', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word, wordbookId } = req.body;
    if (!word) { res.status(400).json({ code: 400, message: '请输入单词' }); return; }
    let userWordbook = await UserWordbook.findOne({ userId: req.userId, wordbookId: wordbookId || null });
    if (!userWordbook) { userWordbook = await UserWordbook.create({ userId: req.userId, wordbookId: wordbookId || null, customName: '我的单词本', words: [] }); }
    const wordExists = userWordbook.words.some((w) => w.word.toLowerCase() === word.toLowerCase());
    if (wordExists) { res.status(400).json({ code: 400, message: '该单词已在词库中' }); return; }
    userWordbook.words.push({ word: word.toLowerCase(), addedAt: new Date(), source: 'search' });
    await userWordbook.save();
    res.json({ code: 200, message: '添加成功', data: { word: word.toLowerCase() } });
  } catch (error) { console.error('Add word error:', error); res.status(500).json({ code: 500, message: '服务器错误' }); }
});

router.get('/list', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const wordbooks = await UserWordbook.find({ userId: req.userId }).populate('wordbookId');
  res.json({ code: 200, data: wordbooks });
});

router.get('/progress', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const records = await LearningRecord.find({ userId: req.userId });
  const stats = { total: records.length, known: records.filter((r) => r.status === 'known').length, learning: records.filter((r) => r.status === 'learning').length, unknown: records.filter((r) => r.status === 'unknown').length };
  res.json({ code: 200, data: stats });
});

router.post('/record', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word, status } = req.body;
    if (!word || !status) { res.status(400).json({ code: 400, message: '参数错误' }); return; }
    const intervals = [5, 30, 12 * 60, 24 * 60, 2 * 24 * 60, 4 * 24 * 60, 7 * 24 * 60, 15 * 24 * 60];
    let record = await LearningRecord.findOne({ userId: req.userId, word: word.toLowerCase() });
    if (!record) {
      record = new LearningRecord({ userId: req.userId, word: word.toLowerCase(), status, reviewCount: 1, correctCount: status === 'known' ? 1 : 0, lastReviewAt: new Date(), nextReviewAt: new Date(Date.now() + intervals[0] * 60 * 1000) });
    } else {
      record.reviewCount += 1; record.status = status; record.lastReviewAt = new Date();
      if (status === 'known') { record.correctCount += 1; const intervalIndex = Math.min(record.correctCount, intervals.length - 1); record.nextReviewAt = new Date(Date.now() + intervals[intervalIndex] * 60 * 1000); }
      else { record.nextReviewAt = new Date(Date.now() + intervals[0] * 60 * 1000); }
    }
    await record.save();
    res.json({ code: 200, message: '记录已更新', data: record });
  } catch (error) { console.error('Update record error:', error); res.status(500).json({ code: 500, message: '服务器错误' }); }
});

router.get('/review', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { limit = 20 } = req.query;
  const records = await LearningRecord.find({ userId: req.userId, nextReviewAt: { $lte: new Date() } }).sort({ nextReviewAt: 1 }).limit(Number(limit));
  const words = await Promise.all(records.map(async (record) => { const wordInfo = await lookupWord(record.word); return { ...record.toObject(), wordInfo }; }));
  res.json({ code: 200, data: words });
});

router.get('/by-tag/:tag', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { tag } = req.params; const { page = '1', limit = '20' } = req.query;
  const result = await getWordsByTag(tag, Number(page), Number(limit));
  res.json({ code: 200, data: result });
});

router.get('/tags', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const tags = await getAvailableTags();
  res.json({ code: 200, data: tags });
});

export default router;
EOF

# ========== src/routes/wordbook.ts ==========
cat > src/routes/wordbook.ts << 'EOF'
import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { Wordbook, UserWordbook } from '../models';

const router = Router();

router.get('/preset', async (_, res: Response): Promise<void> => {
  const wordbooks = await Wordbook.find({ isPreset: true }).select('-words');
  res.json({ code: 200, data: wordbooks });
});

router.get('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params; const { page = 1, limit = 50 } = req.query;
  const wordbook = await Wordbook.findById(id);
  if (!wordbook) { res.status(404).json({ code: 404, message: '词库不存在' }); return; }
  const skip = (Number(page) - 1) * Number(limit);
  const words = wordbook.words.slice(skip, skip + Number(limit));
  res.json({ code: 200, data: { ...wordbook.toObject(), words, pagination: { page: Number(page), limit: Number(limit), total: wordbook.words.length, totalPages: Math.ceil(wordbook.words.length / Number(limit)) } } });
});

router.post('/subscribe/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const wordbook = await Wordbook.findById(id);
  if (!wordbook) { res.status(404).json({ code: 404, message: '词库不存在' }); return; }
  const existing = await UserWordbook.findOne({ userId: req.userId, wordbookId: id });
  if (existing) { res.status(400).json({ code: 400, message: '已订阅该词库' }); return; }
  const userWordbook = await UserWordbook.create({ userId: req.userId, wordbookId: id, customName: wordbook.name, words: wordbook.words.map((word) => ({ word, addedAt: new Date(), source: 'preset' as const })) });
  res.json({ code: 200, message: '订阅成功', data: userWordbook });
});

router.delete('/subscribe/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  await UserWordbook.findOneAndDelete({ userId: req.userId, wordbookId: req.params.id });
  res.json({ code: 200, message: '已取消订阅' });
});

router.get('/user/subscribed', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userWordbooks = await UserWordbook.find({ userId: req.userId }).populate('wordbookId');
  res.json({ code: 200, data: userWordbooks });
});

export default router;
EOF

# ========== src/index.ts ==========
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import config from './config';
import authRoutes from './routes/auth';
import wordRoutes from './routes/word';
import wordbookRoutes from './routes/wordbook';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/word', wordRoutes);
app.use('/api/wordbook', wordbookRoutes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
EOF

echo "📦 安装依赖..."
npm install

echo "🔨 编译 TypeScript..."
npm run build

echo "🚀 安装 PM2 并启动服务..."
npm install -g pm2
pm2 delete english-study 2>/dev/null || true
pm2 start dist/index.js --name english-study
pm2 save
pm2 startup

echo ""
echo "✅ =================================="
echo "✅ 部署完成!"
echo "✅ 服务地址: http://139.59.97.154:23740"
echo "✅ 健康检查: http://139.59.97.154:23740/api/health"
echo "✅ =================================="
