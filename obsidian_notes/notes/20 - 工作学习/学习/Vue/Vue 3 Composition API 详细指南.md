# Vue 3 Composition API 详细指南

Vue 3 的 Composition API 提供了一种更灵活、更强大的方式来组织组件逻辑。它允许我们将相关的逻辑组合在一起，而不是按照选项类型分散在各个选项中。

## 1. 响应式数据：ref 和 reactive

### 1.1 ref()

`ref()` 用于创建响应式的基本数据类型引用，也可以用于对象和数组。

#### 基本用法

```javascript
import { ref } from 'vue'

export default {
  setup() {
    // 创建响应式数据
    const count = ref(0)
    const message = ref('Hello Vue 3!')
    const user = ref({ name: 'John', age: 25 })
    
    // 访问和修改值需要使用 .value
    console.log(count.value) // 0
    count.value++
    console.log(count.value) // 1
    
    return {
      count,
      message,
      user
    }
  }
}
```

#### 在模板中使用

```vue
<template>
  <!-- 在模板中会自动解包，不需要 .value -->
  <div>
    <p>计数: {{ count }}</p>
    <p>消息: {{ message }}</p>
    <p>用户: {{ user.name }}, 年龄: {{ user.age }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const message = ref('Hello Vue 3!')
    const user = ref({ name: 'John', age: 25 })
    
    const increment = () => {
      count.value++
    }
    
    return {
      count,
      message,
      user,
      increment
    }
  }
}
</script>
```

#### 常用场景

```javascript
// 1. 基本数据类型
const count = ref(0)
const name = ref('')
const isVisible = ref(true)

// 2. 数组
const list = ref([1, 2, 3])
list.value.push(4)

// 3. 对象
const form = ref({
  username: '',
  password: ''
})
form.value.username = 'admin'

// 4. DOM 引用
const inputRef = ref(null)
// 在模板中: <input ref="inputRef">
// 使用: inputRef.value.focus()
```

### 1.2 reactive()

`reactive()` 用于创建响应式的对象，返回对象的响应式代理。

#### 基本用法

```javascript
import { reactive } from 'vue'

export default {
  setup() {
    // 创建响应式对象
    const state = reactive({
      count: 0,
      user: {
        name: 'John',
        age: 25
      },
      todos: []
    })
    
    // 直接访问属性，无需 .value
    console.log(state.count) // 0
    state.count++
    console.log(state.count) // 1
    
    return {
      state
    }
  }
}
```

#### 嵌套对象的响应式

```javascript
const state = reactive({
  user: {
    profile: {
      name: 'John',
      settings: {
        theme: 'dark'
      }
    }
  }
})

// 所有层级都是响应式的
state.user.profile.name = 'Jane'
state.user.profile.settings.theme = 'light'
```

#### 数组的响应式操作

```javascript
const state = reactive({
  todos: [
    { id: 1, text: '学习 Vue', done: false },
    { id: 2, text: '写代码', done: true }
  ]
})

// 数组方法
state.todos.push({ id: 3, text: '新任务', done: false })
state.todos.splice(1, 1)
state.todos[0].done = true
```

### 1.3 ref vs reactive 的选择

| 特性   | ref       | reactive   |
| ---- | --------- | ---------- |
| 数据类型 | 任何类型      | 仅对象类型      |
| 访问方式 | 需要 .value | 直接访问属性     |
| 模板中  | 自动解包      | 直接使用       |
| 解构   | 会失去响应式    | 会失去响应式     |
| 重新分配 | 可以重新分配整个值 | 不能重新分配整个对象 |

```javascript
// 推荐的使用场景

// 使用 ref：
// 1. 基本数据类型
const count = ref(0)
const name = ref('')

// 2. 单个对象引用
const user = ref({ name: 'John' })

// 使用 reactive：
// 1. 复杂的状态对象
const state = reactive({
  loading: false,
  data: [],
  error: null
})

// 2. 表单数据
const form = reactive({
  username: '',
  password: '',
  remember: false
})
```

## 2. 计算属性和侦听器

### 2.1 computed()

计算属性在 Composition API 中使用 `computed()` 函数创建。

#### 基本用法

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(1)
    
    // 只读计算属性
    const doubleCount = computed(() => count.value * 2)
    
    console.log(doubleCount.value) // 2
    
    return {
      count,
      doubleCount
    }
  }
}
```

#### 可写计算属性

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const firstName = ref('John')
    const lastName = ref('Doe')
    
    const fullName = computed({
      get() {
        return firstName.value + ' ' + lastName.value
      },
      set(newValue) {
        [firstName.value, lastName.value] = newValue.split(' ')
      }
    })
    
    console.log(fullName.value) // John Doe
    fullName.value = 'Jane Smith'
    console.log(firstName.value) // Jane
    console.log(lastName.value) // Smith
    
    return {
      firstName,
      lastName,
      fullName
    }
  }
}
```

#### 复杂计算属性示例

```javascript
import { reactive, computed } from 'vue'

export default {
  setup() {
    const state = reactive({
      todos: [
        { id: 1, text: '学习 Vue', done: false },
        { id: 2, text: '写代码', done: true },
        { id: 3, text: '休息', done: false }
      ],
      filter: 'all' // 'all', 'active', 'completed'
    })
    
    // 过滤后的待办事项
    const filteredTodos = computed(() => {
      switch (state.filter) {
        case 'active':
          return state.todos.filter(todo => !todo.done)
        case 'completed':
          return state.todos.filter(todo => todo.done)
        default:
          return state.todos
      }
    })
    
    // 统计信息
    const todoStats = computed(() => ({
      total: state.todos.length,
      completed: state.todos.filter(todo => todo.done).length,
      active: state.todos.filter(todo => !todo.done).length
    }))
    
    return {
      state,
      filteredTodos,
      todoStats
    }
  }
}
```

### 2.2 watch()

`watch()` 用于侦听响应式数据的变化。

#### 侦听单个数据源

```javascript
import { ref, watch } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    // 侦听 ref
    watch(count, (newValue, oldValue) => {
      console.log(`count 从 ${oldValue} 变为 ${newValue}`)
    })
    
    // 侦听 getter 函数
    const state = reactive({ count: 0 })
    watch(
      () => state.count,
      (newValue, oldValue) => {
        console.log(`state.count 从 ${oldValue} 变为 ${newValue}`)
      }
    )
    
    return {
      count,
      state
    }
  }
}
```

#### 侦听多个数据源

```javascript
import { ref, reactive, watch } from 'vue'

export default {
  setup() {
    const name = ref('John')
    const age = ref(25)
    const state = reactive({ city: 'New York' })
    
    // 侦听多个数据源
    watch(
      [name, age, () => state.city],
      ([newName, newAge, newCity], [oldName, oldAge, oldCity]) => {
        console.log('用户信息发生变化:')
        console.log(`姓名: ${oldName} -> ${newName}`)
        console.log(`年龄: ${oldAge} -> ${newAge}`)
        console.log(`城市: ${oldCity} -> ${newCity}`)
      }
    )
    
    return {
      name,
      age,
      state
    }
  }
}
```

#### 深度侦听和立即执行

```javascript
import { reactive, watch } from 'vue'

export default {
  setup() {
    const state = reactive({
      user: {
        name: 'John',
        profile: {
          age: 25,
          city: 'New York'
        }
      }
    })
    
    // 深度侦听
    watch(
      () => state.user,
      (newUser, oldUser) => {
        console.log('用户对象发生深度变化:', newUser)
      },
      {
        deep: true, // 深度侦听
        immediate: true // 立即执行一次
      }
    )
    
    return {
      state
    }
  }
}
```

### 2.3 watchEffect()

`watchEffect()` 自动收集响应式依赖，当依赖变化时重新执行。

```javascript
import { ref, reactive, watchEffect } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const state = reactive({ name: 'John' })
    
    // 自动收集依赖
    watchEffect(() => {
      console.log(`count: ${count.value}, name: ${state.name}`)
    })
    
    // 带清理函数的 watchEffect
    watchEffect((onInvalidate) => {
      const timer = setTimeout(() => {
        console.log('定时器执行')
      }, 1000)
      
      // 清理副作用
      onInvalidate(() => {
        clearTimeout(timer)
      })
    })
    
    return {
      count,
      state
    }
  }
}
```

## 3. 生命周期钩子

在 Composition API 中，生命周期钩子以 `on` 前缀的函数形式提供。

### 3.1 常用生命周期钩子

```javascript
import { 
  ref, 
  onMounted, 
  onUpdated, 
  onUnmounted,
  onBeforeMount,
  onBeforeUpdate,
  onBeforeUnmount
} from 'vue'

export default {
  setup() {
    const count = ref(0)
    const message = ref('Hello')
    
    // 组件挂载前
    onBeforeMount(() => {
      console.log('组件即将挂载')
    })
    
    // 组件挂载后
    onMounted(() => {
      console.log('组件已挂载')
      console.log('可以访问 DOM 了')
      
      // 常用于：
      // - 发起 API 请求
      // - 设置定时器
      // - 初始化第三方库
      // - 绑定事件监听器
    })
    
    // 组件更新前
    onBeforeUpdate(() => {
      console.log('组件即将更新')
    })
    
    // 组件更新后
    onUpdated(() => {
      console.log('组件已更新')
      console.log('DOM 已更新')
    })
    
    // 组件卸载前
    onBeforeUnmount(() => {
      console.log('组件即将卸载')
    })
    
    // 组件卸载后
    onUnmounted(() => {
      console.log('组件已卸载')
      
      // 常用于：
      // - 清理定时器
      // - 移除事件监听器
      // - 清理副作用
      // - 取消未完成的请求
    })
    
    return {
      count,
      message
    }
  }
}
```

### 3.2 实际应用示例

#### API 请求和数据加载

```javascript
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const data = ref([])
    const loading = ref(false)
    const error = ref(null)
    
    const fetchData = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await fetch('/api/users')
        data.value = await response.json()
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchData()
    })
    
    return {
      data,
      loading,
      error,
      fetchData
    }
  }
}
```

#### 定时器管理

```javascript
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const time = ref(new Date())
    let timer = null
    
    onMounted(() => {
      // 设置定时器
      timer = setInterval(() => {
        time.value = new Date()
      }, 1000)
    })
    
    onUnmounted(() => {
      // 清理定时器
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    })
    
    return {
      time
    }
  }
}
```

#### 事件监听器

```javascript
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const windowWidth = ref(window.innerWidth)
    
    const handleResize = () => {
      windowWidth.value = window.innerWidth
    }
    
    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      windowWidth
    }
  }
}
```

### 3.3 错误处理钩子

```javascript
import { onErrorCaptured } from 'vue'

export default {
  setup() {
    // 捕获子组件错误
    onErrorCaptured((error, instance, info) => {
      console.error('捕获到错误:', error)
      console.log('错误来源组件:', instance)
      console.log('错误信息:', info)
      
      // 返回 false 阻止错误继续向上传播
      return false
    })
    
    return {}
  }
}
```

## 4. 组合式API的最佳实践

### 4.1 组合函数（Composables）

将相关逻辑封装成可复用的组合函数：

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  
  const isEven = computed(() => count.value % 2 === 0)
  const isPositive = computed(() => count.value > 0)
  
  return {
    count,
    increment,
    decrement,
    reset,
    isEven,
    isPositive
  }
}

// 在组件中使用
import { useCounter } from './composables/useCounter'

export default {
  setup() {
    const { count, increment, decrement, reset, isEven, isPositive } = useCounter(10)
    
    return {
      count,
      increment,
      decrement,
      reset,
      isEven,
      isPositive
    }
  }
}
```

### 4.2 逻辑分组和组织

```javascript
import { ref, computed, watch, onMounted } from 'vue'

export default {
  setup() {
    // 用户相关逻辑
    const user = ref({ name: '', email: '' })
    const userDisplayName = computed(() => user.value.name || '匿名用户')
    
    const updateUser = (newUser) => {
      user.value = { ...user.value, ...newUser }
    }
    
    // 数据获取逻辑
    const data = ref([])
    const loading = ref(false)
    
    const fetchData = async () => {
      loading.value = true
      try {
        // 模拟 API 调用
        const response = await new Promise(resolve => 
          setTimeout(() => resolve(['item1', 'item2']), 1000)
        )
        data.value = response
      } finally {
        loading.value = false
      }
    }
    
    // 搜索逻辑
    const searchQuery = ref('')
    const filteredData = computed(() => {
      if (!searchQuery.value) return data.value
      return data.value.filter(item => 
        item.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })
    
    // 生命周期
    onMounted(() => {
      fetchData()
    })
    
    // 侦听器
    watch(searchQuery, (newQuery) => {
      console.log('搜索查询变更:', newQuery)
    })
    
    return {
      // 用户相关
      user,
      userDisplayName,
      updateUser,
      
      // 数据相关
      data,
      loading,
      fetchData,
      
      // 搜索相关
      searchQuery,
      filteredData
    }
  }
}
```

### 4.3 TypeScript 支持

```typescript
import { ref, computed, Ref, ComputedRef } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export default {
  setup() {
    const user: Ref<User | null> = ref(null)
    const users: Ref<User[]> = ref([])
    
    const userCount: ComputedRef<number> = computed(() => users.value.length)
    
    const addUser = (newUser: User): void => {
      users.value.push(newUser)
    }
    
    return {
      user,
      users,
      userCount,
      addUser
    }
  }
}
```

## 总结

Vue 3 的 Composition API 提供了更灵活、更强大的组织组件逻辑的方式：

1. **响应式数据**：使用 `ref()` 处理基本类型，`reactive()` 处理对象
2. **计算属性**：使用 `computed()` 创建派生状态
3. **侦听器**：使用 `watch()` 和 `watchEffect()` 响应数据变化
4. **生命周期**：使用 `onMounted()`、`onUnmounted()` 等处理组件生命周期
5. **可复用性**：通过组合函数实现逻辑复用

相比选项式API，组合式API的优势在于：

- 更好的类型推导支持
- 更灵活的逻辑组织
- 更好的代码复用
- 更清晰的数据流向

选择使用组合式API还是选项式API主要取决于项目需求和团队偏好，两种方式都是Vue 3的有效组织代码的方式。

我已经为你创建了一份详细的 Vue 3 Composition API 指南，涵盖了你要求的所有内容：

## 主要内容包括：

### 1. 响应式数据

- **ref()**: 用于基本数据类型和对象引用，需要通过 `.value` 访问
- **reactive()**: 用于对象和数组，直接访问属性，支持深度响应式

### 2. 计算属性和侦听器

- **computed()**: 创建计算属性，支持只读和可写两种模式
- **watch()**: 侦听特定数据源的变化，支持深度侦听和立即执行
- **watchEffect()**: 自动收集依赖并响应变化

### 3. 生命周期钩子

- 完整的生命周期钩子：`onMounted`, `onUnmounted`, `onUpdated` 等
- 实际应用示例：API 请求、定时器管理、事件监听器
- 错误处理钩子

### 4. 最佳实践

- 组合函数（Composables）的创建和使用
- 逻辑分组和组织方式
- TypeScript 支持示例

这份指南包含了大量的代码示例和实际应用场景，可以帮助你更好地理解和使用 Vue 3 的 Composition API。每个概念都有详细的说明和多个使用示例，便于学习和参考。