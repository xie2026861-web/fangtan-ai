#!/bin/bash

# 房探AI本地部署验证脚本
# 用法: ./scripts/verify-deployment.sh

set -e

echo "============================================"
echo "  房探AI 本地部署验证"
echo "============================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Docker是否运行
check_docker() {
    echo "检查Docker状态..."
    if command -v docker &> /dev/null; then
        if docker info &> /dev/null; then
            echo -e "${GREEN}✅ Docker已安装并运行${NC}"
            return 0
        else
            echo -e "${RED}❌ Docker未运行，请启动Docker${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Docker未安装${NC}"
        return 1
    fi
}

# 检查Docker Compose
check_docker_compose() {
    echo "检查Docker Compose..."
    if docker compose version &> /dev/null; then
        echo -e "${GREEN}✅ Docker Compose可用${NC}"
        return 0
    elif command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✅ Docker Compose可用${NC}"
        return 0
    else
        echo -e "${RED}❌ Docker Compose未安装${NC}"
        return 1
    fi
}

# 检查服务状态
check_services() {
    echo ""
    echo "检查服务状态..."
    
    local services=("postgres" "redis" "api-gateway" "web")
    local all_running=true
    
    for service in "${services[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${service}$"; then
            echo -e "${GREEN}✅ ${service} 运行中${NC}"
        else
            echo -e "${YELLOW}⚠️ ${service} 未运行${NC}"
            all_running=false
        fi
    done
    
    if [ "$all_running" = false ]; then
        echo ""
        echo "启动服务: docker-compose up -d"
    fi
}

# 检查端口
check_ports() {
    echo ""
    echo "检查端口占用..."
    
    local ports=("3000" "3001" "5432" "6379")
    
    for port in "${ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":${port} " || ss -tuln 2>/dev/null | grep -q ":${port} "; then
            echo -e "${GREEN}✅ 端口 ${port} 已被监听${NC}"
        else
            echo -e "${YELLOW}⚠️ 端口 ${port} 未被监听${NC}"
        fi
    done
}

# 检查健康端点
check_health() {
    echo ""
    echo "检查服务健康状态..."
    
    # 检查API网关
    if curl -s http://localhost:3001/health &> /dev/null; then
        echo -e "${GREEN}✅ API网关健康检查通过${NC}"
        echo "  响应: $(curl -s http://localhost:3001/health)"
    else
        echo -e "${YELLOW}⚠️ API网关健康检查失败 (http://localhost:3001/health)${NC}"
    fi
    
    echo ""
    
    # 检查前端
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ 前端可访问 (HTTP ${http_code})${NC}"
    else
        echo -e "${YELLOW}⚠️ 前端不可访问 (HTTP ${http_code})${NC}"
    fi
}

# 检查日志
check_logs() {
    echo ""
    echo "最近日志 (API Gateway)..."
    docker logs --tail 10 fangtan-api-gateway 2>/dev/null || echo "  无日志"
    
    echo ""
    echo "最近日志 (Web)..."
    docker logs --tail 10 fangtan-web 2>/dev/null || echo "  无日志"
}

# 打印访问地址
print_access() {
    echo ""
    echo "============================================"
    echo "  访问地址"
    echo "============================================"
    echo ""
    echo -e "${GREEN}前端界面:${NC}      http://localhost:3000"
    echo -e "${GREEN}API文档:${NC}       http://localhost:3001/docs"
    echo -e "${GREEN}API健康检查:${NC}   http://localhost:3001/health"
    echo ""
    echo "管理工具:"
    echo "  Redis Commander:  http://localhost:8081"
    echo "  pgAdmin:          http://localhost:5050"
    echo "  Kibana:           http://localhost:5601"
    echo ""
}

# 主函数
main() {
    echo ""
    
    check_docker || exit 1
    check_docker_compose || exit 1
    
    echo ""
    echo "============================================"
    echo "  服务检查"
    echo "============================================"
    echo ""
    
    check_services
    check_ports
    check_health
    
    print_access
    
    echo "============================================"
    echo "  验证完成"
    echo "============================================"
}

main "$@"
