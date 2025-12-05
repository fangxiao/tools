// 运动目标模块
const GoalModule = (function() {
    // 初始化模块
    function initialize() {
        console.log('GoalModule initialized');
    }

    // 创建新目标
    function createGoal(goalData) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('No current user found');
            alert('用户未登录，请先登录');
            return Promise.reject(new Error('用户未登录'));
        }

        // 验证必要字段
        if (!goalData.title || isNaN(goalData.target) || !goalData.startDate || !goalData.endDate) {
            const errorMsg = '请填写所有必填字段';
            alert(errorMsg);
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
        .then(createdGoal => {
            // 更新UI
            window.displayGoals();
            alert('目标创建成功！');
            return createdGoal;
        })
        .catch(error => {
            console.error('Error creating goal:', error);
            alert(error.message || '创建目标失败');
            throw error;
        });
    }

    // 更新目标
    function updateGoal(goalId, goalData) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('No current user found');
            alert('用户未登录，请先登录');
            return Promise.reject(new Error('用户未登录'));
        }

        // 验证必要字段
        if (!goalData.title || isNaN(goalData.target) || !goalData.startDate || !goalData.endDate) {
            const errorMsg = '请填写所有必填字段';
            alert(errorMsg);
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
                // 更新UI
                window.displayGoals();
                alert('目标更新成功！');
                return response.json();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error || '更新目标失败');
                });
            }
        })
        .catch(error => {
            console.error('Error updating goal:', error);
            alert(error.message || '更新目标失败');
            throw error;
        });
    }

    // 删除目标
    function deleteGoal(goalId) {
        console.log('Delete goal function called with ID:', goalId);
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('Current user:', currentUser);
        
        if (!currentUser) {
            console.log('No current user found');
            alert('用户未登录，请先登录');
            return;
        }
        
        if (!goalId) {
            console.log('No goal ID provided');
            alert('目标ID无效');
            return;
        }
        
        // 使用浏览器内置的确认对话框
        console.log('Showing confirm dialog');
        const confirmed = confirm('确定要删除这个运动目标吗？此操作无法撤销。');
        console.log('User confirmed:', confirmed);
        
        if (confirmed) {
            // 用户确认删除
            console.log('Sending delete request for goal:', goalId);
            fetch(`/api/exercise-goals/${goalId}?userId=${currentUser.id}`, {
                method: 'DELETE'
                // 注意：这里不需要设置Content-Type头，因为没有发送数据体
            })
            .then(response => {
                console.log('Delete response status:', response.status);
                // DELETE请求成功时可能返回200 OK或204 No Content
                if (response.ok || response.status === 204) {
                    // 删除成功，重新加载目标列表
                    console.log('Delete successful, refreshing goals list');
                    window.displayGoals();
                    alert('运动目标已成功删除');
                } else if (response.status === 404) {
                    // 目标不存在
                    console.log('Goal not found');
                    alert('找不到该运动目标');
                } else if (response.status === 403) {
                    // 权限不足
                    console.log('Permission denied');
                    alert('您没有权限删除该运动目标');
                } else {
                    // 其他错误
                    console.log('Other error occurred');
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            })
            .catch(error => {
                console.error('删除目标时出错:', error);
                alert('无法删除运动目标，请稍后重试');
            });
        } else {
            console.log('User cancelled deletion');
        }
    }

    // 获取目标详情
    function getGoalDetails(goalId) {
        // 实现获取目标详情的逻辑
        console.log('Getting goal details:', goalId);
    }

    // 公共接口
    return {
        initialize,
        createGoal,
        updateGoal,
        deleteGoal,
        getGoalDetails
    };
})();

// 确保模块在全局范围内可用
console.log('Making GoalModule globally available');
window.GoalModule = GoalModule;