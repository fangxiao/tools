const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const http = require('http');
const https = require('https');
const sparkService = require('./services/sparkService');

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 确保上传目录存在
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'exercise-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  }
});

const { 
  initializeDatabase,
  createUser,
  findUserByUsername,
  findUserById,
  updateUserPassword,
  getAllCategories,
  getCategoriesByUser,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllItemsByUser,
  getFilteredItemsByUser,
  getItemByIdAndUser,
  createItem,
  updateItem,
  deleteItem,
  incrementItemUsage,
  getAllLogsByUser,
  getLogsByUserWithPagination,
  getLogsByUserWithPaginationAndKeyword,
  getLogsCountByUser,
  getLogsCountByUserWithKeyword,
  createUsageLog,
  getExerciseGoalsByUser,
  getExerciseGoalById,
  createExerciseGoal,
  updateExerciseGoal,
  deleteExerciseGoal,
  updateCurrentWeight,
  getExerciseRecordsByUser,
  getExerciseRecordsByGoal,
  createExerciseRecord,
  getExerciseRecordById,
  updateExerciseRecord,
  deleteExerciseRecord,
  getVisitedCitiesByUser,
  getVisitedCityById,
  getVisitedCityByCityId,
  createVisitedCity,
  updateVisitedCity,
  deleteVisitedCity
} = require('./database');
const { accessLogger, logError } = require('./middleware/logger');
const { authenticateToken } = require('./middleware/auth');

// 创建日志目录
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

const app = express();
const port = process.env.PORT || 3000;

// 添加请求限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 500 // 限制每个IP在窗口期内最多500个请求
});

// 对所有请求应用限流
app.use(limiter);

// 为敏感API端点添加更严格的限流
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP在窗口期内最多100个API请求
});

// 对API路由应用更严格的限流
app.use('/api/', apiLimiter);

// 初始化数据库
initializeDatabase();

// 使用访问日志中间件（生产环境降低日志级别）
app.use(accessLogger);

// 生产环境使用HTTPS重定向中间件
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// 全局错误处理中间件
app.use((err, req, res, next) => {
  logError(err, req);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/tools/exercise', express.static('tools/exercise'));
app.use('/tools/exercise/src/libs', express.static('tools/exercise/src/libs'));
app.use('/tools/roi', express.static('tools/roi'));

// 为上传的文件提供静态资源服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 图片上传接口
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // Check if user exists
  findUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    // 返回图片URL
    res.json({ 
      imageUrl: '/uploads/' + req.file.filename,
      message: '图片上传成功'
    });
  });
});

// 基础路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Authentication routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    findUserByUsername(username, (err, user) => {
      if (err) {
        return res.status(500).json({ error: '数据库查询错误' });
      }
      
      if (user) {
        return res.status(400).json({ error: '用户名已存在' });
      }
      
      // Hash password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ error: '密码加密错误' });
        }
        
        // Create user
        createUser(username, hashedPassword, (err) => {
          if (err) {
            return res.status(500).json({ error: '创建用户失败' });
          }
          
          // Find the created user to return its ID
          findUserByUsername(username, (err, user) => {
            if (err || !user) {
              return res.status(500).json({ error: '查询用户失败' });
            }
            
            res.status(201).json({ 
              id: user.id, 
              username: user.username
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: '注册过程中发生错误' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('登录请求:', { username, password: password ? '[HIDDEN]' : 'EMPTY' });
    
    // 检查请求参数
    if (!username || !password) {
      console.log('登录失败: 用户名或密码为空');
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    // Find user
    findUserByUsername(username, (err, user) => {
      if (err) {
        console.error('数据库查询错误:', err);
        return res.status(500).json({ error: '数据库查询错误' });
      }
      
      console.log('查询用户结果:', user);
      
      if (!user) {
        console.log('登录失败: 用户不存在');
        return res.status(400).json({ error: '用户名或密码错误' });
      }
      
      // Check password
      bcrypt.compare(password, user.password, (err, validPassword) => {
        if (err) {
          console.error('密码验证错误:', err);
          return res.status(500).json({ error: '密码验证错误' });
        }
        
        if (!validPassword) {
          console.log('登录失败: 密码错误');
          return res.status(400).json({ error: '用户名或密码错误' });
        }
        
        console.log('登录成功:', { id: user.id, username: user.username });
        
        // 生成JWT令牌
        const { generateToken } = require('./middleware/auth');
        const token = generateToken(user);
        
        res.json({ 
          id: user.id, 
          username: user.username,
          token: token
        });
      });
    });
  } catch (error) {
    console.error('登录过程中发生错误:', error);
    res.status(500).json({ error: '登录过程中发生错误' });
  }
});

// Category management routes
app.get('/api/categories', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  getCategoriesByUser(userId, (err, categories) => {
    if (err) {
      return res.status(500).json({ error: '获取分类失败' });
    }
    res.json(categories);
  });
});

app.post('/api/categories', (req, res) => {
  const { id, name } = req.body;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  createCategory(id, userId, name, (err) => {
    if (err) {
      return res.status(500).json({ error: '创建分类失败' });
    }
    res.status(201).json({ id, name });
  });
});

app.put('/api/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const { userId } = req.query;
  const { name } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  updateCategory(categoryId, userId, name, (err) => {
    if (err) {
      return res.status(500).json({ error: '更新分类失败' });
    }
    res.json({ id: categoryId, name });
  });
});

app.delete('/api/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  deleteCategory(categoryId, userId, (err) => {
    if (err) {
      return res.status(500).json({ error: '删除分类失败' });
    }
    res.status(204).send();
  });
});

// API endpoints for items (filtered by user)
app.get('/api/items', (req, res) => {
  const { userId, keyword, category, dateFrom, dateTo } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // 如果有筛选参数，则使用筛选查询
  if (keyword || category || dateFrom || dateTo) {
    const filters = {
      keyword: keyword || null,
      category: category || null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null
    };
    
    getFilteredItemsByUser(userId, filters, (err, items) => {
      if (err) {
        return res.status(500).json({ error: '获取物品失败' });
      }
      res.json(items);
    });
  } else {
    // 否则使用默认查询
    getAllItemsByUser(userId, (err, items) => {
      if (err) {
        return res.status(500).json({ error: '获取物品失败' });
      }
      res.json(items);
    });
  }
});

app.get('/api/items/:id', (req, res) => {
  const { userId } = req.query;
  const itemId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  getItemByIdAndUser(itemId, userId, (err, item) => {
    if (err) {
      return res.status(500).json({ error: '查询物品失败' });
    }
    
    if (!item) {
      return res.status(404).json({ error: '物品未找到' });
    }
    
    res.json(item);
  });
});

app.post('/api/items', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // Check if user exists
  findUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const item = {
      userId: parseInt(userId),
      name: req.body.name,
      category: req.body.category,
      purchaseDate: req.body.purchaseDate,
      price: req.body.price ? parseFloat(req.body.price) : 0,
      usageCount: req.body.usageCount ? parseInt(req.body.usageCount) : 0,
      lastUsed: req.body.lastUsed || null,
      valueTag: req.body.valueTag || '',
      status: req.body.status || (req.body.usageCount == 0 ? '未使用' : '使用中')
    };
    
    createItem(item, function(err) {
      if (err) {
        return res.status(500).json({ error: '创建物品失败: ' + err.message });
      }
      
      // Get the created item
      const itemId = this.lastID;
      getItemByIdAndUser(itemId, userId, (err, item) => {
        if (err) {
          return res.status(500).json({ error: '查询物品失败' });
        }
        res.status(201).json(item);
      });
    });
  });
});

app.put('/api/items/:id', (req, res) => {
  const { userId } = req.query;
  const itemId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  const item = {
    name: req.body.name,
    category: req.body.category,
    purchaseDate: req.body.purchaseDate,
    price: req.body.price,
    usageCount: req.body.usageCount !== undefined ? parseInt(req.body.usageCount) : undefined,
    lastUsed: req.body.lastUsed,
    valueTag: req.body.valueTag,
    status: req.body.status
  };
  
  updateItem(itemId, userId, item, (err) => {
    if (err) {
      return res.status(500).json({ error: '更新物品失败' });
    }
    
    // Get the updated item
    getItemByIdAndUser(itemId, userId, (err, item) => {
      if (err) {
        return res.status(500).json({ error: '查询物品失败' });
      }
      
      if (!item) {
        return res.status(404).json({ error: '物品未找到' });
      }
      
      res.json(item);
    });
  });
});

app.delete('/api/items/:id', (req, res) => {
  const { userId } = req.query;
  const itemId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  deleteItem(itemId, userId, (err) => {
    if (err) {
      return res.status(500).json({ error: '删除物品失败' });
    }
    res.status(204).send();
  });
});

// Usage log endpoints
app.post('/api/items/:id/use', (req, res) => {
  const { userId } = req.query;
  const itemId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // Increment item usage count
  incrementItemUsage(itemId, userId, (err) => {
    if (err) {
      return res.status(500).json({ error: '更新物品使用次数失败' });
    }
    
    // Get item to create log entry
    getItemByIdAndUser(itemId, userId, (err, item) => {
      if (err) {
        return res.status(500).json({ error: '查询物品失败' });
      }
      
      if (!item) {
        return res.status(404).json({ error: '物品未找到' });
      }
      
      const log = {
        itemId: item.id,
        itemName: item.name,
        userId: item.user_id,
        notes: req.body.notes || ''
      };
      
      createUsageLog(log, function(err) {
        if (err) {
          return res.status(500).json({ error: '创建使用日志失败' });
        }
        
        // Get the created log
        const logId = this.lastID;
        res.json({ id: logId, ...log });
      });
    });
  });
});

// 分页获取使用日志
app.get('/api/logs', (req, res) => {
  const { userId, page = 1, limit = 10, keyword } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (keyword) {
    // 获取带关键词的日志总数
    getLogsCountByUserWithKeyword(userId, keyword, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: '获取日志总数失败' });
      }
      
      const totalCount = countResult.count;
      const totalPages = Math.ceil(totalCount / limitNum);
      
      // 获取当前页的带关键词日志
      getLogsByUserWithPaginationAndKeyword(userId, keyword, pageNum, limitNum, (err, logs) => {
        if (err) {
          return res.status(500).json({ error: '获取使用日志失败' });
        }
        
        res.json({
          logs,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalCount,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        });
      });
    });
  } else {
    // 获取日志总数
    getLogsCountByUser(userId, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: '获取日志总数失败' });
      }
      
      const totalCount = countResult.count;
      const totalPages = Math.ceil(totalCount / limitNum);
      
      // 获取当前页的日志
      getLogsByUserWithPagination(userId, pageNum, limitNum, (err, logs) => {
        if (err) {
          return res.status(500).json({ error: '获取使用日志失败' });
        }
        
        res.json({
          logs,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalCount,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        });
      });
    });
  }
});

// Exercise goals endpoints
app.get('/api/exercise-goals', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // 获取用户的私有目标和所有公有目标
  getExerciseGoalsByUser(userId, (err, goals) => {
    if (err) {
      return res.status(500).json({ error: '获取运动目标失败' });
    }
    res.json(goals);
  });
});

// 添加获取单个运动目标的路由
app.get('/api/exercise-goals/:id', (req, res) => {
  const { userId } = req.query;
  const goalId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  getExerciseGoalById(goalId, userId, (err, goal) => {
    if (err) {
      return res.status(500).json({ error: '获取运动目标失败' });
    }
    
    if (!goal) {
      return res.status(404).json({ error: '运动目标未找到' });
    }
    
    res.json(goal);
  });
});

app.post('/api/exercise-goals', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // Check if user exists
  findUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const goalData = {
      title: req.body.title,
      target: parseFloat(req.body.target),
      period: req.body.period,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      initialWeight: req.body.initialWeight !== undefined ? parseFloat(req.body.initialWeight) : null,
      targetWeight: req.body.targetWeight !== undefined ? parseFloat(req.body.targetWeight) : null,
      currentWeight: req.body.currentWeight !== undefined ? parseFloat(req.body.currentWeight) : null
    };
    
    // 验证必填字段
    if (!goalData.title || isNaN(goalData.target) || !goalData.startDate || !goalData.endDate) {
      return res.status(400).json({ error: '缺少必要字段' });
    }
    
    // Check for duplicate titles
    getExerciseGoalsByUser(userId, (err, existingGoals) => {
      if (err) {
        return res.status(500).json({ error: '检查标题重复时出错' });
      }
      
      const isDuplicate = existingGoals.some(goal => goal.title === goalData.title);
      if (isDuplicate) {
        return res.status(400).json({ error: '目标标题已存在，请使用其他标题' });
      }
      
      createExerciseGoal(userId, goalData, function(err) {
        if (err) {
          console.error('创建运动目标失败:', err);
          return res.status(500).json({ error: '创建运动目标失败' });
        }
        
        // Get the created goal
        const goalId = this.lastID;
        getExerciseGoalById(goalId, userId, (err, goal) => {
          if (err) {
            return res.status(500).json({ error: '查询运动目标失败' });
          }
          
          if (!goal) {
            return res.status(404).json({ error: '运动目标未找到' });
          }
          
          res.status(201).json(goal);
        });
      });
    });
  });
});

app.put('/api/exercise-goals/:id', (req, res) => {
  const { userId } = req.query;
  const goalId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // Check if user exists
  findUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const goalData = {
      title: req.body.title,
      target: parseFloat(req.body.target),
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      targetWeight: req.body.targetWeight !== undefined ? parseFloat(req.body.targetWeight) : null,
      currentWeight: req.body.currentWeight !== undefined ? parseFloat(req.body.currentWeight) : null,
      visibility: req.body.visibility || 'private' // 添加可见性字段，默认为私有
    };
    
    // 验证必填字段
    if (!goalData.title || isNaN(goalData.target) || !goalData.startDate || !goalData.endDate) {
      return res.status(400).json({ error: '缺少必要字段' });
    }
    
    // Check for duplicate titles
    getExerciseGoalsByUser(userId, (err, existingGoals) => {
      if (err) {
        return res.status(500).json({ error: '检查标题重复时出错' });
      }
      
      const isDuplicate = existingGoals.some(goal => goal.title === goalData.title && goal.id != goalId);
      if (isDuplicate) {
        return res.status(400).json({ error: '目标标题已存在，请使用其他标题' });
      }
      
      updateExerciseGoal(goalId, userId, goalData, (err) => {
        if (err) {
          console.error('更新运动目标失败:', err);
          return res.status(500).json({ error: '更新运动目标失败' });
        }
        
        // Get the updated goal
        getExerciseGoalById(goalId, userId, (err, goal) => {
          if (err) {
            return res.status(500).json({ error: '查询运动目标失败' });
          }
          
          if (!goal) {
            return res.status(404).json({ error: '运动目标未找到' });
          }
          
          res.json(goal);
        });
      });
    });
  });
});

app.put('/api/exercise-goals/:id/weight', (req, res) => {
    const goalId = req.params.id;
    const { userId } = req.query;
    const { currentWeight } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: '缺少用户ID' });
    }
    
    if (currentWeight === undefined || currentWeight === null) {
        return res.status(400).json({ error: '缺少当前体重数据' });
    }
    
    updateCurrentWeight(goalId, userId, currentWeight, (err) => {
        if (err) {
            console.error('更新体重失败:', err);
            return res.status(500).json({ error: '更新体重失败' });
        }
        res.json({ message: '体重更新成功' });
    });
});

app.delete('/api/exercise-goals/:id', (req, res) => {
  const { userId } = req.query;
  const goalId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  deleteExerciseGoal(goalId, userId, (err) => {
    if (err) {
      // 检查是否是没有找到匹配的记录
      if (err.message === 'No matching record found') {
        return res.status(404).json({ error: '找不到该运动目标或您没有权限删除该目标' });
      }
      console.error('删除运动目标失败:', err);
      return res.status(500).json({ error: '删除运动目标失败' });
    }
    // 成功删除，返回204状态码（无内容）
    res.status(204).send();
  });
});

// Exercise records endpoints
app.get('/api/exercise-records', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  getExerciseRecordsByUser(userId, (err, records) => {
    if (err) {
      return res.status(500).json({ error: '获取运动记录失败' });
    }
    res.json(records);
  });
});

app.get('/api/exercise-records/single/:id', (req, res) => {
  const { userId } = req.query;
  const recordId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  getExerciseRecordById(recordId, userId, (err, record) => {
    if (err) {
      return res.status(500).json({ error: '获取运动记录失败' });
    }
    
    if (!record) {
      return res.status(404).json({ error: '运动记录未找到' });
    }
    
    res.json(record);
  });
});

// Update an exercise record
app.put('/api/exercise-records/:id', upload.single('image'), (req, res) => {
  const { userId } = req.query;
  const recordId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // Check if user exists
  findUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const recordData = {
      exerciseType: req.body.exerciseType,
      value: parseFloat(req.body.value),
      recordDate: req.body.recordDate,
      note: req.body.note || '',
      imagePath: req.file ? '/uploads/' + req.file.filename : req.body.imagePath || null
    };
    
    // 验证必填字段
    if (!recordData.exerciseType || isNaN(recordData.value) || !recordData.recordDate) {
      return res.status(400).json({ error: '缺少必要字段' });
    }
    
    updateExerciseRecord(recordId, userId, recordData, (err) => {
      if (err) {
        // 检查是否是没有找到匹配的记录
        if (err.message === 'No matching record found') {
          return res.status(404).json({ error: '找不到该运动记录或您没有权限更新该记录' });
        }
        console.error('更新运动记录失败:', err);
        return res.status(500).json({ error: '更新运动记录失败' });
      }
      
      res.json({ message: '运动记录更新成功' });
    });
  });
});

app.delete('/api/exercise-records/:id', (req, res) => {
  const { userId } = req.query;
  const recordId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  deleteExerciseRecord(recordId, userId, (err) => {
    if (err) {
      return res.status(500).json({ error: '删除运动记录失败' });
    }
    
    res.json({ message: '运动记录删除成功' });
  });
});

// Password reset route
app.put('/api/users/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // 检查请求参数
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '当前密码和新密码都不能为空' });
    }
    
    // 检查新密码和当前密码是否相同
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: '新密码不能与当前密码相同' });
    }
    
    // 查找用户
    findUserById(userId, (err, user) => {
      if (err) {
        console.error('数据库查询错误:', err);
        return res.status(500).json({ error: '数据库查询错误' });
      }
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      
      // 验证当前密码
      bcrypt.compare(currentPassword, user.password, (err, validPassword) => {
        if (err) {
          console.error('密码验证错误:', err);
          return res.status(500).json({ error: '密码验证错误' });
        }
        
        if (!validPassword) {
          return res.status(400).json({ error: '当前密码错误' });
        }
        
        // 检查新密码和当前密码的哈希值是否相同
        bcrypt.compare(newPassword, user.password, (err, sameAsCurrent) => {
          if (err) {
            console.error('新密码验证错误:', err);
            return res.status(500).json({ error: '密码验证错误' });
          }
          
          if (sameAsCurrent) {
            return res.status(400).json({ error: '新密码不能与当前密码相同' });
          }
          
          // 哈希新密码
          bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
              console.error('新密码加密错误:', err);
              return res.status(500).json({ error: '密码加密错误' });
            }
            
            // 更新密码
            updateUserPassword(userId, hashedPassword, (err) => {
              if (err) {
                console.error('更新密码失败:', err);
                return res.status(500).json({ error: '更新密码失败' });
              }
              
              console.log(`用户 ${user.username} 的密码已成功更新`);
              res.json({ message: '密码更新成功' });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('密码重置过程中发生错误:', error);
    res.status(500).json({ error: '密码重置过程中发生错误' });
  }
});

app.get('/api/exercise-records/goal/:goalId', (req, res) => {
  const { userId } = req.query;
  const { goalId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // 检查目标是否存在且用户有权访问（私有目标只能所有者访问，公有目标可以被所有人访问）
  getExerciseGoalById(goalId, userId, (err, goal) => {
    if (err) {
      return res.status(500).json({ error: '查询运动目标失败' });
    }
    
    if (!goal) {
      return res.status(404).json({ error: '运动目标未找到或无权访问' });
    }
    
    getExerciseRecordsByGoal(goalId, userId, (err, records) => {
      if (err) {
        return res.status(500).json({ error: '获取运动记录失败' });
      }
      res.json(records);
    });
  });
});

app.post('/api/exercise-records', upload.single('image'), (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // Check if user exists
  findUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const recordData = {
      goalId: parseInt(req.body.goalId),
      exerciseType: req.body.exerciseType,
      value: parseFloat(req.body.value),
      recordDate: req.body.recordDate,
      note: req.body.note || null,
      imagePath: req.file ? '/uploads/' + req.file.filename : null
    };
    
    // Check if goalId is valid
    if (isNaN(recordData.goalId)) {
      return res.status(400).json({ error: '需要提供有效的目标ID' });
    }
    
    createExerciseRecord(userId, recordData, function(err) {
      if (err) {
        console.error('创建运动记录失败:', err);
        return res.status(500).json({ error: '创建运动记录失败' });
      }
      
      // Get the created record
      const recordId = this.lastID;
      res.status(201).json({ id: recordId, ...recordData });
    });
  });
});

// 访问城市相关API
app.get('/api/visited-cities', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  getVisitedCitiesByUser(userId, (err, cities) => {
    if (err) {
      console.error('获取访问城市失败:', err);
      return res.status(500).json({ error: '获取访问城市失败' });
    }
    res.json(cities);
  });
});

app.post('/api/visited-cities', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  // Check if user exists
  findUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询错误' });
    }
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const cityData = {
      cityId: req.body.cityId,
      cityName: req.body.cityName,
      visitDate: req.body.visitDate,
      rating: parseInt(req.body.rating),
      attraction_level: req.body.attraction_level || null,
      notes: req.body.notes || '',
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null
    };
    
    // Check if already visited
    getVisitedCityByCityId(cityData.cityId, userId, (err, existingCity) => {
      if (err) {
        console.error('查询城市访问记录失败:', err);
        return res.status(500).json({ error: '查询城市访问记录失败' });
      }
      
      if (existingCity) {
        // Update existing record
        updateVisitedCity(existingCity.id, userId, cityData, (err) => {
          if (err) {
            console.error('更新城市访问记录失败:', err);
            return res.status(500).json({ error: '更新城市访问记录失败' });
          }
          
          // Get the updated city
          getVisitedCityById(existingCity.id, userId, (err, city) => {
            if (err) {
              return res.status(500).json({ error: '查询城市访问记录失败' });
            }
            
            if (!city) {
              return res.status(404).json({ error: '城市访问记录未找到' });
            }
            
            res.json(city);
          });
        });
      } else {
        // Create new record
        createVisitedCity(userId, cityData, function(err) {
          if (err) {
            console.error('创建城市访问记录失败:', err);
            return res.status(500).json({ error: '创建城市访问记录失败' });
          }
          
          // Get the created city
          const cityId = this.lastID;
          res.status(201).json({ id: cityId, ...cityData });
        });
      }
    });
  });
});

app.delete('/api/visited-cities/:id', (req, res) => {
  const { userId } = req.query;
  const cityId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: '需要提供用户ID' });
  }
  
  deleteVisitedCity(cityId, userId, (err) => {
    if (err) {
      console.error('删除城市访问记录失败:', err);
      return res.status(500).json({ error: '删除城市访问记录失败' });
    }
    
    res.json({ message: '删除成功' });
  });
});

/**
 * 计算目标进度
 */
function calculateGoalProgress(goal, records) {
  // 筛选出该目标的记录
  const goalRecords = records.filter(record => record.goal_id == goal.id);
  
  // 计算总距离
  let current = 0;
  goalRecords.forEach(record => {
    // 应用转换规则:
    // 1. 游泳: 1小时 = 10公里
    // 2. 其他基于小时的活动: 1小时 = 5公里
    // 3. 骑行: 10公里骑行 = 5公里目标
    if (record.exercise_type === 'swimming') {
      current += record.value * 10;
    } else if (['running', 'cycling', 'swimming'].includes(record.exercise_type) && 
               record.exercise_type !== 'swimming') {
      // 假设这些是基于小时的活动
      current += record.value * 5;
    } else if (record.exercise_type === 'cycling') {
      current += record.value * 0.5; // 10公里骑行 = 5公里目标
    } else {
      current += record.value;
    }
  });
  
  return {
    current: current,
    target: goal.target,
    percentage: goal.target > 0 ? (current / goal.target) * 100 : 0
  };
}

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version
  });
});

// 服务器状态路由
app.get('/status', (req, res) => {
  res.status(200).json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 为写操作添加更严格的限流
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 50, // 写操作限制更严格
  message: {
    error: '请求过于频繁，请稍后再试'
  }
});

// 为读操作添加限流
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 200, // 读操作可以更宽松
  message: {
    error: '请求过于频繁，请稍后再试'
  }
});

// 讯飞星火AI建议API端点
app.post('/api/spark/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = req.body;
    
    // 调用讯飞星火服务生成建议
    const recommendations = await sparkService.generateRecommendations(userData);
    
    res.json({ 
      success: true,
      recommendations 
    });
  } catch (error) {
    logError(error, req);
    res.status(500).json({ 
      success: false,
      error: '服务器内部错误',
      message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : error.message
    });
  }
});

// 对写操作应用更严格的限流
app.post('/api/users', writeLimiter);
app.post('/api/items', writeLimiter);
app.put('/api/items/:id', writeLimiter);
app.delete('/api/items/:id', writeLimiter);
app.post('/api/items/:id/use', writeLimiter);
app.post('/api/categories', writeLimiter);
app.put('/api/categories/:id', writeLimiter);
app.delete('/api/categories/:id', writeLimiter);
app.put('/api/users/password', writeLimiter); // 密码重置接口也属于写操作

// 对读操作应用相对宽松的限流
app.get('/api/items', readLimiter);
app.get('/api/items/:id', readLimiter);
app.get('/api/categories', readLimiter);
app.get('/api/logs', readLimiter);

app.listen(port, () => {
  console.log(`个人物品使用率管理系统监听于 http://localhost:${port}`);
});