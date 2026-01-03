import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningRecord extends Document {
  userId: mongoose.Types.ObjectId;
  word: string;
  status: 'known' | 'unknown' | 'learning';
  reviewCount: number;
  correctCount: number;
  lastReviewAt: Date;
  nextReviewAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const learningRecordSchema = new Schema<ILearningRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    word: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['known', 'unknown', 'learning'],
      default: 'unknown',
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    lastReviewAt: {
      type: Date,
      default: Date.now,
    },
    nextReviewAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 复合索引：用户+单词唯一
learningRecordSchema.index({ userId: 1, word: 1 }, { unique: true });
// 查询索引
learningRecordSchema.index({ userId: 1, nextReviewAt: 1 });
learningRecordSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ILearningRecord>('LearningRecord', learningRecordSchema);
