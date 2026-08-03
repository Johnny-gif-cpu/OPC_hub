// ============================================================
// Pandora X — PM2 进程管理配置
// 使用: pm2 start ecosystem.config.cjs
// ============================================================

module.exports = {
  apps: [
    {
      name: 'pandora-backend',
      // Run from project root so dotenv finds .env
      script: 'backend/src/server.js',
      // ---- 自动重启 ----
      max_memory_restart: '256M',
      // ---- 日志 ----
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/backend-error.log',
      out_file: 'logs/backend-out.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
