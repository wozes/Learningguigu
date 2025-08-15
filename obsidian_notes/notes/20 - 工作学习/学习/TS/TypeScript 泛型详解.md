# TypeScript 泛型详解

用最简单的方式理解泛型

## 🤔 什么是泛型？

**泛型就像是一个"占位符"或"变量"，但它代表的是类型而不是值。**

想象一下生活中的例子：

### 📦 快递盒子的比喻

你有一个快递盒子，这个盒子可以装：

- 衣服
- 书籍
- 电子产品
- 食物

但是，**在装东西之前，你需要告诉快递员这个盒子里装的是什么类型的物品**，这样：

- 快递员知道怎么处理
- 收件人知道里面是什么
- 运输过程更安全

泛型就是这个道理！

## 🔍 没有泛型的问题

### 问题1：类型不明确

```typescript
// 这个函数返回什么类型？不知道！
function getFirstItem(items: any[]): any {
  return items[0];
}

const numbers = [1, 2, 3];
const first = getFirstItem(numbers); // first 是什么类型？any！

// 你不知道 first 有什么方法可以用
first.toFixed(2); // 可能出错，因为 first 可能不是数字
```

### 问题2：重复代码

```typescript
// 为每种类型写一个函数，太麻烦了！
function getFirstNumber(items: number[]): number {
  return items[0];
}

function getFirstString(items: string[]): string {
  return items[0];
}

function getFirstUser(items: User[]): User {
  return items[0];
}

// ... 还要写很多很多
```

## ✨ 泛型解决方案

### 基础语法

```typescript
// T 就是泛型，你可以叫它任何名字（T、K、V、Type 等）
function getFirstItem<T>(items: T[]): T {
  return items[0];
}

// 使用时指定具体类型
const numbers = [1, 2, 3];
const firstNumber = getFirstItem<number>(numbers); // firstNumber 是 number 类型

const names = ['张三', '李四'];
const firstName = getFirstItem<string>(names); // firstName 是 string 类型
```

### 🎯 实际应用例子

## 例子1：API 响应

```typescript
// 定义通用的 API 响应结构
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T; // T 是占位符，具体用什么类型后面再定
}

// 用户数据
interface User {
  id: number;
  name: string;
  email: string;
}

// 分类数据
interface Category {
  id: number;
  name: string;
  parent_id?: number;
}

// 现在可以这样使用：
const userResponse: ApiResponse<User> = {
  code: 200,
  message: 'success',
  data: {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com'
  }
};

const categoryResponse: ApiResponse<Category[]> = {
  code: 200,
  message: 'success',
  data: [
    { id: 1, name: '电子产品' },
    { id: 2, name: '服装' }
  ]
};

// TypeScript 知道 userResponse.data 是 User 类型
console.log(userResponse.data.name); // ✅ 有智能提示

// TypeScript 知道 categoryResponse.data 是 Category[] 类型  
console.log(categoryResponse.data[0].name); // ✅ 有智能提示
```

## 例子2：通用函数

```typescript
// 通用的数组处理函数
function findById<T>(items: T[], id: number, idField: keyof T): T | undefined {
  return items.find(item => item[idField] === id);
}

// 使用
const users: User[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' }
];

const categories: Category[] = [
  { id: 1, name: '电子产品' },
  { id: 2, name: '服装' }
];

// 查找用户
const user = findById(users, 1, 'id'); // user 的类型是 User | undefined

// 查找分类
const category = findById(categories, 1, 'id'); // category 的类型是 Category | undefined
```

## 例子3：Vue 3 中的应用

```typescript
// 定义通用的数据获取 Hook
function useApi<T>(apiFunction: () => Promise<T>) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async () => {
    try {
      loading.value = true;
      error.value = null;
      data.value = await apiFunction();
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, error, execute };
}

// 在组件中使用
<script setup lang="ts">
// 获取用户列表
const { 
  data: users, 
  loading: usersLoading, 
  execute: fetchUsers 
} = useApi<User[]>(() => userApi.getUsers());

// 获取分类列表  
const { 
  data: categories, 
  loading: categoriesLoading, 
  execute: fetchCategories 
} = useApi<Category[]>(() => categoryApi.getCategories());

onMounted(() => {
  fetchUsers();
  fetchCategories();
});
</script>

<template>
  <div>
    <!-- users 的类型是 User[] | null，有智能提示 -->
    <div v-if="usersLoading">加载用户中...</div>
    <ul v-else-if="users">
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>

    <!-- categories 的类型是 Category[] | null，有智能提示 -->
    <div v-if="categoriesLoading">加载分类中...</div>
    <ul v-else-if="categories">
      <li v-for="category in categories" :key="category.id">
        {{ category.name }}
      </li>
    </ul>
  </div>
</template>
```

## 🔧 回到你的代码

你的接口代码可以这样改进：

### 原来的代码

```typescript
getCategories: async (parentId?: number): Promise<Category[]> => {
  const response = await httpClient.get('/public/categories', {
    params: { parent_id: parentId },
  });
  return response.categories; // response 是什么类型？不知道！
}
```

### 使用泛型后

```typescript
getCategories: async (parentId?: number): Promise<Category[]> => {
  // 明确告诉 TypeScript 期望的响应结构
  const response = await httpClient.get<ApiResponse<{ categories: Category[] }>>(
    '/public/categories',
    {
      params: { parent_id: parentId },
    }
  );
  
  // 现在 TypeScript 知道 response.data.categories 是 Category[] 类型
  return response.data.categories; // ✅ 有智能提示，类型安全
}
```

## 🎨 常见的泛型约定

```typescript
// 常用的泛型名称约定
T    // Type 的缩写，最常用
K    // Key 的缩写，通常表示对象的键
V    // Value 的缩写，通常表示对象的值
U    // 第二个类型参数
R    // Return 的缩写，表示返回类型

// 例子
interface KeyValuePair<K, V> {
  key: K;
  value: V;
}

const stringToNumber: KeyValuePair<string, number> = {
  key: 'age',
  value: 25
};

const numberToString: KeyValuePair<number, string> = {
  key: 1,
  value: '张三'
};
```

## 🔒 泛型约束

有时候你需要限制泛型的类型：

```typescript
// 约束 T 必须有 id 属性
interface HasId {
  id: number;
}

function updateItem<T extends HasId>(item: T, updates: Partial<T>): T {
  return { ...item, ...updates };
}

// 使用
const user = { id: 1, name: '张三', email: 'test@example.com' };
const updatedUser = updateItem(user, { name: '李四' }); // ✅

const invalidItem = { name: '没有id' };
const result = updateItem(invalidItem, { name: '新名字' }); // ❌ 报错：缺少 id 属性
```

## 💡 简单记忆方法

1. **泛型 = 类型的变量**
   - 就像函数参数一样，但操作的是类型而不是值
2. **<T> 就是声明一个类型变量**
   - `<T>` = "这里有一个叫 T 的类型变量"
   - `<T, K, V>` = "这里有三个类型变量"
3. **使用时要"传入"具体类型**
   - `Array<string>` = 字符串数组
   - `Promise<User>` = 返回 User 的 Promise
   - `ApiResponse<Category[]>` = 数据是 Category 数组的 API 响应

## 🎯 总结

**泛型的本质**：让同一段代码能够处理多种类型，同时保持类型安全。

**日常使用**：

- API 响应：`ApiResponse<User>`
- 数组：`Array<string>`
- Promise：`Promise<Category[]>`
- Vue Ref：`ref<User | null>`

**记住**：泛型不是为了炫技，而是为了：

1. 减少重复代码
2. 保持类型安全
3. 获得更好的 IDE 支持

从你的项目开始，先在 API 响应中使用泛型，这是最常见也最实用的场景！