// ===== Vuex 最佳实践和高级用法 =====

// 1. 项目结构建议
/*
src/
├── store/
│   ├── index.js          // 主 store 文件
│   ├── modules/          // 模块目录
│   │   ├── auth.js       // 认证模块
│   │   ├── user.js       // 用户模块
│   │   ├── products.js   // 产品模块
│   │   └── cart.js       // 购物车模块
│   ├── plugins/          // 插件目录
│   │   ├── persistance.js // 持久化插件
│   │   └── logger.js     // 日志插件
│   └── types.js          // 常量定义
*/

// ===== 2. 常量定义 (store/types.js) =====
export const MUTATION_TYPES = {
  // Auth
  SET_TOKEN: 'SET_TOKEN',
  SET_USER: 'SET_USER',
  CLEAR_AUTH: 'CLEAR_AUTH',
  
  // UI
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Products
  SET_PRODUCTS: 'SET_PRODUCTS',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT'
}

export const ACTION_TYPES = {
  // Auth
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  
  // Products
  FETCH_PRODUCTS: 'FETCH_PRODUCTS',
  CREATE_PRODUCT: 'CREATE_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT'
}

// ===== 3. 高级 Store 配置 (store/index.js) =====
import { createStore, createLogger } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

// 模块导入
import auth from './modules/auth'
import user from './modules/user'
import products from './modules/products'
import cart from './modules/cart'

// 插件
const debug = process.env.NODE_ENV !== 'production'

const plugins = []

// 开发环境日志插件
if (debug) {
  plugins.push(createLogger({
    collapsed: false,
    filter: (mutation, stateBefore, stateAfter) => {
      // 过滤掉不重要的 mutations
      return !mutation.type.includes('@@')
    },
    transformer: (state) => {
      // 转换状态显示
      return state
    },
    mutationTransformer: (mut) => {
      return mut
    }
  }))
}

// 持久化插件
plugins.push(createPersistedState({
  paths: ['auth.token', 'user.preferences', 'cart.items'], // 只持久化特定路径
  storage: window.localStorage,
  reducer: (state) => ({
    // 自定义要持久化的状态
    auth: {
      token: state.auth.token,
      refreshToken: state.auth.refreshToken
    },
    user: {
      preferences: state.user.preferences
    },
    cart: {
      items: state.cart.items
    }
  })
}))

const store = createStore({
  strict: debug,
  
  // 根状态
  state: {
    version: '1.0.0',
    appReady: false
  },
  
  // 根 getters
  getters: {
    appVersion: state => state.version,
    isAppReady: state => state.appReady
  },
  
  // 根 mutations
  mutations: {
    SET_APP_READY(state, ready) {
      state.appReady = ready
    }
  },
  
  // 根 actions
  actions: {
    async initializeApp({ commit, dispatch }) {
      try {
        // 初始化应用
        await dispatch('auth/checkAuthStatus')
        await dispatch('user/loadUserData')
        
        commit('SET_APP_READY', true)
      } catch (error) {
        console.error('App initialization failed:', error)
        throw error
      }
    }
  },
  
  // 模块
  modules: {
    auth,
    user,
    products,
    cart
  },
  
  plugins
})

export default store

// ===== 4. 认证模块示例 (store/modules/auth.js) =====
import { MUTATION_TYPES, ACTION_TYPES } from '../types'
import authAPI from '@/api/auth'

const state = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  loginLoading: false,
  loginError: null
}

const getters = {
  isAuthenticated: state => !!state.token && !!state.user,
  currentUser: state => state.user,
  authToken: state => state.token,
  hasRole: state => role => {
    return state.user?.roles?.includes(role)
  },
  hasPermission: state => permission => {
    return state.user?.permissions?.includes(permission)
  }
}

const mutations = {
  [MUTATION_TYPES.SET_TOKEN](state, { token, refreshToken }) {
    state.token = token
    state.refreshToken = refreshToken
  },
  
  [MUTATION_TYPES.SET_USER](state, user) {
    state.user = user
    state.isAuthenticated = !!user
  },
  
  [MUTATION_TYPES.CLEAR_AUTH](state) {
    state.token = null
    state.refreshToken = null
    state.user = null
    state.isAuthenticated = false
  },
  
  SET_LOGIN_LOADING(state, loading) {
    state.loginLoading = loading
  },
  
  SET_LOGIN_ERROR(state, error) {
    state.loginError = error
  }
}

const actions = {
  async [ACTION_TYPES.LOGIN]({ commit, dispatch }, credentials) {
    try {
      commit('SET_LOGIN_LOADING', true)
      commit('SET_LOGIN_ERROR', null)
      
      const response = await authAPI.login(credentials)
      const { token, refreshToken, user } = response.data
      
      commit(MUTATION_TYPES.SET_TOKEN, { token, refreshToken })
      commit(MUTATION_TYPES.SET_USER, user)
      
      // 设置 axios 默认 header
      authAPI.setAuthToken(token)
      
      // 启动 token 刷新定时器
      dispatch('startTokenRefresh')
      
      return response.data
    } catch (error) {
      commit('SET_LOGIN_ERROR', error.response?.data?.message || '登录失败')
      throw error
    } finally {
      commit('SET_LOGIN_LOADING', false)
    }
  },
  
  async [ACTION_TYPES.LOGOUT]({ commit, dispatch }) {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      commit(MUTATION_TYPES.CLEAR_AUTH)
      authAPI.removeAuthToken()
      dispatch('stopTokenRefresh')
      
      // 清除其他模块的用户相关数据
      dispatch('user/clearUserData', null, { root: true })
      dispatch('cart/clearCart', null, { root: true })
    }
  },
  
  async [ACTION_TYPES.REFRESH_TOKEN]({ state, commit, dispatch }) {
    if (!state.refreshToken) {
      throw new Error('No refresh token available')
    }
    
    try {
      const response = await authAPI.refreshToken(state.refreshToken)
      const { token, refreshToken } = response.data
      
      commit(MUTATION_TYPES.SET_TOKEN, { token, refreshToken })
      authAPI.setAuthToken(token)
      
      return response.data
    } catch (error) {
      // Refresh token 无效，需要重新登录
      dispatch(ACTION_TYPES.LOGOUT)
      throw error
    }
  },
  
  async checkAuthStatus({ state, dispatch }) {
    if (state.token) {
      try {
        authAPI.setAuthToken(state.token)
        const userResponse = await authAPI.getCurrentUser()
        dispatch(MUTATION_TYPES.SET_USER, userResponse.data)
        dispatch('startTokenRefresh')
      } catch (error) {
        // Token 无效
        dispatch(ACTION_TYPES.LOGOUT)
      }
    }
  },
  
  // Token 自动刷新
  startTokenRefresh({ dispatch }) {
    // 每 50 分钟刷新一次 token (假设 token 有效期 1 小时)
    const refreshInterval = setInterval(() => {
      dispatch(ACTION_TYPES.REFRESH_TOKEN).catch(() => {
        clearInterval(refreshInterval)
      })
    }, 50 * 60 * 1000)
    
    // 存储 interval ID 以便清除
    this._tokenRefreshInterval = refreshInterval
  },
  
  stopTokenRefresh() {
    if (this._tokenRefreshInterval) {
      clearInterval(this._tokenRefreshInterval)
      this._tokenRefreshInterval = null
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

// ===== 5. 产品模块示例 (store/modules/products.js) =====
import productsAPI from '@/api/products'

const state = {
  items: [],
  currentProduct: null,
  filters: {
    category: '',
    priceRange: [0, 1000],
    sortBy: 'name',
    sortOrder: 'asc'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  },
  loading: false,
  error: null
}

const getters = {
  filteredProducts: (state) => {
    let filtered = [...state.items]
    
    // 分类过滤
    if (state.filters.category) {
      filtered = filtered.filter(product => 
        product.category === state.filters.category
      )
    }
    
    // 价格过滤
    filtered = filtered.filter(product => 
      product.price >= state.filters.priceRange[0] && 
      product.price <= state.filters.priceRange[1]
    )
    
    // 排序
    filtered.sort((a, b) => {
      const modifier = state.filters.sortOrder === 'asc' ? 1 : -1
      const field = state.filters.sortBy
      
      if (a[field] < b[field]) return -1 * modifier
      if (a[field] > b[field]) return 1 * modifier
      return 0
    })
    
    return filtered
  },
  
  productById: (state) => (id) => {
    return state.items.find(product => product.id === id)
  },
  
  productsByCategory: (state) => (category) => {
    return state.items.filter(product => product.category === category)
  },
  
  totalPages: (state) => {
    return Math.ceil(state.pagination.total / state.pagination.limit)
  }
}

const mutations = {
  SET_PRODUCTS(state, products) {
    state.items = products
  },
  
  ADD_PRODUCT(state, product) {
    state.items.push(product)
  },
  
  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.items.findIndex(p => p.id === updatedProduct.id)
    if (index !== -1) {
      // 使用 Vue 3 的响应式特性
      state.items[index] = { ...state.items[index], ...updatedProduct }
    }
  },
  
  DELETE_PRODUCT(state, productId) {
    state.items = state.items.filter(p => p.id !== productId)
  },
  
  SET_CURRENT_PRODUCT(state, product) {
    state.currentProduct = product
  },
  
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async [ACTION_TYPES.FETCH_PRODUCTS]({ commit, state }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const params = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...state.filters
      }
      
      const response = await productsAPI.getProducts(params)
      const { products, total } = response.data
      
      commit('SET_PRODUCTS', products)
      commit('SET_PAGINATION', { total })
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async [ACTION_TYPES.CREATE_PRODUCT]({ commit }, productData) {
    try {
      const response = await productsAPI.createProduct(productData)
      const newProduct = response.data
      
      commit('ADD_PRODUCT', newProduct)
      
      return newProduct
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  async [ACTION_TYPES.UPDATE_PRODUCT]({ commit }, { id, updates }) {
    try {
      const response = await productsAPI.updateProduct(id, updates)
      const updatedProduct = response.data
      
      commit('UPDATE_PRODUCT', updatedProduct)
      
      return updatedProduct
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  async [ACTION_TYPES.DELETE_PRODUCT]({ commit }, productId) {
    try {
      await productsAPI.deleteProduct(productId)
      commit('DELETE_PRODUCT', productId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  // 高级搜索
  async searchProducts({ commit }, { query, filters }) {
    try {
      commit('SET_LOADING', true)
      
      const response = await productsAPI.searchProducts(query, filters)
      commit('SET_PRODUCTS', response.data.products)
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 批量操作
  async batchUpdateProducts({ commit }, updates) {
    try {
      const response = await productsAPI.batchUpdate(updates)
      
      // 更新每个产品
      response.data.forEach(product => {
        commit('UPDATE_PRODUCT', product)
      })
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

// ===== 6. 自定义插件示例 =====

// 错误处理插件
const errorHandlerPlugin = (store) => {
  store.subscribe((mutation, state) => {
    // 监听所有 mutations
    if (mutation.type.includes('SET_ERROR') && mutation.payload) {
      // 统一错误处理
      console.error('Store Error:', mutation.payload)
      
      // 可以在这里添加错误上报
      // errorReporter.report(mutation.payload)
      
      // 显示错误通知
      // notificationService.error(mutation.payload)
    }
  })
  
  store.subscribeAction({
    error: (action, state, error) => {
      // 监听所有 action 错误
      console.error(`Action ${action.type} failed:`, error)
    }
  })
}

// 性能监控插件
const performancePlugin = (store) => {
  store.subscribeAction({
    before: (action, state) => {
      console.time(`Action: ${action.type}`)
    },
    after: (action, state) => {
      console.timeEnd(`Action: ${action.type}`)
    }
  })
}

// ===== 7. 工具函数 =====

// 创建模块工厂函数
export const createModule = (name, options = {}) => {
  const {
    hasLoading = true,
    hasError = true,
    hasPagination = false
  } = options

  const baseState = {}
  const baseMutations = {}
  const baseActions = {}

  if (hasLoading) {
    baseState.loading = false
    baseMutations.SET_LOADING = (state, loading) => {
      state.loading = loading
    }
  }

  if (hasError) {
    baseState.error = null
    baseMutations.SET_ERROR = (state, error) => {
      state.error = error
    }
    baseMutations.CLEAR_ERROR = (state) => {
      state.error = null
    }
  }

  if (hasPagination) {
    baseState.pagination = {
      page: 1,
      limit: 20,
      total: 0
    }
    baseMutations.SET_PAGINATION = (state, pagination) => {
      state.pagination = { ...state.pagination, ...pagination }
    }
  }

  return {
    namespaced: true,
    state: baseState,
    mutations: baseMutations,
    actions: baseActions
  }
}

// 异步 action 包装器
export const createAsyncAction = (apiCall) => {
  return async ({ commit }, payload) => {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const result = await apiCall(payload)
      return result
    } catch (error) {
      commit('SET_ERROR', error.message || '操作失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

// 创建 CRUD actions
export const createCrudActions = (apiService, entityName) => {
  const upperEntityName = entityName.toUpperCase()
  
  return {
    [`fetch${entityName}s`]: createAsyncAction(async ({ commit }) => {
      const response = await apiService.getAll()
      commit(`SET_${upperEntityName}S`, response.data)
      return response.data
    }),
    
    [`create${entityName}`]: createAsyncAction(async ({ commit }, data) => {
      const response = await apiService.create(data)
      commit(`ADD_${upperEntityName}`, response.data)
      return response.data
    }),
    
    [`update${entityName}`]: createAsyncAction(async ({ commit }, { id, data }) => {
      const response = await apiService.update(id, data)
      commit(`UPDATE_${upperEntityName}`, response.data)
      return response.data
    }),
    
    [`delete${entityName}`]: createAsyncAction(async ({ commit }, id) => {
      await apiService.delete(id)
      commit(`DELETE_${upperEntityName}`, id)
    })
  }
}

// ===== 8. 类型安全 (TypeScript) =====

// 如果使用 TypeScript，可以这样定义类型
/*
// types/store.ts
export interface RootState {
  version: string
  appReady: boolean
}

export interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

export interface User {
  id: number
  name: string
  email: string
  roles: string[]
}

// store/index.ts
import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

export interface State {
  // 定义根状态类型
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  // store 配置
})

// 在组件中使用
import { useStore } from 'vuex'
import { key } from '@/store'

export default {
  setup() {
    const store = useStore(key)
    // 现在 store 有完整的类型支持
  }
}
*/

// ===== 9. 测试示例 =====

// 测试 mutations
const testMutations = () => {
  // mutations.spec.js
  /*
  import { mutations } from '@/store/modules/products'
  
  describe('products mutations', () => {
    test('SET_PRODUCTS', () => {
      const state = { items: [] }
      const products = [{ id: 1, name: 'Product 1' }]
      
      mutations.SET_PRODUCTS(state, products)
      
      expect(state.items).toEqual(products)
    })
    
    test('ADD_PRODUCT', () => {
      const state = { items: [] }
      const product = { id: 1, name: 'Product 1' }
      
      mutations.ADD_PRODUCT(state, product)
      
      expect(state.items).toContain(product)
    })
  })
  */
}

// 测试 actions
const testActions = () => {
  // actions.spec.js
  /*
  import { actions } from '@/store/modules/products'
  import productsAPI from '@/api/products'
  
  jest.mock('@/api/products')
  
  describe('products actions', () => {
    test('FETCH_PRODUCTS success', async () => {
      const commit = jest.fn()
      const products = [{ id: 1, name: 'Product 1' }]
      
      productsAPI.getProducts.mockResolvedValue({ data: { products } })
      
      await actions.FETCH_PRODUCTS({ commit })
      
      expect(commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(commit).toHaveBeenCalledWith('SET_PRODUCTS', products)
      expect(commit).toHaveBeenCalledWith('SET_LOADING', false)
    })
  })
  */
}

// ===== 10. 性能优化技巧 =====

// 1. 使用 getter 缓存计算结果
const optimizedGetters = {
  // 避免在 getter 中进行昂贵的计算
  expensiveCalculation: (state) => {
    // 这个计算只有在依赖的 state 改变时才会重新执行
    return state.items.reduce((acc, item) => {
      return acc + item.price * item.quantity
    }, 0)
  },
  
  // 使用参数化 getter 时要注意缓存
  getItemById: (state) => (id) => {
    // 这种方式不会被缓存，每次调用都会执行
    return state.items.find(item => item.id === id)
  }
}

// 2. 避免深层对象变更
const optimizedMutations = {
  // 不好的做法 - 直接修改嵌套对象
  BAD_UPDATE_USER(state, updates) {
    // 这样可能不会触发响应式更新
    state.user.profile.name = updates.name
  },
  
  // 好的做法 - 创建新对象
  GOOD_UPDATE_USER(state, updates) {
    state.user = {
      ...state.user,
      profile: {
        ...state.user.profile,
        ...updates
      }
    }
  }
}

// 3. 批量更新
const batchUpdateExample = {
  // 避免多次 commit
  BAD_BATCH_UPDATE({ commit }, items) {
    items.forEach(item => {
      commit('UPDATE_ITEM', item) // 每次都会触发响应式更新
    })
  },
  
  // 批量更新
  GOOD_BATCH_UPDATE({ commit }, items) {
    commit('BATCH_UPDATE_ITEMS', items) // 只触发一次更新
  }
}

// ===== 11. 调试技巧 =====

// Vue DevTools 集成
const debugStore = createStore({
  // 启用严格模式帮助发现问题
  strict: process.env.NODE_ENV !== 'production',
  
  plugins: [
    // 自定义调试插件
    (store) => {
      store.subscribe((mutation, state) => {
        console.log('Mutation:', mutation.type)
        console.log('Payload:', mutation.payload)
        console.log('State after:', state)
      })
      
      store.subscribeAction((action, state) => {
        console.log('Action:', action.type)
        console.log('Payload:', action.payload)
      })
    }
  ]
})

// 时间旅行调试
const timeTravel = {
  // 保存状态快照
  saveSnapshot(store) {
    const snapshot = JSON.parse(JSON.stringify(store.state))
    localStorage.setItem('vuex-snapshot', JSON.stringify(snapshot))
  },
  
  // 恢复状态快照
  restoreSnapshot(store) {
    const snapshot = localStorage.getItem('vuex-snapshot')
    if (snapshot) {
      store.replaceState(JSON.parse(snapshot))
    }
  }
}

// ===== 12. 迁移指南 (Vue 2 to Vue 3) =====

/*
Vue 2 到 Vue 3 的主要变化：

1. 安装方式变化：
   Vue 2: new Vuex.Store({})
   Vue 3: createStore({})

2. 在组件中使用：
   Vue 2: this.$store
   Vue 3: 在 Composition API 中使用 useStore()

3. 辅助函数使用：
   Vue 2: ...mapState(['count'])
   Vue 3: 同样可用，但在 Composition API 中推荐直接使用 computed

4. 插件变化：
   一些第三方插件可能需要更新以支持 Vue 3
*/

// Vue 3 Composition API 推荐模式
const compositionApiPattern = () => {
  /*
  // 推荐：创建自定义 composables
  // composables/useAuth.js
  import { computed } from 'vue'
  import { useStore } from 'vuex'
  
  export function useAuth() {
    const store = useStore()
    
    const user = computed(() => store.state.auth.user)
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    
    const login = (credentials) => store.dispatch('auth/login', credentials)
    const logout = () => store.dispatch('auth/logout')
    
    return {
      user,
      isAuthenticated,
      login,
      logout
    }
  }
  
  // 在组件中使用
  export default {
    setup() {
      const { user, isAuthenticated, login, logout } = useAuth()
      
      return {
        user,
        isAuthenticated,
        login,
        logout
      }
    }
  }
  */
}

// ===== 总结 =====
/*
Vuex 使用要点总结：

1. 状态管理：
   - State: 存储应用状态
   - Getters: 计算属性，基于 state 计算派生状态
   - Mutations: 同步修改 state 的唯一方式
   - Actions: 处理异步操作，通过 commit 调用 mutations

2. 模块化：
   - 使用 namespaced: true 避免命名冲突
   - 合理拆分模块，每个模块负责特定功能
   - 使用 modules 组织大型应用的状态

3. 最佳实践：
   - 使用常量定义 mutation 和 action 类型
   - Mutations 保持简单，只做状态修改
   - 复杂逻辑放在 Actions 中
   - 使用辅助函数简化组件代码
   - 开发环境启用严格模式

4. 性能优化：
   - 避免在 getters 中进行昂贵计算
   - 合理使用模块化避免单一 store 过大
   - 使用插件进行持久化和日志记录

5. 调试和测试：
   - 利用 Vue DevTools 进行调试
   - 编写单元测试覆盖 mutations 和 actions
   - 使用时间旅行调试复杂状态变化
*/