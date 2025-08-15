## 一、动态路由的核心用处

### 1. 避免路由爆炸

如果没有动态路由，你需要为每个用户、每个商品、每篇文章都配置单独的路由：

```javascript
// 不使用动态路由的糟糕做法
const routes = [
  { path: '/user/1', component: User },
  { path: '/user/2', component: User },
  { path: '/user/3', component: User },
  // ... 成千上万个用户路由
]
```

使用动态路由后：

```javascript
// 使用动态路由的优雅做法
const routes = [
  { path: '/user/:id', component: User }
]
```

### 2. 提高代码复用性

同一个组件可以处理不同的数据，根据路由参数动态加载内容。

### 3. 支持复杂的URL结构

可以创建多层级的动态路由，如：`/category/:type/product/:id/review/:reviewId`

## 二、基础语法和配置

### 1. 路由配置

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import User from './components/User.vue'
import Product from './components/Product.vue'
import Post from './components/Post.vue'

const routes = [
  // 基础动态路由
  { path: '/user/:id', component: User },
  
  // 多个动态参数
  { path: '/category/:type/product/:id', component: Product },
  
  // 可选参数（使用?）
  { path: '/post/:id/:slug?', component: Post },
  
  // 通配符匹配
  { path: '/files/:pathMatch(.*)*', component: FileViewer },
  
  // 参数验证
  { 
    path: '/user/:id(\\d+)', // 只匹配数字
    component: User 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

### 2. 参数类型说明

- `:id` - 必需参数
- `:id?` - 可选参数
- `:id(\\d+)` - 正则验证参数
- `:pathMatch(.*)` - 通配符参数

## 三、在组件中使用动态参数

### 选项式API用法

```vue
<template>
  <div>
    <h1>用户详情页</h1>
    <p>用户ID: {{ userId }}</p>
    <p>用户名: {{ userInfo.name }}</p>
    <p>邮箱: {{ userInfo.email }}</p>
  </div>
</template>

<script>
export default {
  name: 'User',
  data() {
    return {
      userInfo: {}
    }
  },
  computed: {
    userId() {
      return this.$route.params.id
    }
  },
  async created() {
    // 组件创建时获取用户数据
    await this.fetchUserInfo()
  },
  methods: {
    async fetchUserInfo() {
      try {
        // 根据路由参数获取数据
        const response = await fetch(`/api/users/${this.userId}`)
        this.userInfo = await response.json()
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }
  },
  // 监听路由参数变化
  watch: {
    '$route.params.id': {
      handler: 'fetchUserInfo',
      immediate: true
    }
  }
}
</script>
```

### 组合式API用法

```vue
<template>
  <div>
    <h1>商品详情页</h1>
    <p>分类: {{ category }}</p>
    <p>商品ID: {{ productId }}</p>
    <div v-if="product">
      <h2>{{ product.name }}</h2>
      <p>价格: ¥{{ product.price }}</p>
      <p>描述: {{ product.description }}</p>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Product',
  setup() {
    const route = useRoute()
    const product = ref(null)
    
    // 获取路由参数
    const category = computed(() => route.params.type)
    const productId = computed(() => route.params.id)
    
    // 获取商品数据
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId.value}`)
        product.value = await response.json()
      } catch (error) {
        console.error('获取商品信息失败:', error)
      }
    }
    
    // 监听路由参数变化
    watch(() => route.params, fetchProduct, { immediate: true })
    
    return {
      category,
      productId,
      product
    }
  }
}
</script>
```

## 四、高级用法示例

### 1. 嵌套动态路由

```javascript
const routes = [
  {
    path: '/user/:userId',
    component: User,
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'posts/:postId', component: UserPost },
      { path: 'settings/:section?', component: UserSettings }
    ]
  }
]
```

### 2. 路由参数传递给组件props

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    props: true // 将路由参数作为props传递
  },
  {
    path: '/search/:keyword',
    component: Search,
    props: route => ({ 
      keyword: route.params.keyword,
      page: Number(route.query.page) || 1
    })
  }
]
```

使用props接收参数：

```vue
<script>
export default {
  props: ['id'], // 直接接收路由参数作为props
  async created() {
    await this.fetchUser(this.id)
  }
}
</script>
```

### 3. 路由守卫中使用动态参数

```javascript
// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  if (to.path.startsWith('/user/')) {
    const userId = to.params.id
    // 验证用户是否存在
    const userExists = await checkUserExists(userId)
    if (!userExists) {
      next('/404')
      return
    }
  }
  next()
})

// 组件内守卫
export default {
  async beforeRouteEnter(to, from, next) {
    const userId = to.params.id
    const user = await fetchUser(userId)
    next(vm => {
      vm.userInfo = user
    })
  },
  
  async beforeRouteUpdate(to, from, next) {
    // 路由参数变化时调用
    this.userInfo = await fetchUser(to.params.id)
    next()
  }
}
```

## 五、实际应用场景

### 1. 博客系统

```javascript
const routes = [
  { path: '/posts/:slug', component: PostDetail },
  { path: '/category/:name/page/:page', component: CategoryPosts },
  { path: '/author/:id/posts', component: AuthorPosts },
  { path: '/tag/:tag', component: TagPosts }
]
```

### 2. 电商系统

```javascript
const routes = [
  { path: '/product/:id', component: ProductDetail },
  { path: '/category/:category/brand/:brand', component: ProductList },
  { path: '/user/:id/orders/:orderId', component: OrderDetail },
  { path: '/search/:keyword', component: SearchResults }
]
```

### 3. 管理系统

```javascript
const routes = [
  { path: '/admin/users/:id/edit', component: UserEdit },
  { path: '/admin/reports/:type/:date', component: Reports },
  { path: '/admin/settings/:module/:section?', component: Settings }
]
```

## 六、最佳实践

### 1. 参数验证

```javascript
// 使用正则表达式验证参数格式
const routes = [
  { path: '/user/:id(\\d+)', component: User }, // 只允许数字
  { path: '/post/:slug([a-z0-9-]+)', component: Post }, // 只允许小写字母、数字和连字符
  { path: '/date/:year(\\d{4})/:month(\\d{1,2})', component: Calendar }
]
```

### 2. 错误处理

```vue
<script>
export default {
  async created() {
    try {
      await this.fetchData()
    } catch (error) {
      if (error.status === 404) {
        this.$router.push('/404')
      } else {
        // 处理其他错误
        console.error('加载数据失败:', error)
      }
    }
  }
}
</script>
```

### 3. 性能优化

```vue
<script>
export default {
  data() {
    return {
      cache: new Map() // 缓存已加载的数据
    }
  },
  methods: {
    async fetchData(id) {
      if (this.cache.has(id)) {
        return this.cache.get(id)
      }
      
      const data = await api.get(`/data/${id}`)
      this.cache.set(id, data)
      return data
    }
  }
}
</script>
```

## 七、注意事项

1. **组件复用问题**：当从 `/user/1` 导航到 `/user/2` 时，同一个组件实例会被复用，这意味着组件的生命周期钩子不会再次被调用。
    
2. **参数变化监听**：需要通过 `watch` 监听 `$route.params` 的变化来响应参数更新。
    
3. **类型转换**：路由参数始终是字符串，需要时记得进行类型转换。
    
4. **SEO考虑**：对于需要SEO的应用，确保动态路由能够被搜索引擎正确索引。
    

动态路由是Vue Router的核心功能之一，掌握它能让你构建更加灵活和可维护的单页面应用。
## 核心要点总结：

**主要用处：**

- 避免为每个资源创建单独路由（如用户详情、商品页面）
- 提高组件复用性，一个组件处理多种相似数据
- 支持复杂的URL结构和参数传递

**关键使用方式：**

1. **基础语法**：使用 `:参数名` 定义动态部分
2. **获取参数**：通过 `this.$route.params` 或 `useRoute().params` 获取
3. **监听变化**：使用 `watch` 监听参数变化来更新数据
4. **参数验证**：可以使用正则表达式限制参数格式

**实际应用**最常见的就是：

- 用户详情页 `/user/:id`
- 商品详情页 `/product/:id`
- 文章详情页 `/post/:slug`
- 分类页面 `/category/:type`

需要特别注意的是，当路由参数变化时（比如从 `/user/1` 跳转到 `/user/2`），组件实例会被复用，所以必须监听参数变化来重新加载数据。

你可以根据具体需求参考指南中的不同用法，有什么特定的场景需要详细讨论吗？