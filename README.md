# Pandora X · 潘多拉

面向 AI Agent 时代的 **Skills 集合与一键部署平台**。汇集众智，像打开潘多拉魔盒一样，
发现、部署、分享并靠创作获得激励 —— 连接日常灵感与企业增长。

> 暗色高级科技风（深空紫黑底 + 霓虹辉光 + 玻璃拟态），纯 CSS 设计系统，零 UI 库。

---

## ✨ 功能总览

- **落地页**：品牌主视觉（粒子 + 辉光动效）、注册 / 登录 / 访客直接开始。
- **Pandora Box**：19 个精选 Skills，日常 / 企业双轨分类与筛选。
- **一键部署**：选择框架（Claude Code / Codex / Cursor / OpenClaw / Hermes / 通用）→ 生成命令 → 一键复制。
- **需求广场**：企业发布需求，创作者报名对接。
- **Pandora X 先锋榜**：创作者激励与排行。
- **社区层**：关注创作者、私信聊天（带未读轮询）。
- **账户体系**：邮箱验证码注册（零配置时为开发模式，验证码直接在页面显示）、登录、个人中心、上传 Skill。

---

## 🧱 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 · Vite 6 · react-router-dom 7 · 纯 CSS（单文件设计系统） |
| 后端 | Node 原生 `http` · Mongoose · bcryptjs · nodemailer |
| 数据 | MongoDB（Atlas 免费层 或 自建），启动时自动初始化种子数据 |

> 需要 **Node ≥ 18**（推荐 Node 22 LTS）和本地/远程 MongoDB 实例。

---

## 🚀 快速开始（克隆即用）

```bash
# 1. 克隆
git clone https://github.com/Johnny-gif-cpu/OPC_hub.git
cd OPC_hub

# 2. 安装依赖（npm workspaces，一次装好前后端）
npm install

# 3. 启动（同时拉起后端 :4000 与前端 :5173）
npm run dev
```

打开浏览器访问 **http://localhost:5173** 即可，效果与作者本地完全一致。

> 数据库已随仓库提交并预置好 6 位演示创作者 + 19 个 Skills + 需求 / 先锋榜，**无需任何额外配置**。

### 演示账号（可直接登录体验社区 / 私信）

| 邮箱 | 密码 |
|---|---|
| `riverflow@pandora.ai` | `pandora123` |
| `neolab@pandora.ai` | `pandora123` |
| `pandora@pandora.ai`（官方小助手） | `pandora123` |

> 全部演示账号密码均为 `pandora123`。

---

## ⚙️ 环境变量（可选）

零配置即可运行。如需真实邮件发送验证码，复制 `.env.example` 为 `.env` 并填写：

```bash
cp .env.example .env
```

- 不配置邮箱 → **开发模式**：验证码直接显示在注册页 / 打印到后端控制台，注册照常完成。
- 配置 Gmail（`GMAIL_USER` + `GMAIL_APP_PASSWORD`）→ 真实发信。

---

## 📦 常用命令

```bash
npm run dev      # 同时启动前后端（开发）
npm run build    # 构建前端产物
npm start        # 仅启动后端（生产）

# 重新生成 / 重置数据库（可选）
node backend/src/seed.js
```

---

## 📁 目录结构

```
OPC_hub/
├── backend/
│   ├── data/                # 数据目录（MongoDB 不需要，保留用于兼容）
│   └── src/                 # server.js · db.js · models.js · seed.js · rate-limit.js
├── frontend/
│   ├── public/              # favicon + floater 资源
│   └── src/                 # App.jsx · LandingPage.jsx · Social.jsx · styles.css 等
├── package.json             # npm workspaces 根
└── vercel.json
```

---

## 🛡️ 安全提示

部署和执行任意 Skill 前，请先查看其来源与权限说明。本仓库为演示项目。
