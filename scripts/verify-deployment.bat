@echo off
REM 房探AI本地部署验证脚本
REM 用法: scripts\verify-deployment.bat

echo ============================================
echo   房探AI 本地部署验证
echo ============================================
echo.

REM 检查Docker
echo 检查Docker状态...
where docker >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker已安装
    docker info >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Docker已运行
    ) else (
        echo [WARNING] Docker未运行，请启动Docker
    )
) else (
    echo [ERROR] Docker未安装
)
echo.

REM 检查服务状态
echo 检查服务状态...
docker ps --format "{{.Names}}" | findstr /c:"postgres" >nul && echo [OK] PostgreSQL 运行中 || echo [WARNING] PostgreSQL 未运行
docker ps --format "{{.Names}}" | findstr /c:"redis" >nul && echo [OK] Redis 运行中 || echo [WARNING] Redis 未运行
docker ps --format "{{.Names}}" | findstr /c:"api-gateway" >nul && echo [OK] API Gateway 运行中 || echo [WARNING] API Gateway 未运行
docker ps --format "{{.Names}}" | findstr /c:"web" >nul && echo [OK] Web 运行中 || echo [WARNING] Web 未运行
echo.

REM 检查端口
echo 检查端口占用...
netstat -an | findstr ":3000" >nul && echo [OK] 端口3000 被监听 || echo [WARNING] 端口3000 未被监听
netstat -an | findstr ":3001" >nul && echo [OK] 端口3001 被监听 || echo [WARNING] 端口3001 未被监听
netstat -an | findstr ":5432" >nul && echo [OK] 端口5432 被监听 || echo [WARNING] 端口5432 未被监听
netstat -an | findstr ":6379" >nul && echo [OK] 端口6379 被监听 || echo [WARNING] 端口6379 未被监听
echo.

REM 打印访问地址
echo ============================================
echo   访问地址
echo ============================================
echo.
echo [前端界面]   http://localhost:3000
echo [API文档]    http://localhost:3001/docs
echo [健康检查]   http://localhost:3001/health
echo.

echo ============================================
echo   验证完成
echo ============================================
