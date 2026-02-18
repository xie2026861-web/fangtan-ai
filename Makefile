# Makefile for Fangtan AI Development

# 颜色定义
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# 帮助信息
help:
	@echo ""
	@echo "Fangtan AI 开发命令"
	@echo ""
	@echo "用法: make <命令>"
	@echo ""
	@echo "环境管理:"
	@echo "  $(GREEN)install$(NC)       - 安装所有依赖"
	@echo "  $(GREEN)docker-up$(NC)     - 启动本地数据库"
	@echo "  $(GREEN)docker-down$(NC)   - 停止本地数据库"
	@echo "  $(GREEN)docker-logs$(NC)   - 查看数据库日志"
	@echo ""
	@echo "开发服务:"
	@echo "  $(GREEN)dev$(NC)           - 启动所有开发服务"
	@echo "  $(GREEN)dev-web$(NC)       - 启动前端开发服务"
	@echo "  $(GREEN)dev-api$(NC)       - 启动API网关开发服务"
	@echo "  $(GREEN)dev-auth$(NC)      - 启动认证服务开发"
	@echo ""
	@echo "测试:"
	@echo "  $(GREEN)test$(NC)          - 运行所有测试"
	@echo "  $(GREEN)test-unit$(NC)    - 运行单元测试"
	@echo "  $(GREEN)test-integration$(NC) - 运行集成测试"
	@echo "  $(GREEN)test-e2e$(NC)     - 运行E2E测试"
	@echo "  $(GREEN)test-coverage$(NC) - 运行测试并生成覆盖率"
	@echo ""
	@echo "代码质量:"
	@echo "  $(GREEN)lint$(NC)          - 检查代码风格"
	@echo "  $(GREEN)lint-fix$(NC)     - 自动修复代码风格"
	@echo "  $(GREEN)format$(NC)       - 格式化代码"
	@echo ""
	@echo "构建:"
	@echo "  $(GREEN)build$(NC)         - 构建所有项目"
	@echo "  $(GREEN)build-web$(NC)     - 构建前端"
	@echo "  $(GREEN)build-api$(NC)    - 构建API网关"
	@echo ""
	@echo "数据库:"
	@echo "  $(GREEN)db-migrate$(NC)   - 运行数据库迁移"
	@echo "  $(GREEN)db-seed$(NC)     - 填充测试数据"
	@echo "  $(GREEN)db-reset$(NC)     - 重置数据库"
	@echo "  $(GREEN)db-studio$(NC)   - 打开Prisma Studio"
	@echo ""
	@echo "清理:"
	@echo "  $(GREEN)clean$(NC)        - 清理构建产物"
	@echo "  $(GREEN)clean-node$(NC)   - 清理node_modules"
	@echo "  $(GREEN)clean-all$(NC)    - 清理所有临时文件"
	@echo ""

# 安装依赖
install:
	@echo "$(BLUE)📦 安装所有依赖...$(NC)"
	npm install

# Docker命令
docker-up:
	@echo "$(BLUE)🐳 启动本地数据库...$(NC)"
	docker-compose -f docker-compose.local.yml up -d

docker-down:
	@echo "$(BLUE)🐳 停止本地数据库...$(NC)"
	docker-compose -f docker-compose.local.yml down

docker-logs:
	@echo "$(BLUE)📋 查看数据库日志...$(NC)"
	docker-compose -f docker-compose.local.yml logs -f

# 开发服务
dev:
	@echo "$(BLUE)🚀 启动所有开发服务...$(NC)"
	npm run dev

dev-web:
	@echo "$(BLUE)🚀 启动前端开发服务...$(NC)"
	cd apps/web && npm run dev

dev-api:
	@echo "$(BLUE)🚀 启动API网关开发服务...$(NC)"
	cd apps/api-gateway && npm run start:dev

dev-auth:
	@echo "$(BLUE)🚀 启动认证服务开发...$(NC)"
	cd apps/auth-service && npm run start:dev

# 测试
test:
	@echo "$(BLUE)🧪 运行所有测试...$(NC)"
	npm run test

test-unit:
	@echo "$(BLUE)🧪 运行单元测试...$(NC)"
	npm run test:unit

test-integration:
	@echo "$(BLUE)🧪 运行集成测试...$(NC)"
	npm run test:integration

test-e2e:
	@echo "$(BLUE)🧪 运行E2E测试...$(NC)"
	npm run test:e2e

test-coverage:
	@echo "$(BLUE)📊 运行测试并生成覆盖率...$(NC)"
	npm run test:coverage

# 代码质量
lint:
	@echo "$(BLUE)🔍 检查代码风格...$(NC)"
	npm run lint

lint-fix:
	@echo "$(BLUE)🔧 自动修复代码风格...$(NC)"
	npm run lint:fix

format:
	@echo "$(BLUE)✨ 格式化代码...$(NC)"
	npm run format

# 构建
build:
	@echo "$(BLUE)🏗️ 构建所有项目...$(NC)"
	npm run build

build-web:
	@echo "$(BLUE)🏗️ 构建前端...$(NC)"
	cd apps/web && npm run build

build-api:
	@echo "$(BLUE)🏗️ 构建API网关...$(NC)"
	cd apps/api-gateway && npm run build

# 数据库
db-migrate:
	@echo "$(BLUE)🗄️ 运行数据库迁移...$(NC)"
	cd apps/api-gateway && npx prisma migrate dev

db-seed:
	@echo "$(BLUE)🌱 填充测试数据...$(NC)"
	cd apps/api-gateway && npx prisma db seed

db-reset:
	@echo "$(BLUE)🗄️ 重置数据库...$(NC)"
	cd apps/api-gateway && npx prisma migrate reset --force

db-studio:
	@echo "$(BLUE)🗄️ 打开Prisma Studio...$(NC)"
	cd apps/api-gateway && npx prisma studio

# 清理
clean:
	@echo "$(BLUE)🧹 清理构建产物...$(NC)"
	npm run clean --workspaces

clean-node:
	@echo "$(BLUE)🧹 清理node_modules...$(NC)"
	find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name "package-lock.json" -delete

clean-all:
	@echo "$(BLUE)🧹 清理所有临时文件...$(NC)"
	make clean
	make clean-node
	rm -rf .turbo
	rm -rf coverage
	rm -rf .nyc_output

# 默认命令
.PHONY: help install docker-up docker-down docker-logs dev dev-web dev-api dev-auth test test-unit test-integration test-e2e test-coverage lint lint-fix format build build-web build-api db-migrate db-seed db-reset db-studio clean clean-node clean-all deploy-local deploy-check

# 本地Docker部署
deploy-local:
	@echo "$(BLUE)🚀 本地Docker部署...$(NC)"
	@echo "$(YELLOW)步骤1: 停止现有服务...$(NC)"
	docker-compose -f docker-compose.local.yml down
	@echo "$(YELLOW)步骤2: 构建镜像...$(NC)"
	docker-compose -f docker-compose.local.yml build
	@echo "$(YELLOW)步骤3: 启动服务...$(NC)"
	docker-compose -f docker-compose.local.yml up -d
	@echo "$(GREEN)✅ 部署完成!$(NC)"
	@echo ""
	@echo "访问地址:"
	@echo "  - 前端: http://localhost:3000"
	@echo "  - API: http://localhost:3001"
	@echo "  - API文档: http://localhost:3001/docs"

# 检查服务状态
deploy-check:
	@echo "$(BLUE)🔍 检查服务状态...$(NC)"
	@echo ""
	@echo "Docker服务状态:"
	docker-compose -f docker-compose.local.yml ps
	@echo ""
	@echo "健康检查:"
	@echo "  - API健康: $$(curl -s http://localhost:3001/health 2>/dev/null || echo '❌ API未运行')"
	@echo "  - 前端可访问: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo '❌ 前端未运行')"
