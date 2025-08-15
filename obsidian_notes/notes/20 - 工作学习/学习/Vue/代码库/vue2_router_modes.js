// 1. Hash 模式 (默认)
const router = new VueRouter({
  mode: 'hash',
  routes
})
// URL: http://example.com/#/about

// 2. History 模式 (需要后端支持)
const router = new VueRouter({
  mode: 'history',
  routes
})
// URL: http://example.com/about

// 3. Abstract 模式 (用于非浏览器环境)
const router = new VueRouter({
  mode: 'abstract',
  routes
})

// History模式需要后端配置示例 (Apache)
/*
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
*/

// Nginx配置
/*
location / {
  try_files $uri $uri/ /index.html;
}
*/