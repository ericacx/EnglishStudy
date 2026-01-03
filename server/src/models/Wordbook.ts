import mongoose, { Document, Schema } from 'mongoose';

export interface IWordbook extends Document {
  name: string;
  description: string;
  category: 'CET4' | 'CET6' | 'IELTS' | 'TOEFL' | 'GRE' | 'CUSTOM';
  wordCount: number;
  words: string[];
  isPreset: boolean;
  createdAt: Date;
}

const wordbookSchema = new Schema<IWordbook>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['CET4', 'CET6', 'IELTS', 'TOEFL', 'GRE', 'CUSTOM'],
      required: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    words: {
      type: [String],
      default: [],
    },
    isPreset: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWordbook>('Wordbook', wordbookSchema);
