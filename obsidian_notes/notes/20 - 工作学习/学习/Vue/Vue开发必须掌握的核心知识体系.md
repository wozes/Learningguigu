## 🎯 1. Vue3 核心基础

### 响应式系统

```javascript
// Composition API
import { ref, reactive, computed, watch, watchEffect } from 'vue'

// 基本响应式
const count = ref(0)
const state = reactive({ name: 'Vue', version: 3 })

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`count changed from ${oldVal} to ${newVal}`)
})

// 立即执行的侦听器
watchEffect(() => {
  console.log(`Count is: ${count.value}`)
})
```

### 生命周期钩子

```javascript
import { 
  onMounted, 
  onUpdated, 
  onUnmounted, 
  onBeforeMount,
  onBeforeUpdate,
  onBeforeUnmount 
} from 'vue'

export default {
  setup() {
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    onUpdated(() => {
      console.log('组件已更新')
    })
    
    onUnmounted(() => {
      console.log('组件即将卸载')
    })
  }
}
```

## 🔧 2. 组件系统

### 组件通信方式

```javascript
// 1. Props & Emit
// 父组件
<ChildComponent 
  :message="parentMessage" 
  @update="handleUpdate" 
/>

// 子组件
const props = defineProps({
  message: String
})

const emit = defineEmits(['update'])

// 2. Provide/Inject
// 祖先组件
provide('theme', 'dark')

// 后代组件
const theme = inject('theme')

// 3. Template Refs
const childRef = ref()
// <ChildComponent ref="childRef" />
// 访问子组件实例：childRef.value

// 4. 事件总线 (Vue3推荐使用第三方库如mitt)
import mitt from 'mitt'
const emitter = mitt()
```

### 动态组件与异步组件

```javascript
// 动态组件
<component :is="currentComponent" />

// 异步组件
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)

// 带配置的异步组件
const AsyncComponentWithOptions = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 插槽系统

```vue
<!-- 基础插槽 -->
<template>
  <div class="container">
    <slot></slot>
  </div>
</template>

<!-- 具名插槽 -->
<template>
  <div>
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<!-- 作用域插槽 -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="index"></slot>
    </li>
  </ul>
</template>

<!-- 使用作用域插槽 -->
<MyList>
  <template #default="{ item, index }">
    <span>{{ index }}: {{ item.name }}</span>
  </template>
</MyList>
```

## 🎨 3. 指令系统

### 内置指令

```vue
<template>
  <!-- 条件渲染 -->
  <div v-if="show">显示内容</div>
  <div v-else-if="loading">加载中...</div>
  <div v-else>隐藏内容</div>
  
  <!-- 列表渲染 -->
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      {{ index }} - {{ item.name }}
    </li>
  </ul>
  
  <!-- 事件处理 -->
  <button @click="handleClick">点击</button>
  <input @keyup.enter="handleEnter" />
  
  <!-- 表单绑定 -->
  <input v-model="inputValue" />
  <input v-model.number="numberValue" />
  <input v-model.trim="trimValue" />
</template>
```

### 自定义指令

```javascript
// 全局自定义指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 局部自定义指令
const vFocus = {
  mounted: (el) => el.focus()
}

// 带参数的自定义指令
const vColor = {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    el.style.color = binding.value
  }
}

// 使用：<input v-focus v-color="'red'" />
```

## 🛣️ 4. Vue Router

### 基础路由配置

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
    props: true, // 将路由参数作为props传递
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue') // 懒加载
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

### 编程式导航

```javascript
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 导航
router.push('/home')
router.push({ name: 'User', params: { id: 123 } })
router.replace('/login')
router.go(-1) // 后退

// 获取路由信息
console.log(route.params.id)
console.log(route.query.search)
```

## 📦 5. 构建工具与开发环境

### Vite 配置

```javascript
// vite.config.js
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
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['element-plus']
        }
      }
    }
  }
})
```

### 环境变量配置

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=My Vue App (Dev)

# .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_APP_TITLE=My Vue App
```

## 🎭 6. TypeScript 支持

### 组件类型定义

```typescript
// 定义Props类型
interface Props {
  title: string
  count?: number
  items: Array<{ id: number; name: string }>
}

// 使用defineProps
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// 定义Emits类型
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()

// Ref类型
const inputRef = ref<HTMLInputElement>()
const userList = ref<User[]>([])

// 组件实例类型
const childRef = ref<InstanceType<typeof ChildComponent>>()
```

## 🧪 7. 测试

### 单元测试 (Vitest + Vue Test Utils)

```javascript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Hello World' }
    })
    
    expect(wrapper.text()).toContain('Hello World')
  })
  
  it('emits event when clicked', async () => {
    const wrapper = mount(MyComponent)
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

### E2E测试 (Cypress)

```javascript
describe('App E2E', () => {
  it('should display welcome message', () => {
    cy.visit('/')
    cy.contains('h1', 'Welcome')
    cy.get('[data-testid="counter"]').should('contain', '0')
    cy.get('[data-testid="increment"]').click()
    cy.get('[data-testid="counter"]').should('contain', '1')
  })
})
```

## 🎨 8. CSS解决方案

### CSS预处理器

```vue
<style lang="scss" scoped>
$primary-color: #42b883;

.component {
  color: $primary-color;
  
  &__title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  &--active {
    background-color: lighten($primary-color, 10%);
  }
}
</style>
```

### CSS Modules

```vue
<template>
  <div :class="$style.container">
    <h1 :class="$style.title">Title</h1>
  </div>
</template>

<style module>
.container {
  padding: 20px;
}

.title {
  color: blue;
}
</style>
```

### CSS-in-JS (推荐使用UnoCSS)

```javascript
// unocss.config.js
import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: {
    'btn': 'py-2 px-4 font-semibold rounded-lg shadow-md',
    'btn-primary': 'btn text-white bg-blue-500 hover:bg-blue-700',
  }
})
```

## 🚀 9. 性能优化

### 代码分割与懒加载

```javascript
// 路由懒加载
const About = () => import('@/views/About.vue')

// 组件懒加载
import { defineAsyncComponent } from 'vue'
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)

// 动态导入
const loadModule = async () => {
  const module = await import('@/utils/heavy-utils.js')
  return module.default
}
```

### 虚拟滚动

```vue
<template>
  <div class="virtual-list" ref="containerRef">
    <div 
      v-for="item in visibleItems" 
      :key="item.id"
      class="virtual-item"
    >
      {{ item.content }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  items: Array,
  itemHeight: Number
})

const containerRef = ref()
const scrollTop = ref(0)
const containerHeight = ref(0)

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const end = Math.min(
    start + Math.ceil(containerHeight.value / props.itemHeight),
    props.items.length
  )
  
  return props.items.slice(start, end)
})
</script>
```

## 🔌 10. 插件与生态系统

### 常用插件库

```javascript
// UI组件库
import ElementPlus from 'element-plus'
import Antd from 'ant-design-vue'
import Vuetify from 'vuetify'

// 工具库
import VueUse from '@vueuse/core' // 组合式工具集
import { useMouse, useLocalStorage } from '@vueuse/core'

// 表单处理
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

// 图表
import VChart from '@visactor/vchart'
import ECharts from 'vue-echarts'

// 动画
import { gsap } from 'gsap'
import Lottie from 'vue3-lottie'
```

### 自定义插件

```javascript
// plugins/api.js
export default {
  install(app, options) {
    const api = {
      get: (url) => fetch(`${options.baseURL}${url}`).then(r => r.json()),
      post: (url, data) => fetch(`${options.baseURL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json())
    }
    
    app.config.globalProperties.$api = api
    app.provide('api', api)
  }
}

// main.js
import apiPlugin from './plugins/api.js'
app.use(apiPlugin, { baseURL: 'https://api.example.com' })
```

## 📱 11. 移动端开发

### 响应式设计

```vue
<template>
  <div class="responsive-container">
    <div class="desktop-only">桌面端内容</div>
    <div class="mobile-only">移动端内容</div>
  </div>
</template>

<script setup>
import { useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints({
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
})

const isMobile = breakpoints.smaller('tablet')
const isDesktop = breakpoints.greater('laptop')
</script>

<style scoped>
.responsive-container {
  padding: 1rem;
}

@media (max-width: 640px) {
  .desktop-only { display: none; }
}

@media (min-width: 641px) {
  .mobile-only { display: none; }
}
</style>
```

### 触摸事件处理

```vue
<template>
  <div 
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    class="touch-area"
  >
    触摸区域
  </div>
</template>

<script setup>
import { ref } from 'vue'

const startX = ref(0)
const startY = ref(0)

const handleTouchStart = (e) => {
  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
}

const handleTouchMove = (e) => {
  e.preventDefault() // 防止页面滚动
}

const handleTouchEnd = (e) => {
  const endX = e.changedTouches[0].clientX
  const endY = e.changedTouches[0].clientY
  
  const deltaX = endX - startX.value
  const deltaY = endY - startY.value
  
  // 判断滑动方向
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 50) {
      console.log('向右滑动')
    } else if (deltaX < -50) {
      console.log('向左滑动')
    }
  }
}
</script>
```

## 🛡️ 12. 安全性

### XSS防护

```javascript
// 使用v-html时要小心
// ❌ 危险
<div v-html="userInput"></div>

// ✅ 安全 - 使用DOMPurify清理
import DOMPurify from 'dompurify'

const sanitizedHtml = computed(() => {
  return DOMPurify.sanitize(userInput.value)
})
```

### CSRF防护

```javascript
// axios请求拦截器
axios.interceptors.request.use(config => {
  const token = document.querySelector('meta[name="csrf-token"]').content
  config.headers['X-CSRF-TOKEN'] = token
  return config
})
```

## 📈 13. 监控与调试

### Vue DevTools

```javascript
// 生产环境启用DevTools (仅开发时)
if (process.env.NODE_ENV === 'development') {
  app.config.performance = true
}
```

### 错误监控

```javascript
// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)
  
  // 发送到错误监控服务
  errorReporting.captureException(err, {
    extra: { info, componentStack: instance?.$?.type?.name }
  })
}

// 异步错误处理
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise拒绝:', event.reason)
  errorReporting.captureException(event.reason)
})
```

## 🎯 学习路径建议

### 初级阶段 (1-2个月)

1. Vue3基础语法和响应式系统
2. 组件开发和组件通信
3. 模板语法和指令系统
4. 基础的Vue Router使用

### 中级阶段 (2-3个月)

1. Composition API深入使用
2. Pinia状态管理
3. TypeScript集成
4. 构建工具配置(Vite)
5. 基础测试编写

### 高级阶段 (3-6个月)

1. 性能优化技巧
2. 自定义指令和插件开发
3. 复杂状态管理模式
4. 微前端架构
5. 服务端渲染(Nuxt.js)
6. 移动端开发优化

### 专家阶段 (持续学习)

1. Vue源码阅读
2. 贡献开源项目
3. 架构设计能力
4. 团队技术领导
5. 新技术趋势跟进

记住，Vue的学习是一个渐进的过程，建议按照项目需求逐步深入，在实践中巩固理论知识！