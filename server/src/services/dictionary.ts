import axios from 'axios';
import { WordCache, WordDetail } from '../models';

interface FreeDictResponse {
  word: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export interface WordInfo {
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
  translation?: string; // 中文翻译（来自本地词库）
  examples: string[];
}

// 混合查询：优先数据库词库，然后缓存，最后在线 API
export async function lookupWord(word: string): Promise<WordInfo | null> {
  const normalizedWord = word.toLowerCase().trim();

  // 1. 先查数据库词库 WordDetail（最快，有中文翻译）
  const dbWord = await WordDetail.findOne({ word: normalizedWord });
  if (dbWord) {
    console.log(`[DB] Found: ${normalizedWord}`);
    return {
      word: dbWord.word,
      phonetic: dbWord.phonetic,
      audioUrl: dbWord.audioUrl,
      definitions: dbWord.definitions,
      translation: dbWord.translation,
      examples: dbWord.examples,
    };
  }

  // 2. 查数据库缓存
  const cached = await WordCache.findOne({ word: normalizedWord });
  if (cached) {
    console.log(`[Cache] Found: ${normalizedWord}`);
    return {
      word: cached.word,
      phonetic: cached.phonetic,
      audioUrl: cached.audioUrl,
      definitions: cached.definitions,
      examples: cached.examples,
    };
  }

  // 3. 查询在线 Free Dictionary API
  try {
    console.log(`[API] Fetching: ${normalizedWord}`);
    const response = await axios.get<FreeDictResponse[]>(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalizedWord)}`,
      { timeout: 5000 }
    );

    const data = response.data[0];
    if (!data) return null;

    // 提取音标
    const phonetics = data.phonetics || [];
    const usPhonetic = phonetics.find((p) => p.audio?.includes('us'))?.text || phonetics[0]?.text || '';
    const ukPhonetic = phonetics.find((p) => p.audio?.includes('uk'))?.text || phonetics[0]?.text || '';

    // 提取音频 URL
    const usAudio = phonetics.find((p) => p.audio?.includes('us'))?.audio || '';
    const ukAudio = phonetics.find((p) => p.audio?.includes('uk'))?.audio || phonetics.find((p) => p.audio)?.audio || '';

    // 提取释义
    const definitions: string[] = [];
    const examples: string[] = [];

    data.meanings.forEach((meaning) => {
      const pos = meaning.partOfSpeech;
      meaning.definitions.slice(0, 2).forEach((def) => {
        definitions.push(`${pos}. ${def.definition}`);
        if (def.example) {
          examples.push(def.example);
        }
      });
    });

    const wordInfo: WordInfo = {
      word: normalizedWord,
      phonetic: {
        us: usPhonetic,
        uk: ukPhonetic,
      },
      audioUrl: {
        us: usAudio,
        uk: ukAudio,
      },
      definitions: definitions.slice(0, 5),
      examples: examples.slice(0, 3),
    };

    // 存入缓存
    await WordCache.create({
      ...wordInfo,
      cachedAt: new Date(),
    });

    return wordInfo;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`[API] Not found: ${normalizedWord}`);
      return null;
    }
    console.error('Dictionary API error:', error.message);
    return null;
  }
}

// 批量查询单词
export async function lookupWords(words: string[]): Promise<WordInfo[]> {
  const results: WordInfo[] = [];
  for (const word of words) {
    const info = await lookupWord(word);
    if (info) {
      results.push(info);
    }
    // 避免请求过快
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return results;
}

// 根据标签获取单词列表（如 CET4, CET6, IELTS, TOEFL）
export async function getWordsByTag(
  tag: string,
  page: number = 1,
  limit: number = 20
): Promise<{ words: WordInfo[]; total: number; page: number; totalPages: number }> {
  const skip = (page - 1) * limit;

  const [words, total] = await Promise.all([
    WordDetail.find({ tags: tag })
      .skip(skip)
      .limit(limit)
      .sort({ frequency: -1, word: 1 }),
    WordDetail.countDocuments({ tags: tag }),
  ]);

  return {
    words: words.map((w) => ({
      word: w.word,
      phonetic: w.phonetic,
      audioUrl: w.audioUrl,
      definitions: w.definitions,
      translation: w.translation,
      examples: w.examples,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// 获取所有可用的标签及其单词数量
export async function getAvailableTags(): Promise<{ tag: string; count: number }[]> {
  const result = await WordDetail.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { tag: '$_id', count: 1, _id: 0 } },
  ]);
  return result;
}

