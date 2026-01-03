<template>
  <view class="study-page">
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
    </view>

    <view class="progress-text">
      {{ currentIndex + 1 }} / {{ words.length }}
    </view>

    <view class="card-container" v-if="currentWord">
      <WordCard
        :word="currentWord"
        :show-actions="true"
        @known="handleKnown"
        @unknown="handleUnknown"
      />
    </view>

    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">🎉</text>
      <text class="empty-title">太棒了！</text>
      <text class="empty-desc">{{ emptyMessage }}</text>
      <button class="btn-primary" @click="goBack">返回首页</button>
    </view>

    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import WordCard from '@/components/WordCard.vue';
import { api } from '@/api';

interface WordInfo {
  word: string;
  phonetic?: {
    us: string;
    uk: string;
  };
  audioUrl?: {
    us: string;
    uk: string;
  };
  definitions: string[];
  examples?: string[];
}

const words = ref<WordInfo[]>([]);
const currentIndex = ref(0);
const loading = ref(true);
const isReviewMode = ref(false);

const currentWord = computed(() => words.value[currentIndex.value]);

const progressPercent = computed(() => {
  if (words.value.length === 0) return 0;
  return ((currentIndex.value + 1) / words.value.length) * 100;
});

const emptyMessage = computed(() => {
  if (isReviewMode.value) {
    return '没有需要复习的单词了';
  }
  return '今天的学习任务已完成';
});

onMounted(async () => {
  // 检查是否是复习模式
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any).$page?.options || {};

  isReviewMode.value = options.mode === 'review';

  await loadWords();
});

const loadWords = async () => {
  loading.value = true;
  try {
    if (isReviewMode.value) {
      // 获取待复习单词
      const res = await api.word.getReviewWords(20);
      if (res.data) {
        words.value = res.data
          .filter((item: any) => item.wordInfo)
          .map((item: any) => item.wordInfo);
      }
    } else {
      // 获取用户词库中的单词进行学习
      const res = await api.word.list();
      if (res.data && res.data.length > 0) {
        // 取第一个词库的单词
        const wordbook = res.data[0];
        // 获取单词详情
        const wordInfos: WordInfo[] = [];
        for (const w of wordbook.words.slice(0, 20)) {
          const wordRes = await api.word.search(w.word);
          if (wordRes.data) {
            wordInfos.push(wordRes.data);
          }
        }
        words.value = wordInfos;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleKnown = async (word: WordInfo) => {
  try {
    await api.word.updateRecord({
      word: word.word,
      status: 'known',
    });
  } catch (error) {
    console.error(error);
  }
  nextWord();
};

const handleUnknown = async (word: WordInfo) => {
  try {
    await api.word.updateRecord({
      word: word.word,
      status: 'unknown',
    });
  } catch (error) {
    console.error(error);
  }
  nextWord();
};

const nextWord = () => {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++;
  } else {
    // 学习完成
    words.value = [];
  }
};

const goBack = () => {
  uni.switchTab({ url: '/pages/home/index' });
};
</script>

<style scoped>
.study-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 32rpx;
}

.progress-bar {
  height: 8rpx;
  background: #E5E5E5;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%);
  border-radius: 4rpx;
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 32rpx;
}

.card-container {
  min-height: 500rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 48rpx;
}

.btn-primary {
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  padding: 24rpx 64rpx;
  font-size: 30rpx;
}

.loading {
  text-align: center;
  padding: 100rpx;
  color: #666666;
}
</style>
