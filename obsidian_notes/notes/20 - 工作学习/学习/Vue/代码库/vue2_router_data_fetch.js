// 1. 导航完成后获取数据
export default {
  name: 'Post',
  data() {
    return {
      loading: false,
      post: null,
      error: null
    }
  },
  
  created() {
    // 组件创建完后获取数据
    this.fetchData()
  },
  
  watch: {
    // 如果路由有变化，会再次执行该方法
    '$route'() {
      this.fetchData()
    }
  },
  
  methods: {
    fetchData() {
      this.error = null
      this.post = null
      this.loading = true
      
      const postId = this.$route.params.id
      
      // 模拟API调用
      getPost(postId)
        .then(post => {
          this.post = post
          this.loading = false
        })
        .catch(error => {
          this.error = error.toString()
          this.loading = false
        })
    }
  }
}

// 2. 导航完成前获取数据
export default {
  name: 'Post',
  data() {
    return {
      post: null
    }
  },
  
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被confirm前调用
    getPost(to.params.id).then(post => {
      next(vm => vm.setData(post))
    }).catch(error => {
      next(false) // 取消导航
    })
  },
  
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    this.post = null
    getPost(to.params.id).then(post => {
      this.setData(post)
      next()
    }).catch(error => {
      next(false)
    })
  },
  
  methods: {
    setData(post) {
      this.post = post
    }
  }
}

// 3. 全局数据获取策略
// router/index.js
router.beforeEach(async (to, from, next) => {
  // 检查路由是否需要预加载数据
  if (to.meta.preload) {
    try {
      // 显示全局加载状态
      store.commit('SET_LOADING', true)
      
      // 预加载数据
      const promises = to.meta.preload.map(loader => loader(to))
      await Promise.all(promises)
      
      next()
    } catch (error) {
      console.error('数据预加载失败:', error)
      next('/error')
    } finally {
      store.commit('SET_LOADING', false)
    }
  } else {
    next()
  }
})

// 路由配置中定义数据预加载
const routes = [
  {
    path: '/user/:id',
    component: User,
    meta: {
      preload: [
        // 预加载用户数据
        (route) => store.dispatch('fetchUser', route.params.id),
        // 预加载用户文章
        (route) => store.dispatch('fetchUserPosts', route.params.id)
      ]
    }
  }
]

// 4. 使用Vuex进行数据管理
// store/modules/posts.js
const posts = {
  namespaced: true,
  
  state: {
    currentPost: null,
    posts: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_POST(state, post) {
      state.currentPost = post
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async fetchPost({ commit }, postId) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const post = await getPost(postId)
        commit('SET_POST', post)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}

// 组件中使用Vuex
export default {
  name: 'Post',
  
  computed: {
    ...mapState('posts', ['currentPost', 'loading', 'error'])
  },
  
  created() {
    this.loadPost()
  },
  
  watch: {
    '$route'() {
      this.loadPost()
    }
  },
  
  methods: {
    ...mapActions('posts', ['fetchPost']),
    
    loadPost() {
      const postId = this.$route.params.id
      this.fetchPost(postId)
    }
  }
}

// 5. 缓存策略
// utils/cache.js
class DataCache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
    this.ttl = 5 * 60 * 1000 // 5分钟过期
  }
  
  get(key) {
    const timestamp = this.timestamps.get(key)
    if (timestamp && Date.now() - timestamp > this.ttl) {
      this.cache.delete(key)
      this.timestamps.delete(key)
      return null
    }
    return this.cache.get(key)
  }
  
  set(key, value) {
    this.cache.set(key, value)
    this.timestamps.set(key, Date.now())
  }
  
  clear() {
    this.cache.clear()
    this.timestamps.clear()
  }
}

const dataCache = new DataCache()

// 带缓存的数据获取
async function getPostWithCache(postId) {
  const cacheKey = `post-${postId}`
  let post = dataCache.get(cacheKey)
  
  if (!post) {
    post = await getPost(postId)
    dataCache.set(cacheKey, post)
  }
  
  return post
}

// 6. 错误处理和重试机制
export default {
  name: 'Post',
  
  data() {
    return {
      post: null,
      loading: false,
      error: null,
      retryCount: 0,
      maxRetries: 3
    }
  },
  
  methods: {
    async fetchData() {
      this.loading = true
      this.error = null
      
      try {
        const postId = this.$route.params.id
        this.post = await getPost(postId)
        this.retryCount = 0
      } catch (error) {
        this.error = error.message
        
        // 自动重试
        if (this.retryCount < this.maxRetries) {
          this.retryCount++
          setTimeout(() => {
            this.fetchData()
          }, 1000 * this.retryCount) // 递增延迟
        }
      } finally {
        this.loading = false
      }
    },
    
    retry() {
      this.retryCount = 0
      this.fetchData()
    }
  }
}

// 7. 数据获取的混入(Mixin)
// mixins/dataFetcher.js
export const dataFetcher = {
  data() {
    return {
      loading: false,
      error: null
    }
  },
  
  created() {
    if (this.fetchData) {
      this.fetchData()
    }
  },
  
  watch: {
    '$route'() {
      if (this.fetchData) {
        this.fetchData()
      }
    }
  },
  
  methods: {
    async $fetch(promise) {
      this.loading = true
      this.error = null
      
      try {
        const result = await promise
        return result
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}

// 在组件中使用混入
export default {
  name: 'Post',
  mixins: [dataFetcher],
  
  data() {
    return {
      post: null
    }
  },
  
  methods: {
    async fetchData() {
      const postId = this.$route.params.id
      this.post = await this.$fetch(getPost(postId))
    }
  }
}