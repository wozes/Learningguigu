// Vue 3 Router 4 TypeScript 支持

// 1. 基本类型定义
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 定义路由记录类型
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    props: true,
    meta: {
      title: '用户详情',
      requiresAuth: true
    }
  }
]

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 2. 扩展路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    roles?: string[]
    keepAlive?: boolean
    hidden?: boolean
    affix?: boolean
    breadcrumb?: boolean
    activeMenu?: string
    permissions?: string[]
  }
}

// 3. 类型安全的路由组合函数
import { useRouter, useRoute } from 'vue-router'
import { computed, ComputedRef } from 'vue'

// 定义用户角色类型
type UserRole = 'admin' | 'editor' | 'user'

// 定义路由名称类型
type RouteNames = 'Home' | 'User' | 'Admin' | 'Profile'

interface RouteHelpers {
  router: ReturnType<typeof useRouter>
  route: ReturnType<typeof useRoute>
  isAuthenticated: ComputedRef<boolean>
  userRoles: ComputedRef<UserRole[]>
  canAccess: (routeName: RouteNames) => boolean
  navigateTo: (name: RouteNames, params?: Record<string, string>) => Promise<void>
}

export function useTypedRouter(): RouteHelpers {
  const router = useRouter()
  const route = useRoute()
  
  const isAuthenticated = computed(() => {
    return !!localStorage.getItem('token')
  })
  
  const userRoles = computed<UserRole[]>(() => {
    const roles = localStorage.getItem('userRoles')
    return roles ? JSON.parse(roles) : []
  })
  
  const canAccess = (routeName: RouteNames): boolean => {
    const targetRoute = router.resolve({ name: routeName })
    const requiredRoles = targetRoute.meta.roles as UserRole[] | undefined
    
    if (!requiredRoles) return true
    
    return requiredRoles.some(role => userRoles.value.includes(role))
  }
  
  const navigateTo = async (name: RouteNames, params?: Record<string, string>): Promise<void> => {
    if (!canAccess(name)) {
      throw new Error(`没有权限访问路由: ${name}`)
    }
    
    await router.push({ name, params })
  }
  
  return {
    router,
    route,
    isAuthenticated,
    userRoles,
    canAccess,
    navigateTo
  }
}

// 4. 类型安全的路由守卫
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

// 定义守卫返回类型
type GuardResult = boolean | string | { path: string; query?: Record<string, string> }

// 创建类型安全的守卫
function createAuthGuard() {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<GuardResult> => {
    const requiresAuth = to.meta.requiresAuth as boolean | undefined
    
    if (!requiresAuth) return true
    
    const token = localStorage.getItem('token')
    if (!token) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }
    
    // 检查角色权限
    const requiredRoles = to.meta.roles as UserRole[] | undefined
    if (requiredRoles) {
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]') as UserRole[]
      const hasPermission = requiredRoles.some(role => userRoles.includes(role))
      
      if (!hasPermission) {
        return '/access-denied'
      }
    }
    
    return true
  }
}

// 使用类型安全的守卫
router.beforeEach(createAuthGuard())

// 5. 路由参数类型定义
// types/router.ts
export interface UserRouteParams {
  id: string
}

export interface ProductRouteParams {
  category: string
  productId: string
}

export interface SearchQuery {
  q?: string
  category?: string
  page?: string
}

// 在组件中使用类型化的路由参数
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import type { UserRouteParams, SearchQuery } from '@/types/router'

export default defineComponent({
  setup() {
    const route = useRoute()
    
    // 类型安全的参数访问
    const userId = computed(() => (route.params as UserRouteParams).id)
    const searchQuery = computed(() => route.query as SearchQuery)
    
    return {
      userId,
      searchQuery
    }
  }
})

// 6. 类型安全的路由配置生成器
interface RouteConfig {
  path: string
  name: string
  component: () => Promise<any>
  meta?: RouteMeta
  children?: RouteConfig[]
}

function createTypedRoute(config: RouteConfig): RouteRecordRaw {
  return {
    path: config.path,
    name: config.name,
    component: config.component,
    meta: config.meta,
    children: config.children?.map(createTypedRoute)
  }
}

// 使用配置生成器
const userRoutes: RouteConfig = {
  path: '/user',
  name: 'UserLayout',
  component: () => import('@/layouts/UserLayout.vue'),
  meta: {
    title: '用户中心',
    requiresAuth: true
  },
  children: [
    {
      path: 'profile',
      name: 'UserProfile',
      component: () => import('@/views/user/Profile.vue'),
      meta: {
        title: '个人资料'
      }
    },
    {
      path: 'settings',
      name: 'UserSettings',
      component: () => import('@/views/user/Settings.vue'),
      meta: {
        title: '账户设置'
      }
    }
  ]
}

const typedRoutes: RouteRecordRaw[] = [
  createTypedRoute(userRoutes)
]

// 7. 动态路由的类型定义
interface DynamicRouteConfig {
  module: string
  routes: RouteConfig[]
  permissions: string[]
}

class DynamicRouteManager {
  private router: ReturnType<typeof createRouter>
  private loadedModules = new Set<string>()
  
  constructor(router: ReturnType<typeof createRouter>) {
    this.router = router
  }
  
  async loadModule(config: DynamicRouteConfig): Promise<void> {
    if (this.loadedModules.has(config.module)) {
      return
    }
    
    // 检查权限
    const hasPermission = this.checkPermissions(config.permissions)
    if (!hasPermission) {
      throw new Error(`没有权限加载模块: ${config.module}`)
    }
    
    // 添加路由
    config.routes.forEach(route => {
      this.router.addRoute(createTypedRoute(route))
    })
    
    this.loadedModules.add(config.module)
  }
  
  unloadModule(moduleName: string): void {
    // 移除模块相关的路由
    this.router.getRoutes()
      .filter(route => route.meta?.module === moduleName)
      .forEach(route => {
        if (route.name) {
          this.router.removeRoute(route.name)
        }
      })
    
    this.loadedModules.delete(moduleName)
  }
  
  private checkPermissions(permissions: string[]): boolean {
    const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]')
    return permissions.every(permission => userPermissions.includes(permission))
  }
}

// 8. 路由状态管理的类型定义
interface RouteState {
  currentRoute: RouteLocationNormalized | null
  history: RouteLocationNormalized[]
  cachedViews: string[]
  visitedViews: Array<{
    name: string
    path: string
    title: string
    affix: boolean
  }>
}

// 使用 Pinia 进行类型安全的路由状态管理
import { defineStore } from 'pinia'

export const useRouterStore = defineStore('router', {
  state: (): RouteState => ({
    currentRoute: null,
    history: [],
    cachedViews: [],
    visitedViews: []
  }),
  
  getters: {
    canGoBack: (state): boolean => state.history.length > 1,
    
    breadcrumbs: (state): Array<{ text: string; to: string }> => {
      if (!state.currentRoute) return []
      
      return state.currentRoute.matched
        .filter(record => record.meta?.breadcrumb !== false)
        .map(record => ({
          text: record.meta?.title || record.name?.toString() || '',
          to: record.path
        }))
    }
  },
  
  actions: {
    setCurrentRoute(route: RouteLocationNormalized) {
      this.currentRoute = route
      this.addToHistory(route)
    },
    
    addToHistory(route: RouteLocationNormalized) {
      if (this.history[this.history.length - 1]?.path !== route.path) {
        this.history.push(route)
      }
    },
    
    addCachedView(name: string) {
      if (!this.cachedViews.includes(name)) {
        this.cachedViews.push(name)
      }
    },
    
    removeCachedView(name: string) {
      const index = this.cachedViews.indexOf(name)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    }
  }
})