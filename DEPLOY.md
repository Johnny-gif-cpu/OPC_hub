# 🚀 Pandora X — 部署指南

**架构：前端 Vercel + 后端 VPS + 数据库 MongoDB Atlas**

```
用户浏览器
    │
    ├── https://你的域名.vercel.app  (Vercel)
    │       └── React SPA（纯静态文件）
    │              │
    │              │ API 请求 → https://api.你的域名.com
    │              ▼
    └── https://api.你的域名.com  (VPS · Nginx · PM2)
            └── Node.js 后端 :4000
                   │
                   ▼
            MongoDB Atlas（云数据库）
```

---

## 📋 你需要准备

| 项目 | 说明 | 要多久 |
|---|---|---|
| **GitHub 仓库** | 代码推送自动触发 Vercel 部署 | 已有 |
| **Vercel 账号** | 托管前端静态文件（免费） | 已有 |
| **VPS 一台** | Ubuntu 20.04/22.04/24.04，1C1G 即可 | 5 分钟 |
| **域名**（推荐） | 前端用 Vercel 自带域名也行。后端建议绑个子域名 | 可选 |
| **MongoDB Atlas** | 免费 512MB，够开发用了 | 5 分钟 |
| **Gmail 账号** | 发送注册验证码 | 5 分钟 |

---

## 第一步：创建 MongoDB Atlas 数据库 🔴

> MongoDB Atlas 免费层（Shared/M0）有 512MB 存储，对小型项目完全够用。

1. 打开 https://www.mongodb.com/atlas 注册/登录
2. 点击 **Create a Cluster** → 选 **M0 FREE** → 创建
3. 创建后进入 **Database Access**（左侧菜单）：
   - 点 **+ Add New Database User**
   - Username: `pandora`
   - Password: 点 Autogenerate 或自己设一个 **（记下来！）**
   - Privileges: **Atlas admin**
4. 进入 **Network Access**：
   - 点 **+ Add IP Address**
   - 选 **Allow Access from Anywhere** (0.0.0.0/0)
5. 回到 **Database** 页，点 **Connect**：
   - 选 **Drivers**
   - 复制连接字符串，类似：
     ```
     mongodb+srv://pandora:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - 把 `<db_password>` 替换为你刚设的密码
   - 把 `?` 前面的数据库名加上：`...mongodb.net/pandora?retryWrites=true&w=majority`

> 最终连接字符串格式：`mongodb+srv://pandora:你的密码@cluster0.xxxxx.mongodb.net/pandora?retryWrites=true&w=majority`

---

## 第二步：准备 VPS 环境

SSH 连上 VPS：

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 验证
node -v   # 应显示 v22.x.x

# 3. 安装 Nginx
sudo apt install -y nginx

# 4. 安装 PM2（进程守护）
sudo npm install -g pm2

# 5. 安装 Git
sudo apt install -y git
```

---

## 第三步：拉取代码 + 配置环境变量

```bash
cd /home/ubuntu
git clone https://github.com/你的用户名/OPC_hub.git pandora
cd pandora

# 只安装 backend 依赖（前端由 Vercel 托管）
cd backend
npm install
cd ..

# 编辑环境变量
nano .env
```

在 `.env` 中**必须修改**的 3 项：

```ini
# ① MongoDB（把整个 URL 换成你第一步拿到的）
MONGODB_URI=mongodb+srv://pandora:你的密码@cluster0.xxxxx.mongodb.net/pandora?retryWrites=true&w=majority

# ② Gmail 验证码（获取方法见下文）
GMAIL_USER=你的邮箱@gmail.com
GMAIL_APP_PASSWORD=16位应用密码

# ③ CORS 前端域名
# 如果你的 Vercel 域名是 pandora.vercel.app：
CORS_ORIGIN=https://pandora.vercel.app
```

### 🔑 获取 Gmail 应用专用密码

1. 打开 https://myaccount.google.com/security → 开启**两步验证**
2. 打开 https://myaccount.google.com/apppasswords
3. 选择应用：**邮件**，选择设备：**其他**，名称填 `Pandora`
4. 点生成，复制那 **16 位字符**（去掉空格），粘贴到 `.env`

---

## 第四步：启动后端

```bash
# 创建日志目录
mkdir -p logs

# 用 PM2 启动
pm2 start ecosystem.config.cjs

# 检查状态
pm2 status
# 应显示: pandora-backend | online

# 查看日志，确认 MongoDB 连接成功
pm2 logs pandora-backend --lines 10
```

看到以下输出表示成功：
```
MongoDB connected: cluster0.xxxxx.mongodb.net
DB seeded → skills: 19, requests: 6, pioneers: 5, demoUsers: 6
Backend running at http://localhost:4000
Email mode: PRODUCTION (Gmail SMTP)
```

```bash
# 设置 PM2 开机自启
pm2 startup
pm2 save
```

---

## 第五步：配置 Nginx 反向代理 🔴

```bash
# 复制配置模板
sudo cp nginx.conf.example /etc/nginx/sites-available/pandora

# 编辑
sudo nano /etc/nginx/sites-available/pandora
```

**这次只需要代理 API**（前端在 Vercel），找到这一段修改：

```nginx
server {
    listen 80;
    # 🔴 改成你的后端域名或 IP
    server_name api.你的域名.com;

    # ---- API 代理到后端 ----
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用：

```bash
sudo ln -s /etc/nginx/sites-available/pandora /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 第六步：配置 HTTPS（推荐）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.你的域名.com
```

> 没有域名可以跳过。但注意：如果前端 HTTPS 而后端 HTTP，浏览器会阻止请求。Vercel 自带 HTTPS，所以后端最好也配 HTTPS。

---

## 第七步：更新前端 API 地址 + 推送 GitHub 🔴

在你的**本地电脑**上修改前端配置：

**`frontend/src/api.js`** 第 12 行附近，确认是：
```js
export const API_BASE = import.meta.env.VITE_API_BASE || '';
```

**`frontend/.env`**（新建文件）：
```
VITE_API_BASE=https://api.你的域名.com
```

> 如果不建这个文件，前端会用相对路径（适合前后端同域名的场景）。

然后提交推送：
```bash
git add .
git commit -m "切换到 MongoDB + 生产环境配置"
git push
```

Vercel 会自动检测到 GitHub 推送并重新部署前端。

---

## 第八步：验证部署 ✅

```bash
# ① 后端健康检查
curl http://localhost:4000/health
# → {"ok":true,"service":"pandora-backend","db":"mongodb","devMode":false}

# ② 测试邮件发送
curl -X POST http://localhost:4000/api/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"你的真实邮箱@qq.com"}'
# → 收到邮件说明 Gmail 配置成功

# ③ 测试 Nginx 代理（从外部访问）
curl https://api.你的域名.com/health

# ④ 打开前端页面，注册一个账号测试全流程
```

---

## 第九步：数据库备份（Crontab）

```bash
# 给备份脚本权限
chmod +x scripts/backup-db.sh

# 每天凌晨 3 点备份
crontab -e
# 添加:
0 3 * * * /home/ubuntu/pandora/scripts/backup-db.sh >> /home/ubuntu/pandora/logs/backup.log 2>&1
```

> 注意：如果使用 MongoDB Atlas，它已自带自动备份（免费层每日一次），在 Atlas 控制台 → Backup 可以查看和恢复。上面的 Crontab 备份仅在自建 MongoDB 时才需要（需安装 mongodump）。

---

## 🔄 日常更新流程

```bash
# 1. 本地改代码，推送到 GitHub
git add . && git commit -m "更新描述" && git push

# → Vercel 自动部署前端（无需手动操作）

# 2. SSH 到 VPS 更新后端
ssh ubuntu@你的VPS
cd /home/ubuntu/pandora
git pull                    # 拉最新代码
cd backend && npm install   # 如有新依赖
pm2 restart pandora-backend # 重启后端
```

---

## 📊 架构总览

```
┌──────────────────────────────────────────────┐
│  GitHub                                       │
│  ├── git push → Vercel 自动部署前端           │
│  └── git pull ← VPS 手动更新后端              │
└──────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐    ┌─────────────────────────┐
│  Vercel             │    │  VPS (Ubuntu)            │
│  ├── React SPA      │    │  ├── Nginx (:80/:443)    │
│  └── 自带 HTTPS     │    │  ├── PM2 → Node :4000    │
└─────────────────────┘    │  └── Crontab 备份        │
         │                 └──────────┬──────────────┘
         │ API 请求                   │
         └──────────→ 后端 ◄──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  MongoDB Atlas      │
                │  (自动备份 + 监控)   │
                └─────────────────────┘
```

---

## 🔧 故障排查

| 问题 | 检查 |
|---|---|
| 后端启动失败 | `pm2 logs pandora-backend` 查看 MongoDB 连接是否成功 |
| 502 Bad Gateway | `pm2 status` 确认 online；`nginx -t` 确认配置正确 |
| 邮箱发不出去 | `.env` 中 GMAIL 配置是否正确；是否开启了两步验证和应用密码 |
| CORS 报错 | `.env` 中 `CORS_ORIGIN` 是否和实际前端地址**完全一致**（含 https://） |
| Vercel 前端报网络错误 | 前端 `.env` 中 `VITE_API_BASE` 是否指向正确的后端域名 |
| MongoDB 连不上 | Atlas Network Access 是否添加了 0.0.0.0/0；用户名密码是否写对了 |
