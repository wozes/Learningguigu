// 嵌套路由配置
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      // 空路径表示默认子路由
      { path: '', component: UserHome },
      
      // 当匹配到 /user/:id/profile 时
      { path: 'profile', component: UserProfile },
      
      // 当匹配到 /user/:id/posts 时
      { path: 'posts', component: UserPosts },
      
      // 嵌套的动态路由
      { path: 'posts/:postId', component: UserPostDetail },
      
      // 命名视图的子路由
      {
        path: 'settings',
        components: {
          default: UserSettings,
          sidebar: UserSettingsSidebar
        }
      }
    ]
  }
]

// User.vue - 父组件
/*
<template>
  <div class="user">
    <h2>用户 {{ $route.params.id }}</h2>
    <nav>
      <router-link :to="`/user/${$route.params.id}`">首页</router-link>
      <router-link :to="`/user/${$route.params.id}/profile`">个人资料</router-link>
      <router-link :to="`/user/${$route.params.id}/posts`">文章</router-link>
      <router-link :to="`/user/${$route.params.id}/settings`">设置</router-link>
    </nav>
    <!-- 子路由组件会渲染在这里 -->
    <router-view></router-view>
  </div>
</template>
*/

export default {
  name: 'User',
  created() {
    console.log('父路由参数:', this.$route.params.id)
  }
}

// UserProfile.vue - 子组件
export default {
  name: 'UserProfile',
  created() {
    // 子组件也可以访问所有路由参数
    console.log('用户ID:', this.$route.params.id)
  }
}

// UserPostDetail.vue - 嵌套动态路由组件
export default {
  name: 'UserPostDetail',
  created() {
    console.log('用户ID:', this.$route.params.id)
    console.log('文章ID:', this.$route.params.postId)
  }
}

// 更复杂的嵌套路由示例
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: Dashboard
      },
      {
        path: 'users',
        component: UserManagement,
        children: [
          { path: '', component: UserList },
          { path: 'create', component: UserCreate },
          { path: ':id/edit', component: UserEdit }
        ]
      },
      {
        path: 'products',
        component: ProductManagement,
        children: [
          { path: '', component: ProductList },
          { path: 'create', component: ProductCreate },
          { path: ':id', component: ProductDetail }
        ]
      }
    ]
  }
]