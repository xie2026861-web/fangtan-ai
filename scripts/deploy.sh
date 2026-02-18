#!/bin/bash

# 房探AI 一键部署脚本
# 使用方法: curl -sL https://raw.githubusercontent.com/xie2026861-web/fangtan-ai/main/scripts/deploy.sh | bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_warn "请使用 sudo 运行此脚本"
        exit 1
    fi
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_info "正在安装 Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl start docker
        systemctl enable docker
    else
        print_info "Docker 已安装: $(docker --version)"
    fi
}

# 检查Docker Compose
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_info "正在安装 Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    else
        print_info "Docker Compose 已安装: $(docker-compose --version)"
    fi
}

# 检查项目目录
check_project_dir() {
    if [ ! -d "/opt/fangtan-ai" ]; then
        print_info "创建项目目录 /opt/fangtan-ai"
        mkdir -p /opt/fangtan-ai
    fi
    cd /opt/fangtan-ai
}

# 拉取最新代码
pull_latest_code() {
    print_info "拉取最新代码..."
    
    if [ -d ".git" ]; then
        git fetch origin
        git checkout main
        git pull origin main
    else
        print_warn "当前目录不是Git仓库，将使用现有文件"
    fi
}

# 备份配置文件
backup_config() {
    print_info "备份配置文件..."
    cp .env.production .env.production.backup.$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
    cp docker-compose.production.yml docker-compose.production.yml.backup.$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
}

# 配置环境变量
configure_env() {
    if [ ! -f ".env.production" ]; then
        print_info "创建环境变量文件..."
        if [ -f ".env.production.example" ]; then
            cp .env.production.example .env.production
            print_warn "请编辑 .env.production 文件配置数据库密码等信息"
        else
            print_error "找不到 .env.production.example 文件"
        fi
    fi
}

# 构建和启动服务
start_services() {
    print_info "停止旧服务..."
    docker-compose -f docker-compose.production.yml down --remove-orphans 2>/dev/null || true

    print_info "构建并启动新服务..."
    docker-compose -f docker-compose.production.yml up -d --build

    print_info "等待服务启动..."
    sleep 30
}

# 检查服务状态
check_services() {
    print_info "检查服务状态..."
    docker-compose -f docker-compose.production.yml ps
    
    # 检查健康端点
    print_info "检查健康状态..."
    for i in {1..10}; do
        if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
            print_info "服务健康检查通过！"
            return 0
        fi
        print_warn "等待服务启动... ($i/10)"
        sleep 5
    done
    
    print_error "服务启动可能出现问题，请检查日志"
    return 1
}

# 显示日志
show_logs() {
    print_info "显示最近日志..."
    docker-compose -f docker-compose.production.yml logs --tail=50 -f
}

# 主函数
main() {
    echo "=========================================="
    echo "       房探AI 一键部署脚本"
    echo "=========================================="
    
    check_root
    check_docker
    check_docker_compose
    check_project_dir
    pull_latest_code
    backup_config
    configure_env
    start_services
    
    if check_services; then
        echo ""
        print_info "部署完成！"
        print_info "访问地址: http://localhost:3000"
        print_info "查看日志: docker-compose -f docker-compose.production.yml logs -f"
    else
        print_warn "部署可能存在问题，建议查看日志"
        echo ""
        read -p "是否查看日志? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            show_logs
        fi
    fi
}

# 入口
main "$@"
