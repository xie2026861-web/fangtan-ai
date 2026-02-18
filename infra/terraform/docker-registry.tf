# 房探AI Docker镜像仓库配置
# 阿里云容器镜像服务

# 创建命名空间
resource "alicloud_cr_namespace" "fangtan" {
  name          = "fangtan-ai"
  instance_name = var.cr_instance_name
  auto_create   = false
  default_visibility = "private"
}

# 创建镜像仓库（API Gateway）
resource "alicloud_cr_ee_repo" "api_gateway" {
  instance_name  = var.cr_instance_name
  namespace      = alicloud_cr_namespace.fangtan.name
  name           = "api-gateway"
  summary        = "Fangtan AI API Gateway"
  description    = "房探AI API Gateway服务"
  visibility     = "public"
}

# 创建镜像仓库（Web）
resource "alicloud_cr_ee_repo" "web" {
  instance_name  = var.cr_instance_name
  namespace      = alicloud_cr_namespace.fangtan.name
  name           = "web"
  summary        = "Fangtan AI Web"
  description    = "房探AI Web前端服务"
  visibility     = "public"
}

# 创建镜像仓库（Worker）
resource "alicloud_cr_ee_repo" "worker" {
  instance_name  = var.cr_instance_name
  namespace      = alicloud_cr_namespace.fangtan.name
  name           = "worker"
  summary        = "Fangtan AI Worker"
  description    = "房探AI Worker服务"
  visibility     = "public"
}

# 设置镜像仓库构建规则
resource "alicloud_cr_ee_repo_build_rule" "api_gateway" {
  instance_name = var.cr_instance_name
  namespace     = alicloud_cr_namespace.fangtan.name
  repo_name     = alicloud_cr_ee_repo.api_gateway.name
  source_repo {
    repo_name = alicloud_cr_ee_repo.api_gateway.name
    tag       = "main"
    type      = "git"
    url       = var.git_repo_url
  }
  dockerfile     = "apps/api-gateway/Dockerfile"
  context       = "apps/api-gateway"
  tag_matches    = ["main-*"]
}

# 创建访问凭据
resource "alicloud_cr_ee_endpoint_acl_policy" "allow_all" {
  instance_name = var.cr_instance_name
  endpoint      = "public"
  policy        = "allow"
  comment       = "Allow all public access"
}

# 输出镜像仓库地址
output "registry_endpoint" {
  description = "镜像仓库访问地址"
  value       = "${var.cr_instance_name}.cr.${var.region}.aliyuncs.com"
}

# 输出镜像仓库凭据
output "registry_credentials" {
  description = "镜像仓库访问凭据"
  value = {
    username = alicloud_cr_ee_instance.main[0].admin_username
    password = alicloud_cr_ee_instance.main[0].admin_password
  }
  sensitive = true
}

# 镜像构建示例（使用阿里云容器镜像服务ACR）
# 需要提前创建ACR实例
resource "alicloud_cr_ee_instance" "main" {
  count            = var.create_cr_instance ? 1 : 0
  instance_name    = var.cr_instance_name
  instance_type    = "Advanced"
  payment_type     = "Subscription"
  period           = 1
  renew_period     = 1
  renewal_status   = "Manual"
  config {
    instance_name  = var.cr_instance_name
    instance_type  = "Advanced"
  }
}
