# 开发指南

**版本**: v1.0  
**日期**: 2026-02-18

---

## 1. 环境配置

### 1.1 前置要求

```yaml
必需软件:
├── Node.js: >=20.0.0
├── Docker Desktop: Latest
├── PostgreSQL: 15+
├── MongoDB: 7+
├── Redis: 7+
├── Git: Latest
└── VSCode: Latest (推荐)
```

### 1.2 安装步骤

```bash
# 1. 安装 Node.js (使用 nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 2. 安装 Docker Desktop
# 下载地址: https://www.docker.com/products/docker-desktop

# 3. 安装 Git
# 下载地址: https://git-scm.com/downloads

# 4. 克隆项目
git clone https://github.com/fangtan-ai/fangtan-ai.git
cd fangtan-ai

# 5. 安装依赖
npm install

# 6. 启动本地数据库
docker-compose -f docker-compose.local.yml up -d

# 7. 复制环境变量模板
cp .env.example .env

# 8. 修改环境变量
# 编辑 .env 文件，配置数据库连接等信息
```

### 1.3 环境变量配置

```bash
# .env.example

# Database
DATABASE_URL="postgresql://fangtan:fangtan_password@localhost:5432/fangtan_dev"
REDIS_URL="redis://:fangtan_redis_password@localhost:6379"
MONGODB_URL="mongodb://admin:fangtan_mongo_password@localhost:27017/fangtan"
ELASTICSEARCH_URL="http://localhost:9200"
CLICKHOUSE_URL="http://localhost:8123"

# Auth
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# API Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
AMAP_KEY="your-amap-key"
WECHAT_CORP_ID="your-corp-id"
WECHAT_AGENT_SECRET="your-agent-secret"

# Feature Flags
ENABLE_MOCK_DATA="true"
LOG_LEVEL="debug"
NODE_ENV="development"

# MinIO (对象存储)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ROOT_USER="fangtan_minio_admin"
MINIO_ROOT_PASSWORD="fangtan_minio_password"

# Kafka
KAFKA_BROKERS="localhost:9092"
KAFKA_USERNAME=""
KAFKA_PASSWORD=""
```

## 2. 项目结构

```
fangtan-ai/
├── apps/                      # 微服务应用
│   ├── web/                  # Next.js前端
│   │   ├── src/
│   │   │   ├── app/          # App Router页面
│   │   │   ├── components/   # 组件
│   │   │   ├── lib/         # 工具库
│   │   │   └── styles/      # 样式
│   │   ├── public/          # 静态资源
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── api-gateway/          # API网关
│   │   ├── src/
│   │   │   ├── modules/     # 功能模块
│   │   │   ├── common/      # 公共模块
│   │   │   └── main.ts      # 入口文件
│   │   ├── test/
│   │   └── package.json
│   │
│   ├── auth-service/         # 认证服务
│   │   ├── src/
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── users/       # 用户模块
│   │   │   └── common/      # 公共模块
│   │   └── package.json
│   │
│   └── ... 其他服务
│
├── packages/                  # 共享包
│   ├── ui/                   # UI组件库
│   │   ├── src/
│   │   │   ├── components/   # 组件
│   │   │   ├── hooks/       # Hooks
│   │   │   └── utils/       # 工具
│   │   └── package.json
│   │
│   ├── config/               # 配置包
│   │   └── package.json
│   │
│   ├── utils/                # 工具库
│   │   └── package.json
│   │
│   └── types/               # 类型定义
│       └── package.json
│
├── infra/                     # 基础设施
│   ├── k8s/                  # K8s配置
│   └── terraform/             # Terraform配置
│
├── docs/                     # 文档
│   ├── architecture/         # 架构文档
│   ├── api/                 # API文档
│   ├── development/         # 开发文档
│   └── operations/           # 运维文档
│
├── tests/                    # 测试
│   ├── unit/                # 单元测试
│   ├── integration/         # 集成测试
│   └── e2e/                 # E2E测试
│
├── scripts/                  # 脚本
│   ├── init.sql
│   └── mongo-init.js
│
├── docker-compose.local.yml  # Docker Compose本地配置
├── package.json              # 根package.json
├── tsconfig.json             # TypeScript配置
├── .eslintrc.js              # ESLint配置
├── .prettierrc              # Prettier配置
└── .gitignore               # Git忽略配置
```

## 3. 开发规范

### 3.1 代码风格

```bash
# 检查代码风格
npm run lint

# 自动修复代码风格
npm run lint:fix

# 格式化代码
npm run format
```

### 3.2 提交规范

```yaml
提交格式:
<type>(<scope>): <subject>

类型 (type):
├── feat: 新功能
├── fix: Bug修复
├── docs: 文档更新
├── style: 代码格式（不影响功能）
├── refactor: 重构
├── perf: 性能优化
├── test: 测试相关
├── chore: 构建或辅助工具相关
└── revert: 回滚

示例:
feat(auth): 添加手机号登录功能
fix(customer): 修复客户列表分页bug
docs(api): 更新API文档
```

### 3.3 分支策略

```
主分支:
├── main: 主分支，始终与生产环境同步
└── develop: 开发分支，集成最新开发成果

功能分支:
feature/*: 新功能开发
├── feature/auth-login
├── feature/crm-module
└── feature/analytics-dashboard

修复分支:
├── hotfix/*: 紧急修复 (从main创建)
└── bugfix/*: 普通修复 (从develop创建)

发布分支:
release/*: 准备发布版本
```

### 3.4 命名规范

```yaml
文件命名:
├── 组件: PascalCase (e.g., CustomerList.tsx)
├── 工具: camelCase (e.g., dateUtils.ts)
├── 测试: *.spec.ts 或 *.test.ts
└── 类型: *.types.ts

变量命名:
├── 变量: camelCase (e.g., customerList)
├── 常量: UPPER_SNAKE_CASE (e.g., MAX_RETRY_COUNT)
├── 类: PascalCase (e.g., CustomerService)
└── 接口: PascalCase (e.g., ICustomer)

数据库命名:
├── 表: snake_case (e.g., customer_records)
├── 列: snake_case (e.g., created_at)
└── 索引: idx_<table>_<column> (e.g., idx_customers_phone)
```

## 4. 开发流程

### 4.1 日常开发

```bash
# 1. 拉取最新代码
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 开发功能
# ... 修改代码 ...

# 4. 运行测试
npm run test

# 5. 提交代码
git add .
git commit -m "feat(scope): your feature"

# 6. 推送到远程
git push origin feature/your-feature

# 7. 创建Pull Request
# 在GitHub上创建PR，请求合并到develop分支
```

### 4.2 运行服务

```bash
# 运行所有服务
npm run dev

# 运行单个服务
cd apps/web && npm run dev
cd apps/api-gateway && npm run start:dev

# 运行测试
npm run test              # 单元测试
npm run test:integration  # 集成测试
npm run test:e2e         # E2E测试
npm run test:coverage    # 覆盖率报告
```

### 4.3 数据库操作

```bash
# 使用Prisma
cd apps/api-gateway
npx prisma generate      # 生成Prisma Client
npx prisma migrate dev   # 执行迁移
npx prisma studio        # 打开Prisma Studio

# 使用psql连接
psql -U fangtan -d fangtan_dev

# 使用mongosh连接
mongosh "mongodb://admin:fangtan_mongo_password@localhost:27017/fangtan"
```

## 5. 测试指南

### 5.1 编写单元测试

```typescript
// apps/auth-service/src/auth/auth.service.spec.ts
describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should login successfully', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('accessToken');
  });
});
```

### 5.2 编写集成测试

```typescript
// tests/integration/auth.e2e-spec.ts
describe('AuthController (e2e)', () => {
  it('should register a new user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })
      .expect(201);
  });
});
```

## 6. 调试技巧

### 6.1 日志配置

```typescript
// 使用Winston日志
import { Logger } from '@nestjs/common';
import * as winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

// 使用
logger.info('User logged in', { userId: '123' });
logger.error('Login failed', { error: err.message });
```

### 6.2 断点调试

```bash
# VSCode调试配置
# .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:dev", "--", "--debug", "--inspect"],
      "console": "integratedTerminal"
    }
  ]
}
```

## 7. 常见问题

### 7.1 数据库连接失败

```bash
# 检查Docker是否运行
docker ps

# 检查数据库端口
telnet localhost 5432

# 检查连接字符串
# 确保.env中的DATABASE_URL正确
```

### 7.2 依赖安装失败

```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules
rm -rf package-lock.json
npm install

# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 7.3 TypeScript类型错误

```bash
# 检查tsconfig.json配置
# 确保paths配置正确
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}

# 重新生成类型
cd apps/api-gateway
npx tsc --noEmit
```

## 8. 资源

### 8.1 学习资源

- [Next.js文档](https://nextjs.org/docs)
- [NestJS文档](https://docs.nestjs.com)
- [Prisma文档](https://www.prisma.io/docs)
- [TypeScript文档](https://www.typescriptlang.org/docs)

### 8.2 工具推荐

- [Postman](https://www.postman.com) - API测试
- [DBeaver](https://dbeaver.io) - 数据库管理
- [Redis Desktop](https://redis.com/redis-enterprise/redis-enterprise/software/redis-desktop-manager/) - Redis可视化
- [MongoDB Compass](https://www.mongodb.com/products/compass) - MongoDB可视化
