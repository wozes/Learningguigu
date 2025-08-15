// main.js - Vue 3 + Vue Router 4 基本配置
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// 导入组件
import Home from './components/Home.vue'
import About from './components/About.vue'
import Contact from './components/Contact.vue'

// 定义路由
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
    path: '/contact',
    name: 'Contact',
    component: Contact
  }
]

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Vite
  // history: createWebHistory(process.env.BASE_URL), // Webpack
  routes
})

// 创建应用实例
const app = createApp(App)

// 使用路由器
app.use(router)

// 挂载应用
app.mount('#app')

// App.vue - 根组件
/*
<template>
  <div id="app">
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink to="/contact">联系</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>

<script setup>
// 可以直接使用 RouterLink 和 RouterView，无需导入
</script>

<style scoped>
.router-link-active {
  color: #42b883;
  font-weight: bold;
}
</style>
*/