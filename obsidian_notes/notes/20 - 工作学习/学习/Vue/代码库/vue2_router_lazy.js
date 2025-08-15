// 1. 基本懒加载
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./components/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('./components/About.vue')
  }
]

// 2. 分组懒加载 (webpack chunk name)
const routes = [
  {
    path: '/user',
    name: 'User',
    // webpackChunkName 用于分组，相同名称的会打包在一起
    component: () => import(/* webpackChunkName: "user" */ './components/User.vue')
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import(/* webpackChunkName: "user" */ './components/UserProfile.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "admin" */ './components/Admin.vue')
  }
]

// 3. 条件懒加载
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => {
      // 根据条件决定加载哪个组件
      if (userRole === 'admin') {
        return import('./components/AdminDashboard.vue')
      } else {
        return import('./components/UserDashboard.vue')
      }
    }
  }
]

// 4. 异步组件 + 错误处理
const AsyncComponent = () => ({
  // 需要加载的组件 (应该是一个 `Promise` 对象)
  component: import('./components/MyComponent.vue'),
  // 异步组件加载时使用的组件
  loading: LoadingComponent,
  // 加载失败时使用的组件
  error: ErrorComponent,
  // 展示加载时组件的延时时间。默认值是 200 (毫秒)
  delay: 200,
  // 如果提供了超时时间且组件加载也超时了，
  // 则使用加载失败时使用的组件。默认值是：`Infinity`
  timeout: 3000
})

const routes = [
  {
    path: '/async',
    component: AsyncComponent
  }
]

// 5. 高级懒加载配置
// webpack.config.js 或 vue.config.js 配置
/*
module.exports = {
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true
          }
        }
      }
    }
  }
}
*/

// 6. 预加载和预获取
const routes = [
  {
    path: '/important',
    name: 'Important',
    // webpackPreload: 在父 chunk 加载时，以并行方式开始加载
    component: () => import(/* webpackPreload: true */ './components/Important.vue')
  },
  {
    path: '/future',
    name: 'Future',
    // webpackPrefetch: 在浏览器空闲时才开始下载
    component: () => import(/* webpackPrefetch: true */ './components/Future.vue')
  }
]

// 7. 路由级别的代码分割实践
const routes = [
  // 首页 - 立即加载
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  
  // 用户相关 - 分组加载
  {
    path: '/user',
    name: 'User',
    component: () => import(/* webpackChunkName: "user" */ './views/User.vue'),
    children: [
      {
        path: 'profile',
        component: () => import(/* webpackChunkName: "user" */ './views/UserProfile.vue')
      },
      {
        path: 'settings',
        component: () => import(/* webpackChunkName: "user" */ './views/UserSettings.vue')
      }
    ]
  },
  
  // 管理员功能 - 独立分组
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "admin" */ './views/Admin.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'users',
        component: () => import(/* webpackChunkName: "admin" */ './views/AdminUsers.vue')
      },
      {
        path: 'reports',
        component: () => import(/* webpackChunkName: "admin" */ './views/AdminReports.vue')
      }
    ]
  },
  
  // 功能模块 - 按功能分组
  {
    path: '/products',
    component: () => import(/* webpackChunkName: "products" */ './views/Products.vue')
  },
  {
    path: '/orders',
    component: () => import(/* webpackChunkName: "orders" */ './views/Orders.vue')
  }
]

// 8. 动态导入的错误处理
const loadComponent = (componentPath) => {
  return () => import(componentPath).catch(error => {
    console.error('组件加载失败:', error)
    // 返回一个错误组件
    return import('./components/ErrorComponent.vue')
  })
}

const routes = [
  {
    path: '/safe-component',
    component: loadComponent('./components/SafeComponent.vue')
  }
]

// 9. 加载状态管理
// store/modules/loading.js
const loading = {
  state: {
    routeLoading: false
  },
  mutations: {
    SET_ROUTE_LOADING(state, loading) {
      state.routeLoading = loading
    }
  }
}

// 在路由守卫中使用
router.beforeEach((to, from, next) => {
  store.commit('SET_ROUTE_LOADING', true)
  next()
})

router.afterEach(() => {
  store.commit('SET_ROUTE_LOADING', false)
})