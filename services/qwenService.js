const axios = require('axios');
require('dotenv').config();

class QwenService {
    constructor() {
        this.apiKey = process.env.QWEN_API_KEY;
        this.model = process.env.QWEN_MODEL || 'qwen-plus';
        this.apiUrl = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
        
        if (!this.apiKey) {
            console.warn('警告: QWEN_API_KEY 未设置，AI建议功能将不可用');
        }
    }
    
    /**
     * 检查服务是否可用
     */
    isAvailable() {
        return !!this.apiKey;
    }
    
    /**
     * 根据用户运动数据生成个性化建议
     * @param {Object} userData - 用户运动数据
     * @returns {Promise<Array>} 建议列表
     */
    async generateRecommendations(userData) {
        if (!this.isAvailable()) {
            return ['AI建议服务暂不可用'];
        }
        
        try {
            const prompt = this.constructPrompt(userData);
            
            const response = await axios.post(this.apiUrl, {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的运动健康顾问，根据用户提供的运动数据给出个性化建议。你的回答应该简洁明了，使用中文，每条建议不超过50个字。请以列表形式回复，每条建议占一行。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // 解析响应并提取建议
            const content = response.data.choices[0].message.content;
            return this.parseRecommendations(content);
        } catch (error) {
            console.error('Qwen API调用失败:', error.message);
            if (error.response) {
                console.error('响应状态:', error.response.status);
                console.error('响应数据:', error.response.data);
            }
            return ['暂时无法获取AI建议，请稍后再试'];
        }
    }
    
    /**
     * 构造提示词
     * @param {Object} userData - 用户运动数据
     * @returns {string} 构造的提示词
     */
    constructPrompt(userData) {
        let prompt = `根据以下运动数据为用户提供建议:\n`;
        
        if (userData.totalRecords !== undefined) {
            prompt += `- 本月运动次数: ${userData.totalRecords}次\n`;
        }
        
        if (userData.totalDistance !== undefined) {
            prompt += `- 本月运动距离: ${userData.totalDistance.toFixed(1)}km\n`;
        }
        
        if (userData.exerciseTypeCount !== undefined) {
            prompt += `- 运动类型数量: ${userData.exerciseTypeCount}种\n`;
        }
        
        if (userData.exerciseTypes && userData.exerciseTypes.length > 0) {
            prompt += `- 运动类型包括: ${userData.exerciseTypes.join(', ')}\n`;
        }
        
        if (userData.goalProgress !== undefined) {
            prompt += `- 目标完成率: ${userData.goalProgress.toFixed(1)}%\n`;
        }
        
        if (userData.goalTarget !== undefined) {
            prompt += `- 目标距离: ${userData.goalTarget}km\n`;
        }
        
        if (userData.goalAchieved !== undefined) {
            prompt += `- 目标是否完成: ${userData.goalAchieved ? '是' : '否'}\n`;
        }
        
        if (userData.weightChange !== undefined) {
            prompt += `- 体重变化: ${userData.weightChange > 0 ? '增加' : '减少'}${Math.abs(userData.weightChange).toFixed(1)}kg\n`;
        }
        
        if (userData.initialWeight !== undefined) {
            prompt += `- 初始体重: ${userData.initialWeight}kg\n`;
        }
        
        if (userData.currentWeight !== undefined) {
            prompt += `- 当前体重: ${userData.currentWeight}kg\n`;
        }
        
        if (userData.targetWeight !== undefined) {
            prompt += `- 目标体重: ${userData.targetWeight}kg\n`;
        }
        
        if (userData.distanceToTarget !== undefined) {
            prompt += `- 距离目标体重: ${userData.distanceToTarget.toFixed(1)}kg\n`;
        }
        
        prompt += '\n请根据这些数据提供3-5条个性化的运动建议:';
        
        return prompt;
    }
    
    /**
     * 解析AI返回的建议文本
     * @param {string} content - AI返回的内容
     * @returns {Array} 建议列表
     */
    parseRecommendations(content) {
        // 按行分割并清理空白行
        return content.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .slice(0, 5); // 最多返回5条建议
    }
}

module.exports = new QwenService();