const sparkService = require('./services/sparkService');

// 测试数据
const testData = {
    totalRecords: 15,
    totalDistance: 42.5,
    exerciseTypeCount: 3,
    exerciseTypes: ['跑步', '游泳', '骑行'],
    goalProgress: 75.5,
    goalTarget: 50,
    goalAchieved: false,
    weightChange: -2.3,
    initialWeight: 70,
    currentWeight: 67.7,
    targetWeight: 65,
    distanceToTarget: 2.7
};

async function testSparkRecommendations() {
    console.log('开始测试讯飞星火运动建议生成功能...');
    
    if (!sparkService.isAvailable()) {
        console.log('❌ 讯飞星火服务不可用：API密钥未设置');
        return;
    }
    
    console.log('🔑 API密钥已设置');
    console.log('📡 正在调用讯飞星火API生成运动建议...');
    
    try {
        const recommendations = await sparkService.generateRecommendations(testData);
        console.log('✅ 讯飞星火API调用成功！');
        console.log('\n🤖 AI生成的运动建议:');
        recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });
    } catch (error) {
        console.log('❌ 讯飞星火API调用失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testSparkRecommendations();