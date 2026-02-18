# 房探AI Kubernetes部署指南

## 目录结构

```
infra/
├── k8s/
│   ├── base/
│   │   ├── namespace.yaml      # 命名空间配置
│   │   ├── configmap.yaml      # 应用配置
│   │   └── secrets.yaml       # 敏感配置
│   └── production/
│       ├── api-gateway.yaml    # API Gateway部署
│       ├── web.yaml            # Web前端部署
│       ├── postgres-statefulset.yaml  # PostgreSQL
│       ├── redis-deployment.yaml      # Redis
│       ├── mongo-deployment.yaml      # MongoDB
│       ├── es-deployment.yaml         # Elasticsearch
│       └── ingress.yaml               # 入口配置
└── terraform/
    ├── main.tf             # 主资源配置
    ├── variables.tf        # 变量定义
    ├── outputs.tf          # 输出定义
    ├── providers.tf       # Providers配置
    ├── kubernetes.tf      # K8s集群配置
    └── docker-registry.tf # 镜像仓库配置
```

## 快速部署

### 1. 前提条件

- kubectl配置正确
- 已有Kubernetes集群
- 镜像已推送到仓库

### 2. 配置Secrets

```bash
# 编辑 secrets.yaml，填入真实配置
kubectl apply -f infra/k8s/base/secrets.yaml
```

### 3. 部署命名空间和配置

```bash
kubectl apply -f infra/k8s/base/
```

### 4. 部署中间件

```bash
# 按顺序部署（注意依赖关系）
kubectl apply -f infra/k8s/production/postgres-statefulset.yaml
kubectl apply -f infra/k8s/production/redis-deployment.yaml
kubectl apply -f infra/k8s/production/mongo-deployment.yaml
kubectl apply -f infra/k8s/production/es-deployment.yaml
```

### 5. 部署应用服务

```bash
kubectl apply -f infra/k8s/production/api-gateway.yaml
kubectl apply -f infra/k8s/production/web.yaml
```

### 6. 配置Ingress

```bash
kubectl apply -f infra/k8s/production/ingress.yaml
```

## Terraform部署

### 1. 初始化

```bash
cd infra/terraform
terraform init
```

### 2. 规划部署

```bash
terraform plan -var-file=production.tfvars
```

### 3. 执行部署

```bash
terraform apply -var-file=production.tfvars
```

### 4. 变量文件示例 (production.tfvars)

```hcl
environment = "production"
region = "cn-hangzhou"
cluster_name = "fangtan-ai-cluster"

# 镜像配置
docker_registry = "registry.cn-hangzhou.aliyuncs.com"
docker_image_prefix = "fangtan-ai"
image_tag = "v1.0.0"

# 数据库密码（敏感信息）
database_password = "your-secure-password"
redis_password = "your-redis-password"
mongo_password = "your-mongo-password"
jwt_secret = "your-jwt-secret"

# API Keys
openai_api_key = "sk-xxx"
anthropic_api_key = "sk-ant-xxx"

# 存储配置
storage_class_name = "cloud_ssd"
postgres_storage_size = "100Gi"
redis_storage_size = "20Gi"
mongo_storage_size = "50Gi"
elasticsearch_storage_size = "100Gi"

# 集群配置
api_gateway_replicas = 2
web_replicas = 2
create_cluster = false
create_cr_instance = false
cr_instance_name = "fangtan-ai-cr"
```

## 验证部署

### 检查Pod状态

```bash
kubectl get pods -n fangtan-ai
kubectl get pods -n fangtan-ai-monitoring
```

### 检查服务

```bash
kubectl get svc -n fangtan-ai
```

### 检查Ingress

```bash
kubectl get ingress -n fangtan-ai
```

### 检查日志

```bash
kubectl logs -f deployment/fangtan-api-gateway -n fangtan-ai
kubectl logs -f deployment/fangtan-web -n fangtan-ai
```

## 扩缩容

### 手动扩缩容

```bash
kubectl scale deployment fangtan-api-gateway --replicas=4 -n fangtan-ai
kubectl scale deployment fangtan-web --replicas=3 -n fangtan-ai
```

### 自动扩缩容

HPA已配置，自动根据CPU/内存使用率扩缩容：

```bash
kubectl get hpa -n fangtan-ai
```

## 更新部署

### 更新镜像版本

```bash
kubectl set image deployment/fangtan-api-gateway api-gateway=registry.cn-hangzhou.aliyuncs.com/fangtan-ai/api-gateway:v1.1.0 -n fangtan-ai
kubectl set image deployment/fangtan-web web=registry.cn-hangzhou.aliyuncs.com/fangtan-ai/web:v1.1.0 -n fangtan-ai
```

### 滚动更新

```bash
kubectl rollout restart deployment/fangtan-api-gateway -n fangtan-ai
kubectl rollout restart deployment/fangtan-web -n fangtan-ai
```

### 回滚

```bash
kubectl rollout undo deployment/fangtan-api-gateway -n fangtan-ai
```

## 监控

### Prometheus

访问地址: http://prometheus:9090

### Grafana

访问地址: http://grafana:3001
默认账号: admin/admin

### Alertmanager

访问地址: http://alertmanager:9093

## 故障排查

### Pod启动失败

```bash
kubectl describe pod <pod-name> -n fangtan-ai
kubectl logs <pod-name> -n fangtan-ai --previous
```

### 服务不可达

```bash
kubectl get endpoints -n fangtan-ai
kubectl describe service <service-name> -n fangtan-ai
```

### 网络问题

```bash
kubectl exec -it <pod-name> -n fangtan-ai -- nslookup <service-name>
kubectl exec -it <pod-name> -n fangtan-ai -- curl http://<service-name>:<port>
```
