// 命名路由配置
const routes = [
  {
    path: '/user/:id',
    name: 'user', // 命名路由
    component: User
  },
  {
    path: '/user/:id/profile',
    name: 'user-profile',
    component: UserProfile
  }
]

// 使用命名路由进行导航
export default {
  methods: {
    goToUser() {
      // 使用命名路由
      this.$router.push({ name: 'user', params: { id: '123' } })
      
      // 带查询参数
      this.$router.push({ 
        name: 'user-profile', 
        params: { id: '123' },
        query: { tab: 'settings' }
      })
    }
  }
}

// 命名视图配置
const routes = [
  {
    path: '/',
    components: {
      default: Home,        // 默认视图
      sidebar: Sidebar,     // 侧边栏视图
      header: Header        // 头部视图
    }
  },
  {
    path: '/dashboard',
    components: {
      default: Dashboard,
      sidebar: DashboardSidebar,
      header: DashboardHeader
    }
  }
]

// App.vue - 使用命名视图
/*
<template>
  <div id="app">
    <router-view name="header"></router-view>
    <div class="container">
      <router-view name="sidebar"></router-view>
      <router-view></router-view> <!-- 默认视图 -->
    </div>
  </div>
</template>
*/

// 嵌套命名视图
const routes = [
  {
    path: '/settings',
    component: Settings,
    children: [
      {
        path: 'profile',
        components: {
          default: UserProfile,
          nav: ProfileNav
        }
      },
      {
        path: 'security',
        components: {
          default: SecuritySettings,
          nav: SecurityNav
        }
      }
    ]
  }
]

// Settings.vue
/*
<template>
  <div class="settings">
    <router-view name="nav"></router-view>
    <router-view></router-view>
  </div>
</template>
*/

// router-link 使用命名路由
/*
<template>
  <div>
    <!-- 基本用法 -->
    <router-link :to="{ name: 'user', params: { id: userId } }">
      用户详情
    </router-link>
    
    <!-- 带查询参数 -->
    <router-link :to="{ 
      name: 'user-profile', 
      params: { id: userId },
      query: { tab: 'edit' }
    }">
      编辑资料
    </router-link>
    
    <!-- 使用 v-slot 自定义链接 -->
    <router-link 
      :to="{ name: 'user', params: { id: userId } }"
      v-slot="{ href, route, navigate, isActive, isExactActive }"
      custom
    >
      <li :class="{ active: isActive }">
        <a :href="href" @click="navigate">
          {{ route.params.id }}
        </a>
      </li>
    </router-link>
  </div>
</template>
*/