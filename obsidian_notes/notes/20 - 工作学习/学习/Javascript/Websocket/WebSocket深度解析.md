## WebSocket完整功能详解


**协议标识符：**

- `ws://` - 非加密WebSocket
- `wss://` - 加密WebSocket（基于TLS/SSL）

**协议版本：**

- 当前标准版本是RFC 6455
- 支持版本协商机制

### 2. 数据帧结构

WebSocket有完整的帧格式定义：

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

### 3. 操作码（Opcode）类型

```javascript
// 帧类型
0x0 - 继续帧（Continuation Frame）
0x1 - 文本帧（Text Frame）
0x2 - 二进制帧（Binary Frame）
0x3-0x7 - 保留给未来的非控制帧
0x8 - 连接关闭帧（Close Frame）
0x9 - Ping帧
0xA - Pong帧
0xB-0xF - 保留给未来的控制帧
```

### 4. 完整的连接管理

**连接状态：**

```javascript
WebSocket.CONNECTING = 0; // 正在连接
WebSocket.OPEN = 1;       // 连接已开启
WebSocket.CLOSING = 2;    // 连接正在关闭
WebSocket.CLOSED = 3;     // 连接已关闭
```

**完整的事件处理：**

```javascript
const ws = new WebSocket('wss://example.com/socket');

// 连接状态检查
console.log('当前状态:', ws.readyState);

// 完整事件监听
ws.addEventListener('open', function(event) {
    console.log('连接已建立');
});

ws.addEventListener('message', function(event) {
    // 处理不同类型的数据
    if (typeof event.data === 'string') {
        console.log('收到文本:', event.data);
    } else if (event.data instanceof ArrayBuffer) {
        console.log('收到二进制数据:', event.data);
    } else if (event.data instanceof Blob) {
        console.log('收到Blob数据:', event.data);
    }
});

ws.addEventListener('close', function(event) {
    console.log('连接关闭:', event.code, event.reason, event.wasClean);
});

ws.addEventListener('error', function(event) {
    console.log('连接错误:', event);
});
```

### 5. 子协议支持

```javascript
// 支持子协议协商
const ws = new WebSocket('ws://example.com', ['protocol1', 'protocol2']);
console.log('选中的子协议:', ws.protocol);
```

### 6. 扩展支持

**常见扩展：**

- `permessage-deflate` - 消息压缩
- `x-webkit-deflate-frame` - 帧压缩（已废弃）

### 7. 心跳机制

```javascript
// Ping/Pong心跳保持连接
function heartbeat() {
    clearTimeout(this.pingTimeout);
    
    this.pingTimeout = setTimeout(() => {
        this.terminate();
    }, 30000 + 1000);
}

ws.on('open', heartbeat);
ws.on('ping', heartbeat);
```

### 8. 完整的关闭握手

```javascript
// 标准关闭码
const CLOSE_CODES = {
    1000: 'Normal Closure',
    1001: 'Going Away',
    1002: 'Protocol Error',
    1003: 'Unsupported Data',
    1004: 'Reserved',
    1005: 'No Status Rcvd',
    1006: 'Abnormal Closure',
    1007: 'Invalid frame payload data',
    1008: 'Policy Violation',
    1009: 'Message Too Big',
    1010: 'Mandatory Extension',
    1011: 'Internal Server Error',
    1015: 'TLS Handshake'
};

// 主动关闭连接
ws.close(1000, '正常关闭');
```

### 9. 缓冲管理

```javascript
// 发送缓冲区大小
console.log('缓冲数据量:', ws.bufferedAmount);

// 确保数据发送完毕再关闭
function closeConnection() {
    if (ws.bufferedAmount === 0) {
        ws.close();
    } else {
        setTimeout(closeConnection, 100);
    }
}
```

### 10. 安全特性

**同源策略：**

- WebSocket不受同源策略限制
- 但需要服务器验证Origin头

**掩码机制：**

- 客户端发送的数据必须掩码
- 防止缓存投毒攻击

### 11. 服务端完整实现示例

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 8080,
    // 连接验证
    verifyClient: (info) => {
        // 验证Origin、Cookie等
        return true;
    }
});

wss.on('connection', function connection(ws, request) {
    console.log('新连接来自:', request.socket.remoteAddress);
    
    // 发送欢迎消息
    ws.send('欢迎连接!');
    
    // 处理消息
    ws.on('message', function incoming(data, isBinary) {
        console.log('收到消息:', isBinary ? data : data.toString());
        
        // 广播给所有客户端
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data, { binary: isBinary });
            }
        });
    });
    
    // 处理Ping
    ws.on('ping', function ping(data) {
        ws.pong(data);
    });
    
    // 处理关闭
    ws.on('close', function close(code, reason) {
        console.log('连接关闭:', code, reason.toString());
    });
    
    // 处理错误
    ws.on('error', function error(err) {
        console.log('连接错误:', err);
    });
});
```

### 12. 高级功能

**消息分片：**

```javascript
// 大消息自动分片
const largeData = new ArrayBuffer(1024 * 1024); // 1MB
ws.send(largeData); // 自动处理分片
```

**流式传输：**

```javascript
// 支持流式发送
const stream = fs.createReadStream('large-file.txt');
stream.on('data', chunk => {
    ws.send(chunk, { fin: false }); // 非最终帧
});
stream.on('end', () => {
    ws.send('', { fin: true }); // 最终帧
});
```

现在这才是相对完整的WebSocket功能体系。它不仅仅是简单的双向通信，而是一个包含了协议协商、数据帧处理、连接管理、安全机制、扩展支持等完整功能的通信协议。