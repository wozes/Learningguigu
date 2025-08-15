// Vue 3 Router 4 组合式API用法
import { 
  useRouter, 
  useRoute, 
  onBeforeRouteLeave, 
  onBeforeRouteUpdate 
} from 'vue-router'
import { ref, computed, watch } from 'vue'

// 1. 基本使用
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 获取路由参数
    const userId = computed(() => route.params.id)
    const query = computed(() => route.query)
    
    // 编程式导航
    const goToUser = (id) => {
      router.push(`/user/${id}`)
    }
    
    const goBack = () => {
      router.go(-1)
    }
    
    return {
      userId,
      query,
      goToUser,
      goBack
    }
  }
}

// 2. Script Setup 语法
/*
<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed, watch } from 'vue'

const router = useRouter()
const route = useRoute()

// 响应式路由参数
const userId = computed(() => route.params.id)

// 监听路由变化
watch(() => route.params.id, (newId, oldId) => {
  console.log(`用户ID从 ${oldId} 变为 ${newId}`)
  fetchUserData(newId)
})

// 导航方法
const navigateToProfile = () => {
  router.push({
    name: 'UserProfile',
    params: { id: userId.value }
  })
}

const navigateWithQuery = () => {
  router.push({
    path: '/search',
    query: { q: 'vue', category: 'framework' }
  })
}
</script>
*/

// 3. 组合式API中的路由守卫
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const hasUnsavedChanges = ref(false)
    
    // 路由更新守卫
    onBeforeRouteUpdate(async (to, from) => {
      // 路由参数变化时调用
      if (to.params.id !== from.params.id) {
        await fetchData(to.params.id)
      }
    })
    
    // 路由离开守卫
    onBeforeRouteLeave((to, from) => {
      if (hasUnsavedChanges.value) {
        const answer = window.confirm(
          '你有未保存的更改，确定要离开吗？'
        )
        // 取消导航并停留在同一页面上
        if (!answer) return false
      }
    })
    
    return {
      hasUnsavedChanges
    }
  }
}

// 4. 自定义组合函数
// composables/useRouterHelpers.js
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

export function useRouterHelpers() {
  const router = useRouter()
  const route = useRoute()
  
  // 当前路由是否激活
  const isRouteActive = (routeName) => {
    return computed(() => route.name === routeName)
  }
  
  // 带确认的导航
  const navigateWithConfirm = (to, message = '确定要离开当前页面吗？') => {
    const confirmed = window.confirm(message)
    if (confirmed) {
      return router.push(to)
    }
    return Promise.reject('Navigation cancelled')
  }
  
  // 安全的后退
  const safeGoBack = (fallback = '/') => {
    if (window.history.length > 1) {
      router.go(-1)
    } else {
      router.push(fallback)
    }
  }
  
  // 获取当前路由的面包屑
  const breadcrumbs = computed(() => {
    return route.matched
      .filter(record => record.meta && record.meta.breadcrumb)
      .map(record => ({
        text: record.meta.breadcrumb,
        to: record.path
      }))
  })
  
  return {
    router,
    route,
    isRouteActive,
    navigateWithConfirm,
    safeGoBack,
    breadcrumbs
  }
}

// 在组件中使用自定义组合函数
export default {
  setup() {
    const { 
      isRouteActive, 
      navigateWithConfirm, 
      safeGoBack,
      breadcrumbs 
    } = useRouterHelpers()
    
    return {
      isHomeActive: isRouteActive('Home'),
      navigateWithConfirm,
      safeGoBack,
      breadcrumbs
    }
  }
}

// 5. 异步数据获取的组合函数
// composables/useAsyncRoute.js
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useAsyncRoute(fetcher) {
  const route = useRoute()
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  const fetchData = async () => {
    loading.value = true
    error.value = null
    
    try {
      data.value = await fetcher(route)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  
  // 初始加载
  fetchData()
  
  // 监听路由变化
  watch(() => route.params, fetchData, { deep: true })
  
  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// 使用异步路由数据
export default {
  setup() {
    const { data: user, loading, error } = useAsyncRoute(
      (route) => fetchUser(route.params.id)
    )
    
    return {
      user,
      loading,
      error
    }
  }
}