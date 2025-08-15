# SVG标签属性和方法完全指南

## 什么是SVG？

SVG (Scalable Vector Graphics) 是一种基于XML的矢量图形格式，可以在不失真的情况下任意缩放。SVG可以直接嵌入HTML中，也可以作为独立文件使用。

## 基本语法

```html
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- SVG内容 -->
</svg>
```

## 核心属性

### 1. 尺寸和视窗属性

|属性|描述|示例|
|---|---|---|
|`width`|设置SVG的宽度|`width="300"` 或 `width="100%"`|
|`height`|设置SVG的高度|`height="200"` 或 `height="50vh"`|
|`viewBox`|定义用户坐标系统和视窗|`viewBox="0 0 100 100"`|
|`preserveAspectRatio`|控制如何在视窗中缩放和定位|`preserveAspectRatio="xMidYMid meet"`|

### 2. 命名空间属性

|属性|描述|示例|
|---|---|---|
|`xmlns`|SVG命名空间|`xmlns="http://www.w3.org/2000/svg"`|
|`xmlns:xlink`|XLink命名空间（用于链接）|`xmlns:xlink="http://www.w3.org/1999/xlink"`|

### 3. 样式相关属性

|属性|描述|示例|
|---|---|---|
|`style`|内联样式|`style="fill: red; stroke: blue;"`|
|`class`|CSS类名|`class="my-svg-class"`|
|`id`|唯一标识符|`id="my-svg"`|

## 常用形状元素及其属性

### 1. 矩形 `<rect>`

```html
<rect x="10" y="10" width="100" height="50" fill="blue" stroke="red" stroke-width="2" rx="5" ry="5"/>
```

|属性|描述|
|---|---|
|`x, y`|左上角坐标|
|`width, height`|宽度和高度|
|`rx, ry`|圆角半径|

### 2. 圆形 `<circle>`

```html
<circle cx="50" cy="50" r="40" fill="green" stroke="black" stroke-width="3"/>
```

|属性|描述|
|---|---|
|`cx, cy`|圆心坐标|
|`r`|半径|

### 3. 椭圆 `<ellipse>`

```html
<ellipse cx="100" cy="50" rx="80" ry="30" fill="yellow"/>
```

|属性|描述|
|---|---|
|`cx, cy`|椭圆中心坐标|
|`rx, ry`|水平和垂直半径|

### 4. 直线 `<line>`

```html
<line x1="0" y1="0" x2="100" y2="100" stroke="purple" stroke-width="2"/>
```

|属性|描述|
|---|---|
|`x1, y1`|起点坐标|
|`x2, y2`|终点坐标|

### 5. 路径 `<path>`

```html
<path d="M 10 10 L 50 50 L 10 90 Z" fill="orange" stroke="black"/>
```

|属性|描述|
|---|---|
|`d`|路径数据，使用路径命令定义形状|

#### 路径命令

|命令|描述|示例|
|---|---|---|
|`M`|移动到|`M 10 10`|
|`L`|直线到|`L 50 50`|
|`H`|水平线到|`H 100`|
|`V`|垂直线到|`V 100`|
|`C`|三次贝塞尔曲线|`C 20 20, 40 20, 50 10`|
|`Q`|二次贝塞尔曲线|`Q 30 30, 50 10`|
|`A`|弧线|`A 25 25 0 0 1 50 25`|
|`Z`|闭合路径|`Z`|

## 通用样式属性

### 填充和描边

|属性|描述|示例|
|---|---|---|
|`fill`|填充颜色|`fill="red"`, `fill="rgb(255,0,0)"`, `fill="none"`|
|`stroke`|描边颜色|`stroke="blue"`, `stroke="#0000ff"`|
|`stroke-width`|描边宽度|`stroke-width="2"`|
|`stroke-linecap`|线条端点样式|`stroke-linecap="round"` (round/square/butt)|
|`stroke-linejoin`|线条连接样式|`stroke-linejoin="round"` (round/miter/bevel)|
|`stroke-dasharray`|虚线样式|`stroke-dasharray="5,5"`|
|`stroke-dashoffset`|虚线偏移|`stroke-dashoffset="2"`|

### 透明度

|属性|描述|示例|
|---|---|---|
|`opacity`|整体透明度|`opacity="0.5"`|
|`fill-opacity`|填充透明度|`fill-opacity="0.3"`|
|`stroke-opacity`|描边透明度|`stroke-opacity="0.8"`|

## 变换属性

|属性|描述|示例|
|---|---|---|
|`transform`|变换操作|`transform="translate(50,50) rotate(45) scale(1.5)"`|

### 变换函数

|函数|描述|示例|
|---|---|---|
|`translate(x, y)`|平移|`translate(50, 100)`|
|`rotate(angle)`|旋转|`rotate(45)`|
|`scale(x, y)`|缩放|`scale(1.5, 2)`|
|`skewX(angle)`|X轴倾斜|`skewX(30)`|
|`skewY(angle)`|Y轴倾斜|`skewY(15)`|
|`matrix(a,b,c,d,e,f)`|矩阵变换|`matrix(1,0,0,1,50,50)`|

## JavaScript DOM 方法和属性

### 获取和设置属性

```javascript
const svg = document.querySelector('svg');
const rect = document.querySelector('rect');

// 获取属性
const width = svg.getAttribute('width');
const fill = rect.getAttribute('fill');

// 设置属性
svg.setAttribute('width', '400');
rect.setAttribute('fill', 'blue');

// 使用专门的SVG属性
rect.width.baseVal.value = 100; // 获取/设置数值属性
rect.x.baseVal.value = 50;
```

### 创建SVG元素

```javascript
// 创建SVG元素（注意命名空间）
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, 'svg');
const circle = document.createElementNS(svgNS, 'circle');

// 设置属性
svg.setAttribute('width', '200');
svg.setAttribute('height', '200');
circle.setAttribute('cx', '100');
circle.setAttribute('cy', '100');
circle.setAttribute('r', '50');
circle.setAttribute('fill', 'red');

// 添加到DOM
svg.appendChild(circle);
document.body.appendChild(svg);
```

### SVG DOM 接口方法

```javascript
const svg = document.querySelector('svg');

// 获取边界框
const bbox = element.getBBox();
console.log(bbox.x, bbox.y, bbox.width, bbox.height);

// 获取屏幕坐标转换矩阵
const ctm = element.getScreenCTM();

// 创建SVG点对象
const point = svg.createSVGPoint();
point.x = 100;
point.y = 100;

// 坐标转换
const transformedPoint = point.matrixTransform(ctm);

// 获取路径长度（对path元素）
const pathLength = pathElement.getTotalLength();

// 获取路径上指定距离的点
const pointAtLength = pathElement.getPointAtLength(50);
```

### 事件处理

```javascript
// SVG元素支持标准DOM事件
rect.addEventListener('click', function(e) {
    console.log('矩形被点击');
    this.setAttribute('fill', 'yellow');
});

rect.addEventListener('mouseover', function(e) {
    this.setAttribute('opacity', '0.7');
});

rect.addEventListener('mouseout', function(e) {
    this.setAttribute('opacity', '1');
});
```

## 高级特性

### 1. 渐变 `<defs>`

```html
<svg>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect fill="url(#grad1)" x="10" y="10" width="100" height="50"/>
</svg>
```

### 2. 滤镜效果

```html
<defs>
  <filter id="blur">
    <feGaussianBlur stdDeviation="3"/>
  </filter>
</defs>
<rect filter="url(#blur)" x="10" y="10" width="100" height="50" fill="blue"/>
```

### 3. 动画 `<animate>`

```html
<circle cx="50" cy="50" r="10" fill="red">
  <animate attributeName="r" from="10" to="30" dur="2s" repeatCount="indefinite"/>
</circle>
```

## 实际应用示例

```html
<svg width="300" height="200" viewBox="0 0 300 200">
  <!-- 背景 -->
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  
  <!-- 带动画的圆 -->
  <circle cx="150" cy="100" r="20" fill="blue" stroke="navy" stroke-width="2">
    <animate attributeName="r" values="20;40;20" dur="2s" repeatCount="indefinite"/>
  </circle>
  
  <!-- 文本 -->
  <text x="150" y="160" text-anchor="middle" font-family="Arial" font-size="16" fill="black">
    SVG 示例
  </text>
</svg>
```

## 最佳实践

1. **使用viewBox实现响应式**：设置viewBox而不是固定宽高，让SVG能自适应容器
2. **优化性能**：对于复杂图形，考虑使用CSS而不是内联样式
3. **可访问性**：添加`<title>`和`<desc>`元素提供描述
4. **代码组织**：使用`<g>`元素对相关元素分组
5. **复用元素**：使用`<defs>`和`<use>`复用常见形状

这个指南涵盖了SVG的主要属性和方法，从基础到高级应用都有涉及。建议从简单的形状开始练习，逐步掌握更复杂的特性。