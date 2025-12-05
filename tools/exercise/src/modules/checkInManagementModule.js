// 打卡管理模块
const CheckInManagementModule = (function() {
    let currentUser = null;
    let exerciseTypes = [
        { id: 'running', name: '跑步', unit: 'km' },
        { id: 'walking', name: '走路', unit: 'km' },
        { id: 'cycling', name: '骑车', unit: 'km' },
        { id: 'swimming', name: '游泳', unit: '小时' },
        { id: 'boxing', name: '拳击', unit: '小时' },
        { id: 'rowing', name: '划船', unit: 'km' },
        { id: 'climbing_stairs', name: '爬楼梯', unit: '小时' },
        { id: 'basketball', name: '篮球', unit: '小时' },
        { id: 'football', name: '足球', unit: '小时' },
        { id: 'badminton', name: '羽毛球', unit: '小时' },
        { id: 'table_tennis', name: '乒乓球', unit: '小时' },
        { id: 'tennis', name: '网球', unit: '小时' },
        { id: 'golf', name: '高尔夫', unit: '小时' },
        { id: 'billiards', name: '台球', unit: '小时' },
        { id: 'weight_lifting', name: '撸铁', unit: '小时' },
        { id: 'mountain_climbing', name: '登山', unit: 'km' }
    ];
    
    // 初始化模块
    function initialize() {
        console.log('CheckInManagementModule initialized');
    }
    
    // 设置当前用户
    function setCurrentUser(user) {
        currentUser = user;
    }
    
    // 提交打卡记录
    function submitCheckIn(recordData) {
        if (!currentUser) {
            return Promise.reject(new Error('用户未登录'));
        }
        
        // 验证必要字段
        if (!recordData.goalId || !recordData.exerciseType || !recordData.value || !recordData.recordDate) {
            return Promise.reject(new Error('请填写所有必填字段'));
        }
        
        const requestData = {
            goalId: recordData.goalId,
            exerciseType: recordData.exerciseType,
            value: recordData.value,
            recordDate: recordData.recordDate,
            note: recordData.note
        };
        
        // 发送到服务器
        return fetch(`/api/exercise-records?userId=${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error || '打卡失败');
                });
            }
        })
        .catch(error => {
            console.error('打卡时出错:', error);
            throw error;
        });
    }
    
    // 获取打卡明细
    function getCheckInDetails(goalId) {
        if (!currentUser) {
            return Promise.reject(new Error('用户未登录'));
        }
        
        return fetch(`/api/exercise-records/goal/${goalId}?userId=${currentUser.id}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('获取打卡记录失败');
                }
            })
            .catch(error => {
                console.error('获取打卡明细时出错:', error);
                throw error;
            });
    }
    
    // 获取记录详情
    function getRecordDetails(recordId) {
        if (!currentUser) {
            return Promise.reject(new Error('用户未登录'));
        }
        
        return fetch(`/api/exercise-records/single/${recordId}?userId=${currentUser.id}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('获取记录详情失败');
                }
            })
            .catch(error => {
                console.error('获取记录详情时出错:', error);
                throw error;
            });
    }
    
    // 更新记录
    function updateRecord(recordId, recordData) {
        if (!currentUser) {
            return Promise.reject(new Error('用户未登录'));
        }
        
        // 验证必要字段
        if (!recordData.exerciseType || !recordData.value || !recordData.recordDate) {
            return Promise.reject(new Error('请填写所有必填字段'));
        }
        
        const requestData = {
            exerciseType: recordData.exerciseType,
            value: recordData.value,
            recordDate: recordData.recordDate,
            note: recordData.note
        };
        
        // 发送到服务器
        return fetch(`/api/exercise-records/${recordId}?userId=${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error || '更新记录失败');
                });
            }
        })
        .catch(error => {
            console.error('更新记录时出错:', error);
            throw error;
        });
    }
    
    // 删除记录
    function deleteRecord(recordId) {
        if (!currentUser) {
            return Promise.reject(new Error('用户未登录'));
        }
        
        return fetch(`/api/exercise-records/${recordId}?userId=${currentUser.id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                return { success: true };
            } else {
                throw new Error('删除记录失败');
            }
        })
        .catch(error => {
            console.error('删除记录时出错:', error);
            throw error;
        });
    }
    
    // 更新目标体重
    function updateGoalWeight(goalId, weight) {
        if (!currentUser) {
            return Promise.reject(new Error('用户未登录'));
        }
        
        return fetch(`/api/exercise-goals/${goalId}/weight?userId=${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentWeight: weight })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('更新目标体重失败');
            }
        })
        .catch(error => {
            console.error('更新目标体重时出错:', error);
            throw error;
        });
    }
    
    // 计算每日总计
    function calculateDailyTotal(records) {
        return records.reduce((total, record) => {
            const exerciseType = exerciseTypes.find(type => type.id === record.exercise_type);
            if (!exerciseType) return total;
            
            // 应用相同的转换规则
            if (exerciseType.unit === '小时') {
                // 特殊情况：游泳 1 小时 = 10 km
                if (exerciseType.id === 'swimming') {
                    return total + (record.value * 10);
                } 
                // 默认情况：其他小时类活动 1 小时 = 5 km
                else {
                    return total + (record.value * 5);
                }
            } 
            // 特殊情况：骑车 10 km = 5 km 目标
            else if (exerciseType.id === 'cycling') {
                return total + (record.value * 0.5);
            } 
            // 默认情况：公里类活动
            else {
                return total + record.value;
            }
        }, 0);
    }
    
    // 公共接口
    return {
        initialize,
        setCurrentUser,
        submitCheckIn,
        getCheckInDetails,
        getRecordDetails,
        updateRecord,
        deleteRecord,
        updateGoalWeight,
        calculateDailyTotal
    };
})();

// 确保模块在全局范围内可用
console.log('Making CheckInManagementModule globally available');
window.CheckInManagementModule = CheckInManagementModule;