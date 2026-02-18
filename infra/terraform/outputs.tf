# 房探AI Terraform输出定义

# 命名空间输出
output "namespace_fangtan_ai" {
  description = "主命名空间名称"
  value       = kubernetes_namespace.fangtan_ai.metadata[0].name
}

output "namespace_monitoring" {
  description = "监控命名空间名称"
  value       = kubernetes_namespace.monitoring.metadata[0].name
}

# 服务端点输出
output "postgres_endpoint" {
  description = "PostgreSQL服务端点"
  value       = "${kubernetes_service.postgres.metadata[0].name}:5432"
}

output "redis_endpoint" {
  description = "Redis服务端点"
  value       = "${kubernetes_service.redis.metadata[0].name}:6379"
}

output "mongo_endpoint" {
  description = "MongoDB服务端点"
  value       = "${kubernetes_service.mongo.metadata[0].name}:27017"
}

output "elasticsearch_endpoint" {
  description = "Elasticsearch服务端点"
  value       = "${kubernetes_service.elasticsearch.metadata[0].name}:9200"
}

output "api_gateway_endpoint" {
  description = "API Gateway服务端点"
  value       = "${kubernetes_service.api_gateway.metadata[0].name}:3001"
}

output "web_endpoint" {
  description = "Web服务端点"
  value       = "${kubernetes_service.web.metadata[0].name}:80"
}

# 外部访问地址（需要配置Ingress）
output "web_external_url" {
  description = "Web外部访问地址"
  value       = "https://${var.domain_name}"
}

output "api_external_url" {
  description = "API外部访问地址"
  value       = "https://${var.api_domain}"
}

# 部署状态
output "api_gateway_deployment_status" {
  description = "API Gateway部署状态"
  value       = kubernetes_deployment.api_gateway.status
}

output "web_deployment_status" {
  description = "Web部署状态"
  value       = kubernetes_deployment.web.status
}

# HPA状态
output "api_gateway_hpa" {
  description = "API Gateway HPA配置"
  value       = kubernetes_horizontal_pod_autoscaler.api_gateway.metadata[0].name
}

output "web_hpa" {
  description = "Web HPA配置"
  value       = kubernetes_horizontal_pod_autoscaler.web.metadata[0].name
}
