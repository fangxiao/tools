const fs = require('fs');
const path = require('path');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 根据环境变量设置日志级别
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// 日志级别权重
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// 写入日志文件
function writeLog(level, message) {
  // 检查日志级别
  if (levels[level] > levels[logLevel]) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
  
  // 异步写入日志文件
  fs.appendFile(path.join(logDir, 'access.log'), logMessage, (err) => {
    if (err) {
      console.error('写入日志文件失败:', err);
    }
  });
}

// 访问日志中间件
function accessLogger(req, res, next) {
  // 记录请求信息
  const logMessage = `${req.method} ${req.url} - IP: ${req.ip} User-Agent: ${req.get('User-Agent')}`;
  writeLog('info', logMessage);
  
  // 记录响应时间
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseLog = `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`;
    writeLog('info', responseLog);
  });
  
  next();
}

// 错误日志记录
function logError(error, req) {
  const errorMessage = `Error: ${error.message}\nStack: ${error.stack}\nRequest: ${req ? `${req.method} ${req.url}` : 'N/A'}`;
  writeLog('error', errorMessage);
}

module.exports = {
  accessLogger,
  logError
};