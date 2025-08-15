# User.ts 文件优化改进文档

## 📋 概述

本文档详细记录了对 `src/api/modules/user.ts` 文件的全面优化改进，以及如何将这些优化模式应用到其他文件的步骤指南。

## 🔄 改进内容总结

### 1. 类型定义优化

#### 改进前
```typescript
// 缺少完整的类型定义
interface Address {
  id: number;
  name: string;
  // ... 基础字段
}

// 使用 any 类型
addAddress: (data: any) => httpClient.post('/user/shipping-addresses', data)
```

#### 改进后
```typescript
// 完整的类型定义
export interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 精确的类型约束
export type CreateAddressData = Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAddressData = Partial<Omit<Address, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateProfileData = UpdateUserProfile & { avatar?: File };

// 响应类型
export interface MessageResponse {
  message: string;
  success?: boolean;
}
```

### 2. 常量配置集中管理

#### 改进前
```typescript
// 硬编码的 URL 和配置
httpClient.put('/buyer/profile', formData)
httpClient.get('/user/shipping-addresses')
```

#### 改进后
```typescript
// 集中的 API 端点配置
const API_ENDPOINTS = {
  // 用户相关
  PROFILE: '/buyer/profile',
  PASSWORD: '/buyer/password',
  
  // 地址相关
  ADDRESSES: '/user/shipping-addresses',
  ADDRESS_BY_ID: (id: number) => `/user/shipping-addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: number) => `/user/shipping-addresses/${id}/default`,
  
  // 心愿单相关
  WISHLIST: '/buyer/wishlist',
  WISHLIST_ITEM: (productId: number) => `/buyer/wishlist/${productId}`,
} as const;

// 业务配置
const CONFIG = {
  DEBOUNCE_DELAY: 1000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
```

### 3. 参数验证和错误处理

#### 改进前
```typescript
// 无参数验证
changePassword: (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => httpClient.put('/buyer/password', data)
```

#### 改进后
```typescript
// 完整的参数验证
async changePassword(data: ChangePasswordData): Promise<MessageResponse> {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error('新密码和确认密码不匹配');
  }
  
  if (data.newPassword.length < 6) {
    throw new Error('密码长度不能少于6位');
  }
  
  return await httpClient.put<MessageResponse>(API_ENDPOINTS.PASSWORD, data);
}

// 文件验证
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    return { valid: false, error: `文件大小不能超过 ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  
  if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return { valid: false, error: '只支持 JPEG、PNG、WebP 格式的图片' };
  }
  
  return { valid: true };
}

// ID 验证
async deleteAddress(id: number): Promise<MessageResponse> {
  if (!id || id <= 0) {
    throw new Error('无效的地址ID');
  }
  
  return await httpClient.delete<MessageResponse>(API_ENDPOINTS.ADDRESS_BY_ID(id));
}
```

### 4. 代码结构优化

#### 改进前
```typescript
// 平铺的对象结构
export const userApi = {
  updateProfile: (data) => { /* ... */ },
  changePassword: (data) => { /* ... */ },
  getAddresses: () => { /* ... */ },
  // ...
};
```

#### 改进后
```typescript
// 面向对象的类结构
class UserApiService {
  // ==================== 用户资料相关 ====================
  
  private async _updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    // 私有方法实现
  }

  updateProfile = debounce(async (data: UpdateProfileData): Promise<UserProfile> => {
    // 公共方法，带防抖
  }, CONFIG.DEBOUNCE_DELAY);

  async changePassword(data: ChangePasswordData): Promise<MessageResponse> {
    // 参数验证 + 业务逻辑
  }

  // ==================== 地址管理相关 ====================
  
  async getAddresses(): Promise<Address[]> { /* ... */ }
  async addAddress(data: CreateAddressData): Promise<Address> { /* ... */ }
  async updateAddress(id: number, data: UpdateAddressData): Promise<Address> { /* ... */ }

  // ==================== 心愿单相关 ====================
  
  async getWishlist(): Promise<Product[]> { /* ... */ }
  async toggleWishlist(productId: number): Promise<MessageResponse> { /* ... */ }
}

// 创建并导出实例
export const userApi = new UserApiService();
```

### 5. 工具函数优化

#### 改进前
```typescript
// 基础防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  // 返回 void，不支持 Promise
}
```

#### 改进后
```typescript
// 支持 Promise 的防抖函数
function debounce<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      const later = () => {
        timeout = null;
        func(...args).then(resolve).catch(reject);
      };

      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    });
  };
}

// FormData 构建工具
function buildFormData(data: UpdateProfileData): FormData {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'avatar' && value instanceof File) {
        const validation = validateFile(value);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        formData.append(key, value);
      } else if (typeof value === 'string') {
        formData.append(key, value);
      }
    }
  });
  
  return formData;
}
```

### 6. 日志和调试优化

#### 改进前
```typescript
// 简单的日志
console.log('Updating user profile:', data);
```

#### 改进后
```typescript
// 详细的日志信息
updateProfile = debounce(async (data: UpdateProfileData): Promise<UserProfile> => {
  console.log('Updating user profile:', { 
    ...data, 
    avatar: data.avatar ? `File: ${data.avatar.name} (${data.avatar.size} bytes)` : undefined 
  });
  
  const result = await this._updateProfile(data);
  console.log('Profile update successful');
  return result;
}, CONFIG.DEBOUNCE_DELAY);

// 错误处理和日志
private async _updateProfile(data: UpdateProfileData): Promise<UserProfile> {
  try {
    const formData = buildFormData(data);
    
    return await httpClient.put<UserProfile>(API_ENDPOINTS.PROFILE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
}
```

### 7. 测试覆盖优化

#### 改进前
```typescript
// 基础测试
it('应该防止快速重复调用', async () => {
  // 简单的防抖测试
});
```

#### 改进后
```typescript
// 全面的测试覆盖
describe('优化后的 userApi 测试', () => {
  describe('参数验证测试', () => {
    it('应该验证密码修改参数', async () => {
      // 测试密码不匹配
      // 测试密码长度不足
    });

    it('应该验证地址ID参数', async () => {
      // 测试无效ID
    });

    it('应该验证地址必填字段', async () => {
      // 测试必填字段验证
    });
  });

  describe('文件验证测试', () => {
    it('应该验证文件大小', async () => {
      // 测试文件大小限制
    });

    it('应该验证文件类型', async () => {
      // 测试文件类型限制
    });
  });

  describe('API端点测试', () => {
    it('应该使用正确的API端点', async () => {
      // 测试所有API端点
    });
  });
});
```

## 🚀 应用到其他文件的步骤指南

### 步骤 1: 分析现有文件结构

```bash
# 1. 查看文件内容
cat src/api/modules/[target-file].ts

# 2. 识别以下内容：
# - 现有的类型定义
# - API 端点
# - 业务逻辑
# - 错误处理方式
# - 工具函数
```

### 步骤 2: 创建类型定义

```typescript
// 2.1 定义核心数据类型
export interface [EntityName] {
  id: number;
  // ... 所有字段
  createdAt?: string;
  updatedAt?: string;
}

// 2.2 定义操作类型
export type Create[EntityName]Data = Omit<[EntityName], 'id' | 'createdAt' | 'updatedAt'>;
export type Update[EntityName]Data = Partial<Omit<[EntityName], 'id' | 'createdAt' | 'updatedAt'>>;

// 2.3 定义响应类型
export interface [EntityName]Response {
  data: [EntityName];
  message?: string;
}

export interface MessageResponse {
  message: string;
  success?: boolean;
}
```

### 步骤 3: 提取常量配置

```typescript
// 3.1 API 端点配置
const API_ENDPOINTS = {
  // 基础端点
  [ENTITY]: '/api/[entity]',
  [ENTITY]_BY_ID: (id: number) => `/api/[entity]/${id}`,
  
  // 特殊操作端点
  [SPECIAL_ACTION]: (id: number) => `/api/[entity]/${id}/[action]`,
} as const;

// 3.2 业务配置
const CONFIG = {
  DEBOUNCE_DELAY: 1000,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png'],
  // ... 其他配置
} as const;
```

### 步骤 4: 添加验证函数

```typescript
// 4.1 参数验证
function validateId(id: number, entityName: string = 'entity'): void {
  if (!id || id <= 0) {
    throw new Error(`无效的${entityName}ID`);
  }
}

// 4.2 数据验证
function validate[EntityName]Data(data: Create[EntityName]Data): void {
  if (!data.requiredField) {
    throw new Error('必填字段不能为空');
  }
  
  // 其他验证逻辑
}

// 4.3 文件验证（如果需要）
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    return { valid: false, error: '文件大小超出限制' };
  }
  
  if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: '不支持的文件类型' };
  }
  
  return { valid: true };
}
```

### 步骤 5: 重构为类结构

```typescript
// 5.1 创建服务类
class [EntityName]ApiService {
  // ==================== 基础 CRUD 操作 ====================
  
  async get[EntityName]List(): Promise<[EntityName][]> {
    return await httpClient.get<[EntityName][]>(API_ENDPOINTS.[ENTITY]);
  }

  async get[EntityName]ById(id: number): Promise<[EntityName]> {
    validateId(id, '[entity name]');
    return await httpClient.get<[EntityName]>(API_ENDPOINTS.[ENTITY]_BY_ID(id));
  }

  async create[EntityName](data: Create[EntityName]Data): Promise<[EntityName]> {
    validate[EntityName]Data(data);
    return await httpClient.post<[EntityName]>(API_ENDPOINTS.[ENTITY], data);
  }

  async update[EntityName](id: number, data: Update[EntityName]Data): Promise<[EntityName]> {
    validateId(id, '[entity name]');
    return await httpClient.put<[EntityName]>(API_ENDPOINTS.[ENTITY]_BY_ID(id), data);
  }

  async delete[EntityName](id: number): Promise<MessageResponse> {
    validateId(id, '[entity name]');
    return await httpClient.delete<MessageResponse>(API_ENDPOINTS.[ENTITY]_BY_ID(id));
  }

  // ==================== 特殊操作 ====================
  
  async [specialAction](id: number, data?: any): Promise<MessageResponse> {
    validateId(id, '[entity name]');
    return await httpClient.post<MessageResponse>(API_ENDPOINTS.[SPECIAL_ACTION](id), data);
  }
}

// 5.2 创建并导出实例
export const [entityName]Api = new [EntityName]ApiService();
```

### 步骤 6: 添加防抖处理（如果需要）

```typescript
// 6.1 对需要防抖的方法应用防抖
class [EntityName]ApiService {
  // 私有方法
  private async _update[EntityName](id: number, data: Update[EntityName]Data): Promise<[EntityName]> {
    validateId(id, '[entity name]');
    
    try {
      console.log(`Updating [entity name] ${id}:`, data);
      const result = await httpClient.put<[EntityName]>(API_ENDPOINTS.[ENTITY]_BY_ID(id), data);
      console.log(`[EntityName] update successful`);
      return result;
    } catch (error) {
      console.error(`[EntityName] update failed:`, error);
      throw error;
    }
  }

  // 公共方法（带防抖）
  update[EntityName] = debounce(async (id: number, data: Update[EntityName]Data): Promise<[EntityName]> => {
    return await this._update[EntityName](id, data);
  }, CONFIG.DEBOUNCE_DELAY);
}
```

### 步骤 7: 编写测试

```typescript
// 7.1 创建测试文件
// src/api/modules/__tests__/[entity-name].test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { [entityName]Api } from '../[entity-name]';

// 7.2 Mock httpClient
vi.mock('@/utils/http', () => ({
  httpClient: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({ id: 1 }),
    put: vi.fn().mockResolvedValue({ id: 1 }),
    delete: vi.fn().mockResolvedValue({ message: 'success' })
  }
}));

// 7.3 编写测试用例
describe('[EntityName]Api 测试', () => {
  describe('参数验证测试', () => {
    it('应该验证ID参数', async () => {
      await expect([entityName]Api.get[EntityName]ById(0)).rejects.toThrow('无效的[entity name]ID');
    });

    it('应该验证必填字段', async () => {
      await expect([entityName]Api.create[EntityName]({
        // 缺少必填字段
      })).rejects.toThrow('必填字段不能为空');
    });
  });

  describe('API 调用测试', () => {
    it('应该正确调用 API 端点', async () => {
      const { httpClient } = await import('@/utils/http');
      
      await [entityName]Api.get[EntityName]List();
      expect(httpClient.get).toHaveBeenCalledWith('/api/[entity]');

      await [entityName]Api.get[EntityName]ById(1);
      expect(httpClient.get).toHaveBeenCalledWith('/api/[entity]/1');
    });
  });
});
```

### 步骤 8: 更新导入和使用

```typescript
// 8.1 更新其他文件中的导入
// 从
import { userApi } from '@/api/modules/user';

// 到
import { [entityName]Api } from '@/api/modules/[entity-name]';

// 8.2 更新使用方式
// 从
const result = await userApi.updateProfile(data);

// 到
const result = await [entityName]Api.update[EntityName](id, data);
```

## 📋 检查清单

在应用优化到其他文件时，请确保完成以下检查：

### ✅ 类型定义
- [ ] 完整的接口定义
- [ ] 精确的类型约束
- [ ] 导出所有必要的类型

### ✅ 常量管理
- [ ] API 端点集中配置
- [ ] 业务配置集中管理
- [ ] 使用 `as const` 确保类型安全

### ✅ 参数验证
- [ ] ID 参数验证
- [ ] 必填字段验证
- [ ] 文件验证（如果适用）
- [ ] 业务规则验证

### ✅ 错误处理
- [ ] 详细的错误信息
- [ ] 错误日志记录
- [ ] 异常传播

### ✅ 代码结构
- [ ] 类结构组织
- [ ] 方法分组
- [ ] 私有方法保护
- [ ] 清晰的注释

### ✅ 工具函数
- [ ] 防抖处理（如果需要）
- [ ] 数据构建工具
- [ ] 验证工具函数

### ✅ 测试覆盖
- [ ] 参数验证测试
- [ ] API 调用测试
- [ ] 错误处理测试
- [ ] 边界条件测试

### ✅ 文档和注释
- [ ] JSDoc 注释
- [ ] 参数说明
- [ ] 返回值说明
- [ ] 使用示例

## 🎯 最佳实践建议

1. **渐进式重构**：不要一次性重构整个文件，按模块逐步进行
2. **保持向后兼容**：确保现有代码不会因重构而破坏
3. **测试先行**：在重构前编写测试，确保功能不变
4. **代码审查**：重构后进行代码审查，确保质量
5. **文档更新**：及时更新相关文档和注释

通过遵循这些步骤和最佳实践，您可以将 `user.ts` 的优化模式成功应用到项目中的其他 API 文件，提升整个项目的代码质量和可维护性。
