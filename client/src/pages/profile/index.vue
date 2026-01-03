<template>
  <view class="profile-page">
    <view class="user-card">
      <view class="avatar">{{ userInfo.nickname?.charAt(0) || '?' }}</view>
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickname || '未登录' }}</text>
        <text class="email">{{ userInfo.email || '' }}</text>
      </view>
    </view>

    <view class="stats-section">
      <view class="section-title">学习统计</view>
      <view class="stats-grid">
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
          <text class="stat-value">{{ masteryRate }}%</text>
          <text class="stat-label">掌握率</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-item" @click="goToSearch">
        <text class="menu-icon">🔍</text>
        <text class="menu-text">搜索单词</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于应用</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="handleLogout">
        <text class="menu-icon">🚪</text>
        <text class="menu-text">退出登录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="version">
      <text>版本 1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { api, clearToken } from '@/api';

const userInfo = reactive({
  nickname: '',
  email: '',
});

const stats = reactive({
  total: 0,
  known: 0,
  learning: 0,
  unknown: 0,
});

const masteryRate = computed(() => {
  if (stats.total === 0) return 0;
  return Math.round((stats.known / stats.total) * 100);
});

onMounted(async () => {
  try {
    // 获取用户信息
    const profileRes = await api.auth.getProfile();
    if (profileRes.data) {
      userInfo.nickname = profileRes.data.nickname;
      userInfo.email = profileRes.data.email;
    }

    // 获取学习统计
    const progressRes = await api.word.getProgress();
    if (progressRes.data) {
      Object.assign(stats, progressRes.data);
    }
  } catch (error) {
    console.error(error);
  }
});

const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/index' });
};

const showAbout = () => {
  uni.showModal({
    title: '关于应用',
    content: '英语学习 App\n帮助你高效记忆英语单词\n\n功能特点：\n• 单词发音与音标\n• 智能复习提醒\n• 进度同步',
    showCancel: false,
  });
};

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        clearToken();
        uni.reLaunch({ url: '/pages/login/index' });
      }
    },
  });
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.user-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  padding: 60rpx 40rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #ffffff;
  font-weight: bold;
  margin-right: 32rpx;
}

.user-info {
  flex: 1;
}

.nickname {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.email {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stats-section {
  background: #ffffff;
  margin: 32rpx;
  border-radius: 20rpx;
  padding: 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 24rpx;
}

.stats-grid {
  display: flex;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #4F46E5;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
}

.menu-section {
  background: #ffffff;
  margin: 32rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #1a1a1a;
}

.menu-arrow {
  font-size: 36rpx;
  color: #CCCCCC;
}

.version {
  text-align: center;
  padding: 40rpx;
  color: #999999;
  font-size: 24rpx;
}
</style>
