让我为你随机生成一个JavaScript知识点！

今天我们来深入学习：**JavaScript 闭包（Closure）**

## JavaScript 闭包详解

### 什么是闭包？

闭包是JavaScript中一个非常重要且强大的概念。简单来说，**闭包就是函数和其词法环境的组合**。当一个内部函数可以访问外部函数的变量时，就形成了闭包。

### 闭包的工作原理

在JavaScript中，当函数执行完毕后，通常其内部的变量会被垃圾回收。但是，如果有内部函数引用了外部函数的变量，这些变量就会被"保存"下来，形成闭包。

### 核心概念理解

**1. 词法作用域**

```javascript
function outer() {
    let message = "Hello from outer function";
    
    function inner() {
        console.log(message); // 可以访问外部函数的变量
    }
    
    return inner;
}

const closureFunc = outer();
closureFunc(); // 输出: "Hello from outer function"
```

**2. 变量保持活跃**

```javascript
function counter() {
    let count = 0;
    
    return function() {
        count++;
        return count;
    };
}

const myCounter = counter();
console.log(myCounter()); // 1
console.log(myCounter()); // 2
console.log(myCounter()); // 3
```

让我创建一个交互式的闭包演示来帮助你更好地理解：### 闭包核心要点总结

**1. 什么时候产生闭包？**

- 内部函数引用了外部函数的变量
- 内部函数被返回或传递到外部作用域
- 外部函数执行完毕后，内部函数仍然可以访问外部变量

**2. 闭包的特点：**

- **变量私有化**：外部无法直接访问内部变量
- **数据持久化**：变量不会被垃圾回收
- **状态保持**：每个闭包都有自己的环境记录

**3. 实际应用场景：**

```javascript
// 1. 数据封装
function createUser(name) {
    let userName = name;
    let loginCount = 0;
    
    return {
        login() {
            loginCount++;
            return `${userName} 登录了 ${loginCount} 次`;
        },
        getName() {
            return userName;
        }
    };
}

// 2. 函数柯里化
function multiply(a) {
    return function(b) {
        return a * b;
    };
}
const double = multiply(2);
console.log(double(5)); // 10

// 3. 延迟执行
function delayed(fn, delay) {
    return function(...args) {
        setTimeout(() => fn.apply(this, args), delay);
    };
}
```

**4. 性能考虑：**

- 闭包会保持对外部变量的引用，可能导致内存泄漏
- 在不需要时及时清理引用
- 避免在循环中创建大量闭包

**5. 常见面试题：**

- 解释闭包的工作原理
- 循环中的闭包陷阱
- 闭包与作用域链的关系
- 如何避免闭包导致的内存泄漏

试试上面的交互式演示，通过不同的示例来加深对闭包的理解！闭包是JavaScript中非常强大的特性，