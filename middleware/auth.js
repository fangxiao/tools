const jwt = require('jsonwebtoken');

// JWT密钥 - 在生产环境中必须使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-for-dev-only';

/**
 * 生成JWT令牌
 * @param {Object} user - 用户对象
 * @returns {String} JWT令牌
 */
function generateToken(user) {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username 
        }, 
        JWT_SECRET,
        { 
            expiresIn: process.env.NODE_ENV === 'production' ? '24h' : '7d'
        }
    );
}

/**
 * 认证中间件 - 验证用户是否已登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一步函数
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: '令牌已过期' });
            }
            return res.status(403).json({ error: '令牌无效' });
        }
        
        req.user = user;
        next();
    });
}

module.exports = {
    generateToken,
    authenticateToken
};