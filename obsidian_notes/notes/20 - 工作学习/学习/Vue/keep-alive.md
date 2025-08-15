`<keep-alive>` 是 Vue 的一个内置组件，用于缓存动态组件或路由组件的状态，避免重复渲染。当组件在 `<keep-alive>` 内切换时，组件实例会被缓存而不是销毁。

## 基本概念

**作用：**

- 缓存不活动的组件实例
- 保留组件状态，避免重新渲染
- 提高性能，特别是对于复杂组件

## 基本用法

### 1. 缓存动态组件

```html
<template>
  <div>
    <button @click="currentTab = 'Home'">Home</button>
    <button @click="currentTab = 'Profile'">Profile</button>
    <button @click="currentTab = 'Archive'">Archive</button>
    
    <!-- 缓存动态组件 -->
    <keep-alive>
      <component :is="currentTab"></component>
    </keep-alive>
  </div>
</template>

<script>
import Home from './Home.vue'
import Profile from './Profile.vue'
import Archive from './Archive.vue'

export default {
  components: {
    Home,
    Profile,
    Archive
  },
  data() {
    return {
      currentTab: 'Home'
    }
  }
}
</script>
```

### 2. 缓存路由组件

```html
<template>
  <div id="app">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>
```

## 属性配置

### include - 指定缓存的组件

```html
<!-- 字符串 -->
<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>

<!-- 正则表达式 -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>

<!-- 数组 -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>
```

### exclude - 指定不缓存的组件

```html
<keep-alive exclude="Profile">
  <component :is="view"></component>
</keep-alive>
```

### max - 最大缓存实例数

```html
<keep-alive :max="10">
  <component :is="view"></component>
</keep-alive>
```

## 生命周期钩子

被 `<keep-alive>` 缓存的组件会获得两个额外的生命周期钩子：

```javascript
export default {
  name: 'MyComponent',
  // 组件被激活时调用
  activated() {
    console.log('组件被激活')
    // 可以在这里重新获取数据或执行其他操作
  },
  
  // 组件被停用时调用
  deactivated() {
    console.log('组件被停用')
    // 可以在这里清理定时器等
  },
  
  mounted() {
    console.log('组件挂载') // 只在第一次挂载时调用
  },
  
  unmounted() {
    console.log('组件卸载') // 缓存的组件不会调用这个钩子
  }
}
```

## 实际应用场景

### 1. 表单状态保持

```html
<template>
  <div>
    <nav>
      <button @click="currentView = 'UserForm'">用户表单</button>
      <button @click="currentView = 'UserList'">用户列表</button>
    </nav>
    
    <!-- 保持表单输入状态 -->
    <keep-alive include="UserForm">
      <component :is="currentView"></component>
    </keep-alive>
  </div>
</template>
```

### 2. 路由缓存配置

```javascript
// router/index.js
const routes = [
  {
    path: '/home',
    component: Home,
    meta: { keepAlive: true } // 标记需要缓存
  },
  {
    path: '/about',
    component: About,
    meta: { keepAlive: false } // 不缓存
  }
]
```

```html
<!-- App.vue -->
<template>
  <div>
    <!-- 根据路由meta决定是否缓存 -->
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>
```

### 3. 条件缓存

```html
<template>
  <div>
    <keep-alive :include="cachedComponents">
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cachedComponents: []
    }
  },
  methods: {
    // 动态添加缓存组件
    addCache(componentName) {
      if (!this.cachedComponents.includes(componentName)) {
        this.cachedComponents.push(componentName)
      }
    },
    // 移除缓存
    removeCache(componentName) {
      const index = this.cachedComponents.indexOf(componentName)
      if (index > -1) {
        this.cachedComponents.splice(index, 1)
      }
    }
  }
}
</script>
```

## 手动清除缓存

在某些情况下需要手动清除缓存：

```javascript
// Vue 3
import { getCurrentInstance } from 'vue'

export default {
  methods: {
    clearCache() {
      const instance = getCurrentInstance()
      const cache = instance.parent.ctx.$refs.keepAlive.cache
      const keys = instance.parent.ctx.$refs.keepAlive.keys
      
      // 清除指定组件缓存
      delete cache['ComponentName']
      const index = keys.indexOf('ComponentName')
      if (index > -1) {
        keys.splice(index, 1)
      }
    }
  }
}
```

## 注意事项

1. **组件名称**：`include` 和 `exclude` 匹配的是组件的 `name` 选项，不是注册时的名称
2. **内存管理**：合理使用 `max` 属性避免内存泄漏
3. **嵌套路由**：在嵌套路由中使用时要特别注意缓存层级
4. **条件渲染**：与 `v-if` 一起使用时，`v-if` 优先级更高

```html
<!-- 错误：组件不会被缓存 -->
<keep-alive>
  <component v-if="show" :is="view"></component>
</keep-alive>

<!-- 正确 -->
<template v-if="show">
  <keep-alive>
    <component :is="view"></component>
  </keep-alive>
</template>
```

`<keep-alive>` 是优化 Vue 应用性能的重要工具，特别适用于需要保持状态的复杂组件或频繁切换的场景。