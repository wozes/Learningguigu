# Vue 3 Router vs Vue 2 Router 主要区别

## 🚀 创建方式对比

### Vue 2 Router 3.x

```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes
})
```

### Vue 3 Router 4.x

```javascript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
```

## 🔄 历史模式API变化

|Vue 2|Vue 3|
|---|---|
|`mode: 'history'`|`history: createWebHistory()`|
|`mode: 'hash'`|`history: createWebHashHistory()`|
|`mode: 'abstract'`|`history: createMemoryHistory()`|

## 📦 组合式API集成

### Vue 2 方式

```javascript
export default {
  created() {
    console.log(this.$route.params.id)
    this.$router.push('/home')
  }
}
```

### Vue 3 组合式API

```javascript
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    console.log(route.params.id)
    router.push('/home')
  }
}
```

## 🛡️ 导航守卫改进

### Vue 2 - 必须调用next()

```javascript
router.beforeEach((to, from, next) => {
  if (condition) {
    next('/login')
  } else {
    next()
  }
})
```

### Vue 3 - next参数可选

```javascript
router.beforeEach(async (to, from) => {
  if (condition) {
    return '/login'  // 直接返回
  }
  // 返回true或undefined继续导航
})
```

## 🔧 动态路由管理

### 新增API

- `router.addRoute()` - 添加路由
- `router.removeRoute()` - 删除路由
- `router.hasRoute()` - 检查路由是否存在
- `router.getRoutes()` - 获取所有路由

### Vue 2

```javascript
// 只能在创建时定义路由
router.addRoutes(routes)  // 已废弃
```

### Vue 3

```javascript
// 更灵活的动态路由管理
router.addRoute({
  path: '/about',
  component: About
})

router.removeRoute('routeName')
```

## 📱 组件内守卫变化

### Vue 3 组合式API

```javascript
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

export default {
  setup() {
    onBeforeRouteUpdate(async (to, from) => {
      // 不需要next参数
      if (to.params.id !== from.params.id) {
        await fetchData(to.params.id)
      }
    })
    
    onBeforeRouteLeave((to, from) => {
      if (hasUnsavedChanges) {
        return window.confirm('确定要离开吗？')
      }
    })
  }
}
```

## 🎯 TypeScript支持

### Vue 3 Router 原生TypeScript支持

- 完整的类型定义
- 路由元信息类型扩展
- 类型安全的参数访问

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
  }
}
```

## 🚦 路由过渡改进

### Vue 3 - 更灵活的过渡控制

```vue
<router-view v-slot="{ Component, route }">
  <transition :name="route.meta.transition || 'fade'">
    <component :is="Component" :key="route.path" />
  </transition>
</router-view>
```

## 📊 性能优化

### Vue 3 Router 4.x 优势

- 更小的包体积
- 更好的Tree-shaking支持
- 改进的路由匹配算法
- 优化的代码分割

## 🔍 调试和开发体验

### Vue 3 Router 改进

- 更好的错误处理
- 改进的开发者工具集成
- 更清晰的错误信息
- 路由导航失败的详细信息

## 🛠️ 迁移要点

### 主要Breaking Changes

1. **创建方式**：`new VueRouter()` → `createRouter()`
2. **历史模式**：`mode` → `history`
3. **导航守卫**：`next()` 参数变为可选
4. **路由元信息**：类型安全的元信息访问
5. **动态路由**：`addRoutes()` 被移除，使用 `addRoute()`

### 兼容性

- Vue 3 Router 4.x 只支持 Vue 3
- Vue 2 应用需要继续使用 Vue Router 3.x
- 两个版本的核心概念保持一致，便于学习和迁移

## 🌟 新特性亮点

1. **组合式API原生支持**
2. **更好的TypeScript集成**
3. **改进的动态路由管理**
4. **简化的导航守卫语法**
5. **更灵活的路由配置**
6. **增强的错误处理**
7. **优化的性能表现**