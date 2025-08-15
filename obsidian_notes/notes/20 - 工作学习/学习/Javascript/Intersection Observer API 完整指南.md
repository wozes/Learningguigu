# Intersection Observer API 完整指南

## 概述

Intersection Observer API 是一个现代的 Web API，用于异步监听目标元素与其祖先元素或视口交叉状态的变化。它提供了一种高效的方式来观察元素的可见性变化，避免了传统方法中频繁调用 `getBoundingClientRect()` 带来的性能问题。

## 为什么需要 Intersection Observer？

### 传统方法的问题

在 Intersection Observer 出现之前，开发者通常使用以下方法来检测元素可见性：

```javascript
// 传统方法 - 性能较差
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 需要频繁监听滚动事件
window.addEventListener('scroll', () => {
    elements.forEach(el => {
        if (isElementInViewport(el)) {
            // 执行相关操作
        }
    });
});
```

### 传统方法的缺点

- 频繁的 DOM 查询导致性能问题
- 滚动事件触发频繁，影响用户体验
- 代码复杂，难以维护
- 无法准确控制触发时机

## 基本语法

### 创建观察者

```javascript
const observer = new IntersectionObserver(callback, options);
```

### 参数说明

#### callback 函数

当目标元素的可见性发生变化时被调用：

```javascript
function callback(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 元素进入视口
            console.log('元素可见');
        } else {
            // 元素离开视口
            console.log('元素不可见');
        }
    });
}
```

#### options 配置对象

```javascript
const options = {
    root: null,              // 根元素，默认为视口
    rootMargin: '0px',       // 根元素的外边距
    threshold: 0.1           // 触发阈值
};
```

## 配置选项详解

### root

- **类型**: Element | null
- **默认值**: null（视口）
- **作用**: 指定根元素，用作检查目标可见性的视口

```javascript
// 使用特定元素作为根
const container = document.querySelector('.container');
const observer = new IntersectionObserver(callback, {
    root: container
});
```

### rootMargin

- **类型**: string
- **默认值**: '0px'
- **作用**: 设置根元素的外边距，可以扩大或缩小根元素的检测范围

```javascript
const observer = new IntersectionObserver(callback, {
    rootMargin: '10px 20px 30px 40px'  // 上右下左
});
```

### threshold

- **类型**: number | number[]
- **默认值**: 0
- **作用**: 设置触发回调的可见性阈值

```javascript
// 单个阈值
const observer1 = new IntersectionObserver(callback, {
    threshold: 0.5  // 50% 可见时触发
});

// 多个阈值
const observer2 = new IntersectionObserver(callback, {
    threshold: [0, 0.25, 0.5, 0.75, 1]  // 多个阈值
});
```

## IntersectionObserverEntry 对象

回调函数接收的 `entries` 数组包含 `IntersectionObserverEntry` 对象，具有以下属性：

```javascript
function callback(entries) {
    entries.forEach(entry => {
        console.log({
            target: entry.target,                    // 目标元素
            isIntersecting: entry.isIntersecting,    // 是否正在交叉
            intersectionRatio: entry.intersectionRatio, // 交叉比例
            intersectionRect: entry.intersectionRect,   // 交叉区域
            boundingClientRect: entry.boundingClientRect, // 目标元素边界
            rootBounds: entry.rootBounds,            // 根元素边界
            time: entry.time                         // 时间戳
        });
    });
}
```

## 实际应用场景

### 1. 图片懒加载

```javascript
// HTML
// <img data-src="image.jpg" class="lazy-image" alt="懒加载图片">

const lazyImages = document.querySelectorAll('.lazy-image');

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy-image');
            imageObserver.unobserve(img);
        }
    });
}, {
    rootMargin: '50px'  // 提前 50px 开始加载
});

lazyImages.forEach(img => {
    imageObserver.observe(img);
});
```

### 2. 无限滚动

```javascript
const loadMoreTrigger = document.querySelector('.load-more-trigger');
let page = 1;

const loadMoreObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadMoreData(++page);
        }
    });
}, {
    rootMargin: '100px'
});

loadMoreObserver.observe(loadMoreTrigger);

async function loadMoreData(page) {
    try {
        const response = await fetch(`/api/data?page=${page}`);
        const data = await response.json();
        renderData(data);
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}
```

### 3. 滚动动画

```javascript
const animateElements = document.querySelectorAll('.animate-on-scroll');

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        } else {
            entry.target.classList.remove('animate-in');
        }
    });
}, {
    threshold: 0.1
});

animateElements.forEach(el => {
    animationObserver.observe(el);
});
```

### 4. 页面统计和埋点

```javascript
const trackingElements = document.querySelectorAll('[data-track]');

const trackingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const trackingData = element.dataset.track;
            
            // 发送埋点数据
            analytics.track('element_viewed', {
                element: trackingData,
                timestamp: Date.now(),
                visibilityRatio: entry.intersectionRatio
            });
            
            // 只统计一次
            trackingObserver.unobserve(element);
        }
    });
}, {
    threshold: 0.5
});

trackingElements.forEach(el => {
    trackingObserver.observe(el);
});
```

## 高级用法

### 1. 进度条显示

```javascript
const progressBar = document.querySelector('.progress-bar');
const content = document.querySelector('.content');

const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const progress = entry.intersectionRatio * 100;
        progressBar.style.width = `${progress}%`;
    });
}, {
    threshold: Array.from({length: 101}, (_, i) => i / 100)
});

progressObserver.observe(content);
```

### 2. 视口可见性检测

```javascript
class VisibilityTracker {
    constructor(element, options = {}) {
        this.element = element;
        this.callbacks = {
            enter: options.onEnter || (() => {}),
            exit: options.onExit || (() => {}),
            change: options.onChange || (() => {})
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            options.observerOptions || {}
        );
        
        this.observer.observe(this.element);
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.callbacks.enter(entry);
            } else {
                this.callbacks.exit(entry);
            }
            this.callbacks.change(entry);
        });
    }
    
    destroy() {
        this.observer.disconnect();
    }
}

// 使用示例
const tracker = new VisibilityTracker(document.querySelector('.tracked-element'), {
    onEnter: (entry) => console.log('元素进入视口'),
    onExit: (entry) => console.log('元素离开视口'),
    onChange: (entry) => console.log('可见性变化:', entry.intersectionRatio),
    observerOptions: {
        threshold: [0, 0.5, 1]
    }
});
```

## 性能优化建议

### 1. 合理使用 threshold

```javascript
// 避免过多的阈值
const observer = new IntersectionObserver(callback, {
    threshold: [0, 0.5, 1]  // 适中的阈值数量
});
```

### 2. 及时取消观察

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 执行操作后取消观察
            observer.unobserve(entry.target);
        }
    });
});
```

### 3. 使用 rootMargin 预加载

```javascript
const observer = new IntersectionObserver(callback, {
    rootMargin: '50px'  // 提前触发，改善用户体验
});
```

## 浏览器兼容性

### 支持情况

- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

### Polyfill 方案

对于不支持的浏览器，可以使用 polyfill：

```javascript
// 检测支持性
if (!('IntersectionObserver' in window)) {
    // 加载 polyfill
    import('intersection-observer').then(() => {
        // 使用 IntersectionObserver
    });
}
```

## 最佳实践

### 1. 错误处理

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        try {
            if (entry.isIntersecting) {
                handleVisibleElement(entry.target);
            }
        } catch (error) {
            console.error('处理交叉事件时出错:', error);
        }
    });
});
```

### 2. 内存管理

```javascript
class ComponentWithObserver {
    constructor() {
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
    }
    
    destroy() {
        // 组件销毁时断开观察者
        this.observer.disconnect();
    }
}
```

### 3. 防抖处理

```javascript
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const debouncedCallback = debounce((entries) => {
    entries.forEach(entry => {
        // 处理逻辑
    });
}, 100);

const observer = new IntersectionObserver(debouncedCallback);
```

## 总结

Intersection Observer API 是现代前端开发中的重要工具，它解决了传统元素可见性检测方法的性能问题。通过合理使用这个 API，可以实现高效的懒加载、无限滚动、动画触发等功能。

### 关键优势

- 异步执行，不阻塞主线程
- 高性能，避免频繁的 DOM 查询
- 灵活的配置选项
- 原生支持，无需第三方库

### 适用场景

- 图片和内容懒加载
- 无限滚动实现
- 滚动动画触发
- 页面统计和埋点
- 广告可见性监测

掌握 Intersection Observer API 能显著提升前端应用的性能和用户体验。