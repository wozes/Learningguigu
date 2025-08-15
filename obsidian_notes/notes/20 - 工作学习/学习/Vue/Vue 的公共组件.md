Vue 的公共组件可以分为几个层面：内置组件、UI 库组件、以及项目中的自定义公共组件。我来详细介绍一下：

## Vue 内置组件

### 基础内置组件

```html
<!-- 动态组件 -->
<component :is="currentComponent"></component>

<!-- 缓存组件 -->
<keep-alive>
  <component :is="view"></component>
</keep-alive>

<!-- 插槽分发 -->
<slot name="header"></slot>
<slot></slot>

<!-- 传送门 -->
<teleport to="body">
  <div class="modal">模态框内容</div>
</teleport>

<!-- 异步组件包装器 -->
<suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <div>加载中...</div>
  </template>
</suspense>
```

### 过渡动画组件

```html
<!-- 单元素/组件过渡 -->
<transition name="fade">
  <div v-if="show">内容</div>
</transition>

<!-- 列表过渡 -->
<transition-group name="list" tag="ul">
  <li v-for="item in items" :key="item.id">{{ item.name }}</li>
</transition-group>
```

## 常见 UI 库公共组件

### Element Plus / Ant Design Vue 等常见组件

**基础组件：**

```html
<!-- 按钮 -->
<el-button type="primary" @click="handleClick">确定</el-button>

<!-- 输入框 -->
<el-input v-model="value" placeholder="请输入"></el-input>

<!-- 选择器 -->
<el-select v-model="selected">
  <el-option label="选项1" value="1"></el-option>
</el-select>
```

**布局组件：**

```html
<!-- 栅格布局 -->
<el-row :gutter="20">
  <el-col :span="12">内容1</el-col>
  <el-col :span="12">内容2</el-col>
</el-row>

<!-- 容器布局 -->
<el-container>
  <el-header>Header</el-header>
  <el-main>Main</el-main>
  <el-footer>Footer</el-footer>
</el-container>
```

**导航组件：**

```html
<!-- 菜单 -->
<el-menu mode="horizontal">
  <el-menu-item index="1">首页</el-menu-item>
  <el-menu-item index="2">产品</el-menu-item>
</el-menu>

<!-- 面包屑 -->
<el-breadcrumb separator="/">
  <el-breadcrumb-item>首页</el-breadcrumb-item>
  <el-breadcrumb-item>产品</el-breadcrumb-item>
</el-breadcrumb>
```

## 项目中的自定义公共组件

### 1. 表单组件### 2. 表格组件### 3. 弹窗组件### 4. 布局组件

```javascript
// Layout.vue - 页面布局组件
<template>
  <div class="app-layout">
    <div class="layout-header">
      <slot name="header">
        <AppHeader />
      </slot>
    </div>
    
    <div class="layout-body">
      <div v-if="showSidebar" class="layout-sidebar">
        <slot name="sidebar">
          <AppSidebar />
        </slot>
      </div>
      
      <div class="layout-main" :class="{ 'no-sidebar': !showSidebar }">
        <div v-if="showBreadcrumb" class="layout-breadcrumb">
          <slot name="breadcrumb">
            <AppBreadcrumb />
          </slot>
        </div>
        
        <div class="layout-content">
          <slot></slot>
        </div>
      </div>
    </div>
    
    <div v-if="showFooter" class="layout-footer">
      <slot name="footer">
        <AppFooter />
      </slot>
    </div>
  </div>
</template>
```

### 5. 工具类组件

```javascript
// Loading.vue - 加载组件
<template>
  <div v-if="loading" class="loading-wrapper" :class="wrapperClass">
    <div class="loading-content">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

// Empty.vue - 空状态组件
<template>
  <div class="empty-container">
    <img :src="image" alt="empty" class="empty-image" />
    <p class="empty-description">{{ description }}</p>
    <slot name="extra"></slot>
  </div>
</template>

// ErrorBoundary.vue - 错误边界组件
<template>
  <div>
    <slot v-if="!hasError"></slot>
    <div v-else class="error-fallback">
      <h3>出现错误</h3>
      <p>{{ errorMessage }}</p>
      <el-button @click="retry">重试</el-button>
    </div>
  </div>
</template>
```

### 6. 业务组件

```javascript
// FileUpload.vue - 文件上传组件
// ImagePreview.vue - 图片预览组件
// RichEditor.vue - 富文本编辑器
// Chart.vue - 图表组件
// Calendar.vue - 日历组件
// TreeSelect.vue - 树形选择器
// CascaderSelect.vue - 级联选择器
```

## 组件注册和使用

### 全局注册

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

// 导入公共组件
import BaseModal from '@/components/BaseModal.vue'
import DataTable from '@/components/DataTable.vue'
import SearchForm from '@/components/SearchForm.vue'

const app = createApp(App)

// 全局注册
app.component('BaseModal', BaseModal)
app.component('DataTable', DataTable)
app.component('SearchForm', SearchForm)

app.mount('#app')
```

### 按需导入

```javascript
// 在需要的组件中导入
import BaseModal from '@/components/BaseModal.vue'
import DataTable from '@/components/DataTable.vue'

export default {
  components: {
    BaseModal,
    DataTable
  }
}
```

### 插件化注册

```javascript
// plugins/components.js
import BaseModal from '@/components/BaseModal.vue'
import DataTable from '@/components/DataTable.vue'

const components = [
  BaseModal,
  DataTable
]

export default {
  install(app) {
    components.forEach(component => {
      app.component(component.name, component)
    })
  }
}

// main.js
import componentsPlugin from '@/plugins/components.js'
app.use(componentsPlugin)
```

这些公共组件可以大大提高开发效率，减少重复代码，保持项目的一致性。在实际项目中，可以根据具体需求选择合适的 UI 库，并结合项目特点开发自定义的公共组件。