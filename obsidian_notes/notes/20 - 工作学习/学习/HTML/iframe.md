iframe（内联框架）是HTML中的一个元素，用于在当前网页中嵌入另一个HTML文档。它本质上是在页面中创建一个"窗口"，可以显示来自同一网站或不同网站的内容。

## 主要用处

**内容嵌入**：可以在页面中嵌入其他网页、地图、视频、表单等内容，而不需要用户离开当前页面。

**模块化开发**：将复杂的应用拆分成独立的模块，每个模块可以独立开发和维护。

**第三方集成**：嵌入广告、支付系统、社交媒体插件、在线客服等第三方服务。

**安全隔离**：iframe中的内容与父页面相对隔离，可以防止恶意脚本影响主页面。

## 基本使用方法

```html
<!-- 基本语法 -->
<iframe src="https://example.com" width="800" height="600"></iframe>

<!-- 嵌入YouTube视频 -->
<iframe 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    width="560" 
    height="315"
    frameborder="0"
    allowfullscreen>
</iframe>

<!-- 嵌入Google地图 -->
<iframe 
    src="https://www.google.com/maps/embed?pb=..." 
    width="600" 
    height="450"
    style="border:0;"
    allowfullscreen=""
    loading="lazy">
</iframe>
```

## 常用属性

- `src`：指定要嵌入的页面URL
- `width/height`：设置iframe的宽度和高度
- `frameborder`：设置边框（0表示无边框）
- `scrolling`：控制滚动条显示（auto、yes、no）
- `sandbox`：启用安全限制
- `allow`：控制iframe的权限策略

## 注意事项

**跨域限制**：由于同源策略，不同域的iframe与父页面之间的交互会受到限制。

**性能影响**：每个iframe都会创建新的浏览上下文，可能影响页面加载速度。

**响应式设计**：需要特别处理iframe在移动设备上的显示效果。

**安全考虑**：使用sandbox属性可以增强安全性，限制iframe中内容的行为。

现代Web开发中，虽然iframe仍有其用途，但许多场景下会优先考虑使用AJAX、组件化框架或Web Components等更现代的解决方案。