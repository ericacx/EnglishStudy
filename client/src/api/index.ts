const BASE_URL = 'http://139.59.97.154:3001/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}

interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
}

// 获取 token
function getToken(): string {
  return uni.getStorageSync('token') || '';
}

// 设置 token
export function setToken(token: string): void {
  uni.setStorageSync('token', token);
}

// 清除 token
export function clearToken(): void {
  uni.removeStorageSync('token');
}

// 请求封装
export function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const token = getToken();

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header,
      },
      success: (res: any) => {
        const data = res.data as ApiResponse<T>;

        if (data.code === 401) {
          // Token 失效，跳转登录
          clearToken();
          uni.reLaunch({ url: '/pages/login/index' });
          reject(new Error('请先登录'));
          return;
        }

        if (data.code !== 200) {
          uni.showToast({
            title: data.message || '请求失败',
            icon: 'none',
          });
          reject(new Error(data.message));
          return;
        }

        resolve(data);
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
}

// API 方法
export const api = {
  // 用户相关
  auth: {
    login: (data: { email: string; password: string }) =>
      request({ url: '/auth/login', method: 'POST', data }),

    register: (data: { email: string; password: string; nickname: string }) =>
      request({ url: '/auth/register', method: 'POST', data }),

    getProfile: () => request({ url: '/auth/profile' }),

    updateProfile: (data: { nickname?: string; avatar?: string }) =>
      request({ url: '/auth/profile', method: 'PUT', data }),
  },

  // 单词相关
  word: {
    search: (word: string) => request({ url: `/word/search?word=${encodeURIComponent(word)}` }),

    add: (data: { word: string; wordbookId?: string }) =>
      request({ url: '/word/add', method: 'POST', data }),

    list: () => request({ url: '/word/list' }),

    getProgress: () => request({ url: '/word/progress' }),

    updateRecord: (data: { word: string; status: 'known' | 'unknown' | 'learning' }) =>
      request({ url: '/word/record', method: 'POST', data }),

    getReviewWords: (limit = 20) => request({ url: `/word/review?limit=${limit}` }),
  },

  // 词库相关
  wordbook: {
    getPreset: () => request({ url: '/wordbook/preset' }),

    getDetail: (id: string, page = 1, limit = 50) =>
      request({ url: `/wordbook/${id}?page=${page}&limit=${limit}` }),

    subscribe: (id: string) =>
      request({ url: `/wordbook/subscribe/${id}`, method: 'POST' }),

    unsubscribe: (id: string) =>
      request({ url: `/wordbook/subscribe/${id}`, method: 'DELETE' }),

    getSubscribed: () => request({ url: '/wordbook/user/subscribed' }),
  },
};

export default api;
