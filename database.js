const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// 创建缓存对象
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存时间

// 从缓存中获取数据
function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  // 缓存过期或不存在，删除它
  cache.delete(key);
  return null;
}

// 将数据存储到缓存中
function setToCache(key, data) {
  cache.set(key, {
    data: data,
    timestamp: Date.now()
  });
}

// 清除缓存
function clearCache() {
  cache.clear();
}

// 根据环境变量设置数据库路径
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');

// 在生产环境中启用WAL模式以提高并发性能
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('已连接到 SQLite 数据库');
    
    // 生产环境优化：启用WAL模式提高并发性能
    if (process.env.NODE_ENV === 'production') {
      db.exec('PRAGMA journal_mode = WAL;', (err) => {
        if (err) {
          console.error('设置WAL模式失败:', err.message);
        } else {
          console.log('已启用WAL模式');
        }
      });
      
      // 设置同步模式为NORMAL以提高性能
      db.exec('PRAGMA synchronous = NORMAL;', (err) => {
        if (err) {
          console.error('设置同步模式失败:', err.message);
        } else {
          console.log('已设置同步模式为NORMAL');
        }
      });
      
      // 设置缓存大小
      db.exec('PRAGMA cache_size = 10000;', (err) => {
        if (err) {
          console.error('设置缓存大小失败:', err.message);
        } else {
          console.log('已设置缓存大小为10000页');
        }
      });
    }
  }
});

// 初始化数据库表
function initializeDatabase() {
  // 创建用户表
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('创建用户表失败:', err.message);
      } else {
        console.log('用户表已创建或已存在');
      }
    });

    // 创建分类表（旧版本）
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('创建分类表失败:', err.message);
      } else {
        console.log('分类表已创建或已存在');
      }
    });
    
    // 添加user_id字段到分类表
    db.run(`ALTER TABLE categories ADD COLUMN user_id INTEGER`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('更新分类表结构失败:', err.message);
      } else if (!err) {
        console.log('分类表结构已更新，添加了user_id字段');
      }
    });
    
    // 添加created_at字段到分类表
    db.run(`ALTER TABLE categories ADD COLUMN created_at TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('更新分类表结构失败:', err.message);
      } else if (!err) {
        console.log('分类表结构已更新，添加了created_at字段');
      }
    });

    // 创建物品表
    db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      purchase_date TEXT NOT NULL,
      price REAL DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      last_used TEXT,
      value_tag TEXT DEFAULT '',
      status TEXT DEFAULT '未使用',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('创建物品表失败:', err.message);
      } else {
        console.log('物品表已创建或已存在');
      }
    });

    // 创建使用日志表
    db.run(`CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      used_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (item_id) REFERENCES items (id)
    )`, (err) => {
      if (err) {
        console.error('创建使用日志表失败:', err.message);
      } else {
        console.log('使用日志表已创建或已存在');
      }
    });
    
    // 更新现有的物品标记值，将中文转换为英文
    db.run(`UPDATE items SET value_tag = 'very-value' WHERE value_tag = '很值'`, (err) => {
      if (err) {
        console.error('更新物品标记值失败:', err.message);
      } else {
        console.log('物品标记值已更新：很值 -> very-value');
      }
    });
    
    db.run(`UPDATE items SET value_tag = 'free' WHERE value_tag = '空闲'`, (err) => {
      if (err) {
        console.error('更新物品标记值失败:', err.message);
      } else {
        console.log('物品标记值已更新：空闲 -> free');
      }
    });
    
    db.run(`UPDATE items SET value_tag = 'low-usage' WHERE value_tag = '利用率不够'`, (err) => {
      if (err) {
        console.error('更新物品标记值失败:', err.message);
      } else {
        console.log('物品标记值已更新：利用率不够 -> low-usage');
      }
    });
    
    // 创建运动目标表
    db.run(`CREATE TABLE IF NOT EXISTS exercise_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      target REAL NOT NULL,
      period TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      initial_weight REAL,
      target_weight REAL,
      current_weight REAL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('创建运动目标表失败:', err.message);
      } else {
        console.log('运动目标表已创建或已存在');
      }
    });
    
    // 为运动目标表添加visibility字段（如果不存在）
    db.run(`ALTER TABLE exercise_goals ADD COLUMN visibility TEXT DEFAULT 'private'`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('更新运动目标表结构失败:', err.message);
      } else if (!err) {
        console.log('运动目标表结构已更新，添加了visibility字段，默认值为private');
      }
    });
    
    // 创建运动记录表
    db.run(`CREATE TABLE IF NOT EXISTS exercise_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_id INTEGER NOT NULL,
      exercise_type TEXT NOT NULL,
      value REAL NOT NULL,
      record_date TEXT NOT NULL,
      note TEXT,
      image_path TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (goal_id) REFERENCES exercise_goals (id)
    )`, (err) => {
      if (err) {
        console.error('创建运动记录表失败:', err.message);
      } else {
        console.log('运动记录表已创建或已存在');
      }
    });
    
    // 为运动记录表添加image_path字段（如果不存在）
    db.run(`ALTER TABLE exercise_records ADD COLUMN image_path TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('更新运动记录表结构失败:', err.message);
      } else if (!err) {
        console.log('运动记录表结构已更新，添加了image_path字段');
      }
    });
    
    // 创建访问城市表（移除attraction_level字段）
    db.run(`CREATE TABLE IF NOT EXISTS visited_cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      city_id TEXT NOT NULL,
      city_name TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      rating INTEGER NOT NULL,
      notes TEXT,
      longitude REAL,
      latitude REAL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('创建访问城市表失败:', err.message);
      } else {
        console.log('访问城市表已创建或已存在');
      }
    });
    
    // 检查是否已存在用户，如果不存在则创建默认用户
    db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
      if (!err && row.count === 0) {
        // 创建默认用户 admin/123456
        bcrypt.hash('123456', 10, (err, hashedPassword) => {
          if (!err) {
            const createdAt = new Date().toISOString();
            db.run('INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)', 
              ['admin', hashedPassword, createdAt], 
              (err) => {
                if (err) {
                  console.error('创建默认用户失败:', err.message);
                } else {
                  console.log('已创建默认用户: admin/123456');
                }
              }
            );
          } else {
            console.error('加密默认用户密码失败:', err.message);
          }
        });
      }
    });
  });
}


// 用户相关操作
function createUser(username, password, callback) {
  const createdAt = new Date().toISOString();
  const sql = 'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)';
  db.run(sql, [username, password, createdAt], callback);
}

function findUserByUsername(username, callback) {
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], callback);
}

function findUserById(userId, callback) {
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.get(sql, [userId], callback);
}

/**
 * 更新用户密码
 * @param {number} userId - 用户ID
 * @param {string} newPassword - 新密码（已加密）
 * @param {function} callback - 回调函数
 */
function updateUserPassword(userId, newPassword, callback) {
  const sql = 'UPDATE users SET password = ? WHERE id = ?';
  db.run(sql, [newPassword, userId], callback);
}

// 分类相关操作
function getAllCategories(callback) {
  // 保持此函数用于系统初始化等场景
  const sql = 'SELECT * FROM categories ORDER BY name';
  db.all(sql, callback);
}

function getCategoriesByUser(userId, callback) {
  // 检查缓存
  const cacheKey = `categories_${userId}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return callback(null, cachedData);
  }
  
  const sql = 'SELECT * FROM categories WHERE user_id = ? ORDER BY created_at DESC';
  db.all(sql, [userId], (err, data) => {
    if (!err && data) {
      // 设置缓存
      setToCache(cacheKey, data);
    }
    callback(err, data);
  });
}

function createCategory(category, callback) {
  const createdAt = new Date().toISOString();
  const sql = 'INSERT INTO categories (id, name, user_id, created_at) VALUES (?, ?, ?, ?)';
  db.run(sql, [category.id, category.name, category.userId, createdAt], function(err) {
    if (!err) {
      // 失效相关用户的缓存
      cache.forEach((value, key) => {
        if (key.startsWith(`categories_${category.userId}`)) {
          cache.delete(key);
        }
      });
    }
    callback(err, this ? this.lastID : null);
  });
}

function updateCategory(id, userId, name, callback) {
  const sql = 'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?';
  db.run(sql, [name, id, userId], function(err) {
    if (!err) {
      // 失效相关用户的缓存
      cache.forEach((value, key) => {
        if (key.startsWith(`categories_${userId}`)) {
          cache.delete(key);
        }
      });
    }
    callback(err);
  });
}

function deleteCategory(id, userId, callback) {
  const sql = 'DELETE FROM categories WHERE id = ? AND user_id = ?';
  db.run(sql, [id, userId], function(err) {
    if (!err) {
      // 失效相关用户的缓存
      cache.forEach((value, key) => {
        if (key.startsWith(`categories_${userId}`)) {
          cache.delete(key);
        }
      });
    }
    callback(err);
  });
}

// 物品相关操作
function getAllItemsByUser(userId, callback) {
  // 检查缓存
  const cacheKey = `items_${userId}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return callback(null, cachedData);
  }
  
  const sql = 'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC';
  db.all(sql, [userId], (err, data) => {
    if (!err && data) {
      // 设置缓存
      setToCache(cacheKey, data);
    }
    callback(err, data);
  });
}

// 物品筛选查询
function getFilteredItemsByUser(userId, filters, callback) {
  // 筛选查询不使用缓存，因为参数可能经常变化
  let sql = 'SELECT * FROM items WHERE user_id = ?';
  const params = [userId];
  
  // 关键词搜索
  if (filters.keyword) {
    sql += ' AND name LIKE ?';
    params.push(`%${filters.keyword}%`);
  }
  
  // 分类筛选
  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }
  
  // 日期范围筛选
  if (filters.dateFrom) {
    sql += ' AND purchase_date >= ?';
    params.push(filters.dateFrom);
  }
  
  if (filters.dateTo) {
    sql += ' AND purchase_date <= ?';
    params.push(filters.dateTo);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  db.all(sql, params, callback);
}

function getItemByIdAndUser(itemId, userId, callback) {
  const sql = 'SELECT * FROM items WHERE id = ? AND user_id = ?';
  db.get(sql, [itemId, userId], callback);
}

function createItem(item, callback) {
  const createdAt = new Date().toISOString();
  const sql = `INSERT INTO items 
    (user_id, name, category, purchase_date, price, usage_count, last_used, value_tag, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [
    item.userId,
    item.name,
    item.category,
    item.purchaseDate,
    item.price || 0,
    item.usageCount || 0,
    item.lastUsed,
    item.valueTag || '',
    item.status || '未使用',
    createdAt
  ], function(err) {
    if (!err) {
      // 失效相关用户的缓存
      cache.forEach((value, key) => {
        if (key.startsWith(`items_${item.userId}`) || key.startsWith(`categories_${item.userId}`)) {
          cache.delete(key);
        }
      });
    }
    callback(err, this ? this.lastID : null);
  });
}

function updateItem(itemId, userId, item, callback) {
  // 构建动态SQL查询，只更新提供的字段
  let sql = 'UPDATE items SET ';
  const params = [];
  
  const fields = [];
  if (item.name !== undefined) {
    fields.push('name = ?');
    params.push(item.name);
  }
  if (item.category !== undefined) {
    fields.push('category = ?');
    params.push(item.category);
  }
  if (item.purchaseDate !== undefined) {
    fields.push('purchase_date = ?');
    params.push(item.purchaseDate);
  }
  if (item.price !== undefined) {
    fields.push('price = ?');
    params.push(item.price || 0);
  }
  if (item.usageCount !== undefined) {
    fields.push('usage_count = ?');
    params.push(item.usageCount || 0);
  }
  if (item.lastUsed !== undefined) {
    fields.push('last_used = ?');
    params.push(item.lastUsed);
  }
  if (item.valueTag !== undefined) {
    fields.push('value_tag = ?');
    params.push(item.valueTag || '');
  }
  if (item.status !== undefined) {
    fields.push('status = ?');
    params.push(item.status || '未使用');
  }
  
  if (fields.length === 0) {
    return callback(new Error('没有提供要更新的字段'));
  }
  
  sql += fields.join(', ') + ' WHERE id = ? AND user_id = ?';
  params.push(itemId, userId);
  
  db.run(sql, params, function(err) {
    if (!err) {
      // 失效相关用户的缓存
      cache.forEach((value, key) => {
        if (key.startsWith(`items_${userId}`) || key.startsWith(`categories_${userId}`)) {
          cache.delete(key);
        }
      });
    }
    callback(err);
  });
}

function deleteItem(itemId, userId, callback) {
  const sql = 'DELETE FROM items WHERE id = ? AND user_id = ?';
  db.run(sql, [itemId, userId], function(err) {
    if (!err) {
      // 失效相关用户的缓存
      cache.forEach((value, key) => {
        if (key.startsWith(`items_${userId}`) || key.startsWith(`categories_${userId}`)) {
          cache.delete(key);
        }
      });
    }
    callback(err);
  });
}

function incrementItemUsage(itemId, userId, callback) {
  const lastUsed = new Date().toISOString();
  const sql = 'UPDATE items SET usage_count = usage_count + 1, last_used = ? WHERE id = ? AND user_id = ?';
  db.run(sql, [lastUsed, itemId, userId], function(err) {
    if (!err) {
      // 失效相关用户的缓存
      cache.forEach((value, key) => {
        if (key.startsWith(`items_${userId}`)) {
          cache.delete(key);
        }
      });
    }
    callback(err);
  });
}

// 使用日志相关操作
function getAllLogsByUser(userId, callback) {
  const sql = 'SELECT * FROM usage_logs WHERE user_id = ? ORDER BY used_at DESC';
  db.all(sql, [userId], callback);
}

// 分页获取使用日志
function getLogsByUserWithPagination(userId, page, limit, callback) {
  const offset = (page - 1) * limit;
  const sql = `SELECT * FROM usage_logs 
               WHERE user_id = ? 
               ORDER BY used_at DESC 
               LIMIT ? OFFSET ?`;
  db.all(sql, [userId, limit, offset], callback);
}

// 分页获取使用日志（带关键词搜索）
function getLogsByUserWithPaginationAndKeyword(userId, keyword, page, limit, callback) {
  const offset = (page - 1) * limit;
  const sql = `SELECT * FROM usage_logs 
               WHERE user_id = ? AND item_name LIKE ?
               ORDER BY used_at DESC 
               LIMIT ? OFFSET ?`;
  db.all(sql, [userId, `%${keyword}%`, limit, offset], callback);
}

// 获取日志总数
function getLogsCountByUser(userId, callback) {
  const sql = 'SELECT COUNT(*) as count FROM usage_logs WHERE user_id = ?';
  db.get(sql, [userId], callback);
}

// 获取日志总数（带关键词搜索）
function getLogsCountByUserWithKeyword(userId, keyword, callback) {
  const sql = 'SELECT COUNT(*) as count FROM usage_logs WHERE user_id = ? AND item_name LIKE ?';
  db.get(sql, [userId, `%${keyword}%`], callback);
}

function createUsageLog(log, callback) {
  const usedAt = new Date().toISOString();
  const sql = 'INSERT INTO usage_logs (item_id, item_name, user_id, used_at, notes) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [log.itemId, log.itemName, log.userId, usedAt, log.notes || ''], callback);
}

// 运动目标相关操作
function getExerciseGoalsByUser(userId, callback) {
  const sql = `
    SELECT * FROM exercise_goals 
    WHERE user_id = ? OR visibility = 'public'
    ORDER BY created_at DESC`;
  db.all(sql, [userId], callback);
}

function getExerciseGoalById(id, userId, callback) {
  const sql = `
    SELECT * FROM exercise_goals 
    WHERE id = ? AND (user_id = ? OR visibility = 'public')`;
  db.get(sql, [id, userId], callback);
}

function createExerciseGoal(userId, goalData, callback) {
  const createdAt = new Date().toISOString();
  const sql = `INSERT INTO exercise_goals 
    (user_id, title, target, period, start_date, end_date, initial_weight, target_weight, current_weight, visibility, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    userId, 
    goalData.title, 
    goalData.target, 
    goalData.period, 
    goalData.startDate, 
    goalData.endDate,
    goalData.initialWeight,
    goalData.targetWeight,
    goalData.currentWeight,
    goalData.visibility || 'private', // 默认为私有
    createdAt
  ];
  db.run(sql, params, callback);
}

function updateExerciseGoal(id, userId, goalData, callback) {
  const sql = `UPDATE exercise_goals SET 
    title = ?, target = ?, start_date = ?, end_date = ?,
    target_weight = ?, current_weight = ?, visibility = ?
    WHERE id = ? AND user_id = ?`;
  const params = [
    goalData.title, 
    goalData.target, 
    goalData.startDate, 
    goalData.endDate,
    goalData.targetWeight,
    goalData.currentWeight,
    goalData.visibility || 'private', // 默认为私有
    id, 
    userId
  ];
  db.run(sql, params, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
}

function deleteExerciseGoal(id, userId, callback) {
  const sql = 'DELETE FROM exercise_goals WHERE id = ? AND user_id = ?';
  db.run(sql, [id, userId], function(err) {
    if (err) {
      return callback(err);
    }
    
    // 检查是否有行被删除
    if (this.changes === 0) {
      // 没有找到匹配的记录，可能是因为ID不存在或者user_id不匹配
      return callback(new Error('No matching record found'));
    }
    
    callback(null);
  });
}

function updateCurrentWeight(goalId, userId, currentWeight, callback) {
  const sql = 'UPDATE exercise_goals SET current_weight = ? WHERE id = ? AND user_id = ?';
  db.run(sql, [currentWeight, goalId, userId], callback);
}

// 运动记录相关操作
function getExerciseRecordsByUser(userId, callback) {
  const sql = `SELECT er.*, eg.title as goal_title FROM exercise_records er 
               JOIN exercise_goals eg ON er.goal_id = eg.id 
               WHERE er.user_id = ? OR eg.visibility = 'public'
               ORDER BY er.record_date DESC, er.created_at DESC`;
  db.all(sql, [userId], callback);
}

function getExerciseRecordsByGoal(goalId, userId, callback) {
  const sql = `SELECT er.*, eg.title as goal_title FROM exercise_records er 
               JOIN exercise_goals eg ON er.goal_id = eg.id 
               WHERE er.goal_id = ? AND (er.user_id = ? OR eg.visibility = 'public')
               ORDER BY er.record_date DESC, er.created_at DESC`;
  db.all(sql, [goalId, userId], callback);
}

function getExerciseRecordById(recordId, userId, callback) {
  const sql = 'SELECT * FROM exercise_records WHERE id = ? AND user_id = ?';
  db.get(sql, [recordId, userId], callback);
}

function createExerciseRecord(userId, recordData, callback) {
  const createdAt = new Date().toISOString();
  const sql = `INSERT INTO exercise_records 
    (user_id, goal_id, exercise_type, value, record_date, note, image_path, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    userId, 
    recordData.goalId, 
    recordData.exerciseType, 
    recordData.value, 
    recordData.recordDate,
    recordData.note,
    recordData.imagePath || null,
    createdAt
  ];
  db.run(sql, params, callback);
}

function updateExerciseRecord(recordId, userId, recordData, callback) {
  const sql = `UPDATE exercise_records SET 
    exercise_type = ?, value = ?, record_date = ?, note = ?, image_path = ?
    WHERE id = ? AND user_id = ?`;
  const params = [
    recordData.exerciseType,
    recordData.value,
    recordData.recordDate,
    recordData.note,
    recordData.imagePath || null,
    recordId,
    userId
  ];
  db.run(sql, params, function(err) {
    if (err) {
      return callback(err);
    }
    
    // 检查是否有行被更新
    if (this.changes === 0) {
      // 没有找到匹配的记录，可能是因为ID不存在或者user_id不匹配
      return callback(new Error('No matching record found'));
    }
    
    callback(null);
  });
}

function deleteExerciseRecord(recordId, userId, callback) {
  const sql = 'DELETE FROM exercise_records WHERE id = ? AND user_id = ?';
  db.run(sql, [recordId, userId], callback);
}

// 访问城市相关操作
function getVisitedCitiesByUser(userId, callback) {
  const sql = 'SELECT * FROM visited_cities WHERE user_id = ? ORDER BY visit_date DESC';
  db.all(sql, [userId], callback);
}

function getVisitedCityById(id, userId, callback) {
  const sql = 'SELECT * FROM visited_cities WHERE id = ? AND user_id = ?';
  db.get(sql, [id, userId], callback);
}

function getVisitedCityByCityId(cityId, userId, callback) {
  const sql = 'SELECT * FROM visited_cities WHERE city_id = ? AND user_id = ?';
  db.get(sql, [cityId, userId], callback);
}

function createVisitedCity(userId, cityData, callback) {
  const createdAt = new Date().toISOString();
  const sql = `INSERT INTO visited_cities 
    (user_id, city_id, city_name, visit_date, rating, notes, longitude, latitude, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    userId,
    cityData.cityId,
    cityData.cityName,
    cityData.visitDate,
    cityData.rating,
    cityData.notes,
    cityData.longitude ? parseFloat(cityData.longitude) : null,
    cityData.latitude ? parseFloat(cityData.latitude) : null,
    createdAt
  ];
  db.run(sql, params, callback);
}

function updateVisitedCity(id, userId, cityData, callback) {
  const sql = `UPDATE visited_cities SET 
    visit_date = ?, rating = ?, notes = ?, longitude = ?, latitude = ?
    WHERE id = ? AND user_id = ?`;
  const params = [
    cityData.visitDate,
    cityData.rating,
    cityData.notes,
    cityData.longitude ? parseFloat(cityData.longitude) : null,
    cityData.latitude ? parseFloat(cityData.latitude) : null,
    id,
    userId
  ];
  db.run(sql, params, callback);
}

function deleteVisitedCity(id, userId, callback) {
  const sql = 'DELETE FROM visited_cities WHERE id = ? AND user_id = ?';
  db.run(sql, [id, userId], callback);
}

module.exports = {
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
  getExerciseRecordById,
  createExerciseRecord,
  updateExerciseRecord,
  deleteExerciseRecord,
  getVisitedCitiesByUser,
  getVisitedCityById,
  getVisitedCityByCityId,
  createVisitedCity,
  updateVisitedCity,
  deleteVisitedCity
};