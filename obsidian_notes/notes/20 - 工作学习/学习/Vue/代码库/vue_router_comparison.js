// Vue 2 + Vue Router 3 示例
// main.js (Vue 2)
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Home from './components/Home.vue'
import About from './components/About.vue'
import User from './components/User.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { 
    path: '/user/:id', 
    component: User,
    props: true,
    beforeEnter(to, from, next) {
      // 路由级守卫
      console.log('Entering user route')
      next()
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

// 全局守卫
router.beforeEach((to, from, next) => {
  console.log('Global before guard')
  next()
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

// 组件中使用 (Vue 2)
export default {
  name: 'UserComponent',
  data() {
    return {
      user: null
    }
  },
  created() {
    this.fetchUser()
  },
  watch: {
    '$route'(to, from) {
      // 响应路由变化
      this.fetchUser()
    }
  },
  methods: {
    fetchUser() {
      const userId = this.$route.params.id
      // 获取用户数据
    },
    goBack() {
      this.$router.go(-1)
    },
    goToAbout() {
      this.$router.push('/about')
    }
  }
}

// ===================================

// Vue 3 + Vue Router 4 示例
// main.js (Vue 3)
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './components/Home.vue'
import About from './components/About.vue'
import User from './components/User.vue'

const routes = [
  { 
    path: '/', 
    name: 'Home',
    component: Home 
  },
  { 
    path: '/about', 
    name: 'About',
    component: About 
  },
  { 
    path: '/user/:id', 
    name: 'User',
    component: User,
    props: true,
    beforeEnter(to, from) {
      // 路由级守卫 (Vue 3中next参数是可选的)
      console.log('Entering user route')
      return true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局守卫
router.beforeEach((to, from) => {
  console.log('Global before guard')
  return true
})

const app = createApp(App)
app.use(router)
app.mount('#app')

// 组合式API组件 (Vue 3)
import { ref, watch } from 'vue'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'

export default {
  name: 'UserComponent',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const user = ref(null)
    
    // 获取用户数据
    const fetchUser = () => {
      const userId = route.params.id
      // 获取用户数据逻辑
    }
    
    // 监听路由变化
    watch(() => route.params.id, (newId) => {
      fetchUser()
    })
    
    // 路由守卫
    onBeforeRouteUpdate((to, from) => {
      // 路由更新前的逻辑
      console.log('Route updating')
    })
    
    // 初始加载
    fetchUser()
    
    const goBack = () => {
      router.go(-1)
    }
    
    const goToAbout = async () => {
      try {
        await router.push({ name: 'About' })
        console.log('Navigation completed')
      } catch (error) {
        console.log('Navigation failed', error)
      }
    }
    
    return {
      user,
      goBack,
      goToAbout
    }
  }
}

// 动态路由管理 (Vue 3新特性)
// 添加路由
router.addRoute({
  path: '/admin',
  name: 'Admin',
  component: () => import('./components/Admin.vue')
})

// 嵌套路由添加
router.addRoute('User', {
  path: 'profile',
  name: 'UserProfile',
  component: () => import('./components/UserProfile.vue')
})

// 删除路由
router.removeRoute('Admin')

// 检查路由是否存在
if (router.hasRoute('Admin')) {
  console.log('Admin route exists')
}