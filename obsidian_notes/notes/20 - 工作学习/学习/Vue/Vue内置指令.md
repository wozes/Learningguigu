Vue.js 中有很多内置指令，我来为你详细介绍主要的指令及其使用方法：

## 基础指令

**v-text** - 更新元素的文本内容

```html
<span v-text="message"></span>
<!-- 等同于 -->
<span>{{message}}</span>
```

**v-html** - 更新元素的 innerHTML

```html
<div v-html="htmlContent"></div>
```

**v-show** - 根据表达式的真假值，切换元素的 display CSS 属性

```html
<div v-show="isVisible">这个元素会被显示或隐藏</div>
```

**v-if / v-else-if / v-else** - 条件渲染

```html
<div v-if="type === 'A'">A</div>
<div v-else-if="type === 'B'">B</div>
<div v-else>C</div>
```

## 列表渲染

**v-for** - 基于源数据多次渲染元素或模板块

```html
<!-- 遍历数组 -->
<li v-for="item in items" :key="item.id">{{ item.name }}</li>

<!-- 遍历对象 -->
<li v-for="(value, key) in object" :key="key">{{ key }}: {{ value }}</li>

<!-- 带索引 -->
<li v-for="(item, index) in items" :key="item.id">{{ index }} - {{ item.name }}</li>
```

## 事件处理

**v-on** (简写为 @) - 监听 DOM 事件

```html
<button v-on:click="handleClick">点击</button>
<!-- 简写 -->
<button @click="handleClick">点击</button>

<!-- 传参 -->
<button @click="handleClick(item, $event)">点击</button>

<!-- 事件修饰符 -->
<button @click.stop="handleClick">阻止冒泡</button>
<form @submit.prevent="onSubmit">阻止默认行为</form>
```

## 表单输入绑定

**v-model** - 在表单控件上创建双向数据绑定

```html
<!-- 文本输入 -->
<input v-model="message" />

<!-- 复选框 -->
<input type="checkbox" v-model="checked" />

<!-- 单选按钮 -->
<input type="radio" v-model="picked" value="a" />

<!-- 选择框 -->
<select v-model="selected">
  <option value="a">A</option>
  <option value="b">B</option>
</select>

<!-- 修饰符 -->
<input v-model.lazy="message" />  <!-- 失焦时同步 -->
<input v-model.number="age" />    <!-- 转为数字 -->
<input v-model.trim="message" />  <!-- 去除首尾空格 -->
```

## 属性绑定

**v-bind** (简写为 :) - 动态绑定一个或多个属性

```html
<img v-bind:src="imageSrc" />
<!-- 简写 -->
<img :src="imageSrc" />

<!-- 绑定 class -->
<div :class="{ active: isActive, 'text-danger': hasError }"></div>
<div :class="[activeClass, errorClass]"></div>

<!-- 绑定 style -->
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
<div :style="[baseStyles, overridingStyles]"></div>

<!-- 绑定多个属性 -->
<div v-bind="objectOfAttrs"></div>
```

## 其他重要指令

**v-slot** (简写为 #) - 插槽

```html
<!-- 默认插槽 -->
<template v-slot:default>
  <p>默认内容</p>
</template>

<!-- 具名插槽 -->
<template v-slot:header>
  <h1>标题</h1>
</template>

<!-- 简写 -->
<template #header>
  <h1>标题</h1>
</template>

<!-- 作用域插槽 -->
<template v-slot:default="slotProps">
  <span>{{ slotProps.user.firstName }}</span>
</template>
```

**v-pre** - 跳过这个元素和它的子元素的编译过程

```html
<span v-pre>{{ 这里不会被编译 }}</span>
```

**v-cloak** - 保持在元素上直到关联实例结束编译

```html
<div v-cloak>
  {{ message }}
</div>
```

**v-once** - 只渲染元素和组件一次

```html
<h1 v-once>{{ title }}</h1>
```

**v-memo** (Vue 3.2+) - 缓存子树

```html
<div v-memo="[valueA, valueB]">
  <!-- 只有当 valueA 或 valueB 改变时才重新渲染 -->
</div>
```

## 自定义指令

Vue 还支持创建自定义指令：

```javascript
// 全局注册
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 使用
<input v-focus />
```

这些指令构成了 Vue 模板语法的核心，通过它们可以实现数据绑定、事件处理、条件渲染、列表渲染等各种功能。在实际开发中，合理使用这些指令能够让你的 Vue 应用更加高效和易维护。