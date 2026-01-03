import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
// 使用混合词典服务（数据库词库 + 免费在线API）
import { lookupWord, getWordsByTag, getAvailableTags } from '../services/dictionary';
import { LearningRecord, UserWordbook } from '../models';

const router = Router();

// 搜索单词（有道 API）
router.get('/search', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word } = req.query;

    if (!word || typeof word !== 'string') {
      res.status(400).json({ code: 400, message: '请输入要查询的单词' });
      return;
    }

    const wordInfo = await lookupWord(word.trim());

    if (!wordInfo) {
      res.status(404).json({ code: 404, message: '未找到该单词' });
      return;
    }

    res.json({
      code: 200,
      data: wordInfo,
    });
  } catch (error) {
    console.error('Word search error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 添加单词到用户词库
router.post('/add', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word, wordbookId } = req.body;

    if (!word) {
      res.status(400).json({ code: 400, message: '请输入单词' });
      return;
    }

    // 查找或创建用户词库
    let userWordbook = await UserWordbook.findOne({
      userId: req.userId,
      wordbookId: wordbookId || null,
    });

    if (!userWordbook) {
      userWordbook = await UserWordbook.create({
        userId: req.userId,
        wordbookId: wordbookId || null,
        customName: '我的单词本',
        words: [],
      });
    }

    // 检查单词是否已存在
    const wordExists = userWordbook.words.some((w) => w.word.toLowerCase() === word.toLowerCase());
    if (wordExists) {
      res.status(400).json({ code: 400, message: '该单词已在词库中' });
      return;
    }

    // 添加单词
    userWordbook.words.push({
      word: word.toLowerCase(),
      addedAt: new Date(),
      source: 'search',
    });

    await userWordbook.save();

    res.json({
      code: 200,
      message: '添加成功',
      data: { word: word.toLowerCase() },
    });
  } catch (error) {
    console.error('Add word error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取用户词库列表
router.get('/list', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wordbooks = await UserWordbook.find({ userId: req.userId }).populate('wordbookId');

    res.json({
      code: 200,
      data: wordbooks,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取学习进度
router.get('/progress', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await LearningRecord.find({ userId: req.userId });

    const stats = {
      total: records.length,
      known: records.filter((r) => r.status === 'known').length,
      learning: records.filter((r) => r.status === 'learning').length,
      unknown: records.filter((r) => r.status === 'unknown').length,
    };

    res.json({
      code: 200,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新学习记录
router.post('/record', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word, status } = req.body;

    if (!word || !status) {
      res.status(400).json({ code: 400, message: '参数错误' });
      return;
    }

    // 艾宾浩斯遗忘曲线间隔（分钟）
    const intervals = [5, 30, 12 * 60, 24 * 60, 2 * 24 * 60, 4 * 24 * 60, 7 * 24 * 60, 15 * 24 * 60];

    let record = await LearningRecord.findOne({ userId: req.userId, word: word.toLowerCase() });

    if (!record) {
      record = new LearningRecord({
        userId: req.userId,
        word: word.toLowerCase(),
        status,
        reviewCount: 1,
        correctCount: status === 'known' ? 1 : 0,
        lastReviewAt: new Date(),
        nextReviewAt: new Date(Date.now() + intervals[0] * 60 * 1000),
      });
    } else {
      record.reviewCount += 1;
      record.status = status;
      record.lastReviewAt = new Date();

      if (status === 'known') {
        record.correctCount += 1;
        // 根据正确次数计算下次复习时间
        const intervalIndex = Math.min(record.correctCount, intervals.length - 1);
        record.nextReviewAt = new Date(Date.now() + intervals[intervalIndex] * 60 * 1000);
      } else {
        // 答错了，重置间隔
        record.nextReviewAt = new Date(Date.now() + intervals[0] * 60 * 1000);
      }
    }

    await record.save();

    res.json({
      code: 200,
      message: '记录已更新',
      data: record,
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取待复习单词
router.get('/review', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 20 } = req.query;

    const records = await LearningRecord.find({
      userId: req.userId,
      nextReviewAt: { $lte: new Date() },
    })
      .sort({ nextReviewAt: 1 })
      .limit(Number(limit));

    // 获取单词详情
    const words = await Promise.all(
      records.map(async (record) => {
        const wordInfo = await lookupWord(record.word);
        return {
          ...record.toObject(),
          wordInfo,
        };
      })
    );

    res.json({
      code: 200,
      data: words,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 根据标签获取单词列表（如 CET4, CET6, IELTS, TOEFL）
router.get('/by-tag/:tag', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tag } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const result = await getWordsByTag(tag, Number(page), Number(limit));

    res.json({
      code: 200,
      data: result,
    });
  } catch (error) {
    console.error('Get words by tag error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取所有可用的标签及其单词数量
router.get('/tags', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tags = await getAvailableTags();

    res.json({
      code: 200,
      data: tags,
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
