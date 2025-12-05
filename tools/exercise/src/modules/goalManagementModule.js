// 目标管理模块
const GoalManagementModule = (function() {
    let currentUser = null;
    
    // 初始化模块
    function initialize() {
        console.log('GoalManagementModule initialized');
    }
    
    // 设置当前用户
    function setCurrentUser(user) {
        currentUser = user;
    }
    
    // 获取目标列表
    function fetchGoals() {
        if (!currentUser) {
            console.log('No current user found');
            return Promise.reject(new Error('用户未登录'));
        }
        
        return fetch(`/api/exercise-goals?userId=${currentUser.id}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('获取目标列表失败');
                }
            })
            .catch(error => {
                console.error('获取目标列表时出错:', error);
                throw error;
            });
    }
    
    // 创建新目标
    function createGoal(goalData) {
        if (!currentUser) {
            console.log('No current user found');
            return Promise.reject(new Error('用户未登录'));
        }

        // 验证必要字段
        if (!goalData.title || isNaN(goalData.target) || !goalData.startDate || !goalData.endDate) {
            const errorMsg = '请填写所有必填字段';
            return Promise.reject(new Error(errorMsg));
        }

        // 发送到服务器
        return fetch(`/api/exercise-goals?userId=${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error || '创建目标失败');
                });
            }
        })
        .catch(error => {
            console.error('Error creating goal:', error);
            throw error;
        });
    }

    // 更新目标
    function updateGoal(goalId, goalData) {
        if (!currentUser) {
            console.log('No current user found');
            return Promise.reject(new Error('用户未登录'));
        }

        // 验证必要字段
        if (!goalData.title || isNaN(goalData.target) || !goalData.startDate || !goalData.endDate) {
            const errorMsg = '请填写所有必填字段';
            return Promise.reject(new Error(errorMsg));
        }

        // 发送到服务器
        return fetch(`/api/exercise-goals/${goalId}?userId=${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error || '更新目标失败');
                });
            }
        })
        .catch(error => {
            console.error('Error updating goal:', error);
            throw error;
        });
    }

    // 删除目标
    function deleteGoal(goalId) {
        console.log('Delete goal function called with ID:', goalId);
        
        if (!currentUser) {
            console.log('No current user found');
            return Promise.reject(new Error('用户未登录'));
        }
        
        if (!goalId) {
            console.log('No goal ID provided');
            return Promise.reject(new Error('目标ID无效'));
        }
        
        // 发送删除请求
        return fetch(`/api/exercise-goals/${goalId}?userId=${currentUser.id}`, {
            method: 'DELETE'
        })
        .then(response => {
            console.log('Delete response status:', response.status);
            // DELETE请求成功时可能返回200 OK或204 No Content
            if (response.ok || response.status === 204) {
                // 删除成功
                console.log('Delete successful');
                return { success: true };
            } else if (response.status === 404) {
                // 目标不存在
                console.log('Goal not found');
                throw new Error('找不到该运动目标');
            } else if (response.status === 403) {
                // 权限不足
                console.log('Permission denied');
                throw new Error('您没有权限删除该运动目标');
            } else {
                // 其他错误
                console.log('Other error occurred');
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('删除目标时出错:', error);
            throw error;
        });
    }
    
    // 计算目标进度
    function calculateGoalProgress(goal, records, exerciseTypes) {
        const goalRecords = records.filter(record => record.goal_id == goal.id);
        
        const current = goalRecords.reduce((sum, record) => {
            const exerciseType = exerciseTypes.find(type => type.id === record.exercise_type);
            if (!exerciseType) return sum;
            
            // 特殊转换规则
            if (exerciseType.unit === '小时') {
                // 特殊情况：游泳 1 小时 = 10 km
                if (exerciseType.id === 'swimming') {
                    return sum + (record.value * 10);
                } 
                // 默认情况：其他小时类活动 1 小时 = 5 km
                else {
                    return sum + (record.value * 5);
                }
            } 
            // 特殊情况：骑车 10 km = 5 km 目标
            else if (exerciseType.id === 'cycling') {
                return sum + (record.value * 0.5);
            } 
            // 默认情况：公里类活动
            else {
                return sum + record.value;
            }
        }, 0);
        
        return {
            current: current,
            target: goal.target,
            percentage: goal.target > 0 ? (current / goal.target) * 100 : 0,
            isCompleted: current >= goal.target
        };
    }
    
    // 计算时间进度
    function calculateTimeProgress(goal) {
        const startDate = new Date(goal.start_date);
        const endDate = new Date(goal.end_date);
        const currentDate = new Date();
        
        const actualCurrentDate = currentDate < startDate ? startDate : 
                                currentDate > endDate ? endDate : currentDate;
        
        const totalDuration = endDate - startDate;
        const elapsedDuration = actualCurrentDate - startDate;
        
        const percentage = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
        
        return {
            percentage: percentage
        };
    }
    
    // 获取周期文本
    function getPeriodText(period) {
        switch (period) {
            case 'none': return '无周期';
            case 'daily': return '每日';
            case 'weekly': return '每周';
            case 'monthly': return '每月';
            default: return period;
        }
    }
    
    // 获取目标状态徽章
    function getGoalStatusBadge(goal, calculateTimeProgress) {
        const currentDate = new Date();
        const endDate = new Date(goal.end_date);
        const progress = goal.progress;
        const timeProgress = calculateTimeProgress(goal);
        
        // 如果目标已完成（进度 >= 目标）
        if (progress.current >= goal.target) {
            return { type: 'completed', text: '已完成' };
        }
        
        // 如果当前日期已经超过结束日期且目标未完成
        if (currentDate > endDate && progress.current < goal.target) {
            return { type: 'failed', text: '未完成' };
        }
        
        // 目标正在进行中
        return null;
    }
    
    // 公共接口
    return {
        initialize,
        setCurrentUser,
        fetchGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        calculateGoalProgress,
        calculateTimeProgress,
        getPeriodText,
        getGoalStatusBadge
    };
})();

// 确保模块在全局范围内可用
console.log('Making GoalManagementModule globally available');
window.GoalManagementModule = GoalManagementModule;