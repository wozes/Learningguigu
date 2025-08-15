<template>
  <div class="vuex-usage-demo">
    <!-- ===== 1. 基础用法展示 ===== -->
    <section class="basic-usage">
      <h2>基础用法</h2>
      
      <!-- 直接访问 state -->
      <p>计数器: {{ $store.state.count }}</p>
      
      <!-- 直接访问 getters -->
      <p>用户全名: {{ $store.getters.userFullName }}</p>
      
      <!-- 直接调用 mutations -->
      <button @click="$store.commit('INCREMENT')">直接调用 Mutation</button>
      
      <!-- 直接调用 actions -->
      <button @click="$store.dispatch('incrementAsync', 500)">直接调用 Action</button>
    </section>

    <!-- ===== 2. 使用辅助函数 ===== -->
    <section class="helper-functions">
      <h2>辅助函数用法</h2>
      
      <!-- mapState 映射的状态 -->
      <div>
        <p>计数: {{ count }}</p>
        <p>消息: {{ message }}</p>
        <p>用户: {{ user.name }}</p>
        <p>重命名的计数: {{ counter }}</p>
      </div>
      
      <!-- mapGetters 映射的计算属性 -->
      <div>
        <p>已完成任务: {{ completedTodos.length }}</p>
        <p>活跃任务: {{ activeTodos.length }}</p>
        <p>任务统计: {{ todosStats.completionRate }}</p>
      </div>
      
      <!-- mapMutations 映射的方法 -->
      <div>
        <button @click="INCREMENT">增加</button>
        <button @click="DECREMENT">减少</button>
        <button @click="SET_COUNT(100)">设置为100</button>
        <button @click="increment">重命名的增加方法</button>
      </div>
      
      <!-- mapActions 映射的方法 -->
      <div>
        <button @click="fetchUser(123)">获取用户</button>
        <button @click="loginUser">登录</button>
        <button @click="asyncIncrement">异步增加</button>
      </div>
    </section>

    <!-- ===== 3. 模块化用法 ===== -->
    <section class="modules-usage">
      <h2>模块化用法</h2>
      
      <!-- 访问命名空间模块 -->
      <div>
        <p>用户资料: {{ userProfile?.name }}</p>
        <p>购物车商品数: {{ cartItems.length }}</p>
        <p>购物车总价: {{ cartTotal }}</p>
      </div>
      
      <!-- 模块方法调用 -->
      <div>
        <button @click="updateUserProfile">更新用户资料</button>
        <button @click="addToCart">添加到购物车</button>
        <button @click="clearShoppingCart">清空购物车</button>
      </div>
    </section>

    <!-- ===== 4. 表单处理 ===== -->
    <section class="form-handling">
      <h2>表单处理</h2>
      
      <!-- v-model 与 Vuex 结合 -->
      <div>
        <label>消息 (直接绑定):</label>
        <input v-model="message">
      </div>
      
      <div>
        <label>用户名 (计算属性方式):</label>
        <input v-model="userName">
      </div>
      
      <div>
        <label>邮箱 (事件处理方式):</label>
        <input :value="user.email" @input="updateUserEmail">
      </div>
    </section>

    <!-- ===== 5. 条件渲染和列表 ===== -->
    <section class="conditional-lists">
      <h2>条件渲染和列表</h2>
      
      <!-- 加载状态 -->
      <div v-if="isLoading">加载中...</div>
      <div v-else-if="error">错误: {{ error }}</div>
      
      <!-- Todo 列表 -->
      <div v-else>
        <div class="todo-input">
          <input 
            v-model="newTodoText" 
            @keyup.enter="addNewTodo"
            placeholder="添加新任务"
          >
          <button @click="addNewTodo">添加</button>
        </div>
        
        <ul class="todo-list">
          <li 
            v-for="todo in todos" 
            :key="todo.id"
            :class="{ completed: todo.completed }"
          >
            <input 
              type="checkbox" 
              :checked="todo.completed"
              @change="toggleTodoStatus(todo.id)"
            >
            <span>{{ todo.text }}</span>
            <button @click="removeTodoItem(todo.id)">删除</button>
          </li>
        </ul>
      </div>
    </section>

    <!-- ===== 6. 异步操作处理 ===== -->
    <section class="async-operations">
      <h2>异步操作处理</h2>
      
      <div>
        <button @click="handleAsyncOperation" :disabled="isProcessing">
          {{ isProcessing ? '处理中...' : '执行异步操作' }}
        </button>
      </div>
      
      <div v-if="operationResult">
        操作结果: {{ operationResult }}
      </div>
    </section>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'VuexUsageDemo',
  
  data() {
    return {
      newTodoText: '',
      isProcessing: false,
      operationResult: null
    }
  },

  computed: {
    // ===== mapState 的各种用法 =====
    
    // 1. 数组形式 - 当计算属性名与 state 属性名相同
    ...mapState(['count', 'message', 'user', 'todos', 'isLoading', 'error']),
    
    // 2. 对象形式 - 重命名映射
    ...mapState({
      counter: 'count',                    // 重命名
      msg: state => state.message,         // 使用函数
      userInfo: state => state.user        // 使用函数重命名
    }),
    
    // 3. 混合使用
    ...mapState({
      // 使用箭头函数
      todos: state => state.todos,
      // 使用字符串
      loading: 'isLoading'
    }),

    // ===== mapGetters 的各种用法 =====
    
    // 1. 数组形式
    ...mapGetters(['completedTodos', 'activeTodos', 'todosStats']),
    
    // 2. 对象形式 - 重命名
    ...mapGetters({
      finishedTodos: 'completedTodos',
      pendingTodos: 'activeTodos'
    }),

    // ===== 命名空间模块的映射 =====
    
    // 3. 模块 state
    ...mapState('user', {
      userProfile: 'profile',
      userPreferences: 'preferences'
    }),
    
    // 4. 模块 getters
    ...mapGetters('user', {
      userFullName: 'fullName',
      isUserAdmin: 'isAdmin'
    }),
    
    // 5. 嵌套模块
    ...mapState('shopping/cart', {
      cartItems: 'items',
      cartTotal: 'total'
    }),

    // ===== 自定义计算属性处理表单 =====
    
    // v-model 的计算属性写法
    userName: {
      get() {
        return this.$store.state.user.name
      },
      set(value) {
        this.$store.commit('SET_USER', { name: value })
      }
    },
    
    // 更复杂的计算属性
    filteredTodos() {
      const filter = this.$store.state.todoFilter
      switch (filter) {
        case 'completed':
          return this.completedTodos
        case 'active':
          return this.activeTodos
        default:
          return this.todos
      }
    }
  },

  methods: {
    // ===== mapMutations 的各种用法 =====
    
    // 1. 数组形式
    ...mapMutations(['INCREMENT', 'DECREMENT', 'SET_COUNT', 'ADD_TODO']),
    
    // 2. 对象形式 - 重命名
    ...mapMutations({
      increment: 'INCREMENT',
      setCounter: 'SET_COUNT'
    }),

    // ===== mapActions 的各种用法 =====
    
    // 1. 数组形式
    ...mapActions(['fetchUser', 'incrementAsync']),
    
    // 2. 对象形式 - 重命名
    ...mapActions({
      asyncIncrement: 'incrementAsync',
      getUserData: 'fetchUser'
    }),

    // ===== 命名空间模块的方法映射 =====
    
    // 3. 模块 mutations
    ...mapMutations('user', {
      setUserProfile: 'SET_PROFILE',
      updatePrefs: 'UPDATE_PREFERENCES'
    }),
    
    // 4. 模块 actions
    ...mapActions('user', {
      fetchUserProfile: 'fetchProfile',
      updateUserProfile: 'updateProfile'
    }),
    
    // 5. 嵌套模块 actions
    ...mapActions('shopping/cart', {
      addToCart: 'addItem',
      clearShoppingCart: 'clearCart'
    }),

    // ===== 自定义方法 =====
    
    // 表单处理方法
    updateUserEmail(event) {
      this.$store.commit('SET_USER', { 
        email: event.target.value 
      })
    },
    
    // Todo 相关方法
    addNewTodo() {
      if (this.newTodoText.trim()) {
        this.$store.dispatch('addTodo', this.newTodoText)
        this.newTodoText = ''
      }
    },
    
    toggleTodoStatus(todoId) {
      this.$store.commit('TOGGLE_TODO', todoId)
    },
    
    removeTodoItem(todoId) {
      this.$store.commit('REMOVE_TODO', todoId)
    },
    
    // 登录处理
    async loginUser() {
      try {
        await this.$store.dispatch('login', {
          username: 'demo@example.com',
          password: 'password123'
        })
        this.$message.success('登录成功')
      } catch (error) {
        this.$message.error('登录失败: ' + error.message)
      }
    },
    
    // 复杂的异步操作处理
    async handleAsyncOperation() {
      this.isProcessing = true
      this.operationResult = null
      
      try {
        // 多个异步操作
        await this.$store.dispatch('fetchUser', 123)
        await this.$store.dispatch('fetchTodos')
        
        // 使用 Promise.all 并行执行
        const [userData, todosData] = await Promise.all([
          this.$store.dispatch('fetchUserProfile'),
          this.$store.dispatch('fetchUserTodos')
        ])
        
        this.operationResult = '所有操作完成'
      } catch (error) {
        this.operationResult = '操作失败: ' + error.message
      } finally {
        this.isProcessing = false
      }
    },
    
    // 条件性调用
    async conditionalAction() {
      // 检查状态后再执行
      if (this.$store.getters.isAuthenticated) {
        await this.$store.dispatch('fetchPrivateData')
      } else {
        await this.$store.dispatch('redirectToLogin')
      }
    },
    
    // 批量操作
    bulkUpdateTodos() {
      const updates = this.todos.map(todo => ({
        id: todo.id,
        updates: { lastModified: new Date() }
      }))
      
      updates.forEach(({ id, updates }) => {
        this.$store.commit('UPDATE_TODO', { id, updates })
      })
    }
  },

  // ===== 生命周期中使用 Vuex =====
  
  async created() {
    // 组件创建时获取数据
    try {
      await this.$store.dispatch('fetchInitialData')
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  },
  
  async mounted() {
    // 组件挂载后的操作
    if (this.$store.getters.shouldRefreshData) {
      await this.$store.dispatch('refreshAllData')
    }
  },
  
  beforeUnmount() {
    // 组件销毁前清理
    this.$store.commit('CLEAR_TEMPORARY_DATA')
  },

  // ===== 监听 Vuex 状态变化 =====
  
  watch: {
    // 监听 state 变化
    '$store.state.user': {
      handler(newUser, oldUser) {
        console.log('用户信息变化:', newUser)
      },
      deep: true
    },
    
    // 监听 getters 变化
    '$store.getters.todosStats': {
      handler(newStats) {
        console.log('任务统计更新:', newStats)
      }
    },
    
    // 使用计算属性监听
    user: {
      handler(newUser) {
        // 用户信息变化时的处理
        if (newUser.id) {
          this.$store.dispatch('fetchUserRelatedData', newUser.id)
        }
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<style scoped>
.vuex-usage-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

section {
  margin-bottom: 40px;
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

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
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

.todo-list li.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.todo-input {
  margin-bottom: 15px;
}
</style>