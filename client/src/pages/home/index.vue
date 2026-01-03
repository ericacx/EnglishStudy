<template>
  <view class="home-page">
    <view class="header">
      <text class="greeting">Hello, {{ userInfo.nickname || '同学' }} 👋</text>
      <text class="date">{{ todayDate }}</text>
    </view>

    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">总词汇</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.known }}</text>
        <text class="stat-label">已掌握</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.learning }}</text>
        <text class="stat-label">学习中</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ reviewCount }}</text>
        <text class="stat-label">待复习</text>
      </view>
    </view>

    <view class="action-cards">
      <view class="action-card" @click="goToStudy">
        <view class="action-icon">📖</view>
        <view class="action-content">
          <text class="action-title">开始学习</text>
          <text class="action-desc">继续你的学习计划</text>
        </view>
      </view>

      <view class="action-card" @click="goToReview">
        <view class="action-icon">🔄</view>
        <view class="action-content">
          <text class="action-title">复习单词</text>
          <text class="action-desc">{{ reviewCount }} 个单词待复习</text>
        </view>
      </view>

      <view class="action-card" @click="goToSearch">
        <view class="action-icon">🔍</view>
        <view class="action-content">
          <text class="action-title">搜索单词</text>
          <text class="action-desc">查找并添加新单词</text>
        </view>
      </view>

      <view class="action-card" @click="goToWordbook">
        <view class="action-icon">📚</view>
        <view class="action-content">
          <text class="action-title">词库管理</text>
          <text class="action-desc">管理你的词库</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { api } from '@/api';

const userInfo = reactive({
  nickname: '',
});

const stats = reactive({
  total: 0,
  known: 0,
  learning: 0,
  unknown: 0,
});

const reviewCount = ref(0);

const todayDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

onMounted(async () => {
  // 检查登录状态
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.reLaunch({ url: '/pages/login/index' });
    return;
  }

  try {
    // 获取用户信息
    const profileRes = await api.auth.getProfile();
    if (profileRes.data) {
      userInfo.nickname = profileRes.data.nickname;
    }

    // 获取学习进度
    const progressRes = await api.word.getProgress();
    if (progressRes.data) {
      Object.assign(stats, progressRes.data);
    }

    // 获取待复习单词数量
    const reviewRes = await api.word.getReviewWords(100);
    if (reviewRes.data) {
      reviewCount.value = reviewRes.data.length;
    }
  } catch (error) {
    console.error(error);
  }
});

const goToStudy = () => {
  uni.switchTab({ url: '/pages/study/index' });
};

const goToReview = () => {
  uni.navigateTo({ url: '/pages/study/index?mode=review' });
};

const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/index' });
};

const goToWordbook = () => {
  uni.switchTab({ url: '/pages/wordbook/index' });
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 32rpx;
}

.header {
  margin-bottom: 32rpx;
}

.greeting {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.date {
  font-size: 26rpx;
  color: #666666;
}

.stats-card {
  display: flex;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  border-radius: 24rpx;
  padding: 40rpx 20rpx;
  margin-bottom: 32rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.action-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.action-card {
  width: calc(50% - 12rpx);
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.action-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.action-desc {
  font-size: 24rpx;
  color: #666666;
}
</style>
