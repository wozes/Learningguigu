# Vue3项目从零搭建完整指南

## 1. 初始化项目

### 创建项目

```bash
# 使用Vite创建Vue3项目
npm create vue@latest my-vue3-project

# 进入项目目录
cd my-vue3-project

# 安装依赖
npm install
```

创建项目时的选择：

- ✅ Add TypeScript? (推荐选择Yes)
- ✅ Add JSX Support? (根据需要)
- ✅ Add Vue Router for Single Page Application development? → Yes
- ✅ Add Pinia for state management? → Yes
- ✅ Add Vitest for Unit testing? → Yes
- ✅ Add an End-to-End Testing Solution? (可选)
- ✅ Add ESLint for code quality? → Yes
- ✅ Add Prettier for code formatting? → Yes

## 2. 安装核心依赖

### UI组件库 - Element Plus

```bash
# 安装Element Plus
npm install element-plus

# 安装图标库
npm install @element-plus/icons-vue
```

### HTTP请求库 - Axios

```bash
npm install axios
```

### 国际化 - Vue I18n

```bash
npm install vue-i18n@9
```

### CSS预处理器 - SCSS

```bash
npm install -D sass
```

## 3. 项目配置

### 3.1 Vite配置 (vite.config.js)

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/variables.scss" as *;'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  }
})
```

### 3.2 ESLint配置 (.eslintrc.cjs)

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off'
  }
}
```

### 3.3 Prettier配置 (.prettierrc)

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "none",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## 4. 项目结构搭建

### 4.1 创建目录结构

```
src/
├── api/              # API接口
├── assets/           # 静态资源
├── components/       # 全局组件
├── composables/      # 组合式函数
├── layouts/          # 布局组件
├── locales/          # 国际化文件
├── router/           # 路由配置
├── stores/           # Pinia状态管理
├── styles/           # 全局样式
├── utils/            # 工具函数
├── views/            # 页面组件
├── App.vue
└── main.js
```

### 4.2 主入口文件配置 (src/main.js)

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'
import { messages } from './locales'
import '@/styles/index.scss'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 国际化配置
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages
})

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)

app.mount('#app')
```

## 5. 核心功能配置

### 5.1 路由配置 (src/router/index.js)

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

### 5.2 Pinia状态管理 (src/stores/user.js)

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)

  const login = async (credentials) => {
    try {
      // API调用登录
      const response = await api.login(credentials)
      user.value = response.data.user
      token.value = response.data.token
      localStorage.setItem('token', token.value)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout
  }
})
```

### 5.3 Axios配置 (src/utils/request.js)

```javascript
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    const { response } = error
    if (response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(response?.data?.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default request
```

### 5.4 国际化配置 (src/locales/index.js)

```javascript
import zhCN from './zh-CN.json'
import en from './en.json'

export const messages = {
  'zh-CN': zhCN,
  en
}

export const availableLocales = [
  { code: 'zh-CN', name: '中文' },
  { code: 'en', name: 'English' }
]
```

## 6. 样式配置

### 6.1 全局样式 (src/styles/index.scss)

```scss
@import './variables.scss';
@import './mixins.scss';
@import './reset.scss';

// 全局样式
body {
  font-family: $font-family;
  font-size: $font-size-base;
  color: $text-color;
  background-color: $bg-color;
}

// Element Plus样式覆盖
.el-button {
  border-radius: $border-radius;
}
```

### 6.2 样式变量 (src/styles/variables.scss)

```scss
// 颜色变量
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;

// 文字颜色
$text-color: #303133;
$text-color-regular: #606266;
$text-color-secondary: #909399;

// 背景颜色
$bg-color: #ffffff;
$bg-color-page: #f2f3f5;

// 字体
$font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
$font-size-base: 14px;

// 边框
$border-radius: 4px;
$border-color: #dcdfe6;
```

## 7. 环境配置

### 7.1 开发环境 (.env.development)

```env
VITE_APP_TITLE=Vue3项目开发环境
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_ENV=development
```

### 7.2 生产环境 (.env.production)

```env
VITE_APP_TITLE=Vue3项目
VITE_API_BASE_URL=https://api.example.com
VITE_APP_ENV=production
```

## 8. 测试配置

### 8.1 Vitest配置 (vitest.config.js)

```javascript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

## 9. 常用脚本命令 (package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix",
    "format": "prettier --write src/"
  }
}
```

## 10. 启动项目

```bash
# 开发环境启动
npm run dev

# 构建生产版本
npm run build

# 本地预览构建结果
npm run preview

# 运行测试
npm run test

# 代码检查和格式化
npm run lint
npm run format
```

## 项目特性

✅ Vue3 + Vite 现代化开发体验
 ✅ TypeScript 支持（可选）
 ✅ Vue Router 路由管理
 ✅ Pinia 状态管理
 ✅ Element Plus UI组件库
 ✅ Axios HTTP请求封装
 ✅ Vue I18n 国际化支持
 ✅ SCSS 样式预处理
 ✅ ESLint + Prettier 代码规范
 ✅ Vitest 单元测试
 ✅ 路由守卫和权限控制
 ✅ 环境配置管理

现在你就有了一个功能完整的Vue3项目架构！