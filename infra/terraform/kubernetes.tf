# 房探AI Kubernetes集群配置
# 阿里云托管Kubernetes

# 使用阿里云容器服务（ACK）的Terraform模块

# 阿里云ACK集群
resource "alicloud_cs_managed_kubernetes" "main" {
  count = var.create_cluster ? 1 : 0
  
  name                = var.cluster_name
  cluster_spec        = "ack.pro.small"
  worker_instance_types = var.worker_instance_types
  worker_numbers      = var.worker_numbers
  worker_disk_category = "cloud_ssd"
  worker_disk_size    = 120
  region              = var.region
  zone_count          = 2
  vpc_id              = alicloud_vpc.main[0].id
  vswitch_ids         = alicloud_vswitch.main[*].id
  service_cidr        = "172.16.0.0/16"
  pod_cidr            = "10.0.0.0/16"
  security_group_id  = alicloud_security_group.main.id
  
  # 节点池配置
  node_pool {
    name                = "default-nodepool"
    instance_types      = var.worker_instance_types
    system_disk_category = "cloud_ssd"
    system_disk_size    = 120
    data_disks {
      category          = "cloud_ssd"
      size              = 200
      encrypted         = true
    }
    key_name            = alicloud_key_pair.main.name
    num_of_nodes        = var.worker_numbers[0]
    vswitch_ids         = alicloud_vswitch.main[*].id
    instance_charge_type = "PostPaid"
    internet_charge_type = "PayByTraffic"
    internet_max_bandwidth_out = 100
    enable_scale_out    = true
    min_size            = 2
    max_size            = 10
    scale_out_ratio     = 0.5
    scale_out_number    = 1
  }
  
  # 组件配置
  addons {
    name   = "nginx-ingress"
    config = ""
  }
  addons {
    name   = "csi-plugin"
    config = ""
  }
  addons {
    name   = "csi-provisioner"
    config = ""
  }
  addons {
    name   = "logtail-daemonset"
    config = jsonencode({
      "IngressDaemonSet" = {
        "limit_cpu"    = "500m"
        "limit_memory" = "200Mi"
        "request_cpu"  = "200m"
        "request_memory" = "100Mi"
      }
    })
  }
}

# 如果使用现有集群，获取集群凭据
data "alicloud_cs_kubernetes_clusters" "existing" {
  name_regex = var.cluster_name
}

# 获取集群kubeconfig
data "alicloud_cs_kubernetes_cluster_credentials" "main" {
  count = var.create_cluster ? 0 : 1
  cluster_id = data.alicloud_cs_kubernetes_clusters.existing[0].ids[0]
}

# 输出kubeconfig（敏感信息）
output "kubeconfig" {
  description = "Kubernetes集群kubeconfig"
  value       = var.create_cluster ? alicloud_cs_managed_kubernetes.main[0].kube_config : data.alicloud_cs_kubernetes_cluster_credentials.main[0].kube_config
  sensitive   = true
}

# 输出集群ID
output "cluster_id" {
  description = "Kubernetes集群ID"
  value       = var.create_cluster ? alicloud_cs_managed_kubernetes.main[0].id : data.alicloud_cs_kubernetes_clusters.existing[0].ids[0]
}

# 输出API Server地址
output "api_server_endpoint" {
  description = "API Server访问地址"
  value       = var.create_cluster ? alicloud_cs_managed_kubernetes.main[0].api_server_endpoint : data.alicloud_cs_kubernetes_clusters.existing[0].api_server_endpoint
}
