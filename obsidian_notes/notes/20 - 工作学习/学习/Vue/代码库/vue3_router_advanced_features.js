// Vue 3 Router 4 高级特性和最佳实践

// 1. 路由过渡动画的改进
// App.vue
/*
<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition 
        :name="getTransitionName(route)"
        mode="out-in"
        @before-enter="onBeforeEnter"
        @after-enter="onAfterEnter"
      >
        <component 
          :is="Component" 
          :key="route.path"
          class="route-component"
        />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('fade')

// 根据路由层级和方向决定动画
const getTransitionName = (currentRoute) => {
  const depth = currentRoute.path.split('/').length
  const meta = currentRoute.meta
  
  if (meta.transition) {
    return meta.transition
  }
  
  // 默认根据深度决定
  return depth > 2 ? 'slide-left' : 'fade'
}

const onBeforeEnter = (el) => {
  // 进入动画前的准备
  el.style.opacity = '0'
}

const onAfterEnter = (el) => {
  // 进入动画完成后
  el.style.opacity = '1'
}
</script>

<style>
/* 淡入淡出 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 滑动效果 */
.slide-left-enter-active, .slide-left-leave-active {
  transition: all 0.3s ease;
}
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* 缩放效果 */
.scale-enter-active, .scale-leave-active {
  transition: all 0.3s ease;
}
.scale-enter-from {
  transform: scale(0.8);
  opacity: 0;
}
.scale-leave-to {
  transform: scale(1.2);
  opacity: 0;
}
</style>
*/

// 2. 路由级别的 Keep-Alive 管理
// composables/useKeepAlive.js
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const cachedViews = ref(new Set())
const visitedViews = ref([])

export function useKeepAlive() {
  const route = useRoute()
  
  const shouldKeepAlive = computed(() => {
    return route.meta?.keepAlive || false
  })
  
  const cachedViewNames = computed(() => {
    return Array.from(cachedViews.value)
  })
  
  const addCachedView = (name) => {
    if (name && !cachedViews.value.has(name)) {
      cachedViews.value.add(name)
    }
  }
  
  const removeCachedView = (name) => {
    cachedViews.value.delete(name)
  }
  
  const addVisitedView = (route) => {
    const existingIndex = visitedViews.value.findIndex(v => v.path === route.path)
    
    if (existingIndex === -1) {
      visitedViews.value.push({
        name: route.name,
        path: route.path,
        title: route.meta?.title || 'Untitled',
        affix: route.meta?.affix || false
      })
    }
  }
  
  const removeVisitedView = (targetRoute) => {
    const index = visitedViews.value.findIndex(v => v.path === targetRoute.path)
    
    if (index > -1) {
      const removed = visitedViews.value.splice(index, 1)[0]
      
      // 如果移除的是缓存视图，也要从缓存中移除
      if (removed.name) {
        removeCachedView(removed.name)
      }
      
      return removed
    }
  }
  
  const clearAllViews = () => {
    const affixViews = visitedViews.value.filter(v => v.affix)
    visitedViews.value = affixViews
    cachedViews.value.clear()
  }
  
  return {
    shouldKeepAlive,
    cachedViewNames,
    visitedViews,
    addCachedView,
    removeCachedView,
    addVisitedView,
    removeVisitedView,
    clearAllViews
  }
}

// App.vue 中使用 Keep-Alive
/*
<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedViewNames">
        <component 
          :is="Component" 
          :key="route.fullPath"
          v-if="shouldKeepAlive"
        />
      </keep-alive>
      <component 
        :is="Component" 
        :key="route.fullPath"
        v-if="!shouldKeepAlive"
      />
    </router-view>
  </div>
</template>

<script setup>
import { useKeepAlive } from '@/composables/useKeepAlive'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { shouldKeepAlive, cachedViewNames, addCachedView, addVisitedView } = useKeepAlive()

// 监听路由变化，管理缓存
watch(() => route, (newRoute) => {
  addVisitedView(newRoute)
  
  if (newRoute.meta?.keepAlive && newRoute.name) {
    addCachedView(newRoute.name)
  }
}, { immediate: true })
</script>
*/

// 3. 路由元信息的高级应用
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '仪表盘',
      icon: 'dashboard',
      keepAlive: true,
      roles: ['admin', 'editor'],
      breadcrumb: [
        { text: '首页', to: '/' },
        { text: '仪表盘' }
      ],
      // 页面权限
      permissions: ['dashboard:view'],
      // 标签页配置
      tab: {
        closable: true,
        affix: false
      },
      // SEO 配置
      seo: {
        title: '仪表盘 - 管理系统',
        description: '系统管理仪表盘',
        keywords: 'dashboard, admin, management'
      },
      // 页面配置
      layout: 'admin',
      transition: 'fade',
      // 数据预加载
      preload: ['getUserStats', 'getSystemInfo']
    }
  }
]

// 4. 全局路由元信息处理
router.beforeEach(async (to, from) => {
  // 设置页面标题
  if (to.meta?.seo?.title) {
    document.title = to.meta.seo.title
  } else if (to.meta?.title) {
    document.title = `${to.meta.title} - My App`
  }
  
  // 设置 meta 标签
  if (to.meta?.seo) {
    updateMetaTags(to.meta.seo)
  }
  
  // 预加载数据
  if (to.meta?.preload) {
    try {
      await Promise.all(
        to.meta.preload.map(loader => 
          typeof loader === 'string' ? store.dispatch(loader) : loader(to)
        )
      )
    } catch (error) {
      console.error('数据预加载失败:', error)
    }
  }
  
  return true
})

function updateMetaTags(seo) {
  // 更新 description
  const descriptionMeta = document.querySelector('meta[name="description"]')
  if (descriptionMeta && seo.description) {
    descriptionMeta.setAttribute('content', seo.description)
  }
  
  // 更新 keywords
  const keywordsMeta = document.querySelector('meta[name="keywords"]')
  if (keywordsMeta && seo.keywords) {
    keywordsMeta.setAttribute('content', seo.keywords)
  }
}

// 5. 路由错误边界
// components/RouterErrorBoundary.vue
/*
<template>
  <div v-if="error" class="route-error">
    <h2>页面加载失败</h2>
    <p>{{ error.message }}</p>
    <button @click="retry">重试</button>
    <button @click="goHome">返回首页</button>
  </div>
  <router-view v-else v-slot="{ Component, route }">
    <Suspense>
      <template #default>
        <component :is="Component" :key="route.path" />
      </template>
      <template #fallback>
        <LoadingComponent />
      </template>
    </Suspense>
  </router-view>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import LoadingComponent from './LoadingComponent.vue'

const router = useRouter()
const error = ref(null)

onErrorCaptured((err, instance, info) => {
  console.error('路由组件错误:', err, info)
  error.value = err
  return false // 阻止错误继续传播
})

const retry = () => {
  error.value = null
  // 强制重新加载当前路由
  router.go(0)
}

const goHome = () => {
  error.value = null
  router.push('/')
}
</script>
*/

// 6. 路由性能监控
// composables/useRoutePerformance.js
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useRoutePerformance() {
  const router = useRouter()
  const route = useRoute()
  
  const performanceData = ref({
    navigationStart: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    routeChangeTime: 0
  })
  
  // 监控路由变化性能
  const measureRouteChange = () => {
    const start = performance.now()
    
    return {
      end: () => {
        const duration = performance.now() - start
        performanceData.value.routeChangeTime = duration
        
        // 发送性能数据
        sendPerformanceData({
          type: 'route_change',
          route: route.path,
          duration
        })
      }
    }
  }
  
  const sendPerformanceData = (data) => {
    // 发送到分析服务
    if (window.gtag) {
      window.gtag('event', 'performance', {
        event_category: 'Navigation',
        event_label: data.route,
        value: Math.round(data.duration)
      })
    }
    
    // 或发送到自定义分析服务
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(console.error)
  }
  
  // 监控页面加载性能
  onMounted(() => {
    if (window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0]
      
      performanceData.value = {
        navigationStart: navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart
      }
    }
  })
  
  return {
    performanceData,
    measureRouteChange
  }
}

// 在路由守卫中使用性能监控
let performanceMeasure

router.beforeEach((to, from) => {
  performanceMeasure = performance.now()
})

router.afterEach((to, from) => {
  if (performanceMeasure) {
    const duration = performance.now() - performanceMeasure
    console.log(`路由 ${to.path} 加载耗时: ${duration.toFixed(2)}ms`)
  }
})

// 7. 路由状态持久化
// composables/useRoutePersistence.js
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useRoutePersistence(options = {}) {
  const route = useRoute()
  const router = useRouter()
  
  const {
    key = 'route-state',
    storage = sessionStorage,
    include = [],
    exclude = [],
    maxAge = 30 * 60 * 1000 // 30分钟
  } = options
  
  // 保存路由状态
  const saveState = () => {
    const routeName = route.name
    
    // 检查是否需要保存
    if (include.length > 0 && !include.includes(routeName)) return
    if (exclude.includes(routeName)) return
    
    const state = {
      path: route.path,
      query: route.query,
      params: route.params,
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY
      },
      timestamp: Date.now()
    }
    
    try {
      storage.setItem(`${key}-${routeName}`, JSON.stringify(state))
    } catch (error) {
      console.warn('保存路由状态失败:', error)
    }
  }
  
  // 恢复路由状态
  const restoreState = (routeName) => {
    try {
      const savedState = storage.getItem(`${key}-${routeName}`)
      
      if (savedState) {
        const state = JSON.parse(savedState)
        
        // 检查是否过期
        if (Date.now() - state.timestamp > maxAge) {
          storage.removeItem(`${key}-${routeName}`)
          return null
        }
        
        return state
      }
    } catch (error) {
      console.warn('恢复路由状态失败:', error)
    }
    
    return null
  }
  
  // 监听路由变化并保存状态
  watch(() => route.fullPath, saveState)
  
  // 页面卸载时保存状态
  window.addEventListener('beforeunload', saveState)
  
  return {
    saveState,
    restoreState
  }
}

// 8. 智能路由预取
// composables/useSmartPrefetch.js
export function useSmartPrefetch() {
  const prefetchedRoutes = new Set()
  const prefetchQueue = []
  let isProcessing = false
  
  // 基于用户行为的智能预取
  const smartPrefetch = (element, routeName, options = {}) => {
    const {
      delay = 100,
      threshold = 0.5, // 元素可见度阈值
      immediate = false
    } = options
    
    if (immediate) {
      prefetchRoute(routeName)
      return
    }
    
    // 使用 Intersection Observer 监听元素可见度
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          setTimeout(() => {
            prefetchRoute(routeName)
          }, delay)
        }
      })
    }, { threshold })
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }
  
  const prefetchRoute = async (routeName) => {
    if (prefetchedRoutes.has(routeName) || isProcessing) {
      return
    }
    
    prefetchQueue.push(routeName)
    
    if (!isProcessing) {
      await processPrefetchQueue()
    }
  }
  
  const processPrefetchQueue = async () => {
    isProcessing = true
    
    while (prefetchQueue.length > 0) {
      const routeName = prefetchQueue.shift()
      
      try {
        const route = router.resolve({ name: routeName })
        
        // 预取组件
        const componentPromises = route.matched.map(record => {
          const component = record.components?.default
          if (typeof component === 'function') {
            return component()
          }
        }).filter(Boolean)
        
        await Promise.all(componentPromises)
        prefetchedRoutes.add(routeName)
        
        console.log(`路由 ${routeName} 预取完成`)
      } catch (error) {
        console.error(`路由 ${routeName} 预取失败:`, error)
      }
      
      // 避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    isProcessing = false
  }
  
  return {
    smartPrefetch,
    prefetchRoute
  }
}

// 9. 路由测试工具
// utils/routerTestUtils.js
import { createRouter, createMemoryHistory } from 'vue-router'
import { mount } from '@vue/test-utils'

export function createTestRouter(routes = []) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      ...routes
    ]
  })
}

export function mountWithRouter(component, options = {}) {
  const router = options.router || createTestRouter()
  
  return mount(component, {
    global: {
      plugins: [router]
    },
    ...options
  })
}

// 测试示例
// tests/router.spec.js
/*
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestRouter, mountWithRouter } from '@/utils/routerTestUtils'
import App from '@/App.vue'

describe('Router', () => {
  let router
  
  beforeEach(() => {
    router = createTestRouter([
      { path: '/user/:id', component: UserComponent, props: true }
    ])
  })
  
  it('should navigate to user route', async () => {
    const wrapper = mountWithRouter(App, { router })
    
    await router.push('/user/123')
    
    expect(wrapper.find('.user-component').exists()).toBe(true)
    expect(wrapper.find('.user-id').text()).toBe('123')
  })
  
  it('should handle route guards', async () => {
    const mockGuard = vi.fn().mockReturnValue(true)
    router.beforeEach(mockGuard)
    
    await router.push('/protected')
    
    expect(mockGuard).toHaveBeenCalled()
  })
})
*/