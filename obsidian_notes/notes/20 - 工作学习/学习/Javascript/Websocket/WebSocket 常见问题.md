# WebSocket 常见问题及解决方案详解

## 1. 连接建立问题

### 1.1 跨域问题

**问题描述：**

```javascript
// 错误示例
const ws = new WebSocket('ws://different-domain.com:8080');
// Error: WebSocket connection failed due to CORS policy
```

**解决方案：**
```javascript
// 1. 服务端配置CORS (Node.js + Express + ws)
const WebSocket = require('ws');
const express = require('express');
const app = express();

// 配置CORS中间件
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

const server = app.listen(3000);

// WebSocket服务器配置
const wss = new WebSocket.Server({ 
    server,
    verifyClient: (info) => {
        // 验证来源
        const origin = info.origin;
        const allowedOrigins = [
            'http://localhost:3000',
            'https://yourdomain.com',
            'https://subdomain.yourdomain.com'
        ];
        
        return allowedOrigins.includes(origin);
    }
});

// 2. 使用代理服务器 (Nginx配置)
/*
server {
    listen 80;
    server_name yourdomain.com;
    
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
*/

// 3. 客户端使用相对路径或同域
class CORSFriendlyWebSocket {
    constructor(path, options = {}) {
        // 自动处理协议和域名
        this.url = this.buildWebSocketURL(path);
        this.options = options;
        this.connect();
    }
    
    buildWebSocketURL(path) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        // 如果path是完整URL，直接使用
        if (path.startsWith('ws://') || path.startsWith('wss://')) {
            return path;
        }
        
        // 构建同域WebSocket URL
        return `${protocol}//${host}${path.startsWith('/') ? path : '/' + path}`;
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.handleConnectionError(error);
        }
    }
    
    setupEventHandlers() {
        this.ws.onopen = (event) => {
            console.log('WebSocket连接成功:', this.url);
            this.onOpen?.(event);
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭');
            this.onClose?.(event);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.onError?.(error);
        };
    }
    
    handleConnectionError(error) {
        if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
            console.error('跨域连接失败，尝试使用备用方案');
            // 可以尝试降级到长轮询或SSE
            this.fallbackToPolling?.();
        }
    }
}

// 使用示例
const ws = new CORSFriendlyWebSocket('/websocket');
ws.onOpen = () => console.log('连接成功');
ws.fallbackToPolling = () => {
    console.log('降级到长轮询模式');
    // 实现长轮询逻辑
};```

### 1.2 防火墙和代理问题

**问题描述：** 企业网络环境下WebSocket连接被阻止

**解决方案：**
```javascript
// 1. 检测WebSocket支持和网络环境
class NetworkDetector {
    constructor() {
        this.capabilities = {
            websocketSupported: false,
            sseSupported: false,
            ajaxSupported: false,
            proxyDetected: false,
            firewallRestricted: false
        };
    }
    
    async detectCapabilities() {
        // 检测WebSocket支持
        this.capabilities.websocketSupported = 'WebSocket' in window;
        
        // 检测SSE支持
        this.capabilities.sseSupported = 'EventSource' in window;
        
        // 检测AJAX支持
        this.capabilities.ajaxSupported = 'XMLHttpRequest' in window;
        
        // 检测网络限制
        await this.detectNetworkRestrictions();
        
        return this.capabilities;
    }
    
    async detectNetworkRestrictions() {
        // 尝试连接WebSocket测试端点
        try {
            await this.testWebSocketConnection();
        } catch (error) {
            if (error.message.includes('blocked') || error.message.includes('proxy')) {
                this.capabilities.proxyDetected = true;
            }
            if (error.message.includes('firewall') || error.code === 1006) {
                this.capabilities.firewallRestricted = true;
            }
        }
        
        // 检测HTTP代理
        await this.detectHttpProxy();
    }
    
    testWebSocketConnection() {
        return new Promise((resolve, reject) => {
            if (!this.capabilities.websocketSupported) {
                reject(new Error('WebSocket not supported'));
                return;
            }
            
            const testWs = new WebSocket('wss://echo.websocket.org/');
            const timeout = setTimeout(() => {
                testWs.close();
                reject(new Error('Connection timeout - possible firewall'));
            }, 5000);
            
            testWs.onopen = () => {
                clearTimeout(timeout);
                testWs.close();
                resolve(true);
            };
            
            testWs.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };
        });
    }
    
    async detectHttpProxy() {
        try {
            const response = await fetch('/api/ip-info', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json();
            
            // 检查是否有代理相关的头信息
            if (data.headers['x-forwarded-for'] || 
                data.headers['x-real-ip'] ||
                data.headers['via']) {
                this.capabilities.proxyDetected = true;
            }
        } catch (error) {
            console.warn('无法检测代理状态:', error);
        }
    }
}

// 2. 智能连接策略
class SmartWebSocketConnection {
    constructor(url, options = {}) {
        this.primaryUrl = url;
        this.options = {
            fallbackUrls: [],
            useTLS: true,
            useSSL: false, // 降级选项
            ports: [443, 80, 8080, 3000], // 尝试不同端口
            ...options
        };
        
        this.detector = new NetworkDetector();
        this.currentConnection = null;
        this.connectionStrategy = 'websocket';
    }
    
    async connect() {
        // 首先检测网络环境
        const capabilities = await this.detector.detectCapabilities();
        console.log('网络环境检测结果:', capabilities);
        
        // 根据检测结果选择连接策略
        if (capabilities.websocketSupported && !capabilities.firewallRestricted) {
            await this.tryWebSocketConnection();
        } else if (capabilities.proxyDetected || capabilities.firewallRestricted) {
            await this.tryAlternativeConnections();
        } else {
            await this.fallbackToPolling();
        }
    }
    
    async tryWebSocketConnection() {
        const urls = this.generateWebSocketUrls();
        
        for (const url of urls) {
            try {
                console.log('尝试连接:', url);
                await this.attemptConnection(url);
                console.log('WebSocket连接成功:', url);
                return;
            } catch (error) {
                console.warn(`连接失败 ${url}:`, error.message);
                continue;
            }
        }
        
        // 所有WebSocket连接都失败，尝试备用方案
        await this.tryAlternativeConnections();
    }
    
    generateWebSocketUrls() {
        const urls = [this.primaryUrl];
        const urlObj = new URL(this.primaryUrl);
        
        // 尝试不同的协议和端口组合
        for (const port of this.options.ports) {
            // WSS + HTTPS端口
            if (this.options.useTLS) {
                urls.push(`wss://${urlObj.hostname}:${port}${urlObj.pathname}`);
            }
            
            // WS + HTTP端口 (降级选项)
            if (this.options.useSSL) {
                urls.push(`ws://${urlObj.hostname}:${port}${urlObj.pathname}`);
            }
        }
        
        // 添加备用URLs
        urls.push(...this.options.fallbackUrls);
        
        return [...new Set(urls)]; // 去重
    }
    
    attemptConnection(url) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(url);
            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('Connection timeout'));
            }, 10000);
            
            ws.onopen = () => {
                clearTimeout(timeout);
                this.currentConnection = ws;
                this.setupConnectionHandlers(ws);
                resolve(ws);
            };
            
            ws.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };
        });
    }
    
    setupConnectionHandlers(ws) {
        ws.onmessage = (event) => {
            this.onMessage?.(event);
        };
        
        ws.onclose = (event) => {
            console.log('连接关闭:', event.code, event.reason);
            this.onClose?.(event);
            
            // 如果是网络问题，尝试重连
            if (event.code === 1006) {
                this.handleNetworkDisconnection();
            }
        };
        
        ws.onerror = (error) => {
            console.error('连接错误:', error);
            this.onError?.(error);
        };
    }
    
    async tryAlternativeConnections() {
        console.log('WebSocket受限，尝试备用连接方式');
        
        // 尝试通过HTTPS隧道
        if (await this.tryHttpsTunnel()) {
            return;
        }
        
        // 尝试Socket.IO (自动降级)
        if (await this.trySocketIO()) {
            return;
        }
        
        // 最后降级到长轮询
        await this.fallbackToPolling();
    }
    
    async tryHttpsTunnel() {
        try {
            // 尝试通过HTTPS端口建立WebSocket连接
            const httpsUrl = this.primaryUrl.replace(/^ws/, 'wss').replace(/:80$/, ':443');
            await this.attemptConnection(httpsUrl);
            console.log('通过HTTPS隧道连接成功');
            return true;
        } catch (error) {
            console.warn('HTTPS隧道连接失败:', error);
            return false;
        }
    }
    
    async trySocketIO() {
        try {
            // 如果有Socket.IO可用，使用它的自动降级功能
            if (typeof io !== 'undefined') {
                const socket = io(this.primaryUrl.replace(/^ws/, 'http'), {
                    transports: ['websocket', 'polling']
                });
                
                this.currentConnection = socket;
                this.connectionStrategy = 'socketio';
                console.log('使用Socket.IO连接成功');
                return true;
            }
        } catch (error) {
            console.warn('Socket.IO连接失败:', error);
        }
        return false;
    }
    
    async fallbackToPolling() {
        console.log('降级到长轮询模式');
        this.connectionStrategy = 'polling';
        
        // 实现长轮询
        const poller = new LongPollingConnection(
            this.primaryUrl.replace(/^ws/, 'http') + '/poll'
        );
        
        this.currentConnection = poller;
        await poller.start();
    }
    
    handleNetworkDisconnection() {
        console.log('网络连接中断，重新检测网络环境');
        
        // 延迟重连，重新检测网络环境
        setTimeout(async () => {
            await this.connect();
        }, 5000);
    }
    
    send(data) {
        if (!this.currentConnection) {
            console.warn('没有可用连接');
            return false;
        }
        
        switch (this.connectionStrategy) {
            case 'websocket':
                return this.currentConnection.send(JSON.stringify(data));
            case 'socketio':
                return this.currentConnection.emit('message', data);
            case 'polling':
                return this.currentConnection.send(data);
        }
    }
}

// 3. 长轮询备用方案
class LongPollingConnection {
    constructor(url) {
        this.url = url;
        this.isActive = false;
        this.pollTimeout = null;
        this.requestTimeout = 30000;
    }
    
    async start() {
        this.isActive = true;
        this.poll();
    }
    
    async poll() {
        if (!this.isActive) return;
        
        try {
            const response = await fetch(this.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                signal: AbortSignal.timeout(this.requestTimeout)
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.messages && data.messages.length > 0) {
                    data.messages.forEach(message => {
                        this.onMessage?.(message);
                    });
                }
            }
            
        } catch (error) {
            console.error('轮询请求失败:', error);
            
            // 网络错误时延长轮询间隔
            await this.delay(5000);
        }
        
        // 继续轮询
        this.pollTimeout = setTimeout(() => {
            this.poll();
        }, 1000);
    }
    
    async send(data) {
        try {
            const response = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            return response.ok;
        } catch (error) {
            console.error('发送消息失败:', error);
            return false;
        }
    }
    
    stop() {
        this.isActive = false;
        if (this.pollTimeout) {
            clearTimeout(this.pollTimeout);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 使用示例
const smartConnection = new SmartWebSocketConnection('ws://localhost:8080/websocket', {
    fallbackUrls: [
        'wss://backup1.example.com/ws',
        'ws://backup2.example.com:8080/ws'
    ],
    ports: [443, 80, 8080, 3000, 9000],
    useTLS: true,
    useSSL: true
});

smartConnection.onMessage = (data) => {
    console.log('收到消息:', data);
};

smartConnection.onClose = (event) => {
    console.log('连接关闭:', event);
};

// 开始连接
smartConnection.connect();
```
## 2. 连接稳定性问题

### 2.1 网络不稳定导致的频繁断线
```javascript
// 1. 自适应重连策略
class AdaptiveReconnectWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            minReconnectDelay: 1000,      // 最小重连延迟
            maxReconnectDelay: 30000,     // 最大重连延迟
            maxReconnectAttempts: 50,     // 最大重连次数
            backoffFactor: 1.5,           // 退避因子
            jitterMax: 1000,              // 随机抖动最大值
            connectionTimeout: 15000,     // 连接超时
            healthCheckInterval: 60000,   // 健康检查间隔
            ...options
        };
        
        this.ws = null;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.healthCheckTimer = null;
        this.connectionState = 'disconnected';
        this.lastSuccessfulConnection = null;
        this.connectionHistory = [];
        this.messageQueue = [];
        
        this.connect();
    }
    
    connect() {
        if (this.connectionState === 'connecting') return;
        
        this.connectionState = 'connecting';
        console.log(`连接尝试 ${this.reconnectAttempts + 1}/${this.options.maxReconnectAttempts}`);
        
        const connectStart = Date.now();
        
        try {
            this.ws = new WebSocket(this.url);
            this.setupConnectionTimeout();
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket创建失败:', error);
            this.handleConnectionFailure();
        }
    }
    
    setupConnectionTimeout() {
        const timeout = setTimeout(() => {
            if (this.connectionState === 'connecting') {
                console.warn('连接超时');
                this.ws.close();
                this.handleConnectionFailure();
            }
        }, this.options.connectionTimeout);
        
        this.connectionTimeout = timeout;
    }
    
    setupEventHandlers() {
        this.ws.onopen = () => {
            clearTimeout(this.connectionTimeout);
            
            const connectTime = Date.now() - this.connectStart;
            this.recordConnectionSuccess(connectTime);
            
            console.log('WebSocket连接成功');
            this.connectionState = 'connected';
            this.reconnectAttempts = 0;
            this.lastSuccessfulConnection = Date.now();
            
            this.processMessageQueue();
            this.startHealthCheck();
            this.onConnected?.();
        };
        
        this.ws.onmessage = (event) => {
            this.lastSuccessfulConnection = Date.now();
            this.onMessage?.(event);
        };
        
        this.ws.onclose = (event) => {
            clearTimeout(this.connectionTimeout);
            this.stopHealthCheck();
            
            console.log('WebSocket连接关闭:', event.code, event.reason);
            
            const wasConnected = this.connectionState === 'connected';
            this.connectionState = 'disconnected';
            
            this.recordConnectionFailure(event);
            this.onDisconnected?.(event);
            
            // 根据关闭原因决定是否重连
            if (this.shouldReconnect(event, wasConnected)) {
                this.scheduleReconnect();
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.onError?.(error);
        };
    }
    
    recordConnectionSuccess(connectTime) {
        const record = {
            timestamp: Date.now(),
            type: 'success',
            connectTime: connectTime,
            attempt: this.reconnectAttempts
        };
        
        this.connectionHistory.push(record);
        this.trimConnectionHistory();
        
        console.log(`连接成功，用时: ${connectTime}ms`);
    }
    
    recordConnectionFailure(event) {
        const record = {
            timestamp: Date.now(),
            type: 'failure',
            code: event.code,
            reason: event.reason,
            attempt: this.reconnectAttempts,
            duration: this.lastSuccessfulConnection ? 
                Date.now() - this.lastSuccessfulConnection : 0
        };
        
        this.connectionHistory.push(record);
        this.trimConnectionHistory();
    }
    
    trimConnectionHistory() {
        // 只保留最近100条记录
        if (this.connectionHistory.length > 100) {
            this.connectionHistory = this.connectionHistory.slice(-100);
        }
    }
    
    shouldReconnect(event, wasConnected) {
        // 正常关闭不重连
        if (event.code === 1000) return false;
        
        // 超过最大重连次数
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            console.error('超过最大重连次数');
            return false;
        }
        
        // 分析连接历史，判断网络状况
        const recentFailures = this.getRecentFailures();
        if (recentFailures.length > 5) {
            const avgDuration = recentFailures.reduce((sum, f) => sum + f.duration, 0) / recentFailures.length;
            
            // 如果连接持续时间很短，可能是网络问题，延长重连间隔
            if (avgDuration < 10000) { // 小于10秒
                console.warn('检测到网络不稳定，调整重连策略');
                this.options.backoffFactor = Math.min(this.options.backoffFactor + 0.5, 3.0);
            }
        }
        
        return true;
    }
    
    getRecentFailures() {
        const tenMinutesAgo = Date.now() - 600000;
        return this.connectionHistory
            .filter(record => record.type === 'failure' && record.timestamp > tenMinutesAgo);
    }
    
    scheduleReconnect() {
        if (this.reconnectTimer) return;
        
        const baseDelay = Math.min(
            this.options.minReconnectDelay * Math.pow(this.options.backoffFactor, this.reconnectAttempts),
            this.options.maxReconnectDelay
        );
        
        // 添加随机抖动避免雷群效应
        const jitter = Math.random() * this.options.jitterMax;
        const delay = baseDelay + jitter;
        
        console.log(`${delay.toFixed(0)}ms后尝试重连`);
        
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }
    
    startHealthCheck() {
        this.healthCheckTimer = setInterval(() => {
            if (this.connectionState === 'connected') {
                // 检查连接是否真的健康
                const timeSinceLastActivity = Date.now() - this.lastSuccessfulConnection;
                
                if (timeSinceLastActivity > this.options.healthCheckInterval * 2) {
                    console.warn('连接可能已断开，主动关闭重连');
                    this.ws.close();
                } else {
                    // 发送心跳
                    this.sendHeartbeat();
                }
            }
        }, this.options.healthCheckInterval);
    }
    
    stopHealthCheck() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
    }
    
    sendHeartbeat() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify({
                    type: 'heartbeat',
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.error('心跳发送失败:', error);
            }
        }
    }
    
    send(data) {
        if (this.connectionState === 'connected' && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('消息发送失败:', error);
                this.queueMessage(data);
                return false;
            }
        } else {
            this.queueMessage(data);
            return false;
        }
    }
    
    queueMessage(data) {
        this.messageQueue.push({
            data: data,
            timestamp: Date.now()
        });
        
        // 限制队列大小
        if (this.messageQueue.length > 1000) {
            this.messageQueue.shift();
        }
    }
    
    processMessageQueue() {
        const now = Date.now();
        const maxAge = 300000; // 5分钟
        
        // 清除过期消息
        this.messageQueue = this.messageQueue.filter(item => 
            now - item.timestamp < maxAge
        );
        
        // 发送队列中的消息
        while (this.messageQueue.length > 0) {
            const item = this.messageQueue.shift();
            if (!this.send(item.data)) {
                // 发送失败，重新入队
                this.messageQueue.unshift(item);
                break;
            }
        }
        
        if (this.messageQueue.length > 0) {
            console.log(`已处理 ${this.messageQueue.length} 条排队消息`);
        }
    }
    
    // 获取连接统计信息
    getConnectionStats() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        
        const recentHistory = this.connectionHistory.filter(
            record => record.timestamp > oneHourAgo
        );
        
        const successes = recentHistory.filter(r => r.type === 'success').length;
        const failures = recentHistory.filter(r => r.type === 'failure').length;
        
        const avgConnectTime = recentHistory
            .filter(r => r.type === 'success' && r.connectTime)
            .reduce((sum, r, _, arr) => sum + r.connectTime / arr.length, 0);
        
        return {
            currentState: this.connectionState,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            lastSuccessfulConnection: this.lastSuccessfulConnection,
            recentSuccesses: successes,
            recentFailures: failures,
            successRate: successes + failures > 0 ? (successes / (successes + failures)) * 100 : 0,
            avgConnectTime: avgConnectTime,
            totalConnectionTime: this.lastSuccessfulConnection ? 
                now - this.lastSuccessfulConnection : 0
        };
    }
    
    // 手动重连
    forceReconnect() {
        console.log('强制重连');
        this.reconnectAttempts = 0;
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        if (this.ws) {
            this.ws.close();
        } else {
            this.connect();
        }
    }
    
    // 关闭连接
    close() {
        console.log('手动关闭WebSocket连接');
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        this.stopHealthCheck();
        
        if (this.ws) {
            this.ws.close(1000, '正常关闭');
        }
        
        this.connectionState = 'closed';
    }
}

// 2. 网络质量自适应
class QualityAdaptiveWebSocket extends AdaptiveReconnectWebSocket {
    constructor(url, options = {}) {
        super(url, options);
        
        this.networkQuality = 'unknown';
        this.connectionQuality = 'good';
        this.pingHistory = [];
        this.qualityCheckInterval = 30000;
        this.qualityTimer = null;
        
        this.startQualityMonitoring();
    }
    
    startQualityMonitoring() {
        // 监听网络连接变化
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection) {
                this.updateNetworkInfo(connection);
                connection.addEventListener('change', () => {
                    this.updateNetworkInfo(connection);
                    this.adaptToNetworkQuality();
                });
            }
        }
        
        // 定期质量检测
        this.qualityTimer = setInterval(() => {
            this.performQualityCheck();
        }, this.qualityCheckInterval);
    }
    
    updateNetworkInfo(connection) {
        this.networkQuality = {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
        
        console.log('网络信息更新:', this.networkQuality);
    }
    
    adaptToNetworkQuality() {
        const quality = this.assessOverallQuality();
        
        switch (quality) {
            case 'poor':
                // 网络质量差时的调整
                this.options.healthCheckInterval = 90000; // 增加心跳间隔
                this.options.connectionTimeout = 30000;   // 增加连接超时
                this.options.maxReconnectDelay = 60000;   // 增加重连延迟
                break;
                
            case 'fair':
                this.options.healthCheckInterval = 60000;
                this.options.connectionTimeout = 20000;
                this.options.maxReconnectDelay = 30000;
                break;
                
            case 'good':
            default:
                this.options.healthCheckInterval = 30000;
                this.options.connectionTimeout = 15000;
                this.options.maxReconnectDelay = 15000;
                break;
        }
        
        console.log(`网络质量: ${quality}, 已调整连接参数`);
        this.onQualityChange?.(quality);
    }
    
    assessOverallQuality() {
        let score = 0;
        
        // 基于网络类型评分
        if (this.networkQuality.effectiveType) {
            const typeScores = {
                '4g': 4,
                '3g': 3,
                '2g': 1,
                'slow-2g': 0.5
            };
            score += typeScores[this.networkQuality.effectiveType] || 2;
        }
        
        // 基于下行速度评分
        if (this.networkQuality.downlink) {
            if (this.networkQuality.downlink > 2) score += 2;
            else if (this.networkQuality.downlink > 0.5) score += 1;
            else score += 0.5;
        }
        
        // 基于RTT评分
        if (this.networkQuality.rtt) {
            if (this.networkQuality.rtt < 100) score += 2;
            else if (this.networkQuality.rtt < 300) score += 1;
            else score += 0.5;
        }
        
        // 基于ping历史评分
        if (this.pingHistory.length > 0) {
            const avgPing = this.pingHistory.reduce((sum, ping) => sum + ping, 0) / this.pingHistory.length;
            if (avgPing < 100) score += 1;
            else if (avgPing < 300) score += 0.5;
        }
        
        // 转换为质量等级
        if (score >= 7) return 'excellent';
        if (score >= 5) return 'good';
        if (score >= 3) return 'fair';
        return 'poor';
    }
    
    sendHeartbeat() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const pingStart = Date.now();
            
            try {
                this.ws.send(JSON.stringify({
                    type: 'ping',
                    timestamp: pingStart,
                    id: Math.random().toString(36).substr(2, 9)
                }));
            } catch (error) {
                console.error('心跳发送失败:', error);
            }
        }
    }
    
    handlePongResponse(data) {
        if (data.type === 'pong' && data.timestamp) {
            const pingTime = Date.now() - data.timestamp;
            this.recordPingTime(pingTime);
        }
    }
    
    recordPingTime(pingTime) {
        this.pingHistory.push(pingTime);
        
        // 只保留最近20次ping记录
        if (this.pingHistory.length > 20) {
            this.pingHistory.shift();
        }
        
        // 评估连接质量
        this.assessConnectionQuality();
    }
    
    assessConnectionQuality() {
        if (this.pingHistory.length < 3) return;
        
        const avgPing = this.pingHistory.reduce((sum, ping) => sum + ping, 0) / this.pingHistory.length;
        const maxPing = Math.max(...this.pingHistory);
        const variance = this.calculateVariance(this.pingHistory);
        
        let quality;
        if (avgPing < 50 && maxPing < 100 && variance < 500) {
            quality = 'excellent';
        } else if (avgPing < 150 && maxPing < 300 && variance < 2000) {
            quality = 'good';
        } else if (avgPing < 400 && maxPing < 800 && variance < 10000) {
            quality = 'fair';
        } else {
            quality = 'poor';
        }
        
        if (quality !== this.connectionQuality) {
            this.connectionQuality = quality;
            console.log(`连接质量变化: ${quality} (平均延迟: ${avgPing.toFixed(0)}ms)`);
            this.onConnectionQualityChange?.(quality, avgPing);
        }
    }
    
    calculateVariance(arr) {
        const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
        const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
        return variance;
    }
    
    performQualityCheck() {
        if (this.connectionState === 'connected') {
            // 发送质量检测ping
            this.sendHeartbeat();
            
            // 检查消息队列堆积情况
            if (this.messageQueue.length > 100) {
                console.warn('消息队列堆积严重，可能存在网络问题');
                this.connectionQuality = 'poor';
                this.adaptToNetworkQuality();
            }
        }
    }
    
    close() {
        if (this.qualityTimer) {
            clearInterval(this.qualityTimer);
            this.qualityTimer = null;
        }
        super.close();
    }
}

// 3. 移动端优化WebSocket
class MobileOptimizedWebSocket extends QualityAdaptiveWebSocket {
    constructor(url, options = {}) {
        super(url, options);
        
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isBackground = false;
        this.backgroundReconnectDelay = 60000; // 后台重连延迟
        this.foregroundReconnectDelay = 3000;  // 前台重连延迟
        
        if (this.isMobile) {
            this.setupMobileOptimizations();
        }
    }
    
    setupMobileOptimizations() {
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageBackground();
            } else {
                this.handlePageForeground();
            }
        });
        
        // 监听网络状态变化
        window.addEventListener('online', () => {
            console.log('网络恢复在线');
            if (this.connectionState !== 'connected') {
                this.forceReconnect();
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('网络离线');
            this.handleNetworkOffline();
        });
        
        // 监听设备方向变化(可能影响网络)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.connectionState !== 'connected') {
                    console.log('设备方向变化后检查连接');
                    this.checkAndReconnect();
                }
            }, 1000);
        });
    }
    
    handlePageBackground() {
        console.log('页面进入后台');
        this.isBackground = true;
        
        // 后台时减少心跳频率
        if (this.options.healthCheckInterval < 120000) {
            this.options.healthCheckInterval = 120000; // 2分钟
        }
        
        // 暂停一些非关键的检测
        if (this.qualityTimer) {
            clearInterval(this.qualityTimer);
            this.qualityTimer = null;
        }
    }
    
    handlePageForeground() {
        console.log('页面回到前台');
        this.isBackground = false;
        
        // 恢复正常心跳频率
        this.options.healthCheckInterval = 30000;
        
        // 重启质量检测
        this.startQualityMonitoring();
        
        // 检查连接状态
        this.checkAndReconnect();
    }
    
    handleNetworkOffline() {
        // 网络离线时停止重连尝试
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        this.connectionState = 'offline';
        this.onNetworkOffline?.();
    }
    
    checkAndReconnect() {
        if (this.connectionState === 'disconnected' || this.connectionState === 'offline') {
            console.log('检查连接状态，尝试重连');
            this.reconnectAttempts = 0; // 重置重连次数
            this.connect();
        } else if (this.connectionState === 'connected') {
            // 连接存在但可能不健康，发送检测ping
            this.sendHeartbeat();
        }
    }
    
    scheduleReconnect() {
        if (this.reconnectTimer) return;
        
        // 根据前后台状态调整重连策略
        const baseDelay = this.isBackground ? 
            this.backgroundReconnectDelay : 
            this.foregroundReconnectDelay;
            
        const delay = Math.min(
            baseDelay * Math.pow(this.options.backoffFactor, this.reconnectAttempts),
            this.isBackground ? 300000 : this.options.maxReconnectDelay // 后台最大5分钟
        );
        
        console.log(`${delay.toFixed(0)}ms后尝试重连 (${this.isBackground ? '后台' : '前台'}模式)`);
        
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }
    
    // 优化消息发送策略
    send(data) {
        // 在后台模式下，对非关键消息进行合并
        if (this.isBackground && data.priority !== 'high') {
            return this.batchSendMessage(data);
        }
        
        return super.send(data);
    }
    
    batchSendMessage(data) {
        // 将消息加入批处理队列
        if (!this.batchQueue) {
            this.batchQueue = [];
        }
        
        this.batchQueue.push(data);
        
        // 设置批处理定时器
        if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.flushBatchQueue();
            }, 5000); // 5秒后批量发送
        }
        
        return true;
    }
    
    flushBatchQueue() {
        if (this.batchQueue && this.batchQueue.length > 0) {
            const batchData = {
                type: 'batch',
                messages: this.batchQueue,
                timestamp: Date.now()
            };
            
            super.send(batchData);
            this.batchQueue = [];
        }
        
        this.batchTimer = null;
    }
    
    handlePageForeground() {
        super.handlePageForeground();
        
        // 前台时立即发送批处理队列
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.flushBatchQueue();
        }
    }
}

// 使用示例
const mobileWs = new MobileOptimizedWebSocket('ws://localhost:8080/websocket', {
    minReconnectDelay: 1000,
    maxReconnectDelay: 30000,
    maxReconnectAttempts: 50,
    healthCheckInterval: 30000,
    connectionTimeout: 15000
});

// 设置事件回调
mobileWs.onConnected = () => {
    console.log('连接建立');
    document.getElementById('status').textContent = '已连接';
    document.getElementById('status').className = 'connected';
};

mobileWs.onDisconnected = (event) => {
    console.log('连接断开:', event);
    document.getElementById('status').textContent = '已断开';
    document.getElementById('status').className = 'disconnected';
};

mobileWs.onQualityChange = (quality) => {
    console.log('网络质量:', quality);
    document.getElementById('quality').textContent = quality;
    document.getElementById('quality').className = `quality-${quality}`;
};

mobileWs.onMessage = (event) => {
    const data = JSON.parse(event.data);
    
    // 处理不同类型的消息
    if (data.type === 'pong') {
        mobileWs.handlePongResponse(data);
    } else {
        console.log('收到消息:', data);
        // 处理业务消息
    }
};

// 定期显示连接统计
setInterval(() => {
    const stats = mobileWs.getConnectionStats();
    console.log('连接统计:', stats);
    
    // 更新UI显示
    document.getElementById('stats').innerHTML = `
        <div>状态: ${stats.currentState}</div>
        <div>重连次数: ${stats.reconnectAttempts}</div>
        <div>排队消息: ${stats.queuedMessages}</div>
        <div>成功率: ${stats.successRate.toFixed(1)}%</div>
        <div>平均连接时间: ${stats.avgConnectTime.toFixed(0)}ms</div>
    `;
}, 5000);
```
## 3. 消息传输问题

### 3.1 消息丢失和重复
```javascript
// 1. 消息确认和重传机制
class ReliableWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            ackTimeout: 5000,           // 确认超时时间
            maxRetries: 3,              // 最大重试次数
            enableDuplicateDetection: true, // 启用重复检测
            messageBufferSize: 1000,    // 消息缓冲区大小
            sequenceNumberBits: 32,     // 序列号位数
            ...options
        };
        
        this.ws = null;
        this.nextSequenceNumber = 1;
        this.pendingAcks = new Map();        // 待确认消息
        this.receivedMessages = new Set();   // 已接收消息ID(用于去重)
        this.messageBuffer = new Map();      // 消息缓冲区
        this.retryTimers = new Map();        // 重试定时器
        
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocket连接成功');
            this.onConnected?.();
            
            // 连接成功后重发未确认的消息
            this.resendPendingMessages();
        };
        
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleIncomingMessage(message);
            } catch (error) {
                console.error('消息解析失败:', error);
            }
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭');
            this.onDisconnected?.(event);
            
            // 停止所有重试定时器
            this.stopAllRetryTimers();
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.onError?.(error);
        };
    }
    
    // 发送可靠消息
    sendReliable(data, options = {}) {
        const messageId = this.generateMessageId();
        const sequenceNumber = this.getNextSequenceNumber();
        
        const message = {
            id: messageId,
            sequence: sequenceNumber,
            type: options.type || 'data',
            data: data,
            timestamp: Date.now(),
            requiresAck: options.requiresAck !== false, // 默认需要确认
            priority: options.priority || 'normal',
            retryCount: 0
        };
        
        // 发送消息
        if (this.sendMessage(message)) {
            // 如果需要确认，添加到待确认列表
            if (message.requiresAck) {
                this.addToPendingAcks(message);
            }
            return messageId;
        }
        
        return null;
    }
    
    // 发送普通消息(不需要确认)
    send(data) {
        const message = {
            id: this.generateMessageId(),
            type: 'simple',
            data: data,
            timestamp: Date.now(),
            requiresAck: false
        };
        
        return this.sendMessage(message);
    }
    
    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
                console.log(`消息发送: ${message.id} (序列号: ${message.sequence || 'N/A'})`);
                return true;
            } catch (error) {
                console.error('消息发送失败:', error);
                return false;
            }
        } else {
            console.warn('WebSocket未连接，消息发送失败');
            // 将消息加入缓冲区
            this.bufferMessage(message);
            return false;
        }
    }
    
    handleIncomingMessage(message) {
        console.log(`收到消息: ${message.id} (类型: ${message.type})`);
        
        // 处理确认消息
        if (message.type === 'ack') {
            this.handleAckMessage(message);
            return;
        }
        
        // 处理心跳消息
        if (message.type === 'ping') {
            this.sendPong(message);
            return;
        }
        
        if (message.type === 'pong') {
            this.onPong?.(message);
            return;
        }
        
        // 重复消息检测
        if (this.options.enableDuplicateDetection && this.isDuplicateMessage(message)) {
            console.warn(`检测到重复消息: ${message.id}`);
            // 仍然发送确认，但不处理消息内容
            if (message.requiresAck) {
                this.sendAck(message);
            }
            return;
        }
        
        // 记录已接收消息
        if (message.id) {
            this.markMessageAsReceived(message.id);
        }
        
        // 发送确认
        if (message.requiresAck) {
            this.sendAck(message);
        }
        
        // 处理消息内容
        this.processMessage(message);
    }
    
    handleAckMessage(ackMessage) {
        const originalMessageId = ackMessage.originalMessageId;
        
        if (this.pendingAcks.has(originalMessageId)) {
            const originalMessage = this.pendingAcks.get(originalMessageId);
            console.log(`收到确认: ${originalMessageId} (耗时: ${Date.now() - originalMessage.timestamp}ms)`);
            
            // 清除待确认消息和重试定时器
            this.pendingAcks.delete(originalMessageId);
            this.clearRetryTimer(originalMessageId);
            
            // 触发确认回调
            this.onMessageAcked?.(originalMessage, ackMessage);
        } else {
            console.warn(`收到未知消息的确认: ${originalMessageId}`);
        }
    }
    
    sendAck(originalMessage) {
        const ackMessage = {
            id: this.generateMessageId(),
            type: 'ack',
            originalMessageId: originalMessage.id,
            originalSequence: originalMessage.sequence,
            timestamp: Date.now(),
            requiresAck: false
        };
        
        this.sendMessage(ackMessage);
    }
    
    sendPong(pingMessage) {
        const pongMessage = {
            id: this.generateMessageId(),
            type: 'pong',
            originalMessageId: pingMessage.id,
            timestamp: Date.now(),
            requiresAck: false
        };
        
        this.sendMessage(pongMessage);
    }
    
    addToPendingAcks(message) {
        this.pendingAcks.set(message.id, message);
        
        // 设置确认超时定时器
        const timer = setTimeout(() => {
            this.handleAckTimeout(message.id);
        }, this.options.ackTimeout);
        
        this.retryTimers.set(message.id, timer);
    }
    
    handleAckTimeout(messageId) {
        if (!this.pendingAcks.has(messageId)) return;
        
        const message = this.pendingAcks.get(messageId);
        message.retryCount++;
        
        console.warn(`消息确认超时: ${messageId} (重试次数: ${message.retryCount}/${this.options.maxRetries})`);
        
        if (message.retryCount < this.options.maxRetries) {
            // 重发消息
            console.log(`重发消息: ${messageId}`);
            if (this.sendMessage(message)) {
                // 重新设置超时定时器
                const timer = setTimeout(() => {
                    this.handleAckTimeout(messageId);
                }, this.options.ackTimeout);
                
                this.retryTimers.set(messageId, timer);
            } else {
                // 发送失败，将消息放入缓冲区
                this.bufferMessage(message);
            }
        } else {
            // 超过最大重试次数，放弃消息
            console.error(`消息发送失败，超过最大重试次数: ${messageId}`);
            this.pendingAcks.delete(messageId);
            this.clearRetryTimer(messageId);
            
            // 触发发送失败回调
            this.onMessageFailed?.(message);
        }
    }
    
    clearRetryTimer(messageId) {
        if (this.retryTimers.has(messageId)) {
            clearTimeout(this.retryTimers.get(messageId));
            this.retryTimers.delete(messageId);
        }
    }
    
    stopAllRetryTimers() {
        for (const timer of this.retryTimers.values()) {
            clearTimeout(timer);
        }
        this.retryTimers.clear();
    }
    
    isDuplicateMessage(message) {
        return message.id && this.receivedMessages.has(message.id);
    }
    
    markMessageAsReceived(messageId) {
        this.receivedMessages.add(messageId);
        
        // 限制已接收消息集合的大小
        if (this.receivedMessages.size > this.options.messageBufferSize) {
            // 删除一半最老的记录
            const entries = Array.from(this.receivedMessages);
            const toDelete = entries.slice(0, Math.floor(entries.length / 2));
            toDelete.forEach(id => this.receivedMessages.delete(id));
        }
    }
    
    bufferMessage(message) {
        // 将消息添加到缓冲区
        this.messageBuffer.set(message.id, message);
        
        // 限制缓冲区大小
        if (this.messageBuffer.size > this.options.messageBufferSize) {
            // 删除最老的消息
            const oldestId = this.messageBuffer.keys().next().value;
            this.messageBuffer.delete(oldestId);
        }
        
        console.log(`消息已缓冲: ${message.id}`);
    }
    
    resendPendingMessages() {
        console.log(`重发 ${this.pendingAcks.size} 条待确认消息`);
        
        for (const message of this.pendingAcks.values()) {
            this.sendMessage(message);
            
            // 重新设置超时定时器
            this.clearRetryTimer(message.id);
            const timer = setTimeout(() => {
                this.handleAckTimeout(message.id);
            }, this.options.ackTimeout);
            
            this.retryTimers.set(message.id, timer);
        }
    }
    
    resendBufferedMessages() {
        console.log(`重发 ${this.messageBuffer.size} 条缓冲消息`);
        
        for (const message of this.messageBuffer.values()) {
            if (this.sendMessage(message)) {
                this.messageBuffer.delete(message.id);
                
                // 如果需要确认，添加到待确认列表
                if (message.requiresAck) {
                    this.addToPendingAcks(message);
                }
            }
        }
    }
    
    processMessage(message) {
        // 处理业务消息
        this.onMessage?.(message);
    }
    
    generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    getNextSequenceNumber() {
        const seq = this.nextSequenceNumber;
        this.nextSequenceNumber = (this.nextSequenceNumber + 1) % Math.pow(2, this.options.sequenceNumberBits);
        return seq;
    }
    
    // 获取状态信息
    getStatus() {
        return {
            connected: this.ws && this.ws.readyState === WebSocket.OPEN,
            pendingAcks: this.pendingAcks.size,
            bufferedMessages: this.messageBuffer.size,
            receivedMessagesCount: this.receivedMessages.size,
            nextSequenceNumber: this.nextSequenceNumber
        };
    }
    
    // 手动重发所有待确认消息
    retryAllPending() {
        console.log('手动重发所有待确认消息');
        this.resendPendingMessages();
        this.resendBufferedMessages();
    }
    
    // 清理资源
    close() {
        this.stopAllRetryTimers();
        if (this.ws) {
            this.ws.close();
        }
    }
}

// 2. 消息顺序保证
class OrderedMessageWebSocket extends ReliableWebSocket {
    constructor(url, options = {}) {
        super(url, options);
        
        this.expectedSequenceNumber = 1;
        this.messageQueue = new Map();       // 乱序消息缓存
        this.maxQueueSize = options.maxQueueSize || 100;
        this.orderTimeout = options.orderTimeout || 10000; // 顺序等待超时
        this.orderTimers = new Map();
    }
    
    handleIncomingMessage(message) {
        // 对于需要顺序的消息进行特殊处理
        if (message.sequence !== undefined && message.type !== 'ack') {
            this.handleOrderedMessage(message);
        } else {
            // 非顺序消息直接处理
            super.handleIncomingMessage(message);
        }
    }
    
    handleOrderedMessage(message) {
        const sequenceNumber = message.sequence;
        
        console.log(`收到顺序消息: ${message.id}, 序列号: ${sequenceNumber}, 期望: ${this.expectedSequenceNumber}`);
        
        if (sequenceNumber === this.expectedSequenceNumber) {
            // 正确的序列号，立即处理
            this.processOrderedMessage(message);
            this.expectedSequenceNumber++;
            
            // 检查队列中是否有后续消息可以处理
            this.processQueuedMessages();
        } else if (sequenceNumber > this.expectedSequenceNumber) {
            // 未来的消息，缓存起来
            console.log(`缓存未来消息: ${message.id}, 序列号: ${sequenceNumber}`);
            this.queueMessage(message);
        } else {
            // 过期的消息，可能是重复或延迟到达
            console.warn(`收到过期消息: ${message.id}, 序列号: ${sequenceNumber}`);
            
            // 仍然发送确认，但不处理内容
            if (message.requiresAck) {
                this.sendAck(message);
            }
        }
    }
    
    processOrderedMessage(message) {
        // 先发送确认
        if (message.requiresAck) {
            this.sendAck(message);
        }
        
        // 记录已接收
        if (message.id) {
            this.markMessageAsReceived(message.id);
        }
        
        // 处理消息内容
        this.processMessage(message);
    }
    
    queueMessage(message) {
        this.messageQueue.set(message.sequence, message);
        
        // 限制队列大小
        if (this.messageQueue.size > this.maxQueueSize) {
            // 删除最老的消息
            const oldestSequence = Math.min(...this.messageQueue.keys());
            const oldestMessage = this.messageQueue.get(oldestSequence);
            console.warn(`队列已满，丢弃消息: ${oldestMessage.id}, 序列号: ${oldestSequence}`);
            this.messageQueue.delete(oldestSequence);
            this.clearOrderTimer(oldestSequence);
        }
        
        // 设置顺序等待超时
        const timer = setTimeout(() => {
            this.handleOrderTimeout(message.sequence);
        }, this.orderTimeout);
        
        this.orderTimers.set(message.sequence, timer);
    }
    
    processQueuedMessages() {
        while (this.messageQueue.has(this.expectedSequenceNumber)) {
            const message = this.messageQueue.get(this.expectedSequenceNumber);
            console.log(`处理队列消息: ${message.id}, 序列号: ${this.expectedSequenceNumber}`);
            
            this.messageQueue.delete(this.expectedSequenceNumber);
            this.clearOrderTimer(this.expectedSequenceNumber);
            
            this.processOrderedMessage(message);
            this.expectedSequenceNumber++;
        }
    }
    
    handleOrderTimeout(sequenceNumber) {
        if (this.messageQueue.has(sequenceNumber)) {
            console.warn(`消息顺序等待超时，跳过序列号: ${this.expectedSequenceNumber} 到 ${sequenceNumber - 1}`);
            
            // 调整期望序列号，允许处理后续消息
            this.expectedSequenceNumber = sequenceNumber;
            this.processQueuedMessages();
        }
    }
    
    clearOrderTimer(sequenceNumber) {
        if (this.orderTimers.has(sequenceNumber)) {
            clearTimeout(this.orderTimers.get(sequenceNumber));
            this.orderTimers.delete(sequenceNumber);
        }
    }
    
    // 重置序列号（用于重连后同步）
    resetSequence(newExpectedSequence) {
        console.log(`重置期望序列号: ${this.expectedSequenceNumber} -> ${newExpectedSequence}`);
        this.expectedSequenceNumber = newExpectedSequence;
        
        // 清理过期的队列消息
        for (const [seq, message] of this.messageQueue.entries()) {
            if (seq < newExpectedSequence) {
                console.log(`清理过期队列消息: ${message.id}, 序列号: ${seq}`);
                this.messageQueue.delete(seq);
                this.clearOrderTimer(seq);
            }
        }
        
        // 尝试处理队列中的消息
        this.processQueuedMessages();
    }
    
    getStatus() {
        const baseStatus = super.getStatus();
        return {
            ...baseStatus,
            expectedSequenceNumber: this.expectedSequenceNumber,
            queuedMessages: this.messageQueue.size,
            queuedSequences: Array.from(this.messageQueue.keys()).sort((a, b) => a - b)
        };
    }
    
    close() {
        // 清理所有顺序定时器
        for (const timer of this.orderTimers.values()) {
            clearTimeout(timer);
        }
        this.orderTimers.clear();
        
        super.close();
    }
}

// 3. 消息分片和重组
class ChunkedMessageWebSocket extends OrderedMessageWebSocket {
    constructor(url, options = {}) {
        super(url, options);
        
        this.maxChunkSize = options.maxChunkSize || 32768; // 32KB
        this.chunkBuffer = new Map();     // 分片缓存
        this.chunkTimeout = options.chunkTimeout || 30000; // 分片超时时间
        this.chunkTimers = new Map();
    }
    
    // 发送大消息（自动分片）
    sendLargeMessage(data, options = {}) {
        const serialized = JSON.stringify(data);
        const messageSize = new Blob([serialized]).size;
        
        if (messageSize <= this.maxChunkSize) {
            // 小消息直接发送
            return this.sendReliable(data, options);
        }
        
        // 大消息需要分片
        const messageId = this.generateMessageId();
        const chunks = this.splitIntoChunks(serialized, this.maxChunkSize);
        
        console.log(`发送大消息: ${messageId}, 大小: ${messageSize} bytes, 分片: ${chunks.length}`);
        
        // 发送分片
        chunks.forEach((chunk, index) => {
            const chunkMessage = {
                type: 'chunk',
                messageId: messageId,
                chunkIndex: index,
                totalChunks: chunks.length,
                data: chunk,
                originalType: options.type || 'data'
            };
            
            this.sendReliable(chunkMessage, {
                ...options,
                type: 'chunk'
            });
        });
        
        return messageId;
    }
    
    splitIntoChunks(data, chunkSize) {
        const chunks = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            chunks.push(data.slice(i, i + chunkSize));
        }
        return chunks;
    }
    
    processMessage(message) {
        if (message.type === 'chunk') {
            this.handleChunkMessage(message);
        } else {
            super.processMessage(message);
        }
    }
    
    handleChunkMessage(chunkMessage) {
        const { messageId, chunkIndex, totalChunks, data } = chunkMessage.data;
        
        console.log(`收到分片: ${messageId}[${chunkIndex}/${totalChunks - 1}]`);
        
        // 初始化分片缓存
        if (!this.chunkBuffer.has(messageId)) {
            this.chunkBuffer.set(messageId, {
                chunks: new Array(totalChunks),
                receivedCount: 0,
                totalChunks: totalChunks,
                originalType: chunkMessage.data.originalType,
                startTime: Date.now()
            });
            
            // 设置超时
            const timer = setTimeout(() => {
                this.handleChunkTimeout(messageId);
            }, this.chunkTimeout);
            
            this.chunkTimers.set(messageId, timer);
        }
        
        const chunkInfo = this.chunkBuffer.get(messageId);
        
        // 存储分片
        if (!chunkInfo.chunks[chunkIndex]) {
            chunkInfo.chunks[chunkIndex] = data;
            chunkInfo.receivedCount++;
            
            console.log(`分片进度: ${messageId} ${chunkInfo.receivedCount}/${chunkInfo.totalChunks}`);
        }
        
        // 检查是否所有分片都已接收
        if (chunkInfo.receivedCount === chunkInfo.totalChunks) {
            this.reassembleMessage(messageId);
        }
    }
    
    reassembleMessage(messageId) {
        const chunkInfo = this.chunkBuffer.get(messageId);
        if (!chunkInfo) return;
        
        // 重组消息
        const reassembled = chunkInfo.chunks.join('');
        
        try {
            const originalData = JSON.parse(reassembled);
            const duration = Date.now() - chunkInfo.startTime;
            
            console.log(`消息重组完成: ${messageId}, 耗时: ${duration}ms`);
            
            // 创建重组后的消息
            const reassembledMessage = {
                id: messageId,
                type: chunkInfo.originalType,
                data: originalData,
                reassembled: true,
                chunkCount: chunkInfo.totalChunks,
                reassemblyTime: duration
            };
            
            // 处理重组后的消息
            this.onMessage?.(reassembledMessage);
            
        } catch (error) {
            console.error(`消息重组失败: ${messageId}`, error);
            this.onChunkError?.(messageId, error);
        } finally {
            // 清理缓存
            this.chunkBuffer.delete(messageId);
            this.clearChunkTimer(messageId);
        }
    }
    
    handleChunkTimeout(messageId) {
        const chunkInfo = this.chunkBuffer.get(messageId);
        if (chunkInfo) {
            console.error(`分片超时: ${messageId}, 已接收: ${chunkInfo.receivedCount}/${chunkInfo.totalChunks}`);
            
            // 清理缓存
            this.chunkBuffer.delete(messageId);
            this.clearChunkTimer(messageId);
            
            // 触发超时回调
            this.onChunkTimeout?.(messageId, chunkInfo);
        }
    }
    
    clearChunkTimer(messageId) {
        if (this.chunkTimers.has(messageId)) {
            clearTimeout(this.chunkTimers.get(messageId));
            this.chunkTimers.delete(messageId);
        }
    }
    
    getStatus() {
        const baseStatus = super.getStatus();
        return {
            ...baseStatus,
            chunkedMessages: this.chunkBuffer.size,
            chunkBufferInfo: Array.from(this.chunkBuffer.entries()).map(([id, info]) => ({
                messageId: id,
                progress: `${info.receivedCount}/${info.totalChunks}`,
                elapsedTime: Date.now() - info.startTime
            }))
        };
    }
    
    close() {
        // 清理所有分片定时器
        for (const timer of this.chunkTimers.values()) {
            clearTimeout(timer);
        }
        this.chunkTimers.clear();
        
        super.close();
    }
}

// 4. 使用示例
const reliableWs = new ChunkedMessageWebSocket('ws://localhost:8080/websocket', {
    ackTimeout: 5000,
    maxRetries: 3,
    enableDuplicateDetection: true,
    maxChunkSize: 16384,        // 16KB分片
    orderTimeout: 10000,
    maxQueueSize: 100
});

// 设置事件回调
reliableWs.onConnected = () => {
    console.log('可靠连接建立');
};

reliableWs.onMessage = (message) => {
    console.log('收到业务消息:', message);
    
    if (message.reassembled) {
        console.log(`重组消息，分片数: ${message.chunkCount}, 重组耗时: ${message.reassemblyTime}ms`);
    }
};

reliableWs.onMessageAcked = (originalMessage, ackMessage) => {
    console.log(`消息已确认: ${originalMessage.id}`);
};

reliableWs.onMessageFailed = (message) => {
    console.error(`消息发送失败: ${message.id}, 重试次数: ${message.retryCount}`);
};

reliableWs.onChunkTimeout = (messageId, chunkInfo) => {
    console.error(`分片消息超时: ${messageId}, 进度: ${chunkInfo.receivedCount}/${chunkInfo.totalChunks}`);
};

// 发送普通消息
reliableWs.send({ type: 'chat', message: 'Hello World!' });

// 发送需要确认的消息
const messageId = reliableWs.sendReliable({ 
    type: 'important', 
    data: 'This is important data' 
}, { 
    priority: 'high' 
});

// 发送大文件或大数据（自动分片）
const largeData = {
    type: 'file',
    content: 'x'.repeat(100000), // 100KB数据
    metadata: {
        filename: 'test.txt',
        size: 100000
    }
};

reliableWs.sendLargeMessage(largeData, {
    type: 'file',
    priority: 'normal'
});

// 定期显示状态
setInterval(() => {
    const status = reliableWs.getStatus();
    console.log('连接状态:', status);
}, 10000);
```
## 4. 性能优化问题

### 4.1 消息队列积压和内存泄漏
```javascript
// 1. 性能优化的WebSocket实现
class PerformanceOptimizedWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            maxQueueSize: 10000,           // 最大队列大小
            batchSize: 50,                 // 批处理大小
            batchTimeout: 100,             // 批处理超时时间(ms)
            compressionThreshold: 1024,    // 压缩阈值(bytes)
            memoryMonitorInterval: 30000,  // 内存监控间隔
            maxMemoryUsage: 50,            // 最大内存使用量(MB)
            messagePoolSize: 1000,         // 消息对象池大小
            ...options
        };
        
        this.ws = null;
        this.messageQueue = [];
        this.batchTimer = null;
        this.memoryMonitor = null;
        this.messagePool = [];
        this.totalMemoryUsage = 0;
        this.messageStats = {
            sent: 0,
            received: 0,
            queued: 0,
            compressed: 0,
            errors: 0
        };
        
        this.initializeMessagePool();
        this.startMemoryMonitoring();
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocket连接成功');
            this.flushMessageQueue();
            this.onConnected?.();
        };
        
        this.ws.onmessage = (event) => {
            this.handleIncomingMessage(event);
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭');
            this.stopBatchTimer();
            this.onDisconnected?.(event);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.messageStats.errors++;
            this.onError?.(error);
        };
    }
    
    // 消息对象池管理
    initializeMessagePool() {
        for (let i = 0; i < this.options.messagePoolSize; i++) {
            this.messagePool.push(this.createMessageObject());
        }
    }
    
    createMessageObject() {
        return {
            id: null,
            type: null,
            data: null,
            timestamp: null,
            compressed: false,
            size: 0
        };
    }
    
    getMessageFromPool() {
        if (this.messagePool.length > 0) {
            return this.messagePool.pop();
        } else {
            return this.createMessageObject();
        }
    }
    
    returnMessageToPool(message) {
        // 重置消息对象
        message.id = null;
        message.type = null;
        message.data = null;
        message.timestamp = null;
        message.compressed = false;
        message.size = 0;
        
        // 避免池子过大
        if (this.messagePool.length < this.options.messagePoolSize) {
            this.messagePool.push(message);
        }
    }
    
    // 优化的消息发送
    send(data, options = {}) {
        const message = this.getMessageFromPool();
        
        message.id = this.generateMessageId();
        message.type = options.type || 'data';
        message.data = data;
        message.timestamp = Date.now();
        
        // 计算消息大小
        const serialized = JSON.stringify(data);
        message.size = new Blob([serialized]).size;
        
        // 压缩大消息
        if (message.size > this.options.compressionThreshold) {
            message.data = this.compressData(serialized);
            message.compressed = true;
            this.messageStats.compressed++;
        }
        
        // 检查内存使用
        this.totalMemoryUsage += message.size;
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            if (options.immediate) {
                // 立即发送
                this.sendImmediately(message);
            } else {
                // 加入批处理队列
                this.addToBatch(message);
            }
        } else {
            // 连接未建立，加入队列
            this.queueMessage(message);
        }
        
        return message.id;
    }
    
    sendImmediately(message) {
        try {
            const payload = this.serializeMessage(message);
            this.ws.send(payload);
            this.messageStats.sent++;
            this.returnMessageToPool(message);
        } catch (error) {
            console.error('消息发送失败:', error);
            this.messageStats.errors++;
            this.queueMessage(message); // 发送失败，加入队列重试
        }
    }
    
    addToBatch(message) {
        this.messageQueue.push(message);
        this.messageStats.queued++;
        
        // 检查是否需要立即发送批次
        if (this.messageQueue.length >= this.options.batchSize) {
            this.flushBatch();
        } else if (!this.batchTimer) {
            // 设置批处理定时器
            this.batchTimer = setTimeout(() => {
                this.flushBatch();
            }, this.options.batchTimeout);
        }
        
        // 防止队列过大
        this.trimMessageQueue();
    }
    
    flushBatch() {
        if (this.messageQueue.length === 0) return;
        
        this.stopBatchTimer();
        
        try {
            if (this.messageQueue.length === 1) {
                // 单条消息直接发送
                const message = this.messageQueue.shift();
                this.sendImmediately(message);
            } else {
                // 批量发送
                this.sendBatch();
            }
        } catch (error) {
            console.error('批量发送失败:', error);
            this.messageStats.errors++;
        }
    }
    
    sendBatch() {
        const batch = this.messageQueue.splice(0, this.options.batchSize);
        const batchMessage = {
            type: 'batch',
            messages: batch.map(msg => this.serializeMessage(msg)),
            count: batch.length,
            timestamp: Date.now()
        };
        
        try {
            this.ws.send(JSON.stringify(batchMessage));
            this.messageStats.sent += batch.length;
            this.messageStats.queued -= batch.length;
            
            // 返回消息对象到池中
            batch.forEach(msg => this.returnMessageToPool(msg));
            
            console.log(`批量发送 ${batch.length} 条消息`);
        } catch (error) {
            console.error('批量发送失败:', error);
            // 将消息重新加入队列头部
            this.messageQueue.unshift(...batch);
            throw error;
        }
    }
    
    stopBatchTimer() {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
    }
    
    trimMessageQueue() {
        if (this.messageQueue.length > this.options.maxQueueSize) {
            const removed = this.messageQueue.splice(0, this.messageQueue.length - this.options.maxQueueSize);
            console.warn(`队列已满，丢弃 ${removed.length} 条消息`);
            
            // 返回被丢弃的消息对象到池中
            removed.forEach(msg => {
                this.totalMemoryUsage -= msg.size;
                this.returnMessageToPool(msg);
            });
            
            this.messageStats.queued -= removed.length;
        }
    }
    
    queueMessage(message) {
        this.messageQueue.push(message);
        this.messageStats.queued++;
        this.trimMessageQueue();
    }
    
    flushMessageQueue() {
        if (this.messageQueue.length === 0) return;
        
        console.log(`重发队列中的 ${this.messageQueue.length} 条消息`);
        
        while (this.messageQueue.length > 0 && this.ws.readyState === WebSocket.OPEN) {
            const message = this.messageQueue.shift();
            this.sendImmediately(message);
            this.messageStats.queued--;
        }
    }
    
    // 消息压缩
    compressData(data) {
        // 使用简单的压缩算法（实际项目中可使用更高效的压缩库）
        try {
            // 这里使用简单的字符串压缩示例
            return this.simpleCompress(data);
        } catch (error) {
            console.warn('数据压缩失败:', error);
            return data;
        }
    }
    
    simpleCompress(str) {
        // 简单的RLE压缩示例
        let compressed = '';
        let count = 1;
        let currentChar = str[0];
        
        for (let i = 1; i < str.length; i++) {
            if (str[i] === currentChar && count < 9) {
                count++;
            } else {
                compressed += count > 1 ? `${count}${currentChar}` : currentChar;
                currentChar = str[i];
                count = 1;
            }
        }
        
        compressed += count > 1 ? `${count}${currentChar}` : currentChar;
        return compressed.length < str.length ? compressed : str;
    }
    
    decompressData(data) {
        try {
            return this.simpleDecompress(data);
        } catch (error) {
            console.warn('数据解压失败:', error);
            return data;
        }
    }
    
    simpleDecompress(str) {
        let decompressed = '';
        
        for (let i = 0; i < str.length; i++) {
            if (/\d/.test(str[i]) && i + 1 < str.length) {
                const count = parseInt(str[i]);
                const char = str[i + 1];
                decompressed += char.repeat(count);
                i++; // 跳过字符
            } else {
                decompressed += str[i];
            }
        }
        
        return decompressed;
    }
    
    serializeMessage(message) {
        return JSON.stringify({
            id: message.id,
            type: message.type,
            data: message.data,
            timestamp: message.timestamp,
            compressed: message.compressed
        });
    }
    
    handleIncomingMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this.messageStats.received++;
            
            // 处理批量消息
            if (message.type === 'batch') {
                this.handleBatchMessage(message);
            } else {
                this.processIncomingMessage(message);
            }
        } catch (error) {
            console.error('消息解析失败:', error);
            this.messageStats.errors++;
        }
    }
    
    handleBatchMessage(batchMessage) {
        console.log(`收到批量消息，包含 ${batchMessage.count} 条消息`);
        
        batchMessage.messages.forEach(msgStr => {
            try {
                const message = JSON.parse(msgStr);
                this.processIncomingMessage(message);
            } catch (error) {
                console.error('批量消息解析失败:', error);
                this.messageStats.errors++;
            }
        });
    }
    
    processIncomingMessage(message) {
        // 解压缩消息
        if (message.compressed) {
            message.data = this.decompressData(message.data);
        }
        
        this.onMessage?.(message);
    }
    
    // 内存监控
    startMemoryMonitoring() {
        this.memoryMonitor = setInterval(() => {
            this.checkMemoryUsage();
        }, this.options.memoryMonitorInterval);
    }
    
    checkMemoryUsage() {
        const memoryUsageMB = this.totalMemoryUsage / (1024 * 1024);
        
        console.log(`内存使用情况: ${memoryUsageMB.toFixed(2)}MB, 队列长度: ${this.messageQueue.length}`);
        
        if (memoryUsageMB > this.options.maxMemoryUsage) {
            console.warn('内存使用过高，执行清理');
            this.performMemoryCleanup();
        }
        
        this.onMemoryUsageUpdate?.(memoryUsageMB, this.messageQueue.length);
    }
    
    performMemoryCleanup() {
        // 清理一半的队列消息
        const toRemove = Math.floor(this.messageQueue.length / 2);
        const removed = this.messageQueue.splice(0, toRemove);
        
        // 更新内存使用量
        removed.forEach(msg => {
            this.totalMemoryUsage -= msg.size;
            this.returnMessageToPool(msg);
        });
        
        this.messageStats.queued -= removed.length;
        
        // 强制垃圾回收（如果可用）
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        console.log(`内存清理完成，移除 ${toRemove} 条消息`);
    }
    
    generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    // 获取性能统计
    getPerformanceStats() {
        return {
            ...this.messageStats,
            queueLength: this.messageQueue.length,
            memoryUsageMB: (this.totalMemoryUsage / (1024 * 1024)).toFixed(2),
            poolSize: this.messagePool.length,
            averageMessageSize: this.messageStats.sent > 0 ? 
                (this.totalMemoryUsage / this.messageStats.sent).toFixed(0) : 0,
            compressionRatio: this.messageStats.sent > 0 ? 
                (this.messageStats.compressed / this.messageStats.sent * 100).toFixed(1) + '%' : '0%'
        };
    }
    
    // 清理资源
    close() {
        this.stopBatchTimer();
        
        if (this.memoryMonitor) {
            clearInterval(this.memoryMonitor);
            this.memoryMonitor = null;
        }
        
        // 清理队列
        this.messageQueue.forEach(msg => this.returnMessageToPool(msg));
        this.messageQueue = [];
        
        if (this.ws) {
            this.ws.close();
        }
        
        console.log('WebSocket资源已清理');
    }
}

// 2. 防抖和节流优化
class ThrottledWebSocket extends PerformanceOptimizedWebSocket {
    constructor(url, options = {}) {
        super(url, options);
        
        this.throttleOptions = {
            sendThrottleDelay: 16,          // ~60fps
            messageTypeThrottles: new Map(), // 不同类型消息的节流配置
            ...options.throttle
        };
        
        this.lastSendTimes = new Map();
        this.throttledMessages = new Map();
        this
```