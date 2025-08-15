# Axios 完整使用指南

## 什么是 Axios

Axios 是一个基于 Promise 的 HTTP 客户端，可以在浏览器和 Node.js 中使用。它是目前最流行的 JavaScript HTTP 请求库之一，提供了丰富的功能和简洁的 API。

## 安装 Axios

```bash
# 使用 npm
npm install axios

# 使用 yarn
yarn add axios

# 使用 CDN
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

## 基本用法

### 1. 导入 Axios

```javascript
// ES6 模块语法
import axios from 'axios';

// CommonJS 语法
const axios = require('axios');
```

### 2. 发送 GET 请求

```javascript
// 基本 GET 请求
axios.get('https://api.example.com/users')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('请求失败:', error);
  });

// 使用 async/await
async function fetchUsers() {
  try {
    const response = await axios.get('https://api.example.com/users');
    console.log(response.data);
  } catch (error) {
    console.error('请求失败:', error);
  }
}
```

### 3. 发送 POST 请求

```javascript
// 发送 POST 请求
axios.post('https://api.example.com/users', {
  name: '张三',
  email: 'zhangsan@example.com'
})
.then(response => {
  console.log('用户创建成功:', response.data);
})
.catch(error => {
  console.error('创建失败:', error);
});

// 使用 async/await
async function createUser() {
  try {
    const response = await axios.post('https://api.example.com/users', {
      name: '李四',
      email: 'lisi@example.com'
    });
    console.log('用户创建成功:', response.data);
  } catch (error) {
    console.error('创建失败:', error);
  }
}
```

## HTTP 方法支持

Axios 支持所有常见的 HTTP 方法：

```javascript
// GET 请求
axios.get('/api/users');

// POST 请求
axios.post('/api/users', data);

// PUT 请求
axios.put('/api/users/1', data);

// PATCH 请求
axios.patch('/api/users/1', data);

// DELETE 请求
axios.delete('/api/users/1');

// HEAD 请求
axios.head('/api/users');

// OPTIONS 请求
axios.options('/api/users');
```

## 请求配置

### 基本配置选项

```javascript
axios({
  method: 'post',
  url: '/api/users',
  data: {
    name: '王五',
    email: 'wangwu@example.com'
  },
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  params: {
    page: 1,
    limit: 10
  }
});
```

### 常用配置参数详解

```javascript
const config = {
  // 请求的服务器 URL
  url: '/api/users',
  
  // 请求方法
  method: 'get', // 默认值
  
  // 基础 URL，会自动加在 url 前面
  baseURL: 'https://api.example.com',
  
  // 请求头
  headers: {
    'Content-Type': 'application/json'
  },
  
  // URL 参数
  params: {
    ID: 12345
  },
  
  // 请求体数据
  data: {
    firstName: 'Fred'
  },
  
  // 超时时间（毫秒）
  timeout: 1000,
  
  // 响应数据类型
  responseType: 'json', // 默认值
  
  // 最大重定向次数
  maxRedirects: 5,
  
  // 验证状态码
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  }
};
```

## 响应结构

Axios 响应对象包含以下属性：

```javascript
{
  // 服务器响应的数据
  data: {},
  
  // HTTP 状态码
  status: 200,
  
  // HTTP 状态信息
  statusText: 'OK',
  
  // 响应头
  headers: {},
  
  // 请求配置
  config: {},
  
  // 请求对象
  request: {}
}
```

## 创建实例

可以创建自定义的 axios 实例，具有特定的配置：

```javascript
// 创建实例
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here'
  }
});

// 使用实例
apiClient.get('/users')
  .then(response => {
    console.log(response.data);
  });

// 实例也可以修改配置
apiClient.defaults.headers.common['Authorization'] = 'Bearer new-token';
```

## 拦截器（Interceptors）

拦截器是 Axios 的强大功能，可以在请求发送前或响应返回后进行处理。

### 请求拦截器

```javascript
// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    console.log('发送请求:', config);
    
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加时间戳防止缓存
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
```

### 响应拦截器

```javascript
// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数
    console.log('收到响应:', response);
    
    // 对响应数据做点什么
    return response.data; // 直接返回数据部分
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数
    console.error('响应错误:', error);
    
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          window.location.href = '/login';
          break;
        case 403:
          alert('没有权限访问');
          break;
        case 404:
          alert('请求的资源不存在');
          break;
        case 500:
          alert('服务器内部错误');
          break;
        default:
          alert('请求失败');
      }
    } else if (error.request) {
      alert('网络错误，请检查网络连接');
    } else {
      alert('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);
```

### 移除拦截器

```javascript
const myInterceptor = axios.interceptors.request.use(function () {/*...*/});
axios.interceptors.request.eject(myInterceptor);
```

## 错误处理

### 基本错误处理

```javascript
axios.get('/api/users')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    if (error.response) {
      // 服务器返回错误状态码
      console.log('错误状态:', error.response.status);
      console.log('错误数据:', error.response.data);
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.log('网络错误:', error.request);
    } else {
      // 请求配置错误
      console.log('配置错误:', error.message);
    }
  });
```

### 详细错误处理

```javascript
async function handleRequest() {
  try {
    const response = await axios.get('/api/users');
    return response.data;
  } catch (error) {
    // 详细的错误处理
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    };
    
    console.error('请求失败详情:', errorInfo);
    throw error;
  }
}
```

## 取消请求

### 使用 AbortController（推荐）

```javascript
// 创建 AbortController
const controller = new AbortController();

// 发送请求
axios.get('/api/users', {
  signal: controller.signal
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  if (axios.isCancel(error)) {
    console.log('请求被取消:', error.message);
  } else {
    console.error('请求错误:', error);
  }
});

// 取消请求
controller.abort();
```

### 使用 CancelToken（已废弃但仍可用）

```javascript
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('/api/users', {
  cancelToken: source.token
})
.catch(function (thrown) {
  if (axios.isCancel(thrown)) {
    console.log('请求被取消:', thrown.message);
  } else {
    // 处理其他错误
  }
});

// 取消请求
source.cancel('操作被用户取消');
```

## 并发请求

```javascript
// 同时发送多个请求
function getAllData() {
  const userRequest = axios.get('/api/users');
  const postsRequest = axios.get('/api/posts');
  const commentsRequest = axios.get('/api/comments');
  
  return Promise.all([userRequest, postsRequest, commentsRequest])
    .then(responses => {
      const [users, posts, comments] = responses;
      return {
        users: users.data,
        posts: posts.data,
        comments: comments.data
      };
    });
}

// 使用 async/await
async function getAllDataAsync() {
  try {
    const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
      axios.get('/api/users'),
      axios.get('/api/posts'),
      axios.get('/api/comments')
    ]);
    
    return {
      users: usersResponse.data,
      posts: postsResponse.data,
      comments: commentsResponse.data
    };
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
}
```

## 文件上传

### 上传单个文件

```javascript
function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', '文件描述');
  
  return axios.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`上传进度: ${percentCompleted}%`);
    }
  });
}

// 使用示例
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadFile(file)
      .then(response => {
        console.log('上传成功:', response.data);
      })
      .catch(error => {
        console.error('上传失败:', error);
      });
  }
});
```

### 上传多个文件

```javascript
function uploadMultipleFiles(files) {
  const formData = new FormData();
  
  // 添加多个文件
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  return axios.post('/api/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`批量上传进度: ${percentCompleted}%`);
    }
  });
}
```

## 下载文件

```javascript
// 下载文件
async function downloadFile(url, filename) {
  try {
    const response = await axios.get(url, {
      responseType: 'blob', // 重要：指定响应类型为 blob
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`下载进度: ${percentCompleted}%`);
      }
    });
    
    // 创建下载链接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.click();
    
    // 清理
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('下载失败:', error);
  }
}

// 使用示例
downloadFile('/api/download/report.pdf', 'report.pdf');
```

## 实际项目中的最佳实践

### 1. 创建 API 服务类

```javascript
// api/apiService.js
import axios from 'axios';

class ApiService {
  constructor() {
    // 创建 axios 实例
    this.client = axios.create({
      baseURL: process.env.VUE_APP_API_BASE_URL || 'https://api.example.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 设置拦截器
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }
  
  handleError(error) {
    if (error.response?.status === 401) {
      // 清除token并跳转到登录页
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  }
  
  // GET 请求
  get(url, params = {}) {
    return this.client.get(url, { params });
  }
  
  // POST 请求
  post(url, data) {
    return this.client.post(url, data);
  }
  
  // PUT 请求
  put(url, data) {
    return this.client.put(url, data);
  }
  
  // DELETE 请求
  delete(url) {
    return this.client.delete(url);
  }
}

export default new ApiService();
```

### 2. 用户相关 API

```javascript
// api/userApi.js
import apiService from './apiService';

export const userApi = {
  // 获取用户列表
  getUsers(params = {}) {
    return apiService.get('/users', params);
  },
  
  // 获取单个用户
  getUser(id) {
    return apiService.get(`/users/${id}`);
  },
  
  // 创建用户
  createUser(userData) {
    return apiService.post('/users', userData);
  },
  
  // 更新用户
  updateUser(id, userData) {
    return apiService.put(`/users/${id}`, userData);
  },
  
  // 删除用户
  deleteUser(id) {
    return apiService.delete(`/users/${id}`);
  },
  
  // 用户登录
  login(credentials) {
    return apiService.post('/auth/login', credentials);
  },
  
  // 用户注册
  register(userData) {
    return apiService.post('/auth/register', userData);
  }
};
```

### 3. 在 Vue 组件中使用

```javascript
// components/UserList.vue
<template>
  <div>
    <h2>用户列表</h2>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </div>
    </div>
  </div>
</template>

<script>
import { userApi } from '@/api/userApi';

export default {
  data() {
    return {
      users: [],
      loading: false
    };
  },
  
  async created() {
    await this.fetchUsers();
  },
  
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        this.users = await userApi.getUsers({ page: 1, limit: 20 });
      } catch (error) {
        console.error('获取用户列表失败:', error);
        this.$message.error('获取用户列表失败');
      } finally {
        this.loading = false;
      }
    },
    
    async deleteUser(userId) {
      try {
        await userApi.deleteUser(userId);
        this.$message.success('删除成功');
        await this.fetchUsers(); // 重新获取列表
      } catch (error) {
        console.error('删除用户失败:', error);
        this.$message.error('删除失败');
      }
    }
  }
};
</script>
```

## 常见问题和解决方案

### 1. CORS 跨域问题

```javascript
// 在开发环境中，通常通过代理解决
// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
};
```

### 2. 请求重复发送

```javascript
// 使用请求缓存避免重复请求
const requestCache = new Map();

function getCacheKey(config) {
  return `${config.method}_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`;
}

axios.interceptors.request.use((config) => {
  const cacheKey = getCacheKey(config);
  
  if (requestCache.has(cacheKey)) {
    // 如果有相同的请求正在进行，返回相同的 Promise
    return requestCache.get(cacheKey);
  }
  
  // 创建新的请求 Promise
  const requestPromise = axios.request(config);
  requestCache.set(cacheKey, requestPromise);
  
  // 请求完成后清除缓存
  requestPromise.finally(() => {
    requestCache.delete(cacheKey);
  });
  
  return config;
});
```

### 3. 全局 Loading 状态管理

```javascript
// 全局 loading 管理
let loadingCount = 0;

axios.interceptors.request.use((config) => {
  loadingCount++;
  // 显示 loading
  showLoading();
  return config;
});

axios.interceptors.response.use(
  (response) => {
    loadingCount--;
    if (loadingCount === 0) {
      hideLoading();
    }
    return response;
  },
  (error) => {
    loadingCount--;
    if (loadingCount === 0) {
      hideLoading();
    }
    return Promise.reject(error);
  }
);

function showLoading() {
  // 显示全局 loading 组件
}

function hideLoading() {
  // 隐藏全局 loading 组件
}
```

## 总结

Axios 是一个功能强大、使用简单的 HTTP 客户端库。掌握以下核心概念和功能对前端开发非常重要：

1. **基本请求方法**：GET、POST、PUT、DELETE 等
2. **请求配置**：URL、参数、头部、超时等
3. **响应处理**：数据提取、状态码检查、错误处理
4. **拦截器**：请求前处理、响应后处理
5. **实例创建**：自定义配置、复用性
6. **错误处理**：网络错误、HTTP 错误、配置错误
7. **文件操作**：上传、下载、进度监控
8. **高级功能**：并发请求、请求取消、请求缓存

在实际项目中，建议封装一个统一的 API 服务类，配置好拦截器和错误处理，这样可以让代码更加整洁和可维护。