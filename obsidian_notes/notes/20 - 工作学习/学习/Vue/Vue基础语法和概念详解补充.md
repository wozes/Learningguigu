# Vue基础语法和概念详解

## 组件基础

### 1. 组件定义和注册（全局/局部）

#### 组件定义方式

Vue组件可以通过多种方式定义，最常见的是单文件组件（.vue文件）。

```html
<!-- MyButton.vue -->
<template>
  <button 
    :class="['btn', `btn-${type}`, { 'btn-disabled': disabled }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </button>
</template>

<script>
export default {
  name: 'MyButton', // 组件名称
  props: {
    text: {
      type: String,
      default: '按钮'
    },
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'danger'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'], // 声明组件会发出的事件
  methods: {
    handleClick(event) {
      if (!this.disabled) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:hover:not(.btn-disabled) {
  opacity: 0.8;
}
</style>
```

#### 对象形式定义组件

```javascript
// 对象形式定义组件
const MyCard = {
  name: 'MyCard',
  template: `
    <div class="card">
      <div class="card-header" v-if="title">
        <h3>{{ title }}</h3>
      </div>
      <div class="card-body">
        <slot></slot>
      </div>
      <div class="card-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  `,
  props: ['title'],
  style: `
    .card {
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 10px 0;
    }
    .card-header {
      background-color: #f8f9fa;
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .card-body {
      padding: 15px;
    }
    .card-footer {
      background-color: #f8f9fa;
      padding: 10px;
      border-top: 1px solid #ddd;
    }
  `
}
```

#### 全局注册

全局注册的组件可以在任何组件模板中使用。

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import MyButton from './components/MyButton.vue'
import MyCard from './components/MyCard.vue'

const app = createApp(App)

// 全局注册单个组件
app.component('MyButton', MyButton)
app.component('MyCard', MyCard)

// 批量全局注册
const globalComponents = {
  MyButton,
  MyCard,
  // ... 更多组件
}

Object.keys(globalComponents).forEach(key => {
  app.component(key, globalComponents[key])
})

app.mount('#app')
```

```html
<!-- 任何组件中都可以直接使用 -->
<template>
  <div>
    <MyButton>全局注册的按钮</MyButton>
    <MyCard title="全局注册的卡片">
      <p>卡片内容</p>
    </MyCard>
  </div>
</template>
```

#### 局部注册

局部注册的组件只能在注册它的父组件中使用。

```html
<!-- Parent.vue -->
<template>
  <div>
    <h2>父组件</h2>
    
    <!-- 使用局部注册的组件 -->
    <UserProfile 
      :user="currentUser" 
      @update-user="handleUserUpdate"
    />
    
    <ProductList 
      :products="products" 
      @add-to-cart="handleAddToCart"
    />
    
    <!-- 动态组件 -->
    <component 
      :is="currentComponent" 
      v-bind="componentProps"
    />
    
    <button @click="switchComponent">切换组件</button>
  </div>
</template>

<script>
// 导入组件
import UserProfile from './components/UserProfile.vue'
import ProductList from './components/ProductList.vue'
import ContactForm from './components/ContactForm.vue'

export default {
  name: 'Parent',
  // 局部注册组件
  components: {
    UserProfile,
    ProductList,
    ContactForm
  },
  data() {
    return {
      currentUser: {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com'
      },
      products: [
        { id: 1, name: '产品1', price: 100 },
        { id: 2, name: '产品2', price: 200 }
      ],
      currentComponent: 'UserProfile',
      componentProps: {}
    }
  },
  computed: {
    componentProps() {
      switch (this.currentComponent) {
        case 'UserProfile':
          return { user: this.currentUser }
        case 'ProductList':
          return { products: this.products }
        case 'ContactForm':
          return { title: '联系我们' }
        default:
          return {}
      }
    }
  },
  methods: {
    handleUserUpdate(updatedUser) {
      this.currentUser = { ...this.currentUser, ...updatedUser }
    },
    
    handleAddToCart(product) {
      console.log('添加到购物车:', product)
    },
    
    switchComponent() {
      const components = ['UserProfile', 'ProductList', 'ContactForm']
      const currentIndex = components.indexOf(this.currentComponent)
      this.currentComponent = components[(currentIndex + 1) % components.length]
    }
  }
}
</script>
```

### 2. 父子组件通信：props 和 $emit

#### Props（父传子）

Props是父组件向子组件传递数据的方式。

```html
<!-- UserProfile.vue (子组件) -->
<template>
  <div class="user-profile">
    <div class="avatar">
      <img :src="user.avatar || defaultAvatar" :alt="user.name">
    </div>
    <div class="info">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
      <p v-if="user.phone">电话: {{ user.phone }}</p>
      <p>状态: <span :class="statusClass">{{ statusText }}</span></p>
      
      <!-- 编辑模式 -->
      <div v-if="editable" class="edit-form">
        <input v-model="editForm.name" placeholder="姓名">
        <input v-model="editForm.email" placeholder="邮箱">
        <input v-model="editForm.phone" placeholder="电话">
        <button @click="saveChanges">保存</button>
        <button @click="cancelEdit">取消</button>
      </div>
      
      <button v-else @click="startEdit">编辑</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  props: {
    // 基本类型定义
    user: {
      type: Object,
      required: true,
      // 对象/数组的默认值必须从工厂函数返回
      default: () => ({
        name: '',
        email: '',
        phone: '',
        status: 'offline'
      })
    },
    
    // 多种类型
    size: {
      type: [String, Number],
      default: 'medium',
      validator: value => {
        return ['small', 'medium', 'large', 100, 200, 300].includes(value)
      }
    },
    
    // 布尔类型
    editable: {
      type: Boolean,
      default: false
    },
    
    // 数组类型
    tags: {
      type: Array,
      default: () => []
    },
    
    // 自定义验证
    theme: {
      type: String,
      default: 'light',
      validator: value => ['light', 'dark'].includes(value)
    }
  },
  emits: {
    // 声明事件及其参数验证
    'update-user': (user) => {
      return user && typeof user === 'object'
    },
    'delete-user': (userId) => {
      return typeof userId === 'number'
    }
  },
  data() {
    return {
      defaultAvatar: '/default-avatar.png',
      isEditing: false,
      editForm: {}
    }
  },
  computed: {
    statusClass() {
      return {
        'status-online': this.user.status === 'online',
        'status-offline': this.user.status === 'offline',
        'status-busy': this.user.status === 'busy'
      }
    },
    
    statusText() {
      const statusMap = {
        online: '在线',
        offline: '离线',
        busy: '忙碌'
      }
      return statusMap[this.user.status] || '未知'
    }
  },
  methods: {
    startEdit() {
      this.isEditing = true
      // 深拷贝用户数据到编辑表单
      this.editForm = JSON.parse(JSON.stringify(this.user))
    },
    
    saveChanges() {
      // 发送更新事件到父组件
      this.$emit('update-user', this.editForm)
      this.isEditing = false
    },
    
    cancelEdit() {
      this.isEditing = false
      this.editForm = {}
    }
  }
}
</script>

<style scoped>
.user-profile {
  display: flex;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 10px 0;
}

.avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
}

.info h3 {
  margin: 0 0 10px 0;
}

.status-online { color: #28a745; }
.status-offline { color: #6c757d; }
.status-busy { color: #ffc107; }

.edit-form input {
  display: block;
  margin: 5px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.edit-form button {
  margin: 5px 5px 5px 0;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

#### $emit（子传父）

子组件通过 $emit 向父组件发送事件和数据。

```html
<!-- ProductList.vue (子组件) -->
<template>
  <div class="product-list">
    <h3>产品列表</h3>
    
    <!-- 搜索过滤 -->
    <div class="filters">
      <input 
        v-model="searchQuery" 
        placeholder="搜索产品..."
        @input="handleSearch"
      >
      <select v-model="sortBy" @change="handleSort">
        <option value="name">按名称排序</option>
        <option value="price">按价格排序</option>
      </select>
    </div>
    
    <div class="products">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-item"
      >
        <h4>{{ product.name }}</h4>
        <p class="price">¥{{ product.price }}</p>
        <p class="description">{{ product.description }}</p>
        
        <div class="actions">
          <button 
            @click="addToCart(product)"
            :disabled="product.stock === 0"
            class="btn-primary"
          >
            {{ product.stock === 0 ? '缺货' : '加入购物车' }}
          </button>
          
          <button 
            @click="toggleFavorite(product)"
            :class="['btn-secondary', { 'favorited': product.isFavorite }]"
          >
            {{ product.isFavorite ? '❤️' : '🤍' }}
          </button>
          
          <button 
            @click="viewDetails(product)"
            class="btn-link"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
    
    <!-- 批量操作 -->
    <div v-if="selectedProducts.length > 0" class="bulk-actions">
      <p>已选择 {{ selectedProducts.length }} 个产品</p>
      <button @click="bulkAddToCart">批量加入购物车</button>
      <button @click="clearSelection">清空选择</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductList',
  props: {
    products: {
      type: Array,
      required: true,
      default: () => []
    },
    showFilters: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    'add-to-cart',      // 添加到购物车
    'toggle-favorite',  // 切换收藏状态
    'view-details',     // 查看详情
    'bulk-operation',   // 批量操作
    'filter-change'     // 过滤条件变化
  ],
  data() {
    return {
      searchQuery: '',
      sortBy: 'name',
      selectedProducts: []
    }
  },
  computed: {
    filteredProducts() {
      let filtered = this.products
      
      // 搜索过滤
      if (this.searchQuery) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      // 排序
      filtered = [...filtered].sort((a, b) => {
        if (this.sortBy === 'price') {
          return a.price - b.price
        } else {
          return a.name.localeCompare(b.name)
        }
      })
      
      return filtered
    }
  },
  methods: {
    addToCart(product) {
      // 发送事件到父组件，传递产品数据
      this.$emit('add-to-cart', {
        product,
        quantity: 1,
        timestamp: new Date()
      })
    },
    
    toggleFavorite(product) {
      // 发送切换收藏事件
      this.$emit('toggle-favorite', {
        productId: product.id,
        isFavorite: !product.isFavorite
      })
    },
    
    viewDetails(product) {
      // 发送查看详情事件
      this.$emit('view-details', product.id)
    },
    
    handleSearch() {
      // 发送搜索变化事件
      this.$emit('filter-change', {
        type: 'search',
        value: this.searchQuery
      })
    },
    
    handleSort() {
      // 发送排序变化事件
      this.$emit('filter-change', {
        type: 'sort',
        value: this.sortBy
      })
    },
    
    bulkAddToCart() {
      // 批量操作
      this.$emit('bulk-operation', {
        type: 'add-to-cart',
        products: this.selectedProducts
      })
      this.clearSelection()
    },
    
    clearSelection() {
      this.selectedProducts = []
    }
  },
  
  // 监听props变化
  watch: {
    products: {
      handler(newProducts) {
        // 当products变化时，清空选择
        this.selectedProducts = []
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.filters input,
.filters select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.description {
  color: #666;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary.favorited {
  background-color: #e74c3c;
}

.btn-link {
  background: none;
  color: #007bff;
  border: none;
  text-decoration: underline;
  cursor: pointer;
}

.bulk-actions {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>
```

#### 父组件使用示例

```html
<!-- App.vue (父组件) -->
<template>
  <div id="app">
    <h1>电商应用示例</h1>
    
    <!-- 用户资料组件 -->
    <UserProfile 
      :user="currentUser"
      :editable="true"
      :theme="theme"
      @update-user="handleUserUpdate"
      @delete-user="handleDeleteUser"
    />
    
    <!-- 产品列表组件 -->
    <ProductList 
      :products="products"
      :show-filters="true"
      @add-to-cart="handleAddToCart"
      @toggle-favorite="handleToggleFavorite"
      @view-details="handleViewDetails"
      @bulk-operation="handleBulkOperation"
      @filter-change="handleFilterChange"
    />
    
    <!-- 购物车状态 -->
    <div v-if="cartItems.length > 0" class="cart-summary">
      <h3>购物车 ({{ cartItems.length }} 件商品)</h3>
      <p>总价: ¥{{ cartTotal }}</p>
    </div>
  </div>
</template>

<script>
import UserProfile from './components/UserProfile.vue'
import ProductList from './components/ProductList.vue'

export default {
  name: 'App',
  components: {
    UserProfile,
    ProductList
  },
  data() {
    return {
      theme: 'light',
      currentUser: {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        status: 'online',
        avatar: '/avatar.jpg'
      },
      products: [
        {
          id: 1,
          name: 'iPhone 14',
          price: 6999,
          description: '最新款iPhone',
          stock: 10,
          isFavorite: false
        },
        {
          id: 2,
          name: 'MacBook Pro',
          price: 14999,
          description: '专业级笔记本电脑',
          stock: 5,
          isFavorite: true
        },
        {
          id: 3,
          name: 'AirPods Pro',
          price: 1999,
          description: '无线降噪耳机',
          stock: 0,
          isFavorite: false
        }
      ],
      cartItems: []
    }
  },
  computed: {
    cartTotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity)
      }, 0)
    }
  },
  methods: {
    // 处理用户更新
    handleUserUpdate(updatedUser) {
      this.currentUser = { ...this.currentUser, ...updatedUser }
      console.log('用户信息已更新:', this.currentUser)
      
      // 可以在这里调用API保存到服务器
      this.saveUserToServer(this.currentUser)
    },
    
    // 处理用户删除
    handleDeleteUser(userId) {
      console.log('删除用户:', userId)
      // 执行删除逻辑
    },
    
    // 处理添加到购物车
    handleAddToCart(data) {
      const { product, quantity } = data
      const existingItem = this.cartItems.find(item => item.product.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.cartItems.push({ product, quantity })
      }
      
      console.log('添加到购物车:', product.name)
      this.showNotification(`${product.name} 已添加到购物车`)
    },
    
    // 处理收藏切换
    handleToggleFavorite(data) {
      const { productId, isFavorite } = data
      const product = this.products.find(p => p.id === productId)
      if (product) {
        product.isFavorite = isFavorite
        console.log(`${product.name} ${isFavorite ? '已收藏' : '已取消收藏'}`)
      }
    },
    
    // 处理查看详情
    handleViewDetails(productId) {
      console.log('查看产品详情:', productId)
      // 可以跳转到详情页面或打开模态框
      this.$router.push(`/product/${productId}`)
    },
    
    // 处理批量操作
    handleBulkOperation(operation) {
      const { type, products } = operation
      if (type === 'add-to-cart') {
        products.forEach(product => {
          this.handleAddToCart({ product, quantity: 1 })
        })
        console.log('批量添加到购物车完成')
      }
    },
    
    // 处理过滤条件变化
    handleFilterChange(filter) {
      const { type, value } = filter
      console.log(`过滤条件变化: ${type} = ${value}`)
      
      // 可以记录用户的搜索行为用于分析
      this.trackUserBehavior('filter', { type, value })
    },
    
    // 辅助方法
    saveUserToServer(user) {
      // 模拟API调用
      console.log('保存用户到服务器:', user)
    },
    
    showNotification(message) {
      // 显示通知
      console.log('通知:', message)
    },
    
    trackUserBehavior(action, data) {
      // 追踪用户行为
      console.log('用户行为追踪:', action, data)
    }
  }
}
</script>

<style>
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-summary {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
</style>
```

### 3. 插槽 `<slot>` 的基本用法

插槽（Slots）是Vue组件系统中的内容分发机制，允许父组件向子组件传递模板内容。

#### 默认插槽

```html
<!-- Card.vue (子组件) -->
<template>
  <div class="card" :class="[`card-${type}`, { 'card-shadow': shadow }]">
    <div v-if="title || $slots.header" class="card-header">
      <!-- 具名插槽：header -->
      <slot name="header">
        <h3>{{ title }}</h3>
      </slot>
    </div>
    
    <div class="card-body">
      <!-- 默认插槽 -->
      <slot>
        <p>这是默认内容，当父组件没有提供内容时显示</p>
      </slot>
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <!-- 具名插槽：footer -->
      <slot name="footer"></slot>
    </div>
    
    <!-- 作用域插槽：向父组件传递数据 -->
    <div v-if="showActions" class="card-actions">
      <slot name="actions" :card-data="cardData" :close="closeCard">
        <button @click="closeCard">默认关闭按钮</button>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    title: String,
    type: {
      type: String,
      default: 'default',
      validator: value => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
    },
    shadow: {
      type: Boolean,
      default: true
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cardData: {
        created: new Date(),
        id: Math.random().toString(36).substr(2, 9)
      }
    }
  },
  methods: {
    closeCard() {
      this.$emit('close', this.cardData.id)
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  margin-bottom: 20px;
  overflow: hidden;
}

.card-shadow {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-default { border-color: #e1e5e9; }
.card-primary { border-color: #409eff; }
.card-success { border-color: #67c23a; }
.card-warning { border-color: #e6a23c; }
.card-danger { border-color: #f56c6c; }

.card-header {
  padding: 18px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e1e5e9;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
}

.card-body {
  padding: 20px;
}

.card-footer {
  padding: 12px 20px;
  background-color: #f5f7fa;
  border-top: 1px solid #e1e5e9;
}

.card-actions {
  padding: 12px 20px;
  border-top: 1px solid #e1e5e9;
  background-color: #fafafa;
}
</style>
```

#### 插槽使用示例

```html
<!-- Parent.vue -->
<template>
  <div>
    <!-- 1. 基本插槽使用 -->
    <Card title="基本卡片">
      <p>这是卡片的主要内容</p>
      <p>可以包含任何HTML内容</p>
    </Card>
    
    <!-- 2. 具名插槽使用 -->
    <Card type="primary" :show-actions="true">
      <!-- 自定义header -->
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3>自定义标题</h3>
          <span class="badge">New</span>
        </div>
      </template>
      
      <!-- 默认插槽内容 -->
      <div>
        <h4>产品介绍</h4>
        <p>这是一个很棒的产品，具有以下特点：</p>
        <ul>
          <li>高质量</li>
          <li>价格合理</li>
          <li>售后服务好</li>
        </ul>
      </div>
      
      <!-- footer插槽 -->
      <template #footer>
        <small>最后更新: {{ new Date().toLocaleDateString() }}</small>
      </template>
      
      <!-- 作用域插槽：使用子组件传递的数据 -->
      <template #actions="{ cardData, close }">
        <button @click="editCard(cardData)">编辑</button>
        <button @click="shareCard(cardData)">分享</button>
        <button @click="close" class="danger">删除</button>
      </template>
    </Card>
    
    <!-- 3. 动态插槽名 -->
    <Card>
      <template #[dynamicSlotName]>
        <h4>动态插槽内容</h4>
      </template>
      
      <p>主要内容区域</p>
    </Card>
    
    <!-- 4. 复杂的作用域插槽示例 -->
    <DataTable 
      :data="tableData" 
      :columns="tableColumns"
    >
      <!-- 自定义列渲染 -->
      <template #column-status="{ row, column, value }">
        <span :class="getStatusClass(value)">
          {{ getStatusText(value) }}
        </span>
      </template>
      
      <template #column-actions="{ row, index }">
        <button @click="editRow(row, index)">编辑</button>
        <button @click="deleteRow(row, index)" class="danger">删除</button>
      </template>
      
      <!-- 表格为空时的内容 -->
      <template #empty>
        <div class="empty-state">
          <img src="/empty-box.svg" alt="空状态">
          <p>暂无数据</p>
          <button @click="loadData">加载数据</button>
        </div>
      </template>
    </DataTable>
    
    <!-- 5. 多个默认插槽（条件渲染） -->
    <Modal :visible="showModal" @close="showModal = false">
      <template #title>确认操作</template>
      
      <template #default v-if="modalType === 'confirm'">
        <p>您确定要执行此操作吗？</p>
      </template>
      
      <template #default v-else-if="modalType === 'form'">
        <form>
          <input v-model="formData.name" placeholder="姓名">
          <input v-model="formData.email" placeholder="邮箱">
        </form>
      </template>
      
      <template #actions="{ close }">
        <button @click="close">取消</button>
        <button @click="handleConfirm" class="primary">确认</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import Card from './components/Card.vue'
import DataTable from './components/DataTable.vue'
import Modal from './components/Modal.vue'

export default {
  name: 'Parent',
  components: {
    Card,
    DataTable,
    Modal
  },
  data() {
    return {
      dynamicSlotName: 'header',
      showModal: false,
      modalType: 'confirm',
      formData: {
        name: '',
        email: ''
      },
      tableData: [
        { id: 1, name: '张三', status: 'active', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', status: 'inactive', email: 'lisi@example.com' },
        { id: 3, name: '王五', status: 'pending', email: 'wangwu@example.com' }
      ],
      tableColumns: [
        { key: 'name', title: '姓名' },
        { key: 'email', title: '邮箱' },
        { key: 'status', title: '状态' },
        { key: 'actions', title: '操作' }
      ]
    }
  },
  methods: {
    editCard(cardData) {
      console.log('编辑卡片:', cardData)
    },
    
    shareCard(cardData) {
      console.log('分享卡片:', cardData)
    },
    
    getStatusClass(status) {
      const classes = {
        active: 'status-active',
        inactive: 'status-inactive',
        pending: 'status-pending'
      }
      return classes[status] || 'status-default'
    },
    
    getStatusText(status) {
      const texts = {
        active: '激活',
        inactive: '禁用',
        pending: '待审核'
      }
      return texts[status] || '未知'
    },
    
    editRow(row, index) {
      console.log('编辑行:', row, index)
    },
    
    deleteRow(row, index) {
      this.tableData.splice(index, 1)
    },
    
    loadData() {
      console.log('加载数据')
    },
    
    handleConfirm() {
      if (this.modalType === 'confirm') {
        console.log('确认操作')
      } else if (this.modalType === 'form') {
        console.log('提交表单:', this.formData)
      }
      this.showModal = false
    }
  }
}
</script>
```

#### 高级插槽组件示例

```html
<!-- DataTable.vue -->
<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length" class="empty-cell">
            <slot name="empty">
              <p>暂无数据</p>
            </slot>
          </td>
        </tr>
        <tr v-else v-for="(row, index) in data" :key="row.id || index">
          <td v-for="column in columns" :key="column.key">
            <!-- 检查是否有自定义列插槽 -->
            <slot 
              :name="`column-${column.key}`" 
              :row="row" 
              :column="column" 
              :value="row[column.key]"
              :index="index"
            >
              <!-- 默认显示原始值 -->
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- 分页插槽 -->
    <div v-if="showPagination" class="pagination">
      <slot name="pagination" :total="data.length" :page-size="pageSize">
        <div>共 {{ data.length }} 条记录</div>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    showPagination: {
      type: Boolean,
      default: false
    },
    pageSize: {
      type: Number,
      default: 10
    }
  }
}
</script>

<style scoped>
.data-table {
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.empty-cell {
  text-align: center;
  color: #999;
  font-style: italic;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
```

```html
<!-- Modal.vue -->
<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" :class="[`modal-${size}`, { 'modal-centered': centered }]">
      <!-- 标题栏 -->
      <div class="modal-header">
        <slot name="title">
          <h3>{{ title }}</h3>
        </slot>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <!-- 内容区域 -->
      <div class="modal-body">
        <slot>
          <p>模态框内容</p>
        </slot>
      </div>
      
      <!-- 操作按钮区域 -->
      <div v-if="$slots.actions || showDefaultActions" class="modal-footer">
        <slot name="actions" :close="close" :confirm="confirm">
          <button @click="close">取消</button>
          <button @click="confirm" class="primary">确认</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    centered: {
      type: Boolean,
      default: true
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    showDefaultActions: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'confirm'],
  methods: {
    close() {
      this.$emit('close')
    },
    
    confirm() {
      this.$emit('confirm')
    },
    
    handleOverlayClick(event) {
      if (event.target === event.currentTarget && this.closeOnOverlay) {
        this.close()
      }
    }
  },
  
  mounted() {
    // 阻止背景滚动
    if (this.visible) {
      document.body.style.overflow = 'hidden'
    }
  },
  
  unmounted() {
    // 恢复背景滚动
    document.body.style.overflow = ''
  },
  
  watch: {
    visible(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
}

.modal-small { width: 300px; }
.modal-medium { width: 500px; }
.modal-large { width: 800px; }

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e1e5e9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-footer button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.modal-footer button.primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
```

#### 插槽的高级用法

```html
<!-- FlexibleList.vue - 演示插槽的多种高级用法 -->
<template>
  <div class="flexible-list">
    <!-- 列表标题区域 -->
    <div class="list-header">
      <slot name="header" :total="items.length" :selected="selectedItems">
        <h3>列表 ({{ items.length }})</h3>
      </slot>
    </div>
    
    <!-- 过滤器区域 -->
    <div v-if="$slots.filters" class="list-filters">
      <slot name="filters" :items="items" :filtered="filteredItems"></slot>
    </div>
    
    <!-- 列表内容 -->
    <div class="list-content">
      <template v-if="filteredItems.length > 0">
        <!-- 遍历每个项目 -->
        <div 
          v-for="(item, index) in paginatedItems" 
          :key="getItemKey(item, index)"
          class="list-item"
          :class="{ 'selected': isSelected(item) }"
        >
          <!-- 项目内容的作用域插槽 -->
          <slot 
            name="item" 
            :item="item" 
            :index="index"
            :selected="isSelected(item)"
            :toggle="() => toggleSelection(item)"
          >
            <!-- 默认项目渲染 -->
            <div class="default-item">
              <input 
                type="checkbox" 
                :checked="isSelected(item)"
                @change="toggleSelection(item)"
              >
              <span>{{ item.name || item.title || JSON.stringify(item) }}</span>
            </div>
          </slot>
          
          <!-- 项目操作按钮 -->
          <div v-if="$slots.actions" class="item-actions">
            <slot 
              name="actions" 
              :item="item" 
              :index="index"
              :edit="() => editItem(item)"
              :delete="() => deleteItem(item)"
            ></slot>
          </div>
        </div>
      </template>
      
      <!-- 空状态 -->
      <template v-else>
        <div class="empty-state">
          <slot name="empty" :total="items.length">
            <p>{{ items.length === 0 ? '暂无数据' : '没有符合条件的数据' }}</p>
          </slot>
        </div>
      </template>
    </div>
    
    <!-- 分页区域 -->
    <div v-if="showPagination && totalPages > 1" class="list-pagination">
      <slot 
        name="pagination" 
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="filteredItems.length"
        :page-size="pageSize"
        :go-to-page="goToPage"
      >
        <!-- 默认分页组件 -->
        <div class="default-pagination">
          <button 
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            上一页
          </button>
          
          <span>{{ currentPage }} / {{ totalPages }}</span>
          
          <button 
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </slot>
    </div>
    
    <!-- 底部操作区域 -->
    <div v-if="$slots.footer" class="list-footer">
      <slot 
        name="footer" 
        :selected="selectedItems"
        :total="items.length"
        :clear-selection="clearSelection"
        :select-all="selectAll"
      ></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlexibleList',
  props: {
    items: {
      type: Array,
      required: true
    },
    itemKey: {
      type: [String, Function],
      default: 'id'
    },
    pageSize: {
      type: Number,
      default: 10
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    multipleSelection: {
      type: Boolean,
      default: true
    }
  },
  emits: ['selection-change', 'item-edit', 'item-delete'],
  data() {
    return {
      selectedItems: [],
      currentPage: 1,
      filteredItems: []
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredItems.length / this.pageSize)
    },
    
    paginatedItems() {
      if (!this.showPagination) return this.filteredItems
      
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredItems.slice(start, end)
    }
  },
  watch: {
    items: {
      handler(newItems) {
        this.filteredItems = [...newItems]
        this.currentPage = 1
      },
      immediate: true
    },
    
    selectedItems(newSelection) {
      this.$emit('selection-change', newSelection)
    }
  },
  methods: {
    getItemKey(item, index) {
      if (typeof this.itemKey === 'function') {
        return this.itemKey(item, index)
      }
      return item[this.itemKey] || index
    },
    
    isSelected(item) {
      return this.selectedItems.some(selected => 
        this.getItemKey(selected, -1) === this.getItemKey(item, -1)
      )
    },
    
    toggleSelection(item) {
      if (this.isSelected(item)) {
        this.selectedItems = this.selectedItems.filter(selected =>
          this.getItemKey(selected, -1) !== this.getItemKey(item, -1)
        )
      } else {
        if (this.multipleSelection) {
          this.selectedItems.push(item)
        } else {
          this.selectedItems = [item]
        }
      }
    },
    
    clearSelection() {
      this.selectedItems = []
    },
    
    selectAll() {
      this.selectedItems = [...this.filteredItems]
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    editItem(item) {
      this.$emit('item-edit', item)
    },
    
    deleteItem(item) {
      this.$emit('item-delete', item)
    },
    
    // 提供给父组件的方法
    updateFilter(filterFn) {
      this.filteredItems = this.items.filter(filterFn)
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
.flexible-list {
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  overflow: hidden;
}

.list-header {
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
}

.list-filters {
  padding: 16px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e1e5e9;
}

.list-content {
  min-height: 200px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.list-item:hover {
  background-color: #f8f9fa;
}

.list-item.selected {
  background-color: #e3f2fd;
}

.default-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #666;
}

.list-pagination {
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e1e5e9;
}

.default-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.default-pagination button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.default-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-footer {
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e1e5e9;
}
</style>
```

## 总结

Vue组件基础包含三个核心概念：

### 1. 组件定义和注册

- **全局注册**: 所有组件都可使用，适合通用组件
- **局部注册**: 只在当前组件可用，按需加载，推荐方式
- **动态组件**: 使用 `<component :is="componentName">` 实现组件切换

### 2. 父子组件通信

- **Props**: 父组件向子组件传递数据，单向数据流
- **$emit**: 子组件向父组件发送事件，实现数据回传
- **数据验证**: 使用类型检查和自定义验证确保数据正确性

### 3. 插槽系统

- **默认插槽**: 传递简单内容到子组件
- **具名插槽**: 向指定位置传递内容
- **作用域插槽**: 子组件向父组件传递数据，实现更灵活的内容定制

这些概念是构建可复用、可维护Vue应用的基础。掌握它们后，你就能创建复杂的组件系统，实现良好的代码组织和复用性。

### 插值表达式 `{{ }}`

插值表达式是Vue中最基本的数据绑定方式，用于在模板中显示数据。

```html
<template>
  <div>
    <!-- 基本文本插值 -->
    <p>{{ message }}</p>
    
    <!-- 表达式计算 -->
    <p>{{ number + 1 }}</p>
    
    <!-- 方法调用 -->
    <p>{{ formatName(firstName, lastName) }}</p>
    
    <!-- 三元运算符 -->
    <p>{{ isActive ? '激活' : '未激活' }}</p>
    
    <!-- 对象属性访问 -->
    <p>{{ user.name }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue!',
      number: 10,
      firstName: '张',
      lastName: '三',
      isActive: true,
      user: { name: '李四' }
    }
  },
  methods: {
    formatName(first, last) {
      return first + last
    }
  }
}
</script>
```

**注意事项：**

- 只能包含单个表达式，不能是语句
- 不能访问全局变量（除了少数白名单如 Math、Date）
- 会自动进行HTML转义，防止XSS攻击

### 指令系统

指令是带有 `v-` 前缀的特殊属性，用于向DOM元素添加响应式行为。

#### 常用指令

```html
<template>
  <div>
    <!-- v-text: 纯文本渲染 -->
    <p v-text="message"></p>
    
    <!-- v-html: HTML内容渲染（慎用） -->
    <div v-html="htmlContent"></div>
    
    <!-- v-bind: 属性绑定（可简写为 :） -->
    <img v-bind:src="imageSrc" v-bind:alt="imageAlt">
    <img :src="imageSrc" :alt="imageAlt">
    
    <!-- v-on: 事件监听（可简写为 @） -->
    <button v-on:click="handleClick">点击</button>
    <button @click="handleClick">点击</button>
    
    <!-- v-model: 双向数据绑定 -->
    <input v-model="inputValue" placeholder="输入内容">
    
    <!-- 修饰符的使用 -->
    <form @submit.prevent="onSubmit">
      <input v-model.trim="username" placeholder="用户名">
      <input v-model.number="age" type="number" placeholder="年龄">
    </form>
    
    <!-- 动态属性名 -->
    <a v-bind:[attributeName]="url">动态属性</a>
    
    <!-- 动态事件名 -->
    <button v-on:[eventName]="doSomething">动态事件</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello World',
      htmlContent: '<strong>粗体文本</strong>',
      imageSrc: 'image.jpg',
      imageAlt: '图片描述',
      inputValue: '',
      username: '',
      age: 0,
      attributeName: 'href',
      url: 'https://example.com',
      eventName: 'click'
    }
  },
  methods: {
    handleClick() {
      console.log('按钮被点击了')
    },
    onSubmit() {
      console.log('表单提交')
    },
    doSomething() {
      console.log('动态事件触发')
    }
  }
}
</script>
```

## 2. 响应式数据：data、computed、watch

### data 数据属性

`data` 是组件的基础数据，所有在 `data` 中声明的属性都会成为响应式的。

```html
<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>用户: {{ user.name }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
      user: {
        name: '张三',
        age: 25
      },
      items: ['苹果', '香蕉', '橙子']
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

**重要规则：**

- `data` 必须是一个函数，返回数据对象
- 确保组件实例之间的数据独立性
- 只有在 `data` 中预先声明的属性才是响应式的

### computed 计算属性

计算属性是基于响应式依赖进行缓存的，只有依赖发生变化时才会重新计算。

```html
<template>
  <div>
    <p>原价: ¥{{ price }}</p>
    <p>折扣: {{ discount }}%</p>
    <p>现价: ¥{{ finalPrice }}</p>
    
    <p>全名: {{ fullName }}</p>
    <input v-model="firstName" placeholder="姓">
    <input v-model="lastName" placeholder="名">
    
    <!-- 使用setter的计算属性 -->
    <input v-model="fullNameWithSetter">
  </div>
</template>

<script>
export default {
  data() {
    return {
      price: 100,
      discount: 20,
      firstName: '张',
      lastName: '三'
    }
  },
  computed: {
    // 只读计算属性
    finalPrice() {
      return this.price * (1 - this.discount / 100)
    },
    
    fullName() {
      return this.firstName + this.lastName
    },
    
    // 带有setter的计算属性
    fullNameWithSetter: {
      get() {
        return this.firstName + this.lastName
      },
      set(newValue) {
        const names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[names.length - 1]
      }
    }
  }
}
</script>
```

**computed vs methods：**

- `computed` 有缓存，依赖不变时不会重新计算
- `methods` 每次调用都会执行
- `computed` 适合复杂计算，`methods` 适合事件处理

### watch 侦听器

侦听器用于观察和响应数据的变化，适合执行异步操作或开销较大的操作。

```html
<template>
  <div>
    <input v-model="question" placeholder="输入问题">
    <p>{{ answer }}</p>
    
    <p>用户信息: {{ user.name }} - {{ user.age }}岁</p>
    <button @click="updateUser">更新用户</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      question: '',
      answer: '请输入问题...',
      user: {
        name: '张三',
        age: 25
      }
    }
  },
  watch: {
    // 基本侦听
    question(newQuestion, oldQuestion) {
      if (newQuestion.includes('?')) {
        this.answer = '思考中...'
        this.debouncedGetAnswer()
      }
    },
    
    // 深度侦听对象
    user: {
      handler(newUser, oldUser) {
        console.log('用户信息变化:', newUser)
      },
      deep: true
    },
    
    // 立即执行侦听器
    immediate: {
      handler(val) {
        console.log('组件初始化时就执行')
      },
      immediate: true
    },
    
    // 侦听对象的特定属性
    'user.name'(newName, oldName) {
      console.log(`姓名从 ${oldName} 改为 ${newName}`)
    }
  },
  methods: {
    debouncedGetAnswer() {
      // 模拟异步操作
      setTimeout(() => {
        this.answer = '这是一个很好的问题！'
      }, 1000)
    },
    
    updateUser() {
      this.user.name = '李四'
      this.user.age = 30
    }
  }
}
</script>
```

## 3. 生命周期钩子

生命周期钩子让你可以在组件的特定阶段执行代码。

```html
<template>
  <div>
    <p>组件已加载</p>
    <button @click="updateData">更新数据</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  
  // 创建阶段
  beforeCreate() {
    console.log('beforeCreate: 组件实例刚被创建')
    // 此时 data、methods 还未初始化
  },
  
  created() {
    console.log('created: 组件实例创建完成')
    // 可以访问 data、methods，但DOM还未挂载
    // 适合进行数据初始化、API调用
    this.initData()
  },
  
  // 挂载阶段
  beforeMount() {
    console.log('beforeMount: 即将挂载DOM')
    // 模板编译完成，但还未挂载到页面
  },
  
  mounted() {
    console.log('mounted: DOM已挂载')
    // 可以访问DOM元素，适合DOM操作、第三方库初始化
    this.$nextTick(() => {
      // DOM更新完成后执行
      console.log('DOM更新完成')
    })
  },
  
  // 更新阶段
  beforeUpdate() {
    console.log('beforeUpdate: 数据更新前')
    // 数据已更新，但DOM还未重新渲染
  },
  
  updated() {
    console.log('updated: DOM更新完成')
    // DOM已重新渲染，避免在此修改数据（可能导致无限循环）
  },
  
  // 销毁阶段
  beforeUnmount() { // Vue 2 中是 beforeDestroy
    console.log('beforeUnmount: 即将销毁组件')
    // 适合清理定时器、事件监听器等
    this.cleanup()
  },
  
  unmounted() { // Vue 2 中是 destroyed
    console.log('unmounted: 组件已销毁')
    // 组件完全销毁，所有子组件也被销毁
  },
  
  methods: {
    initData() {
      // 初始化数据
      console.log('初始化数据')
    },
    
    updateData() {
      this.message = 'Updated!'
    },
    
    cleanup() {
      // 清理资源
      console.log('清理资源')
    }
  }
}
</script>
```

**生命周期使用场景：**

- `created`: API调用、数据初始化
- `mounted`: DOM操作、第三方库初始化、获取元素尺寸
- `beforeUnmount`: 清理定时器、事件监听、取消网络请求
- `updated`: DOM更新后的操作（谨慎使用）

## 4. 条件渲染：v-if、v-show

### v-if vs v-show

```html
<template>
  <div>
    <!-- v-if: 条件性渲染，切换时会销毁/重建元素 -->
    <div v-if="showContent">
      <h2>v-if 内容</h2>
      <p>这个元素会被完全创建或销毁</p>
    </div>
    
    <!-- v-else-if 和 v-else -->
    <div v-if="type === 'A'">类型 A</div>
    <div v-else-if="type === 'B'">类型 B</div>
    <div v-else>其他类型</div>
    
    <!-- v-show: 始终渲染，通过CSS display控制显示 -->
    <div v-show="showContent">
      <h2>v-show 内容</h2>
      <p>这个元素始终存在，只是显示/隐藏</p>
    </div>
    
    <!-- template 包装器（不会渲染额外元素） -->
    <template v-if="showMultiple">
      <p>第一段</p>
      <p>第二段</p>
      <p>第三段</p>
    </template>
    
    <button @click="toggle">切换显示</button>
    <button @click="changeType">切换类型</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showContent: true,
      showMultiple: true,
      type: 'A'
    }
  },
  methods: {
    toggle() {
      this.showContent = !this.showContent
    },
    changeType() {
      const types = ['A', 'B', 'C']
      const currentIndex = types.indexOf(this.type)
      this.type = types[(currentIndex + 1) % types.length]
    }
  }
}
</script>
```

**选择原则：**

- `v-if` 适合条件很少改变的场景（惰性渲染）
- `v-show` 适合需要频繁切换的场景
- `v-if` 有更高的切换开销，`v-show` 有更高的初始渲染开销

## 5. 列表渲染：v-for 和 key 的正确使用

### 基本列表渲染

```html
<template>
  <div>
    <!-- 遍历数组 -->
    <ul>
      <li v-for="(item, index) in items" :key="item.id">
        {{ index }} - {{ item.name }}
      </li>
    </ul>
    
    <!-- 遍历对象 -->
    <ul>
      <li v-for="(value, name, index) in user" :key="name">
        {{ index }}. {{ name }}: {{ value }}
      </li>
    </ul>
    
    <!-- 遍历字符串 -->
    <ul>
      <li v-for="(char, index) in message" :key="index">
        {{ char }}
      </li>
    </ul>
    
    <!-- 遍历数字 -->
    <ul>
      <li v-for="n in 10" :key="n">
        {{ n }}
      </li>
    </ul>
    
    <!-- 复杂列表操作 -->
    <div>
      <input v-model="newItemName" placeholder="添加新项目">
      <button @click="addItem">添加</button>
    </div>
    
    <ul>
      <li v-for="item in items" :key="item.id">
        <input v-model="item.name">
        <button @click="removeItem(item.id)">删除</button>
        <button @click="toggleComplete(item.id)">
          {{ item.completed ? '完成' : '未完成' }}
        </button>
      </li>
    </ul>
    
    <!-- 过滤和排序 -->
    <div>
      <input v-model="searchTerm" placeholder="搜索...">
      <select v-model="sortBy">
        <option value="name">按名称排序</option>
        <option value="id">按ID排序</option>
      </select>
    </div>
    
    <ul>
      <li v-for="item in filteredAndSortedItems" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: '苹果', completed: false },
        { id: 2, name: '香蕉', completed: true },
        { id: 3, name: '橙子', completed: false }
      ],
      user: {
        name: '张三',
        age: 25,
        city: '北京'
      },
      message: 'Vue',
      newItemName: '',
      searchTerm: '',
      sortBy: 'name'
    }
  },
  computed: {
    filteredAndSortedItems() {
      let filtered = this.items
      
      // 过滤
      if (this.searchTerm) {
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      }
      
      // 排序
      return filtered.sort((a, b) => {
        if (this.sortBy === 'name') {
          return a.name.localeCompare(b.name)
        } else {
          return a.id - b.id
        }
      })
    }
  },
  methods: {
    addItem() {
      if (this.newItemName.trim()) {
        this.items.push({
          id: Date.now(),
          name: this.newItemName.trim(),
          completed: false
        })
        this.newItemName = ''
      }
    },
    
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id)
    },
    
    toggleComplete(id) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        item.completed = !item.completed
      }
    }
  }
}
</script>
```

### key 的重要性

```html
<template>
  <div>
    <!-- 错误示例：使用 index 作为 key -->
    <div>
      <h3>❌ 错误：使用 index 作为 key</h3>
      <input v-model="newName" placeholder="输入姓名">
      <button @click="addToTop">添加到顶部</button>
      <ul>
        <li v-for="(person, index) in people" :key="index">
          <input :value="person.name" />
          <span>{{ person.name }}</span>
        </li>
      </ul>
    </div>
    
    <!-- 正确示例：使用唯一 ID 作为 key -->
    <div>
      <h3>✅ 正确：使用唯一 ID 作为 key</h3>
      <input v-model="newName2" placeholder="输入姓名">
      <button @click="addToTop2">添加到顶部</button>
      <ul>
        <li v-for="person in people2" :key="person.id">
          <input :value="person.name" />
          <span>{{ person.name }}</span>
        </li>
      </ul>
    </div>
    
    <!-- 嵌套 v-for -->
    <div>
      <h3>嵌套列表</h3>
      <div v-for="category in categories" :key="category.id">
        <h4>{{ category.name }}</h4>
        <ul>
          <li v-for="item in category.items" :key="`${category.id}-${item.id}`">
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newName: '',
      newName2: '',
      people: [
        { name: '张三' },
        { name: '李四' },
        { name: '王五' }
      ],
      people2: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' }
      ],
      categories: [
        {
          id: 1,
          name: '水果',
          items: [
            { id: 1, name: '苹果' },
            { id: 2, name: '香蕉' }
          ]
        },
        {
          id: 2,
          name: '蔬菜',
          items: [
            { id: 3, name: '胡萝卜' },
            { id: 4, name: '白菜' }
          ]
        }
      ]
    }
  },
  methods: {
    addToTop() {
      if (this.newName.trim()) {
        this.people.unshift({ name: this.newName.trim() })
        this.newName = ''
      }
    },
    
    addToTop2() {
      if (this.newName2.trim()) {
        this.people2.unshift({
          id: Date.now(),
          name: this.newName2.trim()
        })
        this.newName2 = ''
      }
    }
  }
}
</script>
```

### key 的使用原则

**为什么需要 key：**

1. Vue使用虚拟DOM进行高效更新
2. key帮助Vue识别哪些元素发生了变化
3. 正确的key可以复用元素，提高性能
4. 错误的key可能导致状态错乱

**key 的选择原则：**

- ✅ 使用唯一且稳定的标识符（如ID）
- ✅ 确保同级元素中key唯一
- ❌ 避免使用数组索引（当列表会变化时）
- ❌ 避免使用随机数
- ❌ 避免使用对象或数组作为key

**特殊情况：**

```html
<!-- 当列表是静态的且永远不会改变时，可以使用 index -->
<li v-for="(color, index) in staticColors" :key="index">
  {{ color }}
</li>

<!-- 强制替换元素（而不是复用）时可以使用动态key -->
<transition>
  <div :key="currentUser.id">
    用户: {{ currentUser.name }}
  </div>
</transition>
```

## 总结

这些基础概念是Vue开发的核心：

1. **模板语法**：掌握插值和指令的正确使用
2. **响应式数据**：理解data、computed、watch的区别和使用场景
3. **生命周期**：在合适的时机执行合适的操作
4. **条件渲染**：根据场景选择v-if或v-show
5. **列表渲染**：正确使用key确保性能和状态正确

掌握这些概念后，你就具备了Vue开发的基础能力，可以继续学习组件化、路由等更高级的特性。

我已经为你详细补充了Vue组件基础的完整内容。这份指南涵盖了：

## 🎯 核心内容

### 1. **组件定义和注册**

- 单文件组件（.vue）的标准结构
- 对象形式定义组件的方法
- 全局注册 vs 局部注册的使用场景
- 动态组件的实现方式

### 2. **父子组件通信**

- **Props**: 详细的类型定义、验证器、默认值设置
- **$emit**: 事件声明、参数传递、事件验证
- 完整的双向通信示例（用户资料、产品列表）

### 3. **插槽系统**

- **默认插槽**: 基本内容分发
- **具名插槽**: 多个内容区域的精确控制
- **作用域插槽**: 子组件数据向父组件传递
- **动态插槽**: 运行时确定插槽名称

## 🚀 实战示例

文档包含了多个完整的实战组件：

- **UserProfile**: 用户信息展示和编辑
- **ProductList**: 产品列表with搜索、排序、批量操作
- **Card**: 通用卡片组件with多种插槽
- **DataTable**: 数据表格with自定义列渲染
- **Modal**: 模态框with灵活的内容定制
- **FlexibleList**: 高度可配置的列表组件

## 💡 最佳实践

每个概念都包含了：

- ✅ 正确的使用方法
- ❌ 常见错误避免
- 🎨 代码组织建议
- 🔧 性能优化提示

这些组件基础概念是构建复杂Vue应用的基石。建议你：

1. **先理解概念** - 掌握props、emit、slot的工作原理
2. **动手实践** - 复制示例代码到本地运行测试
3. **逐步扩展** - 基于示例创建自己的组件变体
4. **注意细节** - 关注数据验证、错误处理、用户体验

有任何具体问题或需要深入了解某个特定概念，随时告诉我！