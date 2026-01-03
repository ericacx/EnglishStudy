import mongoose from 'mongoose';
import { Wordbook } from '../models';
import config from '../config';

// CET4 核心词汇（示例，完整版约4500词）
const CET4_WORDS = [
  'abandon', 'ability', 'able', 'abnormal', 'aboard', 'abolish', 'abortion', 'about', 'above', 'abroad',
  'abrupt', 'absence', 'absent', 'absolute', 'absorb', 'abstract', 'absurd', 'abundance', 'abundant', 'abuse',
  'academic', 'academy', 'accelerate', 'accent', 'accept', 'acceptance', 'access', 'accessible', 'accident', 'accidental',
  'accommodate', 'accommodation', 'accompany', 'accomplish', 'accord', 'accordance', 'according', 'account', 'accountant', 'accumulate',
  'accuracy', 'accurate', 'accuse', 'accustomed', 'ache', 'achieve', 'achievement', 'acid', 'acknowledge', 'acquaint',
  'acquire', 'acquisition', 'across', 'act', 'action', 'activate', 'active', 'activity', 'actor', 'actress',
  'actual', 'acute', 'adapt', 'add', 'addition', 'additional', 'address', 'adequate', 'adjust', 'adjustment',
  'administer', 'administration', 'admire', 'admission', 'admit', 'adolescent', 'adopt', 'adult', 'advance', 'advanced',
  'advantage', 'adventure', 'advertise', 'advertisement', 'advice', 'advise', 'advocate', 'affair', 'affect', 'affection',
  'afford', 'afraid', 'after', 'afternoon', 'afterward', 'again', 'against', 'age', 'agency', 'agent',
  'aggressive', 'ago', 'agree', 'agreement', 'agriculture', 'ahead', 'aid', 'aim', 'air', 'aircraft',
  'airline', 'airplane', 'airport', 'alarm', 'album', 'alcohol', 'alert', 'alien', 'alike', 'alive',
  'all', 'allege', 'allergic', 'alley', 'alliance', 'allocate', 'allow', 'allowance', 'ally', 'almost',
  'alone', 'along', 'alongside', 'aloud', 'alphabet', 'already', 'also', 'alter', 'alternative', 'although',
  'altogether', 'always', 'amateur', 'amaze', 'ambassador', 'ambition', 'ambitious', 'ambulance', 'amend', 'amid',
  'among', 'amount', 'ample', 'amuse', 'analyse', 'analysis', 'analyst', 'ancestor', 'anchor', 'ancient',
  'anger', 'angle', 'angry', 'animal', 'ankle', 'anniversary', 'announce', 'annoy', 'annual', 'another',
  'answer', 'ant', 'anxiety', 'anxious', 'any', 'anybody', 'anyhow', 'anyone', 'anything', 'anyway',
  'anywhere', 'apart', 'apartment', 'apologize', 'apology', 'apparent', 'appeal', 'appear', 'appearance', 'appetite',
  'apple', 'appliance', 'applicable', 'applicant', 'application', 'apply', 'appoint', 'appointment', 'appreciate', 'approach',
];

// CET6 核心词汇（示例，完整版约5500词）
const CET6_WORDS = [
  'abide', 'abolish', 'abrupt', 'absurd', 'abundance', 'accessory', 'accommodate', 'accord', 'accumulate', 'accurate',
  'accuse', 'acquaint', 'activate', 'acute', 'adhere', 'adjacent', 'adjoin', 'administer', 'adolescent', 'advent',
  'adverse', 'advocate', 'aesthetic', 'affiliate', 'affirm', 'afflict', 'aggravate', 'aggregate', 'agitate', 'agonize',
  'ailment', 'akin', 'albeit', 'alchemy', 'alienate', 'align', 'allege', 'allocate', 'allot', 'allude',
  'ally', 'altar', 'alternate', 'amateur', 'ambiguous', 'ambitious', 'amend', 'amid', 'amnesty', 'amplify',
  'analogy', 'anchor', 'anguish', 'animate', 'annex', 'annotate', 'anonymous', 'antagonist', 'antenna', 'anticipate',
  'antique', 'anxiety', 'apartheid', 'apathy', 'aperture', 'apex', 'appall', 'apparatus', 'appease', 'append',
  'applicable', 'appraise', 'appreciable', 'apprehend', 'apprentice', 'appropriate', 'apt', 'arbitrary', 'arch', 'ardent',
  'arena', 'arid', 'arithmetic', 'armor', 'arouse', 'array', 'arrogant', 'articulate', 'artifact', 'ascend',
  'ascertain', 'ascribe', 'ashore', 'aspire', 'assail', 'assassinate', 'assault', 'assemble', 'assert', 'assess',
  'asset', 'assign', 'assimilate', 'assumption', 'assurance', 'assure', 'astonish', 'astray', 'astronomy', 'asylum',
  'athlete', 'atlas', 'atmosphere', 'atom', 'atrocity', 'attach', 'attain', 'attribute', 'auction', 'audit',
  'augment', 'auspicious', 'authentic', 'authorize', 'automation', 'autonomous', 'auxiliary', 'avail', 'avert', 'avid',
  'await', 'awe', 'awkward', 'axis', 'bachelor', 'backdrop', 'baffle', 'bait', 'balcony', 'bald',
  'ballot', 'ban', 'bandage', 'banish', 'banker', 'bankrupt', 'banner', 'banquet', 'barb', 'bare',
  'bargain', 'bark', 'barn', 'barracks', 'barren', 'barrier', 'batch', 'batter', 'battlefield', 'bazaar',
  'beacon', 'bead', 'beam', 'bearing', 'beast', 'beforehand', 'behalf', 'behave', 'being', 'belly',
  'beloved', 'beneath', 'beneficial', 'beneficiary', 'benevolent', 'benign', 'bereave', 'berth', 'bestow', 'betray',
  'beverage', 'beware', 'bewilder', 'beyond', 'bias', 'bid', 'bile', 'biography', 'biology', 'bizarre',
  'blackmail', 'blade', 'blanket', 'blast', 'blaze', 'bleach', 'bleak', 'bleed', 'blend', 'bless',
];

// 雅思核心词汇（示例）
const IELTS_WORDS = [
  'abandon', 'abbreviate', 'abide', 'abolish', 'abound', 'abroad', 'abrupt', 'absence', 'absent', 'absolute',
  'absorb', 'abstract', 'absurd', 'abundant', 'abuse', 'academic', 'accelerate', 'accent', 'accept', 'access',
  'accessible', 'accident', 'accommodate', 'accompany', 'accomplish', 'accord', 'account', 'accumulate', 'accurate', 'accuse',
  'achieve', 'acknowledge', 'acquire', 'acre', 'activate', 'acute', 'adapt', 'add', 'addict', 'address',
  'adequate', 'adhere', 'adjacent', 'adjust', 'administer', 'admire', 'admit', 'adolescent', 'adopt', 'adore',
  'adult', 'advance', 'advantage', 'advent', 'adventure', 'adverse', 'advertise', 'advice', 'advocate', 'aesthetic',
  'affair', 'affect', 'affection', 'affiliate', 'affirm', 'afford', 'agency', 'agenda', 'agent', 'aggravate',
  'aggregate', 'aggressive', 'agitate', 'agree', 'agriculture', 'aid', 'aim', 'aircraft', 'alarm', 'alcohol',
  'alert', 'alien', 'align', 'alike', 'alive', 'allege', 'allegiance', 'allergic', 'alleviate', 'alliance',
  'allocate', 'allow', 'alloy', 'ally', 'alongside', 'alter', 'alternate', 'alternative', 'altitude', 'altogether',
  'amateur', 'amaze', 'ambiguity', 'ambiguous', 'ambition', 'ambitious', 'ambulance', 'amend', 'amid', 'amount',
  'ample', 'amplify', 'amuse', 'analyse', 'analysis', 'ancestor', 'anchor', 'ancient', 'anger', 'angle',
  'anguish', 'animate', 'anniversary', 'announce', 'annoy', 'annual', 'anonymous', 'answer', 'antagonist', 'anticipate',
  'antique', 'anxiety', 'anxious', 'apart', 'apartment', 'apathy', 'ape', 'apologize', 'apology', 'apparatus',
  'apparent', 'appeal', 'appear', 'appearance', 'appetite', 'applaud', 'appliance', 'applicable', 'applicant', 'application',
  'apply', 'appoint', 'appraise', 'appreciate', 'approach', 'appropriate', 'approval', 'approve', 'approximate', 'apt',
  'arbitrary', 'arch', 'architect', 'architecture', 'archive', 'ardent', 'area', 'arena', 'argue', 'argument',
  'arid', 'arise', 'aristocrat', 'arithmetic', 'arm', 'armor', 'army', 'aroma', 'arouse', 'arrange',
  'array', 'arrest', 'arrival', 'arrive', 'arrogant', 'arrow', 'art', 'article', 'articulate', 'artificial',
  'artist', 'ascend', 'ascertain', 'ash', 'ashamed', 'ashore', 'aside', 'aspect', 'aspire', 'assail',
];

// 托福核心词汇（示例）
const TOEFL_WORDS = [
  'abandon', 'abate', 'abbreviate', 'abdicate', 'aberrant', 'abhor', 'abide', 'ability', 'abolish', 'abound',
  'abrasive', 'abridge', 'abrogate', 'abrupt', 'abscond', 'absolute', 'absolve', 'absorb', 'abstain', 'abstract',
  'absurd', 'abundant', 'abuse', 'abysmal', 'academic', 'accede', 'accelerate', 'accentuate', 'accept', 'access',
  'accessible', 'accessory', 'acclaim', 'acclimate', 'accommodate', 'accompany', 'accomplice', 'accomplish', 'accord', 'accost',
  'account', 'accredit', 'accrue', 'accumulate', 'accurate', 'accusation', 'accuse', 'accustom', 'acerbic', 'achieve',
  'acknowledge', 'acme', 'acquaint', 'acquiesce', 'acquire', 'acquisition', 'acquit', 'acrid', 'acrimonious', 'acronym',
  'activate', 'acute', 'adage', 'adamant', 'adapt', 'addendum', 'addict', 'address', 'adept', 'adequate',
  'adhere', 'adjacent', 'adjoin', 'adjourn', 'adjudicate', 'adjust', 'administer', 'admire', 'admission', 'admit',
  'admonish', 'adolescent', 'adopt', 'adore', 'adorn', 'adroit', 'adulation', 'adult', 'adulterate', 'advance',
  'advantage', 'advent', 'adversary', 'adverse', 'adversity', 'advertise', 'advice', 'advise', 'advocate', 'aerial',
  'aesthetic', 'affable', 'affair', 'affect', 'affection', 'affiliate', 'affinity', 'affirm', 'afflict', 'affluent',
  'afford', 'affront', 'aftermath', 'agency', 'agenda', 'agent', 'aggravate', 'aggregate', 'aggression', 'aggressive',
  'aggrieve', 'aghast', 'agile', 'agitate', 'agnostic', 'agonize', 'agrarian', 'agree', 'agriculture', 'aid',
  'ailment', 'aim', 'akin', 'alarm', 'albeit', 'alchemy', 'alert', 'alias', 'alienate', 'align',
  'alike', 'alive', 'allay', 'allegation', 'allege', 'allegiance', 'allegory', 'alleviate', 'alliance', 'allocate',
  'allot', 'allow', 'alloy', 'allude', 'allure', 'ally', 'aloof', 'alter', 'altercation', 'alternate',
  'alternative', 'altitude', 'altruistic', 'amalgamate', 'amateur', 'amaze', 'ambiguity', 'ambiguous', 'ambition', 'ambitious',
  'ambivalent', 'amble', 'ambulance', 'ameliorate', 'amenable', 'amend', 'amenity', 'amiable', 'amicable', 'amid',
  'amnesty', 'amorphous', 'amount', 'ample', 'amplify', 'amputate', 'amuse', 'anachronism', 'analogous', 'analogy',
  'analyse', 'analysis', 'analytical', 'analyze', 'anarchy', 'anatomy', 'ancestor', 'anchor', 'ancient', 'ancillary',
];

async function seedWordbooks() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    // 清空现有预设词库
    await Wordbook.deleteMany({ isPreset: true });
    console.log('🗑️ Cleared existing preset wordbooks');

    // 创建预设词库
    const wordbooks = [
      {
        name: 'CET4 核心词汇',
        description: '大学英语四级考试核心词汇，约200个高频词',
        category: 'CET4',
        wordCount: CET4_WORDS.length,
        words: CET4_WORDS,
        isPreset: true,
      },
      {
        name: 'CET6 核心词汇',
        description: '大学英语六级考试核心词汇，约200个高频词',
        category: 'CET6',
        wordCount: CET6_WORDS.length,
        words: CET6_WORDS,
        isPreset: true,
      },
      {
        name: '雅思核心词汇',
        description: 'IELTS 考试核心词汇，约200个高频词',
        category: 'IELTS',
        wordCount: IELTS_WORDS.length,
        words: IELTS_WORDS,
        isPreset: true,
      },
      {
        name: '托福核心词汇',
        description: 'TOEFL 考试核心词汇，约200个高频词',
        category: 'TOEFL',
        wordCount: TOEFL_WORDS.length,
        words: TOEFL_WORDS,
        isPreset: true,
      },
    ];

    await Wordbook.insertMany(wordbooks);
    console.log('✅ Created preset wordbooks:');
    wordbooks.forEach((book) => {
      console.log(`   📚 ${book.name}: ${book.wordCount} words`);
    });

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedWordbooks();
