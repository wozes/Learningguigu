我来详细介绍Vue 2和Vue 3中的Vue Router的区别和特性。

## Vue 2中的Vue Router（Vue Router 3.x）

### 安装和基本配置

```javascript
// 安装
npm install vue-router@3

// main.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

const router = new VueRouter({
  mode: 'history', // 或 'hash'
  routes
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
```

### 主要特性

- **选项式API**：使用`new VueRouter()`创建实例
- **全局守卫**：`beforeEach`、`afterEach`
- **路由懒加载**：`() => import('./components/About.vue')`
- **嵌套路由**：通过`children`属性定义

## Vue 3中的Vue Router（Vue Router 4.x）

### 安装和基本配置

```javascript
// 安装
npm install vue-router@4

// main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHistory(), // 替代了mode选项
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 主要区别对比

### 1. 创建方式

**Vue 2:**

```javascript
const router = new VueRouter({
  mode: 'history',
  routes
})
```

**Vue 3:**

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes
})
```

### 2. 历史模式API

**Vue 2:**

```javascript
mode: 'history' // 或 'hash'、'abstract'
```

**Vue 3:**

```javascript
// 更明确的API
history: createWebHistory()      // history模式
history: createWebHashHistory()  // hash模式
history: createMemoryHistory()   // memory模式（SSR）
```

### 3. 组合式API支持

**Vue 3新增:**

```javascript
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const goToAbout = () => {
      router.push('/about')
    }
    
    // 响应式的路由信息
    console.log(route.params.id)
    
    return { goToAbout }
  }
}
```

### 4. 导航守卫改进

**Vue 3中的新特性:**

```javascript
// 组合式API中使用导航守卫
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

export default {
  setup() {
    onBeforeRouteLeave((to, from) => {
      // 离开守卫逻辑
    })
    
    onBeforeRouteUpdate((to, from) => {
      // 更新守卫逻辑
    })
  }
}
```

### 5. 动态路由改进

**Vue 3中更灵活的动态路由:**

```javascript
// 添加路由
router.addRoute({
  path: '/dynamic',
  component: DynamicComponent
})

// 删除路由
router.removeRoute('routeName')

// 检查路由是否存在
router.hasRoute('routeName')
```

### 6. TypeScript支持

Vue Router 4提供了更好的TypeScript支持：

```typescript
import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]
```

### 7. 新的导航API

**Vue 3中的改进:**

```javascript
// 更强大的导航控制
router.push({
  name: 'user',
  params: { id: '123' },
  query: { tab: 'profile' }
})

// 支持Promise
await router.push('/about')
```

## 实际使用示例## 迁移注意事项

从Vue Router 3迁移到Vue Router 4时需要注意：

1. **Breaking Changes:**
    
    - `mode`选项改为`history`选项
    - 导航守卫中的`next()`参数变为可选
    - 一些API名称变更
2. **新功能优势:**
    
    - 更好的TypeScript支持
    - 组合式API集成
    - 更灵活的动态路由管理
    - 改进的导航控制
3. **性能改进:**
    
    - 更小的bundle大小
    - 更好的tree-shaking支持
    - 优化的路由匹配算法

Vue Router 4是专为Vue 3设计的，提供了更现代化的API和更好的开发体验，同时保持了与Vue Router 3相似的核心概念，使迁移相对平滑。