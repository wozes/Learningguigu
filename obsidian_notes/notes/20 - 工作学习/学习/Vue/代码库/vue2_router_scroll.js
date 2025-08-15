// 基本滚动行为配置
const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    // savedPosition 只有在通过浏览器前进/后退按钮触发时才可用
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 } // 滚动到页面顶部
    }
  }
})

// 高级滚动行为
const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（浏览器前进/后退）
    if (savedPosition) {
      return savedPosition
    }
    
    // 如果路由有hash，滚动到hash对应的元素
    if (to.hash) {
      return {
        selector: to.hash,
        // 偏移量
        offset: { x: 0, y: 10 }
      }
    }
    
    // 根据路由元信息决定滚动行为
    if (to.meta.scrollToTop) {
      return { x: 0, y: 0 }
    }
    
    // 如果是子路由，保持当前滚动位置
    if (to.matched.length > 1) {
      return {}
    }
    
    // 默认滚动到顶部
    return { x: 0, y: 0 }
  }
})

// 异步滚动（等待页面渲染完成后滚动）
const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition)
        } else if (to.hash) {
          resolve({
            selector: to.hash
          })
        } else {
          resolve({ x: 0, y: 0 })
        }
      }, 500) // 延迟500ms
    })
  }
})

// 平滑滚动配置
const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash,
        behavior: 'smooth' // 平滑滚动
      }
    }
    
    if (savedPosition) {
      return {
        ...savedPosition,
        behavior: 'smooth'
      }
    }
    
    return {
      x: 0,
      y: 0,
      behavior: 'smooth'
    }
  }
})

// 复杂滚动行为示例
const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 保存滚动位置的路由列表
    const keepScrollRoutes = ['/products', '/articles']
    
    // 如果从这些路由返回，保持滚动位置
    if (savedPosition && keepScrollRoutes.includes(from.path)) {
      return savedPosition
    }
    
    // 如果目标路由需要记住滚动位置
    if (to.meta.keepScroll) {
      return {}
    }
    
    // 如果有hash锚点
    if (to.hash) {
      // 等待DOM更新后再滚动
      return new Promise((resolve) => {
        setTimeout(() => {
          const element = document.querySelector(to.hash)
          if (element) {
            resolve({
              selector: to.hash,
              offset: { x: 0, y: 80 } // 考虑固定头部的高度
            })
          } else {
            resolve({ x: 0, y: 0 })
          }
        }, 300)
      })
    }
    
    // 页面切换时的淡入效果
    if (to.meta.fadeIn) {
      return new Promise((resolve) => {
        // 等待页面过渡动画完成
        setTimeout(() => {
          resolve({ x: 0, y: 0 })
        }, 600)
      })
    }
    
    // 默认回到顶部
    return { x: 0, y: 0 }
  }
})

// 在组件中手动控制滚动
export default {
  mounted() {
    // 滚动到指定位置
    this.$router.push({ 
      path: '/article/123',
      hash: '#section-2'
    })
  },
  
  methods: {
    scrollToElement(elementId) {
      // 手动滚动到元素
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        
        // 更新URL hash，但不触发路由跳转
        if (history.replaceState) {
          history.replaceState(null, null, `#${elementId}`)
        }
      }
    },
    
    saveScrollPosition() {
      // 保存当前滚动位置到sessionStorage
      sessionStorage.setItem('scrollPosition', JSON.stringify({
        x: window.pageXOffset,
        y: window.pageYOffset
      }))
    },
    
    restoreScrollPosition() {
      // 恢复滚动位置
      const saved = sessionStorage.getItem('scrollPosition')
      if (saved) {
        const position = JSON.parse(saved)
        window.scrollTo(position.x, position.y)
      }
    }
  }
}