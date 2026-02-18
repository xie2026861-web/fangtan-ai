# 房探AI Terraform变量定义

# 基础配置
variable "environment" {
  description = "部署环境"
  type        = string
  default     = "production"
}

variable "region" {
  description = "阿里云区域"
  type        = string
  default     = "cn-hangzhou"
}

# Docker配置
variable "docker_registry" {
  description = "Docker镜像仓库地址"
  type        = string
  default     = "registry.cn-hangzhou.aliyuncs.com"
}

variable "docker_image_prefix" {
  description = "Docker镜像前缀"
  type        = string
  default     = "fangtan-ai"
}

variable "image_tag" {
  description = "镜像版本标签"
  type        = string
  default     = "latest"
}

# 数据库密码
variable "database_password" {
  description = "PostgreSQL密码"
  type        = string
  sensitive   = true
}

variable "redis_password" {
  description = "Redis密码"
  type        = string
  sensitive   = true
}

variable "mongo_password" {
  description = "MongoDB密码"
  type        = string
  sensitive   = true
}

# 密钥配置
variable "jwt_secret" {
  description = "JWT密钥"
  type        = string
  sensitive   = true
}

# API Keys
variable "openai_api_key" {
  description = "OpenAI API密钥"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API密钥"
  type        = string
  sensitive   = true
}

# 第三方服务配置
variable "amap_key" {
  description = "高德地图API Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "wechat_corp_id" {
  description = "企业微信CorpID"
  type        = string
  default     = ""
}

variable "wechat_agent_secret" {
  description = "企业微信应用Secret"
  type        = string
  default     = ""
  sensitive   = true
}

# 阿里云配置
variable "aliyun_access_key_id" {
  description = "阿里云AccessKey ID"
  type        = string
  default     = ""
}

variable "aliyun_access_key_secret" {
  description = "阿里云AccessKey Secret"
  type        = string
  default     = ""
  sensitive   = true
}

# 存储配置
variable "storage_class_name" {
  description = "存储类名称"
  type        = string
  default     = "cloud_ssd"
}

variable "postgres_storage_size" {
  description = "PostgreSQL存储大小"
  type        = string
  default     = "100Gi"
}

variable "redis_storage_size" {
  description = "Redis存储大小"
  type        = string
  default     = "20Gi"
}

variable "mongo_storage_size" {
  description = "MongoDB存储大小"
  type        = string
  default     = "50Gi"
}

variable "elasticsearch_storage_size" {
  description = "Elasticsearch存储大小"
  type        = string
  default     = "100Gi"
}

# 集群配置
variable "cluster_name" {
  description = "Kubernetes集群名称"
  type        = string
  default     = "fangtan-ai-cluster"
}

# 域名配置
variable "domain_name" {
  description = "主域名"
  type        = string
  default     = "fangtan.ai"
}

variable "api_domain" {
  description = "API子域名"
  type        = string
  default     = "api.fangtan.ai"
}

# 资源配额
variable "api_gateway_replicas" {
  description = "API Gateway副本数"
  type        = number
  default     = 2
}

variable "web_replicas" {
  description = "Web副本数"
  type        = number
  default     = 2
}
