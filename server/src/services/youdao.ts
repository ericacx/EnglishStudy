import axios from 'axios';
import CryptoJS from 'crypto-js';
import config from '../config';
import { WordCache } from '../models';

interface YoudaoResponse {
  errorCode: string;
  query: string;
  translation?: string[];
  basic?: {
    'us-phonetic'?: string;
    'uk-phonetic'?: string;
    'us-speech'?: string;
    'uk-speech'?: string;
    explains?: string[];
  };
  web?: Array<{
    key: string;
    value: string[];
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

// 生成签名
function generateSign(query: string, salt: string, curtime: string): string {
  const { appKey, appSecret } = config.youdao;
  const len = query.length;
  const input = len <= 20 ? query : query.substring(0, 10) + len + query.substring(len - 10);
  const signStr = appKey + input + salt + curtime + appSecret;
  return CryptoJS.SHA256(signStr).toString(CryptoJS.enc.Hex);
}

// 查询单词
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

  // 调用有道 API
  try {
    const { appKey, apiUrl } = config.youdao;
    const salt = Date.now().toString();
    const curtime = Math.floor(Date.now() / 1000).toString();
    const sign = generateSign(word, salt, curtime);

    const params = new URLSearchParams({
      q: word,
      from: 'en',
      to: 'zh-CHS',
      appKey,
      salt,
      sign,
      signType: 'v3',
      curtime,
    });

    const response = await axios.post<YoudaoResponse>(apiUrl, params);
    const data = response.data;

    if (data.errorCode !== '0') {
      console.error('Youdao API error:', data.errorCode);
      return null;
    }

    const wordInfo: WordInfo = {
      word: word.toLowerCase(),
      phonetic: {
        us: data.basic?.['us-phonetic'] || '',
        uk: data.basic?.['uk-phonetic'] || '',
      },
      audioUrl: {
        us: data.basic?.['us-speech'] || '',
        uk: data.basic?.['uk-speech'] || '',
      },
      definitions: data.basic?.explains || data.translation || [],
      examples: data.web?.slice(0, 3).map((item) => `${item.key}: ${item.value.join(', ')}`) || [],
    };

    // 存入缓存
    await WordCache.create({
      ...wordInfo,
      cachedAt: new Date(),
    });

    return wordInfo;
  } catch (error) {
    console.error('Youdao API request failed:', error);
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
  }
  return results;
}
