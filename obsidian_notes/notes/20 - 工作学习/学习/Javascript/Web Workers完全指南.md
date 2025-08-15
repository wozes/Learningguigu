# Web Workers完全指南

## 什么是Web Workers

Web Workers是HTML5引入的一项技术，允许在后台线程中运行JavaScript代码，而不会阻塞主线程（UI线程）。这意味着你可以在不影响用户界面响应性的情况下执行耗时的计算任务。

### 核心概念

- **主线程**：负责UI渲染和用户交互的线程
- **Worker线程**：在后台运行的独立线程，专门用于执行JavaScript代码
- **消息传递**：主线程和Worker线程之间通过消息进行通信
- **线程安全**：Worker线程无法直接访问DOM或主线程的变量

## 为什么需要Web Workers

### 传统JavaScript的限制

JavaScript是单线程的，所有代码都在主线程上执行：

```javascript
// 这会阻塞UI线程
function heavyCalculation() {
    let result = 0;
    for (let i = 0; i < 1000000000; i++) {
        result += Math.random();
    }
    return result;
}

// 页面会卡住直到计算完成
const result = heavyCalculation();
console.log(result);
```

### Web Workers的优势

1. **非阻塞执行**：耗时任务不会影响UI响应
2. **并行处理**：可以同时运行多个Worker
3. **更好的用户体验**：页面保持流畅
4. **充分利用多核CPU**：现代浏览器支持真正的并行执行

## Web Workers的类型

### 1. Dedicated Workers（专用Worker）

最常用的Worker类型，只能被创建它的脚本使用：

```javascript
// 主线程
const worker = new Worker('worker.js');

// 发送消息给Worker
worker.postMessage({ command: 'start', data: [1, 2, 3, 4, 5] });

// 监听Worker的消息
worker.onmessage = function(e) {
    console.log('收到Worker消息:', e.data);
};

// 错误处理
worker.onerror = function(error) {
    console.error('Worker错误:', error);
};
```

### 2. Shared Workers（共享Worker）

可以被多个脚本或页面共享的Worker：

```javascript
// 主线程
const sharedWorker = new SharedWorker('shared-worker.js');

// 通过port进行通信
sharedWorker.port.postMessage({ type: 'connect', data: 'hello' });

sharedWorker.port.onmessage = function(e) {
    console.log('共享Worker消息:', e.data);
};
```

### 3. Service Workers（服务Worker）

主要用于离线缓存和推送通知：

```javascript
// 注册Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker注册成功');
        })
        .catch(error => {
            console.log('Service Worker注册失败');
        });
}
```

## 创建和使用Dedicated Workers

### 基本用法

**主线程 (main.js)：**

```javascript
// 创建Worker
const worker = new Worker('worker.js');

// 发送数据给Worker
worker.postMessage({
    command: 'calculate',
    numbers: [1, 2, 3, 4, 5]
});

// 监听Worker的返回消息
worker.addEventListener('message', function(e) {
    const { result, error } = e.data;
    
    if (error) {
        console.error('计算错误:', error);
    } else {
        console.log('计算结果:', result);
        document.getElementById('result').textContent = result;
    }
});

// 错误处理
worker.addEventListener('error', function(e) {
    console.error('Worker错误:', e.message);
});
```

**Worker文件 (worker.js)：**

```javascript
// 监听主线程的消息
self.addEventListener('message', function(e) {
    const { command, numbers } = e.data;
    
    try {
        switch (command) {
            case 'calculate':
                const result = performHeavyCalculation(numbers);
                // 发送结果回主线程
                self.postMessage({ result });
                break;
            default:
                throw new Error(`未知命令: ${command}`);
        }
    } catch (error) {
        // 发送错误信息回主线程
        self.postMessage({ error: error.message });
    }
});

function performHeavyCalculation(numbers) {
    // 模拟耗时计算
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
        sum += numbers.reduce((acc, num) => acc + num * Math.random(), 0);
    }
    return sum;
}
```

## 实际应用示例

### 1. 图像处理

**主线程：**

```javascript
class ImageProcessor {
    constructor() {
        this.worker = new Worker('image-worker.js');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.worker.onmessage = (e) => {
            const { type, data } = e.data;
            
            switch (type) {
                case 'processed':
                    this.displayProcessedImage(data);
                    break;
                case 'progress':
                    this.updateProgress(data.percent);
                    break;
                case 'error':
                    this.showError(data.message);
                    break;
            }
        };
    }
    
    processImage(imageData, filter) {
        this.worker.postMessage({
            command: 'process',
            imageData,
            filter
        });
    }
    
    displayProcessedImage(processedData) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.putImageData(processedData, 0, 0);
    }
    
    updateProgress(percent) {
        document.getElementById('progress').style.width = percent + '%';
    }
    
    showError(message) {
        console.error('图像处理错误:', message);
    }
}

// 使用示例
const processor = new ImageProcessor();

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                processor.processImage(imageData, 'blur');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
```

**Worker文件 (image-worker.js)：**

```javascript
self.addEventListener('message', function(e) {
    const { command, imageData, filter } = e.data;
    
    if (command === 'process') {
        try {
            const processedData = applyFilter(imageData, filter);
            self.postMessage({ type: 'processed', data: processedData });
        } catch (error) {
            self.postMessage({ type: 'error', data: { message: error.message } });
        }
    }
});

function applyFilter(imageData, filterType) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    switch (filterType) {
        case 'blur':
            return applyBlurFilter(imageData);
        case 'grayscale':
            return applyGrayscaleFilter(imageData);
        case 'sepia':
            return applySepiaFilter(imageData);
        default:
            throw new Error(`不支持的滤镜: ${filterType}`);
    }
}

function applyBlurFilter(imageData) {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    // 简单的模糊滤镜实现
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            // 计算周围像素的平均值
            let r = 0, g = 0, b = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
                    r += data[neighborIdx];
                    g += data[neighborIdx + 1];
                    b += data[neighborIdx + 2];
                }
            }
            
            imageData.data[idx] = r / 9;
            imageData.data[idx + 1] = g / 9;
            imageData.data[idx + 2] = b / 9;
        }
        
        // 报告进度
        if (y % 10 === 0) {
            self.postMessage({ 
                type: 'progress', 
                data: { percent: (y / height * 100).toFixed(1) } 
            });
        }
    }
    
    return imageData;
}

function applyGrayscaleFilter(imageData) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;     // Red
        data[i + 1] = gray; // Green
        data[i + 2] = gray; // Blue
    }
    
    return imageData;
}
```

### 2. 数据处理和分析

**主线程：**

```javascript
class DataAnalyzer {
    constructor() {
        this.worker = new Worker('data-worker.js');
        this.setupWorker();
    }
    
    setupWorker() {
        this.worker.onmessage = (e) => {
            const { type, data } = e.data;
            
            switch (type) {
                case 'analysis_complete':
                    this.displayResults(data);
                    break;
                case 'progress':
                    this.updateProgressBar(data.progress);
                    break;
                case 'error':
                    this.handleError(data.error);
                    break;
            }
        };
    }
    
    analyzeData(dataset) {
        this.worker.postMessage({
            command: 'analyze',
            data: dataset
        });
    }
    
    displayResults(results) {
        document.getElementById('mean').textContent = results.mean.toFixed(2);
        document.getElementById('median').textContent = results.median.toFixed(2);
        document.getElementById('stdDev').textContent = results.standardDeviation.toFixed(2);
        document.getElementById('min').textContent = results.min;
        document.getElementById('max').textContent = results.max;
        
        // 绘制直方图
        this.drawHistogram(results.histogram);
    }
    
    updateProgressBar(progress) {
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressText').textContent = progress + '%';
    }
    
    drawHistogram(histogram) {
        const canvas = document.getElementById('histogramCanvas');
        const ctx = canvas.getContext('2d');
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制直方图
        const barWidth = canvas.width / histogram.length;
        const maxCount = Math.max(...histogram.map(bin => bin.count));
        
        histogram.forEach((bin, index) => {
            const barHeight = (bin.count / maxCount) * canvas.height;
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(index * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        });
    }
    
    handleError(error) {
        console.error('数据分析错误:', error);
        alert('数据分析失败: ' + error);
    }
}

// 使用示例
const analyzer = new DataAnalyzer();

document.getElementById('analyzeBtn').addEventListener('click', () => {
    // 生成示例数据
    const dataset = [];
    for (let i = 0; i < 100000; i++) {
        dataset.push(Math.random() * 100);
    }
    
    analyzer.analyzeData(dataset);
});
```

**Worker文件 (data-worker.js)：**

```javascript
self.addEventListener('message', function(e) {
    const { command, data } = e.data;
    
    if (command === 'analyze') {
        try {
            const results = performStatisticalAnalysis(data);
            self.postMessage({ type: 'analysis_complete', data: results });
        } catch (error) {
            self.postMessage({ type: 'error', data: { error: error.message } });
        }
    }
});

function performStatisticalAnalysis(dataset) {
    const results = {};
    
    // 排序数据
    const sortedData = [...dataset].sort((a, b) => a - b);
    
    // 计算均值
    self.postMessage({ type: 'progress', data: { progress: 10 } });
    results.mean = dataset.reduce((sum, val) => sum + val, 0) / dataset.length;
    
    // 计算中位数
    self.postMessage({ type: 'progress', data: { progress: 20 } });
    const middle = Math.floor(sortedData.length / 2);
    results.median = sortedData.length % 2 === 0
        ? (sortedData[middle - 1] + sortedData[middle]) / 2
        : sortedData[middle];
    
    // 计算标准差
    self.postMessage({ type: 'progress', data: { progress: 40 } });
    const variance = dataset.reduce((sum, val) => sum + Math.pow(val - results.mean, 2), 0) / dataset.length;
    results.standardDeviation = Math.sqrt(variance);
    
    // 计算最小值和最大值
    self.postMessage({ type: 'progress', data: { progress: 60 } });
    results.min = Math.min(...dataset);
    results.max = Math.max(...dataset);
    
    // 生成直方图
    self.postMessage({ type: 'progress', data: { progress: 80 } });
    results.histogram = generateHistogram(dataset, 20);
    
    self.postMessage({ type: 'progress', data: { progress: 100 } });
    
    return results;
}

function generateHistogram(data, binCount) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
        min: min + i * binWidth,
        max: min + (i + 1) * binWidth,
        count: 0
    }));
    
    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
        bins[binIndex].count++;
    });
    
    return bins;
}
```

### 3. 实时数据处理

**主线程：**

```javascript
class RealTimeProcessor {
    constructor() {
        this.worker = new Worker('realtime-worker.js');
        this.buffer = [];
        this.setupWorker();
        this.startDataStream();
    }
    
    setupWorker() {
        this.worker.onmessage = (e) => {
            const { type, data } = e.data;
            
            switch (type) {
                case 'processed_batch':
                    this.updateChart(data);
                    break;
                case 'alert':
                    this.showAlert(data);
                    break;
            }
        };
    }
    
    startDataStream() {
        // 模拟实时数据流
        setInterval(() => {
            const dataPoint = {
                timestamp: Date.now(),
                value: Math.random() * 100 + Math.sin(Date.now() / 1000) * 20
            };
            
            this.buffer.push(dataPoint);
            
            // 每收集到50个数据点就发送给Worker处理
            if (this.buffer.length >= 50) {
                this.worker.postMessage({
                    command: 'process_batch',
                    data: this.buffer
                });
                this.buffer = [];
            }
        }, 100);
    }
    
    updateChart(processedData) {
        // 更新实时图表
        console.log('更新图表:', processedData);
    }
    
    showAlert(alertData) {
        console.warn('数据异常:', alertData);
    }
}

// 启动实时处理
const processor = new RealTimeProcessor();
```

**Worker文件 (realtime-worker.js)：**

```javascript
let historicalData = [];
let alertThreshold = 80;

self.addEventListener('message', function(e) {
    const { command, data } = e.data;
    
    if (command === 'process_batch') {
        const processedData = processBatch(data);
        self.postMessage({ type: 'processed_batch', data: processedData });
    }
});

function processBatch(batch) {
    const processedBatch = batch.map(point => {
        // 应用滤波器
        const smoothedValue = applyMovingAverage(point.value);
        
        // 检查异常值
        if (smoothedValue > alertThreshold) {
            self.postMessage({
                type: 'alert',
                data: {
                    message: `数值异常: ${smoothedValue.toFixed(2)}`,
                    timestamp: point.timestamp,
                    value: smoothedValue
                }
            });
        }
        
        return {
            ...point,
            smoothedValue,
            trend: calculateTrend(point.value)
        };
    });
    
    // 更新历史数据
    historicalData.push(...processedBatch);
    
    // 保持历史数据在合理范围内
    if (historicalData.length > 1000) {
        historicalData = historicalData.slice(-1000);
    }
    
    return processedBatch;
}

function applyMovingAverage(currentValue) {
    const windowSize = 10;
    const recentValues = historicalData.slice(-windowSize).map(d => d.value);
    recentValues.push(currentValue);
    
    return recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
}

function calculateTrend(currentValue) {
    if (historicalData.length < 2) return 0;
    
    const lastValue = historicalData[historicalData.length - 1].value;
    return currentValue - lastValue;
}
```

## 消息传递和数据类型

### 支持的数据类型

Web Workers支持的数据类型（可以通过postMessage传递）：

```javascript
// 基本类型
worker.postMessage('字符串');
worker.postMessage(42);
worker.postMessage(true);
worker.postMessage(null);

// 对象和数组
worker.postMessage({ name: 'John', age: 30 });
worker.postMessage([1, 2, 3, 4, 5]);

// 复杂对象
worker.postMessage({
    config: {
        timeout: 5000,
        retries: 3
    },
    data: new Uint8Array([1, 2, 3, 4])
});
```

### 不支持的数据类型

```javascript
// 这些类型无法传递给Worker
worker.postMessage(document.getElementById('myDiv')); // DOM元素
worker.postMessage(function() { return 42; }); // 函数
worker.postMessage(window); // 全局对象
```

### Transferable Objects（可转移对象）

对于大型数据（如ArrayBuffer），可以使用transferable objects来避免数据复制：

```javascript
// 创建大型数组缓冲区
const buffer = new ArrayBuffer(1024 * 1024); // 1MB
const view = new Uint8Array(buffer);

// 填充数据
for (let i = 0; i < view.length; i++) {
    view[i] = i % 256;
}

// 转移所有权给Worker（主线程不能再访问buffer）
worker.postMessage(buffer, [buffer]);
```

Worker端：

```javascript
self.onmessage = function(e) {
    const buffer = e.data;
    const view = new Uint8Array(buffer);
    
    // 处理数据
    for (let i = 0; i < view.length; i++) {
        view[i] = view[i] * 2;
    }
    
    // 转移回主线程
    self.postMessage(buffer, [buffer]);
};
```

## 错误处理和调试

### 错误处理

```javascript
// 主线程
const worker = new Worker('worker.js');

worker.onerror = function(error) {
    console.error('Worker错误:', {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno
    });
};

worker.onmessageerror = function(event) {
    console.error('消息序列化错误:', event);
};

// Worker线程
self.onerror = function(error) {
    console.error('Worker内部错误:', error);
    return true; // 阻止错误传播到主线程
};

self.onunhandledrejection = function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
    event.preventDefault();
};
```

### 调试技巧

```javascript
// Worker文件中添加调试信息
self.addEventListener('message', function(e) {
    console.log('Worker收到消息:', e.data);
    
    try {
        const result = processData(e.data);
        console.log('处理结果:', result);
        self.postMessage(result);
    } catch (error) {
        console.error('处理错误:', error);
        self.postMessage({ error: error.message });
    }
});

// 主线程中添加性能监控
const startTime = performance.now();
worker.postMessage(data);

worker.onmessage = function(e) {
    const endTime = performance.now();
    console.log(`Worker处理时间: ${endTime - startTime}ms`);
};
```

## 性能优化

### 1. 减少消息传递开销

```javascript
// 不好的做法 - 频繁的小消息
for (let i = 0; i < 1000; i++) {
    worker.postMessage({ index: i, value: data[i] });
}

// 好的做法 - 批量处理
worker.postMessage({ 
    command: 'process_batch', 
    data: data.slice(0, 1000) 
});
```

### 2. 使用对象池

```javascript
// Worker中使用对象池
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    acquire() {
        return this.pool.length > 0 ? this.pool.pop() : this.createFn();
    }
    
    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}

// 使用对象池
const arrayPool = new ObjectPool(
    () => new Array(1000),
    (arr) => arr.length = 0
);

self.onmessage = function(e) {
    const tempArray = arrayPool.acquire();
    
    // 使用临时数组进行计算
    // ... 处理逻辑
    
    arrayPool.release(tempArray);
};
```

### 3. 内存管理

```javascript
// Worker中定期清理内存
let processingQueue = [];
let lastCleanup = Date.now();

self.onmessage = function(e) {
    processingQueue.push(e.data);
    
    // 定期清理
    const now = Date.now();
    if (now - lastCleanup > 30000) { // 30秒清理一次
        processingQueue = processingQueue.slice(-100); // 只保留最近100个
        lastCleanup = now;
        
        // 强制垃圾回收（如果支持）
        if (typeof gc === 'function') {
            gc();
        }
    }
};
```

## 浏览器兼容性和限制

### 浏览器支持

- **Chrome**: 4+
- **Firefox**: 3.5+
- **Safari**: 4+
- **Edge**: 12+
- **IE**: 10+

### 主要限制

1. **无法访问DOM**：Worker无法直接操作DOM元素
2. **无法访问全局对象**：无法访问window、document等
3. **受同源策略限制**：Worker脚本必须与主页面同源
4. **有限的API访问**：某些Web API在Worker中不可用

### 可用的API

Worker中可以使用的API：

- `console` - 控制台输出
- `setTimeout/setInterval` - 定时器
- `XMLHttpRequest` - HTTP请求
- `fetch` - 现代HTTP请求API
- `WebSocket` - WebSocket连接
- `IndexedDB` - 本地数据库
- `Cache API` - 缓存API
- `crypto` - 加密API

## 最佳实践

### 1. 合理的任务分配

```javascript
// 适合Worker的任务
- 大量数据处理
- 复杂计算
- 图像/音频处理
- 加密/解密
- 网络请求处理

// 不适合Worker的任务
- 简单的DOM操作
- 轻量级计算
- 需要频繁与主线程交互的任务
```

### 2. 错误处理和容错

```javascript
class RobustWorker {
    constructor(scriptPath) {
        this.scriptPath = scriptPath;
        this.worker = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.init();
    }
    
    init() {
        this.worker = new Worker(this.scriptPath);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.worker.onerror = (error) => {
            console.error('Worker错误:', error);
            this.handleWorkerError();
        };
        
        this.worker.onmessageerror = (error) => {
            console.error('消息错误:', error);
            this.handleWorkerError();
        };
    }
    
    handleWorkerError() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`重启Worker (${this.retryCount}/${this.maxRetries})`);
            this.worker.terminate();
            this.init();
        } else {
            console.error('Worker重启次数超过限制');
            // 降级到主线程处理
            this.fallbackToMainThread();
        }
    }
    
    fallbackToMainThread() {
        // 实现主线程降级逻辑
        console.log('降级到主线程处理');
    }
}
```

### 3. 资源管理

```javascript
class WorkerManager {
    constructor() {
        this.workers = new Map();
        this.maxWorkers = navigator.hardwareConcurrency || 4;
        this.taskQueue = [];
    }
    
    createWorker(id, scriptPath) {
        if (this.workers.size >= this.maxWorkers) {
            throw new Error('达到最大Worker数量限制');
        }
        
        const worker = new Worker(scriptPath);
        this.workers.set(id, {
            worker,
            busy: false,
            lastUsed: Date.now()
        });
        
        return worker;
    }
    
    getAvailableWorker() {
        for (const [id, info] of this.workers) {
            if (!info.busy) {
                info.busy = true;
                info.lastUsed = Date.now();
                return { id, worker: info.worker };
            }
        }
        return null;
    }
    
    releaseWorker(id) {
        const info = this.workers.get(id);
        if (info) {
            info.busy = false;
            info.lastUsed = Date.now();
        }
    }
    
    cleanup() {
        const now = Date.now();
        const timeout = 5 * 60 * 1000; // 5分钟
        
        for (const [id, info] of this.workers) {
            if (!info.busy && now - info.lastUsed > timeout) {
                info.worker.terminate();
                this.workers.delete(id);
            }
        }
    }
}
```

## 总结

Web Worker 是现代 Web 开发中一项强大的技术，是解决 JavaScript 单线程瓶颈、提升复杂应用性能的关键工具。通过将耗时任务转移到后台线程，它可以极大地改善网页的响应能力和用户体验，让 Web 应用更加流畅和强大。