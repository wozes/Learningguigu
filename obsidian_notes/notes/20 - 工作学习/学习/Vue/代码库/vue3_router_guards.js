// Vue 3 Router 4 导航守卫的改进

// 1. 全局前置守卫 - next 参数现在是可选的
router.beforeEach(async (to, from) => {
  console.log('全局前置守卫')
  
  // 直接返回 false 取消导航
  if (to.path === '/forbidden') {
    return false
  }
  
  // 返回路由地址重定向
  if (to.path === '/old-path') {
    return '/new-path'
  }
  
  // 返回路由对象重定向
  if (!isAuthenticated() && to.meta.requiresAuth) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }
  
  // 返回 undefined 或 true 表示继续导航
  // 不再需要显式调用 next()
})

// 2. 全局解析守卫
router.beforeResolve(async (to, from) => {
  // 在导航被确认之前，所有组件内守卫和异步路由组件被解析之后调用
  if (to.meta.requiresAuth) {
    try {
      await checkUserPermissions(to.meta.permissions)
    } catch (error) {
      return '/access-denied'
    }
  }
})

// 3. 全局后置钩子 (无变化)
router.afterEach((to, from, failure) => {
  // failure 是新增的参数，表示导航失败的原因
  if (failure) {
    console.error('导航失败:', failure)
  }
  
  // 设置页面标题
  document.title = to.meta.title || 'Default Title'
  
  // 发送页面访问统计
  analytics.track('page_view', {
    path: to.path,
    name: to.name
  })
})

// 4. 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: async (to, from) => {
      // 不再需要 next 参数
      const hasPermission = await checkAdminPermission()
      
      if (!hasPermission) {
        // 直接返回重定向
        return '/access-denied'
      }
      
      // 返回 true 或 undefined 继续导航
      return true
    }
  },
  
  // 多个守卫函数
  {
    path: '/sensitive',
    component: Sensitive,
    beforeEnter: [
      // 第一个守卫：检查登录
      async (to, from) => {
        if (!isLoggedIn()) {
          return '/login'
        }
      },
      // 第二个守卫：检查权限
      async (to, from) => {
        if (!hasPermission('sensitive')) {
          return '/access-denied'
        }
      }
    ]
  }
]

// 5. 组件内守卫的变化
// 选项式API
export default {
  // beforeRouteEnter 不再能通过 next 回调访问 this
  async beforeRouteEnter(to, from) {
    // 现在需要在这里处理数据获取
    const userData = await fetchUser(to.params.id)
    
    // 可以通过路由元信息传递数据
    to.meta.userData = userData
  },
  
  // beforeRouteUpdate 现在可以直接返回
  async beforeRouteUpdate(to, from) {
    if (to.params.id !== from.params.id) {
      this.user = await fetchUser(to.params.id)
    }
    // 不需要调用 next()
  },
  
  beforeRouteLeave(to, from) {
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('确定要离开吗？')
      // 直接返回布尔值
      return answer
    }
  }
}

// 组合式API中的组件守卫
/*
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { ref } from 'vue'

const hasUnsavedChanges = ref(false)

onBeforeRouteUpdate(async (to, from) => {
  // 用户在当前路由改变参数时
  if (to.params.id !== from.params.id) {
    await fetchData(to.params.id)
  }
})

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    return window.confirm('确定要离开吗？')
  }
})
</script>
*/

// 6. 导航失败处理
router.isReady().then(() => {
  console.log('路由器已准备就绪')
})

// 处理导航错误
router.onError((error, to, from) => {
  console.error('路由错误:', error)
  
  if (error.name === 'ChunkLoadError') {
    // 处理代码分割加载失败
    window.location.reload()
  }
})

// 导航结果处理
const navigateWithHandling = async () => {
  try {
    await router.push('/some-route')
    console.log('导航成功')
  } catch (error) {
    if (error.type === 'aborted') {
      console.log('导航被中断')
    } else if (error.type === 'cancelled') {
      console.log('导航被取消')
    } else {
      console.error('导航失败:', error)
    }
  }
}

// 7. 完整的权限控制示例
import { useUserStore } from '@/stores/user'

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  
  // 获取 token
  const token = localStorage.getItem('token')
  
  // 白名单路由
  const whiteList = ['/login', '/register', '/forgot-password']
  
  if (token) {
    if (to.path === '/login') {
      // 已登录用户访问登录页，重定向到首页
      return '/'
    } else {
      // 检查用户信息是否已加载
      if (!userStore.userInfo) {
        try {
          await userStore.getUserInfo()
        } catch (error) {
          // 获取用户信息失败，清除token
          userStore.logout()
          return `/login?redirect=${to.fullPath}`
        }
      }
      
      // 检查路由权限
      if (to.meta.roles) {
        const hasPermission = userStore.roles.some(role => 
          to.meta.roles.includes(role)
        )
        
        if (!hasPermission) {
          return '/403'
        }
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 在白名单中，允许访问
      return
    } else {
      // 重定向到登录页
      return `/login?redirect=${to.fullPath}`
    }
  }
})

// 8. 导航守卫的错误处理
const createSafeGuard = (guardFn) => {
  return async (to, from) => {
    try {
      return await guardFn(to, from)
    } catch (error) {
      console.error('守卫执行出错:', error)
      // 可以选择继续导航或重定向到错误页
      return '/error'
    }
  }
}

// 使用安全守卫
router.beforeEach(createSafeGuard(async (to, from) => {
  // 可能出错的逻辑
  await someAsyncOperation()
}))

// 9. 导航守卫的执行顺序 (Vue 3 中保持不变)
/*
1. 导航被触发
2. 在失活的组件里调用 beforeRouteLeave 守卫
3. 调用全局的 beforeEach 守卫
4. 在重用的组件里调用 beforeRouteUpdate 守卫 (Vue 3: 如果有的话)
5. 在路由配置里调用 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter
8. 调用全局的 beforeResolve 守卫
9. 导航被确认
10. 调用全局的 afterEach 钩子
11. 触发 DOM 更新
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入
*/