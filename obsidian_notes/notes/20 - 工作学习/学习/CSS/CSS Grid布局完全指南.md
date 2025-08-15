# CSS Grid布局完全指南

## 什么是CSS Grid

CSS Grid是一个二维布局系统，允许我们同时在行和列两个维度上控制元素的位置和大小。与Flexbox主要处理一维布局不同，Grid可以轻松创建复杂的网格布局，是现代网页设计中最强大的布局工具之一。

## 基础概念

### Grid容器和Grid项目

- **Grid容器（Grid Container）**：设置了`display: grid`或`display: inline-grid`的元素
- **Grid项目（Grid Items）**：Grid容器的直接子元素
- **Grid线（Grid Lines）**：构成网格结构的分界线
- **Grid轨道（Grid Tracks）**：两条相邻Grid线之间的空间（行或列）
- **Grid单元格（Grid Cells）**：四条Grid线围成的空间
- **Grid区域（Grid Areas）**：由一个或多个Grid单元格组成的矩形区域

### 坐标系统

Grid使用基于线的坐标系统：

- 行线从上到下编号：1, 2, 3...
- 列线从左到右编号：1, 2, 3...
- 也可以使用负数从末尾开始计数：-1, -2, -3...

## 容器属性

### 创建Grid容器

```css
.container {
    display: grid;
    /* 或者 */
    display: inline-grid;
}
```

### 定义网格轨道

#### grid-template-columns 和 grid-template-rows

```css
.container {
    display: grid;
    /* 定义3列，宽度分别为200px, 1fr, 100px */
    grid-template-columns: 200px 1fr 100px;
    /* 定义3行，高度分别为100px, auto, 50px */
    grid-template-rows: 100px auto 50px;
}
```

常用单位：

- `px`：固定像素值
- `fr`：剩余空间的分数单位
- `%`：百分比
- `auto`：自动大小
- `min-content`：内容的最小尺寸
- `max-content`：内容的最大尺寸

#### repeat() 函数

```css
.container {
    /* 创建4列，每列200px */
    grid-template-columns: repeat(4, 200px);
    /* 创建3列，宽度比例为1:2:1 */
    grid-template-columns: repeat(3, 1fr 2fr 1fr);
    /* 自动填充列 */
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```

### 间距设置

```css
.container {
    /* 行间距 */
    row-gap: 10px;
    /* 列间距 */
    column-gap: 15px;
    /* 简写：行间距 列间距 */
    gap: 10px 15px;
    /* 统一间距 */
    gap: 20px;
}
```

### 网格线命名

```css
.container {
    grid-template-columns: [start] 200px [main-start] 1fr [main-end] 100px [end];
    grid-template-rows: [header-start] 100px [header-end main-start] 1fr [main-end footer-start] 50px [footer-end];
}
```

### 区域模板

```css
.container {
    display: grid;
    grid-template-areas:
        "header header header"
        "sidebar main main"
        "footer footer footer";
    grid-template-columns: 200px 1fr 1fr;
    grid-template-rows: 100px 1fr 50px;
}
```

### 对齐方式

```css
.container {
    /* 项目在单元格内的对齐 */
    justify-items: start | end | center | stretch;
    align-items: start | end | center | stretch;
    place-items: <align-items> <justify-items>;
    
    /* 整个网格在容器内的对齐 */
    justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
    align-content: start | end | center | stretch | space-around | space-between | space-evenly;
    place-content: <align-content> <justify-content>;
}
```

## 项目属性

### 基于线的定位

```css
.item {
    /* 占据从第1列线到第3列线 */
    grid-column-start: 1;
    grid-column-end: 3;
    /* 简写 */
    grid-column: 1 / 3;
    
    /* 占据从第2行线到第4行线 */
    grid-row-start: 2;
    grid-row-end: 4;
    /* 简写 */
    grid-row: 2 / 4;
    
    /* 更简洁的写法 */
    grid-area: 2 / 1 / 4 / 3; /* row-start / column-start / row-end / column-end */
}
```

### 跨度设置

```css
.item {
    /* 跨越3列 */
    grid-column: span 3;
    /* 跨越2行 */
    grid-row: span 2;
    /* 从第2列开始跨越3列 */
    grid-column: 2 / span 3;
}
```

### 区域定位

```css
.item {
    /* 使用命名区域 */
    grid-area: header;
}
```

### 个别项目对齐

```css
.item {
    justify-self: start | end | center | stretch;
    align-self: start | end | center | stretch;
    place-self: <align-self> <justify-self>;
}
```

## 实际应用示例

### 基础网页布局

```css
.page-layout {
    display: grid;
    grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
    grid-template-columns: 250px 1fr;
    grid-template-rows: 80px 1fr 60px;
    min-height: 100vh;
    gap: 20px;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

### 响应式卡片布局

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
```

### 复杂的杂志式布局

```css
.magazine-layout {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(4, 200px);
    gap: 10px;
}

.feature-article {
    grid-column: 1 / 4;
    grid-row: 1 / 3;
}

.secondary-article {
    grid-column: 4 / 7;
    grid-row: 1 / 2;
}

.sidebar {
    grid-column: 4 / 7;
    grid-row: 2 / 4;
}

.small-articles {
    grid-column: 1 / 4;
    grid-row: 3 / 5;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}
```

## 响应式设计

### 媒体查询配合Grid

```css
.responsive-grid {
    display: grid;
    gap: 20px;
}

/* 移动设备 */
@media (max-width: 768px) {
    .responsive-grid {
        grid-template-columns: 1fr;
        grid-template-areas:
            "header"
            "main"
            "sidebar"
            "footer";
    }
}

/* 平板设备 */
@media (min-width: 769px) and (max-width: 1024px) {
    .responsive-grid {
        grid-template-columns: 1fr 1fr;
        grid-template-areas:
            "header header"
            "main sidebar"
            "footer footer";
    }
}

/* 桌面设备 */
@media (min-width: 1025px) {
    .responsive-grid {
        grid-template-columns: 200px 1fr 200px;
        grid-template-areas:
            "header header header"
            "sidebar main aside"
            "footer footer footer";
    }
}
```

## 高级技巧

### 自动放置算法

Grid会自动为没有明确定位的项目寻找合适的位置：

```css
.auto-placement {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 100px;
    gap: 10px;
}

/* 某些项目指定位置 */
.item:nth-child(1) { grid-column: 1 / 3; }
.item:nth-child(5) { grid-column: 2 / 4; }
/* 其他项目会自动填充空白位置 */
```

### 最小和最大尺寸

```css
.flexible-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    /* 行的最小高度为150px，最大为内容高度 */
    grid-auto-rows: minmax(150px, auto);
}
```

### 网格对齐的组合使用

```css
.centered-grid {
    display: grid;
    grid-template-columns: repeat(3, 200px);
    grid-template-rows: repeat(3, 100px);
    gap: 10px;
    /* 整个网格在容器中居中 */
    place-content: center;
    /* 项目在各自单元格中居中 */
    place-items: center;
}
```

## 浏览器支持

CSS Grid在现代浏览器中有良好的支持：

- Chrome 57+
- Firefox 52+
- Safari 10+
- Edge 16+

对于需要支持更旧浏览器的项目，可以使用：

- `@supports` 查询进行特性检测
- Flexbox作为降级方案
- 使用PostCSS插件进行兼容性处理

## 总结

CSS Grid是一个强大的布局工具，特别适合：

- 复杂的二维布局
- 响应式设计
- 不规则的网格布局
- 需要精确控制的布局场景

掌握Grid布局可以让你更高效地创建现代网页布局，减少对浮动和定位的依赖，写出更清晰、更易维护的CSS代码。

建议在实际项目中多加练习，结合Flexbox使用，可以应对几乎所有的布局需求。