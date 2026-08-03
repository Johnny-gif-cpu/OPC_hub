// ============================================================
// Pandora X — PM2 进程管理配置
//
// 使用：
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup   （按提示复制粘贴命令，设置开机自启）
//
// 常用命令：
//   pm2 status             查看状态
//   pm2 logs pandora       查看日志
//   pm2 restart pandora    重启
//   pm2 stop pandora       停止
// ============================================================

module.exports = {
  apps: [
    {
      name: 'pandora',
      script: 'backend/src/server.js',
      cwd: '/opt/pandora',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      // 日志
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/opt/pandora/logs/error.log',
      out_file: '/opt/pandora/logs/out.log',
      // 自动重启（内存超 300M 或进程崩溃）
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
    },
  ],
};
