# Vue 3 路由管理详细指南

Vue Router 是 Vue.js 的官方路由管理器，它允许你构建单页面应用程序（SPA），通过路由管理不同的页面和视图。

## 1. Vue Router 基础

### 1.1 安装和基本配置

#### 安装 Vue Router 4

```bash
# npm
npm install vue-router@4

# yarn
yarn add vue-router@4

# pnpm
pnpm add vue-router@4
```

#### 基本路由配置

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

#### 在应用中使用路由

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.mount('#app')
```

#### App.vue 基本模板

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <!-- 导航链接 -->
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
    </nav>
    
    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<style>
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  margin-right: 20px;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b883;
}
</style>
```

### 1.2 路由导航方式

#### 声明式导航

```vue
<template>
  <!-- 基本链接 -->
  <router-link to="/about">关于页面</router-link>
  
  <!-- 命名路由 -->
  <router-link :to="{ name: 'About' }">关于页面</router-link>
  
  <!-- 带参数的路由 -->
  <router-link :to="{ path: '/user/123' }">用户详情</router-link>
  <router-link :to="{ name: 'User', params: { id: '123' } }">用户详情</router-link>
  
  <!-- 带查询参数 -->
  <router-link :to="{ path: '/search', query: { q: 'vue' } }">搜索</router-link>
  
  <!-- 带 hash -->
  <router-link :to="{ path: '/about', hash: '#team' }">关于-团队</router-link>
  
  <!-- 替换历史记录而不是推入 -->
  <router-link :to="/about" replace>关于页面</router-link>
  
  <!-- 自定义激活类名 -->
  <router-link 
    to="/about" 
    active-class="my-active-class"
    exact-active-class="my-exact-active-class"
  >
    关于页面
  </router-link>
</template>
```

#### 编程式导航

```javascript
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    
    const goToAbout = () => {
      // 字符串路径
      router.push('/about')
      
      // 路径对象
      router.push({ path: '/about' })
      
      // 命名路由
      router.push({ name: 'About' })
      
      // 带参数
      router.push({ name: 'User', params: { id: '123' } })
      
      // 带查询参数
      router.push({ path: '/search', query: { q: 'vue' } })
      
      // 带 hash
      router.push({ path: '/about', hash: '#team' })
    }
    
    const replaceToAbout = () => {
      // 替换当前历史记录
      router.replace('/about')
    }
    
    const goBack = () => {
      // 后退
      router.go(-1)
      // 或者
      router.back()
    }
    
    const goForward = () => {
      // 前进
      router.go(1)
      // 或者
      router.forward()
    }
    
    return {
      goToAbout,
      replaceToAbout,
      goBack,
      goForward
    }
  }
}
```

### 1.3 路由历史模式

#### Hash 模式（默认）

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// URL 示例: http://example.com/#/user/123
```

#### History 模式（推荐）

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// URL 示例: http://example.com/user/123
// 需要服务器配置支持
```

#### Memory 模式

```javascript
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

// 主要用于 SSR 和测试环境
```

## 2. 动态路由和路由参数

### 2.1 动态路由匹配

#### 基本动态路由

```javascript
const routes = [
  // 动态段以冒号开始
  { path: '/user/:id', component: User },
  
  // 多个动态段
  { path: '/user/:id/post/:postId', component: Post },
  
  // 可选参数
  { path: '/user/:id?', component: User },
  
  // 零或多个参数
  { path: '/user/:id*', component: User },
  
  // 一个或多个参数
  { path: '/user/:id+', component: User }
]
```

#### 在组件中获取路由参数

```vue
<!-- User.vue -->
<template>
  <div>
    <h2>用户 ID: {{ $route.params.id }}</h2>
    <p>查询参数: {{ $route.query }}</p>
    <p>完整路径: {{ $route.fullPath }}</p>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

export default {
  setup() {
    const route = useRoute()
    
    // 响应式地获取参数
    const userId = computed(() => route.params.id)
    const query = computed(() => route.query)
    
    return {
      userId,
      query
    }
  }
}
</script>
```

### 2.2 响应路由参数变化

#### 使用 watch 监听路由变化

```javascript
import { useRoute } from 'vue-router'
import { watch, ref } from 'vue'

export default {
  setup() {
    const route = useRoute()
    const userData = ref(null)
    
    const fetchUser = async (id) => {
      console.log('获取用户数据:', id)
      // 模拟 API 调用
      userData.value = { id, name: `用户${id}` }
    }
    
    // 监听路由参数变化
    watch(
      () => route.params.id,
      (newId) => {
        if (newId) {
          fetchUser(newId)
        }
      },
      { immediate: true }
    )
    
    return {
      userData
    }
  }
}
```

#### 使用 beforeRouteUpdate 导航守卫

```javascript
import { onBeforeRouteUpdate } from 'vue-router'

export default {
  setup() {
    const userData = ref(null)
    
    const fetchUser = async (id) => {
      userData.value = { id, name: `用户${id}` }
    }
    
    // 在路由更新时调用
    onBeforeRouteUpdate(async (to, from) => {
      if (to.params.id !== from.params.id) {
        await fetchUser(to.params.id)
      }
    })
    
    return {
      userData
    }
  }
}
```

### 2.3 路由参数验证

#### 自定义参数匹配

```javascript
const routes = [
  {
    path: '/user/:id(\\d+)', // 只匹配数字
    component: User,
    props: true
  },
  {
    path: '/user/:name([a-zA-Z]+)', // 只匹配字母
    component: User,
    props: true
  },
  {
    // 自定义正则表达式
    path: '/product/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
    component: Product
  }
]
```

#### Props 模式

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    props: true // 将参数作为 props 传递给组件
  },
  {
    path: '/user/:id',
    component: User,
    props: (route) => ({ 
      id: route.params.id,
      query: route.query.q 
    }) // 函数模式
  },
  {
    path: '/promotion/from-newsletter',
    component: Promotion,
    props: { newsletterPopup: false } // 静态 props
  }
]
```

### 2.4 嵌套路由

#### 基本嵌套路由配置

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      // 空路径表示默认子路由
      { path: '', component: UserHome },
      
      // /user/:id/profile
      { path: 'profile', component: UserProfile },
      
      // /user/:id/posts
      { path: 'posts', component: UserPosts },
      
      // 嵌套动态路由 /user/:id/post/:postId
      { path: 'post/:postId', component: UserPost }
    ]
  }
]
```

#### 嵌套路由组件

```vue
<!-- User.vue -->
<template>
  <div class="user">
    <h2>用户 {{ $route.params.id }}</h2>
    
    <nav>
      <router-link :to="`/user/${$route.params.id}`">首页</router-link>
      <router-link :to="`/user/${$route.params.id}/profile`">个人资料</router-link>
      <router-link :to="`/user/${$route.params.id}/posts`">文章</router-link>
    </nav>
    
    <!-- 子路由视图 -->
    <router-view />
  </div>
</template>
```

### 2.5 命名视图

#### 配置命名视图

```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: Sidebar,
      header: Header
    }
  },
  {
    path: '/settings',
    components: {
      default: Settings,
      sidebar: SettingsSidebar
    }
  }
]
```

#### 使用命名视图

```vue
<!-- App.vue -->
<template>
  <div>
    <router-view name="header" />
    <div class="container">
      <router-view name="sidebar" />
      <router-view />
    </div>
  </div>
</template>
```

## 3. 路由守卫

路由守卫提供了在路由跳转过程中的钩子函数，用于控制导航流程。

### 3.1 全局前置守卫

```javascript
// router/index.js
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path)
  console.log('来自:', from.path)
  
  // 检查用户认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

// 使用 Promise 的方式（推荐）
router.beforeEach(async (to, from) => {
  // 检查用户权限
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return '/login'
  }
  
  // 动态添加路由
  if (to.meta.requiresRole) {
    const userRoles = await getUserRoles()
    if (!userRoles.includes(to.meta.requiresRole)) {
      return false // 取消导航
    }
  }
})
```

### 3.2 全局解析守卫

```javascript
// 在所有组件内守卫和异步路由组件被解析之后调用
router.beforeResolve(async (to, from) => {
  if (to.meta.requiresCamera) {
    try {
      await askForCameraPermission()
    } catch (error) {
      if (error instanceof NotAllowedError) {
        return false
      } else {
        throw error
      }
    }
  }
})
```

### 3.3 全局后置钩子

```javascript
// 导航确认后调用，不能影响导航
router.afterEach((to, from, failure) => {
  if (!failure) {
    // 发送页面浏览统计
    sendToAnalytics(to.fullPath)
    
    // 设置页面标题
    document.title = to.meta.title || 'My App'
    
    // 滚动到顶部
    window.scrollTo(0, 0)
  }
})
```

### 3.4 路由独享的守卫

```javascript
const routes = [
  {
    path: '/users/:id',
    component: User,
    beforeEnter: (to, from) => {
      // 只对这个路由生效
      const id = to.params.id
      
      // 验证 ID 格式
      if (!/^\d+$/.test(id)) {
        return false
      }
      
      // 检查用户是否存在
      if (!userExists(id)) {
        return '/404'
      }
    }
  },
  {
    path: '/admin',
    component: Admin,
    beforeEnter: [
      // 可以使用数组定义多个守卫
      checkAuth,
      checkAdminRole
    ]
  }
]

// 守卫函数定义
function checkAuth(to, from) {
  if (!isAuthenticated()) {
    return '/login'
  }
}

function checkAdminRole(to, from) {
  if (!hasAdminRole()) {
    return '/unauthorized'
  }
}
```

### 3.5 组件内的守卫

#### 使用选项式API

```javascript
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被验证前调用
    // 不能获取组件实例 `this`！
    // 因为当守卫执行前，组件实例还没被创建
    
    fetchUser(to.params.id, (err, user) => {
      next(vm => {
        // 通过 `vm` 访问组件实例
        vm.user = user
      })
    })
  },
  
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 可以访问组件实例 `this`
    this.user = null
    fetchUser(to.params.id, (err, user) => {
      this.user = user
      next()
    })
  },
  
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('你有未保存的更改，确定要离开吗？')
      if (!answer) return false
    }
    next()
  }
}
```

#### 使用组合式API

```javascript
import { 
  onBeforeRouteEnter, 
  onBeforeRouteUpdate, 
  onBeforeRouteLeave 
} from 'vue-router'
import { ref } from 'vue'

export default {
  setup() {
    const user = ref(null)
    const hasUnsavedChanges = ref(false)
    
    // 等效于 beforeRouteEnter
    onBeforeRouteEnter(async (to, from) => {
      user.value = await fetchUser(to.params.id)
    })
    
    // 等效于 beforeRouteUpdate
    onBeforeRouteUpdate(async (to, from) => {
      if (to.params.id !== from.params.id) {
        user.value = await fetchUser(to.params.id)
      }
    })
    
    // 等效于 beforeRouteLeave
    onBeforeRouteLeave((to, from) => {
      if (hasUnsavedChanges.value) {
        const answer = window.confirm('你有未保存的更改，确定要离开吗？')
        if (!answer) return false
      }
    })
    
    return {
      user,
      hasUnsavedChanges
    }
  }
}
```

### 3.6 实际应用示例

#### 权限控制系统

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { 
      requiresAuth: true,
      title: '仪表盘'
    }
  },
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    meta: { 
      requiresAuth: true,
      requiresRole: 'admin',
      title: '管理后台'
    }
  },
  {
    path: '/profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true },
    beforeEnter: async (to, from) => {
      // 路由级权限检查
      const userStore = useUserStore()
      if (!userStore.canAccessProfile) {
        return '/dashboard'
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局导航守卫
router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  
  // 需要登录的页面
  if (to.meta.requiresAuth) {
    if (!userStore.isAuthenticated) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }
    
    // 角色权限检查
    if (to.meta.requiresRole && !userStore.hasRole(to.meta.requiresRole)) {
      return '/unauthorized'
    }
  }
  
  // 游客页面（已登录用户不能访问）
  if (to.meta.requiresGuest && userStore.isAuthenticated) {
    return '/dashboard'
  }
})

// 设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - My App` : 'My App'
})

export default router
```

#### 数据预加载

```javascript
// 在组件中预加载数据
export default {
  setup() {
    const loading = ref(true)
    const data = ref(null)
    const error = ref(null)
    
    onBeforeRouteEnter(async (to, from) => {
      try {
        loading.value = true
        data.value = await fetchPageData(to.params.id)
      } catch (err) {
        error.value = err.message
        return '/error'
      } finally {
        loading.value = false
      }
    })
    
    onBeforeRouteUpdate(async (to, from) => {
      if (to.params.id !== from.params.id) {
        try {
          loading.value = true
          data.value = await fetchPageData(to.params.id)
        } catch (err) {
          error.value = err.message
        } finally {
          loading.value = false
        }
      }
    })
    
    return {
      loading,
      data,
      error
    }
  }
}
```

#### 表单离开确认

```javascript
export default {
  setup() {
    const form = reactive({
      name: '',
      email: '',
      message: ''
    })
    
    const isDirty = ref(false)
    
    // 监听表单变化
    watch(form, () => {
      isDirty.value = true
    }, { deep: true })
    
    const saveForm = async () => {
      await api.saveForm(form)
      isDirty.value = false
    }
    
    // 离开确认
    onBeforeRouteLeave((to, from) => {
      if (isDirty.value) {
        const answer = window.confirm(
          '你有未保存的更改，确定要离开吗？'
        )
        if (!answer) return false
      }
    })
    
    return {
      form,
      isDirty,
      saveForm
    }
  }
}
```

### 3.7 导航解析流程

完整的导航解析流程如下：

1. 导航被触发
2. 在失活的组件里调用 `beforeRouteLeave` 守卫
3. 调用全局的 `beforeEach` 守卫
4. 在重用的组件里调用 `beforeRouteUpdate` 守卫
5. 在路由配置里调用 `beforeEnter`
6. 解析异步路由组件
7. 在被激活的组件里调用 `beforeRouteEnter`
8. 调用全局的 `beforeResolve` 守卫
9. 导航被确认
10. 调用全局的 `afterEach` 钩子
11. 触发 DOM 更新
12. 调用 `beforeRouteEnter` 守卫中传给 `next` 的回调函数，创建好的组件实例会作为回调函数的参数传入

## 总结

Vue Router 4 为 Vue 3 应用提供了强大的路由管理功能：

### 核心特性：

1. **路由配置**：声明式路由定义，支持嵌套和命名视图
2. **动态路由**：参数匹配、参数验证、props 传递
3. **导航方式**：声明式（router-link）和编程式（router.push）
4. **路由守卫**：全局、路由级、组件级的导航控制

### 最佳实践：

- 使用 History 模式获得更好的 URL 体验
- 合理使用路由守卫进行权限控制和数据预加载
- 利用路由元信息存储页面级配置
- 使用组合式 API 获得更好的类型支持和逻辑组织
- 实现适当的错误处理和加载状态管理

Vue Router 4 与 Vue 3 的组合式 API 完美配合，为构建现代化的单页面应用提供了强大的路由解决方案。

我已经为你创建了一份详细的 Vue 3 路由管理指南，涵盖了你要求的所有核心内容：

## 主要内容包括：

### 1. Vue Router 基础

- **安装配置**: Vue Router 4 的安装和基本配置
- **路由配置**: 路由表定义、组件注册
- **导航方式**: 声明式导航（router-link）和编程式导航（router.push）
- **历史模式**: Hash 模式、History 模式、Memory 模式的区别和使用

### 2. 动态路由和路由参数

- **动态路由匹配**: 基本动态段、多动态段、可选参数
- **参数获取**: 在组件中获取路由参数的多种方式
- **参数变化响应**: 使用 watch 和 beforeRouteUpdate 响应参数变化
- **参数验证**: 自定义正则表达式验证参数格式
- **嵌套路由**: 多层级路由配置和使用
- **命名视图**: 同一级展示多个视图组件

### 3. 路由守卫

- **全局守卫**: beforeEach、beforeResolve、afterEach
- **路由独享守卫**: 单个路由的 beforeEnter
- **组件内守卫**: beforeRouteEnter、beforeRouteUpdate、beforeRouteLeave
- **实际应用**: 权限控制、数据预加载、表单保护等完整示例

## 特色内容：

### 🎯 实用示例

- 权限控制系统的完整实现
- 数据预加载的最佳实践
- 表单离开确认的处理方案

### 📋 详细对比

- ref vs reactive 在路由中的使用
- 选项式 API vs 组合式 API 的路由守卫写法
- 不同历史模式的优缺点分析

### 🔧 最佳实践

- 路由配置的组织方式
- 导航解析流程的完整说明
- TypeScript 支持和类型安全

这份指南包含了大量实际可用的代码示例，从基础配置到高级应用场景都有详细说明，可以作为 Vue 3 路由开发的完整参考手册。