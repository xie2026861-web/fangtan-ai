# API设计规范

**版本**: v1.0  
**日期**: 2026-02-18

---

## 1. API版本控制

```yaml
版本策略: URL版本 (更直观)
格式: /api/v{version}/{resource}
示例: 
  - /api/v1/users
  - /api/v1/customers
  - /api/v1/reach/tasks
```

## 2. 接口分组

```yaml
API v1 分组:
├── /api/v1/auth          # 认证相关
├── /api/v1/users         # 用户管理
├── /api/v1/customers     # 客户管理
├── /api/v1/reach         # 触达任务
├── /api/v1/content       # 内容生成
├── /api/v1/crm           # CRM协同
├── /api/v1/compliance    # 合规管理
├── /api/v1/analytics     # 数据分析
├── /api/v1/files         # 文件管理
└── /api/v1/webhooks     # Webhook回调
```

## 3. 认证接口

```yaml
接口列表:
POST   /api/v1/auth/login              # 账号密码登录
POST   /api/v1/auth/register           # 注册
POST   /api/v1/auth/logout             # 登出
POST   /api/v1/auth/refresh            # 刷新Token
POST   /api/v1/auth/forgot-password    # 忘记密码
POST   /api/v1/auth/reset-password    # 重置密码
POST   /api/v1/auth/verify-email       # 邮箱验证
POST   /api/v1/auth/2fa/enable        # 开启二次验证
POST   /api/v1/auth/2fa/verify        # 验证二次验证码
```

### 3.1 登录请求示例

```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3.2 登录响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  },
  "timestamp": "2026-02-18T10:00:00Z",
  "requestId": "uuid"
}
```

## 4. 客户管理接口

```yaml
GET    /api/v1/customers               # 客户列表(分页+筛选)
POST   /api/v1/customers               # 创建客户
GET    /api/v1/customers/:id          # 客户详情
PUT    /api/v1/customers/:id          # 更新客户
DELETE /api/v1/customers/:id          # 删除客户
POST   /api/v1/customers/batch        # 批量导入
POST   /api/v1/customers/:id/tags     # 更新标签
POST   /api/v1/customers/:id/assign   # 分配客户
POST   /api/v1/customers/:id/transfer # 转移客户
POST   /api/v1/customers/:id/follow-up# 添加跟进
GET    /api/v1/customers/:id/follow-ups# 跟进记录
GET    /api/v1/customers/export       # 导出客户
```

### 4.1 客户列表请求示例

```json
GET /api/v1/customers
Authorization: Bearer {accessToken}

Query Parameters:
- page: 1 (页码)
- limit: 20 (每页数量)
- status: A (筛选意向等级)
- tag: vip (筛选标签)
- source: poix (筛选来源)
- search: 张三 (搜索姓名/电话)
- sortBy: createdAt (排序字段)
- sortOrder: desc (排序方向)
```

### 4.2 客户列表响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "张三",
        "phone": "13800138000",
        "intentionScore": 85,
        "intentionLevel": "A",
        "lifecycleStage": "prospect",
        "source": "poi",
        "tags": ["刚需", "学区"],
        "createdAt": "2026-02-18T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "totalPages": 50
    }
  },
  "timestamp": "2026-02-18T10:00:00Z",
  "requestId": "uuid"
}
```

## 5. 触达任务接口

```yaml
GET    /api/v1/reach/tasks             # 任务列表
POST   /api/v1/reach/tasks             # 创建任务
GET    /api/v1/reach/tasks/:id         # 任务详情
PUT    /api/v1/reach/tasks/:id         # 更新任务
DELETE /api/v1/reach/tasks/:id         # 删除任务
POST   /api/v1/reach/tasks/:id/start   # 启动任务
POST   /api/v1/reach/tasks/:id/pause   # 暂停任务
POST   /api/v1/reach/tasks/:id/stop    # 停止任务

GET    /api/v1/reach/calls             # 外呼记录
GET    /api/v1/reach/calls/:id         # 通话详情
GET    /api/v1/reach/calls/:id/recording# 录音文件
GET    /api/v1/reach/calls/:id/transcript# 对话转录
```

### 5.1 创建触达任务请求示例

```json
POST /api/v1/reach/tasks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "新盘开盘外呼",
  "type": "call",
  "customerIds": ["uuid1", "uuid2", "uuid3"],
  "scriptId": "uuid",
  "config": {
    "callTime": "09:00-18:00",
    "maxAttempts": 3,
    "retryInterval": 60,
    "transferToAgent": true,
    "transferScore": 70
  },
  "schedule": {
    "startAt": "2026-02-19T09:00:00Z",
    "endAt": "2026-02-25T18:00:00Z"
  }
}
```

## 6. 内容生成接口

```yaml
GET    /api/v1/content/templates        # 模板列表
POST   /api/v1/content/templates      # 创建模板
GET    /api/v1/content/templates/:id  # 模板详情
PUT    /api/v1/content/templates/:id  # 更新模板
DELETE /api/v1/content/templates/:id# 删除模板

POST   /api/v1/content/generate       # 生成内容
GET    /api/v1/content/generations   # 生成记录
GET    /api/v1/content/generations/:id# 详情
POST   /api/v1/content/:id/publish   # 发布内容
GET    /api/v1/content/:id/analytics# 数据分析
```

### 6.1 生成内容请求示例

```json
POST /api/v1/content/generate
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "templateId": "uuid",
  "platform": "wechat",
  "params": {
    "property": {
      "name": "阳光花园3期",
      "rooms": 3,
      "halls": 2,
      "area": 126,
      "floor": 18,
      "totalFloors": 32,
      "decoration": "精装修",
      "price": 285,
      "pricePerSqm": 22619,
      "features": ["地铁3号线", "实验小学", "2万㎡花园"]
    },
    "style": "感性风格",
    "wordCount": 150
  }
}
```

## 7. CRM协同接口

```yaml
GET    /api/v1/crm/tags                # 标签列表
POST   /api/v1/crm/tags               # 创建标签
PUT    /api/v1/crm/tags/:id           # 更新标签
DELETE /api/v1/crm/tags/:id           # 删除标签

GET    /api/v1/crm/lifecycles         # 生命周期阶段列表
POST   /api/v1/crm/customers/:id/stage# 更新阶段

GET    /api/v1/crm/pipelines          # 销售漏斗
POST   /api/v1/crm/activities          # 创建活动
GET    /api/v1/crm/activities          # 活动列表
```

## 8. 合规管理接口

```yaml
GET    /api/v1/compliance/sensitive-words     # 敏感词列表
POST   /api/v1/compliance/sensitive-words     # 添加敏感词
PUT    /api/v1/compliance/sensitive-words/:id # 更新敏感词
DELETE /api/v1/compliance/sensitive-words/:id# 删除敏感词

POST   /api/v1/compliance/check               # 内容合规检查
GET    /api/v1/compliance/check/:id          # 检查结果

GET    /api/v1/compliance/audit              # 审计日志
GET    /api/v1/compliance/audit/:id          # 审计详情
```

## 9. 数据分析接口

```yaml
GET    /api/v1/analytics/dashboard           # 数据看板
GET    /api/v1/analytics/reach               # 触达分析
GET    /api/v1/analytics/conversion         # 转化分析
GET    /api/v1/analytics/content            # 内容分析
GET    /api/v1/analytics/agent              # 经纪人分析

POST   /api/v1/analytics/export              # 导出报表
GET    /api/v1/analytics/export/:id         # 导出状态
```

## 10. 错误处理

### 10.1 错误码定义

```yaml
错误码:
成功:
  200: 成功

客户端错误:
  400: 请求参数错误
  401: 未认证
  403: 无权限
  404: 资源不存在
  422: 业务验证失败
  429: 请求过于频繁

服务端错误:
  500: 服务器错误
  502: 网关错误
  503: 服务不可用
  504: 网关超时
```

### 10.2 错误响应示例

```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "timestamp": "2026-02-18T10:00:00Z",
  "requestId": "uuid"
}
```

## 11. 认证与授权

### 11.1 请求头

```yaml
认证头:
Authorization: Bearer {accessToken}
X-Request-Id: {uuid}
X-Tenant-Id: {tenant_id} (多租户)
Accept-Language: zh-CN (国际化)
```

### 11.2 Token刷新

```json
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

响应:
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 3600
}
```

## 12. 速率限制

```yaml
速率限制策略:
默认: 100次/分钟
登录: 5次/分钟
导出: 10次/小时

响应头:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1699860000
```

## 13. Webhook

### 13.1 Webhook事件

```yaml
事件类型:
customer.created        # 客户创建
customer.updated       # 客户更新
reach.completed        # 触达完成
content.generated      # 内容生成
compliance.violated    # 合规违规
subscription.expired    # 订阅过期
```

### 13.2 Webhook配置

```yaml
POST /api/v1/webhooks
请求体:
{
  "url": "https://your-server.com/webhook",
  "events": ["customer.created", "reach.completed"],
  "secret": "webhook_secret_key",
  "active": true
}
```

### 13.3 Webhook签名

```yaml
签名头:
X-Fangtan-Signature: t=timestamp,v1=signature

签名计算:
signature = HMAC-SHA256(secret, "t=" + timestamp + "." + payload)
```
