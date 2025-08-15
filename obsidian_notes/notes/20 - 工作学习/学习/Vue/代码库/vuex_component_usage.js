<template>
  <div class="app">
    <h1>Vuex 使用示例</h1>
    
    <!-- 计数器部分 -->
    <div class="counter-section">
      <h2>计数器: {{ count }}</h2>
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
      <button @click="reset">重置</button>
      <button @click="incrementAsync">异步+1</button>
    </div>

    <!-- Todo 列表部分 -->
    <div class="todo-section">
      <h2>Todo 列表</h2>
      <div>
        <input v-model="newTodo" @keyup.enter="addTodo" placeholder="添加新任务">
        <button @click="addTodo">添加</button>
      </div>
      
      <p>未完成任务数: {{ incompleteTodosCount }}</p>
      
      <ul>
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
    </div>

    <!-- 用户信息部分 -->
    <div class="user-section">
      <h2>用户信息</h2>
      <div v-if="user.isLoggedIn">
        <p>欢迎, {{ user.name }}!</p>
        <button @click="logout">登出</button>
      </div>
      <div v-else>
        <input v-model="loginForm.username" placeholder="用户名">
        <input v-model="loginForm.password" type="password" placeholder="密码">
        <button @click="login">登录</button>
      </div>
    </div>

    <!-- 购物车部分 (使用模块) -->
    <div class="cart-section">
      <h2>购物车 ({{ cartItemCount }} 件商品)</h2>
      <p>总价: ${{ cartTotalPrice }}</p>
      
      <div>
        <button @click="addProduct">添加商品</button>
        <button @click="clearCart">清空购物车</button>
      </div>
      
      <ul>
        <li v-for="item in cartItems" :key="item.id">
          {{ item.name }} - ${{ item.price }} x {{ item.quantity }}
          <button @click="removeFromCart(item.id)">移除</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'App',
  
  data() {
    return {
      newTodo: '',
      loginForm: {
        username: '',
        password: ''
      }
    }
  },

  computed: {
    // 方法1: 直接访问 store
    // count() {
    //   return this.$store.state.count
    // }

    // 方法2: 使用 mapState 辅助函数
    ...mapState(['count', 'todos', 'user']),
    
    // 方法3: 重命名映射
    // ...mapState({
    //   counter: 'count',
    //   todoList: 'todos'
    // })

    // 映射 getters
    ...mapGetters(['incompleteTodosCount']),
    
    // 映射模块中的 state 和 getters
    ...mapState('cart', {
      cartItems: 'items'
    }),
    ...mapGetters('cart', {
      cartItemCount: 'itemCount',
      cartTotalPrice: 'totalPrice'
    })
  },

  methods: {
    // 方法1: 直接调用 store 方法
    // increment() {
    //   this.$store.commit('INCREMENT')
    // }

    // 方法2: 使用 mapMutations 辅助函数
    ...mapMutations(['INCREMENT', 'DECREMENT', 'SET_COUNT', 'ADD_TODO', 'TOGGLE_TODO', 'REMOVE_TODO']),
    
    // 映射 actions
    ...mapActions(['incrementAsync', 'login', 'logout']),
    
    // 映射模块中的 actions
    ...mapActions('cart', ['addToCart', 'removeFromCart', 'clearCart']),

    // 自定义方法
    increment() {
      this.INCREMENT()
    },

    decrement() {
      this.DECREMENT()
    },

    reset() {
      this.SET_COUNT(0)
    },

    addTodo() {
      if (this.newTodo.trim()) {
        this.ADD_TODO({ text: this.newTodo })
        this.newTodo = ''
      }
    },

    toggleTodo(id) {
      this.TOGGLE_TODO(id)
    },

    removeTodo(id) {
      this.REMOVE_TODO(id)
    },

    async handleLogin() {
      try {
        await this.login({
          username: this.loginForm.username,
          password: this.loginForm.password
        })
        this.loginForm = { username: '', password: '' }
      } catch (error) {
        alert('登录失败')
      }
    },

    addProduct() {
      const product = {
        id: Date.now(),
        name: `商品 ${Date.now()}`,
        price: Math.floor(Math.random() * 100) + 1
      }
      this.addToCart(product)
    }
  },

  // 使用 Composition API 的方式 (Vue 3)
  // setup() {
  //   const store = useStore()
    
  //   const count = computed(() => store.state.count)
  //   const todos = computed(() => store.state.todos)
    
  //   const increment = () => store.commit('INCREMENT')
  //   const addTodo = (todo) => store.commit('ADD_TODO', todo)
    
  //   return {
  //     count,
  //     todos,
  //     increment,
  //     addTodo
  //   }
  // }
}
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.counter-section,
.todo-section,
.user-section,
.cart-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

button {
  margin: 0 5px;
  padding: 5px 10px;
  cursor: pointer;
}

input {
  margin: 0 5px;
  padding: 5px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 10px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 3px;
}
</style>