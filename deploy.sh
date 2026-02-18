#!/bin/bash

# 房探AI - 一键部署脚本
# 使用方法: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-local}
VERSION=$(date +%Y%m%d-%H%M%S)

echo "🚀 开始部署房探AI (环境: $ENVIRONMENT, 版本: $VERSION)"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# 检查Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker未安装，正在安装..."
    # 安装Docker的步骤（根据系统不同需要调整）
    exit 1
fi

# 检查docker-compose
if ! command -v docker-compose &> /dev/null; then
    print_warning "docker-compose未安装，使用 docker compose 命令"
    COMPOSE_COMMAND="docker compose"
else
    COMPOSE_COMMAND="docker-compose"
fi

print_status "检查环境..."

# 根据环境选择配置文件
case $ENVIRONMENT in
    local)
        COMPOSE_FILE="docker-compose.local.yml"
        APP_COMPOSE_FILE="docker-compose.yml"
        print_info "使用本地开发环境配置"
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        APP_COMPOSE_FILE="docker-compose.staging.yml"
        print_info "使用预发布环境配置"
        ;;
    production)
        COMPOSE_FILE="docker-compose.production.yml"
        APP_COMPOSE_FILE="docker-compose.production.yml"
        print_info "使用生产环境配置"
        ;;
    *)
        print_warning "未知环境: $ENVIRONMENT，使用本地配置"
        COMPOSE_FILE="docker-compose.local.yml"
        APP_COMPOSE_FILE="docker-compose.yml"
        ;;
esac

# 停止现有容器
print_status "停止现有容器..."
if [ -f "$APP_COMPOSE_FILE" ]; then
    $COMPOSE_COMMAND -f $APP_COMPOSE_FILE down --remove-orphans || true
fi

# 拉取最新代码
print_status "更新代码..."
git pull origin main || print_warning "git pull失败，跳过"

# 构建并启动服务
print_status "构建并启动服务..."

if [ "$ENVIRONMENT" = "local" ]; then
    # 本地开发模式：启动数据库
    print_status "启动数据库服务..."
    $COMPOSE_COMMAND -f $COMPOSE_FILE up -d postgres redis mongo elasticsearch clickhouse kafka
    
    # 等待数据库就绪
    print_info "等待数据库服务就绪..."
    sleep 10
    
    # 初始化数据库
    print_status "初始化数据库..."
    cd apps/api-gateway
    npx prisma migrate deploy || print_warning "数据库迁移失败，可能已存在"
    npx prisma generate || print_warning "Prisma生成失败"
    cd ../..
    
    # 启动API网关
    print_status "启动API网关..."
    cd apps/api-gateway
    npm run start:dev &
    API_PID=$!
    cd ../..
    
    # 启动前端
    print_status "启动前端..."
    cd apps/web
    npm run dev &
    WEB_PID=$!
    cd ../..
    
    print_status "服务启动中..."
    sleep 5
    
    print_status "✅ 部署完成!"
    echo ""
    echo "访问地址:"
    echo "  - 前端: http://localhost:3000"
    echo "  - API文档: http://localhost:3001/docs"
    echo "  - 健康检查: http://localhost:3001/health"
    echo ""
    echo "API网关进程ID: $API_PID"
    echo "前端进程ID: $WEB_PID"
    echo ""
    echo "停止服务命令: kill $API_PID $WEB_PID"
    
else
    # 生产/预发布模式：使用Docker Compose
    print_status "构建并部署Docker容器..."
    $COMPOSE_COMMAND -f $APP_COMPOSE_FILE build --no-cache
    $COMPOSE_COMMAND -f $APP_COMPOSE_FILE up -d
    
    print_status "✅ 部署完成!"
    echo ""
    echo "服务状态:"
    $COMPOSE_COMMAND -f $APP_COMPOSE_FILE ps
fi

echo ""
print_status "部署完成!"
