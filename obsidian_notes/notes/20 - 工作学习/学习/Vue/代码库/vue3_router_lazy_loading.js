// Vue 3 Router 4 懒加载和代码分割

// 1. 基本懒加载
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
]

// 2. Webpack 魔法注释进行分组
const routes = [
  {
    path: '/user',
    name: 'User',
    // webpackChunkName 用于指定打包后的chunk名称
    component: () => import(/* webpackChunkName: "user" */ '@/views/User.vue')
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    // 相同的 webpackChunkName 会被打包到同一个chunk
    component: () => import(/* webpackChunkName: "user" */ '@/views/UserProfile.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/Admin.vue')
  }
]

// 3. 预加载和预获取
const routes = [
  {
    path: '/important',
    name: 'Important',
    // webpackPreload: 在父chunk加载时，以并行方式开始加载
    component: () => import(/* webpackPreload: true */ '@/views/Important.vue')
  },
  {
    path: '/future-feature',
    name: 'FutureFeature',
    // webpackPrefetch: 在浏览器空闲时才开始下载
    component: () => import(/* webpackPrefetch: true */ '@/views/FutureFeature.vue')
  }
]

// 4. 使用 defineAsyncComponent 进行更细粒度的控制
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  // 加载函数
  loader: () => import('@/components/AsyncComponent.vue'),
  
  // 加载异步组件时使用的组件
  loadingComponent: () => import('@/components/Loading.vue'),
  
  // 展示加载组件前的延时，默认为 200ms
  delay: 200,
  
  // 加载失败后展示的组件
  errorComponent: () => import('@/components/Error.vue'),
  
  // 如果提供了一个 timeout 时间限制，并超时了
  // 也会显示这里配置的报错组件，默认值是：Infinity
  timeout: 3000
})

const routes = [
  {
    path: '/async',
    name: 'Async',
    component: AsyncComponent
  }
]

// 5. 创建异步组件的工厂函数
function createAsyncComponent(loader, options = {}) {
  return defineAsyncComponent({
    loader,
    loadingComponent: () => import('@/components/common/Loading.vue'),
    errorComponent: () => import('@/components/common/Error.vue'),
    delay: 200,
    timeout: 3000,
    ...options
  })
}

// 使用工厂函数
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: createAsyncComponent(
      () => import('@/views/Dashboard.vue'),
      { timeout: 5000 } // 自定义超时时间
    )
  }
]

// 6. 路由级别的代码分割策略
// 按业务模块分组
const routes = [
  // 用户相关模块
  {
    path: '/user',
    name: 'UserLayout',
    component: () => import(/* webpackChunkName: "user-module" */ '@/layouts/UserLayout.vue'),
    children: [
      {
        path: 'profile',
        component: () => import(/* webpackChunkName: "user-module" */ '@/views/user/Profile.vue')
      },
      {
        path: 'settings',
        component: () => import(/* webpackChunkName: "user-module" */ '@/views/user/Settings.vue')
      }
    ]
  },
  
  // 管理员模块
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import(/* webpackChunkName: "admin-module" */ '@/layouts/AdminLayout.vue'),
    children: [
      {
        path: 'users',
        component: () => import(/* webpackChunkName: "admin-module" */ '@/views/admin/Users.vue')
      },
      {
        path: 'reports',
        component: () => import(/* webpackChunkName: "admin-module" */ '@/views/admin/Reports.vue')
      }
    ]
  },
  
  // 第三方库单独分包
  {
    path: '/charts',
    name: 'Charts',
    component: () => import(/* webpackChunkName: "charts-vendor" */ '@/views/Charts.vue')
  }
]

// 7. 动态导入的错误处理
const loadComponent = (componentPath, chunkName) => {
  return () => import(
    /* webpackChunkName: "[request]" */
    `@/views/${componentPath}.vue`
  ).catch(error => {
    console.error(`组件加载失败: ${componentPath}`, error)
    
    // 返回一个错误组件
    return import('@/components/LoadError.vue')
  })
}

// 使用带错误处理的加载器
const routes = [
  {
    path: '/safe-route',
    name: 'SafeRoute',
    component: loadComponent('SafeComponent', 'safe')
  }
]

// 8. 路由预加载策略
// composables/useRoutePreloader.js
import { useRouter } from 'vue-router'

export function useRoutePreloader() {
  const router = useRouter()
  
  // 预加载指定路由
  const preloadRoute = async (routeName) => {
    try {
      const route = router.resolve({ name: routeName })
      
      if (route.matched.length > 0) {
        // 预加载所有匹配的组件
        const promises = route.matched.map(record => {
          const component = record.components?.default
          if (typeof component === 'function') {
            return component()
          }
        }).filter(Boolean)
        
        await Promise.all(promises)
        console.log(`路由 ${routeName} 预加载完成`)
      }
    } catch (error) {
      console.error(`路由 ${routeName} 预加载失败:`, error)
    }
  }
  
  // 根据用户行为预加载
  const preloadOnHover = (routeName) => {
    let timeoutId
    
    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        preloadRoute(routeName)
      }, 100) // 延迟100ms避免误触
    }
    
    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
    
    return {
      onMouseenter: handleMouseEnter,
      onMouseleave: handleMouseLeave
    }
  }
  
  // 预加载用户可能访问的路由
  const preloadUserRoutes = async (userRole) => {
    const routesToPreload = {
      admin: ['AdminDashboard', 'UserManagement'],
      user: ['UserProfile', 'UserSettings'],
      guest: ['Login', 'Register']
    }
    
    const routes = routesToPreload[userRole] || []
    
    // 并发预加载
    await Promise.allSettled(
      routes.map(routeName => preloadRoute(routeName))
    )
  }
  
  return {
    preloadRoute,
    preloadOnHover,
    preloadUserRoutes
  }
}

// 在组件中使用预加载
/*
<template>
  <div>
    <router-link 
      to="/dashboard"
      v-bind="preloadOnHover('Dashboard')"
    >
      仪表盘
    </router-link>
  </div>
</template>

<script setup>
import { useRoutePreloader } from '@/composables/useRoutePreloader'

const { preloadOnHover, preloadUserRoutes } = useRoutePreloader()

// 根据用户角色预加载
const userRole = 'admin'
preloadUserRoutes(userRole)
</script>
*/

// 9. Vite 中的动态导入
// Vite 使用不同的语法进行动态导入
const routes = [
  {
    path: '/vite-component',
    name: 'ViteComponent',
    component: () => import('@/views/ViteComponent.vue')
  }
]

// Vite 中的 glob 导入
const modules = import.meta.glob('@/views/**/*.vue')

// 动态生成路由
const dynamicRoutes = Object.keys(modules).map(path => {
  const name = path.match(/\/views\/(.+)\.vue$/)?.[1]
  return {
    path: `/${name}`,
    name,
    component: modules[path]
  }
})

// 10. 路由懒加载的性能监控
// utils/performanceMonitor.js
class RoutePerformanceMonitor {
  constructor() {
    this.loadTimes = new Map()
  }
  
  startLoading(routeName) {
    this.loadTimes.set(routeName, {
      start: performance.now(),
      routeName
    })
  }
  
  endLoading(routeName) {
    const loadInfo = this.loadTimes.get(routeName)
    if (loadInfo) {
      const duration = performance.now() - loadInfo.start
      console.log(`路由 ${routeName} 加载耗时: ${duration.toFixed(2)}ms`)
      
      // 发送性能数据到监控服务
      this.reportPerformance(routeName, duration)
      
      this.loadTimes.delete(routeName)
    }
  }
  
  reportPerformance(routeName, duration) {
    // 发送到分析服务
    if (window.gtag) {
      window.gtag('event', 'route_load_time', {
        event_category: 'Performance',
        event_label: routeName,
        value: Math.round(duration)
      })
    }
  }
}

const performanceMonitor = new RoutePerformanceMonitor()

// 在路由守卫中使用性能监控
router.beforeEach((to, from) => {
  if (to.name) {
    performanceMonitor.startLoading(to.name)
  }
})

router.afterEach((to, from) => {
  if (to.name) {
    performanceMonitor.endLoading(to.name)
  }
})

// 11. 智能预加载策略
// composables/useIntelligentPreloader.js
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

export function useIntelligentPreloader() {
  const router = useRouter()
  const preloadedRoutes = ref(new Set())
  const userBehavior = ref({
    visitedRoutes: [],
    hoverTime: {},
    clickPatterns: []
  })
  
  // 基于用户行为分析的预加载
  const analyzeAndPreload = () => {
    const { visitedRoutes } = userBehavior.value
    
    // 分析用户访问模式
    const patterns = analyzeUserPatterns(visitedRoutes)
    
    // 预加载可能的下一个路由
    patterns.forEach(pattern => {
      if (pattern.probability > 0.7 && !preloadedRoutes.value.has(pattern.route)) {
        preloadRoute(pattern.route)
      }
    })
  }
  
  const analyzeUserPatterns = (routes) => {
    // 简单的模式分析
    const routeSequences = {}
    
    for (let i = 0; i < routes.length - 1; i++) {
      const current = routes[i]
      const next = routes[i + 1]
      
      if (!routeSequences[current]) {
        routeSequences[current] = {}
      }
      
      routeSequences[current][next] = (routeSequences[current][next] || 0) + 1
    }
    
    // 计算概率
    const patterns = []
    Object.keys(routeSequences).forEach(current => {
      const total = Object.values(routeSequences[current]).reduce((a, b) => a + b, 0)
      
      Object.keys(routeSequences[current]).forEach(next => {
        patterns.push({
          route: next,
          probability: routeSequences[current][next] / total
        })
      })
    })
    
    return patterns.sort((a, b) => b.probability - a.probability)
  }
  
  const preloadRoute = async (routeName) => {
    if (preloadedRoutes.value.has(routeName)) return
    
    try {
      const route = router.resolve({ name: routeName })
      // 预加载逻辑
      preloadedRoutes.value.add(routeName)
    } catch (error) {
      console.error(`预加载路由失败: ${routeName}`, error)
    }
  }
  
  return {
    analyzeAndPreload,
    preloadRoute
  }
}