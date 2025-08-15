// 1. 安装 Vuex
// npm install vuex@next --save (Vue 3)
// npm install vuex --save (Vue 2)

// 2. 创建 store/index.js
import { createStore } from 'vuex' // Vue 3
// import Vuex from 'vuex' // Vue 2

const store = createStore({
  // State: 存储应用状态
  state: {
    count: 0,
    todos: [],
    user: {
      name: '',
      isLoggedIn: false
    }
  },

  // Getters: 计算属性
  getters: {
    // 获取完成的 todos
    completedTodos: state => {
      return state.todos.filter(todo => todo.completed)
    },
    
    // 获取未完成的 todos 数量
    incompleteTodosCount: (state, getters) => {
      return state.todos.length - getters.completedTodos.length
    },

    // 根据参数过滤 todos
    getTodoById: state => id => {
      return state.todos.find(todo => todo.id === id)
    }
  },

  // Mutations: 同步修改状态
  mutations: {
    // 增加计数
    INCREMENT(state) {
      state.count++
    },

    // 减少计数
    DECREMENT(state) {
      state.count--
    },

    // 设置计数值
    SET_COUNT(state, count) {
      state.count = count
    },

    // 添加 todo
    ADD_TODO(state, todo) {
      state.todos.push({
        id: Date.now(),
        text: todo.text,
        completed: false
      })
    },

    // 切换 todo 完成状态
    TOGGLE_TODO(state, id) {
      const todo = state.todos.find(todo => todo.id === id)
      if (todo) {
        todo.completed = !todo.completed
      }
    },

    // 删除 todo
    REMOVE_TODO(state, id) {
      state.todos = state.todos.filter(todo => todo.id !== id)
    },

    // 设置用户信息
    SET_USER(state, user) {
      state.user = user
    }
  },

  // Actions: 异步操作
  actions: {
    // 异步增加计数
    incrementAsync({ commit }, delay = 1000) {
      return new Promise(resolve => {
        setTimeout(() => {
          commit('INCREMENT')
          resolve()
        }, delay)
      })
    },

    // 从 API 获取 todos
    async fetchTodos({ commit }) {
      try {
        // 模拟 API 调用
        const response = await fetch('/api/todos')
        const todos = await response.json()
        
        // 通过 mutations 更新状态
        todos.forEach(todo => {
          commit('ADD_TODO', todo)
        })
      } catch (error) {
        console.error('Failed to fetch todos:', error)
      }
    },

    // 用户登录
    async login({ commit }, credentials) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        })
        const user = await response.json()
        
        commit('SET_USER', {
          name: user.name,
          isLoggedIn: true
        })
        
        return user
      } catch (error) {
        throw new Error('Login failed')
      }
    },

    // 用户登出
    logout({ commit }) {
      commit('SET_USER', {
        name: '',
        isLoggedIn: false
      })
    }
  },

  // Modules: 模块化
  modules: {
    // 购物车模块
    cart: {
      namespaced: true, // 启用命名空间
      
      state: {
        items: [],
        total: 0
      },

      getters: {
        itemCount: state => state.items.length,
        totalPrice: state => {
          return state.items.reduce((total, item) => {
            return total + item.price * item.quantity
          }, 0)
        }
      },

      mutations: {
        ADD_ITEM(state, item) {
          const existingItem = state.items.find(i => i.id === item.id)
          if (existingItem) {
            existingItem.quantity++
          } else {
            state.items.push({ ...item, quantity: 1 })
          }
        },

        REMOVE_ITEM(state, itemId) {
          state.items = state.items.filter(item => item.id !== itemId)
        },

        CLEAR_CART(state) {
          state.items = []
        }
      },

      actions: {
        addToCart({ commit }, item) {
          commit('ADD_ITEM', item)
        },

        removeFromCart({ commit }, itemId) {
          commit('REMOVE_ITEM', itemId)
        },

        clearCart({ commit }) {
          commit('CLEAR_CART')
        }
      }
    }
  }
})

// 3. 在 main.js 中注册 store
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

const app = createApp(App)
app.use(store)
app.mount('#app')

export default store