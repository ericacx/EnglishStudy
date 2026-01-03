<template>
  <view class="login-page">
    <view class="header">
      <view class="logo">📚</view>
      <text class="title">英语学习</text>
      <text class="subtitle">每天进步一点点</text>
    </view>

    <view class="form">
      <view class="form-item">
        <input
          v-model="form.email"
          type="text"
          placeholder="请输入邮箱"
          class="input"
        />
      </view>

      <view class="form-item">
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          class="input"
        />
      </view>

      <view v-if="isRegister" class="form-item">
        <input
          v-model="form.nickname"
          type="text"
          placeholder="请输入昵称"
          class="input"
        />
      </view>

      <button class="btn-primary" @click="handleSubmit" :loading="loading">
        {{ isRegister ? '注册' : '登录' }}
      </button>

      <view class="switch-mode" @click="isRegister = !isRegister">
        {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { api, setToken } from '@/api';

const isRegister = ref(false);
const loading = ref(false);

const form = reactive({
  email: '',
  password: '',
  nickname: '',
});

const handleSubmit = async () => {
  if (!form.email || !form.password) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }

  if (isRegister.value && !form.nickname) {
    uni.showToast({ title: '请输入昵称', icon: 'none' });
    return;
  }

  loading.value = true;

  try {
    const res = isRegister.value
      ? await api.auth.register(form)
      : await api.auth.login(form);

    if (res.data?.token) {
      setToken(res.data.token);
      uni.switchTab({ url: '/pages/home/index' });
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  padding: 100rpx 60rpx;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 32rpx;
}

.input {
  width: 100%;
  height: 96rpx;
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 0 32rpx;
  font-size: 32rpx;
}

.btn-primary {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  border: none;
  border-radius: 16rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.switch-mode {
  text-align: center;
  color: #4F46E5;
  font-size: 28rpx;
  margin-top: 32rpx;
}
</style>
