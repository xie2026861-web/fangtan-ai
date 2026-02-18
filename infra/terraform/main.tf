# 房探AI Terraform配置
# 阿里云资源定义

# Kubernetes命名空间
resource "kubernetes_namespace" "fangtan_ai" {
  metadata {
    name = "fangtan-ai"
    labels = {
      app       = "fangtan-ai"
      managed-by = "terraform"
    }
  }
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "fangtan-ai-monitoring"
    labels = {
      app       = "monitoring"
      managed-by = "terraform"
    }
  }
}

# ConfigMap
resource "kubernetes_config_map" "fangtan_config" {
  metadata {
    name      = "fangtan-config"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
  }
  data = {
    NODE_ENV            = "production"
    LOG_LEVEL           = "info"
    API_PORT            = "3001"
    API_PREFIX          = "/api/v1"
    DATABASE_URL        = "postgresql://fangtan:${var.database_password}@${kubernetes_service.postgres.metadata[0].name}:5432/fangtan_prod?schema=public"
    REDIS_URL           = "redis://:${var.redis_password}@${kubernetes_service.redis.metadata[0].name}:6379"
    MONGODB_URL         = "mongodb://fangtan:${var.mongo_password}@${kubernetes_service.mongo.metadata[0].name}:27017/fangtan"
    ELASTICSEARCH_URL   = "http://${kubernetes_service.elasticsearch.metadata[0].name}:9200"
    JWT_SECRET          = var.jwt_secret
    JWT_EXPIRES_IN      = "7d"
    CORS_ORIGIN         = "https://fangtan.ai,https://www.fangtan.ai"
    ENABLE_MOCK_DATA    = "false"
  }
}

# Secrets
resource "kubernetes_secret" "fangtan_secrets" {
  metadata {
    name      = "fangtan-secrets"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
  }
  type = "Opaque"
  string_data = {
    DATABASE_PASSWORD    = var.database_password
    REDIS_PASSWORD       = var.redis_password
    MONGO_PASSWORD       = var.mongo_password
    JWT_SECRET           = var.jwt_secret
    OPENAI_API_KEY       = var.openai_api_key
    ANTHROPIC_API_KEY   = var.anthropic_api_key
    AMAP_KEY             = var.amap_key
    WECHAT_CORP_ID       = var.wechat_corp_id
    WECHAT_AGENT_SECRET  = var.wechat_agent_secret
    ALIYUN_ACCESS_KEY_ID = var.aliyun_access_key_id
  }
}

# PostgreSQL StatefulSet
resource "kubernetes_stateful_set" "postgres" {
  metadata {
    name      = "fangtan-postgres"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-postgres"
    }
  }
  spec {
    service_name = "fangtan-postgres"
    replicas     = 1
    selector {
      match_labels = {
        app = "fangtan-postgres"
      }
    }
    template {
      metadata {
        labels = {
          app = "fangtan-postgres"
        }
      }
      spec {
        container {
          name  = "postgres"
          image = "postgres:15-alpine"
          port {
            name           = "tcp-postgres"
            container_port = 5432
          }
          env {
            name  = "POSTGRES_USER"
            value = "fangtan"
          }
          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.fangtan_secrets.metadata[0].name
                key  = "DATABASE_PASSWORD"
              }
            }
          }
          env {
            name  = "POSTGRES_DB"
            value = "fangtan_prod"
          }
          resources {
            requests = {
              cpu    = "500m"
              memory = "1Gi"
            }
            limits = {
              cpu    = "4000m"
              memory = "8Gi"
            }
          }
          volume_mount {
            name       = "postgres-data"
            mount_path = "/var/lib/postgresql/data"
          }
        }
        volume {
          name = "postgres-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres.metadata[0].name
          }
        }
      }
    }
    volume_claim_template {
      metadata {
        name = "postgres-data"
      }
      spec {
        access_modes = ["ReadWriteOnce"]
        resources {
          requests = {
            storage = var.postgres_storage_size
          }
        }
      }
    }
  }
}

# PostgreSQL Service
resource "kubernetes_service" "postgres" {
  metadata {
    name      = "fangtan-postgres"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-postgres"
    }
  }
  spec {
    selector = {
      app = "fangtan-postgres"
    }
    port {
      name        = "tcp-postgres"
      port        = 5432
      target_port = 5432
    }
    type = "ClusterIP"
  }
}

# Redis Deployment
resource "kubernetes_deployment" "redis" {
  metadata {
    name      = "fangtan-redis"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-redis"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "fangtan-redis"
      }
    }
    template {
      metadata {
        labels = {
          app = "fangtan-redis"
        }
      }
      spec {
        container {
          name  = "redis"
          image = "redis:7-alpine"
          command = ["redis-server", "--appendonly", "yes"]
          port {
            name        = "tcp-redis"
            container_port = 6379
          }
          env {
            name = "REDIS_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.fangtan_secrets.metadata[0].name
                key  = "REDIS_PASSWORD"
              }
            }
          }
          resources {
            requests = {
              cpu    = "200m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "2000m"
              memory = "4Gi"
            }
          }
          volume_mount {
            name       = "redis-data"
            mount_path = "/data"
          }
        }
        volume {
          name = "redis-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.redis.metadata[0].name
          }
        }
      }
    }
  }
}

# Redis Service
resource "kubernetes_service" "redis" {
  metadata {
    name      = "fangtan-redis"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-redis"
    }
  }
  spec {
    selector = {
      app = "fangtan-redis"
    }
    port {
      name        = "tcp-redis"
      port        = 6379
      target_port = 6379
    }
    type = "ClusterIP"
  }
}

# MongoDB StatefulSet
resource "kubernetes_stateful_set" "mongo" {
  metadata {
    name      = "fangtan-mongo"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-mongo"
    }
  }
  spec {
    service_name = "fangtan-mongo"
    replicas     = 1
    selector {
      match_labels = {
        app = "fangtan-mongo"
      }
    }
    template {
      metadata {
        labels = {
          app = "fangtan-mongo"
        }
      }
      spec {
        container {
          name  = "mongo"
          image = "mongo:6-alpine"
          port {
            name           = "tcp-mongo"
            container_port = 27017
          }
          env {
            name  = "MONGO_INITDB_ROOT_USERNAME"
            value = "fangtan"
          }
          env {
            name = "MONGO_INITDB_ROOT_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.fangtan_secrets.metadata[0].name
                key  = "MONGO_PASSWORD"
              }
            }
          }
          resources {
            requests = {
              cpu    = "500m"
              memory = "512Mi"
            }
            limits = {
              cpu    = "2000m"
              memory = "4Gi"
            }
          }
          volume_mount {
            name       = "mongo-data"
            mount_path = "/data/db"
          }
        }
        volume {
          name = "mongo-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mongo.metadata[0].name
          }
        }
      }
    }
    volume_claim_template {
      metadata {
        name = "mongo-data"
      }
      spec {
        access_modes = ["ReadWriteOnce"]
        resources {
          requests = {
            storage = var.mongo_storage_size
          }
        }
      }
    }
  }
}

# MongoDB Service
resource "kubernetes_service" "mongo" {
  metadata {
    name      = "fangtan-mongo"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-mongo"
    }
  }
  spec {
    selector = {
      app = "fangtan-mongo"
    }
    port {
      name        = "tcp-mongo"
      port        = 27017
      target_port = 27017
    }
    type = "ClusterIP"
  }
}

# Elasticsearch StatefulSet
resource "kubernetes_stateful_set" "elasticsearch" {
  metadata {
    name      = "fangtan-elasticsearch"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-elasticsearch"
    }
  }
  spec {
    service_name = "fangtan-elasticsearch"
    replicas     = 1
    selector {
      match_labels = {
        app = "fangtan-elasticsearch"
      }
    }
    template {
      metadata {
        labels = {
          app = "fangtan-elasticsearch"
        }
      }
      spec {
        container {
          name  = "elasticsearch"
          image = "docker.elastic.co/elasticsearch/elasticsearch:8.11.0"
          port {
            name           = "http-es"
            container_port = 9200
          }
          env {
            name  = "discovery.type"
            value = "single-node"
          }
          env {
            name  = "ES_JAVA_OPTS"
            value = "-Xms1g -Xmx2g"
          }
          env {
            name = "ELASTIC_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.fangtan_secrets.metadata[0].name
                key  = "ELASTICSEARCH_PASSWORD"
              }
            }
          }
          resources {
            requests = {
              cpu    = "500m"
              memory = "2Gi"
            }
            limits = {
              cpu    = "4000m"
              memory = "8Gi"
            }
          }
          volume_mount {
            name       = "es-data"
            mount_path = "/usr/share/elasticsearch/data"
          }
        }
        volume {
          name = "es-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.elasticsearch.metadata[0].name
          }
        }
      }
    }
    volume_claim_template {
      metadata {
        name = "es-data"
      }
      spec {
        access_modes = ["ReadWriteOnce"]
        resources {
          requests = {
            storage = var.elasticsearch_storage_size
          }
        }
      }
    }
  }
}

# Elasticsearch Service
resource "kubernetes_service" "elasticsearch" {
  metadata {
    name      = "fangtan-elasticsearch"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-elasticsearch"
    }
  }
  spec {
    selector = {
      app = "fangtan-elasticsearch"
    }
    port {
      name        = "http-es"
      port        = 9200
      target_port = 9200
    }
    type = "ClusterIP"
  }
}

# API Gateway Deployment
resource "kubernetes_deployment" "api_gateway" {
  metadata {
    name      = "fangtan-api-gateway"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-api-gateway"
    }
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "fangtan-api-gateway"
      }
    }
    template {
      metadata {
        labels = {
          app = "fangtan-api-gateway"
        }
        annotations = {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "3001"
        }
      }
      spec {
        container {
          name  = "api-gateway"
          image = "${var.docker_registry}/${var.docker_image_prefix}/api-gateway:${var.image_tag}"
          port {
            name           = "http"
            container_port = 3001
          }
          env_from {
            config_map_ref {
              name = kubernetes_config_map.fangtan_config.metadata[0].name
            }
          }
          env_from {
            secret_ref {
              name = kubernetes_secret.fangtan_secrets.metadata[0].name
            }
          }
          resources {
            requests = {
              cpu    = "500m"
              memory = "512Mi"
            }
            limits = {
              cpu    = "2000m"
              memory = "2Gi"
            }
          }
        }
      }
    }
  }
}

# API Gateway Service
resource "kubernetes_service" "api_gateway" {
  metadata {
    name      = "fangtan-api-gateway"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-api-gateway"
    }
  }
  spec {
    selector = {
      app = "fangtan-api-gateway"
    }
    port {
      port        = 3001
      target_port = 3001
    }
    type = "ClusterIP"
  }
}

# Web Deployment
resource "kubernetes_deployment" "web" {
  metadata {
    name      = "fangtan-web"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-web"
    }
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "fangtan-web"
      }
    }
    template {
      metadata {
        labels = {
          app = "fangtan-web"
        }
      }
      spec {
        container {
          name  = "web"
          image = "${var.docker_registry}/${var.docker_image_prefix}/web:${var.image_tag}"
          port {
            name           = "http"
            container_port = 3000
          }
          env {
            name  = "NODE_ENV"
            value = "production"
          }
          env {
            name  = "NEXT_PUBLIC_API_URL"
            value = "http://fangtan-api-gateway:3001"
          }
          resources {
            requests = {
              cpu    = "200m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "1000m"
              memory = "1Gi"
            }
          }
        }
      }
    }
  }
}

# Web Service
resource "kubernetes_service" "web" {
  metadata {
    name      = "fangtan-web"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-web"
    }
  }
  spec {
    selector = {
      app = "fangtan-web"
    }
    port {
      port        = 80
      target_port = 3000
    }
    type = "ClusterIP"
  }
}

# HPA for API Gateway
resource "kubernetes_horizontal_pod_autoscaler" "api_gateway" {
  metadata {
    name      = "fangtan-api-gateway-hpa"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
  }
  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = "fangtan-api-gateway"
    }
    min_replicas = 2
    max_replicas = 10
    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }
  }
}

# HPA for Web
resource "kubernetes_horizontal_pod_autoscaler" "web" {
  metadata {
    name      = "fangtan-web-hpa"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
  }
  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = "fangtan-web"
    }
    min_replicas = 2
    max_replicas = 10
    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }
  }
}

# Persistent Volume Claims
resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "fangtan-postgres-pvc"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-postgres"
    }
  }
  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.storage_class_name
    resources {
      requests = {
        storage = var.postgres_storage_size
      }
    }
  }
}

resource "kubernetes_persistent_volume_claim" "redis" {
  metadata {
    name      = "fangtan-redis-pvc"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-redis"
    }
  }
  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.storage_class_name
    resources {
      requests = {
        storage = var.redis_storage_size
      }
    }
  }
}

resource "kubernetes_persistent_volume_claim" "mongo" {
  metadata {
    name      = "fangtan-mongo-pvc"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-mongo"
    }
  }
  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.storage_class_name
    resources {
      requests = {
        storage = var.mongo_storage_size
      }
    }
  }
}

resource "kubernetes_persistent_volume_claim" "elasticsearch" {
  metadata {
    name      = "fangtan-elasticsearch-pvc"
    namespace = kubernetes_namespace.fangtan_ai.metadata[0].name
    labels = {
      app = "fangtan-elasticsearch"
    }
  }
  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.storage_class_name
    resources {
      requests = {
        storage = var.elasticsearch_storage_size
      }
    }
  }
}
