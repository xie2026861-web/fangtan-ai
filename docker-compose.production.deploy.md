# 房探AI生产环境Docker Compose部署指南

## 快速启动

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp .env.production.example .env.production

# 编辑配置
vim .env.production
```

### 2. 启动服务

```bash
# 启动所有服务
docker-compose -f docker-compose.production.yml up -d

# 查看日志
docker-compose -f docker-compose.production.yml logs -f

# 停止服务
docker-compose -f docker-compose.production.yml down
```

## 服务列表

| 服务 | 端口 | 说明 |
|------|------|------|
| api-gateway | 3001 | API Gateway服务 |
| web | 3000 | Web前端服务 |
| worker | - | 后台任务处理 |
| prometheus | 9090 | 监控数据收集 |
| grafana | 3001 | 监控可视化 |
| alertmanager | 9093 | 告警管理 |
| loki | 3100 | 日志聚合 |
| promtail | - | 日志收集 |

## 监控访问

- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **Loki**: http://localhost:3100

## 告警通知配置

### 钉钉通知

在`.env.production`中添加：

```bash
DINGTALK_ACCESS_TOKEN=your-dingtalk-robot-token
```

### 邮件通知

在`monitoring/alertmanager/alertmanager.yml`中配置SMTP。

## 数据持久化

数据存储在Docker卷中：

- `prometheus_data`: Prometheus数据
- `grafana_data`: Grafana数据
- `alertmanager_data`: Alertmanager数据
- `loki_data`: Loki日志数据

## 健康检查

```bash
# 检查所有服务状态
docker-compose -f docker-compose.production.yml ps

# 检查服务健康状态
curl http://localhost:3001/health
```

## 扩缩容

```bash
# 扩展API Gateway到3个实例
docker-compose -f docker-compose.production.yml up -d --scale api-gateway=3
```

## 日志查看

```bash
# 查看所有日志
docker-compose -f docker-compose.production.yml logs

# 查看特定服务日志
docker-compose -f docker-compose.production.yml logs api-gateway
docker-compose -f docker-compose.production.yml logs web

# 实时日志
docker-compose -f docker-compose.production.yml logs -f api-gateway
```

## 清理

```bash
# 停止并删除数据卷
docker-compose -f docker-compose.production.yml down -v

# 完全清理（包括镜像）
docker-compose -f docker-compose.production.yml down -v --rmi all
```
