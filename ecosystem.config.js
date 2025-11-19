module.exports = {
  apps: [{
    name: 'household-item-usage-management',
    script: './app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    // 添加日志配置
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // 添加性能优化配置
    node_args: '--max-old-space-size=4096',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      // 生产环境配置
      LOG_LEVEL: 'info'
    }
  }]
};