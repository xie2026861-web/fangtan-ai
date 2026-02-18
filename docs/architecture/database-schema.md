# 数据库架构设计

**版本**: v1.0  
**日期**: 2026-02-18

---

## 1. 数据库选型

| 数据库 | 用途 | 理由 |
|-------|------|------|
| **PostgreSQL** | 核心业务数据 | ACID强一致、JSON支持丰富、扩展性强 |
| **MongoDB** | 客户画像、日志 | 灵活Schema、适合非结构化数据 |
| **Redis** | 缓存、会话、实时数据 | 高性能、丰富数据结构 |
| **Elasticsearch** | 全文检索 | 强大搜索、聚合分析 |
| **ClickHouse** | 数据仓库、分析报表 | OLAP优化、列式存储 |
| **Milvus** | 向量数据库 | 语义搜索、推荐系统 |

## 2. PostgreSQL 核心表

### 2.1 用户表 (users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar VARCHAR(500),
  role VARCHAR(20) CHECK (role IN ('admin', 'manager', 'agent', 'viewer')),
  status VARCHAR(20) DEFAULT 'active',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

### 2.2 企业表 (enterprises)

```sql
CREATE TABLE enterprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  industry VARCHAR(100),
  scale VARCHAR(50),
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_enterprises_code ON enterprises(code);
```

### 2.3 团队表 (teams)

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES enterprises(id),
  name VARCHAR(100) NOT NULL,
  leader_id UUID REFERENCES users(id),
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teams_enterprise ON teams(enterprise_id);
CREATE INDEX idx_teams_leader ON teams(leader_id);
```

### 2.4 客户表 (customers)

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id),
  enterprise_id UUID REFERENCES enterprises(id),
  source VARCHAR(50) CHECK (source IN ('poi', 'platform', 'behavior', 'import', 'manual')),
  phone VARCHAR(20),
  wechat VARCHAR(100),
  name VARCHAR(100),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
  age INT,
  intention_score INT CHECK (intention_score BETWEEN 0 AND 100),
  intention_level VARCHAR(10) CHECK (intention_level IN ('A', 'B', 'C', 'D')),
  lifecycle_stage VARCHAR(50) CHECK (lifecycle_stage IN ('lead', 'prospect', 'opportunity', 'customer', 'churn')),
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  quality_grade VARCHAR(10) CHECK (quality_grade IN ('A', 'B', 'C', 'D')),
  data_source JSONB,
  verified_at TIMESTAMP,
  last_contact_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_owner ON customers(owner_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_intention ON customers(intention_level);
CREATE INDEX idx_customers_lifecycle ON customers(lifecycle_stage);
CREATE INDEX idx_customers_tags ON customers USING GIN(tags);
```

### 2.5 订阅表 (subscriptions)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  enterprise_id UUID REFERENCES enterprises(id),
  plan_type VARCHAR(20) CHECK (plan_type IN ('trial', 'basic', 'enterprise', 'custom')),
  status VARCHAR(20) DEFAULT 'trial',
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  renewed_at TIMESTAMP,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20),
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_enterprise ON subscriptions(enterprise_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### 2.6 配额表 (quotas)

```sql
CREATE TABLE quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  resource_type VARCHAR(50) CHECK (resource_type IN (
    'data_collection', 'call_minutes', 'content_generation', 
    'customers', 'storage', 'api_calls', 'team_members'
  )),
  total_quota DECIMAL NOT NULL,
  used_quota DECIMAL DEFAULT 0,
  reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quotas_subscription ON quotas(subscription_id);
CREATE INDEX idx_quotas_resource ON quotas(resource_type);
```

### 2.7 触达任务表 (reach_tasks)

```sql
CREATE TABLE reach_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  enterprise_id UUID REFERENCES enterprises(id),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('call', 'sms', 'wechat', 'mixed')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'failed')),
  target_count INT DEFAULT 0,
  executed_count INT DEFAULT 0,
  completed_count INT DEFAULT 0,
  intention_a_count INT DEFAULT 0,
  config JSONB DEFAULT '{}',
  script_id UUID,
  start_at TIMESTAMP,
  end_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reach_tasks_user ON reach_tasks(user_id);
CREATE INDEX idx_reach_tasks_status ON reach_tasks(status);
```

### 2.8 外呼记录表 (call_records)

```sql
CREATE TABLE call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES reach_tasks(id),
  customer_id UUID REFERENCES customers(id),
  agent_id UUID REFERENCES users(id),
  phone VARCHAR(20) NOT NULL,
  direction VARCHAR(10) CHECK (direction IN ('outbound', 'inbound')),
  status VARCHAR(20) CHECK (status IN ('pending', 'connecting', 'answered', 'completed', 'failed', 'no_answer', 'busy')),
  duration INT,
  intent_score INT CHECK (intent_score BETWEEN 0 AND 100),
  intent_level VARCHAR(10) CHECK (intent_level IN ('A', 'B', 'C', 'D')),
  recording_url VARCHAR(500),
  transcript TEXT,
  summary TEXT,
  called_at TIMESTAMP DEFAULT NOW(),
  answered_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_call_records_task ON call_records(task_id);
CREATE INDEX idx_call_records_customer ON call_records(customer_id);
CREATE INDEX idx_call_records_intent ON call_records(intent_level);
```

### 2.9 内容模板表 (content_templates)

```sql
CREATE TABLE content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  enterprise_id UUID REFERENCES enterprises(id),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('copywriting', 'image', 'video', 'script')),
  platform VARCHAR(50) CHECK (platform IN ('wechat', 'xiaohongshu', 'douyin', 'zhihu', 'weibo', 'custom')),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  sample_output TEXT,
  config JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_templates_user ON content_templates(user_id);
CREATE INDEX idx_content_templates_type ON content_templates(type);
CREATE INDEX idx_content_templates_platform ON content_templates(platform);
```

### 2.10 内容生成记录表 (content_generations)

```sql
CREATE TABLE content_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES content_templates(id),
  customer_id UUID REFERENCES customers(id),
  user_id UUID REFERENCES users(id),
  input_params JSONB NOT NULL,
  generated_content TEXT NOT NULL,
  platform VARCHAR(50),
  status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  compliance_status VARCHAR(20) DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'rejected')),
  compliance_notes TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE INDEX idx_content_generations_template ON content_generations(template_id);
CREATE INDEX idx_content_generations_customer ON content_generations(customer_id);
CREATE INDEX idx_content_generations_user ON content_generations(user_id);
```

### 2.11 敏感词库表 (sensitive_words)

```sql
CREATE TABLE sensitive_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) CHECK (category IN ('fake', 'overclaim', 'discrimination', 'policy', 'school', 'other')),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  replacement VARCHAR(100),
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sensitive_words_word ON sensitive_words(word);
CREATE INDEX idx_sensitive_words_category ON sensitive_words(category);
```

### 2.12 合规日志表 (compliance_logs)

```sql
CREATE TABLE compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  operator_id UUID REFERENCES users(id),
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  blockchain_hash VARCHAR(200),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_compliance_logs_entity ON compliance_logs(entity_type, entity_id);
CREATE INDEX idx_compliance_logs_operator ON compliance_logs(operator_id);
CREATE INDEX idx_compliance_logs_timestamp ON compliance_logs(timestamp);
```

### 2.13 使用记录表 (usage_records)

```sql
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  enterprise_id UUID REFERENCES enterprises(id),
  subscription_id UUID REFERENCES subscriptions(id),
  resource_type VARCHAR(50) NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_records_user ON usage_records(user_id);
CREATE INDEX idx_usage_records_enterprise ON usage_records(enterprise_id);
CREATE INDEX idx_usage_records_resource ON usage_records(resource_type);
CREATE INDEX idx_usage_records_created_at ON usage_records(created_at);
```

## 3. MongoDB 集合设计

### 3.1 客户画像集合 (customer_profiles)

```javascript
db.createCollection("customer_profiles");

db.customer_profiles.createIndex({ customer_id: 1 });
db.customer_profiles.createIndex({ "behavior_data.search_history.date": -1 });
db.customer_profiles.createIndex({ "ai_analysis.personality": 1 });
```

### 3.2 对话日志集合 (conversation_logs)

```javascript
db.createCollection("conversation_logs");

db.conversation_logs.createIndex({ call_record_id: 1 });
db.conversation_logs.createIndex({ timestamp: -1 });
db.conversation_logs.createIndex({ sentiment: 1 });
```

### 3.3 分析事件集合 (analytics_events)

```javascript
db.createCollection("analytics_events");

db.analytics_events.createIndex({ event_type: 1 });
db.analytics_events.createIndex({ customer_id: 1 });
db.analytics_events.createIndex({ timestamp: -1 });
```

## 4. Redis 缓存设计

### 4.1 缓存键设计

```
Session管理:
├── sess:{user_id}          # 用户会话
└── sess:token:{token}    # Token映射

实时数据:
├── reach:stats:{task_id}   # 触达任务实时统计
├── call:status:{call_id}   # 通话状态
└── online:agents          # 在线经纪人列表

缓存层:
├── customer:{id}          # 客户信息缓存
├── config:{key}           # 系统配置缓存
└── template:{id}         # 模板缓存

排行榜:
├── leaderboard:agents:monthly    # 月度经纪人排行
└── leaderboard:teams:weekly      # 团队排行

分布式锁:
├── lock:task:{task_id}           # 任务执行锁
└── lock:sync:{source_id}        # 数据同步锁
```

## 5. ClickHouse 分析表设计

### 5.1 客户分析宽表

```sql
CREATE TABLE customer_analytics (
  customer_id UUID,
  date DATE,
  reach_count UInt32,
  call_duration UInt32,
  intention_score Float32,
  conversion_prob Float32,
  features Array(Float32)
) ENGINE = ReplacingMergeTree()
ORDER BY (customer_id, date);
```

### 5.2 触达指标表

```sql
CREATE TABLE reach_metrics (
  task_id UUID,
  date DATE,
  hour UInt8,
  attempted UInt32,
  connected UInt32,
  completed UInt32,
  answered_rate Float32,
  avg_duration Float32,
  a_rate Float32,
  cost_per_lead Float32
) ENGINE = SummingMergeTree()
ORDER BY (task_id, date, hour);
```

## 6. Milvus 向量设计

### 6.1 客户向量集合

```yaml
Collection: customer_embeddings
Schema:
├── customer_id: UUID
├── text_embedding: Vector(1536)
├── behavior_embedding: Vector(768)
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP

Index: HNSW
Metric: COSINE
```

### 6.2 内容向量集合

```yaml
Collection: content_embeddings
Schema:
├── content_id: UUID
├── text_embedding: Vector(1536)
├── platform: VARCHAR(20)
└── created_at: TIMESTAMP

Index: HNSW
Metric: COSINE
```

## 7. 数据关系图

```
users (1) ─────── (N) customers
  │                   │
  │                   ├── (N) call_records
  │                   ├── (N) content_generations
  │                   └── (1) customer_profiles (MongoDB)
  │
  ├── (N) subscriptions
  │
  └── (N) teams (作为团队成员)
      │
      └── (1) enterprises
              │
              └── (N) teams
                      │
                      └── (N) users (作为团队成员)
```
