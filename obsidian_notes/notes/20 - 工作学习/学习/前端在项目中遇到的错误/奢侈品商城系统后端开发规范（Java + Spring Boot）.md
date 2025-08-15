- ## ✅ 奢侈品商城系统 Cursor 开发规范规则（Java + Spring Boot）

  > ✳️ 项目背景：面向 NFT + 区块链交易场景的轻奢奢侈品商城系统，支持用户、商家、管理员三类角色。

  ------

  ### 🧱 1. 项目结构规范（Maven 模块）

  ```
  com.luxmall
  ├── auth         # 认证模块
  ├── buyer        # 买家模块
  ├── seller       # 卖家模块
  ├── admin        # 管理员模块
  ├── product      # 商品模块
  ├── order        # 订单模块
  ├── nft          # NFT 查询模块
  ├── common       # 公共模块（工具类、通用响应、异常）
  ├── config       # Spring Boot 配置
  ```

  ------

  ### 📦 2. 包命名 & 类命名规范

  | 层级     | 位置                       | 命名示例                               |
  | -------- | -------------------------- | -------------------------------------- |
  | 控制器类 | `controller`               | `OrderController`, `ProductController` |
  | 服务类   | `service` / `service.impl` | `UserService`, `UserServiceImpl`       |
  | DAO接口  | `mapper` / `repository`    | `OrderMapper`, `ProductRepository`     |
  | 实体类   | `entity`                   | `UserEntity`, `ProductEntity`          |
  | DTO类    | `dto`                      | `CreateOrderDTO`, `LoginDTO`           |
  | VO类     | `vo`                       | `OrderDetailVO`, `ProductListVO`       |
  | 响应封装 | `Result<T>`                | 所有 API 返回统一格式封装类            |

  ------

  ### 📘 3. REST 接口 URL 规范（结合 PDF 接口文档）

  所有接口以 `/api` 为统一前缀：

  #### 🔐 认证模块 `/auth`

  - `POST /auth/register` 用户注册
  - `POST /auth/login` 用户登录
  - `POST /auth/logout` 用户登出
  - `POST /auth/refresh` 刷新 Token

  #### 👤 买家模块 `/buyer`

  - `GET /buyer/products` 商品列表（支持筛选分页）
  - `GET /buyer/products/{product_id}` 商品详情
  - `POST /buyer/orders` 创建订单
  - `GET /buyer/orders` 查询订单列表
  - `GET /buyer/orders/{order_id}` 查询订单详情
  - `PUT /buyer/orders/{order_id}/cancel` 取消订单
  - `POST /buyer/orders/{order_id}/pay` 支付订单（支持链上交易）
  - `POST /buyer/orders/{order_id}/confirm` 确认收货

  #### 🛒 卖家模块 `/seller`

  - `POST /seller/products` 创建商品（自动铸造 NFT）
  - `GET /seller/products` 查询商品
  - `PUT /seller/products/{product_id}` 更新商品
  - `DELETE /seller/products/{product_id}` 删除商品
  - `GET /seller/orders` 查询订单
  - `PUT /seller/orders/{order_id}/ship` 发货标记

  #### 🧑‍⚖️ 管理员模块 `/admin`

  - `GET /admin/users` 用户列表
  - `PUT /admin/users/{user_id}/kyc` 审核用户 KYC
  - `GET /admin/products` 所有商品
  - `PUT /admin/products/{product_id}/status` 修改商品状态（如强制下架）
  - `GET /admin/orders` 所有订单
  - `GET /admin/orders/{order_id}` 查看订单详情

  #### 🖼️ NFT 查询模块 `/nft`

  - `GET /nft/{token_id}` NFT详情
  - `GET /nft/history/{token_id}` NFT 历史记录

  ------

  ### 🧬 4. 命名与注释规范

  - 类名：大驼峰命名
  - 方法：小驼峰，动宾结构（如 `createOrder`, `getProductDetail`）
  - 参数：使用 DTO 封装，严禁直接暴露实体类
  - 所有方法需使用 JavaDoc 注释：

  ```java
  /**
   * 用户登录
   * @param loginDTO 登录请求参数
   * @return 登录成功返回 token 信息
   */
  public Result<TokenVO> login(LoginDTO loginDTO);
  ```

  ------

  ### 📤 5. 响应封装规范

  #### 5.1 响应封装类 `Result<T>` 格式

  所有 REST API 必须返回统一格式的响应，使用 `Result<T>` 类封装。`Result<T>` 位于 `common` 模块的 `com.luxmall.common.response` 包中，结构如下：

  ```java
  package com.luxmall.common.response;
  
  import lombok.Data;
  import java.io.Serializable;
  
  /**
   * 统一响应封装类
   * @param <T> 响应数据类型
   */
  @Data
  public class Result<T> implements Serializable {
      /**
       * 状态码，0 表示成功，非 0 表示失败
       */
      private int code;
  
      /**
       * 响应消息，描述操作结果或错误原因，支持国际化
       */
      private String message;
  
      /**
       * 响应数据，成功时返回业务数据，失败时通常为 null
       */
      private T data;
  
      /**
       * 私有构造方法，禁止直接实例化
       */
      private Result() {}
  
      /**
       * 成功响应，无数据
       * @return Result 实例
       */
      public static <T> Result<T> success() {
          Result<T> result = new Result<>();
          result.setCode(0);
          result.setMessage("操作成功");
          result.setData(null);
          return result;
      }
  
      /**
       * 成功响应，带数据
       * @param data 响应数据
       * @return Result 实例
       */
      public static <T> Result<T> success(T data) {
          Result<T> result = new Result<>();
          result.setCode(0);
          result.setMessage("操作成功");
          result.setData(data);
          return result;
      }
  
      /**
       * 失败响应，带错误码和消息
       * @param code 错误码
       * @param message 错误消息
       * @return Result 实例
       */
      public static <T> Result<T> failure(int code, String message) {
          Result<T> result = new Result<>();
          result.setCode(code);
          result.setMessage(message);
          result.setData(null);
          return result;
      }
  }
  ```

  #### 5.2 响应结构

  - **成功响应**：

    - `code`：固定为 `0`，表示操作成功。

    - `message`：描述成功信息，默认“操作成功”，支持国际化。

    - `data`：返回业务数据（如 `TokenVO`, `OrderDetailVO`），无数据时为 `null`。

    - 示例（

      ```
      /auth/login
      ```

       成功，中文环境）：

      ```json
      {
          "code": 0,
          "message": "登录成功",
          "data": {
              "token": "eyJhbGciOiJIUzI1NiJ9...",
              "expireTime": "2025-05-02T10:00:00"
          }
      }
      ```

  - **失败响应**：

    - `code`：非 0，表示错误，具体值参考错误码定义。

    - `message`：描述错误原因，支持国际化，便于前端展示和调试。

    - `data`：通常为 `null`，特殊场景可返回错误详情。

    - 示例（

      ```
      /auth/login
      ```

       失败，英文环境）：

      ```json
      {
          "code": 1001,
          "message": "Invalid username or password",
          "data": null
      }
      ```

  #### 5.3 错误码定义

  错误码统一在 `common` 模块的 `com.luxmall.common.enums` 包中定义，使用 `ErrorCode` 枚举类，消息支持国际化：

  ```java
  package com.luxmall.common.enums;
  
  /**
   * 错误码枚举
   */
  public enum ErrorCode {
      SUCCESS(0, "success"),
      INVALID_PARAM(1001, "invalid_param"),
      USER_NOT_FOUND(1002, "user_not_found"),
      AUTH_FAILED(1003, "auth_failed"),
      PERMISSION_DENIED(1004, "permission_denied"),
      PRODUCT_NOT_FOUND(2001, "product_not_found"),
      ORDER_NOT_FOUND(2002, "order_not_found"),
      INSUFFICIENT_STOCK(2003, "insufficient_stock"),
      PAYMENT_FAILED(2004, "payment_failed"),
      SYSTEM_ERROR(5000, "system_error");
  
      private final int code;
      private final String messageKey;
  
      ErrorCode(int code, String messageKey) {
          this.code = code;
          this.messageKey = messageKey;
      }
  
      public int getCode() {
          return code;
      }
  
      public String getMessageKey() {
          return messageKey;
      }
  }
  ```

  - 规范

    ：

    - 错误码按模块划分：`1xxx` 为认证相关，`2xxx` 为业务相关，`5xxx` 为系统相关。
    - `messageKey` 对应国际化资源文件中的键，用于动态获取本地化消息。
    - 新增错误码需在 `ErrorCode` 枚举中定义，并更新国际化资源文件。

  #### 5.4 国际化（i18n）支持

  ##### 5.4.1 配置国际化

  - **消息资源文件**：

    - 存储在 `src/main/resources/i18n` 目录下，命名格式为 `messages_{locale}.properties`。

    - 支持的语言：简体中文（`zh_CN`）、英文（`en_US`），可按需扩展。

    - 示例文件：

      - ```
        messages_zh_CN.properties
        ```

        ：

        ```properties
        success=操作成功
        invalid_param=参数无效
        user_not_found=用户不存在
        auth_failed=用户名或密码错误
        permission_denied=权限不足
        product_not_found=商品不存在
        order_not_found=订单不存在
        insufficient_stock=商品库存不足
        payment_failed=支付失败
        system_error=系统错误，请稍后重试
        ```

      - ```
        messages_en_US.properties
        ```

        ：

        ```properties
        success=Operation successful
        invalid_param=Invalid parameter
        user_not_found=User not found
        auth_failed=Invalid username or password
        permission_denied=Permission denied
        product_not_found=Product not found
        order_not_found=Order not found
        insufficient_stock=Insufficient stock
        payment_failed=Payment failed
        system_error=System error, please try again later
        ```

  - **Spring 配置**：

    - 在 

      ```
      application.yml
      ```

       中配置 

      ```
      MessageSource
      ```

      ：

      ```yaml
      spring:
        messages:
          basename: i18n/messages
          encoding: UTF-8
          fallback-to-system-locale: false
      ```

    - 定义 

      ```
      MessageSource
      ```

       Bean：

      ```java
      @Configuration
      public class I18nConfig {
          @Bean
          public MessageSource messageSource() {
              ResourceBundleMessageSource source = new ResourceBundleMessageSource();
              source.setBasename("i18n/messages");
              source.setDefaultEncoding("UTF-8");
              return source;
          }
      }
      ```

  - **语言选择**：

    - 通过 HTTP 请求头 `Accept-Language` 确定语言（如 `zh-CN`, `en-US`）。

    - 使用 Spring 的 

      ```
      LocaleResolver
      ```

       解析语言：

      ```java
      @Bean
      public LocaleResolver localeResolver() {
          AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
          resolver.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
          return resolver;
      }
      ```

  ##### 5.4.2 获取国际化消息

  - 使用 `MessageSource` 获取本地化消息，结合 `LocaleContextHolder`：

    ```java
    @Autowired
    private MessageSource messageSource;
    
    private String getMessage(String key) {
        return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
    }
    ```

  - 在 `Result<T>` 中动态设置国际化消息：

    ```java
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(0);
        result.setMessage(messageSource.getMessage("success", null, LocaleContextHolder.getLocale()));
        result.setData(data);
        return result;
    }
    
    public static <T> Result<T> failure(ErrorCode errorCode) {
        Result<T> result = new Result<>();
        result.setCode(errorCode.getCode());
        result.setMessage(messageSource.getMessage(errorCode.getMessageKey(), null, LocaleContextHolder.getLocale()));
        result.setData(null);
        return result;
    }
    ```

  ##### 5.4.3 Controller 层使用

  - 示例（`AuthController`）：

    ```java
    @RestController
    @RequestMapping("/api/auth")
    public class AuthController {
        @Autowired
        private AuthService authService;
        @Autowired
        private MessageSource messageSource;
    
        /**
         * 用户登录
         * @param loginDTO 登录参数
         * @return 登录结果
         */
        @PostMapping("/login")
        public Result<TokenVO> login(@Validated @RequestBody LoginDTO loginDTO) {
            try {
                TokenVO token = authService.login(loginDTO);
                return Result.success(token);
            } catch (AuthException e) {
                return Result.failure(ErrorCode.AUTH_FAILED);
            }
        }
    }
    ```

  - **响应示例**：

    - 英文环境（

      ```
      Accept-Language: en-US
      ```

      ）：

      ```json
      {
          "code": 1003,
          "message": "Invalid username or password",
          "data": null
      }
      ```

    - 中文环境（

      ```
      Accept-Language: zh-CN
      ```

      ）：

      ```json
      {
          "code": 1003,
          "message": "用户名或密码错误",
          "data": null
      }
      ```

  ##### 5.4.4 异常处理

  - 在全局异常处理中使用国际化消息：

    ```java
    @ControllerAdvice
    public class GlobalExceptionHandler {
        @Autowired
        private MessageSource messageSource;
    
        @ExceptionHandler(ValidationException.class)
        public Result<?> handleValidationException(ValidationException e) {
            String message = messageSource.getMessage("invalid_param", null, LocaleContextHolder.getLocale());
            return Result.failure(ErrorCode.INVALID_PARAM.getCode(), message);
        }
    
        @ExceptionHandler(Exception.class)
        public Result<?> handleGeneralException(Exception e) {
            String message = messageSource.getMessage("system_error", null, LocaleContextHolder.getLocale());
            return Result.failure(ErrorCode.SYSTEM_ERROR.getCode(), message);
        }
    }
    ```

  #### 5.5 使用规范

  1. **Controller 层**：

     - 所有 Controller 方法返回 `Result<T>` 类型，T 为具体的 VO 类。

     - 成功响应使用 `Result.success(data)` 或 `Result.success()`，自动获取国际化消息。

     - 失败响应使用 `Result.failure(ErrorCode)`，确保消息从国际化资源获取。

     - 示例：

       ```java
       if (product == null) {
           return Result.failure(ErrorCode.PRODUCT_NOT_FOUND);
       }
       ```

  2. **异常处理**：

     - 所有异常通过 `@ControllerAdvice` 转换为 `Result<T>` 格式，消息使用 `MessageSource` 获取。

     - 记录失败日志，包含国际化消息：

       ```java
       logger.error("登录失败，用户名: {}, 错误: {}", loginDTO.getUsername(), getMessage("auth_failed"));
       ```

  3. **一致性要求**：

     - 所有 API 响应包含 `code`, `message`, `data` 字段。
     - 成功响应的 `code` 固定为 `0`，失败响应使用 `ErrorCode` 定义的错误码。
     - 消息必须通过 `MessageSource` 获取，支持国际化。

  4. **序列化**：

     - `Result<T>` 实现 `Serializable`，支持分布式系统序列化。
     - 使用 Jackson 序列化，确保字段名与 JSON 一致。

  #### 5.6 常见场景示例

  1. **登录成功（中文环境）**：

     ```java
     TokenVO token = new TokenVO("eyJhbGciOiJIUzI1NiJ9...", "2025-05-02T10:00:00");
     return Result.success(token);
     ```

     JSON 输出：

     ```json
     {
         "code": 0,
         "message": "操作成功",
         "data": {
             "token": "eyJhbGciOiJIUzI1NiJ9...",
             "expireTime": "2025-05-02T10:00:00"
         }
     }
     ```

  2. **参数错误（英文环境）**：

     ```java
     return Result.failure(ErrorCode.INVALID_PARAM);
     ```

     JSON 输出：

     ```json
     {
         "code": 1001,
         "message": "Invalid parameter",
         "data": null
     }
     ```

  3. **库存不足（中文环境）**：

     ```java
     return Result.failure(ErrorCode.INSUFFICIENT_STOCK);
     ```

     JSON 输出：

     ```json
     {
         "code": 2003,
         "message": "商品库存不足",
         "data": null
     }
     ```

  #### 5.7 扩展与维护

  1. **新增错误码**：

     - 在 `ErrorCode` 枚举中添加新错误码，定义 `messageKey`。

     - 更新 `messages_{locale}.properties` 文件，添加对应的多语言消息。

     - 示例：

       ```java
       PAYMENT_TIMEOUT(2005, "payment_timeout")
       ```

       ```properties
       # messages_zh_CN.properties
       payment_timeout=支付超时
       # messages_en_US.properties
       payment_timeout=Payment timeout
       ```

  2. **新增语言支持**：

     - 创建新的资源文件，如 `messages_ja_JP.properties`。
     - 更新 `LocaleResolver` 支持新语言。
     - 测试多语言切换，确保消息正确显示。

  3. **消息动态参数**：

     - 支持带参数的国际化消息：

       ```properties
       invalid_param=参数 {0} 无效
       ```

       ```java
       String message = messageSource.getMessage("invalid_param", new Object[]{"username"}, LocaleContextHolder.getLocale());
       return Result.failure(ErrorCode.INVALID_PARAM.getCode(), message);
       ```

  4. **日志记录**：

     - 失败响应记录日志，包含国际化消息和上下文：

       ```java
       logger.error("支付失败，订单 ID: {}, 错误: {}", orderId, getMessage("payment_failed"));
       ```

  5. **测试**：

     - 编写单元测试，验证多语言消息：

       ```java
       @Test
       public void testI18nMessage() {
           LocaleContextHolder.setLocale(Locale.US);
           String message = messageSource.getMessage("success", null, LocaleContextHolder.getLocale());
           assertEquals("Operation successful", message);
       }
       ```

  #### 5.8 常见问题与解决方案

  1. **问题**：国际化消息未加载
     - **解决方案**：检查 `application.yml` 中的 `spring.messages.basename` 配置，确保路径正确；验证资源文件编码为 UTF-8。
  2. **问题**：语言切换无效
     - **解决方案**：确保请求头包含正确的 `Accept-Language`；检查 `LocaleResolver` 是否正确解析。
  3. **问题**：消息键缺失
     - **解决方案**：在 `messages_{locale}.properties` 中添加缺失的键；使用 `MessageSource` 的默认消息作为回退。
  4. **问题**：动态参数消息格式错误
     - **解决方案**：检查参数数组长度和占位符 `{0}` 是否匹配；使用 `MessageFormat` 验证格式。

  ------

  ### 🛡️ 6. 安全与异常处理

  - 使用 `@ControllerAdvice + @ExceptionHandler` 实现全局异常捕获，返回 `Result<T>` 格式，消息支持国际化。
  - 所有敏感操作加权限注解，如 `@PreAuthorize("hasRole('SELLER')")`。
  - 接口参数验证使用 `@Validated` + `@NotNull/@NotBlank` 等注解。

  ------

  ### 🧪 7. 单元测试规范

  - 使用 JUnit 5
  - 测试类命名格式为 `XxxServiceTest`
  - 每个 Service 类都需对应测试类，包含正常流程 + 异常流程覆盖

  ------

  ### 🗄️ 8. 数据库设计与使用规范

  #### 8.1 数据库技术栈

  - **数据库**：MySQL 8.0+（InnoDB 引擎）
  - **ORM 框架**：MyBatis-Plus（可选择结合 Spring Data JPA）
  - **连接池**：HikariCP
  - **区块链数据**：NFT 相关数据存储于链上（如 Ethereum），链下存储索引信息（如 `token_id`, `metadata_url`）

  #### 8.2 数据库命名规范

  - **数据库名**：全小写，项目缩写，如 `luxmall_db`
  - **表名**：全小写，格式为 `模块_功能`，如 `order_info`, `product_detail`
  - **字段名**：全小写，单词间用下划线分隔，如 `user_id`, `product_name`
  - **索引名**：格式为 `idx_表名_字段名`，如 `idx_order_info_user_id`
  - **唯一约束**：格式为 `uk_表名_字段名`，如 `uk_user_info_username`

  #### 8.3 表设计规范

  - 每张表必须包含以下字段：
    - `id`：BIGINT，自增主键，非空
    - `created_at`：DATETIME，创建时间，非空，默认 `CURRENT_TIMESTAMP`
    - `updated_at`：DATETIME，更新时间，非空，默认 `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
    - `is_deleted`：TINYINT(1)，逻辑删除标志，非空，默认 `0`
  - **外键**：不使用数据库外键，通过程序逻辑控制关联关系
  - **字符集**：统一使用 `utf8mb4`，支持 emoji 和多语言
  - **存储引擎**：统一使用 InnoDB

  #### 8.4 核心表结构

  以下9个表格支持系统的全部功能，覆盖认证、买家/卖家交互、NFT 管理、物流、地址管理和管理员任务。

  **1. 用户表 (`user_info`)**

  - **用途**：支持 `/auth` 和 `/admin/users` 接口，用于用户注册、登录、角色管理和 KYC 审核。
  - **索引**：`idx_user_info_email`, `uk_user_info_username`, `uk_user_info_email`
  - **示例数据**：`id: 1, username: "john_doe", email: "john@example.com", role: "BUYER"`

  | 字段名         | 类型         | 描述                                    | 约束                  | 默认值            |
  | -------------- | ------------ | --------------------------------------- | --------------------- | ----------------- |
  | id             | BIGINT       | 主键，自增                              | PRIMARY KEY, NOT NULL | 无                |
  | username       | VARCHAR(50)  | 用户名，唯一                            | NOT NULL, UNIQUE      | 无                |
  | password_hash  | VARCHAR(255) | 密码哈希                                | NOT NULL              | 无                |
  | email          | VARCHAR(100) | 邮箱，唯一                              | NOT NULL, UNIQUE      | 无                |
  | role           | VARCHAR(20)  | 角色（BUYER, SELLER, ADMIN）            | NOT NULL              | "BUYER"           |
  | kyc_status     | TINYINT(1)   | KYC 状态（0：待审核，1：通过，2：拒绝） | NOT NULL              | 0                 |
  | wallet_address | VARCHAR(66)  | 区块链钱包地址                          | NULL                  | NULL              |
  | created_at     | DATETIME     | 创建时间                                | NOT NULL              | CURRENT_TIMESTAMP |
  | updated_at     | DATETIME     | 更新时间                                | NOT NULL              | CURRENT_TIMESTAMP |
  | is_deleted     | TINYINT(1)   | 逻辑删除标志                            | NOT NULL              | 0                 |

  **2. 商品表 (`product_detail`)**

  - **用途**：支持 `/buyer/products`, `/seller/products`, 和 `/admin/products` 接口。
  - **索引**：`idx_product_detail_seller_id`, `idx_product_detail_category_id`, `uk_product_detail_token_id`
  - **示例数据**：`id: 1, seller_id: 2, name: "Luxury Watch", price: 999.99`

  | 字段名       | 类型          | 描述                     | 约束                  | 默认值            |
  | ------------ | ------------- | ------------------------ | --------------------- | ----------------- |
  | id           | BIGINT        | 主键，自增               | PRIMARY KEY, NOT NULL | 无                |
  | seller_id    | BIGINT        | 卖家 ID                  | NOT NULL              | 无                |
  | name         | VARCHAR(100)  | 商品名称                 | NOT NULL              | 无                |
  | description  | TEXT          | 商品描述                 | NULL                  | NULL              |
  | price        | DECIMAL(10,2) | 价格                     | NOT NULL              | 0.00              |
  | stock        | INT           | 库存                     | NOT NULL              | 0                 |
  | token_id     | VARCHAR(66)   | NFT Token ID             | NULL, UNIQUE          | NULL              |
  | metadata_url | VARCHAR(255)  | NFT 元数据 URL           | NULL                  | NULL              |
  | category_id  | BIGINT        | 分类 ID                  | NOT NULL              | 无                |
  | status       | TINYINT(1)    | 状态（0：下架，1：上架） | NOT NULL              | 0                 |
  | created_at   | DATETIME      | 创建时间                 | NOT NULL              | CURRENT_TIMESTAMP |
  | updated_at   | DATETIME      | 更新时间                 | NOT NULL              | CURRENT_TIMESTAMP |
  | is_deleted   | TINYINT(1)    | 逻辑删除标志             | NOT NULL              | 0                 |

  **3. 订单表 (`order_info`)**

  - **用途**：支持 `/buyer/orders`, `/seller/orders`, 和 `/admin/orders` 接口。
  - **索引**：`idx_order_info_buyer_id`, `idx_order_info_seller_id`, `idx_order_info_shipping_id`
  - **示例数据**：`id: 1, buyer_id: 1, seller_id: 2, order_amount: 999.99`

  | 字段名       | 类型          | 描述                                                 | 约束                  | 默认值            |
  | ------------ | ------------- | ---------------------------------------------------- | --------------------- | ----------------- |
  | id           | BIGINT        | 主键，自增                                           | PRIMARY KEY, NOT NULL | 无                |
  | buyer_id     | BIGINT        | 买家 ID                                              | NOT NULL              | 无                |
  | seller_id    | BIGINT        | 卖家 ID                                              | NOT NULL              | 无                |
  | product_id   | BIGINT        | 商品 ID                                              | NOT NULL              | 无                |
  | order_amount | DECIMAL(10,2) | 订单金额                                             | NOT NULL              | 0.00              |
  | status       | VARCHAR(20)   | 状态（PENDING, PAID, SHIPPED, COMPLETED, CANCELLED） | NOT NULL              | "PENDING"         |
  | tx_hash      | VARCHAR(66)   | 区块链交易哈希                                       | NULL                  | NULL              |
  | shipping_id  | BIGINT        | 物流 ID                                              | NULL                  | NULL              |
  | address_id   | BIGINT        | 收货地址 ID                                          | NOT NULL              | 无                |
  | created_at   | DATETIME      | 创建时间                                             | NOT NULL              | CURRENT_TIMESTAMP |
  | updated_at   | DATETIME      | 更新时间                                             | NOT NULL              | CURRENT_TIMESTAMP |
  | is_deleted   | TINYINT(1)    | 逻辑删除标志                                         | NOT NULL              | 0                 |

  **4. NFT 历史表 (`nft_history`)**

  - **用途**：支持 `/nft/history/{token_id}` 接口。
  - **索引**：`idx_nft_history_token_id`, `idx_nft_history_event_timestamp`
  - **示例数据**：`id: 1, token_id: "0xabc123", event_type: "MINT"`

  | 字段名          | 类型        | 描述                             | 约束                  | 默认值            |
  | --------------- | ----------- | -------------------------------- | --------------------- | ----------------- |
  | id              | BIGINT      | 主键，自增                       | PRIMARY KEY, NOT NULL | 无                |
  | token_id        | VARCHAR(66) | NFT Token ID                     | NOT NULL              | 无                |
  | event_type      | VARCHAR(50) | 事件类型（MINT, TRANSFER, SALE） | NOT NULL              | 无                |
  | from_address    | VARCHAR(66) | 发送者钱包地址                   | NULL                  | NULL              |
  | to_address      | VARCHAR(66) | 接收者钱包地址                   | NOT NULL              | 无                |
  | tx_hash         | VARCHAR(66) | 区块链交易哈希                   | NULL                  | NULL              |
  | event_timestamp | DATETIME    | 事件时间                         | NOT NULL              | CURRENT_TIMESTAMP |
  | created_at      | DATETIME    | 创建时间                         | NOT NULL              | CURRENT_TIMESTAMP |
  | updated_at      | DATETIME    | 更新时间                         | NOT NULL              | CURRENT_TIMESTAMP |
  | is_deleted      | TINYINT(1)  | 逻辑删除标志                     | NOT NULL              | 0                 |

  **5. 商品分类表 (`product_category`)**

  - **用途**：支持 `/buyer/products` 分类筛选。
  - **索引**：`idx_product_category_parent_id`
  - **示例数据**：`id: 1, name: "Jewelry", parent_id: NULL`

  | 字段名     | 类型        | 描述                     | 约束                  | 默认值            |
  | ---------- | ----------- | ------------------------ | --------------------- | ----------------- |
  | id         | BIGINT      | 主键，自增               | PRIMARY KEY, NOT NULL | 无                |
  | name       | VARCHAR(50) | 分类名称（如珠宝、时尚） | NOT NULL              | 无                |
  | parent_id  | BIGINT      | 父分类 ID                | NULL                  | NULL              |
  | created_at | DATETIME    | 创建时间                 | NOT NULL              | CURRENT_TIMESTAMP |
  | updated_at | DATETIME    | 更新时间                 | NOT NULL              | CURRENT_TIMESTAMP |
  | is_deleted | TINYINT(1)  | 逻辑删除标志             | NOT NULL              | 0                 |

  **6. 支付表 (`payment_info`)**

  - **用途**：支持 `/buyer/orders/{order_id}/pay` 接口。
  - **索引**：`idx_payment_info_order_id`, `idx_payment_info_status`
  - **示例数据**：`id: 1, order_id: 1, amount: 999.99`

  | 字段名         | 类型          | 描述                                 | 约束                  | 默认值            |
  | -------------- | ------------- | ------------------------------------ | --------------------- | ----------------- |
  | id             | BIGINT        | 主键，自增                           | PRIMARY KEY, NOT NULL | 无                |
  | order_id       | BIGINT        | 订单 ID                              | NOT NULL              | 无                |
  | amount         | DECIMAL(10,2) | 支付金额                             | NOT NULL              | 0.00              |
  | payment_method | VARCHAR(50)   | 支付方式（CRYPTO, FIAT）             | NOT NULL              | "CRYPTO"          |
  | tx_hash        | VARCHAR(66)   | 区块链交易哈希                       | NULL                  | NULL              |
  | status         | VARCHAR(20)   | 支付状态（PENDING, SUCCESS, FAILED） | NOT NULL              | "PENDING"         |
  | created_at     | DATETIME      | 创建时间                             | NOT NULL              | CURRENT_TIMESTAMP |
  | updated_at     | DATETIME      | 更新时间                             | NOT NULL              | CURRENT_TIMESTAMP |
  | is_deleted     | TINYINT(1)    | 逻辑删除标志                         | NOT NULL              | 0                 |

  **7. 物流表 (`shipping_info`)**

  - **用途**：支持 `/seller/orders/{order_id}/ship` 和 `/buyer/orders/{order_id}/confirm` 接口。
  - **索引**：`idx_shipping_info_order_id`, `idx_shipping_info_tracking_number`
  - **示例数据**：`id: 1, order_id: 1, carrier: "SF Express"`

  | 字段名             | 类型        | 描述                                       | 约束                  | 默认值            |
  | ------------------ | ----------- | ------------------------------------------ | --------------------- | ----------------- |
  | id                 | BIGINT      | 主键，自增                                 | PRIMARY KEY, NOT NULL | 无                |
  | order_id           | BIGINT      | 订单 ID                                    | NOT NULL              | 无                |
  | carrier            | VARCHAR(50) | 物流公司（如顺丰、DHL）                    | NOT NULL              | 无                |
  | tracking_number    | VARCHAR(50) | 运单号                                     | NOT NULL, UNIQUE      | 无                |
  | shipping_status    | VARCHAR(20) | 物流状态（PENDING, IN_TRANSIT, DELIVERED） | NOT NULL              | "PENDING"         |
  | estimated_delivery | DATETIME    | 预计送达时间                               | NULL                  | NULL              |
  | actual_delivery    | DATETIME    | 实际送达时间                               | NULL                  | NULL              |
  | created_at         | DATETIME    | 创建时间                                   | NOT NULL              | CURRENT_TIMESTAMP |
  | updated_at         | DATETIME    | 更新时间                                   | NOT NULL              | CURRENT_TIMESTAMP |
  | is_deleted         | TINYINT(1)  | 逻辑删除标志                               | NOT NULL              | 0                 |

  **8. 国家表 (`country`)**

  - **用途**：支持地址管理国际化。
  - **索引**：`idx_country_code`, `uk_country_code`
  - **示例数据**：`id: 1, name: "中国", code: "CN"`

  | 字段名     | 类型         | 描述                     | 约束                  | 默认值            |
  | ---------- | ------------ | ------------------------ | --------------------- | ----------------- |
  | id         | BIGINT       | 主键，自增               | PRIMARY KEY, NOT NULL | 无                |
  | name       | VARCHAR(100) | 国家名称（如中国、美国） | NOT NULL              | 无                |
  | code       | VARCHAR(10)  | 国家代码（如 CN, US）    | NOT NULL, UNIQUE      | 无                |
  | created_at | DATETIME     | 创建时间                 | NOT NULL              | CURRENT_TIMESTAMP |
  | updated_at | DATETIME     | 更新时间                 | NOT NULL              | CURRENT_TIMESTAMP |
  | is_deleted | TINYINT(1)   | 逻辑删除标志             | NOT NULL              | 0                 |

  **9. 地址表 (`address`)**

  - **用途**：支持收货和发货地址管理。
  - **索引**：`idx_address_user_id`, `idx_address_country_id`
  - **示例数据**：`id: 1, user_id: 1, country_id: 1, province: "广东"`

  | 字段名      | 类型         | 描述                         | 约束                  | 默认值            |
  | ----------- | ------------ | ---------------------------- | --------------------- | ----------------- |
  | id          | BIGINT       | 主键，自增                   | PRIMARY KEY, NOT NULL | 无                |
  | user_id     | BIGINT       | 用户 ID                      | NOT NULL              | 无                |
  | country_id  | BIGINT       | 国家 ID                      | NOT NULL              | 无                |
  | province    | VARCHAR(100) | 省份/州                      | NOT NULL              | 无                |
  | city        | VARCHAR(100) | 城市                         | NOT NULL              | 无                |
  | street      | VARCHAR(255) | 街道地址                     | NOT NULL              | 无                |
  | postal_code | VARCHAR(20)  | 邮政编码                     | NULL                  | NULL              |
  | is_default  | TINYINT(1)   | 是否默认地址（0：否，1：是） | NOT NULL              | 0                 |
  | created_at  | DATETIME     | 创建时间                     | NOT NULL              | CURRENT_TIMESTAMP |
  | updated_at  | DATETIME     | 更新时间                     | NOT NULL              | CURRENT_TIMESTAMP |
  | is_deleted  | TINYINT(1)   | 逻辑删除标志                 | NOT NULL              | 0                 |

  #### 8.5 数据库操作规范

  - 使用 MyBatis-Plus 的 `BaseMapper` 提供基础 CRUD 操作
  - 复杂查询使用 XML 配置文件，SQL 语句需添加注释
  - 禁止拼接 SQL，防止 SQL 注入
  - 所有数据库操作需开启事务（`@Transactional`）
  - 分页查询使用 MyBatis-Plus 的 `IPage` 接口
  - 批量操作使用批量插入/更新方法

  #### 8.6 数据库性能优化

  - 索引：为高频查询字段创建索引
  - 缓存：使用 Redis 缓存热点数据
  - 分库分表：订单表按 `buyer_id` 或时间分表
  - 读写分离：主库写，从库读

  #### 8.7 数据库迁移与版本管理

  - 使用 Flyway 管理 schema 变更
  - 迁移文件命名：`V{版本号}__{描述}.sql`
  - 所有变更通过迁移脚本管理，禁止直接修改生产数据库

  #### 8.8 常见问题与解决方案

  - **慢查询**：添加索引，启用缓存
  - **数据不一致**：使用乐观锁或分布式锁
  - **迁移失败**：检查脚本语法，执行回滚

  ------

  ### 📜 9. Git 提交与分支管理规范

  #### 9.1 Git 提交规范

  - **格式**：`[模块/功能]: 简要描述 (任务ID)`
  - **粒度**：单一功能或修复
  - **检查**：运行 `mvn clean test`，格式化代码，提交前 Code Review

  #### 9.2 分支管理规范

  - **分支类型**：`main`, `develop`, `feature/*`, `bugfix/*`, `release/*`, `hotfix/*`

  - 工作流

    ：

    - 新功能：从 `develop` 创建 `feature/*`，合并回 `develop`
    - 修复 Bug：从 `develop` 或 `main` 创建 `bugfix/*`
    - 发布：从 `develop` 创建 `release/*`，合并到 `main` 和 `develop`
    - 紧急修复：从 `main` 创建 `hotfix/*`

  - **PR 规范**：标题 `[模块] 功能描述 (任务ID)`，描述功能、影响、测试情况

  #### 9.3 Git 工具配置

  - 使用 `.gitignore` 忽略无关文件
  - 配置 `pre-commit` 和 `commit-msg` 钩子
  - 集成 CI/CD（如 GitHub Actions）

  #### 9.4 团队协作规范

  - 定期同步 `develop`
  - 每周 Review PR
  - 使用 Jira 管理任务

  #### 9.5 常见问题与解决方案

  - **CI 失败**：修复测试或格式问题
  - **冲突频繁**：缩短分支生命周期
  - **历史混乱**：使用 `Squash and Merge`