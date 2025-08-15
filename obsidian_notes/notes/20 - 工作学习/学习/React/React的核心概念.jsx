import React, { useState, useEffect } from 'react';

// 1. 函数组件 - React的基本构建块
const Welcome = ({ name }) => {
  return <h2>Hello, {name}!</h2>;
};

// 2. 使用useState进行状态管理
const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-2">计数器组件</h3>
      <p className="mb-2">当前计数: {count}</p>
      <div className="space-x-2">
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          增加
        </button>
        <button 
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          减少
        </button>
        <button 
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          重置
        </button>
      </div>
    </div>
  );
};

// 3. 表单处理和受控组件
const TodoForm = ({ onAddTodo }) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleSubmit = () => {
    if (inputValue.trim()) {
      onAddTodo(inputValue.trim());
      setInputValue('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入新任务..."
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          添加
        </button>
      </div>
    </div>
  );
};

// 4. 列表渲染和条件渲染
const TodoList = ({ todos, onToggleTodo, onDeleteTodo }) => {
  if (todos.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        还没有任务，添加一个吧！
      </div>
    );
  }
  
  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <li 
          key={todo.id} 
          className={`flex items-center justify-between p-3 border rounded-lg ${
            todo.completed ? 'bg-gray-100 opacity-60' : 'bg-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggleTodo(todo.id)}
              className="w-4 h-4"
            />
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.text}
            </span>
          </div>
          <button
            onClick={() => onDeleteTodo(todo.id)}
            className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            删除
          </button>
        </li>
      ))}
    </ul>
  );
};

// 5. useEffect - 副作用处理
const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  
  // useEffect相当于Vue的mounted + updated
  useEffect(() => {
    console.log('组件挂载或todos更新了', todos);
  }, [todos]);
  
  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const completedCount = todos.filter(todo => todo.completed).length;
  
  return (
    <div className="p-4 border rounded-lg bg-green-50">
      <h3 className="text-lg font-semibold mb-4">待办事项应用</h3>
      <TodoForm onAddTodo={addTodo} />
      
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          全部 ({todos.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          未完成 ({todos.length - completedCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          已完成 ({completedCount})
        </button>
      </div>
      
      <TodoList 
        todos={filteredTodos} 
        onToggleTodo={toggleTodo}
        onDeleteTodo={deleteTodo}
      />
    </div>
  );
};

// 主组件
const ReactLearningDemo = () => {
  const [currentExample, setCurrentExample] = useState('counter');
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">React 核心概念学习</h1>
        <p className="text-gray-600">从Vue到React的学习指南</p>
      </div>
      
      {/* 示例选择器 */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setCurrentExample('counter')}
          className={`px-4 py-2 rounded-lg ${currentExample === 'counter' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          计数器
        </button>
        <button
          onClick={() => setCurrentExample('todo')}
          className={`px-4 py-2 rounded-lg ${currentExample === 'todo' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          待办应用
        </button>
      </div>
      
      {/* Vue vs React 对比 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 border rounded-lg bg-green-50">
          <h3 className="text-lg font-semibold mb-2 text-green-700">Vue.js 风格</h3>
          <pre className="text-sm bg-white p-3 rounded overflow-x-auto">
{`// Vue 组合式API
<template>
  <div>{{ count }}</div>
  <button @click="increment">+</button>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
const increment = () => {
  count.value++
}
</script>`}
          </pre>
        </div>
        
        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">React 风格</h3>
          <pre className="text-sm bg-white p-3 rounded overflow-x-auto">
{`// React Hooks
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>
        +
      </button>
    </div>
  )
}`}
          </pre>
        </div>
      </div>
      
      {/* 交互示例 */}
      <div>
        <Welcome name="Vue工程师" />
        {currentExample === 'counter' && <Counter />}
        {currentExample === 'todo' && <TodoApp />}
      </div>
      
      {/* 核心概念说明 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">🎯 核心差异</h4>
          <ul className="text-sm space-y-1">
            <li>• JSX替代模板语法</li>
            <li>• useState管理状态</li>
            <li>• useEffect处理副作用</li>
            <li>• Props向下传递</li>
            <li>• 函数式组件为主</li>
          </ul>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">💡 学习建议</h4>
          <ul className="text-sm space-y-1">
            <li>• 理解JSX语法</li>
            <li>• 掌握Hook概念</li>
            <li>• 熟悉状态提升</li>
            <li>• 学习Context API</li>
            <li>• 了解生命周期对比</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReactLearningDemo;