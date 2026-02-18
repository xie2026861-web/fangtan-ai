# 房探AI - 房产经纪人专属AI营销智能体矩阵

<div align="center">

![Logo](docs/assets/logo.png)

**房探AI** 是一个面向房产经纪人的AI营销智能体SaaS平台，通过5大AI Agent帮助经纪人实现高效获客和转化。

[English](README_EN.md) | 简体中文

</div>

## 🎯 项目定位

**SaaS订阅服务模式**，让客户通过订阅获得5大AI Agent服务：

```
┌─────────────────────────────────────────────────────────┐
│                   房探AI SaaS平台                        │
├─────────────────────────────────────────────────────────┤
│   ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│   │数据采集 │ │智能触达 │ │内容生成 │               │
│   │ Agent   │ │ Agent   │ │ Agent   │               │
│   └─────────┘ └─────────┘ └─────────┘               │
│   ┌─────────┐ ┌─────────┐                           │
│   │ CRM协同 │ │合规管理 │                           │
│   │ Agent   │ │ Agent   │                           │
│   └─────────┘ └─────────┘                           │
└─────────────────────────────────────────────────────────┘
```

## 📦 核心功能

### 1. 数据采集Agent
- 多源数据采集（POI、平台、行为数据）
- 交叉核验（手机号/微信/备案）
- 质量评分（A/B/C/D分级）
- 联系方式有效率 ≥95%

### 2. 智能触达Agent
- AI外呼（支持10+轮对话）
- 企微/短信触达
- 社媒私信自动化
- 意向评分（0-100分）

### 3. 内容生成Agent
- 智能文案生成（朋友圈、小红书、抖音）
- 虚拟软装效果图
- 多平台一键分发
- 合规标识自动添加

### 4. CRM协同Agent
- 智能标签体系
- 客户生命周期管理
- 动态激活提醒
- 经纪人协同工作流

### 5. 合规管理Agent
- AI内容标识强制添加
- 敏感词实时过滤
- 话术合规审核
- 区块链存证

## 💰 商业模式

| 套餐 | 价格 | 目标客户 | 核心功能 |
|------|------|---------|---------|
| **基础版** | 999元/月 | 独立经纪人 | 数据采集 + 基础触达 + 文案 |
| **企业版** | 9800元/月起 | 10-100人中介 | 全部Agent + 多团队 + 高级分析 |
| **定制版** | 10-100万/年 | 头部房企 | 私有化 + 专属API + SLA |

## 🏗️ 技术架构

### 前端
- **框架**: Next.js 14 + React 18
- **UI组件**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **数据获取**: TanStack Query

### 后端
- **框架**: NestJS + TypeScript
- **API网关**: Kong/Nginx
- **认证**: Passport.js + JWT
- **文档**: Swagger/OpenAPI

### 数据库
- **PostgreSQL**: 核心业务数据
- **MongoDB**: 客户画像、日志
- **Redis**: 缓存、会话
- **Elasticsearch**: 全文检索
- **ClickHouse**: 数据仓库
- **Milvus**: 向量数据库

### AI/ML
- **LLM**: Claude + GPT-4o
- **ASR/TTS**: 讯飞 / 阿里云语音
- **图像生成**: Stable Diffusion
- **推荐引擎**: TensorFlow Recommenders

### 基础设施
- **容器化**: Docker
- **编排**: Kubernetes
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana

## 📁 项目结构

```
fangtan-ai/
├── apps/                      # 微服务应用
│   ├── web/                  # Next.js前端
│   ├── api-gateway/         # API网关
│   ├── auth-service/         # 认证服务
│   ├── subscription-service/ # 订阅服务
│   ├── data-collection/      # 数据采集
│   ├── smart-reach/          # 智能触达
│   ├── content-service/      # 内容生成
│   ├── crm-service/         # CRM协同
│   ├── compliance-service/   # 合规管理
│   └── analytics-service/    # 数据分析
│
├── packages/                  # 共享包
│   ├── ui/                   # UI组件库
│   ├── config/              # 配置
│   ├── utils/               # 工具库
│   └── types/               # TypeScript类型
│
├── infra/                     # 基础设施
│   ├── k8s/                 # Kubernetes配置
│   └── terraform/            # Terraform配置
│
├── docs/                     # 文档
│   ├── architecture/        # 架构文档
│   ├── api/                 # API文档
│   ├── development/         # 开发文档
│   └── operations/          # 运维文档
│
├── tests/                    # 测试
│   ├── unit/               # 单元测试
│   ├── integration/        # 集成测试
│   └── e2e/               # E2E测试
│
├── scripts/                  # 脚本
│
├── docker-compose.yml        # Docker Compose
├── package.json             # 根package.json
├── README.md               # 项目说明
└── LICENSE                 # 许可证
```

## 🚀 快速开始

### 环境要求

- Node.js 20+
- Docker Desktop
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+

### 安装依赖

```bash
# 安装所有依赖
npm install

# 安装子项目依赖
cd apps/web && npm install
cd apps/api-gateway && npm install
# ... 其他服务
```

### 启动本地环境

```bash
# 启动数据库和其他服务
docker-compose -f docker-compose.local.yml up -d

# 启动前端开发服务器
cd apps/web && npm run dev

# 启动后端开发服务器
cd apps/api-gateway && npm run start:dev
```

### 运行测试

```bash
# 运行单元测试
npm run test

# 运行集成测试
npm run test:integration

# 运行E2E测试
npm run test:e2e

# 检查代码覆盖率
npm run test:coverage
```

## 📚 文档

- [架构设计](docs/architecture/)
- [API文档](docs/api/)
- [开发指南](docs/development/)
- [运维手册](docs/operations/)

## 🧪 测试

### 测试覆盖率目标

| 类型 | 覆盖率目标 |
|------|----------|
| 单元测试 | >80% |
| 集成测试 | >70% |
| E2E测试 | >70% |

## 🔒 安全

- JWT + bcrypt 加密
- Rate Limiting
- 敏感数据加密
- AI内容合规标识
- 审计日志

## 📈 路线图

- [x] M1: 项目初始化
- [ ] M2: MVP验证
- [ ] M3-M5: 核心功能开发
- [ ] M6-M8: 完整功能上线
- [ ] M9-M12: 优化与扩展

## 🤝 贡献

欢迎提交Pull Request或Issue！

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

<div align="center">

**房探AI** - 让房产营销更智能

Made with ❤️ by FangTan AI Team

</div>
