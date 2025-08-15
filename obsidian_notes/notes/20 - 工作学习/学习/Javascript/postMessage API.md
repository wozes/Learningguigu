好的，我帮你整理一份 **`postMessage` API 在前端中的详细用法与作用**的 Markdown 文档，包含概念、使用场景、参数说明、安全注意事项以及示例代码，方便直接作为笔记使用。

---

````markdown
# 前端 `postMessage` API 详解

## 1. 概述

`postMessage` 是 HTML5 提供的跨源（Cross-Origin）通信 API，用于安全地在不同窗口、iframe、tab 页或 Web Worker 之间传递消息。  
它突破了浏览器 **同源策略** 的限制，是前端跨文档通信的重要手段。

常用场景：
- **跨域 iframe 通信**（父页面与子页面）
- **跨浏览器标签页通信**（`window.open` 打开的页面）
- **与 Web Worker 通信**
- **第三方嵌入组件（广告、支付等）的数据传递**

---

## 2. 基本语法

```javascript
// 发送消息
otherWindow.postMessage(message, targetOrigin, [transfer]);

// 监听消息
window.addEventListener('message', handler, false);
````

### 参数说明

#### `message`

- 类型：`any`
    
- 要发送的数据，可以是字符串、对象等（对象会自动进行结构化克隆）。
    
- **注意**：不能传递带有循环引用的对象。
    

#### `targetOrigin`

- 类型：`string`
    
- 用于指定目标窗口的源（`protocol://host:port`）。
    
- 常见写法：
    
    - 精确指定：`https://example.com`
        
    - 任意源（不安全）：`*`
        
- **安全建议**：不要用 `*`，防止数据泄露。
    

#### `[transfer]`（可选）

- 类型：`Transferable[]`
    
- 用于传递数据的所有权（如 `ArrayBuffer`），避免拷贝，提升性能。
    

---

## 3. 消息接收与处理

```javascript
window.addEventListener('message', function (event) {
    // 1. 校验来源
    if (event.origin !== 'https://trusted.com') return;

    // 2. 获取消息数据
    console.log('收到消息：', event.data);

    // 3. 获取发送方信息
    console.log('消息来源窗口对象：', event.source);

    // 4. 业务处理...
}, false);
```

### `event` 对象属性

- `data`：发送的消息内容
    
- `origin`：发送方的源（协议+域名+端口）
    
- `source`：发送消息的 `window` 对象
    
- `ports`：MessageChannel 的端口信息（如有）
    

---

## 4. 使用示例

### 4.1 父页面与 iframe 通信

#### 父页面发送

```javascript
const iframe = document.getElementById('myFrame');
iframe.contentWindow.postMessage({ action: 'init', payload: { userId: 123 } }, 'https://child.com');
```

#### 子页面接收

```javascript
window.addEventListener('message', (event) => {
    if (event.origin !== 'https://parent.com') return;
    console.log('子页面收到：', event.data);
});
```

---

### 4.2 反向通信（子页面 → 父页面）

```javascript
window.parent.postMessage('子页面已加载完成', 'https://parent.com');
```

---

### 4.3 两个窗口通信

```javascript
// 页面A
const winB = window.open('https://b.com');
winB.postMessage('Hello from A', 'https://b.com');

// 页面B
window.addEventListener('message', (event) => {
    if (event.origin === 'https://a.com') {
        console.log('B收到：', event.data);
    }
});
```

---

## 5. 安全注意事项

1. **严格指定 `targetOrigin`**  
    永远不要使用 `*` 作为生产环境的 `targetOrigin`，防止任意网站接收敏感数据。
    
2. **校验 `event.origin`**  
    接收消息时必须验证来源，拒绝未知源的数据。
    
3. **避免执行不可信数据**  
    不要将接收到的数据直接作为脚本执行（避免 XSS）。
    
4. **数据结构化克隆**  
    `postMessage` 会使用结构化克隆算法，不会保留对象方法和原型链。
    

---

## 6. 进阶用法

### 6.1 与 Web Worker 通信

```javascript
// main.js
const worker = new Worker('worker.js');
worker.postMessage({ task: 'calculate', num: 42 });

worker.onmessage = (e) => {
    console.log('主线程收到：', e.data);
};

// worker.js
onmessage = function (e) {
    console.log('Worker收到：', e.data);
    postMessage({ result: e.data.num * 2 });
};
```

---

### 6.2 MessageChannel 双向通信

```javascript
const channel = new MessageChannel();
channel.port1.onmessage = (e) => console.log('端口1收到：', e.data);
channel.port2.onmessage = (e) => console.log('端口2收到：', e.data);

channel.port1.postMessage('来自端口1的消息');
channel.port2.postMessage('来自端口2的消息');
```

---

## 7. 总结

- `postMessage` 是前端跨源通信的核心 API
    
- 主要用于窗口、iframe、Web Worker 之间的数据传递
    
- 安全使用的关键是：
    
    - **发送方**：指定 `targetOrigin`
        
    - **接收方**：验证 `event.origin`
        
- 支持结构化克隆，能传递复杂对象和二进制数据
    

```

---

我也可以帮你在这份文档里加一张 **postMessage 跨域通信流程图**，让内容更直观。这样阅读体验会更好，你需要我帮你加上吗？
```