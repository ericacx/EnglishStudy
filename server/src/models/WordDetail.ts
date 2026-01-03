import mongoose, { Document, Schema } from 'mongoose';

// 单词详情模型 - 存储完整的单词信息（音标、释义、例句等）
export interface IWordDetail extends Document {
  word: string;
  phonetic: {
    us: string;
    uk: string;
  };
  audioUrl: {
    us: string;
    uk: string;
  };
  definitions: string[];      // 英文释义
  translation: string;        // 中文翻译
  pos: string;                // 词性
  examples: string[];         // 例句
  tags: string[];             // 标签（如 CET4, CET6, IELTS 等）
  difficulty: number;         // 难度等级 1-5
  frequency: number;          // 使用频率
  createdAt: Date;
  updatedAt: Date;
}

const wordDetailSchema = new Schema<IWordDetail>(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phonetic: {
      us: { type: String, default: '' },
      uk: { type: String, default: '' },
    },
    audioUrl: {
      us: { type: String, default: '' },
      uk: { type: String, default: '' },
    },
    definitions: {
      type: [String],
      default: [],
    },
    translation: {
      type: String,
      default: '',
    },
    pos: {
      type: String,
      default: '',
    },
    examples: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    difficulty: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    frequency: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
wordDetailSchema.index({ tags: 1 });
wordDetailSchema.index({ difficulty: 1 });

export default mongoose.model<IWordDetail>('WordDetail', wordDetailSchema);
