# Axios 使用指南

## 1. 什么是 Axios？

Axios 是一个基于 Promise 的 HTTP 客户端，用于浏览器和 Node.js 环境。它可以帮助我们更简单地发送异步 HTTP 请求到 REST 接口。

### 主要特点

- 支持 Promise API
- 拦截请求和响应
- 转换请求和响应数据
- 取消请求
- 自动转换 JSON 数据
- 客户端支持防御 XSRF

## 2. 安装

bash





```
npm install axios
# 或
yarn add axios
```

## 3. 基本使用

### 发送 GET 请求

javascript





```
import axios from 'axios';

// 获取所有用户
axios.get('/api/users')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('获取用户列表失败:', error);
  });
```

### 发送 POST 请求

javascript





```
// 创建新用户
axios.post('/api/users', {
    name: '张三',
    email: 'zhangsan@example.com'
  })
  .then(response => {
    console.log('用户创建成功:', response.data);
  })
  .catch(error => {
    console.error('创建用户失败:', error);
  });
```

## 4. 请求配置

### 常用配置项

javascript





```
{
  // 请求的服务器 URL
  url: '/user',
  
  // 请求方法，默认是 get
  method: 'post', // 默认
  
  // 请求头
  headers: {'X-Requested-With': 'XMLHttpRequest'},
  
  // 请求参数，会拼接到 URL 中
  params: {
    ID: 12345
  },
  
  // 请求体数据，只适用于 'PUT', 'POST', 'DELETE 和 'PATCH' 请求
  data: {
    firstName: '张',
    lastName: '三'
  },
  
  // 超时时间，单位毫秒
  timeout: 1000,
  
  // 响应数据类型，默认是 json
  responseType: 'json', // 默认
  
  // 表示跨域请求时是否需要使用凭证
  withCredentials: false, // 默认
}
```

## 5. 响应结构

javascript





```
{
  // 服务器返回的数据
  data: {},
  
  // HTTP 状态码
  status: 200,
  
  // 状态文本
  statusText: 'OK',
  
  // 响应头
  headers: {},
  
  // 请求配置
  config: {},
  
  // 请求对象
  request: {}
}
```

## 6. 创建实例

javascript





```
const instance = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});

// 使用实例
instance.get('/users')
  .then(response => console.log(response.data));
```

## 7. 拦截器

### 请求拦截器

javascript





```
// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
```

### 响应拦截器

javascript





```
// 添加响应拦截器
axios.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response.data; // 直接返回数据部分
  },
  error => {
    // 对响应错误做点什么
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          router.push('/login');
          break;
        case 404:
          // 资源不存在
          console.error('请求的资源不存在');
          break;
        // 其他状态码处理...
      }
    }
    return Promise.reject(error);
  }
);
```

## 8. 并发请求

javascript





```
function getUserAccount() {
  return axios.get('/user/12345');
}

function getUserPermissions() {
  return axios.get('/user/12345/permissions');
}

// 并发请求
Promise.all([getUserAccount(), getUserPermissions()])
  .then(([account, permissions]) => {
    // 两个请求都执行完成
    console.log(account.data, permissions.data);
  });
```

## 9. 取消请求

javascript





```
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

// 发送请求
axios.get('/user/12345', {
  cancelToken: source.token
}).catch(function(thrown) {
  if (axios.isCancel(thrown)) {
    console.log('请求已取消', thrown.message);
  } else {
    // 处理错误
  }
});

// 取消请求 (message 参数是可选的)
source.cancel('用户取消了请求');
```

## 10. 在 Vue 项目中的最佳实践

### 创建 HTTP 工具类

javascript





```
// src/utils/http.js
import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

// 创建 axios 实例
const http = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000
});

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data;
    
    // 如果自定义状态码不是 200，则判断为错误
    if (res.code !== 200) {
      ElMessage.error(res.message || 'Error');
      return Promise.reject(new Error(res.message || 'Error'));
    } else {
      return res.data; // 直接返回数据部分
    }
  },
  error => {
    // 对响应错误做点什么
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          router.push('/login');
          break;
        case 403:
          // 权限不足
          ElMessage.error('权限不足，无法访问该资源');
          break;
        case 404:
          // 资源不存在
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          // 服务器内部错误
          ElMessage.error('服务器内部错误');
          break;
        default:
          // 其他错误
          ElMessage.error(error.response.data.message || '请求失败');
      }
    }
    return Promise.reject(error);
  }
);

export default http;
```

### 在组件中使用

javascript





```
import http from '@/utils/http';

export default {
  data() {
    return {
      users: []
    };
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true;
        const response = await http.get('/users');
        this.users = response.data;
      } catch (error) {
        console.error('获取用户列表失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async createUser(userData) {
      try {
        await http.post('/users', userData);
        this.$message.success('用户创建成功');
        this.fetchUsers(); // 刷新列表
      } catch (error) {
        console.error('创建用户失败:', error);
      }
    }
  }
};
```

## 11. 常见问题

### 1. 如何处理跨域问题？

在开发环境中，可以在 

```
vue.config.js
```

 中配置代理：



javascript





```
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
};
```

### 2. 如何上传文件？

javascript





```
const formData = new FormData();
formData.append('file', file); // file 是文件对象
formData.append('name', '文件名');

const response = await http.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

### 3. 如何取消重复请求？

javascript





```
// 存储每个请求的取消函数
const pendingRequests = new Map();

// 生成请求的唯一标识
function getRequestKey(config) {
  return [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&');
}

// 添加请求
function addPendingRequest(config) {
  const requestKey = getRequestKey(config);
  config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
    if (!pendingRequests.has(requestKey)) {
      pendingRequests.set(requestKey, cancel);
    }
  });
}

// 移除请求
function removePendingRequest(config) {
  const requestKey = getRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey);
    cancel('取消重复请求');
    pendingRequests.delete(requestKey);
  }
}

// 在请求拦截器中
http.interceptors.request.use(config => {
  removePendingRequest(config); // 检查是否存在重复请求，若存在则取消
  addPendingRequest(config); // 添加当前请求
  return config;
});

// 在响应拦截器中
http.interceptors.response.use(response => {
  removePendingRequest(response.config); // 请求完成，移除
  return response;
}, error => {
  if (!axios.isCancel(error)) {
    removePendingRequest(error.config || {}); // 请求失败，移除
  }
  return Promise.reject(error);
});
```

## 12. 总结

1. 基本使用

   ：使用

    

   ```
   axios.get()
   ```

   、

   ```
   axios.post()
   ```

    

   等方法发送请求

2. **配置**：可以通过配置项自定义请求头、超时等

3. **拦截器**：使用拦截器处理请求和响应

4. **实例**：创建 axios 实例，实现不同配置的请求

5. 取消请求

   ：使用

    

   ```
   CancelToken
   ```

    

   取消请求

6. 并发请求

   ：使用

    

   ```
   Promise.all()
   ```

    

   发送并发请求

7. **错误处理**：统一处理错误，提高代码可维护性

希望这个指南能帮助你更好地理解和使用 Axios！