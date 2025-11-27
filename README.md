# 个人物品使用率管理系统

一个用于管理家庭物品使用率的系统，帮助用户最大化物品价值。

## 功能特点

1. 物品使用率管理
2. 运动目标管理
3. 可视化数据展示
4. 多用户支持
5. 数据持久化存储

## 技术栈

- 后端：Node.js + Express
- 前端：原生HTML + CSS + JavaScript
- 数据库：SQLite
- 认证：JWT + bcrypt

## 安装与运行

1. 安装依赖：
   ```
   npm install
   ```

2. 启动应用：
   ```
   npm start
   ```

3. 访问应用：
   浏览器打开 http://localhost:3000

## 开发模式

```
npm run dev
```

## API接口

系统提供以下API接口用于监控和管理：

- `GET /health` - 健康检查接口，返回服务器运行状态和资源使用情况
- `GET /status` - 服务器状态接口，返回基本运行信息

## 上线前优化措施

### 性能优化
- 启用数据库WAL模式以提高并发性能
- 设置合适的缓存策略
- 使用数据库连接池和查询缓存
- 压缩静态资源
- 设置HTTP缓存头

### 安全性增强
- 强制启用HTTPS加密传输（生产环境）
- 使用JWT令牌加强会话管理，设置合理过期时间（生产环境24小时，开发环境7天）
- 对所有用户输入进行严格验证和清理
- 加密存储敏感信息
- 实施细粒度访问控制

### 稳定性保障
- 实现全局异常处理机制
- 建立数据备份与灾难恢复方案
- 为关键操作添加重试机制
- 添加健康检查接口

### 部署优化
- 使用环境变量分离不同环境配置
- 采用PM2进程管理工具确保应用稳定运行
- 配置反向代理（如Nginx）提升性能和安全性
- 设置日志轮转机制

### 监控运维
- 集成APM工具进行应用性能监控
- 实现集中式日志管理和轮转机制
- 添加健康检查接口和告警机制

## 环境配置

复制 `.env.example` 文件为 `.env` 并根据需要修改配置：

```
# 服务器端口
PORT=3000

# JWT密钥（生产环境必须更改）
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Node环境
NODE_ENV=development
```

## PM2 部署

使用PM2部署应用：

```
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

## 数据库

系统使用SQLite数据库，数据文件为 `database.sqlite`，应用会自动创建。

## 用户认证

系统使用JWT令牌和bcrypt密码加密实现用户认证。

## 注意事项

1. 生产环境请务必更改JWT密钥
2. 定期备份数据库文件
3. 监控应用日志以便及时发现问题

## API接口

### 认证相关
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录

### 分类管理
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 物品管理
- `GET /api/items` - 获取物品列表
- `POST /api/items` - 创建物品
- `PUT /api/items/:id` - 更新物品
- `DELETE /api/items/:id` - 删除物品
- `POST /api/items/:id/use` - 增加使用次数

### 使用日志
- `GET /api/logs` - 获取使用日志
- `POST /api/logs` - 创建使用日志

### 运动目标管理
- `GET /api/exercise-goals` - 获取运动目标列表
- `POST /api/exercise-goals` - 创建运动目标
- `PUT /api/exercise-goals/:id` - 更新运动目标
- `DELETE /api/exercise-goals/:id` - 删除运动目标
- `POST /api/exercise-goals/:id/records` - 添加运动记录

### 旅游记录管理
- `GET /api/visited-cities` - 获取访问城市列表
- `POST /api/visited-cities` - 添加访问城市
- `PUT /api/visited-cities/:id` - 更新访问城市
- `DELETE /api/visited-cities/:id` - 删除访问城市

## 数据库设计

### 用户表 (users)
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- username: TEXT UNIQUE NOT NULL
- password: TEXT NOT NULL
- created_at: TEXT NOT NULL

### 分类表 (categories)
- id: TEXT PRIMARY KEY
- user_id: INTEGER NOT NULL
- name: TEXT NOT NULL
- created_at: TEXT NOT NULL

### 物品表 (items)
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id: INTEGER NOT NULL
- name: TEXT NOT NULL
- category: TEXT NOT NULL
- purchase_date: TEXT NOT NULL
- price: REAL DEFAULT 0
- usage_count: INTEGER DEFAULT 0
- last_used: TEXT
- value_tag: TEXT DEFAULT ''
- status: TEXT DEFAULT '未使用'
- created_at: TEXT NOT NULL

### 使用日志表 (usage_logs)
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id: INTEGER NOT NULL
- item_id: INTEGER NOT NULL
- used_at: TEXT NOT NULL
- note: TEXT

### 运动目标表 (exercise_goals)
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id: INTEGER NOT NULL
- title: TEXT NOT NULL
- target: REAL NOT NULL
- start_date: TEXT NOT NULL
- end_date: TEXT NOT NULL
- type: TEXT NOT NULL
- created_at: TEXT NOT NULL

### 运动记录表 (exercise_records)
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id: INTEGER NOT NULL
- goal_id: INTEGER NOT NULL
- date: TEXT NOT NULL
- value: REAL NOT NULL
- created_at: TEXT NOT NULL

### 访问城市表 (visited_cities)
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id: INTEGER NOT NULL
- city_id: INTEGER NOT NULL
- city_name: TEXT NOT NULL
- visit_date: TEXT NOT NULL
- rating: TEXT
- created_at: TEXT NOT NULL
```

## 许可证

MIT