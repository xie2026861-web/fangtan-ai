# 房探AI项目部署文件清单

## Kubernetes配置 (infra/k8s/)

### 基础配置 (base/)
| 文件 | 说明 |
|------|------|
| namespace.yaml | 命名空间配置 |
| configmap.yaml | 应用配置ConfigMap |
| secrets.yaml | 敏感配置Secrets |
| DEPLOYMENT.md | K8s部署指南 |

### 生产配置 (production/)
| 文件 | 说明 |
|------|------|
| api-gateway.yaml | API Gateway部署 |
| web.yaml | Web前端部署 |
| postgres-statefulset.yaml | PostgreSQL StatefulSet |
| redis-deployment.yaml | Redis部署 |
| mongo-deployment.yaml | MongoDB部署 |
| es-deployment.yaml | Elasticsearch部署 |
| ingress.yaml | Ingress入口配置 |

## Terraform脚本 (infra/terraform/)

| 文件 | 说明 |
|------|------|
| main.tf | 主资源配置 |
| variables.tf | 变量定义 |
| outputs.tf | 输出定义 |
| providers.tf | Providers配置 |
| kubernetes.tf | Kubernetes集群配置 |
| docker-registry.tf | 镜像仓库配置 |

## 监控配置 (monitoring/)

### Prometheus配置
| 文件 | 说明 |
|------|------|
| prometheus/prometheus.yml | Prometheus配置 |
| prometheus/rules/fangtan-alerts.yml | 告警规则 |

### Grafana配置
| 文件 | 说明 |
|------|------|
| grafana/provisioning/datasources/datasources.yml | 数据源配置 |
| grafana/provisioning/dashboards/dashboards.yml | 仪表盘配置 |

### Alertmanager配置
| 文件 | 说明 |
|------|------|
| alertmanager/alertmanager.yml | Alertmanager配置 |

### 日志配置
| 文件 | 说明 |
|------|------|
| loki/loki-config.yml | Loki配置 |
| promtail/promtail-config.yml | Promtail配置 |

## Docker Compose配置

| 文件 | 说明 |
|------|------|
| docker-compose.production.yml | 生产环境Docker Compose |
| .env.production.example | 环境变量模板 |
| docker-compose.production.deploy.md | Docker部署指南 |

## 部署顺序

### Kubernetes部署顺序
1. `base/namespace.yaml` - 命名空间
2. `base/secrets.yaml` - 敏感配置
3. `base/configmap.yaml` - 应用配置
4. `production/postgres-statefulset.yaml` - PostgreSQL
5. `production/redis-deployment.yaml` - Redis
6. `production/mongo-deployment.yaml` - MongoDB
7. `production/es-deployment.yaml` - Elasticsearch
8. `production/api-gateway.yaml` - API Gateway
9. `production/web.yaml` - Web前端
10. `production/ingress.yaml` - Ingress

### Terraform部署顺序
1. `terraform init` - 初始化
2. `terraform plan` - 规划
3. `terraform apply` - 部署

## 快速部署命令

```bash
# Kubernetes部署
kubectl apply -f infra/k8s/base/
kubectl apply -f infra/k8s/production/

# Terraform部署
cd infra/terraform
terraform init
terraform apply -var-file=production.tfvars

# Docker Compose部署
docker-compose -f docker-compose.production.yml up -d
```
