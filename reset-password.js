const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 要重置密码的用户名
const username = 'fangxiao';
// 新密码
const newPassword = 'fangxiao';

// 哈希新密码
bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error('密码加密错误:', err);
    return;
  }
  
  // 更新用户密码
  const sql = 'UPDATE users SET password = ? WHERE username = ?';
  db.run(sql, [hashedPassword, username], function(err) {
    if (err) {
      console.error('更新密码失败:', err);
    } else if (this.changes > 0) {
      console.log(`用户 ${username} 的密码已成功重置`);
    } else {
      console.log(`未找到用户 ${username}`);
    }
    
    // 关闭数据库连接
    db.close();
  });
});