// 离线词库示例 - 可扩展为完整词库
// 数据来源: 开源词典项目 (ECDICT, etc.)

export interface LocalWordData {
  word: string;
  phonetic: string;
  definition: string;
  translation: string;
  pos: string; // part of speech
  examples?: string[];
}

// 常用单词本地数据（示例）
export const LOCAL_DICTIONARY: Record<string, LocalWordData> = {
  "abandon": {
    word: "abandon",
    phonetic: "/əˈbændən/",
    definition: "to leave completely and finally; to give up",
    translation: "v. 放弃；抛弃；遗弃",
    pos: "verb",
    examples: [
      "They had to abandon the car in the snow.",
      "Don't abandon your dreams."
    ]
  },
  "ability": {
    word: "ability",
    phonetic: "/əˈbɪləti/",
    definition: "the capacity to do something",
    translation: "n. 能力；才能",
    pos: "noun",
    examples: [
      "She has the ability to solve complex problems.",
      "He demonstrated his ability in mathematics."
    ]
  },
  "able": {
    word: "able",
    phonetic: "/ˈeɪbl/",
    definition: "having the power, skill, or means to do something",
    translation: "adj. 能够的；有能力的",
    pos: "adjective",
    examples: [
      "Will you be able to come tomorrow?",
      "She is able to speak three languages."
    ]
  },
  "about": {
    word: "about",
    phonetic: "/əˈbaʊt/",
    definition: "on the subject of; concerning",
    translation: "prep./adv. 关于；大约",
    pos: "preposition",
    examples: [
      "Tell me about your trip.",
      "There are about 50 people here."
    ]
  },
  "above": {
    word: "above",
    phonetic: "/əˈbʌv/",
    definition: "at a higher level or position than",
    translation: "prep./adv. 在...上面；超过",
    pos: "preposition",
    examples: [
      "The plane flew above the clouds.",
      "Children above the age of 12 can enter."
    ]
  },
  "accept": {
    word: "accept",
    phonetic: "/əkˈsept/",
    definition: "to receive or take something offered",
    translation: "v. 接受；认可",
    pos: "verb",
    examples: [
      "Please accept my apology.",
      "She accepted the job offer."
    ]
  },
  "achieve": {
    word: "achieve",
    phonetic: "/əˈtʃiːv/",
    definition: "to succeed in reaching a goal",
    translation: "v. 达到；实现；取得",
    pos: "verb",
    examples: [
      "She achieved her goal of becoming a doctor.",
      "We achieved great success."
    ]
  },
  "across": {
    word: "across",
    phonetic: "/əˈkrɒs/",
    definition: "from one side to the other",
    translation: "prep./adv. 穿过；横过",
    pos: "preposition",
    examples: [
      "She walked across the street.",
      "The bridge goes across the river."
    ]
  },
  "action": {
    word: "action",
    phonetic: "/ˈækʃn/",
    definition: "the process of doing something",
    translation: "n. 行动；行为；作用",
    pos: "noun",
    examples: [
      "We need to take action immediately.",
      "Actions speak louder than words."
    ]
  },
  "activity": {
    word: "activity",
    phonetic: "/ækˈtɪvəti/",
    definition: "a thing that a person or group does",
    translation: "n. 活动；活跃",
    pos: "noun",
    examples: [
      "Physical activity is important for health.",
      "There are many activities for children."
    ]
  },
  "apple": {
    word: "apple",
    phonetic: "/ˈæpl/",
    definition: "a round fruit with red, green, or yellow skin",
    translation: "n. 苹果",
    pos: "noun",
    examples: [
      "An apple a day keeps the doctor away.",
      "She picked an apple from the tree."
    ]
  },
  "book": {
    word: "book",
    phonetic: "/bʊk/",
    definition: "a written or printed work consisting of pages",
    translation: "n. 书；书籍 v. 预订",
    pos: "noun/verb",
    examples: [
      "I'm reading a very interesting book.",
      "Can I book a table for two?"
    ]
  },
  "computer": {
    word: "computer",
    phonetic: "/kəmˈpjuːtər/",
    definition: "an electronic device for storing and processing data",
    translation: "n. 计算机；电脑",
    pos: "noun",
    examples: [
      "I work on my computer every day.",
      "The computer crashed unexpectedly."
    ]
  },
  "english": {
    word: "English",
    phonetic: "/ˈɪŋɡlɪʃ/",
    definition: "the language of England, used in many countries",
    translation: "n./adj. 英语；英国的",
    pos: "noun/adjective",
    examples: [
      "English is spoken worldwide.",
      "She teaches English at university."
    ]
  },
  "study": {
    word: "study",
    phonetic: "/ˈstʌdi/",
    definition: "to learn about a subject",
    translation: "v. 学习；研究 n. 研究；书房",
    pos: "verb/noun",
    examples: [
      "I study English every day.",
      "The study shows interesting results."
    ]
  },
  "learn": {
    word: "learn",
    phonetic: "/lɜːrn/",
    definition: "to gain knowledge or skill",
    translation: "v. 学习；得知",
    pos: "verb",
    examples: [
      "I want to learn how to play piano.",
      "We learn from our mistakes."
    ]
  },
  "word": {
    word: "word",
    phonetic: "/wɜːrd/",
    definition: "a single unit of language",
    translation: "n. 单词；话语",
    pos: "noun",
    examples: [
      "What's the meaning of this word?",
      "I gave him my word."
    ]
  },
  "language": {
    word: "language",
    phonetic: "/ˈlæŋɡwɪdʒ/",
    definition: "a system of communication used by a country or community",
    translation: "n. 语言",
    pos: "noun",
    examples: [
      "She speaks three languages fluently.",
      "Body language is important in communication."
    ]
  },
  "practice": {
    word: "practice",
    phonetic: "/ˈpræktɪs/",
    definition: "repeated exercise to improve a skill",
    translation: "n. 练习；实践 v. 练习",
    pos: "noun/verb",
    examples: [
      "Practice makes perfect.",
      "I practice speaking English every day."
    ]
  },
  "vocabulary": {
    word: "vocabulary",
    phonetic: "/vəˈkæbjələri/",
    definition: "all the words known and used by a person",
    translation: "n. 词汇；词汇量",
    pos: "noun",
    examples: [
      "Reading helps expand your vocabulary.",
      "He has a rich vocabulary."
    ]
  }
};

// 查找单词
export function lookupLocalWord(word: string): LocalWordData | null {
  const key = word.toLowerCase().trim();
  return LOCAL_DICTIONARY[key] || null;
}

// 获取所有单词列表
export function getAllLocalWords(): string[] {
  return Object.keys(LOCAL_DICTIONARY);
}
