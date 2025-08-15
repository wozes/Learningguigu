<template>
  <div class="composition-api-demo">
    <h1>Vue 3 Composition API + Vuex</h1>
    
    <!-- 基础状态显示 -->
    <section class="basic-state">
      <h2>基础状态</h2>
      <p>计数: {{ count }}</p>
      <p>用户: {{ user.name }}</p>
      <p>加载状态: {{ isLoading }}</p>
    </section>

    <!-- 计算属性 -->
    <section class="computed-values">
      <h2>计算属性</h2>
      <p>已完成任务: {{ completedTodos.length }}</p>
      <p>任务统计: {{ todosStats.completionRate }}</p>
      <p>用户全名: {{ userFullName }}</p>
    </section>

    <!-- 操作按钮 -->
    <section class="actions">
      <h2>操作</h2>
      <button @click="increment">增加</button>
      <button @click="decrement">减少</button>
      <button @click="reset">重置</button>
      <button @click="incrementAsync">异步增加</button>
      <button @click="fetchUserData">获取用户数据</button>
    </section>

    <!-- Todo 管理 -->
    <section class="todo-management">
      <h2>Todo 管理</h2>
      <div class="todo-input">
        <input 
          v-model="newTodo" 
          @keyup.enter="addTodo"
          placeholder="添加新任务"
        >
        <button @click="addTodo">添加</button>
      </div>
      
      <ul class="todo-list">
        <li v-for="todo in todos" :key="todo.id">
          <input 
            type="checkbox" 
            :checked="todo.completed"
            @change="toggleTodo(todo.id)"
          >
          <span :class="{ completed: todo.completed }">{{ todo.text }}</span>
          <button @click="removeTodo(todo.id)">删除</button>
        </li>
      </ul>
    </section>

    <!-- 表单处理 -->
    <section class="form-handling">
      <h2>表单处理</h2>
      <div>
        <label>用户名:</label>
        <input v-model="userName">
      </div>
      <div>
        <label>邮箱:</label>
        <input v-model="userEmail">
      </div>
    </section>

    <!-- 模块状态 -->
    <section class="module-state">
      <h2>模块状态</h2>
      <p>购物车商品: {{ cartItems.length }}</p>
      <p>购物车总价: ${{ cartTotal }}</p>
      <button @click="addToCart">添加商品</button>
      <button @click="clearCart">清空购物车</button>
    </section>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CompositionApiDemo',
  
  setup() {
    // ===== 1. 获取 store 实例 =====
    const store = useStore()
    
    // ===== 2. 响应式数据 =====
    const newTodo = ref('')
    
    // ===== 3. 访问 State =====
    
    // 基础 state 访问
    const count = computed(() => store.state.count)
    const user = computed(() => store.state.user)
    const todos = computed(() => store.state.todos)
    const isLoading = computed(() => store.state.isLoading)
    
    // 模块 state 访问
    const cartItems = computed(() => store.state.shopping.cart.items)
    const cartTotal = computed(() => store.state.shopping.cart.total)
    
    // ===== 4. 访问 Getters =====
    
    const completedTodos = computed(() => store.getters.completedTodos)
    const todosStats = computed(() => store.getters.todosStats)
    const userFullName = computed(() => store.getters['user/fullName'])
    
    // 带参数的 getters
    const getTodoById = (id) => store.getters.getTodoById(id)
    
    // ===== 5. 双向绑定的计算属性 =====
    
    const userName = computed({
      get: () => store.state.user.name,
      set: (value) => store.commit('SET_USER', { name: value })
    })
    
    const userEmail = computed({
      get: () => store.state.user.email,
      set: (value) => store.commit('SET_USER', { email: value })
    })
    
    // ===== 6. Mutations 方法 =====
    
    const increment = () => store.commit('INCREMENT')
    const decrement = () => store.commit('DECREMENT')
    const reset = () => store.commit('SET_COUNT', 0)
    
    const addTodoItem = (text) => {
      store.commit('ADD_TODO', { text })
    }
    
    const toggleTodo = (id) => {
      store.commit('TOGGLE_TODO', id)
    }
    
    const removeTodo = (id) => {
      store.commit('REMOVE_TODO', id)
    }
    
    // ===== 7. Actions 方法 =====
    
    const incrementAsync = () => {
      return store.dispatch('incrementAsync', 1000)
    }
    
    const fetchUserData = async () => {
      try {
        await store.dispatch('fetchUser', 123)
      } catch (error) {
        console.error('获取用户数据失败:', error)
      }
    }
    
    // 模块 actions
    const addToCart = () => {
      const item = {
        id: Date.now(),
        name: `商品 ${Date.now()}`,
        price: Math.floor(Math.random() * 100) + 1
      }
      store.dispatch('shopping/cart/addItem', item)
    }
    
    const clearCart = () => {
      store.dispatch('shopping/cart/clearCart')
    }
    
    // ===== 8. 复杂的业务逻辑 =====
    
    const addTodo = () => {
      if (newTodo.value.trim()) {
        addTodoItem(newTodo.value)
        newTodo.value = ''
      }
    }
    
    // 批量操作
    const markAllCompleted = () => {
      todos.value.forEach(todo => {
        if (!todo.completed) {
          toggleTodo(todo.id)
        }
      })
    }
    
    // 异步批量操作
    const syncAllTodos = async () => {
      try {
        store.commit('SET_LOADING', true)
        
        for (const todo of todos.value) {
          await store.dispatch('syncTodo', todo)
        }
        
        console.log('所有任务同步完成')
      } catch (error) {
        console.error('同步失败:', error)
      } finally {
        store.commit('SET_LOADING', false)
      }
    }
    
    // ===== 9. 监听状态变化 =====
    
    // 监听单个状态
    watch(count, (newCount, oldCount) => {
      console.log(`计数从 ${oldCount} 变为 ${newCount}`)
    })
    
    // 监听复杂对象
    watch(user, (newUser) => {
      console.log('用户信息更新:', newUser)
      // 用户信息变化时获取相关数据
      if (newUser.id) {
        store.dispatch('fetchUserRelatedData', newUser.id)
      }
    }, { deep: true })
    
    // 监听多个状态
    watch([count, isLoading], ([newCount, newLoading], [oldCount, oldLoading]) => {
      if (newCount !== oldCount) {
        console.log('计数变化')
      }
      if (newLoading !== oldLoading) {
        console.log('加载状态变化')
      }
    })
    
    // 监听 getter
    watch(completedTodos, (newCompleted) => {
      if (newCompleted.length > 0) {
        console.log(`完成了 ${newCompleted.length} 个任务`)
      }
    })
    
    // ===== 10. 生命周期处理 =====
    
    onMounted(async () => {
      // 组件挂载时初始化数据
      try {
        await Promise.all([
          store.dispatch('fetchInitialData'),
          store.dispatch('user/fetchProfile'),
          store.dispatch('shopping/cart/loadCart')
        ])
      } catch (error) {
        console.error('初始化数据失败:', error)
      }
    })
    
    onUnmounted(() => {
      // 清理工作
      store.commit('CLEAR_TEMPORARY_DATA')
    })
    
    // ===== 11. 自定义 composables =====
    
    // 可以提取为单独的 composable
    const useTodos = () => {
      const todos = computed(() => store.state.todos)
      const completedCount = computed(() => 
        todos.value.filter(todo => todo.completed).length
      )
      
      const addTodo = (text) => {
        store.commit('ADD_TODO', { text })
      }
      
      const toggleTodo = (id) => {
        store.commit('TOGGLE_TODO', id)
      }
      
      return {
        todos,
        completedCount,
        addTodo,
        toggleTodo
      }
    }
    
    // 用户相关的 composable
    const useUser = () => {
      const user = computed(() => store.state.user)
      const isAuthenticated = computed(() => store.getters.isAuthenticated)
      
      const login = async (credentials) => {
        return store.dispatch('login', credentials)
      }
      
      const logout = () => {
        store.dispatch('logout')
      }
      
      return {
        user,
        isAuthenticated,
        login,
        logout
      }
    }
    
    // ===== 12. 错误处理 =====
    
    const handleAsyncAction = async (actionName, payload) => {
      try {
        store.commit('SET_LOADING', true)
        store.commit('CLEAR_ERROR')
        
        const result = await store.dispatch(actionName, payload)
        return result
      } catch (error) {
        store.commit('SET_ERROR', error.message)
        throw error
      } finally {
        store.commit('SET_LOADING', false)
      }
    }
    
    // ===== 13. 返回给模板使用的数据和方法 =====
    
    return {
      // 状态
      count,
      user,
      todos,
      isLoading,
      cartItems,
      cartTotal,
      newTodo,
      
      // 计算属性
      completedTodos,
      todosStats,
      userFullName,
      userName,
      userEmail,
      
      // 方法
      increment,
      decrement,
      reset,
      incrementAsync,
      fetchUserData,
      addTodo,
      toggleTodo,
      removeTodo,
      addToCart,
      clearCart,
      markAllCompleted,
      syncAllTodos,
      handleAsyncAction,
      
      // Composables (如果需要的话)
      // ...useTodos(),
      // ...useUser()
    }
  }
}
</script>

<style scoped>
.composition-api-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h2 {
  color: #333;
  margin-bottom: 15px;
}

button {
  margin: 5px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

input {
  margin: 5px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  padding: 10px;
  margin: 5px 0;
  background-color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.todo-input {
  margin-bottom: 15px;
}

label {
  display: inline-block;
  width: 80px;
  margin-right: 10px;
}