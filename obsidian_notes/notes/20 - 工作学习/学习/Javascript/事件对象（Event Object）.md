
## 什么是事件对象

事件对象是在事件触发时由浏览器自动创建的一个对象，包含了与该事件相关的所有信息。当事件处理函数被调用时，事件对象会作为第一个参数传递给处理函数。

```javascript
element.addEventListener('click', function(event) {
  // event 就是事件对象
  console.log(event);
});

// 箭头函数写法
element.addEventListener('click', (e) => {
  // 通常简写为 e
  console.log(e);
});
```

## 事件对象的通用属性

### 1. 基础属性

```javascript
element.addEventListener('click', function(e) {
  console.log('事件类型:', e.type);           // "click"
  console.log('目标元素:', e.target);         // 被点击的具体元素
  console.log('当前元素:', e.currentTarget);  // 绑定事件监听器的元素
  console.log('时间戳:', e.timeStamp);        // 事件发生的时间戳
  console.log('是否可取消:', e.cancelable);   // 事件是否可以被取消
  console.log('是否冒泡:', e.bubbles);        // 事件是否会冒泡
});
```

### 2. target vs currentTarget 的区别

```html
<div id="parent">
  <button id="child">点击我</button>
</div>
```

```javascript
document.getElementById('parent').addEventListener('click', function(e) {
  console.log('e.target:', e.target.id);         // "child" (实际被点击的元素)
  console.log('e.currentTarget:', e.currentTarget.id); // "parent" (绑定监听器的元素)
  console.log('this:', this.id);                 // "parent" (与currentTarget相同)
});
```

## 鼠标事件对象

### 鼠标位置相关属性

```javascript
element.addEventListener('click', function(e) {
  // 相对于屏幕的坐标
  console.log('屏幕坐标:', e.screenX, e.screenY);
  
  // 相对于浏览器窗口的坐标
  console.log('窗口坐标:', e.clientX, e.clientY);
  
  // 相对于页面的坐标（包含滚动）
  console.log('页面坐标:', e.pageX, e.pageY);
  
  // 相对于触发事件元素的坐标
  console.log('元素坐标:', e.offsetX, e.offsetY);
});
```

### 鼠标按键和修饰键

```javascript
element.addEventListener('mousedown', function(e) {
  // 鼠标按键
  console.log('按键代码:', e.button);
  // 0: 左键, 1: 中键(滚轮), 2: 右键
  
  console.log('按下的按键:', e.buttons);
  // 1: 左键, 2: 右键, 4: 中键 (可以组合)
  
  // 修饰键
  console.log('Ctrl键:', e.ctrlKey);
  console.log('Shift键:', e.shiftKey);
  console.log('Alt键:', e.altKey);
  console.log('Meta键:', e.metaKey); // Windows键或Mac的Cmd键
});
```

### 实际应用示例

```javascript
// 实现右键菜单
document.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // 阻止默认右键菜单
  
  showCustomMenu(e.clientX, e.clientY);
});

// 实现拖拽功能
let isDragging = false;
let startX, startY;

element.addEventListener('mousedown', function(e) {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    // 移动元素
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }
});

document.addEventListener('mouseup', function(e) {
  isDragging = false;
});
```

## 键盘事件对象

```javascript
document.addEventListener('keydown', function(e) {
  console.log('按键代码:', e.keyCode);    // 已废弃，不推荐使用
  console.log('按键码:', e.code);        // "KeyA", "Digit1", "Space"
  console.log('按键值:', e.key);         // "a", "1", " "
  console.log('字符码:', e.charCode);    // 已废弃
  
  // 修饰键
  console.log('Ctrl:', e.ctrlKey);
  console.log('Shift:', e.shiftKey);
  console.log('Alt:', e.altKey);
  console.log('Meta:', e.metaKey);
  
  // 实用的键盘快捷键检测
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    console.log('保存快捷键被按下');
  }
});
```

### 键盘事件实际应用

```javascript
// 实现搜索框的实时搜索
const searchInput = document.getElementById('search');

searchInput.addEventListener('keyup', function(e) {
  // 忽略功能键
  if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt') {
    return;
  }
  
  // Enter键执行搜索
  if (e.key === 'Enter') {
    performSearch(this.value);
    return;
  }
  
  // Escape键清空搜索
  if (e.key === 'Escape') {
    this.value = '';
    clearSearchResults();
    return;
  }
  
  // 其他键进行实时搜索
  debounceSearch(this.value);
});
```

## 表单事件对象

```javascript
const form = document.getElementById('myForm');
const input = document.getElementById('myInput');

// 输入事件
input.addEventListener('input', function(e) {
  console.log('输入值:', e.target.value);
  console.log('输入类型:', e.inputType); // "insertText", "deleteContentBackward" 等
});

// 改变事件
input.addEventListener('change', function(e) {
  console.log('最终值:', e.target.value);
});

// 表单提交事件
form.addEventListener('submit', function(e) {
  console.log('表单数据:', new FormData(e.target));
  
  // 可以阻止提交
  if (!validateForm()) {
    e.preventDefault();
  }
});
```

## 触摸事件对象（移动端）

```javascript
element.addEventListener('touchstart', function(e) {
  console.log('触摸点数量:', e.touches.length);
  console.log('改变的触摸点:', e.changedTouches.length);
  console.log('目标上的触摸点:', e.targetTouches.length);
  
  // 获取第一个触摸点
  const touch = e.touches[0];
  console.log('触摸位置:', touch.clientX, touch.clientY);
  console.log('触摸ID:', touch.identifier);
});
```

## 事件对象的方法

### 1. 阻止默认行为

```javascript
// 阻止链接默认跳转
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('链接被点击，但不会跳转');
    
    // 自定义处理逻辑
    handleLinkClick(this.href);
  });
});

// 阻止表单默认提交
form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // 使用AJAX提交
  submitFormViaAjax(new FormData(this));
});
```

### 2. 阻止事件传播

```javascript
// 阻止事件冒泡
child.addEventListener('click', function(e) {
  e.stopPropagation();
  console.log('只在子元素处理，不会冒泡到父元素');
});

// 立即阻止事件传播（包括同级监听器）
element.addEventListener('click', function(e) {
  e.stopImmediatePropagation();
  console.log('阻止所有其他监听器');
});

// 另一个监听器不会被执行
element.addEventListener('click', function(e) {
  console.log('这个不会执行');
});
```

## 自定义事件对象

```javascript
// 创建自定义事件
const customEvent = new CustomEvent('myCustomEvent', {
  detail: {
    message: 'Hello from custom event!',
    timestamp: Date.now()
  },
  bubbles: true,
  cancelable: true
});

// 监听自定义事件
element.addEventListener('myCustomEvent', function(e) {
  console.log('自定义事件数据:', e.detail);
  console.log('消息:', e.detail.message);
});

// 触发自定义事件
element.dispatchEvent(customEvent);
```

## 实际应用场景

### 1. 图片懒加载

```javascript
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));
```

### 2. 无限滚动

```javascript
window.addEventListener('scroll', function(e) {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMoreContent();
  }
});
```

### 3. 文件拖拽上传

```javascript
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

dropZone.addEventListener('drop', function(e) {
  e.preventDefault();
  
  const files = Array.from(e.dataTransfer.files);
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      uploadFile(file);
    }
  });
});
```

## 兼容性和最佳实践

### 1. 事件对象获取（兼容旧浏览器）

```javascript
function handleEvent(e) {
  // 兼容IE8及以下
  e = e || window.event;
  const target = e.target || e.srcElement;
  
  // 现代浏览器写法
  console.log(e.target);
}
```

### 2. 事件处理优化

```javascript
// 使用事件委托减少内存占用
document.addEventListener('click', function(e) {
  const button = e.target.closest('button');
  if (button) {
    handleButtonClick(button, e);
  }
});

// 及时移除事件监听器
function cleanup() {
  element.removeEventListener('click', handleClick);
}
```

事件对象是前端开发中的核心概念，掌握它的各种属性和方法能让你更好地处理用户交互，创建更丰富的用户体验。