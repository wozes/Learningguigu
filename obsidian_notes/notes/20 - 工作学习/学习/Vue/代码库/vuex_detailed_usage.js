// ===== 1. Vuex 安装和基础配置 =====

// 安装 Vuex
// Vue 2: npm install vuex@3
// Vue 3: npm install vuex@4

// store/index.js - 创建 Vuex store
import { createStore } from 'vuex'

const store = createStore({
  // 开发环境启用严格模式
  strict: process.env.NODE_ENV !== 'production',
  
  state: {
    // 应用的状态数据
  },
  getters: {
    // 计算属性
  },
  mutations: {
    // 同步修改状态的方法
  },
  actions: {
    // 异步操作和复杂逻辑
  },
  modules: {
    // 模块化
  }
})

// main.js - 注册 store
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

createApp(App).use(store).mount('#app')

// ===== 2. State 详细用法 =====

const store = createStore({
  state: {
    // 基础数据类型
    count: 0,
    message: 'Hello Vuex',
    isLoading: false,
    
    // 对象
    user: {
      id: null,
      name: '',
      email: '',
      avatar: ''
    },
    
    // 数组
    todos: [],
    products: [],
    
    // 嵌套对象
    settings: {
      theme: 'light',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: false
      }
    }
  },

  // ===== 3. Getters 详细用法 =====
  getters: {
    // 基础 getter - 获取 state
    currentUser: state => state.user,
    
    // 计算属性 - 基于 state 计算
    userFullName: state => {
      return `${state.user.firstName} ${state.user.lastName}`
    },
    
    // 使用其他 getters
    completedTodos: state => state.todos.filter(todo => todo.completed),
    activeTodos: state => state.todos.filter(todo => !todo.completed),
    
    // 依赖其他 getters
    todosStats: (state, getters) => {
      return {
        total: state.todos.length,
        completed: getters.completedTodos.length,
        active: getters.activeTodos.length,
        completionRate: state.todos.length > 0 
          ? (getters.completedTodos.length / state.todos.length * 100).toFixed(1) + '%'
          : '0%'
      }
    },
    
    // 返回函数的 getter (可以传参)
    getTodoById: state => id => {
      return state.todos.find(todo => todo.id === id)
    },
    
    getUsersByRole: state => role => {
      return state.users.filter(user => user.role === role)
    },
    
    // 复杂计算
    expensiveCalculation: state => {
      // 这里会被缓存，除非依赖的 state 改变
      return state.items.reduce((total, item) => {
        return total + item.price * item.quantity * item.tax
      }, 0)
    }
  },

  // ===== 4. Mutations 详细用法 =====
  mutations: {
    // 基础 mutation - 无参数
    INCREMENT(state) {
      state.count++
    },
    
    DECREMENT(state) {
      state.count--
    },
    
    // 带参数的 mutation
    SET_COUNT(state, count) {
      state.count = count
    },
    
    // 带载荷对象的 mutation
    SET_USER(state, payload) {
      state.user = { ...state.user, ...payload }
    },
    
    // 数组操作
    ADD_TODO(state, todo) {
      state.todos.push({
        id: Date.now(),
        text: todo.text || todo,
        completed: false,
        createdAt: new Date()
      })
    },
    
    REMOVE_TODO(state, todoId) {
      const index = state.todos.findIndex(todo => todo.id === todoId)
      if (index > -1) {
        state.todos.splice(index, 1)
      }
    },
    
    UPDATE_TODO(state, { id, updates }) {
      const todo = state.todos.find(todo => todo.id === id)
      if (todo) {
        Object.assign(todo, updates)
      }
    },
    
    // 切换状态
    TOGGLE_TODO(state, todoId) {
      const todo = state.todos.find(todo => todo.id === todoId)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    
    // 复杂对象更新
    UPDATE_USER_SETTINGS(state, { key, value }) {
      // 使用 Vue.set 确保响应性 (Vue 2)
      // Vue.set(state.settings, key, value)
      
      // Vue 3 中直接赋值即可
      state.settings[key] = value
    },
    
    // 嵌套对象更新
    UPDATE_NOTIFICATION_SETTING(state, { type, enabled }) {
      state.settings.notifications[type] = enabled
    },
    
    // 重置状态
    RESET_STATE(state) {
      // 重置为初始状态
      Object.assign(state, {
        count: 0,
        message: 'Hello Vuex',
        user: { id: null, name: '', email: '' },
        todos: []
      })
    },
    
    // 批量更新
    BATCH_UPDATE(state, updates) {
      Object.keys(updates).forEach(key => {
        if (state.hasOwnProperty(key)) {
          state[key] = updates[key]
        }
      })
    }
  },

  // ===== 5. Actions 详细用法 =====
  actions: {
    // 基础 action - 提交 mutation
    increment({ commit }) {
      commit('INCREMENT')
    },
    
    // 带参数的 action
    setCount({ commit }, count) {
      commit('SET_COUNT', count)
    },
    
    // 异步 action
    incrementAsync({ commit }, delay = 1000) {
      return new Promise(resolve => {
        setTimeout(() => {
          commit('INCREMENT')
          resolve()
        }, delay)
      })
    },
    
    // 使用 async/await
    async fetchUser({ commit, state }, userId) {
      try {
        commit('SET_LOADING', true)
        
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        
        const user = await response.json()
        commit('SET_USER', user)
        
        return user
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 多个 mutation 的 action
    async login({ commit, dispatch }, credentials) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message)
        }
        
        // 提交多个 mutations
        commit('SET_USER', data.user)
        commit('SET_TOKEN', data.token)
        commit('SET_AUTHENTICATED', true)
        
        // 调用其他 actions
        await dispatch('fetchUserProfile')
        
        return data
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_AUTHENTICATED', false)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 访问 getters
    async refreshData({ commit, getters, dispatch }) {
      if (!getters.isAuthenticated) {
        throw new Error('User not authenticated')
      }
      
      await Promise.all([
        dispatch('fetchTodos'),
        dispatch('fetchUserProfile'),
        dispatch('fetchSettings')
      ])
    },
    
    // 访问根状态和 getters (在模块中)
    async someModuleAction({ commit, rootState, rootGetters, dispatch }) {
      if (rootGetters.isAuthenticated) {
        await dispatch('fetchData', null, { root: true })
      }
    },
    
    // 条件性操作
    async addTodo({ commit, state }, todoText) {
      // 检查重复
      const exists = state.todos.some(todo => 
        todo.text.toLowerCase() === todoText.toLowerCase()
      )
      
      if (exists) {
        throw new Error('Todo already exists')
      }
      
      const todo = {
        id: Date.now(),
        text: todoText,
        completed: false,
        createdAt: new Date()
      }
      
      commit('ADD_TODO', todo)
      
      // 可选：同步到服务器
      try {
        await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todo)
        })
      } catch (error) {
        // 如果同步失败，回滚本地操作
        commit('REMOVE_TODO', todo.id)
        throw error
      }
    }
  },

  // ===== 6. Modules 详细用法 =====
  modules: {
    // 基础模块
    user: {
      // 命名空间
      namespaced: true,
      
      state: {
        profile: null,
        preferences: {},
        history: []
      },
      
      getters: {
        fullName: state => {
          return state.profile 
            ? `${state.profile.firstName} ${state.profile.lastName}`
            : ''
        },
        
        // 访问根状态
        isAdmin: (state, getters, rootState, rootGetters) => {
          return rootGetters.currentUser?.role === 'admin'
        }
      },
      
      mutations: {
        SET_PROFILE(state, profile) {
          state.profile = profile
        },
        
        UPDATE_PREFERENCES(state, preferences) {
          state.preferences = { ...state.preferences, ...preferences }
        }
      },
      
      actions: {
        async fetchProfile({ commit, rootState }) {
          const userId = rootState.auth.userId
          const response = await fetch(`/api/users/${userId}/profile`)
          const profile = await response.json()
          commit('SET_PROFILE', profile)
        },
        
        // 调用根 action
        async updateProfile({ commit, dispatch }, updates) {
          commit('SET_PROFILE', updates)
          await dispatch('saveToServer', updates, { root: true })
        }
      }
    },

    // 嵌套模块
    shopping: {
      namespaced: true,
      
      modules: {
        cart: {
          namespaced: true,
          
          state: {
            items: [],
            total: 0
          },
          
          mutations: {
            ADD_ITEM(state, item) {
              const existingItem = state.items.find(i => i.id === item.id)
              if (existingItem) {
                existingItem.quantity += item.quantity || 1
              } else {
                state.items.push({ ...item, quantity: item.quantity || 1 })
              }
            }
          },
          
          actions: {
            addItem({ commit, dispatch }, item) {
              commit('ADD_ITEM', item)
              dispatch('calculateTotal')
            },
            
            calculateTotal({ commit, state }) {
              const total = state.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity)
              }, 0)
              commit('SET_TOTAL', total)
            }
          }
        }
      }
    }
  }
})

export default store