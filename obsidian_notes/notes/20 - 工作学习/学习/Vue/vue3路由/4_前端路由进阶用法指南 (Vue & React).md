# 前端路由进阶用法指南 (Vue & React)

## 目录

- [基础路由回顾](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#基础路由回顾)
- [动态路由](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#动态路由)
- [嵌套路由](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#嵌套路由)
- [路由守卫](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#路由守卫)
- [程序化导航](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#程序化导航)
- [路由懒加载](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#路由懒加载)
- [路由元信息](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#路由元信息)
- [查询参数和Hash](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#查询参数和hash)
- [路由过渡动画](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#路由过渡动画)
- [错误处理](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#错误处理)
- [最佳实践](https://claude.ai/chat/e2352b4d-7bf9-4b85-a8fe-83f02e2be4f0#最佳实践)

## 基础路由回顾

### Vue Router (v4)

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: () => import('@/views/Contact.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### React Router (v6)

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 动态路由

### 1. 单参数动态路由

**Vue Router:**

```javascript
// 路由配置
const routes = [
  { path: '/user/:id', component: UserProfile }
]

// 组件中获取参数
<template>
  <div>用户ID: {{ $route.params.id }}</div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
console.log(route.params.id)
</script>
```

**React Router:**

```javascript
// 路由配置
<Route path="/user/:id" element={<UserProfile />} />

// 组件中获取参数
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams();
  return <div>用户ID: {id}</div>;
}
```

### 2. 多参数动态路由

**Vue Router:**

```javascript
// 路由配置
{ path: '/user/:userId/post/:postId', component: PostDetail }

// 组件使用
<template>
  <div>用户{{ $route.params.userId }}的帖子{{ $route.params.postId }}</div>
</template>

<script setup>
const route = useRoute()
const { userId, postId } = route.params
</script>
```

**React Router:**

```javascript
<Route path="/user/:userId/post/:postId" element={<PostDetail />} />

function PostDetail() {
  const { userId, postId } = useParams();
  return <div>用户{userId}的帖子{postId}</div>;
}
```

### 3. 可选参数路由

**Vue Router:**

```javascript
// 路由配置
{ path: '/blog/:year?/:month?', component: Blog }

// 组件使用
<template>
  <div>
    年份: {{ $route.params.year || '全部' }}
    月份: {{ $route.params.month || '全部' }}
  </div>
</template>
```

**React Router:**

```javascript
<Route path="/blog/:year?/:month?" element={<Blog />} />

function Blog() {
  const { year, month } = useParams();
  return (
    <div>
      年份: {year || '全部'}
      月份: {month || '全部'}
    </div>
  );
}
```

### 4. 通配符路由

**Vue Router:**

```javascript
// 路由配置
{ path: '/docs/:pathMatch(.*)*', component: Docs }

// 组件使用
<template>
  <div>文档路径: {{ $route.params.pathMatch }}</div>
</template>
```

**React Router:**

```javascript
<Route path="/docs/*" element={<DocsLayout />} />

function DocsLayout() {
  const location = useLocation();
  const subPath = location.pathname.replace('/docs/', '');
  return <div>文档路径: {subPath}</div>;
}
```

## 嵌套路由

### Vue Router 嵌套路由

```javascript
// 路由配置
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      { path: '', component: DashboardHome }, // 默认子路由
      { path: 'profile', component: Profile },
      { path: 'settings', component: Settings }
    ]
  }
]

// Dashboard.vue
<template>
  <div>
    <nav>
      <router-link to="/dashboard/profile">个人资料</router-link>
      <router-link to="/dashboard/settings">设置</router-link>
    </nav>
    <main>
      <router-view /> <!-- 子路由渲染位置 -->
    </main>
  </div>
</template>
```

### React Router 嵌套路由

```javascript
import { Outlet, Link } from 'react-router-dom';

// 父组件布局
function Dashboard() {
  return (
    <div>
      <nav>
        <Link to="/dashboard/profile">个人资料</Link>
        <Link to="/dashboard/settings">设置</Link>
      </nav>
      <main>
        <Outlet /> {/* 子路由渲染位置 */}
      </main>
    </div>
  );
}

// 路由配置
<Route path="/dashboard" element={<Dashboard />}>
  <Route index element={<DashboardHome />} /> {/* 默认子路由 */}
  <Route path="profile" element={<Profile />} />
  <Route path="settings" element={<Settings />} />
</Route>
```

## 路由守卫

### Vue Router 路由守卫

```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

// 路由配置中的守卫
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

// 组件内守卫
<script setup>
import { onBeforeRouteEnter, onBeforeRouteLeave } from 'vue-router'

onBeforeRouteEnter((to, from, next) => {
  // 进入路由前
  console.log('进入路由前')
  next()
})

onBeforeRouteLeave((to, from, next) => {
  // 离开路由前
  const answer = window.confirm('确定要离开吗？')
  if (answer) {
    next()
  } else {
    next(false)
  }
})
</script>
```

### React Router 路由守卫

```javascript
import { Navigate, useLocation } from 'react-router-dom';

// 认证路由组件
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// 使用方式
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// 角色权限守卫
function RoleGuard({ children, requiredRole }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}
```

## 程序化导航

### Vue Router 导航

```javascript
<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 基础导航
const goToProfile = () => {
  router.push('/profile')
}

// 带参数导航
const goToUser = (userId) => {
  router.push(`/user/${userId}`)
  // 或者
  router.push({ path: '/user', params: { id: userId } })
}

// 带查询参数
const searchProducts = (keyword) => {
  router.push({ 
    path: '/products', 
    query: { search: keyword, page: 1 } 
  })
}

// 替换当前路由
const replace = () => {
  router.replace('/new-path')
}

// 前进后退
const goBack = () => {
  router.go(-1) // 或 router.back()
}

const goForward = () => {
  router.go(1) // 或 router.forward()
}
</script>
```

### React Router 导航

```javascript
import { useNavigate, useLocation } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  // 基础导航
  const goToProfile = () => {
    navigate('/profile');
  };

  // 带参数导航
  const goToUser = (userId) => {
    navigate(`/user/${userId}`);
  };

  // 带查询参数
  const searchProducts = (keyword) => {
    navigate(`/products?search=${keyword}&page=1`);
  };

  // 替换当前路由
  const replace = () => {
    navigate('/new-path', { replace: true });
  };

  // 前进后退
  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  // 带状态导航
  const goWithState = () => {
    navigate('/target', { state: { from: location.pathname } });
  };
}
```

## 路由懒加载

### Vue Router 懒加载

```javascript
// 基础懒加载
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]

// 分组懒加载
const routes = [
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/Admin.vue')
  },
  {
    path: '/admin/users',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/AdminUsers.vue')
  }
]

// 动态导入组件
<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() => import('./AsyncComponent.vue'))
</script>
```

### React Router 懒加载

```javascript
import { lazy, Suspense } from 'react';

// 懒加载组件
const About = lazy(() => import('./components/About'));
const Dashboard = lazy(() => import('./components/Dashboard'));

// 路由配置
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>加载中...</div>}>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 自定义加载组件
const LoadingComponent = () => (
  <div className="loading">
    <div className="spinner"></div>
    <p>页面加载中...</p>
  </div>
);
```

## 路由元信息

### Vue Router 元信息

```javascript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: '仪表板',
      roles: ['admin', 'user'],
      breadcrumb: ['首页', '仪表板']
    }
  }
]

// 使用元信息
<script setup>
import { useRoute } from 'vue-router'
import { watchEffect } from 'vue'

const route = useRoute()

// 动态设置页面标题
watchEffect(() => {
  document.title = route.meta.title || '默认标题'
})

// 检查权限
const hasPermission = route.meta.roles?.includes(userRole)
</script>
```

### React Router 元信息 (自定义实现)

```javascript
// 路由配置带元数据
const routeConfig = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    meta: {
      title: '仪表板',
      requiresAuth: true,
      roles: ['admin', 'user']
    }
  }
];

// 自定义Hook处理元信息
function useRouteTitle(title) {
  useEffect(() => {
    document.title = title || '默认标题';
  }, [title]);
}

// 在组件中使用
function Dashboard() {
  useRouteTitle('仪表板');
  
  return <div>仪表板内容</div>;
}
```

## 查询参数和Hash

### Vue Router 查询参数

```javascript
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, watch } from 'vue'

const route = useRoute()
const router = useRouter()

// 获取查询参数
const searchQuery = computed(() => route.query.search || '')
const currentPage = computed(() => parseInt(route.query.page) || 1)

// 更新查询参数
const updateQuery = (newQuery) => {
  router.push({
    query: {
      ...route.query,
      ...newQuery
    }
  })
}

// 监听查询参数变化
watch(() => route.query, (newQuery) => {
  console.log('查询参数变化:', newQuery)
}, { deep: true })

// Hash 操作
const scrollToSection = (sectionId) => {
  router.push({
    hash: `#${sectionId}`
  })
}
</script>
```

### React Router 查询参数

```javascript
import { useSearchParams, useLocation } from 'react-router-dom';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // 获取查询参数
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  // 更新查询参数
  const updateQuery = (newParams) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          updated.set(key, value);
        } else {
          updated.delete(key);
        }
      });
      return updated;
    });
  };

  // Hash 操作
  const scrollToSection = (sectionId) => {
    window.location.hash = sectionId;
  };

  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => updateQuery({ search: e.target.value })}
      />
    </div>
  );
}
```

## 路由过渡动画

### Vue Router 过渡动画

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition 
      :name="route.meta.transition || 'fade'"
      mode="out-in"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 滑动动画 */
.slide-left-enter-active, .slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* 缩放动画 */
.scale-enter-active, .scale-leave-active {
  transition: transform 0.3s ease;
}
.scale-enter-from, .scale-leave-to {
  transform: scale(0.8);
}
</style>
```

### React Router 过渡动画

```javascript
import { useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition
        key={location.pathname}
        classNames="fade"
        timeout={300}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

// CSS 样式
/*
.fade-enter {
  opacity: 0;
}
.fade-enter-active {
  opacity: 1;
  transition: opacity 300ms ease-in;
}
.fade-exit {
  opacity: 1;
}
.fade-exit-active {
  opacity: 0;
  transition: opacity 300ms ease-in;
}
*/
```

## 错误处理

### Vue Router 错误处理

```javascript
// 全局错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 可以跳转到错误页面
  router.push('/error')
})

// 404 路由
const routes = [
  // ... 其他路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  }
]

// 组件内错误边界
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((error, instance, info) => {
  console.error('组件错误:', error)
  return false // 阻止错误继续传播
})
</script>
```

### React Router 错误处理

```javascript
import { useRouteError } from 'react-router-dom';

// 错误边界组件
function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="error-page">
      <h1>出错了!</h1>
      <p>{error.statusText || error.message}</p>
    </div>
  );
}

// 路由配置
<Route 
  path="/dashboard" 
  element={<Dashboard />}
  errorElement={<ErrorBoundary />}
/>

// 404 路由
<Route path="*" element={<NotFound />} />

// 自定义错误处理Hook
function useErrorHandler() {
  return (error) => {
    console.error('路由错误:', error);
    // 可以发送错误报告
    // 可以显示错误提示
  };
}
```

## 最佳实践

### 1. 路由结构组织

```javascript
// 推荐的路由结构
const routes = [
  // 公共路由
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  
  // 需要认证的路由
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: DashboardHome },
      { path: 'profile', component: Profile },
      { path: 'settings', component: Settings }
    ]
  },
  
  // 管理员路由
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresRole: 'admin' },
    children: [
      { path: 'users', component: UserManagement },
      { path: 'system', component: SystemSettings }
    ]
  },
  
  // 404 页面 (放在最后)
  { path: '/:pathMatch(.*)*', component: NotFound }
]
```

### 2. 性能优化

```javascript
// Vue Router 性能优化
const routes = [
  {
    path: '/heavy-page',
    component: () => import(
      /* webpackChunkName: "heavy" */ 
      '@/views/HeavyPage.vue'
    )
  }
]

// React Router 性能优化
const HeavyPage = lazy(() => 
  import(/* webpackChunkName: "heavy" */ './HeavyPage')
);

// 预加载关键路由
router.prefetch('/important-page');
```

### 3. SEO 优化

```javascript
// Vue Router SEO
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '默认标题'
  
  // 设置 meta 描述
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.content = to.meta.description || '默认描述'
  }
  
  next()
})

// React Router SEO (使用 React Helmet)
import { Helmet } from 'react-helmet';

function ProductPage({ product }) {
  return (
    <>
      <Helmet>
        <title>{product.name} - 我的商店</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
      </Helmet>
      <div>{product.name}</div>
    </>
  );
}
```

### 4. 路由测试

```javascript
// Vue Router 测试
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/user/:id', component: UserProfile }]
})

test('用户页面路由', async () => {
  router.push('/user/123')
  await router.isReady()
  
  const wrapper = mount(UserProfile, {
    global: {
      plugins: [router]
    }
  })
  
  expect(wrapper.text()).toContain('123')
})

// React Router 测试
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test('用户页面路由', () => {
  render(
    <MemoryRouter initialEntries={['/user/123']}>
      <Routes>
        <Route path="/user/:id" element={<UserProfile />} />
      </Routes>
    </MemoryRouter>
  );
  
  expect(screen.getByText('用户ID: 123')).toBeInTheDocument();
});
```

### 5. 路由缓存策略

```javascript
// Vue Router 缓存
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="['UserList', 'ProductList']">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

// React Router 缓存 (需要第三方库或自定义实现)
import { useState, useEffect } from 'react';

const routeCache = new Map();

function CachedRoute({ path, component: Component }) {
  const [cachedComponent, setCachedComponent] = useState(null);
  
  useEffect(() => {
    if (routeCache.has(path)) {
      setCachedComponent(routeCache.get(path));
    } else {
      const instance = <Component />;
      routeCache.set(path, instance);
      setCachedComponent(instance);
    }
  }, [path, Component]);
  
  return cachedComponent;
}
```

这个指南涵盖了 Vue Router 和 React Router 的主要进阶用法，包括动态路由、嵌套路由、路由守卫、程序化导航等核心功能，以及性能优化和最佳实践建议。