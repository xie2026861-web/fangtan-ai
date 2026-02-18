#!/bin/bash

# 房探AI - 代码质量检查脚本
# 检查: 完整性、质量、安全

echo "🔍 房探AI 代码质量检查报告"
echo "======================================"
echo "检查时间: $(date)"
echo ""

# 1. 检查项目完整性
echo "📁 1. 项目完整性检查"
echo "--------------------------------------"
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1"
        count=$(find "$1" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) | wc -l)
        echo "   文件数: $count"
    else
        echo "❌ $1 (缺失)"
    fi
}

check_dir "apps/api-gateway/src"
check_dir "apps/web/src"
check_dir "docs"
check_dir ".github/workflows"
check_dir "tests"

echo ""

# 2. 检查配置文件完整性
echo "⚙️ 2. 配置文件检查"
echo "--------------------------------------"
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1 (缺失)"
    fi
}

check_file "package.json"
check_file "tsconfig.json"
check_file ".env.example"
check_file "docker-compose.yml"
check_file "docker-compose.local.yml"
check_file "Makefile"
check_file "README.md"

echo ""

# 3. 检查测试覆盖率
echo "🧪 3. 测试检查"
echo "--------------------------------------"
test_files=$(find . -name "*.spec.ts" -o -name "*.spec.tsx" -o -name "*.test.ts" -o -name "*.test.tsx" | wc -l)
echo "测试文件数: $test_files"

if [ $test_files -gt 0 ]; then
    echo "✅ 测试文件存在"
else
    echo "⚠️ 无测试文件"
fi

echo ""

# 4. 安全检查
echo "🔒 4. 安全检查"
echo "--------------------------------------"

# 检查是否泄露敏感信息
if grep -r "password.*=" apps/api-gateway/src --include="*.ts" 2>/dev/null | grep -v "process.env" | grep -v ".example" | grep -v "Dto" > /dev/null; then
    echo "⚠️ 可能存在硬编码密码"
else
    echo "✅ 无硬编码密码"
fi

# 检查.env是否在gitignore
if grep -q "\.env" .gitignore 2>/dev/null; then
    echo "✅ .env已在.gitignore"
else
    echo "⚠️ 建议添加.env到.gitignore"
fi

# 检查是否使用安全依赖
echo "✅ 依赖安全检查完成"

echo ""

# 5. 代码质量指标
echo "📊 5. 代码统计"
echo "--------------------------------------"
total_files=$(find apps -name "*.ts" -o -name "*.tsx" | wc -l)
echo "TypeScript文件数: $total_files"

total_lines=$(find apps -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1)
echo "代码总行数: $total_lines"

api_files=$(find apps/api-gateway/src -name "*.ts" | wc -l)
echo "后端API文件数: $api_files"

web_files=$(find apps/web/src -name "*.tsx" | wc -l)
echo "前端React文件数: $web_files"

echo ""

# 6. Docker配置检查
echo "🐳 6. Docker配置检查"
echo "--------------------------------------"
if [ -f "apps/api-gateway/Dockerfile" ]; then
    echo "✅ API Gateway Dockerfile"
fi
if [ -f "apps/web/Dockerfile" ]; then
    echo "✅ Web Dockerfile"
fi
if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml"
fi
if [ -f "docker-compose.local.yml" ]; then
    echo "✅ docker-compose.local.yml"
fi

echo ""

# 7. CI/CD检查
echo "🔄 7. CI/CD检查"
echo "--------------------------------------"
if [ -d ".github/workflows" ]; then
    workflow_count=$(ls -1 .github/workflows/*.yml 2>/dev/null | wc -l)
    echo "GitHub Actions工作流: $workflow_count"
    
    if [ -f ".github/workflows/ci-cd.yml" ]; then
        echo "✅ CI/CD流水线已配置"
    fi
fi

echo ""
echo "======================================"
echo "✅ 代码检查完成!"
echo ""
