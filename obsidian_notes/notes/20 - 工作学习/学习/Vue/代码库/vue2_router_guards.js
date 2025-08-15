// 1. 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('全局前置守卫')
  console.log('要前往:', to.path)
  console.log('来自:', from.path)
  
  // 检查是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next() // 确保一定要调用 next()
  }
})

// 2. 全局解析守卫 (在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后调用)
router.beforeResolve((to, from, next) => {
  console.log('全局解析守卫')
  // 可以在这里获取数据
  next()
})

// 3. 全局后置钩子 (不接受next函数，不会改变导航)
router.afterEach((to, from) => {
  console.log('全局后置钩子')
  // 分析、更改页面标题等
  document.title = to.meta.title || '默认标题'
})

// 4. 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      console.log('路由独享守卫')
      // 检查管理员权限
      if (hasAdminPermission()) {
        next()
      } else {
        next('/403') // 跳转到权限不足页面
      }
    }
  }
]

// 5. 组件内的守卫
export default {
  // 在渲染该组件的对应路由被confirm前调用
  beforeRouteEnter(to, from, next) {
    console.log('组件内前置守卫')
    // 不能获取组件实例 `this`，因为当守卫执行前，组件实例还没被创建
    
    // 可以通过传递一个回调给next来访问组件实例
    next(vm => {
      // 通过 `vm` 访问组件实例
      vm.fetchData()
    })
  },
  
  // 在当前路由改变，但是该组件被复用时调用
  beforeRouteUpdate(to, from, next) {
    console.log('组件内更新守卫')
    // 可以访问组件实例 `this`
    this.userId = to.params.id
    this.fetchUser()
    next()
  },
  
  // 导航离开该组件的对应路由时调用
  beforeRouteLeave(to, from, next) {
    console.log('组件内离开守卫')
    // 可以访问组件实例 `this`
    
    // 确认是否离开
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('您有未保存的更改，确定要离开吗？')
      if (answer) {
        next()
      } else {
        next(false) // 取消导航
      }
    } else {
      next()
    }
  }
}

// 路由元信息示例
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: '仪表盘',
      roles: ['admin', 'user'],
      keepAlive: true
    }
  },
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      title: '管理面板',
      roles: ['admin']
    },
    children: [
      {
        path: 'users',
        component: UserManagement,
        meta: {
          title: '用户管理',
          breadcrumb: '用户管理'
        }
      }
    ]
  }
]

// 权限检查的完整示例
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查登录状态
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token')
    
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 检查角色权限
    if (to.meta.roles) {
      const userRoles = getUserRoles() // 获取用户角色
      const hasPermission = to.meta.roles.some(role => userRoles.includes(role))
      
      if (!hasPermission) {
        next('/403')
        return
      }
    }
  }
  
  next()
})

// 导航守卫的完整流程
/*
1. 导航被触发
2. 在失活的组件里调用 beforeRouteLeave 守卫
3. 调用全局的 beforeEach 守卫
4. 在重用的组件里调用 beforeRouteUpdate 守卫
5. 在路由配置里调用 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter
8. 调用全局的 beforeResolve 守卫
9. 导航被确认
10. 调用全局的 afterEach 钩子
11. 触发 DOM 更新
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入
*/