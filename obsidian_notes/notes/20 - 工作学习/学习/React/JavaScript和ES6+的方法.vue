import React, { useState, useEffect } from 'react';

const JSMethodsDemo = () => {
  const [activeTab, setActiveTab] = useState('array');
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  // 示例数据
  const sampleData = {
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    users: [
      { id: 1, name: '张三', age: 25, city: '北京' },
      { id: 2, name: '李四', age: 30, city: '上海' },
      { id: 3, name: '王五', age: 28, city: '北京' },
      { id: 4, name: '赵六', age: 22, city: '深圳' }
    ],
    fruits: ['苹果', '香蕉', '橙子', '葡萄', '草莓']
  };

  // 数组方法示例
  const arrayMethods = [
    {
      name: 'map()',
      description: '创建新数组，每个元素都经过处理函数',
      example: `// 将数字数组每个元素乘以2
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// 提取用户名称
const users = ${JSON.stringify(sampleData.users, null, 2)};
const names = users.map(user => user.name);
console.log(names);`,
      code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log('原数组:', numbers);
console.log('翻倍后:', doubled);

const users = ${JSON.stringify(sampleData.users)};
const names = users.map(user => user.name);
console.log('用户名:', names);`
    },
    {
      name: 'filter()',
      description: '筛选符合条件的元素，返回新数组',
      example: `// 筛选偶数
const numbers = [1, 2, 3, 4, 5, 6];
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log(evenNumbers); // [2, 4, 6]

// 筛选年龄大于25的用户
const adults = users.filter(user => user.age > 25);`,
      code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log('偶数:', evenNumbers);

const users = ${JSON.stringify(sampleData.users)};
const adults = users.filter(user => user.age > 25);
console.log('年龄>25的用户:', adults);`
    },
    {
      name: 'find()',
      description: '找到第一个符合条件的元素',
      example: `// 找到第一个偶数
const numbers = [1, 3, 5, 6, 7];
const firstEven = numbers.find(num => num % 2 === 0);
console.log(firstEven); // 6

// 根据ID找用户
const user = users.find(user => user.id === 2);`,
      code: `const numbers = [1, 3, 5, 6, 7, 8];
const firstEven = numbers.find(num => num % 2 === 0);
console.log('第一个偶数:', firstEven);

const users = ${JSON.stringify(sampleData.users)};
const user = users.find(user => user.id === 2);
console.log('ID为2的用户:', user);`
    },
    {
      name: 'reduce()',
      description: '将数组归纳为单个值',
      example: `// 求和
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

// 按城市分组用户
const groupedByCity = users.reduce((acc, user) => {
  acc[user.city] = acc[user.city] || [];
  acc[user.city].push(user);
  return acc;
}, {});`,
      code: `const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log('数组求和:', sum);

const users = ${JSON.stringify(sampleData.users)};
const groupedByCity = users.reduce((acc, user) => {
  acc[user.city] = acc[user.city] || [];
  acc[user.city].push(user);
  return acc;
}, {});
console.log('按城市分组:', groupedByCity);`
    },
    {
      name: 'forEach()',
      description: '遍历数组，对每个元素执行函数（无返回值）',
      example: `// 打印每个元素
const fruits = ['苹果', '香蕉', '橙子'];
fruits.forEach((fruit, index) => {
  console.log(\`\${index}: \${fruit}\`);
});`,
      code: `const fruits = ['苹果', '香蕉', '橙子'];
const output = [];
fruits.forEach((fruit, index) => {
  output.push(\`\${index}: \${fruit}\`);
});
console.log('遍历结果:');
output.forEach(item => console.log(item));`
    }
  ];

  // ES6+ 方法示例
  const es6Methods = [
    {
      name: '解构赋值',
      description: '从数组或对象中提取值',
      example: `// 数组解构
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first, second, rest); // 1 2 [3, 4, 5]

// 对象解构
const user = { name: '张三', age: 25, city: '北京' };
const { name, age } = user;
console.log(name, age); // 张三 25`,
      code: `// 数组解构
const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;
console.log('第一个:', first);
console.log('第二个:', second);
console.log('剩余的:', rest);

// 对象解构
const user = { name: '张三', age: 25, city: '北京' };
const { name, age, city } = user;
console.log(\`姓名: \${name}, 年龄: \${age}, 城市: \${city}\`);

// 重命名
const { name: userName, age: userAge } = user;
console.log('重命名后:', userName, userAge);`
    },
    {
      name: '展开运算符(...)',
      description: '展开数组或对象',
      example: `// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log(combined); // [1, 2, 3, 4, 5, 6]

// 对象展开
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 };`,
      code: `// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log('合并数组:', combined);

// 复制数组
const original = [1, 2, 3];
const copy = [...original];
console.log('复制数组:', copy);

// 对象展开
const user = { name: '张三', age: 25 };
const updatedUser = { ...user, age: 26, city: '北京' };
console.log('更新用户:', updatedUser);`
    },
    {
      name: '模板字符串',
      description: '使用反引号创建字符串，支持变量插值',
      example: `const name = '张三';
const age = 25;
const message = \`Hello, 我是\${name}，今年\${age}岁\`;
console.log(message);

// 多行字符串
const html = \`
  <div>
    <h1>\${name}</h1>
    <p>年龄: \${age}</p>
  </div>
\`;`,
      code: `const name = '张三';
const age = 25;
const city = '北京';

const message = \`Hello, 我是\${name}，今年\${age}岁，来自\${city}\`;
console.log(message);

// 多行字符串
const html = \`
<div class="user-card">
  <h2>\${name}</h2>
  <p class="age">年龄: \${age}</p>
  <p class="city">城市: \${city}</p>
</div>\`;
console.log('HTML模板:');
console.log(html);`
    },
    {
      name: '箭头函数',
      description: '更简洁的函数语法',
      example: `// 传统函数
function add(a, b) {
  return a + b;
}

// 箭头函数
const add = (a, b) => a + b;

// 单参数可省略括号
const double = x => x * 2;

// 多行需要大括号
const complexFunction = (x, y) => {
  const result = x * y;
  return result + 10;
};`,
      code: `// 不同形式的箭头函数
const add = (a, b) => a + b;
const square = x => x * x;
const greet = name => \`Hello, \${name}!\`;

console.log('加法:', add(5, 3));
console.log('平方:', square(4));
console.log('问候:', greet('张三'));

// 在数组方法中使用
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2);
const sum = numbers.reduce((acc, x) => acc + x, 0);

console.log('原数组:', numbers);
console.log('翻倍:', doubled);
console.log('求和:', sum);`
    }
  ];

  // 对象方法示例
  const objectMethods = [
    {
      name: 'Object.keys()',
      description: '获取对象的所有键',
      example: `const user = { name: '张三', age: 25, city: '北京' };
const keys = Object.keys(user);
console.log(keys); // ['name', 'age', 'city']`,
      code: `const user = { name: '张三', age: 25, city: '北京' };
const keys = Object.keys(user);
console.log('对象的键:', keys);

// 遍历对象
keys.forEach(key => {
  console.log(\`\${key}: \${user[key]}\`);
});`
    },
    {
      name: 'Object.values()',
      description: '获取对象的所有值',
      example: `const user = { name: '张三', age: 25, city: '北京' };
const values = Object.values(user);
console.log(values); // ['张三', 25, '北京']`,
      code: `const user = { name: '张三', age: 25, city: '北京' };
const values = Object.values(user);
console.log('对象的值:', values);

const sum = Object.values({ a: 1, b: 2, c: 3 }).reduce((acc, val) => acc + val, 0);
console.log('数值对象求和:', sum);`
    },
    {
      name: 'Object.entries()',
      description: '获取对象的键值对数组',
      example: `const user = { name: '张三', age: 25, city: '北京' };
const entries = Object.entries(user);
console.log(entries); // [['name', '张三'], ['age', 25], ['city', '北京']]`,
      code: `const user = { name: '张三', age: 25, city: '北京' };
const entries = Object.entries(user);
console.log('键值对:', entries);

// 转换为Map
const userMap = new Map(entries);
console.log('转换为Map:', userMap);

// 重新构建对象
const newUser = Object.fromEntries(entries);
console.log('重新构建:', newUser);`
    }
  ];

  // 字符串方法示例
  const stringMethods = [
    {
      name: 'includes()',
      description: '检查字符串是否包含指定子串',
      example: `const text = 'Hello World';
console.log(text.includes('World')); // true
console.log(text.includes('world')); // false (区分大小写)`,
      code: `const text = 'Hello World, 你好世界';
console.log('包含World:', text.includes('World'));
console.log('包含world:', text.includes('world'));
console.log('包含你好:', text.includes('你好'));

const fruits = ['苹果', '香蕉', '橙子'];
const searchTerm = '苹';
const filtered = fruits.filter(fruit => fruit.includes(searchTerm));
console.log('包含"苹"的水果:', filtered);`
    },
    {
      name: 'startsWith() / endsWith()',
      description: '检查字符串开头或结尾',
      example: `const filename = 'document.pdf';
console.log(filename.startsWith('doc')); // true
console.log(filename.endsWith('.pdf')); // true`,
      code: `const files = ['document.pdf', 'image.jpg', 'script.js', 'readme.txt'];

const pdfFiles = files.filter(file => file.endsWith('.pdf'));
const docFiles = files.filter(file => file.startsWith('doc'));

console.log('PDF文件:', pdfFiles);
console.log('以doc开头:', docFiles);

const url = 'https://www.example.com';
console.log('HTTPS协议:', url.startsWith('https://'));`
    },
    {
      name: 'split() / join()',
      description: '字符串分割和数组连接',
      example: `// 分割字符串
const text = 'apple,banana,orange';
const fruits = text.split(',');
console.log(fruits); // ['apple', 'banana', 'orange']

// 连接数组
const joined = fruits.join(' | ');
console.log(joined); // 'apple | banana | orange'`,
      code: `// 分割字符串
const csv = '张三,25,北京';
const userInfo = csv.split(',');
console.log('用户信息:', userInfo);

// 处理路径
const path = '/home/user/documents/file.txt';
const pathParts = path.split('/');
console.log('路径部分:', pathParts);

// 连接数组
const words = ['Hello', 'World', '你好', '世界'];
const sentence = words.join(' ');
console.log('连接结果:', sentence);

// 不同分隔符
console.log('用-连接:', words.join('-'));
console.log('用|连接:', words.join(' | '));`
    }
  ];

  const methodCategories = {
    array: { title: '数组方法', methods: arrayMethods },
    es6: { title: 'ES6+ 特性', methods: es6Methods },
    object: { title: '对象方法', methods: objectMethods },
    string: { title: '字符串方法', methods: stringMethods }
  };

  const runCode = (codeToRun) => {
    setError('');
    try {
      // 重写console.log来捕获输出
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      // 执行代码
      eval(codeToRun);
      
      // 恢复console.log
      console.log = originalLog;
      
      setResult(logs.join('\n'));
    } catch (err) {
      setError(err.message);
      setResult('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">JavaScript & ES6+ 方法大全</h1>
        <p className="text-gray-600">前端开发必备的JS方法和ES6+特性</p>
      </div>

      {/* 标签栏 */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.entries(methodCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>

      {/* 方法列表 */}
      <div className="space-y-6">
        {methodCategories[activeTab].methods.map((method, index) => (
          <div key={index} className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">{method.name}</h3>
              <p className="text-gray-600">{method.description}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* 代码示例 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">💡 示例说明:</h4>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border">
                  <code>{method.example}</code>
                </pre>
              </div>

              {/* 可执行代码 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">🚀 运行代码:</h4>
                  <button
                    onClick={() => runCode(method.code)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    执行
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto border">
                  <code>{method.code}</code>
                </pre>
              </div>
            </div>

            {/* 执行结果 */}
            {(result || error) && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">📋 执行结果:</h4>
                <pre className={`p-4 rounded-lg text-sm overflow-x-auto ${
                  error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {error || result}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 实用提示 */}
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🎯 学习建议</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• 多练习数组方法，React中用得最多</li>
            <li>• 理解不可变性，避免直接修改原数组</li>
            <li>• 掌握解构赋值，简化代码</li>
            <li>• 熟练使用箭头函数</li>
            <li>• 学会链式调用：filter().map().reduce()</li>
          </ul>
        </div>

        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">⚡ React中的应用</h3>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• map() - 渲染列表组件</li>
            <li>• filter() - 筛选显示数据</li>
            <li>• find() - 查找特定项目</li>
            <li>• reduce() - 计算聚合值</li>
            <li>• 展开运算符 - 更新state</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JSMethodsDemo;