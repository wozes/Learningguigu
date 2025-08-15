# 前端WebSocket使用方式详解

## 1. 原生WebSocket API

### 基本用法

```javascript
// 创建WebSocket连接
const ws = new WebSocket('ws://localhost:8080');

// 连接成功事件
ws.onopen = function(event) {
    console.log('WebSocket连接已建立');
    ws.send('Hello Server!');
};

// 接收消息事件
ws.onmessage = function(event) {
    console.log('收到消息:', event.data);
};

// 连接关闭事件
ws.onclose = function(event) {
    console.log('WebSocket连接已关闭', event.code, event.reason);
};

// 错误事件
ws.onerror = function(error) {
    console.error('WebSocket错误:', error);
};

// 发送消息
ws.send('这是一条消息');

// 主动关闭连接
ws.close();
```

### 使用addEventListener方式

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', function(event) {
    console.log('连接已建立');
});

ws.addEventListener('message', function(event) {
    console.log('收到消息:', event.data);
});

ws.addEventListener('close', function(event) {
    console.log('连接已关闭');
});

ws.addEventListener('error', function(error) {
    console.error('连接错误:', error);
});
```

### 进阶用法 - 封装WebSocket类

```javascript
class WebSocketManager {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            ...options
        };
        this.reconnectAttempts = 0;
        this.ws = null;
        this.isManualClose = false;
        
        this.connect();
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventListeners();
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.reconnect();
        }
    }
    
    setupEventListeners() {
        this.ws.onopen = (event) => {
            console.log('WebSocket连接成功');
            this.reconnectAttempts = 0;
            this.onOpen && this.onOpen(event);
        };
        
        this.ws.onmessage = (event) => {
            this.onMessage && this.onMessage(event);
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭');
            this.onClose && this.onClose(event);
            
            if (!this.isManualClose) {
                this.reconnect();
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.onError && this.onError(error);
        };
    }
    
    reconnect() {
        if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重连 (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, this.options.reconnectInterval);
        } else {
            console.error('超过最大重连次数');
        }
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket未连接，无法发送消息');
        }
    }
    
    close() {
        this.isManualClose = true;
        this.ws && this.ws.close();
    }
}

// 使用示例
const wsManager = new WebSocketManager('ws://localhost:8080');

wsManager.onOpen = (event) => {
    console.log('自定义连接成功处理');
};

wsManager.onMessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('收到数据:', data);
};

wsManager.onClose = (event) => {
    console.log('自定义连接关闭处理');
};

wsManager.onError = (error) => {
    console.error('自定义错误处理:', error);
};
```

## 2. Socket.IO 客户端

### 安装和基本使用

```bash
npm install socket.io-client
```

```javascript
import { io } from 'socket.io-client';

// 创建连接
const socket = io('http://localhost:3000');

// 连接成功
socket.on('connect', () => {
    console.log('Socket.IO连接成功:', socket.id);
});

// 监听服务器消息
socket.on('message', (data) => {
    console.log('收到消息:', data);
});

// 监听自定义事件
socket.on('chat message', (msg) => {
    console.log('聊天消息:', msg);
});

// 发送消息
socket.emit('message', 'Hello Server!');

// 发送自定义事件
socket.emit('chat message', {
    user: 'John',
    text: '这是一条聊天消息',
    timestamp: Date.now()
});

// 连接断开
socket.on('disconnect', (reason) => {
    console.log('连接断开:', reason);
});

// 手动断开连接
socket.disconnect();
```

### Socket.IO 高级用法

```javascript
import { io } from 'socket.io-client';

// 带配置的连接
const socket = io('http://localhost:3000', {
    autoConnect: false, // 手动连接
    reconnection: true, // 自动重连
    reconnectionAttempts: 5, // 重连次数
    reconnectionDelay: 1000, // 重连延迟
    timeout: 20000, // 超时时间
    auth: {
        token: 'your-auth-token'
    },
    query: {
        userId: '12345'
    }
});

// 手动连接
socket.connect();

// 监听连接状态
socket.on('connect', () => {
    console.log('连接成功');
});

socket.on('connect_error', (error) => {
    console.error('连接失败:', error);
});

socket.on('reconnect', (attemptNumber) => {
    console.log('重连成功:', attemptNumber);
});

socket.on('reconnect_error', (error) => {
    console.error('重连失败:', error);
});

// 命名空间
const adminSocket = io('/admin');
adminSocket.on('admin-message', (data) => {
    console.log('管理员消息:', data);
});

// 房间功能
socket.emit('join-room', 'room1');
socket.on('room-message', (data) => {
    console.log('房间消息:', data);
});
```

## 3. SockJS 客户端

### 安装和使用

```bash
npm install sockjs-client
```

```javascript
import SockJS from 'sockjs-client';

// 创建连接
const sock = new SockJS('http://localhost:8080/sockjs');

// 连接打开
sock.onopen = function() {
    console.log('SockJS连接已建立');
    sock.send('Hello SockJS Server!');
};

// 接收消息
sock.onmessage = function(e) {
    console.log('收到消息:', e.data);
};

// 连接关闭
sock.onclose = function() {
    console.log('SockJS连接已关闭');
};

// 错误处理
sock.onerror = function(e) {
    console.error('SockJS错误:', e);
};

// 发送消息
sock.send(JSON.stringify({
    type: 'chat',
    message: '这是一条消息'
}));

// 关闭连接
sock.close();
```

## 4. STOMP over WebSocket

### 使用 @stomp/stompjs

```bash
npm install @stomp/stompjs
```

```javascript
import { Client } from '@stomp/stompjs';

// 创建STOMP客户端
const client = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    
    // 连接头
    connectHeaders: {
        login: 'user',
        passcode: 'password',
    },
    
    // 调试信息
    debug: function (str) {
        console.log('STOMP: ' + str);
    },
    
    // 重连配置
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    
    // 连接成功回调
    onConnect: function (frame) {
        console.log('STOMP连接成功:', frame);
        
        // 订阅主题
        client.subscribe('/topic/messages', function (message) {
            console.log('收到主题消息:', JSON.parse(message.body));
        });
        
        // 订阅个人消息
        client.subscribe('/user/queue/private', function (message) {
            console.log('收到私人消息:', JSON.parse(message.body));
        });
        
        // 发送消息
        client.publish({
            destination: '/app/message',
            body: JSON.stringify({
                content: 'Hello STOMP!',
                sender: 'John'
            })
        });
    },
    
    // 错误回调
    onStompError: function (frame) {
        console.error('STOMP错误:', frame.headers['message']);
        console.error('详细信息:', frame.body);
    },
    
    // WebSocket错误回调
    onWebSocketError: function (event) {
        console.error('WebSocket错误:', event);
    }
});

// 激活连接
client.activate();

// 断开连接
// client.deactivate();
```

## 5. 服务器发送事件 (Server-Sent Events)

虽然不是WebSocket，但也是实时通信的一种方式：

```javascript
// 创建EventSource连接
const eventSource = new EventSource('http://localhost:8080/events');

// 监听消息
eventSource.onmessage = function(event) {
    console.log('收到SSE消息:', event.data);
};

// 监听自定义事件
eventSource.addEventListener('custom-event', function(event) {
    console.log('自定义事件:', JSON.parse(event.data));
});

// 连接打开
eventSource.onopen = function(event) {
    console.log('SSE连接已建立');
};

// 错误处理
eventSource.onerror = function(event) {
    console.error('SSE错误:', event);
    if (event.readyState === EventSource.CLOSED) {
        console.log('SSE连接已关闭');
    }
};

// 手动关闭连接
// eventSource.close();
```

## 6. WebRTC DataChannel

用于点对点数据传输：

```javascript
// 创建RTCPeerConnection
const peerConnection = new RTCPeerConnection({
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
});

// 创建数据通道
const dataChannel = peerConnection.createDataChannel('myDataChannel', {
    ordered: true
});

// 数据通道打开
dataChannel.onopen = function(event) {
    console.log('DataChannel已打开');
    dataChannel.send('Hello WebRTC!');
};

// 接收数据
dataChannel.onmessage = function(event) {
    console.log('收到DataChannel消息:', event.data);
};

// 数据通道关闭
dataChannel.onclose = function() {
    console.log('DataChannel已关闭');
};

// 错误处理
dataChannel.onerror = function(error) {
    console.error('DataChannel错误:', error);
};

// 处理远程数据通道
peerConnection.ondatachannel = function(event) {
    const receiveChannel = event.channel;
    receiveChannel.onmessage = function(event) {
        console.log('远程数据通道消息:', event.data);
    };
};
```

## 7. 实际项目中的WebSocket封装示例

```javascript
class WebSocketService {
    constructor() {
        this.ws = null;
        this.url = '';
        this.protocols = [];
        this.isConnected = false;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.messageQueue = [];
        this.listeners = new Map();
    }
    
    // 连接WebSocket
    connect(url, protocols = []) {
        this.url = url;
        this.protocols = protocols;
        
        try {
            this.ws = new WebSocket(url, protocols);
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.scheduleReconnect();
        }
    }
    
    // 设置事件处理器
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocket连接成功');
            this.isConnected = true;
            this.processMessageQueue();
            this.startHeartbeat();
            this.emit('connected');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // 处理心跳响应
                if (data.type === 'pong') {
                    return;
                }
                
                this.emit('message', data);
                
                // 根据消息类型分发
                if (data.type) {
                    this.emit(data.type, data);
                }
            } catch (error) {
                console.error('消息解析错误:', error);
            }
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭:', event.code, event.reason);
            this.isConnected = false;
            this.stopHeartbeat();
            this.emit('disconnected', event);
            
            if (event.code !== 1000) { // 非正常关闭
                this.scheduleReconnect();
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.emit('error', error);
        };
    }
    
    // 发送消息
    send(message) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // 连接断开时将消息加入队列
            this.messageQueue.push(message);
        }
    }
    
    // 处理消息队列
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }
    
    // 事件监听
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    // 移除事件监听
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    // 触发事件
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('事件回调执行错误:', error);
                }
            });
        }
    }
    
    // 心跳机制
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'ping', timestamp: Date.now() });
            }
        }, 30000); // 30秒发送一次心跳
    }
    
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    
    // 重连机制
    scheduleReconnect() {
        if (this.reconnectTimer) {
            return;
        }
        
        this.reconnectTimer = setTimeout(() => {
            console.log('尝试重新连接WebSocket...');
            this.reconnectTimer = null;
            this.connect(this.url, this.protocols);
        }, 5000);
    }
    
    // 关闭连接
    close() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close(1000, '正常关闭');
        }
    }
}

// 使用示例
const wsService = new WebSocketService();

// 监听事件
wsService.on('connected', () => {
    console.log('WebSocket已连接');
});

wsService.on('message', (data) => {
    console.log('收到消息:', data);
});

wsService.on('chat', (data) => {
    console.log('聊天消息:', data);
});

wsService.on('disconnected', () => {
    console.log('WebSocket已断开');
});

// 连接WebSocket
wsService.connect('ws://localhost:8080');

// 发送消息
wsService.send({
    type: 'chat',
    message: '你好！',
    user: 'John'
});
```

这些是前端使用WebSocket的主要方式，每种方式都有其适用场景：

- **原生WebSocket**: 适合简单的实时通信需求
- **Socket.IO**: 功能丰富，支持回退机制，适合复杂应用
- **SockJS**: 提供WebSocket的回退方案
- **STOMP**: 适合消息队列系统
- **SSE**: 适合服务器单向推送数据
- **WebRTC DataChannel**: 适合点对点数据传输