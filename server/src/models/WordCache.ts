import mongoose, { Document, Schema } from 'mongoose';

export interface IWordCache extends Document {
  word: string;
  phonetic: {
    us: string;
    uk: string;
  };
  audioUrl: {
    us: string;
    uk: string;
  };
  definitions: string[];
  examples: string[];
  cachedAt: Date;
}

const wordCacheSchema = new Schema<IWordCache>(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
    examples: {
      type: [String],
      default: [],
    },
    cachedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 7天后过期
wordCacheSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model<IWordCache>('WordCache', wordCacheSchema);
