在前端开发中，减少 if-else 的方法有很多，这里介绍一些常用且实用的技巧：

## 1. 使用对象映射替代条件判断

```javascript
// 替代多个 if-else
const getStatusColor = (status) => {
  const statusMap = {
    pending: '#ffa500',
    approved: '#00ff00',
    rejected: '#ff0000',
    draft: '#cccccc'
  }
  return statusMap[status] || '#000000'
}

// React 组件中的应用
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'orange', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' }
  }
  
  const config = statusConfig[status] || { color: 'gray', text: '未知' }
  
  return <span style={{ color: config.color }}>{config.text}</span>
}
```

## 2. 条件渲染优化

```jsx
// 使用 && 运算符
const UserProfile = ({ user, isLoggedIn }) => (
  <div>
    {isLoggedIn && <WelcomeMessage user={user} />}
    {!isLoggedIn && <LoginButton />}
  </div>
)

// 使用三元运算符
const Button = ({ loading, onClick, children }) => (
  <button onClick={onClick} disabled={loading}>
    {loading ? <Spinner /> : children}
  </button>
)

// 使用数组过滤
const Navigation = ({ userRole }) => {
  const menuItems = [
    { key: 'home', label: '首页', roles: ['user', 'admin'] },
    { key: 'dashboard', label: '仪表板', roles: ['admin'] },
    { key: 'settings', label: '设置', roles: ['admin'] }
  ]

  return (
    <nav>
      {menuItems
        .filter(item => item.roles.includes(userRole))
        .map(item => <MenuItem key={item.key} label={item.label} />)
      }
    </nav>
  )
}
```

## 3. 使用策略模式处理表单验证

```javascript
const validators = {
  email: (value) => /\S+@\S+\.\S+/.test(value),
  phone: (value) => /^1[3-9]\d{9}$/.test(value),
  required: (value) => value && value.trim().length > 0,
  minLength: (min) => (value) => value && value.length >= min
}

const validateField = (type, value, options = {}) => {
  const validator = validators[type]
  if (!validator) return true
  
  return typeof validator === 'function' 
    ? validator(value)
    : validator(options.min)(value)
}

// 使用
const isValid = validateField('email', 'user@example.com')
```

## 4. 组件工厂模式

```jsx
const componentMap = {
  text: ({ value }) => <span>{value}</span>,
  link: ({ value, href }) => <a href={href}>{value}</a>,
  image: ({ src, alt }) => <img src={src} alt={alt} />,
  button: ({ text, onClick }) => <button onClick={onClick}>{text}</button>
}

const DynamicComponent = ({ type, ...props }) => {
  const Component = componentMap[type]
  return Component ? <Component {...props} /> : <div>Unknown component</div>
}

// 使用
<DynamicComponent type="link" value="点击这里" href="/home" />
```

## 5. CSS-in-JS 中的条件样式

```javascript
// 使用对象映射
const getButtonStyles = (variant, size) => {
  const variants = {
    primary: { backgroundColor: '#007bff', color: 'white' },
    secondary: { backgroundColor: '#6c757d', color: 'white' },
    outline: { border: '1px solid #007bff', color: '#007bff' }
  }
  
  const sizes = {
    small: { padding: '4px 8px', fontSize: '12px' },
    medium: { padding: '8px 16px', fontSize: '14px' },
    large: { padding: '12px 24px', fontSize: '16px' }
  }
  
  return {
    ...variants[variant],
    ...sizes[size]
  }
}

const Button = styled.button`
  ${({ variant, size }) => getButtonStyles(variant, size)}
`
```

## 6. 路由守卫简化

```javascript
// 权限配置
const routeConfig = {
  '/admin': { requireAuth: true, roles: ['admin'] },
  '/profile': { requireAuth: true, roles: ['user', 'admin'] },
  '/public': { requireAuth: false, roles: [] }
}

const RouteGuard = ({ path, component: Component }) => {
  const config = routeConfig[path] || {}
  const { user, isAuthenticated } = useAuth()
  
  const canAccess = !config.requireAuth || 
    (isAuthenticated && config.roles.includes(user?.role))
  
  return canAccess ? <Component /> : <Redirect to="/login" />
}
```

## 7. 状态管理中的 Reducer 优化

```javascript
// 使用对象映射替代 switch-case
const todosReducer = (state, action) => {
  const handlers = {
    ADD_TODO: (state, action) => [...state, action.payload],
    REMOVE_TODO: (state, action) => 
      state.filter(todo => todo.id !== action.payload),
    TOGGLE_TODO: (state, action) =>
      state.map(todo => 
        todo.id === action.payload 
          ? { ...todo, completed: !todo.completed }
          : todo
      )
  }
  
  const handler = handlers[action.type]
  return handler ? handler(state, action) : state
}
```

## 8. 事件处理优化

```javascript
// 统一事件处理器
const FormComponent = () => {
  const [formData, setFormData] = useState({})
  
  const fieldHandlers = {
    input: (name, value) => ({ [name]: value }),
    checkbox: (name, checked) => ({ [name]: checked }),
    select: (name, value) => ({ [name]: value })
  }
  
  const handleFieldChange = (type, name, value) => {
    const handler = fieldHandlers[type]
    if (handler) {
      setFormData(prev => ({ ...prev, ...handler(name, value) }))
    }
  }
  
  return (
    <form>
      <input 
        onChange={(e) => handleFieldChange('input', 'username', e.target.value)}
      />
      <input 
        type="checkbox"
        onChange={(e) => handleFieldChange('checkbox', 'agree', e.target.checked)}
      />
    </form>
  )
}
```

这些方法可以让前端代码更加简洁、可维护，同时提高代码的可读性和扩展性。选择哪种方法主要取决于具体的业务场景和团队偏好。