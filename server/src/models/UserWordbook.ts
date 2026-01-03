import mongoose, { Document, Schema } from 'mongoose';

export interface IUserWord {
  word: string;
  addedAt: Date;
  source: 'preset' | 'search';
}

export interface IUserWordbook extends Document {
  userId: mongoose.Types.ObjectId;
  wordbookId?: mongoose.Types.ObjectId;
  customName: string;
  words: IUserWord[];
  createdAt: Date;
  updatedAt: Date;
}

const userWordSchema = new Schema<IUserWord>(
  {
    word: {
      type: String,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ['preset', 'search'],
      default: 'search',
    },
  },
  { _id: false }
);

const userWordbookSchema = new Schema<IUserWordbook>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wordbookId: {
      type: Schema.Types.ObjectId,
      ref: 'Wordbook',
    },
    customName: {
      type: String,
      default: '我的单词本',
    },
    words: {
      type: [userWordSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// 复合索引
userWordbookSchema.index({ userId: 1, wordbookId: 1 });

export default mongoose.model<IUserWordbook>('UserWordbook', userWordbookSchema);
