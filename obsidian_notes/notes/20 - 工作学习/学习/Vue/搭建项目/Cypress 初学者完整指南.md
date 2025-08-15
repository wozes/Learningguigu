# Cypress 初学者完整指南

## 1. 安装 Cypress

在你的Vue3项目根目录执行：

```bash
# 安装 Cypress
npm install --save-dev cypress

# 打开 Cypress（第一次会自动创建配置文件）
npx cypress open
```

## 2. 项目结构

安装后，Cypress会自动创建这样的目录结构：

```
your-project/
├── cypress/
│   ├── e2e/              # 存放测试文件
│   ├── fixtures/         # 测试数据文件
│   ├── support/          # 支持文件和自定义命令
│   └── downloads/        # 测试下载的文件
├── cypress.config.js     # Cypress配置文件
└── package.json
```

## 3. 基础配置

### cypress.config.js

```javascript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // 你的应用运行地址
    baseUrl: 'http://localhost:3000',
    
    // 测试文件路径
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // 支持文件
    supportFile: 'cypress/support/e2e.js',
    
    // 视口大小
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // 测试视频录制（可选）
    video: true,
    screenshot: true
  }
})
```

## 4. 编写第一个测试

### cypress/e2e/first-test.cy.js

```javascript
// 这是一个超级简单的测试例子
describe('我的第一个测试', () => {
  
  // 每个测试前都会执行
  beforeEach(() => {
    // 访问首页
    cy.visit('/')
  })

  // 测试用例1：检查页面标题
  it('应该显示正确的页面标题', () => {
    // 检查页面是否包含某个文字
    cy.contains('Welcome')
    
    // 检查页面标题
    cy.title().should('include', 'Vue')
  })

  // 测试用例2：测试导航
  it('应该能够导航到关于页面', () => {
    // 点击导航链接（假设你有一个关于页面的链接）
    cy.contains('About').click()
    
    // 检查URL是否改变
    cy.url().should('include', '/about')
    
    // 检查页面内容
    cy.contains('About Page')
  })

  // 测试用例3：测试表单
  it('应该能够填写并提交表单', () => {
    // 假设你有一个联系表单
    cy.get('input[name="name"]').type('张三')
    cy.get('input[name="email"]').type('zhangsan@example.com')
    cy.get('textarea[name="message"]').type('这是一条测试消息')
    
    // 提交表单
    cy.get('button[type="submit"]').click()
    
    // 检查提交后的反馈
    cy.contains('感谢您的留言')
  })
})
```

## 5. 常用 Cypress 命令

### 页面操作

```javascript
// 访问页面
cy.visit('/home')
cy.visit('https://example.com')

// 重新加载页面
cy.reload()

// 前进后退
cy.go('back')
cy.go('forward')
```

### 元素查找

```javascript
// 通过CSS选择器
cy.get('#my-id')           // ID选择器
cy.get('.my-class')        // class选择器
cy.get('button')           // 标签选择器
cy.get('[data-testid="submit"]')  // 属性选择器（推荐）

// 通过文本内容
cy.contains('登录')
cy.contains('button', '提交')

// 查找子元素
cy.get('.form').find('input')
cy.get('.form').within(() => {
  cy.get('input[name="username"]').type('user')
})
```

### 交互操作

```javascript
// 点击
cy.get('button').click()
cy.get('a').click()

// 输入文字
cy.get('input').type('Hello World')
cy.get('input').clear().type('新内容')

// 选择下拉框
cy.get('select').select('选项1')

// 勾选复选框
cy.get('input[type="checkbox"]').check()
cy.get('input[type="checkbox"]').uncheck()

// 单选框
cy.get('input[type="radio"]').check()
```

### 断言检查

```javascript
// 检查元素是否存在
cy.get('#element').should('exist')
cy.get('#element').should('be.visible')

// 检查文本内容
cy.get('h1').should('contain', '欢迎')
cy.get('h1').should('have.text', '欢迎来到我的网站')

// 检查属性
cy.get('input').should('have.attr', 'placeholder', '请输入用户名')
cy.get('button').should('have.class', 'btn-primary')

// 检查URL
cy.url().should('include', '/dashboard')
cy.url().should('eq', 'http://localhost:3000/home')

// 检查数量
cy.get('li').should('have.length', 5)
```

## 6. 给Vue组件添加测试标识

为了更好地测试，建议在Vue组件中添加 `data-testid` 属性：

```vue
<!-- 好的做法 -->
<template>
  <div>
    <h1 data-testid="page-title">欢迎页面</h1>
    <button data-testid="login-btn" @click="login">登录</button>
    <form data-testid="contact-form">
      <input data-testid="name-input" v-model="name" />
      <button data-testid="submit-btn" type="submit">提交</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const name = ref('')

const login = () => {
  // 登录逻辑
}
</script>
```

然后在测试中使用：

```javascript
cy.get('[data-testid="page-title"]').should('contain', '欢迎页面')
cy.get('[data-testid="login-btn"]').click()
cy.get('[data-testid="name-input"]').type('张三')
```

## 7. 运行测试

### 开发模式（推荐初学者）

```bash
# 打开Cypress测试界面，可以看到测试执行过程
npx cypress open
```

### 命令行模式

```bash
# 在命令行中运行所有测试
npx cypress run

# 运行特定的测试文件
npx cypress run --spec "cypress/e2e/login.cy.js"

# 在特定浏览器中运行
npx cypress run --browser chrome
```

## 8. package.json 脚本配置

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:e2e:chrome": "cypress run --browser chrome"
  }
}
```

## 9. 初学者最佳实践

### ✅ 好的做法

```javascript
// 1. 使用 data-testid 而不是 class 或 id
cy.get('[data-testid="submit-button"]')  // ✅ 好
cy.get('#submit')                        // ❌ 不推荐

// 2. 使用有意义的测试描述
it('用户应该能够成功登录', () => {})      // ✅ 好
it('测试登录', () => {})                  // ❌ 不够明确

// 3. 一个测试只测一个功能
it('应该能够填写用户名', () => {
  cy.get('[data-testid="username"]').type('testuser')
  cy.get('[data-testid="username"]').should('have.value', 'testuser')
})

// 4. 使用 beforeEach 避免重复代码
beforeEach(() => {
  cy.visit('/login')
})
```

### ❌ 避免的做法

```javascript
// 不要依赖具体的文本内容（容易变化）
cy.contains('点击这里登录')  // ❌ 如果文字改了就会失败

// 不要写太长的测试
it('测试整个用户流程', () => {
  // 登录 + 浏览 + 购买 + 结账... 太多了
})

// 不要使用 cy.wait(5000) 等待固定时间
cy.wait(5000)  // ❌ 不稳定
cy.get('.loading').should('not.exist')  // ✅ 等待元素消失
```

## 10. 调试技巧

### 使用 .debug()

```javascript
cy.get('[data-testid="button"]')
  .debug()  // 会在这里暂停，可以在控制台查看元素
  .click()
```

### 使用 .pause()

```javascript
cy.get('[data-testid="form"]').within(() => {
  cy.get('input').type('test')
  cy.pause()  // 暂停测试，可以手动继续
  cy.get('button').click()
})
```

### 查看测试执行过程

- Cypress 会自动截图和录屏
- 左侧可以看到每一步的执行情况
- 点击任意步骤可以看到当时的页面状态

## 开始你的第一个测试！

1. 在你的Vue项目中运行 `npm install --save-dev cypress`
2. 运行 `npx cypress open`
3. 创建一个简单的测试文件
4. 在测试界面中运行并观察结果

记住：**不要一开始就写复杂的测试，从简单的开始，逐步学习！**