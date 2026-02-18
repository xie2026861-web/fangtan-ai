# 房探AI Terraform Providers配置
# 阿里云 + Kubernetes

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }

  # 使用远程状态存储（推荐阿里云OSS）
  backend "oss" {
    bucket             = "fangtan-ai-tfstate"
    prefix             = "terraform/state"
    region             = "cn-hangzhou"
    encrypt            = true
    acl                = "private"
    workspace_key_prefix = "fangtan-ai"
  }
}

# 阿里云Provider配置
provider "alicloud" {
  region     = var.region
  profile    = "default"
  skip_region_validation = true
  skip_zone_validation   = true
}

# Kubernetes Provider配置
provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = var.cluster_name
  
  # 或者使用阿里云托管K8s的kubeconfig
  # config_path = "~/.kube/config-aliyun"
}

# Helm Provider配置（用于安装监控组件等）
provider "helm" {
  kubernetes {
    config_path    = "~/.kube/config"
    config_context = var.cluster_name
  }
}

# 数据源：获取当前kubeconfig上下文
data "kubernetes_config_map" "kube_system" {
  metadata {
    name      = "kube-root-ca.crt"
    namespace = "kube-system"
  }
}

# 数据源：获取集群信息
data "kubernetes_cluster_info" "current" {}
