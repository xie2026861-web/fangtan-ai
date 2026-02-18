# 房探AI - 快速部署指南

**版本**: v1.0  
**日期**: 2026-02-18

---

## 🚀 快速开始

### 1. 环境要求

```yaml
必需软件:
├── Node.js: 20+
├── Docker Desktop: Latest
├── Git: Latest
└── 8GB+ RAM (推荐16GB)
```

### 2. 克隆项目

```bash
git clone https://github.com/fangtan-ai/fangtan-ai.git
cd fangtan-ai
```

### 3. 安装依赖

```bash
# 安装所有依赖
npm install
```

### 4. 配置环境

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
# vim .env
```

### 5. 启动数据库

```bash
# 使用Docker Compose启动数据库
docker-compose -f docker-compose.local.yml up -d

# 检查状态
docker-compose -f docker-compose.local.yml ps
```

**启动的服务**:
- PostgreSQL (端口5432)
- MongoDB (端口27017)
- Redis (端口6379)
- Elasticsearch (端口9200)
- ClickHouse (端口8123)
- Kafka (端口9092)
- MinIO (端口9000)

### 6. 初始化数据库

```bash
# 进入API网关目录
cd apps/api-gateway

# 生成Prisma Client
npx prisma generate

# 运行迁移
npx prisma migrate dev --name init

# 填充测试数据（可选）
npx prisma db seed
```

### 7. 启动开发服务

**终端1 - API网关**:

```bash
cd apps/api-gateway
npm run start:dev
```

**终端2 - 前端**:

```bash
cd apps/web
npm run dev
```

### 8. 验证部署

```bash
# API健康检查
curl http://localhost:3001/health

# API文档
# 浏览器访问: http://localhost:3001/docs

# 前端页面
# 浏览器访问: http://localhost:3000
```

---

## 🐳 Docker部署

### 开发环境

```bash
# 启动所有服务
docker-compose -f docker-compose.local.yml up -d

# 查看日志
docker-compose -f docker-compose.local.yml logs -f

# 停止服务
docker-compose -f docker-compose.local.yml down
```

### 生产环境

```bash
# 构建并部署
docker-compose -f docker-compose.yml build --no-cache
docker-compose -f docker-compose.yml up -d

# 或使用一键部署脚本
chmod +x deploy.sh
./deploy.sh production
```

---

## 📁 项目结构

```
fangtan-ai/
├── apps/
│   ├── api-gateway/         # NestJS API网关
│   │   ├── src/
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── users/      # 用户模块
│   │   │   ├── health/     # 健康检查
│   │   │   └── prisma/     # 数据库
│   │   ├── test/          # 测试
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/               # Next.js前端
│       ├── src/
│       │   ├── app/       # App Router
│       │   ├── components/ # 组件
│       │   ├── lib/       # 工具
│       │   └── stores/    # 状态
│       ├── Dockerfile
│       └── package.json
│
├── docs/                     # 文档
├── scripts/                   # 脚本
├── docker-compose.local.yml   # 本地环境
├── docker-compose.yml        # 生产环境
├── deploy.sh               # 部署脚本
├── .env.example            # 环境变量模板
└── README.md
```

---

## 🔧 常用命令

```bash
# 安装依赖
npm install

# 运行测试
npm run test

# 运行测试（覆盖率）
npm run test:coverage

# 代码检查
npm run lint

# 代码格式化
npm run format

# 构建项目
npm run build

# 一键部署
./deploy.sh local      # 本地开发
./deploy.sh staging   # 预发布
./deploy.sh production # 生产环境
```

---

## 📚 API文档

部署完成后，访问Swagger文档:

```
http://localhost:3001/docs
```

**核心API**:

| 模块 | 端点 | 说明 |
|------|------|------|
| 认证 | POST /api/v1/auth/login | 用户登录 |
| 认证 | POST /api/v1/auth/register | 用户注册 |
| 用户 | GET /api/v1/users | 用户列表 |
| 健康 | GET /health | 健康检查 |

---

## 🐛 常见问题

### 1. 数据库连接失败

```bash
# 检查Docker是否运行
docker ps

# 检查端口
telnet localhost 5432

# 查看数据库日志
docker-compose -f docker-compose.local.yml logs postgres
```

### 2. 依赖安装失败

```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json

# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 3. Prisma迁移失败

```bash
# 重置数据库（开发环境）
cd apps/api-gateway
npx prisma migrate reset --force

# 重新迁移
npx prisma migrate dev --name init
```

---

## 📈 监控

### 本地监控地址

| 服务 | 地址 | 说明 |
|------|------|------|
| pgAdmin | http://localhost:5050 | PostgreSQL管理 |
| Redis Commander | http://localhost:8081 | Redis管理 |
| Kibana | http://localhost:5601 | 日志分析 |
| MinIO Console | http://localhost:9001 | 对象存储 |

---

## 🔒 安全配置

**生产环境必须修改**:

```bash
# 1. JWT密钥
JWT_SECRET="your-very-long-secret-key-here"

# 2. 数据库密码
# 使用强密码

# 3. API Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# 4. 第三方密钥
AMAP_KEY="your-amap-key"
WECHAT_CORP_ID="your-corp-id"
```

---

## 📞 技术支持

遇到问题?

1. 查看日志: `docker-compose logs`
2. 检查文档: `docs/`
3. 创建Issue: GitHub Issues

---

**Happy Coding! 🚀**
