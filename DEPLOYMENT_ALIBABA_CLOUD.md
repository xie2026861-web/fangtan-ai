# 房探AI 阿里云部署指南

## 前置要求

在开始部署前，请确保你已拥有：

- [ ] 阿里云账号
- [ ] 阿里云服务器 (ECS)
- [ ] 域名 (可选，已备案)

---

## 第一步：购买阿里云服务器

### 推荐配置

| 配置项 | 推荐选择 |
|--------|----------|
| **产品** | 云服务器 ECS |
| **地域** | 华北2 (北京) / 华北3 (张家口) |
| **实例规格** | ecs.t6-c1m2.large (2核4G) 或 ecs.t6-c2m2.large (4核8G) |
| **操作系统** | Ubuntu 22.04 LTS |
| **带宽** | 5-10Mbps |
| **存储** | 40GB SSD云盘 |

**预估费用**: 约 200-400元/月

---

## 第二步：开放安全组端口

在阿里云控制台 → 安全组 → 配置规则，开放以下端口：

| 端口 | 用途 |
|------|------|
| 22 | SSH远程登录 |
| 80 | HTTP网站访问 |
| 443 | HTTPS加密访问 |
| 3000 | Node.js应用 |
| 5432 | PostgreSQL数据库 |
| 6379 | Redis缓存 |

---

## 第三步：连接到服务器

```bash
# 使用SSH连接服务器
ssh root@你的服务器IP

# 示例
ssh root@47. xxx.xxx.xxx
```

---

## 第四步：一键部署脚本

连接到服务器后，执行以下命令：

```bash
# 1. 下载部署脚本
curl -O https://raw.githubusercontent.com/xie2026861-web/fangtan-ai/main/scripts/deploy.sh

# 2. 添加执行权限
chmod +x deploy.sh

# 3. 运行部署脚本
./deploy.sh
```

或者手动执行以下步骤：

### 3.1 安装Docker

```bash
# 更新系统
apt update && apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com | sh

# 启动Docker
systemctl start docker
systemctl enable docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 3.2 配置防火墙

```bash
# 开放端口
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw enable
```

### 3.3 部署应用

```bash
# 创建项目目录
mkdir -p /opt/fangtan-ai
cd /opt/fangtan-ai

# 拉取代码或上传代码
# 方式A: 如果有Git
git clone https://github.com/xie2026861-web/fangtan-ai.git

# 方式B: 上传项目文件
# 使用FileZilla或SCP上传项目

# 复制环境配置
cp .env.production.example .env.production

# 编辑环境变量
nano .env.production
```

### 3.4 配置环境变量

编辑 `.env.production` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://user:password@postgres:5432/fangtan

# Redis配置
REDIS_URL=redis://redis:6379

# JWT配置
JWT_SECRET=your-secret-key-change-this

# 应用配置
NEXT_PUBLIC_API_URL=http://your-server-ip:3000
```

### 3.5 启动服务

```bash
# 使用Docker Compose启动
docker-compose -f docker-compose.production.yml up -d

# 查看运行状态
docker-compose -f docker-compose.production.yml ps

# 查看日志
docker-compose -f docker-compose.production.yml logs -f
```

---

## 第五步：验证部署

服务启动后，在浏览器访问：

- **前台**: http://你的服务器IP
- **API**: http://你的服务器IP:3000
- **健康检查**: http://你的服务器IP:3000/health

---

## 第六步：域名配置 (可选)

### 1. 购买域名
在阿里云万网购买域名 (fangtan.ai)

### 2. 配置DNS解析
在阿里云DNS控制台添加记录：

| 记录类型 | 主机记录 | 记录值 |
|----------|----------|--------|
| A | @ | 你的服务器IP |
| A | www | 你的服务器IP |

### 3. 配置Nginx反向代理

```nginx
server {
    listen 80;
    server_name fangtan.ai www.fangtan.ai;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 常用命令

```bash
# 重启服务
docker-compose -f docker-compose.production.yml restart

# 停止服务
docker-compose -f docker-compose.production.yml down

# 更新并重新部署
git pull
docker-compose -f docker-compose.production.yml up -d --build

# 查看日志
docker-compose -f docker-compose.production.yml logs -f --tail=100
```

---

## 常见问题

### Q: 端口被占用？
```bash
# 查看端口占用
netstat -tlnp | grep 3000

# 杀死占用进程
kill -9 <PID>
```

### Q: 数据库连接失败？
检查 `.env.production` 中的 `DATABASE_URL` 是否正确

### Q: 如何备份数据？
```bash
# 备份数据库
docker-compose exec postgres pg_dump -U user fangtan > backup.sql

# 备份文件
tar -czvf backup-files.tar.gz /opt/fangtan-ai
```

---

## 技术支持

如有问题，请提供：
1. 服务器系统版本: `cat /etc/os-release`
2. Docker版本: `docker --version`
3. 错误日志: `docker-compose logs`
