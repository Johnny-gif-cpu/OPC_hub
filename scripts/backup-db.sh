#!/usr/bin/env bash
# ============================================================
# Pandora X — 数据库备份脚本
#
# 如果你用 MongoDB Atlas：
#   → 不需要此脚本。Atlas 免费层每日自动备份，
#     在 Atlas 控制台 → Backup 可查看和恢复。
#
# 如果你在 VPS 上自建 MongoDB：
#   → 安装 mongodb-database-tools 后用 mongodump：
#     sudo apt install -y mongodb-database-tools
#     mongodump --uri="$MONGODB_URI" --out=./backups/$(date +%Y%m%d_%H%M%S)
#
# 如果你用 SQLite（旧版）：
#   → 下面脚本直接复制 .db 文件
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DB_PATH="${PROJECT_DIR}/backend/data/pandora.db"
BACKUP_DIR="${1:-${PROJECT_DIR}/backups}"
RETENTION_DAYS=30

# Detect MongoDB Atlas — skip SQLite backup if using MongoDB
if [ -f "${PROJECT_DIR}/.env" ] && grep -q "mongodb+srv" "${PROJECT_DIR}/.env" 2>/dev/null; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] MongoDB Atlas 已配置，自动备份由 Atlas 提供。跳过本地备份。"
  exit 0
fi

# SQLite backup fallback
if [ ! -f "$DB_PATH" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 数据库文件不存在: $DB_PATH (可能用的 MongoDB)"
  exit 0
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/pandora_${TIMESTAMP}.db"
cp "$DB_PATH" "$BACKUP_FILE"
gzip -f "$BACKUP_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份完成: ${BACKUP_FILE}.gz"

find "$BACKUP_DIR" -name "pandora_*.db.gz" -mtime +${RETENTION_DAYS} -delete
