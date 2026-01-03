<template>
  <view class="wordbook-page">
    <view class="tabs">
      <view
        class="tab"
        :class="{ active: activeTab === 'preset' }"
        @click="activeTab = 'preset'"
      >
        预设词库
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'my' }"
        @click="activeTab = 'my'"
      >
        我的词库
      </view>
    </view>

    <!-- 预设词库 -->
    <view class="wordbook-list" v-if="activeTab === 'preset'">
      <view
        class="wordbook-item"
        v-for="book in presetBooks"
        :key="book._id"
      >
        <view class="book-info">
          <text class="book-name">{{ book.name }}</text>
          <text class="book-desc">{{ book.description }}</text>
          <text class="book-count">{{ book.wordCount }} 词</text>
        </view>
        <button
          class="subscribe-btn"
          :class="{ subscribed: isSubscribed(book._id) }"
          @click="toggleSubscribe(book)"
        >
          {{ isSubscribed(book._id) ? '已订阅' : '订阅' }}
        </button>
      </view>

      <view class="empty" v-if="presetBooks.length === 0 && !loading">
        <text>暂无预设词库</text>
      </view>
    </view>

    <!-- 我的词库 -->
    <view class="wordbook-list" v-if="activeTab === 'my'">
      <view
        class="wordbook-item"
        v-for="book in myBooks"
        :key="book._id"
        @click="goToDetail(book)"
      >
        <view class="book-info">
          <text class="book-name">{{ book.customName }}</text>
          <text class="book-count">{{ book.words?.length || 0 }} 词</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="empty" v-if="myBooks.length === 0 && !loading">
        <text class="empty-icon">📚</text>
        <text class="empty-text">还没有词库</text>
        <text class="empty-hint">去预设词库订阅或搜索添加单词</text>
      </view>
    </view>

    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from '@/api';

interface Wordbook {
  _id: string;
  name: string;
  description: string;
  wordCount: number;
  category: string;
}

interface UserWordbook {
  _id: string;
  customName: string;
  wordbookId?: string;
  words: any[];
}

const activeTab = ref<'preset' | 'my'>('preset');
const presetBooks = ref<Wordbook[]>([]);
const myBooks = ref<UserWordbook[]>([]);
const loading = ref(false);

const subscribedIds = computed(() => {
  return myBooks.value
    .filter((book) => book.wordbookId)
    .map((book) => book.wordbookId);
});

const isSubscribed = (id: string) => {
  return subscribedIds.value.includes(id);
};

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    // 加载预设词库
    const presetRes = await api.wordbook.getPreset();
    if (presetRes.data) {
      presetBooks.value = presetRes.data;
    }

    // 加载我的词库
    const myRes = await api.wordbook.getSubscribed();
    if (myRes.data) {
      myBooks.value = myRes.data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const toggleSubscribe = async (book: Wordbook) => {
  try {
    if (isSubscribed(book._id)) {
      await api.wordbook.unsubscribe(book._id);
      uni.showToast({ title: '已取消订阅', icon: 'none' });
    } else {
      await api.wordbook.subscribe(book._id);
      uni.showToast({ title: '订阅成功', icon: 'success' });
    }
    // 刷新我的词库
    const myRes = await api.wordbook.getSubscribed();
    if (myRes.data) {
      myBooks.value = myRes.data;
    }
  } catch (error) {
    console.error(error);
  }
};

const goToDetail = (book: UserWordbook) => {
  // TODO: 跳转到词库详情页
  uni.showToast({ title: '功能开发中', icon: 'none' });
};
</script>

<style scoped>
.wordbook-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.tabs {
  display: flex;
  background: #ffffff;
  padding: 0 32rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 32rpx 0;
  font-size: 30rpx;
  color: #666666;
  position: relative;
}

.tab.active {
  color: #4F46E5;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background: #4F46E5;
  border-radius: 3rpx;
}

.wordbook-list {
  padding: 32rpx;
}

.wordbook-item {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.book-info {
  flex: 1;
}

.book-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.book-desc {
  display: block;
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 8rpx;
}

.book-count {
  font-size: 24rpx;
  color: #999999;
}

.subscribe-btn {
  width: 140rpx;
  height: 64rpx;
  background: #4F46E5;
  color: #ffffff;
  border: none;
  border-radius: 32rpx;
  font-size: 26rpx;
}

.subscribe-btn.subscribed {
  background: #E5E5E5;
  color: #666666;
}

.arrow {
  font-size: 40rpx;
  color: #CCCCCC;
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
  font-size: 30rpx;
  color: #666666;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999999;
}

.loading {
  text-align: center;
  padding: 60rpx;
  color: #666666;
}
</style>
