# GitHub Actions 自动部署配置

## 概述

配置完成后，代码推送到GitHub main分支将自动：
1. 检查代码格式
2. 检查类型
3. 构建前端
4. 自动部署到阿里云服务器

## 第一步：生成SSH密钥

在本地生成部署密钥：

```bash
# 生成SSH密钥 (用于GitHub Actions连接服务器)
ssh-keygen -t ed25519 -C "github-actions@fangtan.ai" -f ./github-actions-key

# 查看公钥
cat ./github-actions-key.pub

# 查看私钥 (需要在GitHub Secrets中配置)
cat ./github-actions-key
```

## 第二步：配置GitHub Secrets

在GitHub仓库页面：Settings → Secrets and variables → Actions

添加以下Secrets：

| Secret名称 | 值 |
|-----------|-----|
| `ALIYUN_SERVER_IP` | 你的阿里云服务器公网IP |
| `ALIYUN_SERVER_USER` | 服务器用户名 (通常是 root) |
| `ALIYUN_SERVER_SSH_KEY` | 私钥内容 (github-actions-key文件内容) |

## 第三步：配置服务器

在阿里云服务器上添加公钥：

```bash
# 登录服务器
ssh root@你的服务器IP

# 创建SSH密钥目录
mkdir -p ~/.ssh

# 添加公钥到 authorized_keys
echo "你的公钥内容" >> ~/.ssh/authorized_keys

# 设置权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 重启SSH服务
systemctl restart sshd
```

## 第四步：推送代码测试

```bash
# 在本地项目目录
git add .
git commit -m "配置GitHub Actions自动部署"
git push origin main
```

## 第五步：查看部署状态

1. 打开GitHub仓库 → Actions页面
2. 查看Workflow运行状态
3. 如果成功，服务会自动部署到服务器

## 常见问题

### Q: 部署失败怎么办？

1. 查看GitHub Actions日志
2. 登录服务器检查：
```bash
# 查看服务状态
docker-compose -f docker-compose.production.yml ps

# 查看错误日志
docker-compose -f docker-compose.production.yml logs

# 手动重启
docker-compose -f docker-compose.production.yml restart
```

### Q: 如何手动触发部署？

在GitHub仓库 → Actions → Deploy to Aliyun → Run workflow

### Q: SSH密钥权限问题？

确保私钥文件权限正确：
```bash
chmod 600 github-actions-key
```

## 手动部署命令

如果不想用自动部署，可以手动部署：

```bash
# 1. 登录服务器
ssh root@IP

# 2. 进入项目目录
cd /opt/fangtan-ai

# 3. 拉取最新代码
git pull

# 4. 重启服务
docker-compose -f docker-compose.production.yml restart
```
