<template>
  <view class="word-card" :class="{ flipped: isFlipped }">
    <view class="card-inner" @click="toggleFlip">
      <!-- 正面：单词 -->
      <view class="card-front">
        <view class="word-main">
          <text class="word">{{ word.word }}</text>
          <view class="phonetic-row">
            <text class="phonetic" v-if="word.phonetic?.us">
              🇺🇸 {{ word.phonetic.us }}
            </text>
            <text class="phonetic" v-if="word.phonetic?.uk">
              🇬🇧 {{ word.phonetic.uk }}
            </text>
          </view>
        </view>

        <view class="audio-buttons">
          <button class="audio-btn" @click.stop="playAudio('us')" v-if="word.audioUrl?.us">
            🔊 美音
          </button>
          <button class="audio-btn" @click.stop="playAudio('uk')" v-if="word.audioUrl?.uk">
            🔊 英音
          </button>
        </view>

        <text class="flip-hint">点击查看释义</text>
      </view>

      <!-- 背面：释义 -->
      <view class="card-back">
        <view class="definitions">
          <text class="definition" v-for="(def, index) in word.definitions" :key="index">
            {{ def }}
          </text>
        </view>

        <view class="examples" v-if="word.examples?.length">
          <text class="example-title">例句</text>
          <text class="example" v-for="(ex, index) in word.examples" :key="index">
            {{ ex }}
          </text>
        </view>

        <text class="flip-hint">点击返回</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons" v-if="showActions">
      <button class="action-btn unknown" @click="$emit('unknown', word)">
        😕 不认识
      </button>
      <button class="action-btn known" @click="$emit('known', word)">
        😊 认识
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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

const props = defineProps<{
  word: WordInfo;
  showActions?: boolean;
}>();

defineEmits<{
  (e: 'known', word: WordInfo): void;
  (e: 'unknown', word: WordInfo): void;
}>();

const isFlipped = ref(false);
const audioContext = ref<any>(null);

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value;
};

const playAudio = (type: 'us' | 'uk') => {
  const url = props.word.audioUrl?.[type];
  if (!url) return;

  // 停止之前的播放
  if (audioContext.value) {
    audioContext.value.stop();
  }

  // 创建音频上下文
  audioContext.value = uni.createInnerAudioContext();
  audioContext.value.src = url;
  audioContext.value.play();

  audioContext.value.onError((err: any) => {
    console.error('Audio play error:', err);
    uni.showToast({ title: '播放失败', icon: 'none' });
  });
};
</script>

<style scoped>
.word-card {
  perspective: 1000px;
  margin-bottom: 32rpx;
}

.card-inner {
  position: relative;
  width: 100%;
  min-height: 400rpx;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.word-card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  min-height: 400rpx;
  backface-visibility: hidden;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.card-back {
  transform: rotateY(180deg);
}

.word-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.word {
  font-size: 64rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.phonetic-row {
  display: flex;
  gap: 24rpx;
}

.phonetic {
  font-size: 28rpx;
  color: #666666;
}

.audio-buttons {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin: 24rpx 0;
}

.audio-btn {
  background: #F0F0FF;
  color: #4F46E5;
  border: none;
  border-radius: 40rpx;
  padding: 16rpx 32rpx;
  font-size: 26rpx;
}

.flip-hint {
  text-align: center;
  font-size: 24rpx;
  color: #999999;
  margin-top: 16rpx;
}

.definitions {
  flex: 1;
}

.definition {
  display: block;
  font-size: 32rpx;
  color: #1a1a1a;
  margin-bottom: 16rpx;
  line-height: 1.6;
}

.examples {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #eeeeee;
}

.example-title {
  display: block;
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
}

.example {
  display: block;
  font-size: 26rpx;
  color: #888888;
  line-height: 1.6;
  margin-bottom: 8rpx;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.action-btn.unknown {
  background: #FEE2E2;
  color: #DC2626;
}

.action-btn.known {
  background: #DCFCE7;
  color: #16A34A;
}
</style>
