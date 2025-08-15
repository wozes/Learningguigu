# Vue基础语法和概念详解

## 1. 模板语法：插值表达式和指令系统

### 插值表达式 `{{ }}`

插值表达式是Vue中最基本的数据绑定方式，用于在模板中显示数据。

```html
<template>
  <div>
    <!-- 基本文本插值 -->
    <p>{{ message }}</p>
    
    <!-- 表达式计算 -->
    <p>{{ number + 1 }}</p>
    
    <!-- 方法调用 -->
    <p>{{ formatName(firstName, lastName) }}</p>
    
    <!-- 三元运算符 -->
    <p>{{ isActive ? '激活' : '未激活' }}</p>
    
    <!-- 对象属性访问 -->
    <p>{{ user.name }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue!',
      number: 10,
      firstName: '张',
      lastName: '三',
      isActive: true,
      user: { name: '李四' }
    }
  },
  methods: {
    formatName(first, last) {
      return first + last
    }
  }
}
</script>
```

**注意事项：**

- 只能包含单个表达式，不能是语句
- 不能访问全局变量（除了少数白名单如 Math、Date）
- 会自动进行HTML转义，防止XSS攻击

### 指令系统

指令是带有 `v-` 前缀的特殊属性，用于向DOM元素添加响应式行为。

#### 常用指令

```html
<template>
  <div>
    <!-- v-text: 纯文本渲染 -->
    <p v-text="message"></p>
    
    <!-- v-html: HTML内容渲染（慎用） -->
    <div v-html="htmlContent"></div>
    
    <!-- v-bind: 属性绑定（可简写为 :） -->
    <img v-bind:src="imageSrc" v-bind:alt="imageAlt">
    <img :src="imageSrc" :alt="imageAlt">
    
    <!-- v-on: 事件监听（可简写为 @） -->
    <button v-on:click="handleClick">点击</button>
    <button @click="handleClick">点击</button>
    
    <!-- v-model: 双向数据绑定 -->
    <input v-model="inputValue" placeholder="输入内容">
    
    <!-- 修饰符的使用 -->
    <form @submit.prevent="onSubmit">
      <input v-model.trim="username" placeholder="用户名">
      <input v-model.number="age" type="number" placeholder="年龄">
    </form>
    
    <!-- 动态属性名 -->
    <a v-bind:[attributeName]="url">动态属性</a>
    
    <!-- 动态事件名 -->
    <button v-on:[eventName]="doSomething">动态事件</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello World',
      htmlContent: '<strong>粗体文本</strong>',
      imageSrc: 'image.jpg',
      imageAlt: '图片描述',
      inputValue: '',
      username: '',
      age: 0,
      attributeName: 'href',
      url: 'https://example.com',
      eventName: 'click'
    }
  },
  methods: {
    handleClick() {
      console.log('按钮被点击了')
    },
    onSubmit() {
      console.log('表单提交')
    },
    doSomething() {
      console.log('动态事件触发')
    }
  }
}
</script>
```

## 2. 响应式数据：data、computed、watch

### data 数据属性

`data` 是组件的基础数据，所有在 `data` 中声明的属性都会成为响应式的。

```html
<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>用户: {{ user.name }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
      user: {
        name: '张三',
        age: 25
      },
      items: ['苹果', '香蕉', '橙子']
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

**重要规则：**

- `data` 必须是一个函数，返回数据对象
- 确保组件实例之间的数据独立性
- 只有在 `data` 中预先声明的属性才是响应式的

### computed 计算属性

计算属性是基于响应式依赖进行缓存的，只有依赖发生变化时才会重新计算。

```html
<template>
  <div>
    <p>原价: ¥{{ price }}</p>
    <p>折扣: {{ discount }}%</p>
    <p>现价: ¥{{ finalPrice }}</p>
    
    <p>全名: {{ fullName }}</p>
    <input v-model="firstName" placeholder="姓">
    <input v-model="lastName" placeholder="名">
    
    <!-- 使用setter的计算属性 -->
    <input v-model="fullNameWithSetter">
  </div>
</template>

<script>
export default {
  data() {
    return {
      price: 100,
      discount: 20,
      firstName: '张',
      lastName: '三'
    }
  },
  computed: {
    // 只读计算属性
    finalPrice() {
      return this.price * (1 - this.discount / 100)
    },
    
    fullName() {
      return this.firstName + this.lastName
    },
    
    // 带有setter的计算属性
    fullNameWithSetter: {
      get() {
        return this.firstName + this.lastName
      },
      set(newValue) {
        const names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[names.length - 1]
      }
    }
  }
}
</script>
```

**computed vs methods：**

- `computed` 有缓存，依赖不变时不会重新计算
- `methods` 每次调用都会执行
- `computed` 适合复杂计算，`methods` 适合事件处理

### watch 侦听器

侦听器用于观察和响应数据的变化，适合执行异步操作或开销较大的操作。

```html
<template>
  <div>
    <input v-model="question" placeholder="输入问题">
    <p>{{ answer }}</p>
    
    <p>用户信息: {{ user.name }} - {{ user.age }}岁</p>
    <button @click="updateUser">更新用户</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      question: '',
      answer: '请输入问题...',
      user: {
        name: '张三',
        age: 25
      }
    }
  },
  watch: {
    // 基本侦听
    question(newQuestion, oldQuestion) {
      if (newQuestion.includes('?')) {
        this.answer = '思考中...'
        this.debouncedGetAnswer()
      }
    },
    
    // 深度侦听对象
    user: {
      handler(newUser, oldUser) {
        console.log('用户信息变化:', newUser)
      },
      deep: true
    },
    
    // 立即执行侦听器
    immediate: {
      handler(val) {
        console.log('组件初始化时就执行')
      },
      immediate: true
    },
    
    // 侦听对象的特定属性
    'user.name'(newName, oldName) {
      console.log(`姓名从 ${oldName} 改为 ${newName}`)
    }
  },
  methods: {
    debouncedGetAnswer() {
      // 模拟异步操作
      setTimeout(() => {
        this.answer = '这是一个很好的问题！'
      }, 1000)
    },
    
    updateUser() {
      this.user.name = '李四'
      this.user.age = 30
    }
  }
}
</script>
```

## 3. 生命周期钩子

生命周期钩子让你可以在组件的特定阶段执行代码。

```html
<template>
  <div>
    <p>组件已加载</p>
    <button @click="updateData">更新数据</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  
  // 创建阶段
  beforeCreate() {
    console.log('beforeCreate: 组件实例刚被创建')
    // 此时 data、methods 还未初始化
  },
  
  created() {
    console.log('created: 组件实例创建完成')
    // 可以访问 data、methods，但DOM还未挂载
    // 适合进行数据初始化、API调用
    this.initData()
  },
  
  // 挂载阶段
  beforeMount() {
    console.log('beforeMount: 即将挂载DOM')
    // 模板编译完成，但还未挂载到页面
  },
  
  mounted() {
    console.log('mounted: DOM已挂载')
    // 可以访问DOM元素，适合DOM操作、第三方库初始化
    this.$nextTick(() => {
      // DOM更新完成后执行
      console.log('DOM更新完成')
    })
  },
  
  // 更新阶段
  beforeUpdate() {
    console.log('beforeUpdate: 数据更新前')
    // 数据已更新，但DOM还未重新渲染
  },
  
  updated() {
    console.log('updated: DOM更新完成')
    // DOM已重新渲染，避免在此修改数据（可能导致无限循环）
  },
  
  // 销毁阶段
  beforeUnmount() { // Vue 2 中是 beforeDestroy
    console.log('beforeUnmount: 即将销毁组件')
    // 适合清理定时器、事件监听器等
    this.cleanup()
  },
  
  unmounted() { // Vue 2 中是 destroyed
    console.log('unmounted: 组件已销毁')
    // 组件完全销毁，所有子组件也被销毁
  },
  
  methods: {
    initData() {
      // 初始化数据
      console.log('初始化数据')
    },
    
    updateData() {
      this.message = 'Updated!'
    },
    
    cleanup() {
      // 清理资源
      console.log('清理资源')
    }
  }
}
</script>
```

**生命周期使用场景：**

- `created`: API调用、数据初始化
- `mounted`: DOM操作、第三方库初始化、获取元素尺寸
- `beforeUnmount`: 清理定时器、事件监听、取消网络请求
- `updated`: DOM更新后的操作（谨慎使用）

## 4. 条件渲染：v-if、v-show

### v-if vs v-show

```html
<template>
  <div>
    <!-- v-if: 条件性渲染，切换时会销毁/重建元素 -->
    <div v-if="showContent">
      <h2>v-if 内容</h2>
      <p>这个元素会被完全创建或销毁</p>
    </div>
    
    <!-- v-else-if 和 v-else -->
    <div v-if="type === 'A'">类型 A</div>
    <div v-else-if="type === 'B'">类型 B</div>
    <div v-else>其他类型</div>
    
    <!-- v-show: 始终渲染，通过CSS display控制显示 -->
    <div v-show="showContent">
      <h2>v-show 内容</h2>
      <p>这个元素始终存在，只是显示/隐藏</p>
    </div>
    
    <!-- template 包装器（不会渲染额外元素） -->
    <template v-if="showMultiple">
      <p>第一段</p>
      <p>第二段</p>
      <p>第三段</p>
    </template>
    
    <button @click="toggle">切换显示</button>
    <button @click="changeType">切换类型</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showContent: true,
      showMultiple: true,
      type: 'A'
    }
  },
  methods: {
    toggle() {
      this.showContent = !this.showContent
    },
    changeType() {
      const types = ['A', 'B', 'C']
      const currentIndex = types.indexOf(this.type)
      this.type = types[(currentIndex + 1) % types.length]
    }
  }
}
</script>
```

**选择原则：**

- `v-if` 适合条件很少改变的场景（惰性渲染）
- `v-show` 适合需要频繁切换的场景
- `v-if` 有更高的切换开销，`v-show` 有更高的初始渲染开销

## 5. 列表渲染：v-for 和 key 的正确使用

### 基本列表渲染

```html
<template>
  <div>
    <!-- 遍历数组 -->
    <ul>
      <li v-for="(item, index) in items" :key="item.id">
        {{ index }} - {{ item.name }}
      </li>
    </ul>
    
    <!-- 遍历对象 -->
    <ul>
      <li v-for="(value, name, index) in user" :key="name">
        {{ index }}. {{ name }}: {{ value }}
      </li>
    </ul>
    
    <!-- 遍历字符串 -->
    <ul>
      <li v-for="(char, index) in message" :key="index">
        {{ char }}
      </li>
    </ul>
    
    <!-- 遍历数字 -->
    <ul>
      <li v-for="n in 10" :key="n">
        {{ n }}
      </li>
    </ul>
    
    <!-- 复杂列表操作 -->
    <div>
      <input v-model="newItemName" placeholder="添加新项目">
      <button @click="addItem">添加</button>
    </div>
    
    <ul>
      <li v-for="item in items" :key="item.id">
        <input v-model="item.name">
        <button @click="removeItem(item.id)">删除</button>
        <button @click="toggleComplete(item.id)">
          {{ item.completed ? '完成' : '未完成' }}
        </button>
      </li>
    </ul>
    
    <!-- 过滤和排序 -->
    <div>
      <input v-model="searchTerm" placeholder="搜索...">
      <select v-model="sortBy">
        <option value="name">按名称排序</option>
        <option value="id">按ID排序</option>
      </select>
    </div>
    
    <ul>
      <li v-for="item in filteredAndSortedItems" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: '苹果', completed: false },
        { id: 2, name: '香蕉', completed: true },
        { id: 3, name: '橙子', completed: false }
      ],
      user: {
        name: '张三',
        age: 25,
        city: '北京'
      },
      message: 'Vue',
      newItemName: '',
      searchTerm: '',
      sortBy: 'name'
    }
  },
  computed: {
    filteredAndSortedItems() {
      let filtered = this.items
      
      // 过滤
      if (this.searchTerm) {
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      }
      
      // 排序
      return filtered.sort((a, b) => {
        if (this.sortBy === 'name') {
          return a.name.localeCompare(b.name)
        } else {
          return a.id - b.id
        }
      })
    }
  },
  methods: {
    addItem() {
      if (this.newItemName.trim()) {
        this.items.push({
          id: Date.now(),
          name: this.newItemName.trim(),
          completed: false
        })
        this.newItemName = ''
      }
    },
    
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id)
    },
    
    toggleComplete(id) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        item.completed = !item.completed
      }
    }
  }
}
</script>
```

### key 的重要性

```html
<template>
  <div>
    <!-- 错误示例：使用 index 作为 key -->
    <div>
      <h3>❌ 错误：使用 index 作为 key</h3>
      <input v-model="newName" placeholder="输入姓名">
      <button @click="addToTop">添加到顶部</button>
      <ul>
        <li v-for="(person, index) in people" :key="index">
          <input :value="person.name" />
          <span>{{ person.name }}</span>
        </li>
      </ul>
    </div>
    
    <!-- 正确示例：使用唯一 ID 作为 key -->
    <div>
      <h3>✅ 正确：使用唯一 ID 作为 key</h3>
      <input v-model="newName2" placeholder="输入姓名">
      <button @click="addToTop2">添加到顶部</button>
      <ul>
        <li v-for="person in people2" :key="person.id">
          <input :value="person.name" />
          <span>{{ person.name }}</span>
        </li>
      </ul>
    </div>
    
    <!-- 嵌套 v-for -->
    <div>
      <h3>嵌套列表</h3>
      <div v-for="category in categories" :key="category.id">
        <h4>{{ category.name }}</h4>
        <ul>
          <li v-for="item in category.items" :key="`${category.id}-${item.id}`">
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newName: '',
      newName2: '',
      people: [
        { name: '张三' },
        { name: '李四' },
        { name: '王五' }
      ],
      people2: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' }
      ],
      categories: [
        {
          id: 1,
          name: '水果',
          items: [
            { id: 1, name: '苹果' },
            { id: 2, name: '香蕉' }
          ]
        },
        {
          id: 2,
          name: '蔬菜',
          items: [
            { id: 3, name: '胡萝卜' },
            { id: 4, name: '白菜' }
          ]
        }
      ]
    }
  },
  methods: {
    addToTop() {
      if (this.newName.trim()) {
        this.people.unshift({ name: this.newName.trim() })
        this.newName = ''
      }
    },
    
    addToTop2() {
      if (this.newName2.trim()) {
        this.people2.unshift({
          id: Date.now(),
          name: this.newName2.trim()
        })
        this.newName2 = ''
      }
    }
  }
}
</script>
```

### key 的使用原则

**为什么需要 key：**

1. Vue使用虚拟DOM进行高效更新
2. key帮助Vue识别哪些元素发生了变化
3. 正确的key可以复用元素，提高性能
4. 错误的key可能导致状态错乱

**key 的选择原则：**

- ✅ 使用唯一且稳定的标识符（如ID）
- ✅ 确保同级元素中key唯一
- ❌ 避免使用数组索引（当列表会变化时）
- ❌ 避免使用随机数
- ❌ 避免使用对象或数组作为key

**特殊情况：**

```html
<!-- 当列表是静态的且永远不会改变时，可以使用 index -->
<li v-for="(color, index) in staticColors" :key="index">
  {{ color }}
</li>

<!-- 强制替换元素（而不是复用）时可以使用动态key -->
<transition>
  <div :key="currentUser.id">
    用户: {{ currentUser.name }}
  </div>
</transition>
```

## 总结

这些基础概念是Vue开发的核心：

1. **模板语法**：掌握插值和指令的正确使用
2. **响应式数据**：理解data、computed、watch的区别和使用场景
3. **生命周期**：在合适的时机执行合适的操作
4. **条件渲染**：根据场景选择v-if或v-show
5. **列表渲染**：正确使用key确保性能和状态正确

掌握这些概念后，你就具备了Vue开发的基础能力，可以继续学习组件化、路由等更高级的特性。