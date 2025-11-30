import requests
import os

def test_spark_api():
    url = "https://spark-api-open.xf-yun.com/v1/chat/completions"
    
    # 从环境变量获取API密钥，如果没有则使用默认值
    api_key = os.getenv('SPARK_API_KEY', 'hkkdhRUdnrXkkDtAMrFz:CKFQKyeLzhvXsyhggfOY')
    
    data = {
        "max_tokens": 4096,
        "top_k": 4,
        "temperature": 0.5,
        "messages": [
            {
                "role": "user",
                "content": "运动建议"
            }
        ],
        "model": "lite",
        "stream": False
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.encoding = "utf-8"
        
        if response.status_code == 200:
            print("✅ 讯飞星火API调用成功！")
            result = response.json()
            print("🤖 回复内容:")
            print(result['choices'][0]['message']['content'])
        else:
            print(f"❌ 讯飞星火API调用失败，状态码: {response.status_code}")
            print("响应内容:", response.text)
            
    except Exception as e:
        print(f"❌ 讯飞星火API调用异常: {str(e)}")

if __name__ == '__main__':
    print("开始测试讯飞星火API...")
    print("📍 API地址:", "https://spark-api-open.xf-yun.com/v1/chat/completions")
    print("🤖 模型: lite")
    test_spark_api()