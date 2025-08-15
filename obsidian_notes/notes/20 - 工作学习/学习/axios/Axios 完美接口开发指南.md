# Axios 完美接口开发指南

基于 Vue 3 + TypeScript + Element Plus + Pinia 技术栈

## 目录

- [基础配置](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#基础配置)
- [类型定义](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#类型定义)
- [HTTP 客户端封装](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#http-客户端封装)
- [接口函数设计](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#接口函数设计)
- [错误处理](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#错误处理)
- [最佳实践](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#最佳实践)

## 基础配置

### 1. 安装依赖

```bash
npm install axios
npm install @types/axios -D  # TypeScript 类型定义
```

### 2. 环境变量配置

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:3000/api

// .env.production  
VITE_API_BASE_URL=https://api.yourapp.com
```

## 类型定义

### 1. 通用响应类型

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp: number;
}

export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Category {
  id: number;
  name: string;
  parent_id?: number;
  level: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
}
```

### 2. 请求参数类型

```typescript
// types/request.ts
export interface GetCategoriesParams {
  parent_id?: number;
  level?: number;
  is_active?: boolean;
  keyword?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
```

## HTTP 客户端封装

### 1. 创建 Axios 实例

```typescript
// utils/http.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

// 创建 axios 实例
const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
httpClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加认证token
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${userStore.token}`,
      };
    }

    // 添加请求时间戳（防止缓存）
    if (config.method === 'get' && config.params) {
      config.params._t = Date.now();
    }

    console.log('Request:', config);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    
    // 根据业务逻辑处理响应
    if (data.code !== 200 && data.code !== 0) {
      ElMessage.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    
    console.log('Response:', response);
    return data; // 直接返回数据部分
  },
  (error) => {
    console.error('Response Error:', error);
    
    // 统一错误处理
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录');
          // 清除token并跳转登录
          const userStore = useUserStore();
          userStore.logout();
          break;
        case 403:
          ElMessage.error('没有权限访问');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        default:
          ElMessage.error(response.data?.message || '请求失败');
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试');
    } else {
      ElMessage.error('网络错误，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default httpClient;
```

## 接口函数设计

### 1. 分类接口模块

```typescript
// api/category.ts
import httpClient from '@/utils/http';
import type { Category, GetCategoriesParams, ApiResponse } from '@/types';

export const categoryApi = {
  /**
   * 获取分类列表
   * @param params 查询参数
   * @returns Promise<Category[]>
   */
  getCategories: async (params?: GetCategoriesParams): Promise<Category[]> => {
    try {
      const response = await httpClient.get<ApiResponse<{ categories: Category[] }>>(
        '/public/categories',
        {
          params: {
            parent_id: params?.parent_id,
            level: params?.level,
            is_active: params?.is_active ?? true,
            keyword: params?.keyword,
          },
        }
      );
      
      console.log('商品分类列表响应 =>', response);
      return response.data?.categories || [];
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取分类详情
   * @param id 分类ID
   * @returns Promise<Category>
   */
  getCategoryById: async (id: number): Promise<Category> => {
    try {
      const response = await httpClient.get<ApiResponse<Category>>(
        `/public/categories/${id}`
      );
      
      return response.data;
    } catch (error) {
      console.error('获取分类详情失败:', error);
      throw error;
    }
  },

  /**
   * 创建分类
   * @param category 分类数据
   * @returns Promise<Category>
   */
  createCategory: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
    try {
      const response = await httpClient.post<ApiResponse<Category>>(
        '/admin/categories',
        category
      );
      
      return response.data;
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  },

  /**
   * 更新分类
   * @param id 分类ID
   * @param category 更新数据
   * @returns Promise<Category>
   */
  updateCategory: async (id: number, category: Partial<Category>): Promise<Category> => {
    try {
      const response = await httpClient.put<ApiResponse<Category>>(
        `/admin/categories/${id}`,
        category
      );
      
      return response.data;
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  },

  /**
   * 删除分类
   * @param id 分类ID
   * @returns Promise<void>
   */
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(`/admin/categories/${id}`);
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  },
};
```

### 2. 在组件中使用

```typescript
// components/CategoryList.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { categoryApi } from '@/api/category';
import type { Category } from '@/types';

const categories = ref<Category[]>([]);
const loading = ref(false);

const fetchCategories = async (parentId?: number) => {
  try {
    loading.value = true;
    categories.value = await categoryApi.getCategories({ 
      parent_id: parentId,
      is_active: true 
    });
  } catch (error) {
    // 错误已在拦截器中统一处理
    console.error('获取分类失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>
```

## 错误处理

### 1. 全局错误处理

```typescript
// utils/errorHandler.ts
import { ElMessage, ElNotification } from 'element-plus';

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

export const handleApiError = (error: any): void => {
  if (error.response) {
    // HTTP 错误状态码
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        ElMessage.error(data.message || '请求参数错误');
        break;
      case 401:
        ElMessage.error('登录已过期');
        // 跳转登录页
        break;
      case 403:
        ElMessage.error('没有权限访问');
        break;
      case 404:
        ElMessage.error('请求的资源不存在');
        break;
      case 422:
        // 表单验证错误
        if (data.errors) {
          Object.values(data.errors).forEach((messages: any) => {
            ElMessage.error(messages[0]);
          });
        }
        break;
      case 500:
        ElNotification.error({
          title: '服务器错误',
          message: '请稍后重试或联系管理员',
        });
        break;
      default:
        ElMessage.error(data.message || '未知错误');
    }
  } else if (error.code === 'ECONNABORTED') {
    ElMessage.error('请求超时');
  } else {
    ElMessage.error('网络错误');
  }
};
```

### 2. 业务错误处理

```typescript
// composables/useApi.ts
import { ref } from 'vue';
import { handleApiError } from '@/utils/errorHandler';

export const useApi = <T>(apiFunction: (...args: any[]) => Promise<T>) => {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const execute = async (...args: any[]): Promise<T | null> => {
    try {
      loading.value = true;
      error.value = null;
      
      const result = await apiFunction(...args);
      data.value = result;
      
      return result;
    } catch (err: any) {
      error.value = err;
      handleApiError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    loading,
    error,
    execute,
  };
};
```

## 最佳实践

### 1. 接口命名规范

- 使用语义化的函数名：`getCategories`、`createCategory`
- 参数使用可选类型：`parentId?: number`
- 返回类型明确：`Promise<Category[]>`

### 2. 错误处理

- 统一在拦截器中处理公共错误
- 业务层捕获特定错误并给出友好提示
- 使用 try-catch 包装所有异步请求

### 3. 类型安全

- 定义完整的 TypeScript 类型
- 使用泛型提高复用性
- 参数和返回值都要有明确类型

### 4. 日志记录

- 请求和响应都要有日志记录
- 生产环境可以选择性记录
- 错误信息要详细记录便于调试

### 5. 缓存策略

```typescript
// utils/cache.ts
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

export const getCachedData = (key: string) => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

export const setCachedData = (key: string, data: any) => {
  apiCache.set(key, { data, timestamp: Date.now() });
};
```

### 6. 请求取消

```typescript
// 在组件中使用 AbortController
const controller = new AbortController();

const fetchData = async () => {
  try {
    const response = await httpClient.get('/api/data', {
      signal: controller.signal,
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('请求已取消');
    } else {
      throw error;
    }
  }
};

// 组件卸载时取消请求
onUnmounted(() => {
  controller.abort();
});
```

## 总结

完美的 Axios 接口应该具备：

1. **完整的类型定义** - 确保类型安全
2. **统一的错误处理** - 提供一致的用户体验
3. **合理的拦截器** - 处理认证、日志等公共逻辑
4. **清晰的代码结构** - 便于维护和扩展
5. **良好的文档注释** - 提高代码可读性

通过以上规范，你可以构建出健壮、可维护的接口层，为整个应用提供稳定的数据服务。