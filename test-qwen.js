const axios = require('axios');
require('dotenv').config();

async function testQwenAPI() {
    const apiKey = process.env.QWEN_API_KEY;
    const model = process.env.QWEN_MODEL || 'qwen-plus';
    const apiUrl = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    
    if (!apiKey) {
        console.log('❌ Qwen API密钥未设置');
        return;
    }
    
    console.log('开始测试Qwen API...');
    console.log('🔑 API密钥已设置');
    console.log('📡 正在调用Qwen API...');
    console.log('📍 API地址:', apiUrl);
    console.log('🤖 模型:', model);
    
    try {
        const response = await axios.post(apiUrl, {
            model: model,
            messages: [
                {
                    role: "system",
                    content: "你是一个专业的运动健康顾问，根据用户提供的运动数据给出个性化建议。"
                },
                {
                    role: "user",
                    content: "你是谁？"
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Qwen API调用成功！');
        console.log('🤖 回复内容:');
        console.log(response.data.choices[0].message.content);
    } catch (error) {
        console.log('❌ Qwen API调用失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testQwenAPI();