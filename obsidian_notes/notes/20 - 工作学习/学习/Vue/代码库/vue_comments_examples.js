// Vue 2 - 全局设置
new Vue({
  el: '#app',
  comments: true, // 保留模板中的注释
  template: `
    <div>
      <!-- 这是一个注释，会被保留 -->
      <h1>Hello World</h1>
      <!-- 另一个注释 -->
    </div>
  `
})

// Vue 2 - 组件中设置
export default {
  name: 'MyComponent',
  comments: true, // 在组件中启用注释保留
  template: `
    <div>
      <!-- 组件内的注释 -->
      <p>组件内容</p>
    </div>
  `
}

// Vue 3 - 在应用级别设置
import { createApp } from 'vue'

const app = createApp({
  template: `
    <div>
      <!-- Vue 3 中的注释 -->
      <h1>Vue 3 应用</h1>
    </div>
  `
})

// Vue 3 中需要在编译时配置
// vite.config.js 或 webpack 配置
export default {
  // Vite 配置
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_OPTIONS_API__: true
  },
  // 或者在 Vue 编译器选项中
  vue: {
    template: {
      compilerOptions: {
        comments: true // 保留注释
      }
    }
  }
}

// 使用 Vue CLI 的 vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.compilerOptions = {
          ...options.compilerOptions,
          comments: true
        }
        return options
      })
  }
}

// 单文件组件中的示例
// MyComponent.vue
export default {
  name: 'MyComponent',
  comments: true, // Vue 2 中的组件级设置
}

// 在模板中使用注释
// Template 部分
`
<template>
  <div class="container">
    <!-- 页面标题区域 -->
    <header>
      <h1>{{ title }}</h1>
    </header>
    
    <!-- 主要内容区域 -->
    <main>
      <!-- 用户信息卡片 -->
      <div class="user-card" v-for="user in users" :key="user.id">
        <!-- 用户头像 -->
        <img :src="user.avatar" :alt="user.name + '的头像'">
        
        <!-- 用户基本信息 -->
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
        </div>
      </div>
    </main>
    
    <!-- 页脚信息 -->
    <footer>
      <!-- 版权信息 -->
      <p>&copy; 2024 My App</p>
    </footer>
  </div>
</template>
`

// 条件注释的处理
// 某些情况下可能需要动态添加注释
export default {
  methods: {
    addConditionalComment() {
      // 通过 JavaScript 动态添加注释节点
      const comment = document.createComment('动态添加的注释')
      this.$el.appendChild(comment)
    }
  },
  mounted() {
    if (process.env.NODE_ENV === 'development') {
      this.addConditionalComment()
    }
  }
}