import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import config from '../config';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// 注册
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nickname } = req.body;

    // 验证
    if (!email || !password || !nickname) {
      res.status(400).json({ code: 400, message: '请填写完整信息' });
      return;
    }

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ code: 400, message: '该邮箱已注册' });
      return;
    }

    // 创建用户
    const user = await User.create({ email, password, nickname });

    // 生成 token
    const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.status(201).json({
      code: 200,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          nickname: user.nickname,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 登录
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ code: 400, message: '请输入邮箱和密码' });
      return;
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ code: 401, message: '邮箱或密码错误' });
      return;
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ code: 401, message: '邮箱或密码错误' });
      return;
    }

    // 生成 token
    const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          nickname: user.nickname,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取用户信息
router.get('/profile', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      code: 200,
      data: {
        id: req.user._id,
        email: req.user.email,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新用户信息
router.put('/profile', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nickname, avatar } = req.body;
    const updates: any = {};

    if (nickname) updates.nickname = nickname;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');

    res.json({
      code: 200,
      message: '更新成功',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
