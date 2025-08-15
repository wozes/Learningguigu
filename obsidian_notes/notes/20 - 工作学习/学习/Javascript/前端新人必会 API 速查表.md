如果你刚入职前端工作 3 个月，除了 `postMessage` 这种跨域通信 API，还有一批 **高频实用、上手快、能立刻提升工作效率** 的原生 JavaScript API 值得优先了解。  
我帮你分几个类别列一下，并附上简单用途说明，方便你快速查漏补缺。

---

## 1. **DOM 操作相关**

这些 API 是操作页面元素的基础，前端必备。

- **`querySelector` / `querySelectorAll`**  
    通过 CSS 选择器获取 DOM 元素，比 `getElementById` 灵活。
    
- **`classList`**  
    操作元素类名的现代 API：`add`、`remove`、`toggle`、`contains`。
    
- **`dataset`**  
    获取或设置 `data-*` 自定义属性。
    
- **`closest`**  
    向上查找匹配选择器的父元素，事件代理很常用。
    
- **`createElement` / `append` / `prepend` / `remove`**  
    创建、插入、删除 DOM 元素。
    

---

## 2. **事件与交互**

学好事件机制，能写出更灵活的交互。

- **`addEventListener`**（熟悉第三个参数 `options`）  
    如 `{ once: true, passive: true, capture: true }` 的用法。
    
- **`CustomEvent`**  
    自定义事件机制，用于组件内部通信。
    
- **`dispatchEvent`**  
    手动触发事件。
    
- **事件委托模式**（利用 `event.target` / `event.currentTarget`）
    

---

## 3. **存储相关**

前端数据缓存是性能优化的重要环节。

- **`localStorage` / `sessionStorage`**  
    键值对存储，持久化或会话级别。
    
- **`indexedDB`**  
    适合存大量结构化数据的本地数据库。
    
- **`Cookies`**（配合 `document.cookie` 或更安全的 `HttpOnly`）
    

---

## 4. **网络请求**

除了 `fetch`，还有一些额外的接口值得了解。

- **`fetch`**（掌握 `AbortController` 取消请求的用法）
    
- **`FormData`**  
    构造表单数据，配合 `fetch` 发送文件上传。
    
- **`URLSearchParams`**  
    处理 URL 查询参数的现代 API。
    
- **`WebSocket`**  
    实时双向通信。
    

---

## 5. **时间与定时**

控制异步执行和动画。

- **`setTimeout` / `setInterval`**（理解清除机制）
    
- **`requestAnimationFrame`**（动画优化）
    
- **`performance.now()`**（高精度时间测量）
    

---

## 6. **文件与数据处理**

常见于上传、下载、导出等功能。

- **`Blob` / `File`**  
    处理二进制数据与文件。
    
- **`FileReader`**  
    读取本地文件内容。
    
- **`URL.createObjectURL` / `URL.revokeObjectURL`**  
    创建临时文件 URL。
    

---

## 7. **浏览器环境相关**

这些 API 让你能获取环境信息或做一些控制。

- **`navigator`**  
    检测浏览器信息、网络状态、地理位置等。
    
- **`history.pushState` / `replaceState` / `popstate`**  
    单页应用路由的基础。
    
- **`IntersectionObserver`**  
    元素可见性监听（懒加载、曝光统计必备）。
    
- **`ResizeObserver`**  
    元素尺寸变化监听。
    

---

## 8. **异步与并发**

掌握这些能让你写的代码更稳定。

- **`Promise`**（包括 `Promise.all`、`Promise.race`、`Promise.any`）
    
- **`async / await`**  
    语法糖但更易读。
    
- **`AbortController`**  
    中止 `fetch`、`EventListener` 等可取消操作。
    

---

💡 **学习建议**：

1. 先从日常用得上的开始，比如 `querySelector`、`fetch`、`localStorage`、`classList`。
    
2. 再去接触稍微高级的，如 `IntersectionObserver`、`CustomEvent`。
    
3. 最后了解偏性能和优化的，如 `requestAnimationFrame`、`ResizeObserver`。
    

---

如果你愿意，我可以帮你做一份 **「前端新人必会 API 速查表（带示例代码）」** Markdown 文档，让你工作时直接查用。这样你每天工作效率会翻倍。  
你要我帮你整理吗？

好的，那我帮你整理一份 **「前端新人必会 API 速查表」** 的 Markdown 文档，带简短示例，方便直接在工作中查用。


---

````markdown
# 前端新人必会 API 速查表

> 适合刚入职 1-6 个月的前端开发工程师  
> 每个 API 都包含简介 + 示例，方便直接使用。

---

## 1. DOM 操作

### `querySelector` / `querySelectorAll`
```javascript
const el = document.querySelector('.btn');
const list = document.querySelectorAll('.item');
````

### `classList`

```javascript
el.classList.add('active');
el.classList.remove('hidden');
el.classList.toggle('open');
el.classList.contains('selected'); // true/false
```

### `dataset`

```javascript
el.dataset.userId = '123';
console.log(el.dataset.userId);
```

### `closest`

```javascript
const card = event.target.closest('.card');
```

### `createElement` / `append` / `prepend` / `remove`

```javascript
const div = document.createElement('div');
div.textContent = 'Hello';
document.body.append(div);
div.remove();
```

---

## 2. 事件与交互

### `addEventListener`（第三个参数）

```javascript
document.addEventListener('click', handler, { once: true });
```

### `CustomEvent` + `dispatchEvent`

```javascript
const event = new CustomEvent('myEvent', { detail: { foo: 'bar' } });
document.dispatchEvent(event);
document.addEventListener('myEvent', e => console.log(e.detail));
```

---

## 3. 存储相关

### `localStorage` / `sessionStorage`

```javascript
localStorage.setItem('token', 'abc123');
console.log(localStorage.getItem('token'));
localStorage.removeItem('token');
```

### `indexedDB`（简单初始化）

```javascript
const request = indexedDB.open('myDB', 1);
request.onsuccess = e => console.log('DB ready');
```

---

## 4. 网络请求

### `fetch` + `AbortController`

```javascript
const controller = new AbortController();
fetch('/api/data', { signal: controller.signal })
  .then(res => res.json())
  .then(console.log);
controller.abort();
```

### `FormData`

```javascript
const fd = new FormData();
fd.append('file', fileInput.files[0]);
fetch('/upload', { method: 'POST', body: fd });
```

### `URLSearchParams`

```javascript
const params = new URLSearchParams(location.search);
console.log(params.get('id'));
```

---

## 5. 时间与定时

### `setTimeout` / `setInterval`

```javascript
const id = setTimeout(() => console.log('一次性'), 1000);
clearTimeout(id);
```

### `requestAnimationFrame`

```javascript
function animate() {
  // 绘制代码
  requestAnimationFrame(animate);
}
animate();
```

---

## 6. 文件与数据处理

### `Blob` / `File`

```javascript
const blob = new Blob(['Hello'], { type: 'text/plain' });
```

### `FileReader`

```javascript
const reader = new FileReader();
reader.onload = e => console.log(e.target.result);
reader.readAsText(fileInput.files[0]);
```

### `URL.createObjectURL`

```javascript
const url = URL.createObjectURL(fileInput.files[0]);
image.src = url;
```

---

## 7. 浏览器环境相关

### `navigator`

```javascript
console.log(navigator.userAgent);
console.log(navigator.onLine); // 网络状态
```

### `history.pushState` / `replaceState`

```javascript
history.pushState({ page: 1 }, '', '/page1');
```

### `IntersectionObserver`

```javascript
const io = new IntersectionObserver(entries => {
  entries.forEach(e => console.log(e.isIntersecting));
});
io.observe(document.querySelector('#target'));
```

### `ResizeObserver`

```javascript
const ro = new ResizeObserver(entries => {
  console.log(entries[0].contentRect.width);
});
ro.observe(document.querySelector('#box'));
```

---

## 8. 异步与并发

### `Promise.all` / `Promise.race` / `Promise.any`

```javascript
Promise.all([fetch('/a'), fetch('/b')])
  .then(res => console.log('全部完成'));
```

### `async / await`

```javascript
async function load() {
  const res = await fetch('/api');
  console.log(await res.json());
}
```

### `AbortController`

```javascript
const c = new AbortController();
setTimeout(() => c.abort(), 2000);
fetch('/slow-api', { signal: c.signal });
```

---

## 学习建议

1. 先掌握 DOM、事件、`fetch`、`localStorage` 这类高频 API。
    
2. 再学习 `IntersectionObserver`、`ResizeObserver` 等优化相关 API。
    
3. 熟练掌握 `async/await` 与 Promise 并发控制。
    

```

---

如果你愿意，我还可以帮你把这份速查表**加上结构图和常用 API 分类流程图**，这样你可以在公司当作壁纸或者速查海报用，查找效率更高。  
你要我帮你画出来吗？这样看着更直观。
```