# JSDoc完全指南

## 什么是JSDoc

JSDoc是一个用于JavaScript的API文档生成器，类似于Java的Javadoc。它允许开发者直接在JavaScript代码中使用特殊的注释来描述函数、变量、类等，然后自动生成格式化的HTML文档。同时，现代IDE和TypeScript编译器也能利用JSDoc注释提供更好的代码提示和类型检查。

## 基本语法

JSDoc注释以`/**`开始，以`*/`结束，每行通常以`*`开头：

```javascript
/**
 * 这是一个JSDoc注释块
 * @param {string} name - 参数描述
 * @returns {boolean} 返回值描述
 */
function example(name) {
    return true;
}
```

## 核心标签

### @param - 参数文档

```javascript
/**
 * 计算两个数的和
 * @param {number} a - 第一个数字
 * @param {number} b - 第二个数字
 * @param {Object} [options] - 可选的配置对象
 * @param {boolean} [options.round=false] - 是否四舍五入结果
 * @returns {number} 两数之和
 */
function add(a, b, options = {}) {
    const result = a + b;
    return options.round ? Math.round(result) : result;
}
```

### @returns/@return - 返回值文档

```javascript
/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 包含用户信息的Promise
 * @returns {Promise<Object>} user - 用户对象
 * @returns {Promise<string>} user.name - 用户名
 * @returns {Promise<string>} user.email - 用户邮箱
 */
async function getUserInfo(userId) {
    // 实现代码
}
```

### @throws/@exception - 异常文档

```javascript
/**
 * 除法运算
 * @param {number} dividend - 被除数
 * @param {number} divisor - 除数
 * @returns {number} 商
 * @throws {Error} 当除数为0时抛出错误
 */
function divide(dividend, divisor) {
    if (divisor === 0) {
        throw new Error('除数不能为0');
    }
    return dividend / divisor;
}
```

### @example - 示例代码

```javascript
/**
 * 格式化日期
 * @param {Date} date - 要格式化的日期
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期字符串
 * @example
 * // 基本用法
 * formatDate(new Date(), 'YYYY-MM-DD');
 * // 返回: "2023-12-25"
 * 
 * @example
 * // 包含时间
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
 * // 返回: "2023-12-25 15:30:45"
 */
function formatDate(date, format) {
    // 实现代码
}
```

## 类型定义

### 基本类型

```javascript
/**
 * @param {string} name - 字符串类型
 * @param {number} age - 数字类型
 * @param {boolean} isActive - 布尔类型
 * @param {Array} items - 数组类型
 * @param {Object} config - 对象类型
 * @param {Function} callback - 函数类型
 * @param {*} anything - 任意类型
 * @param {null} empty - null类型
 * @param {undefined} notDefined - undefined类型
 */
```

### 复杂类型

```javascript
/**
 * @param {string|number} id - 联合类型
 * @param {Array<string>} names - 字符串数组
 * @param {Object<string, number>} scores - 键为字符串，值为数字的对象
 * @param {function(string): boolean} validator - 函数类型详细定义
 * @param {...string} args - 剩余参数
 * @param {string} [optionalParam] - 可选参数
 * @param {string} [optionalParam="default"] - 有默认值的可选参数
 */
```

### 自定义类型

```javascript
/**
 * 用户对象
 * @typedef {Object} User
 * @property {string} id - 用户ID
 * @property {string} name - 用户名
 * @property {string} email - 邮箱
 * @property {number} age - 年龄
 * @property {Array<string>} roles - 用户角色列表
 */

/**
 * 创建用户
 * @param {User} userData - 用户数据
 * @returns {User} 创建的用户对象
 */
function createUser(userData) {
    // 实现代码
}
```

## 类和对象文档

### 类文档

```javascript
/**
 * 表示一个银行账户
 * @class
 * @classdesc 提供基本的银行账户操作功能
 */
class BankAccount {
    /**
     * 创建银行账户
     * @constructor
     * @param {string} accountNumber - 账户号码
     * @param {number} [initialBalance=0] - 初始余额
     */
    constructor(accountNumber, initialBalance = 0) {
        /**
         * 账户号码
         * @type {string}
         * @readonly
         */
        this.accountNumber = accountNumber;
        
        /**
         * 当前余额
         * @type {number}
         * @private
         */
        this._balance = initialBalance;
    }
    
    /**
     * 获取账户余额
     * @returns {number} 当前余额
     */
    getBalance() {
        return this._balance;
    }
    
    /**
     * 存款
     * @param {number} amount - 存款金额
     * @throws {Error} 当金额小于等于0时抛出错误
     */
    deposit(amount) {
        if (amount <= 0) {
            throw new Error('存款金额必须大于0');
        }
        this._balance += amount;
    }
    
    /**
     * 取款
     * @param {number} amount - 取款金额
     * @throws {Error} 当金额大于余额时抛出错误
     */
    withdraw(amount) {
        if (amount > this._balance) {
            throw new Error('余额不足');
        }
        this._balance -= amount;
    }
}
```

### 继承文档

```javascript
/**
 * 储蓄账户
 * @class
 * @extends BankAccount
 * @classdesc 带有利息功能的储蓄账户
 */
class SavingsAccount extends BankAccount {
    /**
     * 创建储蓄账户
     * @constructor
     * @param {string} accountNumber - 账户号码
     * @param {number} [initialBalance=0] - 初始余额
     * @param {number} [interestRate=0.01] - 年利率
     */
    constructor(accountNumber, initialBalance = 0, interestRate = 0.01) {
        super(accountNumber, initialBalance);
        
        /**
         * 年利率
         * @type {number}
         */
        this.interestRate = interestRate;
    }
    
    /**
     * 计算并添加利息
     * @override
     */
    addInterest() {
        const interest = this._balance * this.interestRate;
        this._balance += interest;
    }
}
```

## 模块文档

### ES6模块

```javascript
/**
 * 数学工具模块
 * @module MathUtils
 * @description 提供各种数学计算功能
 * @version 1.0.0
 * @author 张三 <zhangsan@example.com>
 * @since 2023-01-01
 */

/**
 * 圆周率常量
 * @constant {number}
 * @default 3.14159265359
 */
export const PI = 3.14159265359;

/**
 * 计算圆的面积
 * @function
 * @param {number} radius - 圆的半径
 * @returns {number} 圆的面积
 * @memberof module:MathUtils
 */
export function calculateCircleArea(radius) {
    return PI * radius * radius;
}

/**
 * 数学运算结果
 * @typedef {Object} MathResult
 * @property {number} result - 计算结果
 * @property {string} operation - 执行的操作
 * @property {Date} timestamp - 计算时间
 * @memberof module:MathUtils
 */

/**
 * 执行数学运算
 * @param {number} a - 第一个操作数
 * @param {number} b - 第二个操作数
 * @param {string} operation - 运算符 (+, -, *, /)
 * @returns {MathResult} 运算结果对象
 * @memberof module:MathUtils
 */
export function calculate(a, b, operation) {
    // 实现代码
}
```

### CommonJS模块

```javascript
/**
 * 字符串工具模块
 * @module StringUtils
 */

/**
 * 将字符串转换为驼峰命名
 * @param {string} str - 输入字符串
 * @returns {string} 驼峰命名的字符串
 * @example
 * // 转换连字符命名
 * toCamelCase('hello-world'); // 返回: 'helloWorld'
 * 
 * @example
 * // 转换下划线命名
 * toCamelCase('hello_world'); // 返回: 'helloWorld'
 */
function toCamelCase(str) {
    return str.replace(/[-_](.)/g, (match, group1) => group1.toUpperCase());
}

module.exports = {
    toCamelCase
};
```

## 高级标签

### @namespace - 命名空间

```javascript
/**
 * 应用程序工具命名空间
 * @namespace
 */
const AppUtils = {
    /**
     * 日期工具
     * @namespace AppUtils.DateUtils
     */
    DateUtils: {
        /**
         * 格式化日期
         * @memberof AppUtils.DateUtils
         * @param {Date} date - 要格式化的日期
         * @returns {string} 格式化后的日期
         */
        format(date) {
            // 实现代码
        }
    },
    
    /**
     * 字符串工具
     * @namespace AppUtils.StringUtils
     */
    StringUtils: {
        /**
         * 截断字符串
         * @memberof AppUtils.StringUtils
         * @param {string} str - 原字符串
         * @param {number} length - 最大长度
         * @returns {string} 截断后的字符串
         */
        truncate(str, length) {
            // 实现代码
        }
    }
};
```

### @mixin - 混入

```javascript
/**
 * 事件处理混入
 * @mixin
 */
const EventHandlerMixin = {
    /**
     * 添加事件监听器
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理器
     */
    on(event, handler) {
        // 实现代码
    },
    
    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理器
     */
    off(event, handler) {
        // 实现代码
    }
};

/**
 * 按钮组件
 * @class
 * @mixes EventHandlerMixin
 */
class Button {
    constructor() {
        // 混入事件处理功能
        Object.assign(this, EventHandlerMixin);
    }
}
```

### @enum - 枚举

```javascript
/**
 * 用户状态枚举
 * @readonly
 * @enum {string}
 */
const UserStatus = {
    /** 活跃状态 */
    ACTIVE: 'active',
    /** 非活跃状态 */
    INACTIVE: 'inactive',
    /** 已禁用状态 */
    DISABLED: 'disabled',
    /** 待审核状态 */
    PENDING: 'pending'
};
```

### @callback - 回调函数

```javascript
/**
 * 数据处理回调函数
 * @callback DataProcessor
 * @param {*} data - 要处理的数据
 * @param {number} index - 数据索引
 * @returns {*} 处理后的数据
 */

/**
 * 异步操作完成回调
 * @callback AsyncCallback
 * @param {Error|null} error - 错误对象，成功时为null
 * @param {*} result - 操作结果
 */

/**
 * 处理数组数据
 * @param {Array} array - 输入数组
 * @param {DataProcessor} processor - 数据处理函数
 * @returns {Array} 处理后的数组
 */
function processArray(array, processor) {
    return array.map(processor);
}

/**
 * 异步获取数据
 * @param {string} url - 数据URL
 * @param {AsyncCallback} callback - 完成回调
 */
function fetchData(url, callback) {
    // 实现代码
}
```

## 配置和生成

### 配置文件 (jsdoc.json)

```json
{
    "source": {
        "include": ["./src/"],
        "exclude": ["./src/test/"],
        "includePattern": "\\.(js|jsx)$",
        "excludePattern": "\\.min\\.js$"
    },
    "opts": {
        "destination": "./docs/",
        "recurse": true,
        "readme": "./README.md"
    },
    "plugins": [
        "plugins/markdown",
        "plugins/summarize"
    ],
    "templates": {
        "cleverLinks": false,
        "monospaceLinks": false
    },
    "markdown": {
        "parser": "gfm",
        "hardwrap": true
    }
}
```

### 生成文档

```bash
# 安装JSDoc
npm install -g jsdoc

# 生成文档
jsdoc -c jsdoc.json

# 或者直接指定文件
jsdoc src/**/*.js -d docs/
```

## 与TypeScript集成

JSDoc可以为TypeScript提供类型信息：

```javascript
/**
 * @template T
 * @param {T[]} array - 输入数组
 * @param {function(T): boolean} predicate - 过滤条件
 * @returns {T[]} 过滤后的数组
 */
function filter(array, predicate) {
    return array.filter(predicate);
}

/**
 * @template T, U
 * @param {T[]} array - 输入数组
 * @param {function(T): U} mapper - 映射函数
 * @returns {U[]} 映射后的数组
 */
function map(array, mapper) {
    return array.map(mapper);
}
```

## 最佳实践

### 1. 保持文档与代码同步

```javascript
/**
 * 用户服务类
 * @class
 * @description 负责用户相关的业务逻辑处理
 * @version 2.1.0
 * @since 1.0.0
 */
class UserService {
    /**
     * 创建用户
     * @param {Object} userData - 用户数据
     * @param {string} userData.name - 用户名（必填）
     * @param {string} userData.email - 邮箱（必填）
     * @param {number} [userData.age] - 年龄（可选）
     * @returns {Promise<User>} 创建的用户对象
     * @throws {ValidationError} 当用户数据验证失败时
     * @throws {DatabaseError} 当数据库操作失败时
     * @example
     * const userService = new UserService();
     * const user = await userService.createUser({
     *     name: '张三',
     *     email: 'zhangsan@example.com',
     *     age: 25
     * });
     */
    async createUser(userData) {
        // 实现代码
    }
}
```

### 2. 使用一致的命名约定

```javascript
/**
 * API响应数据结构
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 请求是否成功
 * @property {*} data - 响应数据
 * @property {string} [message] - 错误消息（失败时）
 * @property {number} code - 状态码
 */

/**
 * 用户数据传输对象
 * @typedef {Object} UserDTO
 * @property {string} id - 用户ID
 * @property {string} name - 用户名
 * @property {string} email - 邮箱
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
```

### 3. 合理使用标签

```javascript
/**
 * HTTP客户端工具类
 * @class
 * @description 提供HTTP请求的封装和错误处理
 * @author 开发团队 <dev@example.com>
 * @version 1.2.0
 * @since 1.0.0
 * @see {@link https://example.com/api-docs|API文档}
 * @todo 添加请求缓存功能
 * @todo 支持文件上传
 */
class HttpClient {
    /**
     * 发送GET请求
     * @param {string} url - 请求URL
     * @param {Object} [options] - 请求选项
     * @param {Object} [options.headers] - 请求头
     * @param {number} [options.timeout=5000] - 超时时间（毫秒）
     * @returns {Promise<ApiResponse>} API响应
     * @throws {NetworkError} 网络错误
     * @throws {TimeoutError} 请求超时
     * @deprecated 请使用 request() 方法替代
     * @example
     * const client = new HttpClient();
     * const response = await client.get('/api/users');
     */
    async get(url, options = {}) {
        // 实现代码
    }
}
```

## 工具和IDE集成

### VS Code配置

在VS Code中，JSDoc注释会自动提供智能提示和类型检查。可以在设置中启用：

```json
{
    "typescript.suggest.jsdoc": true,
    "javascript.suggest.jsdoc": true,
    "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

### ESLint规则

```json
{
    "plugins": ["jsdoc"],
    "rules": {
        "jsdoc/check-alignment": "error",
        "jsdoc/check-param-names": "error",
        "jsdoc/check-tag-names": "error",
        "jsdoc/check-types": "error",
        "jsdoc/require-description": "error",
        "jsdoc/require-param": "error",
        "jsdoc/require-param-description": "error",
        "jsdoc/require-returns": "error",
        "jsdoc/require-returns-description": "error"
    }
}
```

## 总结

JSDoc是JavaScript项目中不可或缺的文档化工具，它的优势包括：

1. **代码即文档**：文档直接写在代码中，便于维护和同步
2. **IDE支持**：现代IDE能够利用JSDoc提供更好的代码提示
3. **类型检查**：配合TypeScript使用可以提供静态类型检查
4. **自动生成**：可以自动生成美观的HTML文档
5. **标准化**：提供了标准的文档格式和约定

通过合理使用JSDoc，可以显著提高代码的可读性和可维护性，特别是在团队开发中，良好的文档能够减少沟通成本，提高开发效率。

建议在项目中逐步引入JSDoc，从核心API开始，逐步完善整个项目的文档体系。