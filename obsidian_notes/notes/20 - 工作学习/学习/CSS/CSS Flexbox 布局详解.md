## CSS Flexbox 布局详解

### 什么是 Flexbox？

Flexbox（弹性盒子布局）是 CSS3 中引入的一种布局方式，它提供了一种更加有效的方式来排列、分布和对齐容器中的项目，即使它们的大小未知或是动态的。

### 核心概念

**1. 容器和项目**

- **Flex Container（弹性容器）**：设置了 `display: flex` 或 `display: inline-flex` 的元素
- **Flex Item（弹性项目）**：弹性容器的直接子元素

**2. 主轴和交叉轴**

- **主轴（Main Axis）**：弹性容器的主要方向
- **交叉轴（Cross Axis）**：垂直于主轴的方向

### 容器属性详解

#### 1. flex-direction（主轴方向）

```css
.container {
  flex-direction: row | row-reverse | column | column-reverse;
}
```

- `row`（默认）：主轴为水平方向，起点在左端
- `row-reverse`：主轴为水平方向，起点在右端
- `column`：主轴为垂直方向，起点在上沿
- `column-reverse`：主轴为垂直方向，起点在下沿

#### 2. justify-content（主轴对齐方式）

```css
.container {
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
}
```

- `flex-start`：左对齐
- `flex-end`：右对齐
- `center`：居中
- `space-between`：两端对齐，项目之间的间隔都相等
- `space-around`：每个项目两侧的间隔相等
- `space-evenly`：所有间隔都相等

#### 3. align-items（交叉轴对齐方式）

```css
.container {
  align-items: stretch | flex-start | flex-end | center | baseline;
}
```

- `stretch`（默认）：拉伸填满容器
- `flex-start`：交叉轴起点对齐
- `flex-end`：交叉轴终点对齐
- `center`：交叉轴中点对齐
- `baseline`：项目的第一行文字的基线对齐

#### 4. flex-wrap（换行设置）

```css
.container {
  flex-wrap: nowrap | wrap | wrap-reverse;
}
```

### 项目属性详解

#### 1. flex-grow（放大比例）

```css
.item {
  flex-grow: 0; /* 默认值，不放大 */
}
```

如果所有项目的 `flex-grow` 都为 1，则它们将等分剩余空间。

#### 2. flex-shrink（缩小比例）

```css
.item {
  flex-shrink: 1; /* 默认值，空间不足时缩小 */
}
```

#### 3. flex-basis（分配空间前的基准大小）

```css
.item {
  flex-basis: auto; /* 默认值 */
}
```

#### 4. flex（简写属性）

```css
.item {
  flex: 0 1 auto; /* 默认值，等同于 flex-grow flex-shrink flex-basis */
}
```

### 实际应用示例

让我创建一个交互式的 Flexbox 演示：### 学习要点总结

**1. 为什么要用 Flexbox？**

- 传统的布局方式（float、position）在某些场景下很复杂
- Flexbox 专门为布局设计，语法简单直观
- 响应式设计更容易实现
- 垂直居中等常见需求变得简单

**2. 记忆技巧：**

- **容器控制整体**：方向、对齐、换行
- **项目控制个体**：伸缩、顺序、单独对齐
- **主轴和交叉轴**：想象成十字架，主轴是水平线，交叉轴是垂直线

**3. 实际开发中的应用：**

- 导航栏布局
- 卡片网格布局
- 表单对齐
- 移动端适配
- 等高列布局

**4. 最佳实践：**

- 优先使用 Flexbox 而不是 float
- 结合 CSS Grid 使用（Grid 适合二维布局，Flexbox 适合一维布局）
- 考虑浏览器兼容性（现代浏览器都支持）

试试上面的交互式演示，通过改变不同的属性值来直观感受 Flexbox 的效果！你可以尝试不同的组合来创造出各种布局效果。

有什么具体的布局需求或疑问吗？我可以帮你用 Flexbox 来实现！