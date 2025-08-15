# WebSocket连接中断检测方法详解

## 1. WebSocket连接状态检测

### 1.1 readyState属性检测

```javascript
function checkWebSocketState(ws) {
    switch (ws.readyState) {
        case WebSocket.CONNECTING:
            console.log('连接正在建立中...');
            return 'connecting';
        case WebSocket.OPEN:
            console.log('连接已建立');
            return 'open';
        case WebSocket.CLOSING:
            console.log('连接正在关闭...');
            return 'closing';
        case WebSocket.CLOSED:
            console.log('连接已关闭');
            return 'closed';
        default:
            console.log('未知状态');
            return 'unknown';
    }
}

// 定时检查连接状态
function monitorConnection(ws) {
    const monitor = setInterval(() => {
        const state = checkWebSocketState(ws);
        if (state === 'closed' || state === 'closing') {
            console.log('检测到连接中断');
            clearInterval(monitor);
            // 触发重连逻辑
            handleDisconnection();
        }
    }, 1000);
    
    return monitor;
}
```

### 1.2 事件监听检测

```javascript
class WebSocketMonitor {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.isConnected = false;
        this.lastActivity = Date.now();
        this.connectionLostTime = null;
        
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = (event) => {
            console.log('连接建立');
            this.isConnected = true;
            this.lastActivity = Date.now();
            this.connectionLostTime = null;
            this.onConnectionRestored?.();
        };
        
        this.ws.onmessage = (event) => {
            // 更新最后活动时间
            this.lastActivity = Date.now();
            this.onMessage?.(event);
        };
        
        this.ws.onclose = (event) => {
            console.log('连接关闭:', event.code, event.reason);
            this.isConnected = false;
            this.connectionLostTime = Date.now();
            
            // 分析关闭原因
            this.analyzeCloseReason(event);
            
            // 触发连接中断回调
            this.onConnectionLost?.(event);
            
            // 如果不是正常关闭，启动重连
            if (event.code !== 1000) {
                this.scheduleReconnect();
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.onError?.(error);
        };
    }
    
    analyzeCloseReason(event) {
        const reasons = {
            1000: '正常关闭',
            1001: '终端离开',
            1002: '协议错误',
            1003: '不支持的数据',
            1004: '保留',
            1005: '无状态码',
            1006: '连接异常关闭', // 网络问题或服务器崩溃
            1007: '数据格式错误',
            1008: '策略违反',
            1009: '消息太大',
            1010: '扩展协商失败',
            1011: '服务器内部错误',
            1015: 'TLS握手失败'
        };
        
        const reason = reasons[event.code] || '未知原因';
        console.log(`连接关闭原因: ${event.code} - ${reason}`);
        
        // 1006通常表示网络突然中断
        if (event.code === 1006) {
            console.warn('检测到网络连接突然中断');
            this.onNetworkDisruption?.(event);
        }
    }
    
    scheduleReconnect() {
        setTimeout(() => {
            console.log('尝试重新连接...');
            this.connect();
        }, 3000);
    }
}
```

## 2. 心跳机制检测

### 2.1 基础心跳实现

```javascript
class HeartbeatWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.heartbeatInterval = options.heartbeatInterval || 30000; // 30秒
        this.heartbeatTimeout = options.heartbeatTimeout || 10000; // 10秒超时
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        
        this.ws = null;
        this.heartbeatTimer = null;
        this.heartbeatTimeoutTimer = null;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.isReconnecting = false;
        
        this.connect();
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventListeners();
        } catch (error) {
            console.error('连接失败:', error);
            this.handleConnectionFailure();
        }
    }
    
    setupEventListeners() {
        this.ws.onopen = () => {
            console.log('WebSocket连接成功');
            this.isConnected = true;
            this.isReconnecting = false;
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.onConnected?.();
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // 处理心跳响应
            if (data.type === 'pong') {
                this.handlePong();
                return;
            }
            
            this.onMessage?.(data);
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭');
            this.isConnected = false;
            this.stopHeartbeat();
            
            if (!this.isManualClose) {
                this.handleConnectionFailure();
            }
            
            this.onDisconnected?.(event);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.onError?.(error);
        };
    }
    
    startHeartbeat() {
        this.stopHeartbeat(); // 确保清除之前的定时器
        
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.sendPing();
            }
        }, this.heartbeatInterval);
    }
    
    sendPing() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('发送心跳包');
            this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            
            // 设置心跳超时检测
            this.heartbeatTimeoutTimer = setTimeout(() => {
                console.error('心跳超时，连接可能已断开');
                this.handleHeartbeatTimeout();
            }, this.heartbeatTimeout);
        }
    }
    
    handlePong() {
        console.log('收到心跳响应');
        // 清除心跳超时定时器
        if (this.heartbeatTimeoutTimer) {
            clearTimeout(this.heartbeatTimeoutTimer);
            this.heartbeatTimeoutTimer = null;
        }
    }
    
    handleHeartbeatTimeout() {
        console.error('心跳超时，判定连接中断');
        this.isConnected = false;
        
        // 触发连接中断回调
        this.onConnectionInterrupted?.();
        
        // 关闭当前连接并重连
        this.ws.close();
        this.handleConnectionFailure();
    }
    
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        
        if (this.heartbeatTimeoutTimer) {
            clearTimeout(this.heartbeatTimeoutTimer);
            this.heartbeatTimeoutTimer = null;
        }
    }
    
    handleConnectionFailure() {
        if (this.isReconnecting) return;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.isReconnecting = true;
            this.reconnectAttempts++;
            
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`${delay}ms后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('超过最大重连次数，停止重连');
            this.onReconnectFailed?.();
        }
    }
    
    send(data) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('连接未建立，消息发送失败');
            return false;
        }
        return true;
    }
    
    close() {
        this.isManualClose = true;
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close(1000, '手动关闭');
        }
    }
}

// 使用示例
const ws = new HeartbeatWebSocket('ws://localhost:8080', {
    heartbeatInterval: 30000,
    heartbeatTimeout: 10000,
    maxReconnectAttempts: 5
});

ws.onConnected = () => {
    console.log('连接已建立');
};

ws.onConnectionInterrupted = () => {
    console.log('检测到连接中断');
    // 显示离线提示
    showOfflineNotification();
};

ws.onDisconnected = (event) => {
    console.log('连接已断开');
};

ws.onMessage = (data) => {
    console.log('收到消息:', data);
};
```

### 2.2 高级心跳检测

```javascript
class AdvancedHeartbeatWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            heartbeatInterval: 30000,
            heartbeatTimeout: 10000,
            maxMissedHeartbeats: 3, // 允许连续丢失的心跳数
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            ...options
        };
        
        this.ws = null;
        this.heartbeatTimer = null;
        this.heartbeatTimeoutTimer = null;
        this.missedHeartbeats = 0;
        this.lastHeartbeatTime = null;
        this.connectionQuality = 'good'; // good, poor, bad
        this.pingTimes = []; // 存储最近的ping响应时间
        
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.ws.onopen = () => {
            console.log('连接建立');
            this.resetConnectionState();
            this.startHeartbeat();
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'pong') {
                this.handlePongResponse(data);
                return;
            }
            
            this.onMessage?.(data);
        };
        
        this.ws.onclose = (event) => {
            console.log('连接关闭');
            this.stopHeartbeat();
            this.handleDisconnection(event);
        };
        
        this.ws.onerror = (error) => {
            console.error('连接错误:', error);
        };
    }
    
    resetConnectionState() {
        this.missedHeartbeats = 0;
        this.lastHeartbeatTime = Date.now();
        this.connectionQuality = 'good';
        this.pingTimes = [];
    }
    
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat();
        }, this.options.heartbeatInterval);
    }
    
    sendHeartbeat() {
        const pingTime = Date.now();
        
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'ping',
                timestamp: pingTime,
                sequence: this.getSequenceNumber()
            }));
            
            // 设置心跳超时检测
            this.heartbeatTimeoutTimer = setTimeout(() => {
                this.handleMissedHeartbeat();
            }, this.options.heartbeatTimeout);
            
        } else {
            // WebSocket状态异常
            console.warn('WebSocket状态异常:', this.ws.readyState);
            this.handleConnectionIssue();
        }
    }
    
    handlePongResponse(data) {
        const currentTime = Date.now();
        const pingTime = data.timestamp;
        const responseTime = currentTime - pingTime;
        
        // 清除超时定时器
        if (this.heartbeatTimeoutTimer) {
            clearTimeout(this.heartbeatTimeoutTimer);
            this.heartbeatTimeoutTimer = null;
        }
        
        // 重置丢失心跳计数
        this.missedHeartbeats = 0;
        this.lastHeartbeatTime = currentTime;
        
        // 记录响应时间
        this.recordPingTime(responseTime);
        
        // 评估连接质量
        this.assessConnectionQuality();
        
        console.log(`心跳响应时间: ${responseTime}ms, 连接质量: ${this.connectionQuality}`);
    }
    
    recordPingTime(responseTime) {
        this.pingTimes.push(responseTime);
        
        // 只保留最近10次的响应时间
        if (this.pingTimes.length > 10) {
            this.pingTimes.shift();
        }
    }
    
    assessConnectionQuality() {
        if (this.pingTimes.length === 0) return;
        
        const avgResponseTime = this.pingTimes.reduce((sum, time) => sum + time, 0) / this.pingTimes.length;
        const maxResponseTime = Math.max(...this.pingTimes);
        
        let quality;
        if (avgResponseTime < 100 && maxResponseTime < 200) {
            quality = 'excellent';
        } else if (avgResponseTime < 300 && maxResponseTime < 500) {
            quality = 'good';
        } else if (avgResponseTime < 800 && maxResponseTime < 1500) {
            quality = 'fair';
        } else if (avgResponseTime < 2000 && maxResponseTime < 3000) {
            quality = 'poor';
        } else {
            quality = 'bad';
        }
        
        if (quality !== this.connectionQuality) {
            this.connectionQuality = quality;
            this.onConnectionQualityChange?.(quality, avgResponseTime);
        }
    }
    
    handleMissedHeartbeat() {
        this.missedHeartbeats++;
        console.warn(`心跳丢失 ${this.missedHeartbeats}/${this.options.maxMissedHeartbeats}`);
        
        if (this.missedHeartbeats >= this.options.maxMissedHeartbeats) {
            console.error('连续心跳丢失，判定连接中断');
            this.handleConnectionInterruption();
        } else {
            // 连接质量降级
            this.connectionQuality = 'poor';
            this.onConnectionQualityChange?.(this.connectionQuality);
        }
    }
    
    handleConnectionInterruption() {
        console.error('连接中断');
        this.onConnectionInterrupted?.({
            reason: 'heartbeat_timeout',
            missedHeartbeats: this.missedHeartbeats,
            lastHeartbeatTime: this.lastHeartbeatTime,
            connectionQuality: this.connectionQuality
        });
        
        // 强制关闭并重连
        this.ws.close();
    }
    
    getSequenceNumber() {
        this.sequenceNumber = (this.sequenceNumber || 0) + 1;
        return this.sequenceNumber;
    }
    
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        
        if (this.heartbeatTimeoutTimer) {
            clearTimeout(this.heartbeatTimeoutTimer);
            this.heartbeatTimeoutTimer = null;
        }
    }
}
```

## 3. 网络状态检测

### 3.1 Navigator Online API

```javascript
class NetworkAwareWebSocket {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.isOnline = navigator.onLine;
        
        this.setupNetworkListeners();
        this.connect();
    }
    
    setupNetworkListeners() {
        // 监听网络状态变化
        window.addEventListener('online', () => {
            console.log('网络恢复在线');
            this.isOnline = true;
            this.onNetworkOnline?.();
            
            // 网络恢复后重新连接
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                this.connect();
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('网络已离线');
            this.isOnline = false;
            this.onNetworkOffline?.();
            
            // 网络离线时关闭连接
            if (this.ws) {
                this.ws.close();
            }
        });
    }
    
    connect() {
        if (!this.isOnline) {
            console.log('网络离线，跳过连接');
            return;
        }
        
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
            console.log('WebSocket连接成功');
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭');
            
            // 如果网络在线但连接断开，可能是服务器问题
            if (this.isOnline && event.code !== 1000) {
                this.scheduleReconnect();
            }
        };
    }
    
    scheduleReconnect() {
        setTimeout(() => {
            if (this.isOnline) {
                this.connect();
            }
        }, 3000);
    }
}
```

### 3.2 网络连接质量检测

```javascript
class ConnectionQualityMonitor {
    constructor() {
        this.quality = 'unknown';
        this.effectiveType = 'unknown';
        this.downlink = 0;
        this.rtt = 0;
        
        this.setupConnectionMonitoring();
    }
    
    setupConnectionMonitoring() {
        // 使用Network Information API（如果可用）
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            if (connection) {
                this.updateConnectionInfo(connection);
                
                // 监听连接变化
                connection.addEventListener('change', () => {
                    this.updateConnectionInfo(connection);
                });
            }
        }
        
        // 定期检测连接质量
        this.startQualityCheck();
    }
    
    updateConnectionInfo(connection) {
        this.effectiveType = connection.effectiveType || 'unknown';
        this.downlink = connection.downlink || 0;
        this.rtt = connection.rtt || 0;
        
        console.log('网络信息更新:', {
            effectiveType: this.effectiveType,
            downlink: this.downlink,
            rtt: this.rtt
        });
        
        this.assessQuality();
        this.onConnectionInfoUpdate?.(this.getConnectionInfo());
    }
    
    assessQuality() {
        if (this.effectiveType === '4g' && this.downlink > 1.5) {
            this.quality = 'excellent';
        } else if (this.effectiveType === '3g' || (this.effectiveType === '4g' && this.downlink > 0.5)) {
            this.quality = 'good';
        } else if (this.effectiveType === '2g' || this.downlink > 0.1) {
            this.quality = 'fair';
        } else {
            this.quality = 'poor';
        }
    }
    
    startQualityCheck() {
        // 通过发送小请求测试连接质量
        setInterval(() => {
            this.performSpeedTest();
        }, 60000); // 每分钟检测一次
    }
    
    async performSpeedTest() {
        const startTime = Date.now();
        
        try {
            const response = await fetch('/api/ping', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            console.log(`网络响应时间: ${responseTime}ms`);
            
            // 根据响应时间调整质量评估
            if (responseTime < 100) {
                this.quality = 'excellent';
            } else if (responseTime < 300) {
                this.quality = 'good';
            } else if (responseTime < 800) {
                this.quality = 'fair';
            } else {
                this.quality = 'poor';
            }
            
            this.onQualityUpdate?.(this.quality, responseTime);
            
        } catch (error) {
            console.error('网络质量检测失败:', error);
            this.quality = 'poor';
            this.onQualityUpdate?.(this.quality);
        }
    }
    
    getConnectionInfo() {
        return {
            quality: this.quality,
            effectiveType: this.effectiveType,
            downlink: this.downlink,
            rtt: this.rtt,
            isOnline: navigator.onLine
        };
    }
}
```

## 4. 综合连接监控方案

```javascript
class ComprehensiveWebSocketMonitor {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            heartbeatInterval: 30000,
            heartbeatTimeout: 10000,
            maxMissedHeartbeats: 3,
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            ...options
        };
        
        this.ws = null;
        this.isConnected = false;
        this.connectionState = 'disconnected'; // connecting, connected, disconnected, reconnecting
        this.reconnectAttempts = 0;
        this.lastActivity = Date.now();
        this.disconnectionStartTime = null;
        
        // 监控组件
        this.heartbeatMonitor = null;
        this.networkMonitor = null;
        this.qualityMonitor = null;
        
        this.init();
    }
    
    init() {
        this.setupNetworkMonitoring();
        this.setupQualityMonitoring();
        this.connect();
    }
    
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            console.log('网络恢复');
            this.handleNetworkOnline();
        });
        
        window.addEventListener('offline', () => {
            console.log('网络断开');
            this.handleNetworkOffline();
        });
    }
    
    setupQualityMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection) {
                connection.addEventListener('change', () => {
                    this.handleConnectionChange(connection);
                });
            }
        }
    }
    
    connect() {
        if (this.connectionState === 'connecting' || this.connectionState === 'connected') {
            return;
        }
        
        this.connectionState = 'connecting';
        this.onStateChange?.('connecting');
        
        try {
            this.ws = new WebSocket(this.url);
            this.setupWebSocketListeners();
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.handleConnectionFailure();
        }
    }
    
    setupWebSocketListeners() {
        this.ws.onopen = () => {
            console.log('WebSocket连接成功');
            this.connectionState = 'connected';
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.lastActivity = Date.now();
            this.disconnectionStartTime = null;
            
            this.startHeartbeat();
            this.onStateChange?.('connected');
            this.onConnected?.();
        };
        
        this.ws.onmessage = (event) => {
            this.lastActivity = Date.now();
            
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'pong') {
                    this.handleHeartbeatResponse(data);
                    return;
                }
                
                this.onMessage?.(data);
                
            } catch (error) {
                console.error('消息解析错误:', error);
            }
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭:', event.code, event.reason);
            this.handleDisconnection(event);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.onError?.(error);
        };
    }
    
    handleDisconnection(event) {
        this.isConnected = false;
        this.stopHeartbeat();
        this.disconnectionStartTime = Date.now();
        
        // 分析断开原因
        const reason = this.analyzeDisconnectionReason(event);
        
        console.log('连接断开原因:', reason);
        
        this.onDisconnected?.({
            code: event.code,
            reason: event.reason,
            analyzedReason: reason,
            lastActivity: this.lastActivity,
            disconnectionTime: this.disconnectionStartTime
        });
        
        // 根据断开原因决定是否重连
        if (this.shouldReconnect(event)) {
            this.scheduleReconnect();
        } else {
            this.connectionState = 'disconnected';
            this.onStateChange?.('disconnected');
        }
    }
    
    analyzeDisconnectionReason(event) {
        const reasons = {
            1000: '正常关闭',
            1001: '页面离开',
            1002: '协议错误',
            1006: '网络中断',
            1011: '服务器错误',
            1015: 'TLS错误'
        };
        
        const reason = reasons[event.code] || '未知原因';
        
        // 进一步分析
        if (event.code === 1006) {
            const timeSinceLastActivity = Date.now() - this.lastActivity;
            if (timeSinceLastActivity > 60000) {
                return '长时间无活动导致的网络超时';
            } else {
                return '网络连接突然中断';
            }
        }
        
        return reason;
    }
    
    shouldReconnect(event) {
        // 正常关闭不重连
        if (event.code === 1000) return false;
        
        // 网络离线不重连
        if (!navigator.onLine) return false;
        
        // 超过最大重连次数不重连
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            return false;
        }
        
        return true;
    }
    
    scheduleReconnect() {
        if (this.connectionState === 'reconnecting') return;
        
        this.connectionState = 'reconnecting';
        this.onStateChange?.('reconnecting');
        
        const delay = Math.min(
            this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts),
            30000
        );
        
        console.log(`${delay}ms后尝试重连 (${this.reconnectAttempts + 1}/${this.options.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }
    
    startHeartbeat() {
        this.heartbeatMonitor = new HeartbeatMonitor({
            interval: this.options.heartbeatInterval,
            timeout: this.options.heartbeatTimeout,
            maxMissed: this.options.maxMissedHeartbeats,
            sendPing: (data) => this.sendHeartbeat(data),
            onTimeout: () => this.handleHeartbeatTimeout(),
            onQualityChange: (quality) => this.onConnectionQuality?.(quality)
        });
        
        this.heartbeatMonitor.start();
    }
    
    stopHeartbeat() {
        if (this.heartbeatMonitor) {
            this.heartbeatMonitor.stop();
            this.heartbeatMonitor = null;
        }
    }
    
    sendHeartbeat(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'ping',
                ...data
            }));
        }
    }
    
    handleHeartbeatResponse(data) {
        if (this.heartbeatMonitor) {
            this.heartbeatMonitor.handlePong(data);
        }
    }
    
    handleHeartbeatTimeout() {
        console.error('心跳超时，连接可能中断');
        this.onConnectionTimeout?.();
        
        // 强制关闭连接触发重连
        if (this.ws) {
            this.ws.close();
        }
    }
    
    handleNetworkOnline() {
        console.log('网络恢复在线');
        this.onNetworkStatusChange?.('online');
        
        // 网络恢复后，如果连接断开则尝试重连
        if (this.connectionState === 'disconnected' || this.connectionState === 'reconnecting') {
            this.reconnectAttempts = 0; // 重置重连次数
            this.connect();
        }
    }
    
    handleNetworkOffline() {
        console.log('网络离线');
        this.onNetworkStatusChange?.('offline');
        
        // 网络离线时停止心跳和重连尝试
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close();
        }
        
        this.connectionState = 'disconnected';
        this.onStateChange?.('disconnected');
    }
    
    handleConnectionChange(connection) {
        const connectionInfo = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
        };
        
        console.log('网络连接变化:', connectionInfo);
        this.onNetworkInfoChange?.(connectionInfo);
        
        // 根据网络质量调整心跳频率
        this.adjustHeartbeatFrequency(connectionInfo);
    }
    
    adjustHeartbeatFrequency(connectionInfo) {
        if (!this.heartbeatMonitor) return;
        
        let newInterval = this.options.heartbeatInterval;
        
        // 根据网络类型调整心跳间隔
        switch (connectionInfo.effectiveType) {
            case 'slow-2g':
            case '2g':
                newInterval = 60000; // 1分钟
                break;
            case '3g':
                newInterval = 45000; // 45秒
                break;
            case '4g':
                newInterval = 30000; // 30秒
                break;
            default:
                newInterval = this.options.heartbeatInterval;
        }
        
        this.heartbeatMonitor.updateInterval(newInterval);
    }
    
    // 发送消息
    send(data) {
        if (!this.isConnected || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('连接未建立，消息发送失败');
            this.onSendFailed?.(data);
            return false;
        }
        
        try {
            this.ws.send(JSON.stringify(data));
            this.lastActivity = Date.now();
            return true;
        } catch (error) {
            console.error('消息发送失败:', error);
            this.onSendError?.(error, data);
            return false;
        }
    }
    
    // 获取连接状态信息
    getConnectionStatus() {
        const now = Date.now();
        return {
            state: this.connectionState,
            isConnected: this.isConnected,
            isOnline: navigator.onLine,
            reconnectAttempts: this.reconnectAttempts,
            lastActivity: this.lastActivity,
            timeSinceLastActivity: now - this.lastActivity,
            disconnectionDuration: this.disconnectionStartTime ? now - this.disconnectionStartTime : 0,
            wsReadyState: this.ws ? this.ws.readyState : null,
            heartbeatStatus: this.heartbeatMonitor ? this.heartbeatMonitor.getStatus() : null
        };
    }
    
    // 手动重连
    reconnect() {
        console.log('手动触发重连');
        this.reconnectAttempts = 0;
        
        if (this.ws) {
            this.ws.close();
        }
        
        setTimeout(() => {
            this.connect();
        }, 1000);
    }
    
    // 关闭连接
    close() {
        console.log('手动关闭WebSocket连接');
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close(1000, '正常关闭');
        }
        
        this.connectionState = 'disconnected';
        this.onStateChange?.('disconnected');
    }
}

// 心跳监控器
class HeartbeatMonitor {
    constructor(options) {
        this.options = options;
        this.timer = null;
        this.timeoutTimer = null;
        this.missedCount = 0;
        this.pingTimes = [];
        this.quality = 'unknown';
        this.isActive = false;
    }
    
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.missedCount = 0;
        this.scheduleNextPing();
    }
    
    stop() {
        this.isActive = false;
        
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
    }
    
    scheduleNextPing() {
        if (!this.isActive) return;
        
        this.timer = setTimeout(() => {
            this.sendPing();
        }, this.options.interval);
    }
    
    sendPing() {
        const pingData = {
            timestamp: Date.now(),
            sequence: this.getSequence()
        };
        
        // 发送心跳
        this.options.sendPing(pingData);
        
        // 设置超时检测
        this.timeoutTimer = setTimeout(() => {
            this.handleTimeout();
        }, this.options.timeout);
    }
    
    handlePong(data) {
        const now = Date.now();
        const responseTime = now - data.timestamp;
        
        // 清除超时定时器
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
        
        // 重置丢失计数
        this.missedCount = 0;
        
        // 记录响应时间
        this.recordResponseTime(responseTime);
        
        // 评估连接质量
        this.assessConnectionQuality();
        
        // 计划下次心跳
        this.scheduleNextPing();
    }
    
    handleTimeout() {
        this.missedCount++;
        console.warn(`心跳超时 ${this.missedCount}/${this.options.maxMissed}`);
        
        if (this.missedCount >= this.options.maxMissed) {
            console.error('心跳连续超时，判定连接中断');
            this.options.onTimeout?.();
        } else {
            // 降级连接质量
            this.quality = 'poor';
            this.options.onQualityChange?.(this.quality);
            
            // 继续发送心跳
            this.scheduleNextPing();
        }
    }
    
    recordResponseTime(responseTime) {
        this.pingTimes.push(responseTime);
        
        // 只保留最近10次记录
        if (this.pingTimes.length > 10) {
            this.pingTimes.shift();
        }
    }
    
    assessConnectionQuality() {
        if (this.pingTimes.length === 0) return;
        
        const avgTime = this.pingTimes.reduce((sum, time) => sum + time, 0) / this.pingTimes.length;
        const maxTime = Math.max(...this.pingTimes);
        
        let newQuality;
        if (avgTime < 100 && maxTime < 200) {
            newQuality = 'excellent';
        } else if (avgTime < 300 && maxTime < 500) {
            newQuality = 'good';
        } else if (avgTime < 800 && maxTime < 1500) {
            newQuality = 'fair';
        } else {
            newQuality = 'poor';
        }
        
        if (newQuality !== this.quality) {
            this.quality = newQuality;
            this.options.onQualityChange?.(newQuality, avgTime);
        }
    }
    
    updateInterval(newInterval) {
        this.options.interval = newInterval;
        console.log(`心跳间隔调整为: ${newInterval}ms`);
    }
    
    getSequence() {
        this.sequence = (this.sequence || 0) + 1;
        return this.sequence;
    }
    
    getStatus() {
        return {
            isActive: this.isActive,
            missedCount: this.missedCount,
            quality: this.quality,
            avgResponseTime: this.pingTimes.length > 0 ? 
                this.pingTimes.reduce((sum, time) => sum + time, 0) / this.pingTimes.length : 0,
            interval: this.options.interval
        };
    }
}

// 使用示例
const wsMonitor = new ComprehensiveWebSocketMonitor('ws://localhost:8080', {
    heartbeatInterval: 30000,
    heartbeatTimeout: 10000,
    maxMissedHeartbeats: 3,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
});

// 监听各种事件
wsMonitor.onStateChange = (state) => {
    console.log('连接状态变化:', state);
    updateConnectionStatus(state);
};

wsMonitor.onConnected = () => {
    console.log('连接建立成功');
    hideOfflineNotification();
};

wsMonitor.onDisconnected = (info) => {
    console.log('连接断开:', info);
    showOfflineNotification(info.analyzedReason);
};

wsMonitor.onConnectionTimeout = () => {
    console.log('连接超时');
    showConnectionTimeoutWarning();
};

wsMonitor.onConnectionQuality = (quality, responseTime) => {
    console.log(`连接质量: ${quality}, 响应时间: ${responseTime}ms`);
    updateConnectionQualityIndicator(quality);
};

wsMonitor.onNetworkStatusChange = (status) => {
    console.log('网络状态:', status);
    updateNetworkStatusIndicator(status);
};

wsMonitor.onMessage = (data) => {
    console.log('收到消息:', data);
    handleIncomingMessage(data);
};

wsMonitor.onSendFailed = (data) => {
    console.log('消息发送失败，加入重发队列');
    addToRetryQueue(data);
};

// 辅助函数
function updateConnectionStatus(state) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.textContent = state;
        statusElement.className = `status ${state}`;
    }
}

function showOfflineNotification(reason) {
    const notification = document.createElement('div');
    notification.className = 'offline-notification';
    notification.textContent = `连接已断开: ${reason}`;
    document.body.appendChild(notification);
}

function hideOfflineNotification() {
    const notifications = document.querySelectorAll('.offline-notification');
    notifications.forEach(notification => notification.remove());
}

function updateConnectionQualityIndicator(quality) {
    const indicator = document.getElementById('quality-indicator');
    if (indicator) {
        indicator.className = `quality ${quality}`;
        indicator.textContent = quality;
    }
}

function updateNetworkStatusIndicator(status) {
    const indicator = document.getElementById('network-status');
    if (indicator) {
        indicator.className = `network ${status}`;
        indicator.textContent = status;
    }
}

// 定期检查连接状态
setInterval(() => {
    const status = wsMonitor.getConnectionStatus();
    console.log('连接状态检查:', status);
    
    // 如果长时间无活动，可能需要主动检测
    if (status.timeSinceLastActivity > 300000) { // 5分钟
        console.log('长时间无活动，主动发送检测消息');
        wsMonitor.send({ type: 'keepalive', timestamp: Date.now() });
    }
}, 60000); // 每分钟检查一次
```

## 总结

检测WebSocket连接中断的方法主要有：

### 1. **事件监听检测**

- `onclose` 事件：监听连接关闭
- `onerror` 事件：监听连接错误
- 分析关闭码判断中断原因

### 2. **心跳机制检测**

- 定期发送ping消息
- 设置超时检测pong响应
- 连续心跳丢失判定连接中断

### 3. **网络状态检测**

- `navigator.onLine` 检测网络状态
- `online/offline` 事件监听
- Network Information API 获取连接质量

### 4. **状态轮询检测**

- 定期检查 `readyState` 属性
- 监控最后活动时间
- 检测发送消息失败

### 5. **综合检测策略**

- 多种检测方法结合使用
- 根据断开原因决定重连策略
- 动态调整检测频率和超时时间

这些方法可以有效地检测到各种类型的连接中断，包括网络故障、服务器重启、浏览器标签页切换等场景。