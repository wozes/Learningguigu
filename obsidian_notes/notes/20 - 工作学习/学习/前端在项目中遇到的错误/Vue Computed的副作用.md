# Vue3 Computed 不重新执行的解决方案

## 问题描述

在 Vue3 中，`computed` 只有在依赖的响应式数据发生变化时才会重新执行。如果页面再次进入时依赖数据没有变化，computed 就不会重新计算。

## 核心原理

- `computed` 是基于依赖追踪的，只有依赖变化才会重新计算
- 需要手动触发依赖更新或改用其他响应式方案

## 解决方案

### 方案1：重新获取数据（推荐）

**适用场景**：需要重新调用接口获取最新数据

```javascript
import { ref, computed, onMounted } from 'vue'

const product = ref(null)

const serialNumber = computed(() => {
  if(!product.value) return '';
  return String(product.value.serial_number);
});

// 每次进入页面时重新获取数据
onMounted(async () => {
  product.value = await fetchProductData() // 重新调用接口
})

// 如果使用了 keep-alive，用 onActivated
import { onActivated } from 'vue'
onActivated(async () => {
  product.value = await fetchProductData()
})
```

### 方案2：强制刷新触发器

**适用场景**：数据不需要重新获取，但需要重新计算

```javascript
import { ref, computed, onMounted } from 'vue'

const refreshTrigger = ref(0)

const serialNumber = computed(() => {
  refreshTrigger.value; // 添加这个依赖（重要！）
  if(!product.value) return '';
  return String(product.value.serial_number);
});

// 页面进入时触发刷新
onMounted(() => {
  refreshTrigger.value++
})
```

### 方案3：改用 ref + watch

**适用场景**：需要更细粒度的控制

```javascript
import { ref, watch, onMounted } from 'vue'

const product = ref(null)
const serialNumber = ref('')

// 监听 product 变化
watch(product, (newProduct) => {
  if(!newProduct) {
    serialNumber.value = ''
  } else {
    serialNumber.value = String(newProduct.serial_number)
  }
}, { immediate: true })

// 页面进入时重新获取数据
onMounted(async () => {
  product.value = await fetchProductData()
})
```

### 方案4：路由级别的数据刷新

**适用场景**：需要在路由变化时刷新数据

```javascript
import { onBeforeRouteEnter } from 'vue-router'

const serialNumber = computed(() => {
  if(!product.value) return '';
  return String(product.value.serial_number);
});

onBeforeRouteEnter(async () => {
  // 每次路由进入时重新获取数据
  product.value = await fetchProductData()
})
```

### 方案5：使用 key 强制重新渲染

**适用场景**：需要强制整个组件重新渲染

```vue
<template>
  <div :key="pageKey">
    <!-- 你的内容 -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const pageKey = ref(0)
    
    onMounted(() => {
      // 每次进入页面时更新key
      pageKey.value = Date.now()
    })
    
    return { pageKey }
  }
}
</script>
```

## 常见错误和注意事项

### 1. 导入问题

```javascript
// ❌ 错误：忘记导入
watch(product, ...)

// ✅ 正确：记得导入
import { watch } from 'vue'
watch(product, ...)
```

### 2. 依赖追踪问题

```javascript
// ❌ 错误：没有正确添加依赖
const computed = computed(() => {
  // refreshTrigger 没有被使用，不会建立依赖关系
  if(!product.value) return '';
  return String(product.value.serial_number);
});

// ✅ 正确：确保依赖被访问
const computed = computed(() => {
  refreshTrigger.value; // 这行代码建立了依赖关系
  if(!product.value) return '';
  return String(product.value.serial_number);
});
```

### 3. 生命周期选择

```javascript
// 普通组件用 onMounted
onMounted(() => {
  // 组件挂载时执行
})

// keep-alive 组件用 onActivated
onActivated(() => {
  // 组件激活时执行
})
```

## 选择建议

1. **数据需要重新获取** → 使用方案1（重新获取数据）
2. **数据不变，但计算逻辑需要重新执行** → 使用方案2（强制刷新触发器）
3. **需要复杂的响应式逻辑** → 使用方案3（ref + watch）
4. **路由级别的数据管理** → 使用方案4（路由守卫）
5. **简单粗暴的重新渲染** → 使用方案5（key 强制渲染）

## 完整示例

```javascript
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const product = ref(null)
    
    // 你的原始代码
    const serialNumber = computed(() => {
      if(!product.value) return '';
      return String(product.value.serial_number);
    });
    
    // 解决方案：每次进入页面时重新获取数据
    onMounted(async () => {
      try {
        product.value = await fetchProductData()
      } catch (error) {
        console.error('获取产品数据失败:', error)
      }
    })
    
    return {
      serialNumber
    }
  }
}
```

记住这个核心原则：**computed 只有在依赖变化时才会重新执行，所以要么让依赖变化，要么改用其他响应式方案**。