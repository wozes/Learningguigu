## ✅ 奢侈品商城系统前端开发规范（Vue 3）

> ✳️ 项目背景：面向 NFT + 区块链交易场景的轻奢奢侈品商城系统，前端基于 Vue 3 开发，与后端 Java + Spring Boot 系统对接，支持用户、商家、管理员三类角色。

------

### 🧱 1. 项目结构规范（Vite + Vue 3）

```
luxmall-frontend
├── public/                     # 静态资源（如 favicon.ico）
├── src/
│   ├── api/                    # API 调用模块
│   │   ├── auth.js             # 认证相关接口
│   │   ├── buyer.js            # 买家相关接口
│   │   ├── seller.js           # 卖家相关接口
│   │   ├── admin.js            # 管理员相关接口
│   │   ├── nft.js              # NFT 相关接口
│   ├── assets/                 # 静态资源（如图片、CSS）
│   ├── components/             # 通用组件
│   │   ├── BaseButton.vue      # 通用按钮组件
│   │   ├── BaseTable.vue       # 通用表格组件
│   ├── layouts/                # 布局组件
│   │   ├── MainLayout.vue      # 主布局（包含导航、侧边栏）
│   │   ├── AuthLayout.vue      # 认证页面布局
│   ├── views/                  # 页面组件
│   │   ├── auth/               # 认证页面
│   │   │   ├── Login.vue       # 登录页面
│   │   │   ├── Register.vue    # 注册页面
│   │   ├── buyer/              # 买家页面
│   │   │   ├── ProductList.vue # 商品列表
│   │   │   ├── OrderDetail.vue # 订单详情
│   │   ├── seller/             # 卖家页面
│   │   ├── admin/              # 管理员页面
│   │   ├── nft/                # NFT 页面
│   ├── store/                  # Pinia 状态管理
│   │   ├── auth.js             # 认证状态
│   │   ├── user.js             # 用户信息
│   ├── router/                 # Vue Router 配置
│   │   ├── index.js            # 路由定义
│   ├── i18n/                   # 国际化配置
│   │   ├── index.js            # Vue I18n 配置
│   │   ├── locales/            # 语言文件
│   │   │   ├── zh-CN.json      # 中文
│   │   │   ├── en-US.json      # 英文
│   ├── utils/                  # 工具函数
│   │   ├── axios.js            # Axios 配置
│   │   ├── format.js           # 格式化工具
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 入口文件
├── .eslintrc.js                # ESLint 配置
├── .prettierrc                 # Prettier 配置
├── vite.config.js              # Vite 配置
├── package.json                # 项目依赖
```

- **目录说明**：
  - `api/`：封装后端 REST API 调用，按模块组织，与后端接口（`/auth`, `/buyer`, `/seller`, `/admin`, `/nft`）一一对应。
  - `components/`：可复用组件，如按钮、表格，遵循原子化设计。
  - `views/`：页面组件，按模块划分，与后端功能对应。
  - `store/`：Pinia 状态管理，管理用户认证、订单等全局状态。
  - `i18n/`：国际化配置，支持多语言界面和后端响应消息。
  - `utils/`：通用工具函数，如 Axios 封装、时间格式化。

---

### 📦 2. 组件命名与开发规范

#### 2.1 组件命名
- **文件命名**：大驼峰，`.vue` 后缀，如 `ProductList.vue`。
- **组件名**：与文件名一致，使用大驼峰，如 `<ProductList />`。
- **通用组件**：前缀 `Base`，如 `BaseButton.vue`。
- **页面组件**：与视图功能对应，如 `OrderDetail.vue`。
- **布局组件**：前缀 `Layout`，如 `MainLayout.vue`.

#### 2.2 组件开发规范
- **组合式 API**：使用 `<script setup>` 语法，简洁且支持 TypeScript。
- **Props 和 Emits**：
  - Props 使用 camelCase，显式声明类型：
    ```vue
    <script setup>
    defineProps({
      productId: {
        type: Number,
        required: true
      }
    });
    </script>
    ```
  - Emits 使用 kebab-case，显式声明：
    ```vue
    <script setup>
    const emit = defineEmits(['update-product']);
    </script>
    ```
- **模板**：使用清晰的 HTML 结构，避免嵌套过深。
- **样式**：
  - 使用 `scoped` CSS，避免样式泄漏：
    ```vue
    <style scoped>
    .product-card {
      padding: 16px;
    }
    </style>
    ```
  - 优先使用 Tailwind CSS 或 Element Plus 样式，减少自定义 CSS。
- **注释**：
  - 复杂逻辑添加注释，说明功能：
    ```vue
    <script setup>
    // 获取订单详情
    async function fetchOrder(id) {
      const response = await orderApi.getOrder(id);
      return response.data;
    }
    </script>
    ```

#### 2.3 组件化设计
- **原子化组件**：如 `BaseButton`, `BaseInput`，用于复用。
- **业务组件**：如 `ProductCard`, `OrderItem`，封装特定业务逻辑。
- **页面组件**：如 `ProductList`, `OrderDetail`，对应具体路由。
- **布局组件**：如 `MainLayout`，包含导航、侧边栏、页脚。

---

### 📡 3. API 调用与响应处理

#### 3.1 Axios 配置
- **位置**：`src/utils/axios.js`
- **配置**：
  - 设置基地址（从环境变量读取）：
    ```javascript
    import axios from 'axios';
    
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL, // 例如：http://api.luxmall.com
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': localStorage.getItem('lang') || 'zh-CN'
      }
    });
    
    // 请求拦截器：添加认证 Token
    instance.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // 响应拦截器：处理 Result<T> 格式
    instance.interceptors.response.use(
      response => {
        const { code, message, data } = response.data;
        if (code === 0) {
          return data; // 成功返回 data
        }
        // 失败抛出错误
        return Promise.reject(new Error(message));
      },
      error => {
        // 处理 HTTP 错误（如 401, 500）
        if (error.response?.status === 401) {
          // 跳转登录页
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );
    
    export default instance;
    ```

#### 3.2 API 模块
- **位置**：`src/api/`
- **组织**：按后端模块划分，每个模块一个文件：
  - `auth.js`：认证接口
  - `buyer.js`：买家接口
  - `seller.js`：卖家接口
  - `admin.js`：管理员接口
  - `nft.js`：NFT 接口
- **示例**（`src/api/auth.js`）：
  ```javascript
  import axios from '@/utils/axios';
  
  export const login = (data) => axios.post('/api/auth/login', data);
  export const register = (data) => axios.post('/api/auth/register', data);
  export const logout = () => axios.post('/api/auth/logout');
  export const refreshToken = () => axios.post('/api/auth/refresh');
  ```

#### 3.3 响应处理
- **后端响应格式**（`Result<T>`）：
  ```json
  {
    "code": 0, // 0 表示成功，非 0 表示失败
    "message": "操作成功", // 国际化消息
    "data": {} // 业务数据
  }
  ```
- **前端处理**：
  - 成功：直接使用 `data` 字段。
  - 失败：显示 `message`（国际化），根据 `code` 决定行为（如 401 跳转登录）。
  - 示例（`src/views/auth/Login.vue`）：
    ```vue
    <script setup>
    import { login } from '@/api/auth';
    import { ElMessage } from 'element-plus';
    
    const form = reactive({
      username: '',
      password: ''
    });
    
    async function handleLogin() {
      try {
        const data = await login(form);
        localStorage.setItem('token', data.token);
        router.push('/buyer/products');
      } catch (error) {
        ElMessage.error(error.message);
      }
    }
    </script>
    ```

#### 3.4 物流、国家、地址相关接口
- **物流**：支持订单发货和确认收货。
  - API：`/seller/orders/{order_id}/ship`, `/buyer/orders/{order_id}/confirm`
  - 示例（`src/api/seller.js`）：
    ```javascript
    export const shipOrder = (orderId, shippingData) =>
      axios.put(`/api/seller/orders/${orderId}/ship`, shippingData);
    ```
- **国家**：获取国家列表，用于地址选择。
  - API：新增 `/api/common/countries`（需后端实现）
  - 示例（`src/api/common.js`）：
    ```javascript
    export const getCountries = () => axios.get('/api/common/countries');
    ```
- **地址**：管理用户地址。
  - API：新增 `/api/buyer/addresses`（增删改查）
  - 示例（`src/api/buyer.js`）：
    ```javascript
    export const getAddresses = () => axios.get('/api/buyer/addresses');
    export const addAddress = (data) => axios.post('/api/buyer/addresses', data);
    ```

---

### 🌍 4. 国际化（i18n）支持

#### 4.1 配置 Vue I18n
- **位置**：`src/i18n/index.js`
- **配置**：
  ```javascript
  import { createI18n } from 'vue-i18n';
  import zhCN from './locales/zh-CN.json';
  import enUS from './locales/en-US.json';
  
  const messages = {
    'zh-CN': zhCN,
    'en-US': enUS
  };
  
  const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') || 'zh-CN',
    fallbackLocale: 'zh-CN',
    messages
  });
  
  export default i18n;
  ```
- **集成到应用**（`src/main.js`）：
  ```javascript
  import { createApp } from 'vue';
  import App from './App.vue';
  import i18n from './i18n';
  
  const app = createApp(App);
  app.use(i18n);
  app.mount('#app');
  ```

#### 4.2 语言文件
- **位置**：`src/i18n/locales/`
- **示例**：
  - `zh-CN.json`：
    ```json
    {
      "login": {
        "title": "登录",
        "username": "用户名",
        "password": "密码",
        "submit": "登录"
      },
      "error": {
        "invalid_param": "参数无效",
        "auth_failed": "用户名或密码错误"
      }
    }
    ```
  - `en-US.json`：
    ```json
    {
      "login": {
        "title": "Login",
        "username": "Username",
        "password": "Password",
        "submit": "Login"
      },
      "error": {
        "invalid_param": "Invalid parameter",
        "auth_failed": "Invalid username or password"
      }
    }
    ```

#### 4.3 使用 i18n
- **模板**：
  ```vue
  <template>
    <h1>{{ $t('login.title') }}</h1>
    <el-input v-model="form.username" :placeholder="$t('login.username')" />
  </template>
  ```
- **脚本**：
  ```vue
  <script setup>
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();
  
  function showError(messageKey) {
    ElMessage.error(t(`error.${messageKey}`));
  }
  </script>
  ```

#### 4.4 同步后端国际化
- **后端响应消息**：后端 `Result<T>` 的 `message` 字段已国际化，前端直接显示。
- **语言切换**：
  - 提供语言切换组件：
    ```vue
    <script setup>
    import { useI18n } from 'vue-i18n';
    
    const { locale } = useI18n();
    function switchLang(lang) {
      locale.value = lang;
      localStorage.setItem('lang', lang);
      // 更新 Axios 请求头
      axios.defaults.headers['Accept-Language'] = lang;
    }
    </script>
    
    <template>
      <el-select v-model="locale" @change="switchLang">
        <el-option value="zh-CN" label="中文" />
        <el-option value="en-US" label="English" />
      </el-select>
    </template>
    ```

---

### 🧠 5. 状态与路由管理

#### 5.1 状态管理（Pinia）
- **位置**：`src/store/`
- **模块**：
  - `auth.js`：管理认证状态（Token、登录状态）。
  - `user.js`：管理用户信息（角色、KYC 状态）。
  - `cart.js`：管理购物车。
- **示例**（`src/store/auth.js`）：
  ```javascript
  import { defineStore } from 'pinia';
  import { login, logout } from '@/api/auth';
  
  export const useAuthStore = defineStore('auth', {
    state: () => ({
      token: localStorage.getItem('token') || '',
      isAuthenticated: !!localStorage.getItem('token')
    }),
    actions: {
      async login(credentials) {
        const data = await login(credentials);
        this.token = data.token;
        this.isAuthenticated = true;
        localStorage.setItem('token', data.token);
      },
      async logout() {
        await logout();
        this.token = '';
        this.isAuthenticated = false;
        localStorage.removeItem('token');
      }
    }
  });
  ```
- **使用**：
  ```vue
  <script setup>
  import { useAuthStore } from '@/store/auth';
  
  const authStore = useAuthStore();
  async function handleLogout() {
    await authStore.logout();
    router.push('/login');
  }
  </script>
  ```

#### 5.2 路由管理（Vue Router）
- **位置**：`src/router/index.js`
- **配置**：
  ```javascript
  import { createRouter, createWebHistory } from 'vue-router';
  import { useAuthStore } from '@/store/auth';
  
  const routes = [
    {
      path: '/',
      redirect: '/buyer/products'
    },
    {
      path: '/login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/buyer/products',
      component: () => import('@/views/buyer/ProductList.vue'),
      meta: { requiresAuth: true, role: 'BUYER' }
    },
    {
      path: '/seller/products',
      component: () => import('@/views/seller/ProductList.vue'),
      meta: { requiresAuth: true, role: 'SELLER' }
    }
  ];
  
  const router = createRouter({
    history: createWebHistory(),
    routes
  });
  
  // 路由守卫
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return next('/login');
    }
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      return next('/403');
    }
    next();
  });
  
  export default router;
  ```
- **集成**（`src/main.js`）：
  ```javascript
  import router from './router';
  app.use(router);
  ```

#### 5.3 物流、国家、地址相关界面
- **物流跟踪**（`src/views/buyer/OrderDetail.vue`）：
  - 显示 `shipping_info` 表数据（物流公司、运单号、状态）。
  - 提供“确认收货”按钮，调用 `/buyer/orders/{order_id}/confirm`。
  - 示例：
    ```vue
    <template>
      <el-descriptions title="物流信息">
        <el-descriptions-item label="物流公司">{{ order.shipping.carrier }}</el-descriptions-item>
        <el-descriptions-item label="运单号">{{ order.shipping.tracking_number }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ $t(`shipping.${order.shipping.shipping_status}`) }}</el-descriptions-item>
      </el-descriptions>
      <el-button v-if="order.status === 'SHIPPED'" @click="confirmReceipt">确认收货</el-button>
    </template>
    ```
- **国家选择**（`src/components/AddressForm.vue`）：
  - 下拉框显示 `country` 表数据，调用 `/api/common/countries`。
  - 示例：
    ```vue
    <template>
      <el-select v-model="form.countryId" :placeholder="$t('address.country')">
        <el-option
          v-for="country in countries"
          :key="country.id"
          :label="country.name"
          :value="country.id"
        />
      </el-select>
    </template>
    ```
- **地址管理**（`src/views/buyer/AddressList.vue`）：
  - 列表显示 `address` 表数据，支持增删改查。
  - 示例：
    ```vue
    <template>
      <el-table :data="addresses">
        <el-table-column prop="province" :label="$t('address.province')" />
        <el-table-column prop="city" :label="$t('address.city')" />
        <el-table-column prop="street" :label="$t('address.street')" />
        <el-table-column>
          <template #default="{ row }">
            <el-button @click="editAddress(row)">编辑</el-button>
            <el-button @click="deleteAddress(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button @click="addAddress">新增地址</el-button>
    </template>
    ```

---

### 📜 6. Git 提交与分支管理规范

#### 6.1 Git 提交规范
- **格式**：`[模块/功能]: 简要描述 (任务ID)`
  - 示例：
    - `[auth/login]: 添加登录页面 (LUX-123)`
    - `[buyer/products]: 修复商品列表分页 (LUX-456)`
- **粒度**：单一功能或修复，控制在 50 字符以内。
- **检查**：
  - 运行 `npm run lint` 检查代码规范。
  - 运行 `npm run test` 确保测试通过。
  - 提交前需 Code Review。

#### 6.2 分支管理规范
- **分支类型**：
  - `main`：生产环境代码
  - `develop`：开发集成
  - `feature/模块-功能-任务ID`：如 `feature/auth-login-LUX-123`
  - `bugfix/模块-问题-任务ID`：如 `bugfix/product-list-LUX-456`
  - `release/vX.Y.Z`：如 `release/v1.0.0`
  - `hotfix/问题-任务ID`：如 `hotfix/login-error-LUX-789`
- **工作流**：
  - 新功能：从 `develop` 创建 `feature/*`，合并回 `develop`。
  - 修复 Bug：从 `develop` 或 `main` 创建 `bugfix/*`。
  - 发布：从 `develop` 创建 `release/*`，合并到 `main` 和 `develop`。
  - 紧急修复：从 `main` 创建 `hotfix/*`。
- **PR 规范**：
  - 标题：`[模块] 功能描述 (任务ID)`
  - 描述：功能说明、影响范围、测试情况。
  - 示例：
    ```
    ### 变更描述
    - 添加用户登录页面，支持用户名和密码输入
    ### 影响范围
    - 仅影响 /login 路由
    ### 测试情况
    - 手动测试：登录成功跳转商品列表
    ### 任务链接
    - LUX-123
    ```
  - 至少 1 名团队成员 Review 通过。

#### 6.3 Git 工具配置
- **.gitignore**：
  ```gitignore
  node_modules/
  dist/
  .env.local
  *.log
  ```
- **Git 钩子**：
  - `pre-commit`：运行 `npm run lint` 和 `npm run test`。
  - `commit-msg`：验证提交消息格式。
- **CI/CD**：
  - 使用 GitHub Actions：
    - 检查代码规范：`npm run lint`
    - 运行测试：`npm run test`
    - 构建：`npm run build`
    - 部署：发布到 Vercel 或 Netlify。

#### 6.4 团队协作规范
- 定期从 `develop` 同步更新。
- 每周 Review PR，确保及时合并。
- 使用 Jira 管理任务，分支名包含任务 ID。

#### 6.5 常见问题与解决方案
- **问题**：API 调用失败
  - **解决方案**：检查后端基地址、Token 有效性；查看 Axios 拦截器日志。
- **问题**：i18n 消息未加载
  - **解决方案**：验证语言文件路径，检查 `vue-i18n` 配置。
- **问题**：路由守卫失效
  - **解决方案**：确保 `beforeEach` 逻辑正确，检查 Pinia 状态。

---

### 🛠️ 7. 开发工具与配置

#### 7.1 依赖
- **核心依赖**：
  ```json
  {
    "dependencies": {
      "vue": "^3.2.0",
      "vue-router": "^4.0.0",
      "pinia": "^2.0.0",
      "axios": "^1.0.0",
      "vue-i18n": "^9.0.0",
      "element-plus": "^2.0.0"
    },
    "devDependencies": {
      "vite": "^4.0.0",
      "eslint": "^8.0.0",
      "prettier": "^2.0.0",
      "@vitejs/plugin-vue": "^4.0.0"
    }
  }
  ```

#### 7.2 ESLint 配置（`.eslintrc.js`）
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    'vue/multi-word-component-names': 'off'
  }
};
```

#### 7.3 Prettier 配置（`.prettierrc`）
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

#### 7.4 Vite 配置（`vite.config.js`）
```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://api.luxmall.com',
        changeOrigin: true
      }
    }
  }
});
```

---

### 📋 8. 常见问题与解决方案

1. **问题**：组件样式冲突
   - **解决方案**：确保所有组件使用 `scoped` CSS；必要时使用 CSS Modules。
2. **问题**：API 响应延迟
   - **解决方案**：添加加载状态（如 Element Plus 的 `loading`）；优化后端接口性能。
3. **问题**：Pinia 状态丢失
   - **解决方案**：持久化关键状态到 `localStorage`；检查组件是否错误重置状态。
4. **问题**：国际化切换不生效
   - **解决方案**：验证 `localStorage` 和 Axios 请求头的 `Accept-Language` 同步。
5. **问题**：路由跳转失败
   - **解决方案**：检查路由守卫逻辑，确保认证状态正确。

---

### 🚀 9. 部署规范

- **构建**：运行 `npm run build`，生成 `dist/` 目录。
- **部署**：
  - 使用 Vercel、Netlify 或 Nginx 托管静态文件。
  - 配置环境变量（如 `VITE_API_BASE_URL`）。
- **CD 流程**：
  - GitHub Actions 自动构建和部署：
    ```yaml
    name: Deploy
    on:
      push:
        branches: [main]
    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v3
            with:
              node-version: 16
          - run: npm install
          - run: npm run build
          - uses: peaceiris/actions-gh-pages@v3
            with:
              github_token: ${{ secrets.GITHUB_TOKEN }}
              publish_dir: ./dist
    ```
- **监控**：使用 Sentry 监控前端错误。