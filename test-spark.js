const sparkService = require('./services/sparkService');

async function testSparkAPI() {
    console.log('开始测试讯飞星火API...');
    
    if (!sparkService.isAvailable()) {
        console.log('❌ 讯飞星火API密钥未设置');
        return;
    }
    
    console.log('🔑 API密钥已设置');
    console.log('📡 正在调用讯飞星火API...');
    console.log('📍 API地址:', sparkService.apiUrl);
    console.log('🤖 模型:', sparkService.model);
    
    try {
        const result = await sparkService.testConnection();
        
        if (result.success) {
            console.log('✅ 讯飞星火API调用成功！');
            console.log('🤖 回复内容:');
            console.log(result.message);
        } else {
            console.log('❌ 讯飞星火API调用失败:', result.message);
            if (result.status) {
                console.log('响应状态:', result.status);
            }
            if (result.data) {
                console.log('响应数据:', JSON.stringify(result.data, null, 2));
            }
        }
    } catch (error) {
        console.log('❌ 讯飞星火API调用异常:', error.message);
    }
}

// 导出函数供其他模块使用
module.exports = { testSparkAPI };

// 如果直接运行此脚本，则执行测试
if (require.main === module) {
    testSparkAPI();
}