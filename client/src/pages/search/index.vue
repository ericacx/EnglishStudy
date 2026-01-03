<template>
  <view class="search-page">
    <view class="search-box">
      <input
        v-model="keyword"
        type="text"
        placeholder="输入要查询的单词"
        class="search-input"
        @confirm="handleSearch"
      />
      <button class="search-btn" @click="handleSearch">搜索</button>
    </view>

    <view class="result" v-if="wordInfo">
      <WordCard :word="wordInfo" :show-actions="false" />

      <button class="add-btn" @click="handleAddWord" :loading="adding">
        ➕ 添加到单词本
      </button>
    </view>

    <view class="empty" v-else-if="searched && !loading">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">未找到该单词</text>
    </view>

    <view class="loading" v-if="loading">
      <text>搜索中...</text>
    </view>

    <view class="history" v-if="searchHistory.length > 0 && !wordInfo">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <text class="history-clear" @click="clearHistory">清空</text>
      </view>
      <view class="history-list">
        <view
          class="history-item"
          v-for="item in searchHistory"
          :key="item"
          @click="searchWord(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

const keyword = ref('');
const wordInfo = ref<WordInfo | null>(null);
const loading = ref(false);
const searched = ref(false);
const adding = ref(false);
const searchHistory = ref<string[]>([]);

onMounted(() => {
  // 加载搜索历史
  const history = uni.getStorageSync('searchHistory');
  if (history) {
    searchHistory.value = JSON.parse(history);
  }
});

const handleSearch = async () => {
  const word = keyword.value.trim();
  if (!word) {
    uni.showToast({ title: '请输入单词', icon: 'none' });
    return;
  }

  await searchWord(word);
};

const searchWord = async (word: string) => {
  keyword.value = word;
  loading.value = true;
  searched.value = true;
  wordInfo.value = null;

  try {
    const res = await api.word.search(word);
    if (res.data) {
      wordInfo.value = res.data;
      addToHistory(word);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const addToHistory = (word: string) => {
  // 去重并添加到开头
  const history = searchHistory.value.filter((item) => item !== word);
  history.unshift(word);
  // 最多保存 20 条
  searchHistory.value = history.slice(0, 20);
  uni.setStorageSync('searchHistory', JSON.stringify(searchHistory.value));
};

const clearHistory = () => {
  searchHistory.value = [];
  uni.removeStorageSync('searchHistory');
};

const handleAddWord = async () => {
  if (!wordInfo.value) return;

  adding.value = true;
  try {
    await api.word.add({ word: wordInfo.value.word });
    uni.showToast({ title: '添加成功', icon: 'success' });
  } catch (error) {
    console.error(error);
  } finally {
    adding.value = false;
  }
};
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 32rpx;
}

.search-box {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.search-input {
  flex: 1;
  height: 88rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 0 32rpx;
  font-size: 30rpx;
}

.search-btn {
  width: 160rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 30rpx;
}

.result {
  margin-bottom: 32rpx;
}

.add-btn {
  width: 100%;
  height: 88rpx;
  background: #4F46E5;
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 30rpx;
  margin-top: 24rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #666666;
}

.loading {
  text-align: center;
  padding: 60rpx;
  color: #666666;
}

.history {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.history-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1a1a1a;
}

.history-clear {
  font-size: 26rpx;
  color: #999999;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-item {
  background: #F5F5F5;
  padding: 16rpx 28rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666666;
}
</style>
