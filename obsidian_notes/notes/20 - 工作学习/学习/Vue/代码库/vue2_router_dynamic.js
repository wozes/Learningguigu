// 动态路由配置
const routes = [
  // 动态路径参数以冒号开头
  { path: '/user/:id', component: User },
  
  // 多个参数
  { path: '/user/:id/post/:postId', component: UserPost },
  
  // 可选参数 (使用?)
  { path: '/user/:id?', component: User },
  
  // 零个或多个参数 (使用*)
  { path: '/user/*', component: User },
  
  // 一个或多个参数 (使用+)
  { path: '/user/:id+', component: User },
  
  // 自定义正则表达式
  { path: '/user/:id(\\d+)', component: User }, // 只匹配数字
  
  // 命名路由
  {
    path: '/user/:id',
    name: 'user',
    component: User,
    props: true // 将参数作为props传递给组件
  }
]

// User.vue 组件
export default {
  name: 'User',
  props: ['id'], // 当props: true时接收路由参数
  
  created() {
    console.log('用户ID:', this.$route.params.id)
    console.log('查询参数:', this.$route.query)
    console.log('Hash:', this.$route.hash)
  },
  
  watch: {
    // 监听路由变化
    '$route'(to, from) {
      console.log('路由从', from.path, '变化到', to.path)
      this.fetchUser()
    },
    
    // 只监听参数变化
    '$route.params.id'(newId, oldId) {
      console.log('用户ID从', oldId, '变化到', newId)
    }
  },
  
  methods: {
    fetchUser() {
      const userId = this.$route.params.id
      // 获取用户数据的逻辑
    }
  }
}

// 路由跳转示例
export default {
  methods: {
    goToUser() {
      // 字符串路径
      this.$router.push('/user/123')
      
      // 对象形式
      this.$router.push({ path: '/user/123' })
      
      // 命名路由
      this.$router.push({ name: 'user', params: { id: '123' } })
      
      // 带查询参数
      this.$router.push({ 
        path: '/user/123', 
        query: { tab: 'profile' } 
      })
      
      // 替换当前历史记录
      this.$router.replace('/user/456')
      
      // 前进/后退
      this.$router.go(-1) // 后退一步
      this.$router.go(1)  // 前进一步
      this.$router.back() // 后退
      this.$router.forward() // 前进
    }
  }
}