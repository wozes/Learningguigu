// Vue 3 Router 4 动态路由的改进

// 1. 基本动态路由添加和删除
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home }
  ]
})

// 添加路由
router.addRoute({
  path: '/about',
  name: 'About',
  component: About
})

// 添加嵌套路由
router.addRoute('ParentRoute', {
  path: 'child',
  name: 'Child',
  component: Child
})

// 删除路由
router.removeRoute('About')

// 检查路由是否存在
if (router.hasRoute('About')) {
  console.log('About 路由存在')
}

// 获取所有路由
const routes = router.getRoutes()
console.log('所有路由:', routes)

// 2. 权限控制的动态路由系统
// stores/permission.js (使用 Pinia)
import { defineStore } from 'pinia'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    dynamicRoutes: [],
    addRoutes: []
  }),
  
  actions: {
    generateRoutes(roles) {
      return new Promise(resolve => {
        let accessedRoutes
        
        if (roles.includes('admin')) {
          accessedRoutes = asyncRoutes || []
        } else {
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        }
        
        this.addRoutes = accessedRoutes
        this.routes = constantRoutes.concat(accessedRoutes)
        
        resolve(accessedRoutes)
      })
    }
  }
})

// 过滤异步路由
function filterAsyncRoutes(routes, roles) {
  const res = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  
  return res
}

function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

// 异步路由配置
const asyncRoutes = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: {
      title: '管理员',
      icon: 'admin',
      roles: ['admin']
    },
    children: [
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: {
          title: '用户管理',
          roles: ['admin']
        }
      },
      {
        path: 'roles',
        name: 'AdminRoles',
        component: () => import('@/views/admin/Roles.vue'),
        meta: {
          title: '角色管理',
          roles: ['admin']
        }
      }
    ]
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('@/layouts/EditorLayout.vue'),
    meta: {
      title: '编辑者',
      icon: 'editor',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'articles',
        name: 'EditorArticles',
        component: () => import('@/views/editor/Articles.vue'),
        meta: {
          title: '文章管理',
          roles: ['admin', 'editor']
        }
      }
    ]
  }
]

// 3. 在登录后动态添加路由
// composables/usePermission.js
import { useRouter } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const router = useRouter()
  const permissionStore = usePermissionStore()
  const userStore = useUserStore()
  
  const addDynamicRoutes = async () => {
    try {
      // 获取用户角色
      const roles = userStore.roles
      
      // 生成可访问的路由
      const accessRoutes = await permissionStore.generateRoutes(roles)
      
      // 动态添加路由
      accessRoutes.forEach(route => {
        router.addRoute(route)
      })
      
      return accessRoutes
    } catch (error) {
      console.error('添加动态路由失败:', error)
      throw error
    }
  }
  
  const resetRoutes = () => {
    // 重置路由 - 移除动态添加的路由
    permissionStore.addRoutes.forEach(route => {
      if (route.name) {
        router.removeRoute(route.name)
      }
    })
    
    permissionStore.$reset()
  }
  
  return {
    addDynamicRoutes,
    resetRoutes
  }
}

// 4. 在路由守卫中使用动态路由
router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const { addDynamicRoutes } = usePermission()
  
  const hasToken = userStore.token
  
  if (hasToken) {
    if (to.path === '/login') {
      return '/'
    } else {
      const hasRoles = userStore.roles && userStore.roles.length > 0
      
      if (hasRoles) {
        return true
      } else {
        try {
          // 获取用户信息
          const { roles } = await userStore.getInfo()
          
          // 基于角色生成可访问的路由
          await addDynamicRoutes()
          
          // 重要：确保添加路由后重新导航
          return { ...to, replace: true }
        } catch (error) {
          await userStore.resetToken()
          return `/login?redirect=${to.path}`
        }
      }
    }
  } else {
    // 没有token的处理
    const whiteList = ['/login', '/auth-redirect']
    
    if (whiteList.includes(to.path)) {
      return true
    } else {
      return `/login?redirect=${to.path}`
    }
  }
})

// 5. 路由元信息的类型安全 (TypeScript)
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    roles?: string[]
    keepAlive?: boolean
    hidden?: boolean
    affix?: boolean
    breadcrumb?: boolean
    activeMenu?: string
  }
}

// 6. 动态路由的缓存策略
// composables/useRouterCache.js
import { ref, computed } from 'vue'

const cachedRoutes = ref(new Set())
const visitedRoutes = ref([])

export function useRouterCache() {
  const addCachedRoute = (route) => {
    if (route.meta?.keepAlive) {
      cachedRoutes.value.add(route.name)
    }
  }
  
  const removeCachedRoute = (route) => {
    cachedRoutes.value.delete(route.name)
  }
  
  const addVisitedRoute = (route) => {
    if (visitedRoutes.value.some(v => v.path === route.path)) return
    
    visitedRoutes.value.push({
      name: route.name,
      path: route.path,
      title: route.meta?.title || 'no-name',
      affix: route.meta?.affix || false
    })
  }
  
  const removeVisitedRoute = (route) => {
    const index = visitedRoutes.value.findIndex(v => v.path === route.path)
    if (index > -1) {
      visitedRoutes.value.splice(index, 1)
    }
  }
  
  const cachedRouteNames = computed(() => Array.from(cachedRoutes.value))
  
  return {
    cachedRoutes: cachedRouteNames,
    visitedRoutes,
    addCachedRoute,
    removeCachedRoute,
    addVisitedRoute,
    removeVisitedRoute
  }
}

// 7. 多级嵌套路由的动态处理
function transformRoutes(routes) {
  const transformedRoutes = []
  
  routes.forEach(route => {
    const transformedRoute = {
      ...route,
      component: route.component || (() => import('@/layouts/EmptyLayout.vue'))
    }
    
    if (route.children && route.children.length > 0) {
      transformedRoute.children = transformRoutes(route.children)
    }
    
    transformedRoutes.push(transformedRoute)
  })
  
  return transformedRoutes
}

// 8. 路由懒加载的改进
// utils/routerHelper.js
export function createAsyncComponent(loader) {
  return defineAsyncComponent({
    loader,
    loadingComponent: () => import('@/components/Loading.vue'),
    errorComponent: () => import('@/components/Error.vue'),
    delay: 200,
    timeout: 3000
  })
}

// 在路由配置中使用
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: createAsyncComponent(() => import('@/views/Dashboard.vue')),
    meta: { requiresAuth: true }
  }
]

// 9. 路由状态持久化
// composables/useRoutePersistence.js
import { useRouter, useRoute } from 'vue-router'
import { watch } from 'vue'

export function useRoutePersistence() {
  const router = useRouter()
  const route = useRoute()
  
  // 保存路由状态
  const saveRouteState = () => {
    const routeState = {
      path: route.path,
      query: route.query,
      params: route.params,
      timestamp: Date.now()
    }
    
    sessionStorage.setItem('routeState', JSON.stringify(routeState))
  }
  
  // 恢复路由状态
  const restoreRouteState = () => {
    const savedState = sessionStorage.getItem('routeState')
    
    if (savedState) {
      try {
        const routeState = JSON.parse(savedState)
        
        // 检查是否在有效期内（如30分钟）
        const isValid = Date.now() - routeState.timestamp < 30 * 60 * 1000
        
        if (isValid) {
          router.replace({
            path: routeState.path,
            query: routeState.query,
            params: routeState.params
          })
        }
      } catch (error) {
        console.error('恢复路由状态失败:', error)
      }
    }
  }
  
  // 监听路由变化并保存状态
  watch(() => route.fullPath, saveRouteState)
  
  return {
    saveRouteState,
    restoreRouteState
  }
}
  