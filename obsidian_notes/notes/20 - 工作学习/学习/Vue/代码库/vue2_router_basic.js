// main.js - 基本配置
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

// 导入組件
import Home from './components/Home.vue'
import About from './components/About.vue'
import Contact from './components/Contact.vue'

// 使用路由插件
Vue.use(VueRouter)

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

// 创建路由实例
const router = new VueRouter({
  mode: 'history', // 使用HTML5 History模式
  base: process.env.BASE_URL,
  routes
})

// 创建Vue实例
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

// App.vue - 根组件模板
/*
<template>
  <div id="app">
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link to="/contact">联系</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style>
.router-link-active {
  color: red;
  font-weight: bold;
}
</style>
*/