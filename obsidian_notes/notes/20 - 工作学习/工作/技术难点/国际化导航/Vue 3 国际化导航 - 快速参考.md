# Vue 3 国际化导航 - 快速参考

  

## 🚀 快速开始

  

### 1. 基础配置

  

```typescript

// src/i18n/index.ts

import { ref } from "vue";

export const globalLocale = ref(

  localStorage.getItem("preferred-language") || "zh-CN"

);

```

  

### 2. 菜单项配置

  

```typescript

// ✅ 正确方式

const menuItems = ref<MenuItem[]>([

  {

    key: "profile",

    labelKey: "navigation.myProfile", // 使用 labelKey

    to: "/my/profile",

  },

]);

  

// ❌ 错误方式

const menuItems = ref<MenuItem[]>([

  {

    key: "profile",

    label: t("navigation.myProfile"), // 避免直接调用 t()

    to: "/my/profile",

  },

]);

```

  

### 3. 响应式翻译

  

```typescript

// 使用 useI18nReactive composable

import { useI18nReactive } from "@/composables/useI18nReactive";

  

const { t, computedWithLocale } = useI18nReactive();

  

const breadcrumbItems = computedWithLocale(() => {

  return [

    { title: t("common.home"), to: "/" },

    { title: t("product.products"), to: "/products" },

  ];

});

```

  

## 📋 核心文件清单

  

### 必需文件

  

- `src/i18n/index.ts` - 全局语言状态

- `src/composables/useI18nReactive.ts` - 响应式国际化 composable

- `src/components/LanguageSelector.vue` - 语言切换组件

- `src/components/Navigation/Navigation.vue` - 导航组件

  

### 配置文件

  

- `src/layouts/MainLayout.vue` - 主布局

- `src/layouts/MyLayout.vue` - 用户页面布局

- `src/layouts/BuyerLayout.vue` - 买家页面布局

  

## 🔧 关键实现

  

### 1. 全局状态同步

  

```typescript

// LanguageSelector.vue

const changeLanguage = (lang: Language) => {

  locale.value = lang.code; // Vue I18n 状态

  globalLocale.value = lang.code; // 全局响应式状态

  localStorage.setItem("preferred-language", lang.code); // 持久化

};

```

  

### 2. 菜单标签获取

  

```typescript

// Navigation.vue

const getItemLabel = (item: MenuItem): string => {

  if (item.labelKey) {

    return t(item.labelKey); // 动态翻译

  }

  return item.label || item.key; // fallback

};

```

  

### 3. 强制重新渲染

  

```vue

<!-- MainLayout.vue -->

<router-view :key="`${$route.fullPath}-${languageUpdateKey}`" />

```

  

## 🎯 最佳实践

  

### DO ✅

  

- 使用 `labelKey` 而不是 `label: t()`

- 使用 `computedWithLocale()` 创建响应式计算属性

- 为所有语言提供完整的翻译

- 提供 fallback 机制

- 使用 TypeScript 类型检查

  

### DON'T ❌

  

- 不要在菜单配置中直接调用 `t()`

- 不要忘记同步 `globalLocale` 状态

- 不要在 computed 中忽略语言依赖

- 不要硬编码文本内容

  

## 🐛 常见问题

  

### Q: 切换语言后菜单没有更新？

  

**A:** 检查是否使用了 `labelKey` 而不是 `label: t()`

  

### Q: 页面刷新后语言设置丢失？

  

**A:** 确保在 `main.ts` 中正确初始化 `globalLocale`

  

### Q: 某些组件的翻译不响应？

  

**A:** 使用 `useI18nReactive` 和 `computedWithLocale`

  

## 📝 检查清单

  

在实现国际化导航时，请确保：

  

- [ ] 所有菜单项使用 `labelKey`

- [ ] 语言切换时同步 `globalLocale`

- [ ] 面包屑使用 `computedWithLocale`

- [ ] 提供完整的翻译文件

- [ ] 测试所有语言的切换

- [ ] 处理 RTL 语言（如阿拉伯语）

- [ ] 添加错误处理和 fallback

  

## 🔗 相关资源

  

- [完整实现原理文档](./i18n-navigation-implementation.md)

- [Vue I18n 官方文档](https://vue-i18n.intlify.dev/)

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

  

## 📞 支持

  

如果遇到问题，请检查：

  

1. 控制台是否有错误信息

2. 翻译键是否存在于所有语言文件中

3. `globalLocale` 状态是否正确更新

4. Navigation 组件是否正确处理 `labelKey`

  

---

  

_最后更新：2024年_