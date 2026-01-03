import axios from 'axios';
import { WordCache } from '../models';

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

interface WordInfo {
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
}

// 使用免费 Dictionary API（无需 API Key）
export async function lookupWord(word: string): Promise<WordInfo | null> {
  // 先查缓存
  const cached = await WordCache.findOne({ word: word.toLowerCase() });
  if (cached) {
    return {
      word: cached.word,
      phonetic: cached.phonetic,
      audioUrl: cached.audioUrl,
      definitions: cached.definitions,
      examples: cached.examples,
    };
  }

  try {
    const response = await axios.get<FreeDictResponse[]>(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
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
      word: word.toLowerCase(),
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
      console.log(`Word not found: ${word}`);
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
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return results;
}
