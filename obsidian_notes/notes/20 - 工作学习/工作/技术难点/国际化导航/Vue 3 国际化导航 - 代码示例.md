
## 完整实现示例

  

### 1. 全局语言状态配置

  

```typescript

// src/i18n/index.ts

import { createI18n } from 'vue-i18n';

import { ref } from 'vue';

import zhCN from './locales/zh-CN';

import enUS from './locales/en-US';

  

// 创建全局响应式语言状态

export const globalLocale = ref(localStorage.getItem('preferred-language') || 'zh-CN');

  

const i18n = createI18n({

  legacy: false,

  locale: globalLocale.value,

  fallbackLocale: 'zh-CN',

  messages: {

    'zh-CN': zhCN,

    'en-US': enUS,

  }

});

  

export default i18n;

```

  

### 2. 响应式国际化 Composable

  

```typescript

// src/composables/useI18nReactive.ts

import { computed, ComputedRef } from 'vue';

import { useI18n } from 'vue-i18n';

import { globalLocale } from '@/i18n';

  

export function useI18nReactive() {

  const { t, locale } = useI18n();

  

  /**

   * 创建响应式的翻译函数

   */

  const tr = (key: string, params?: any): ComputedRef<string> => {

    return computed(() => {

      const currentLocale = globalLocale.value;

      return t(key, params);

    });

  };

  

  /**

   * 创建响应式的计算属性

   */

  const computedWithLocale = <T>(fn: () => T): ComputedRef<T> => {

    return computed(() => {

      const currentLocale = globalLocale.value;

      return fn();

    });

  };

  

  return {

    t,

    tr,

    locale,

    globalLocale,

    computedWithLocale

  };

}

```

  

### 3. 语言选择器组件

  

```vue

<!-- src/components/LanguageSelector.vue -->

<template>

  <div class="language-selector" @click.stop>

    <div class="current-language" @click="toggleDropdown">

      <span class="language-text">{{ currentLanguage.name }}</span>

      <i class="arrow-icon" :class="{ 'rotated': showDropdown }">▼</i>

    </div>

    <transition name="dropdown">

      <div v-if="showDropdown" class="language-dropdown">

        <div

          v-for="lang in languages"

          :key="lang.code"

          class="language-option"

          :class="{ 'active': lang.code === locale }"

          @click="changeLanguage(lang)"

        >

          <span class="flag">{{ lang.flag }}</span>

          <span class="name">{{ lang.name }}</span>

        </div>

      </div>

    </transition>

  </div>

</template>

  

<script setup lang="ts">

import { ref, computed, onMounted, onUnmounted } from 'vue';

import { useI18n } from 'vue-i18n';

import { globalLocale } from '@/i18n';

  

interface Language {

  code: string;

  name: string;

  flag: string;

}

  

const { locale } = useI18n();

const showDropdown = ref(false);

  

const languages: Language[] = [

  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },

  { code: 'en-US', name: 'English', flag: '🇺🇸' },

  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },

  { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },

];

  

const currentLanguage = computed(() => {

  return languages.find(lang => lang.code === locale.value) || languages[0];

});

  

const toggleDropdown = () => {

  showDropdown.value = !showDropdown.value;

};

  

const changeLanguage = (lang: Language) => {

  locale.value = lang.code;

  globalLocale.value = lang.code; // 同步全局状态

  showDropdown.value = false;

  // 持久化存储

  localStorage.setItem('preferred-language', lang.code);

  // 更新文档属性

  document.documentElement.lang = lang.code;

  document.documentElement.dir = lang.code.startsWith('ar') ? 'rtl' : 'ltr';

  // 发送全局事件

  document.dispatchEvent(new CustomEvent('language-changed', {

    detail: { language: lang.code, languageName: lang.name }

  }));

};

  

// 点击外部关闭下拉菜单

const handleClickOutside = (event: Event) => {

  if (!event.target || !(event.target as Element).closest('.language-selector')) {

    showDropdown.value = false;

  }

};

  

onMounted(() => {

  document.addEventListener('click', handleClickOutside);

});

  

onUnmounted(() => {

  document.removeEventListener('click', handleClickOutside);

});

</script>

```

  

### 4. 导航组件实现

  

```vue

<!-- src/components/Navigation/Navigation.vue -->

<template>

  <nav class="navigation">

    <ul class="navigation__menu">

      <li

        v-for="item in menuItems"

        :key="item.key"

        class="navigation__item"

        :class="{

          'has-submenu': item.children?.length,

          'active': isItemActive(item)

        }"

      >

        <!-- 普通链接 -->

        <router-link

          v-if="!item.children?.length && item.to"

          :to="item.to"

          class="navigation__link"

          :class="{ 'active': isItemActive(item) }"

        >

          {{ getItemLabel(item) }}

        </router-link>

  

        <!-- 带子菜单的链接 -->

        <a

          v-else-if="item.children?.length"

          href="#"

          class="navigation__link"

          @click.prevent="toggleSubMenu(item)"

        >

          {{ getItemLabel(item) }}

          <i class="arrow-icon">▼</i>

        </a>

  

        <!-- 子菜单 -->

        <ul v-if="item.children?.length" class="submenu">

          <li

            v-for="child in item.children"

            :key="child.key"

            class="submenu__item"

          >

            <router-link

              v-if="child.to"

              :to="child.to"

              class="submenu__link"

            >

              {{ getItemLabel(child) }}

            </router-link>

          </li>

        </ul>

      </li>

    </ul>

  </nav>

</template>

  

<script setup lang="ts">

import { useI18n } from 'vue-i18n';

import { useRoute } from 'vue-router';

  

export interface MenuItem {

  key: string;

  label?: string;

  labelKey?: string;

  to?: string;

  exact?: boolean;

  children?: MenuItem[];

  [key: string]: any;

}

  

interface Props {

  menuItems: MenuItem[];

}

  

const props = defineProps<Props>();

const { t } = useI18n();

const route = useRoute();

  

// 获取菜单项标签

const getItemLabel = (item: MenuItem): string => {

  if (item.labelKey) {

    return t(item.labelKey);

  }

  return item.label || item.key;

};

  

// 检查菜单项是否激活

const isItemActive = (item: MenuItem): boolean => {

  if (!item.to) return false;

  if (item.exact) {

    return route.path === item.to;

  }

  return route.path.startsWith(item.to);

};

  

// 切换子菜单

const toggleSubMenu = (item: MenuItem) => {

  // 子菜单切换逻辑

  console.log('Toggle submenu:', item.key);

};

</script>

```

  

### 5. 页面中的使用示例

  

```vue

<!-- src/modules/product/views/BuyerProductListView.vue -->

<template>

  <div class="product-list-view">

    <!-- 面包屑导航 -->

    <div class="breadcrumb-section">

      <el-breadcrumb>

        <el-breadcrumb-item

          v-for="(item, index) in breadcrumbItems"

          :key="index"

          :to="item.to"

        >

          {{ item.title }}

        </el-breadcrumb-item>

      </el-breadcrumb>

    </div>

  

    <!-- 页面标题 -->

    <h1 class="page-title">{{ t('product.products') }}</h1>

  

    <!-- 其他内容 -->

  </div>

</template>

  

<script setup lang="ts">

import { ref, computed } from 'vue';

import { useRoute } from 'vue-router';

import { useI18nReactive } from '@/composables/useI18nReactive';

  

const { t, computedWithLocale } = useI18nReactive();

const route = useRoute();

  

const categoryName = ref<string>('');

const filters = reactive({

  categoryId: route.query.categoryId as string

});

  

// 响应式面包屑

const breadcrumbItems = computedWithLocale(() => {

  const items = [

    {

      title: t('common.home'),

      to: '/'

    },

    {

      title: t('product.products'),

      to: '/buyer/products'

    }

  ];

  

  // 动态添加分类信息

  if (categoryName.value) {

    items.push({

      title: categoryName.value,

      to: `/buyer/products?categoryId=${filters.categoryId}`

    });

  }

  

  return items;

});

</script>

```

  

### 6. 布局组件配置

  

```vue

<!-- src/layouts/MyLayout.vue -->

<template>

  <MainLayout :overrideMenuItems="menuItemsOverride" />

</template>

  

<script setup lang="ts">

import { ref, computed } from 'vue';

import { useUserStore } from '@/stores/user';

import MainLayout from '@/layouts/MainLayout.vue';

import type { MenuItem } from '@/components/Navigation/Navigation.vue';

  

const userStore = useUserStore();

const UserIsSeller = computed(() => userStore.user?.isSeller);

  

// 买家菜单项

const buyerMenuItems = ref<MenuItem[]>([

  {

    key: 'Profile',

    labelKey: 'navigation.myProfile',

    to: '/my/profile',

    exact: true

  },

  {

    key: 'MyOrders',

    labelKey: 'navigation.myOrders',

    to: '/my/buyer/orders'

  },

  {

    key: 'MyCart',

    labelKey: 'navigation.myCart',

    to: '/my/cart'

  }

]);

  

// 卖家菜单项

const sellerMenuItems = ref<MenuItem[]>([

  ...buyerMenuItems.value,

  {

    key: 'divider',

    label: '|',

    disabled: true

  },

  {

    key: 'MyProducts',

    labelKey: 'navigation.myProducts',

    to: '/my/products'

  },

  {

    key: 'SellerOrders',

    labelKey: 'navigation.sellerOrders',

    to: '/my/seller/orders'

  }

]);

  

// 根据用户类型选择菜单

const menuItemsOverride = computed(() => {

  return UserIsSeller.value ? sellerMenuItems.value : buyerMenuItems.value;

});

</script>

```

  

### 7. 应用初始化

  

```typescript

// src/main.ts

import { createApp } from 'vue';

import App from './App.vue';

import router from './router';

import i18n, { globalLocale } from './i18n';

  

// 在应用启动时设置正确的语言

const savedLanguage = localStorage.getItem('preferred-language') || 'zh-CN';

i18n.global.locale.value = savedLanguage;

globalLocale.value = savedLanguage; // 同步全局状态

document.documentElement.lang = savedLanguage;

  

const app = createApp(App);

  

app.use(router);

app.use(i18n);

  

app.mount('#app');

```

  

## 使用说明

  

1. **配置菜单项**：使用 `labelKey` 而不是 `label: t()`

2. **响应式翻译**：使用 `useI18nReactive` composable

3. **语言切换**：通过 `LanguageSelector` 组件

4. **状态同步**：确保 `globalLocale` 与 `locale` 同步

5. **持久化**：语言设置自动保存到 localStorage

  

这套方案确保了完全响应式的国际化导航系统，支持实时语言切换和状态持久化。