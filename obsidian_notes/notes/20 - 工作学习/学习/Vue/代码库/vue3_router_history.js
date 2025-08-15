// Vue 3 Router 4 的历史模式 API
import { 
  createRouter, 
  createWebHistory, 
  createWebHashHistory, 
  createMemoryHistory 
} from 'vue-router'

// 1. HTML5 History 模式 (推荐)
const router = createRouter({
  history: createWebHistory('/base-path/'), // 可选的基础路径
  routes
})
// URL: https://example.com/base-path/user/123

// 2. Hash 模式
const router = createRouter({
  history: createWebHashHistory('/base-path/'),
  routes
})
// URL: https://example.com/base-path/#/user/123

// 3. Memory 模式 (用于SSR或测试)
const router = createRouter({
  history: createMemoryHistory('/base-path/'),
  routes
})

// 4. 不同环境的配置
const router = createRouter({
  history: import.meta.env.SSR 
    ? createMemoryHistory() 
    : createWebHistory(),
  routes
})

// 5. 基于环境变量的配置
const router = createRouter({
  history: process.env.NODE_ENV === 'production'
    ? createWebHistory('/my-app/')
    : createWebHistory(),
  routes
})

// 对比 Vue 2 Router 3
/*
// Vue 2 方式
const router = new VueRouter({
  mode: 'history', // 或 'hash', 'abstract'
  base: '/base-path/',
  routes
})

// Vue 3 方式 - 更明确和类型安全
const router = createRouter({
  history: createWebHistory('/base-path/'),
  routes
})
*/