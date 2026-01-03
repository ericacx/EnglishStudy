import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { Wordbook, UserWordbook } from '../models';

const router = Router();

// 获取预设词库列表
router.get('/preset', async (_, res: Response): Promise<void> => {
  try {
    const wordbooks = await Wordbook.find({ isPreset: true }).select('-words');

    res.json({
      code: 200,
      data: wordbooks,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取词库详情（含单词列表）
router.get('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const wordbook = await Wordbook.findById(id);

    if (!wordbook) {
      res.status(404).json({ code: 404, message: '词库不存在' });
      return;
    }

    // 分页返回单词
    const skip = (Number(page) - 1) * Number(limit);
    const words = wordbook.words.slice(skip, skip + Number(limit));

    res.json({
      code: 200,
      data: {
        ...wordbook.toObject(),
        words,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: wordbook.words.length,
          totalPages: Math.ceil(wordbook.words.length / Number(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 用户订阅预设词库
router.post('/subscribe/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 检查词库是否存在
    const wordbook = await Wordbook.findById(id);
    if (!wordbook) {
      res.status(404).json({ code: 404, message: '词库不存在' });
      return;
    }

    // 检查是否已订阅
    const existing = await UserWordbook.findOne({
      userId: req.userId,
      wordbookId: id,
    });

    if (existing) {
      res.status(400).json({ code: 400, message: '已订阅该词库' });
      return;
    }

    // 创建用户词库关联
    const userWordbook = await UserWordbook.create({
      userId: req.userId,
      wordbookId: id,
      customName: wordbook.name,
      words: wordbook.words.map((word) => ({
        word,
        addedAt: new Date(),
        source: 'preset' as const,
      })),
    });

    res.json({
      code: 200,
      message: '订阅成功',
      data: userWordbook,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 取消订阅词库
router.delete('/subscribe/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await UserWordbook.findOneAndDelete({
      userId: req.userId,
      wordbookId: id,
    });

    res.json({
      code: 200,
      message: '已取消订阅',
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取用户已订阅的词库
router.get('/user/subscribed', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userWordbooks = await UserWordbook.find({ userId: req.userId }).populate('wordbookId');

    res.json({
      code: 200,
      data: userWordbooks,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
