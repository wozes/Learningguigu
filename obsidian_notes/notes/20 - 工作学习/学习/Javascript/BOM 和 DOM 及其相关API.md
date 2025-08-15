JavaScript中的BOM（Browser Object Model，浏览器对象模型）是浏览器提供的一套API，用于与浏览器环境进行交互。BOM提供了访问和操作浏览器窗口、文档、历史记录等功能的接口。

## 核心BOM对象

### 1. Window对象

Window对象是BOM的核心，代表浏览器窗口，也是全局对象。

**主要属性和方法：**

- `window.innerWidth/innerHeight` - 视口尺寸
- `window.outerWidth/outerHeight` - 浏览器窗口尺寸
- `window.location` - 当前页面URL信息
- `window.navigator` - 浏览器信息
- `window.history` - 浏览历史
- `window.document` - DOM文档对象

**常用方法：**

```javascript
// 弹窗方法
window.alert('提示信息');
window.confirm('确认信息'); // 返回boolean
window.prompt('输入提示', '默认值'); // 返回字符串或null

// 定时器
let timer = setTimeout(() => {}, 1000);
let interval = setInterval(() => {}, 1000);
clearTimeout(timer);
clearInterval(interval);

// 窗口操作
window.open('url', '_blank', 'width=500,height=400');
window.close();
window.focus();
window.blur();
```

### 2. Location对象

用于获取和操作当前页面的URL信息。

```javascript
// 假设当前URL: https://example.com:8080/path?query=value#section
console.log(location.href);      // 完整URL
console.log(location.protocol);  // "https:"
console.log(location.host);      // "example.com:8080"
console.log(location.hostname);  // "example.com"
console.log(location.port);      // "8080"
console.log(location.pathname);  // "/path"
console.log(location.search);    // "?query=value"
console.log(location.hash);      // "#section"

// 页面跳转
location.href = 'https://newsite.com';
location.assign('https://newsite.com');
location.replace('https://newsite.com'); // 不会在历史记录中留下记录
location.reload(); // 刷新页面
```

### 3. Navigator对象

提供浏览器和系统相关信息。

```javascript
console.log(navigator.userAgent);    // 用户代理字符串
console.log(navigator.platform);     // 操作系统平台
console.log(navigator.language);     // 浏览器语言
console.log(navigator.languages);    // 支持的语言列表
console.log(navigator.cookieEnabled); // 是否启用cookie
console.log(navigator.onLine);       // 是否在线
console.log(navigator.geolocation);  // 地理位置API

// 检测浏览器特性
if ('serviceWorker' in navigator) {
    // 支持Service Worker
}
```

### 4. History对象

管理浏览器的会话历史记录。

```javascript
console.log(history.length); // 历史记录条数

// 导航方法
history.back();    // 后退
history.forward(); // 前进
history.go(-2);    // 前进/后退指定步数

// HTML5 History API
history.pushState({data: 'value'}, 'title', '/new-url');
history.replaceState({data: 'new'}, 'title', '/updated-url');

// 监听历史变化
window.addEventListener('popstate', (event) => {
    console.log('历史状态改变:', event.state);
});
```

### 5. Screen对象

提供屏幕相关信息。

```javascript
console.log(screen.width);         // 屏幕宽度
console.log(screen.height);        // 屏幕高度
console.log(screen.availWidth);    // 可用屏幕宽度
console.log(screen.availHeight);   // 可用屏幕高度
console.log(screen.colorDepth);    // 颜色深度
console.log(screen.pixelDepth);    // 像素深度
console.log(screen.orientation);   // 屏幕方向（移动设备）
```

## 实用的BOM API

### 本地存储

```javascript
// localStorage - 持久存储
localStorage.setItem('key', 'value');
let value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();

// sessionStorage - 会话存储
sessionStorage.setItem('key', 'value');
let sessionValue = sessionStorage.getItem('key');
```

### 框架和窗口

```javascript
// 处理iframe
if (window.parent !== window.self) {
    // 当前页面在iframe中
    window.parent.postMessage('消息', '*');
}

// 监听来自其他窗口的消息
window.addEventListener('message', (event) => {
    console.log('收到消息:', event.data);
    console.log('来源:', event.origin);
});
```

### 页面可见性API

```javascript
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('页面被隐藏');
    } else {
        console.log('页面变为可见');
    }
});
```

## 实际应用示例

```javascript
// 响应式设计辅助
function getViewportInfo() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        orientation: screen.orientation ? screen.orientation.angle : 0
    };
}

// URL参数解析
function getUrlParams() {
    const params = new URLSearchParams(location.search);
    const result = {};
    for (let [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// 浏览器兼容性检测
function getBrowserInfo() {
    const ua = navigator.userAgent;
    return {
        isChrome: ua.includes('Chrome'),
        isSafari: ua.includes('Safari') && !ua.includes('Chrome'),
        isFirefox: ua.includes('Firefox'),
        isMobile: /Mobile|Android|iPhone|iPad/.test(ua)
    };
}
```

BOM提供了丰富的浏览器交互能力，但需要注意的是，不同浏览器对某些API的支持可能存在差异，在使用时最好进行特性检测。现代Web开发中，很多BOM功能已经有了更标准化的替代方案，比如Fetch API替代XMLHttpRequest，Intersection Observer替代scroll事件等。

DOM（Document Object Model，文档对象模型）是HTML和XML文档的编程接口，它将文档表示为一个树形结构，让JavaScript能够访问和操作页面内容、结构和样式。

## DOM树结构

DOM将HTML文档表示为节点树：

```
Document
└── html (Element)
    ├── head (Element)
    │   ├── title (Element)
    │   │   └── "页面标题" (Text)
    │   └── meta (Element)
    └── body (Element)
        ├── div (Element)
        │   └── "内容" (Text)
        └── p (Element)
            └── "段落" (Text)
```

## 核心DOM对象类型

### 1. Document对象

文档的根对象，提供访问和操作整个文档的接口。

```javascript
// 获取文档信息
console.log(document.title);           // 页面标题
console.log(document.URL);             // 完整URL
console.log(document.domain);          // 域名
console.log(document.referrer);        // 来源页面
console.log(document.lastModified);    // 最后修改时间
console.log(document.readyState);      // 文档状态: loading/interactive/complete

// 文档ready状态
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM构建完成');
});

// 创建新元素
const newDiv = document.createElement('div');
const textNode = document.createTextNode('文本内容');
const fragment = document.createDocumentFragment();
```

### 2. Element对象

表示HTML元素，是DOM中最常用的对象类型。

```javascript
// 获取元素
const element = document.getElementById('myId');
const elements = document.getElementsByClassName('myClass');
const tags = document.getElementsByTagName('div');
const selected = document.querySelector('.class #id');
const allSelected = document.querySelectorAll('div.class');

// 元素属性操作
element.getAttribute('data-value');
element.setAttribute('data-value', 'new value');
element.removeAttribute('data-value');
element.hasAttribute('data-value');

// HTML属性的JavaScript属性映射
element.id = 'newId';
element.className = 'newClass';
element.src = 'image.jpg';
element.href = 'https://example.com';

// 内容操作
element.innerHTML = '<span>HTML内容</span>';
element.textContent = '纯文本内容';
element.innerText = '可见文本内容';
element.outerHTML = '<div>替换整个元素</div>';
```

### 3. Node对象

DOM树中所有对象的基类。

```javascript
// 节点类型
console.log(element.nodeType);    // 1: Element, 3: Text, 8: Comment, 9: Document
console.log(element.nodeName);    // 标签名（大写）
console.log(element.nodeValue);   // 节点值（对元素节点为null）

// 节点关系
const parent = element.parentNode;
const children = element.childNodes;        // 包含所有类型的子节点
const elementChildren = element.children;   // 只包含元素节点
const firstChild = element.firstChild;
const lastChild = element.lastChild;
const nextSibling = element.nextSibling;
const previousSibling = element.previousSibling;

// 元素特定的关系属性
const firstElementChild = element.firstElementChild;
const lastElementChild = element.lastElementChild;
const nextElementSibling = element.nextElementSibling;
const previousElementSibling = element.previousElementSibling;
```

## 主要DOM API分类

### 1. 元素选择API

```javascript
// 传统方法
document.getElementById('id');
document.getElementsByClassName('class');
document.getElementsByTagName('tag');
document.getElementsByName('name');

// 现代选择器API（推荐）
document.querySelector('#id .class > tag');  // 返回第一个匹配元素
document.querySelectorAll('.class');         // 返回NodeList

// 元素匹配检测
element.matches('.class:hover');             // 检查元素是否匹配选择器
element.closest('.parent-class');            // 向上查找最近的匹配祖先元素
```

### 2. 元素操作API

```javascript
// 创建和插入
const div = document.createElement('div');
const text = document.createTextNode('文本');
div.appendChild(text);

// 插入方法
parent.appendChild(newElement);              // 添加到末尾
parent.insertBefore(newElement, referenceElement); // 插入到指定元素前
parent.replaceChild(newElement, oldElement); // 替换子元素
parent.removeChild(element);                 // 删除子元素

// 现代插入方法
element.append(node1, node2, 'text');        // 支持多个参数和文本
element.prepend(node);                       // 插入到开头
element.before(node);                        // 插入到元素前
element.after(node);                         // 插入到元素后
element.replaceWith(newElement);             // 替换元素本身
element.remove();                            // 删除元素本身

// 克隆元素
const clone = element.cloneNode(true);       // true: 深克隆，false: 浅克隆
```

### 3. 样式和类操作API

```javascript
// CSS类操作
element.classList.add('class1', 'class2');
element.classList.remove('class1');
element.classList.toggle('active');         // 切换类
element.classList.contains('active');       // 检查是否包含类
element.classList.replace('old', 'new');    // 替换类

// 内联样式操作
element.style.color = 'red';
element.style.fontSize = '16px';
element.style.backgroundColor = 'blue';

// 批量设置样式
Object.assign(element.style, {
    color: 'red',
    fontSize: '16px',
    margin: '10px'
});

// 获取计算样式
const computedStyle = window.getComputedStyle(element);
console.log(computedStyle.color);
console.log(computedStyle.getPropertyValue('font-size'));
```

### 4. 事件API

```javascript
// 添加事件监听器
element.addEventListener('click', handleClick);
element.addEventListener('click', handleClick, { once: true }); // 只执行一次
element.addEventListener('click', handleClick, { passive: true }); // 被动监听

// 事件处理函数
function handleClick(event) {
    event.preventDefault();    // 阻止默认行为
    event.stopPropagation();   // 阻止事件冒泡
    event.stopImmediatePropagation(); // 阻止其他监听器执行
    
    console.log(event.target);      // 触发事件的元素
    console.log(event.currentTarget); // 绑定事件的元素
    console.log(event.type);        // 事件类型
}

// 移除事件监听器
element.removeEventListener('click', handleClick);

// 自定义事件
const customEvent = new CustomEvent('myEvent', {
    detail: { data: 'custom data' },
    bubbles: true,
    cancelable: true
});
element.dispatchEvent(customEvent);

// 监听自定义事件
element.addEventListener('myEvent', (e) => {
    console.log(e.detail.data);
});
```

### 5. 表单API

```javascript
// 表单元素访问
const form = document.forms.myForm;         // 通过name获取表单
const input = form.elements.username;       // 通过name获取表单控件

// 表单数据
const formData = new FormData(form);
for (let [key, value] of formData) {
    console.log(key, value);
}

// 表单验证
input.checkValidity();                      // 检查单个元素有效性
form.checkValidity();                       // 检查整个表单有效性
input.setCustomValidity('错误消息');        // 设置自定义验证消息

// 表单事件
form.addEventListener('submit', (e) => {
    e.preventDefault();
    // 处理表单提交
});

input.addEventListener('input', (e) => {
    // 实时输入处理
});
```

### 6. 几何和位置API

```javascript
// 元素尺寸和位置
const rect = element.getBoundingClientRect();
console.log(rect.width, rect.height);       // 元素尺寸
console.log(rect.left, rect.top);           // 相对于视口的位置
console.log(rect.right, rect.bottom);

// 滚动相关
console.log(element.scrollTop);             // 垂直滚动距离
console.log(element.scrollLeft);            // 水平滚动距离
console.log(element.scrollWidth);           // 内容总宽度
console.log(element.scrollHeight);          // 内容总高度

element.scrollIntoView();                    // 滚动到元素可见
element.scrollIntoView({ behavior: 'smooth', block: 'center' });

// 偏移量
console.log(element.offsetWidth);           // 包含边框的宽度
console.log(element.offsetHeight);          // 包含边框的高度
console.log(element.offsetLeft);            // 相对于offsetParent的左偏移
console.log(element.offsetTop);             // 相对于offsetParent的上偏移
```

## 实际应用示例

### 动态内容管理

```javascript
class ContentManager {
    constructor(container) {
        this.container = document.querySelector(container);
    }
    
    addItem(content) {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = content;
        
        // 添加删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', () => {
            item.remove();
        });
        
        item.appendChild(deleteBtn);
        this.container.appendChild(item);
    }
    
    clear() {
        this.container.innerHTML = '';
    }
}
```

### 表单验证器

```javascript
class FormValidator {
    constructor(form) {
        this.form = document.querySelector(form);
        this.setupValidation();
    }
    
    setupValidation() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });
        
        // 实时验证
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = '此字段为必填项';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = '请输入有效的邮箱地址';
        }
        
        this.showFieldError(field, isValid ? '' : message);
        return isValid;
    }
    
    showFieldError(field, message) {
        let errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }
}
```

## 性能优化建议

1. **缓存DOM查询结果**：避免重复查询相同元素
2. **使用DocumentFragment**：批量操作DOM时减少重绘
3. **事件委托**：利用事件冒泡减少事件监听器数量
4. **避免强制同步布局**：读写DOM属性时注意顺序
5. **使用requestAnimationFrame**：动画相关的DOM操作

DOM API功能强大且丰富，掌握这些核心概念和方法能让你高效地操作页面元素，创建动态的用户界面。现代前端框架虽然抽象了很多DOM操作，但理解底层DOM API仍然是前端开发的基础。

刚才介绍的只是BOM和DOM的核心常用功能，实际上还有很多重要的API没有涵盖到。让我补充一些遗漏的重要内容：

## BOM API 补充

### 1. 更多Window对象API

```javascript
// 窗口尺寸和位置
window.moveTo(x, y);           // 移动窗口到指定位置
window.moveBy(deltaX, deltaY); // 相对移动窗口
window.resizeTo(width, height); // 调整窗口大小
window.resizeBy(deltaW, deltaH); // 相对调整窗口大小

// 滚动控制
window.scrollTo(x, y);
window.scrollBy(deltaX, deltaY);
window.scroll(x, y);

// 打印
window.print();

// 窗口状态
window.devicePixelRatio;  // 设备像素比
window.pageXOffset;       // 水平滚动偏移（等同scrollX）
window.pageYOffset;       // 垂直滚动偏移（等同scrollY）
```

### 2. Console对象

```javascript
console.log('普通日志');
console.info('信息');
console.warn('警告');
console.error('错误');
console.debug('调试信息');
console.table(array);      // 以表格形式显示数组/对象
console.group('分组');     // 开始分组
console.groupEnd();        // 结束分组
console.time('timer');     // 开始计时
console.timeEnd('timer');  // 结束计时并显示耗时
console.trace();           // 显示调用栈
console.count('label');    // 计数器
console.clear();           // 清空控制台
```

### 3. 性能相关API

```javascript
// Performance API
performance.now();                    // 高精度时间戳
performance.timing;                   // 页面加载时间信息
performance.navigation;               // 导航信息
performance.getEntries();             // 性能条目
performance.mark('markName');         // 创建性能标记
performance.measure('measureName', 'startMark', 'endMark');

// 内存信息（Chrome）
if (performance.memory) {
    console.log(performance.memory.usedJSHeapSize);
    console.log(performance.memory.totalJSHeapSize);
    console.log(performance.memory.jsHeapSizeLimit);
}
```

### 4. 网络状态API

```javascript
// 在线状态
window.addEventListener('online', () => {
    console.log('网络已连接');
});

window.addEventListener('offline', () => {
    console.log('网络已断开');
});

// Connection API（实验性）
if (navigator.connection) {
    console.log(navigator.connection.effectiveType); // 网络类型
    console.log(navigator.connection.downlink);      // 下行速度
    console.log(navigator.connection.rtt);           // 往返时间
}
```

## DOM API 补充

### 1. 更多选择和遍历API

```javascript
// TreeWalker - 高级DOM遍历
const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    {
        acceptNode: function(node) {
            return node.classList.contains('target') ? 
                NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
    }
);

let node = walker.nextNode();
while (node) {
    console.log(node);
    node = walker.nextNode();
}

// NodeIterator
const iterator = document.createNodeIterator(
    document.body,
    NodeFilter.SHOW_TEXT
);

// Range API - 选择和操作文档片段
const range = document.createRange();
range.selectNode(element);
range.deleteContents();
range.insertNode(newElement);

// Selection API - 用户选择
const selection = window.getSelection();
console.log(selection.toString());        // 选中的文本
selection.removeAllRanges();             // 清除选择
selection.selectAllChildren(element);     // 选择元素的所有子节点
```

### 2. 表单和输入增强API

```javascript
// HTML5表单验证
input.validity.valid;           // 是否有效
input.validity.valueMissing;    // 是否缺少必需值
input.validity.typeMismatch;    // 类型不匹配
input.validity.patternMismatch; // 模式不匹配
input.validationMessage;        // 验证消息

// 文件API
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    for (let file of files) {
        console.log(file.name, file.size, file.type);
        
        // 读取文件
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log(e.target.result);
        };
        reader.readAsText(file);
        // reader.readAsDataURL(file);
        // reader.readAsArrayBuffer(file);
    }
});
```

### 3. 拖拽API

```javascript
// 使元素可拖拽
element.draggable = true;

// 拖拽事件
element.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', element.id);
    e.dataTransfer.effectAllowed = 'move';
});

// 放置目标
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault(); // 允许放置
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(id);
    dropZone.appendChild(draggedElement);
});
```

### 4. 现代DOM观察API

```javascript
// MutationObserver - 观察DOM变化
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        console.log('DOM变化:', mutation.type);
        if (mutation.type === 'childList') {
            console.log('子节点变化:', mutation.addedNodes, mutation.removedNodes);
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    characterData: true
});

// IntersectionObserver - 观察元素进入/离开视口
const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('元素进入视口:', entry.target);
        }
    });
}, {
    threshold: 0.5,
    rootMargin: '10px'
});

intersectionObserver.observe(element);

// ResizeObserver - 观察元素尺寸变化
const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(entry => {
        console.log('尺寸变化:', entry.contentRect);
    });
});

resizeObserver.observe(element);
```

## 现代Web API（与BOM/DOM相关）

### 1. Fetch API

```javascript
// 替代XMLHttpRequest
fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// 带选项的请求
fetch('/api/data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({key: 'value'})
});
```

### 2. Web Workers

```javascript
// 主线程
const worker = new Worker('worker.js');
worker.postMessage({data: 'hello'});
worker.onmessage = (e) => {
    console.log('收到worker消息:', e.data);
};

// worker.js
self.onmessage = (e) => {
    // 处理消息
    self.postMessage({result: 'processed'});
};
```

### 3. Service Worker

```javascript
// 注册Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('SW注册成功:', registration);
        });
}
```

### 4. Web Storage扩展

```javascript
// IndexedDB - 客户端数据库
const request = indexedDB.open('MyDB', 1);
request.onsuccess = (e) => {
    const db = e.target.result;
    // 数据库操作
};

// Cache API - 缓存管理
caches.open('v1').then(cache => {
    cache.addAll(['/page1', '/page2']);
});
```

### 5. 媒体API

```javascript
// getUserMedia - 访问摄像头/麦克风
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    videoElement.srcObject = stream;
});

// Web Audio API
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
```

### 6. 地理位置和传感器

```javascript
// Geolocation API
navigator.geolocation.getCurrentPosition((position) => {
    console.log(position.coords.latitude, position.coords.longitude);
});

// 设备方向（移动设备）
window.addEventListener('deviceorientation', (e) => {
    console.log('方向:', e.alpha, e.beta, e.gamma);
});
```

### 7. 通知和权限

```javascript
// 通知API
if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            new Notification('标题', {
                body: '内容',
                icon: '/icon.png'
            });
        }
    });
}

// 权限API
navigator.permissions.query({name: 'notifications'})
    .then(result => {
        console.log('通知权限:', result.state);
    });
```

这些只是Web API的一部分，还有很多其他重要的API，如：

- **支付API** (Payment Request API)
- **共享API** (Web Share API)
- **全屏API** (Fullscreen API)
- **剪贴板API** (Clipboard API)
- **振动API** (Vibration API)
- **电池API** (Battery API)
- **画布API** (Canvas API)
- **WebGL API**
- **WebRTC API**
- **WebSocket API**

每个API都有其特定的使用场景，现代Web开发需要根据项目需求选择合适的API组合使用。