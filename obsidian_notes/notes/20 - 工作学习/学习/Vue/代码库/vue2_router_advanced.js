// 1. 路由级别的keep-alive
// router/index.js
const routes = [
  {
    path: '/list',
    name: 'List',
    component: () => import('./views/List.vue'),
    meta: {
      keepAlive: true // 需要缓存
    }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('./views/Detail.vue'),
    meta: {
      keepAlive: false // 不需要缓存
    }
  }
]

// App.vue 中使用动态keep-alive
/*
<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>
*/

// 2. 动态路由添加
// 权限控制的动态路由
const asyncRoutes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { roles: ['admin'] },
    children: [
      {
        path: 'users',
        component: () => import('./views/admin/Users.vue'),
        meta: { roles: ['admin'] }
      }
    ]
  }
]

// 根据用户权限动态添加路由
function generateRoutes(roles) {
  return asyncRoutes.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = generateRoutes(route.children, roles)
      }
      return true
    }
    return false
  })
}

function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  }
  return true
}

// 在登录成功后添加路由
router.beforeEach(async (to, from, next) => {
  const token = getToken()
  
  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      
      if (hasRoles) {
        next()
      } else {
        try {
          const { roles } = await store.dispatch('user/getInfo')
          const accessRoutes = generateRoutes(roles)
          
          // 动态添加路由
          router.addRoutes(accessRoutes)
          
          // 确保addRoutes已完成
          next({ ...to, replace: true })
        } catch (error) {
          await store.dispatch('user/resetToken')
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

// 3. 路由传参的多种方式
const routes = [
  // 1. 动态路由参数
  { path: '/user/:id', component: User, props: true },
  
  // 2. 布尔模式：props: true
  { path: '/user/:id', component: User, props: true },
  
  // 3. 对象模式：props为对象
  { path: '/promotion', component: Promotion, props: { newsletter: true } },
  
  // 4. 函数模式：props为函数
  {
    path: '/search',
    component: SearchUser,
    props: (route) => ({ query: route.query.q })
  }
]

// 在组件中接收props
export default {
  name: 'User',
  props: ['id', 'newsletter', 'query'],
  
  created() {
    console.log('ID:', this.id)
    console.log('Newsletter:', this.newsletter)
    console.log('Query:', this.query)
  }
}

// 4. 路由元信息的高级应用
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      title: '仪表盘',
      requiresAuth: true,
      roles: ['admin', 'editor'],
      icon: 'dashboard',
      breadcrumb: [
        { text: '首页', to: '/' },
        { text: '仪表盘', to: '/dashboard' }
      ],
      cache: true,
      affix: true, // 标签页固定
      noCache: false,
      hidden: false, // 是否在菜单中隐藏
      activeMenu: '/dashboard' // 高亮的菜单项
    }
  }
]

// 生成面包屑导航
computed: {
  breadcrumbs() {
    return this.$route.meta.breadcrumb || []
  }
}

// 5. 路由过渡动画
// App.vue
/*
<template>
  <div id="app">
    <transition :name="transitionName" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      transitionName: 'fade'
    }
  },
  
  watch: {
    '$route'(to, from) {
      // 根据路由层级决定动画方向
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      
      if (toDepth < fromDepth) {
        this.transitionName = 'slide-right'
      } else if (toDepth > fromDepth) {
        this.transitionName = 'slide-left'
      } else {
        this.transitionName = 'fade'
      }
    }
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: all 0.3s;
}

.slide-left-enter {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter {
  transform: translateX(-100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
*/

// 6. 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  
  // 处理chunk加载失败
  if (error.name === 'ChunkLoadError') {
    // 重新加载页面
    window.location.reload()
  }
})

// 全局错误边界
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue错误:', err, info)
  
  // 发送错误报告
  if (process.env.NODE_ENV === 'production') {
    // 发送到错误监控服务
    reportError(err, vm, info)
  }
}

// 7. 路由性能优化
// 路由懒加载的分组策略
const routes = [
  // 首页相关 - 优先级最高
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ './views/Home.vue')
  },
  
  // 用户功能 - 按模块分组
  {
    path: '/user',
    component: () => import(/* webpackChunkName: "user" */ './views/User.vue'),
    children: [
      {
        path: 'profile',
        component: () => import(/* webpackChunkName: "user" */ './views/UserProfile.vue')
      }
    ]
  },
  
  // 管理功能 - 独立分组，按需加载
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ './views/Admin.vue')
  }
]

// 预加载策略
router.beforeEach((to, from, next) => {
  // 预加载下一个可能访问的路由
  if (to.meta.preloadRoutes) {
    to.meta.preloadRoutes.forEach(routeName => {
      const route = router.resolve({ name: routeName })
      if (route.resolved.matched.length) {
        // 预加载组件
        route.resolved.matched.forEach(match => {
          if (typeof match.components.default === 'function') {
            match.components.default()
          }
        })
      }
    })
  }
  
  next()
})

// 8. 路由状态管理
// store/modules/router.js
const routerModule = {
  namespaced: true,
  
  state: {
    visitedViews: [],
    cachedViews: []
  },
  
  mutations: {
    ADD_VISITED_VIEW(state, view) {
      if (state.visitedViews.some(v => v.path === view.path)) return
      state.visitedViews.push({
        name: view.name,
        path: view.path,
        title: view.meta.title || 'no-name'
      })
    },
    
    ADD_CACHED_VIEW(state, view) {
      if (state.cachedViews.includes(view.name)) return
      if (!view.meta.noCache) {
        state.cachedViews.push(view.name)
      }
    },
    
    DEL_VISITED_VIEW(state, view) {
      const index = state.visitedViews.findIndex(v => v.path === view.path)
      if (index > -1) {
        state.visitedViews.splice(index, 1)
      }
    }
  },
  
  actions: {
    addView({ commit }, view) {
      commit('ADD_VISITED_VIEW', view)
      commit('ADD_CACHED_VIEW', view)
    },
    
    delView({ commit, state }, view) {
      return new Promise(resolve => {
        commit('DEL_VISITED_VIEW', view)
        resolve({
          visitedViews: [...state.visitedViews],
          cachedViews: [...state.cachedViews]
        })
      })
    }
  }
}

// 在路由守卫中使用
router.afterEach((to) => {
  store.dispatch('tagsView/addView', to)
})

// 9. 路由测试
// tests/router.spec.js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import routes from '@/router/routes'

const localVue = createLocalVue()
localVue.use(VueRouter)

describe('Router', () => {
  let router
  
  beforeEach(() => {
    router = new VueRouter({ routes })
  })
  
  test('应该导航到用户页面', async () => {
    const wrapper = mount(App, {
      localVue,
      router
    })
    
    router.push('/user/123')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.user-page').exists()).toBe(true)
  })
  
  test('应该处理路由守卫', async () => {
    const mockNext = jest.fn()
    const to = { path: '/admin', meta: { requiresAuth: true } }
    const from = { path: '/' }
    
    // 模拟未登录状态
    jest.spyOn(auth, 'isLoggedIn').mockReturnValue(false)
    
    await router.beforeEach(to, from, mockNext)
    
    expect(mockNext).toHaveBeenCalledWith('/login')
  })
})