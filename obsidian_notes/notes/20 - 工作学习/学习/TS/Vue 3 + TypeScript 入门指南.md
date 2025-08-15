# Vue 3 + TypeScript 入门指南

从零开始理解 Vue 3 和 TypeScript

## 目录

- [什么是 Vue 3](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#什么是-vue-3)
- [什么是 TypeScript](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#什么是-typescript)
- [为什么要结合使用](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#为什么要结合使用)
- [Vue 3 核心概念](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#vue-3-核心概念)
- [TypeScript 基础](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#typescript-基础)
- [Vue 3 + TypeScript 实战](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#vue-3--typescript-实战)
- [常见问题解答](https://claude.ai/chat/92e61a9e-33d6-4230-916e-fe560ae07c29#常见问题解答)

## 什么是 Vue 3

Vue 3 是一个用于构建用户界面的 JavaScript 框架。想象一下：

### 传统网页开发 vs Vue 3

**传统方式**（需要手动操作 DOM）：

```html
<!-- HTML -->
<div id="app">
  <p id="message">Hello</p>
  <button id="btn">点击我</button>
</div>

<script>
// JavaScript - 需要手动操作DOM
document.getElementById('btn').addEventListener('click', function() {
  document.getElementById('message').textContent = '你好！';
});
</script>
```

**Vue 3 方式**（声明式，自动更新）：

```vue
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="changeMessage">点击我</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 数据
const message = ref('Hello')

// 方法
const changeMessage = () => {
  message.value = '你好！'
}
</script>
```

### Vue 3 的核心特点

1. **响应式数据**：数据变化，界面自动更新
2. **组件化**：把界面拆分成可复用的组件
3. **声明式编程**：描述你想要什么，而不是怎么做
4. **Composition API**：更灵活的代码组织方式

## 什么是 TypeScript

TypeScript 是 JavaScript 的超集，主要添加了**类型系统**。

### JavaScript vs TypeScript

**JavaScript**（动态类型，运行时才知道错误）：

```javascript
function addNumbers(a, b) {
  return a + b;
}

addNumbers(5, 3);        // 8 ✅
addNumbers('5', '3');    // '53' ❌ 但不会报错
addNumbers(5, 'hello');  // '5hello' ❌ 但不会报错
```

**TypeScript**（静态类型，写代码时就能发现错误）：

```typescript
function addNumbers(a: number, b: number): number {
  return a + b;
}

addNumbers(5, 3);        // 8 ✅
addNumbers('5', '3');    // ❌ 编译器报错：类型不匹配
addNumbers(5, 'hello');  // ❌ 编译器报错：类型不匹配
```

### TypeScript 的好处

1. **类型安全**：在写代码时就能发现错误
2. **更好的IDE支持**：自动补全、重构等
3. **代码文档**：类型本身就是文档
4. **团队协作**：代码更容易理解和维护

## 为什么要结合使用

### 没有 TypeScript 的问题

```javascript
// 你不知道 user 对象有什么属性
function displayUser(user) {
  console.log(user.name);     // user.name 存在吗？
  console.log(user.email);    // user.email 存在吗？
  console.log(user.age);      // user.age 是数字吗？
}
```

### 有了 TypeScript 的好处

```typescript
// 清晰地定义用户类型
interface User {
  name: string;
  email: string;
  age: number;
  isActive?: boolean; // ? 表示可选属性
}

function displayUser(user: User) {
  console.log(user.name);     // ✅ 确定存在，是字符串
  console.log(user.email);    // ✅ 确定存在，是字符串
  console.log(user.age);      // ✅ 确定存在，是数字
  console.log(user.phone);    // ❌ 编译器报错：User 类型没有 phone 属性
}
```

## Vue 3 核心概念

### 1. 响应式数据

**ref**：用于基本数据类型

```typescript
import { ref } from 'vue'

const count = ref(0)           // 数字
const message = ref('hello')   // 字符串
const isVisible = ref(true)    // 布尔值

// 使用时需要 .value
console.log(count.value)       // 0
count.value = 10               // 修改值
```

**reactive**：用于对象

```typescript
import { reactive } from 'vue'

const user = reactive({
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
})

// 直接使用，不需要 .value
console.log(user.name)         // '张三'
user.age = 26                  // 修改值
```

### 2. 计算属性

```typescript
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// 自动计算，依赖变化时更新
const fullName = computed(() => {
  return firstName.value + lastName.value
})

console.log(fullName.value)    // '张三'
```

### 3. 监听器

```typescript
import { ref, watch } from 'vue'

const count = ref(0)

// 监听 count 变化
watch(count, (newValue, oldValue) => {
  console.log(`count从 ${oldValue} 变成了 ${newValue}`)
})
```

### 4. 生命周期

```typescript
import { onMounted, onUnmounted } from 'vue'

// 组件挂载后执行
onMounted(() => {
  console.log('组件已挂载')
})

// 组件卸载前执行
onUnmounted(() => {
  console.log('组件即将卸载')
})
```

## TypeScript 基础

### 1. 基本类型

```typescript
// 基本类型
let name: string = '张三'
let age: number = 25
let isStudent: boolean = true
let hobbies: string[] = ['读书', '游泳']

// 对象类型
let person: {
  name: string;
  age: number;
} = {
  name: '李四',
  age: 30
}
```

### 2. 接口（Interface）

```typescript
// 定义接口
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;        // ? 表示可选
  readonly createTime: string; // readonly 表示只读
}

// 使用接口
const user: User = {
  id: 1,
  name: '王五',
  email: 'wangwu@example.com',
  createTime: '2024-01-01'
}
```

### 3. 类型别名（Type）

```typescript
// 定义类型别名
type Status = 'pending' | 'success' | 'error'
type ID = string | number

// 使用类型别名
let currentStatus: Status = 'pending'
let userId: ID = 123
```

### 4. 泛型

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg
}

let result1 = identity<string>('hello')  // result1 的类型是 string
let result2 = identity<number>(123)      // result2 的类型是 number

// 泛型接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 使用泛型接口
const userResponse: ApiResponse<User> = {
  code: 200,
  message: 'success',
  data: {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    createTime: '2024-01-01'
  }
}
```

## Vue 3 + TypeScript 实战

### 1. 定义组件

```vue
<template>
  <div class="user-card">
    <h3>{{ user.name }}</h3>
    <p>邮箱：{{ user.email }}</p>
    <p>年龄：{{ user.age }}</p>
    <button @click="updateAge">增加年龄</button>
    <p>状态：{{ statusText }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义接口
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type Status = 'active' | 'inactive' | 'pending'

// 响应式数据
const user = ref<User>({
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  age: 25
})

const status = ref<Status>('active')

// 计算属性
const statusText = computed(() => {
  switch (status.value) {
    case 'active':
      return '活跃'
    case 'inactive':
      return '非活跃'
    case 'pending':
      return '待定'
    default:
      return '未知'
  }
})

// 方法
const updateAge = () => {
  user.value.age += 1
}

// 生命周期
onMounted(() => {
  console.log('用户卡片组件已挂载')
})
</script>
```

### 2. 组件通信

**父组件传递数据给子组件（Props）**

```vue
<!-- 子组件 UserProfile.vue -->
<template>
  <div>
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
    <button @click="handleClick">点击</button>
  </div>
</template>

<script setup lang="ts">
// 定义 Props 类型
interface User {
  id: number;
  name: string;
  email: string;
}

// 定义 Props
const props = defineProps<{
  user: User;
  title?: string;
}>()

// 定义 Emits（子组件向父组件发送事件）
const emit = defineEmits<{
  userClick: [user: User]  // 事件名: [参数类型]
}>()

const handleClick = () => {
  emit('userClick', props.user)
}
</script>
<!-- 父组件 -->
<template>
  <div>
    <UserProfile 
      :user="currentUser" 
      title="用户信息"
      @user-click="handleUserClick"
    />
  </div>
</template>

<script setup lang="ts">
import UserProfile from './UserProfile.vue'

const currentUser = ref<User>({
  id: 1,
  name: '李四',
  email: 'lisi@example.com'
})

const handleUserClick = (user: User) => {
  console.log('用户被点击了:', user.name)
}
</script>
```

### 3. 使用 Pinia（状态管理）

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number;
  name: string;
  email: string;
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<User | null>(null)
  const isLoggedIn = ref(false)

  // 计算属性
  const displayName = computed(() => {
    return currentUser.value?.name || '游客'
  })

  // 方法
  const login = async (email: string, password: string) => {
    try {
      // 模拟 API 调用
      const user = await loginApi(email, password)
      currentUser.value = user
      isLoggedIn.value = true
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const logout = () => {
    currentUser.value = null
    isLoggedIn.value = false
  }

  return {
    // 状态
    currentUser,
    isLoggedIn,
    // 计算属性
    displayName,
    // 方法
    login,
    logout
  }
})

// 模拟 API
async function loginApi(email: string, password: string): Promise<User> {
  // 实际项目中这里会调用真实的 API
  return {
    id: 1,
    name: '张三',
    email: email
  }
}
```

在组件中使用：

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const handleLogin = async () => {
  try {
    await userStore.login('test@example.com', '123456')
    console.log('登录成功:', userStore.displayName)
  } catch (error) {
    console.error('登录失败')
  }
}
</script>

<template>
  <div>
    <p v-if="userStore.isLoggedIn">
      欢迎，{{ userStore.displayName }}！
    </p>
    <button v-else @click="handleLogin">
      登录
    </button>
  </div>
</template>
```

### 4. API 调用

```typescript
// types/api.ts - 定义 API 相关类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface Category {
  id: number;
  name: string;
  parent_id?: number;
}

// api/category.ts - API 函数
import httpClient from '@/utils/http'

export const categoryApi = {
  // 获取分类列表
  getCategories: async (parentId?: number): Promise<Category[]> => {
    try {
      // 指定返回类型
      const response = await httpClient.get<ApiResponse<Category[]>>(
        '/categories',
        {
          params: { parent_id: parentId }
        }
      )
      
      return response.data
    } catch (error) {
      console.error('获取分类失败:', error)
      throw error
    }
  }
}
```

在组件中使用：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { categoryApi } from '@/api/category'
import type { Category } from '@/types/api'

const categories = ref<Category[]>([])
const loading = ref(false)

const fetchCategories = async () => {
  try {
    loading.value = true
    categories.value = await categoryApi.getCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <ul v-else>
      <li v-for="category in categories" :key="category.id">
        {{ category.name }}
      </li>
    </ul>
  </div>
</template>
```

## 常见问题解答

### 1. 什么时候用 ref，什么时候用 reactive？

- **ref**：基本数据类型（数字、字符串、布尔值）
- **reactive**：对象和数组

```typescript
// ✅ 推荐
const count = ref(0)
const message = ref('hello')
const user = reactive({ name: '张三', age: 25 })

// ❌ 不推荐
const count = reactive({ value: 0 })  // 基本类型用 ref
const user = ref({ name: '张三', age: 25 })  // 对象用 reactive
```

### 2. 为什么 ref 需要 .value？

ref 创建的是一个包装对象，真实值在 .value 属性中：

```typescript
const count = ref(0)
console.log(count)        // { value: 0 }
console.log(count.value)  // 0

// 在模板中会自动解包，不需要 .value
```

### 3. 接口（interface）和类型别名（type）有什么区别？

```typescript
// interface - 主要用于对象结构
interface User {
  name: string;
  age: number;
}

// type - 更灵活，可以用于联合类型等
type Status = 'pending' | 'success' | 'error'
type UserOrAdmin = User | Admin

// 一般规则：对象用 interface，其他用 type
```

### 4. 可选属性 ? 和默认值有什么区别？

```typescript
interface User {
  name: string;
  age?: number;  // 可选，可能是 undefined
}

// 使用时
const user1: User = { name: '张三' }  // ✅ age 可选
const user2: User = { name: '李四', age: 25 }  // ✅

// 给可选属性设置默认值
const displayAge = (user: User) => {
  return user.age ?? 0  // 如果 age 是 undefined，返回 0
}
```

### 5. 如何处理异步操作？

```typescript
const fetchUser = async (id: number): Promise<User> => {
  try {
    const response = await api.getUser(id)
    return response.data
  } catch (error) {
    console.error('获取用户失败:', error)
    throw error  // 重新抛出错误，让调用方处理
  }
}

// 在组件中使用
const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const loadUser = async (id: number) => {
  try {
    loading.value = true
    error.value = null
    user.value = await fetchUser(id)
  } catch (err) {
    error.value = '加载用户失败'
  } finally {
    loading.value = false
  }
}
```

## 总结

**Vue 3** 让你能够：

- 用声明式的方式构建界面
- 数据变化时自动更新 DOM
- 组件化开发，代码更易维护

**TypeScript** 让你能够：

- 在编写代码时就发现错误
- 享受更好的 IDE 支持
- 代码更加自文档化

**结合使用** 的好处：

- 类型安全的组件开发
- 更好的团队协作
- 更少的运行时错误
- 更容易重构和维护

从你的项目开始，建议你：

1. 先掌握 Vue 3 的基本概念（ref、reactive、computed）
2. 学习 TypeScript 的基本类型系统
3. 在实际项目中逐步应用这些知识
4. 遇到问题时查阅官方文档

记住：不用一下子掌握所有内容，在实践中逐步学习是最好的方式！