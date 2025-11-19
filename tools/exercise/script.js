document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!checkAuth()) {
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Add event listener for back to tools button
    const backToToolsBtn = document.getElementById('back-to-tools');
    if (backToToolsBtn) {
        backToToolsBtn.addEventListener('click', function() {
            window.location.href = '/index.html';
        });
    }

    // Display username
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.username;
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
    
    // Create custom modal functions
    function showCustomModal(title, content, type = 'info', confirmText = '确定', onConfirm = null) {
        // Remove any existing modals
        const existingModal = document.querySelector('.custom-modal-overlay');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        
        // Determine icon based on type
        let iconHtml = '';
        switch(type) {
            case 'success':
                iconHtml = '<i class="modal-icon success">✓</i>';
                break;
            case 'error':
                iconHtml = '<i class="modal-icon error">✗</i>';
                break;
            case 'warning':
                iconHtml = '<i class="modal-icon warning">!</i>';
                break;
            default:
                iconHtml = '<i class="modal-icon info">i</i>';
        }
        
        // Create modal
        overlay.innerHTML = `
            <div class="custom-modal">
                <div class="modal-header">
                    ${iconHtml}
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeCustomModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${content}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-confirm ${type}" onclick="handleModalConfirm(${onConfirm ? 'true' : 'false'})">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Store callback function
        overlay.dataset.onConfirm = onConfirm ? 'true' : 'false';
        
        // Close on overlay click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeCustomModal();
            }
        });
    }
    
    function showCustomConfirm(title, content, onConfirm, cancelText = '取消', confirmText = '确定') {
        // Remove any existing modals
        const existingModal = document.querySelector('.custom-modal-overlay');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        
        // Create modal with confirm buttons
        overlay.innerHTML = `
            <div class="custom-modal">
                <div class="modal-header">
                    <i class="modal-icon warning">?</i>
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeCustomModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${content}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="closeCustomModal()">${cancelText}</button>
                    <button class="btn-confirm warning" onclick="handleModalConfirm(true)">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Store callback function
        overlay.dataset.onConfirm = 'true';
        overlay.dataset.confirmCallback = JSON.stringify(onConfirm.toString());
        
        // Close on overlay click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeCustomModal();
            }
        });
    }
    
    window.closeCustomModal = function() {
        const modal = document.querySelector('.custom-modal-overlay');
        if (modal) {
            document.body.removeChild(modal);
        }
    };
    
    window.handleModalConfirm = function(shouldConfirm) {
        const modal = document.querySelector('.custom-modal-overlay');
        if (modal && shouldConfirm && modal.dataset.confirmCallback) {
            try {
                // Extract and execute the callback function
                eval('(' + modal.dataset.confirmCallback + ')')();
            } catch (e) {
                console.error('Error executing confirm callback:', e);
            }
        }
        closeCustomModal();
    };

    // Initialize the exercise types (global, maintained by admin)
    const exerciseTypes = [
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

    // Get DOM elements
    const goalForm = document.getElementById('goal-form');
    const goalsList = document.getElementById('goals-list');
    const goalPeriodSelect = document.getElementById('goal-period');
    const goalTitleInput = document.getElementById('goal-title');
    const goalTargetInput = document.getElementById('goal-target');
    const goalStartDateInput = document.getElementById('goal-start-date');
    const goalEndDateInput = document.getElementById('goal-end-date');
    const initialWeightInput = document.getElementById('initial-weight');
    const targetWeightInput = document.getElementById('target-weight');
    const currentWeightInput = document.getElementById('current-weight');

    // Check if all required elements exist
    if (!goalForm || !goalsList || !goalPeriodSelect || !goalTitleInput || 
        !goalTargetInput || !goalStartDateInput || !goalEndDateInput) {
        console.error('Some required DOM elements are missing');
        return;
    }

    // Initialize date fields
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Set default dates for monthly goal
    if (goalStartDateInput && goalEndDateInput) {
        goalStartDateInput.value = firstDayOfMonth.toISOString().split('T')[0];
        goalEndDateInput.value = lastDayOfMonth.toISOString().split('T')[0];
    }
    
    // Set default title for monthly goal
    updateGoalTitle();
    
    // Custom alert function
    function showAlert(message, type = 'info') {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            document.body.removeChild(existingAlert);
        }
        
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `custom-alert custom-alert-${type}`;
        alertElement.innerHTML = `
            <div class="custom-alert-content">
                <span class="custom-alert-message">${message}</span>
                <button class="custom-alert-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(alertElement);
        
        // Add close event
        alertElement.querySelector('.custom-alert-close').addEventListener('click', function() {
            document.body.removeChild(alertElement);
        });
        
        // Auto close after 3 seconds
        setTimeout(() => {
            if (document.body.contains(alertElement)) {
                document.body.removeChild(alertElement);
            }
        }, 3000);
    }
    
    // Custom confirm function
    function showConfirm(message, callback) {
        // Remove any existing confirms
        const existingConfirm = document.querySelector('.custom-confirm');
        if (existingConfirm) {
            document.body.removeChild(existingConfirm);
        }
        
        // Create confirm element
        const confirmElement = document.createElement('div');
        confirmElement.className = 'custom-confirm-overlay';
        confirmElement.innerHTML = `
            <div class="custom-confirm">
                <div class="custom-confirm-content">
                    <p>${message}</p>
                    <div class="custom-confirm-buttons">
                        <button class="btn-confirm-yes">确定</button>
                        <button class="btn-confirm-no">取消</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmElement);
        
        // Add event listeners
        confirmElement.querySelector('.btn-confirm-yes').addEventListener('click', function() {
            document.body.removeChild(confirmElement);
            callback(true);
        });
        
        confirmElement.querySelector('.btn-confirm-no').addEventListener('click', function() {
            document.body.removeChild(confirmElement);
            callback(false);
        });
    }
    
    // Update date fields based on selected period
    function updateDateFields() {
        const period = goalPeriodSelect.value;
        const today = new Date();
        
        let startDate, endDate;
        
        switch (period) {
            case 'monthly':
                // First day of current month to last day of current month
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'weekly':
                // First day of current week (Monday) to last day of current week (Sunday)
                const dayOfWeek = today.getDay();
                const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Sunday (0) to Monday
                startDate = new Date(today);
                startDate.setDate(today.getDate() - diffToMonday);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                break;
            case 'daily':
                // Today only
                startDate = new Date(today);
                endDate = new Date(today);
                break;
            default:
                // For 'none' period, keep current values or set to today
                if (goalStartDateInput.value && goalEndDateInput.value) {
                    return; // Keep existing values
                }
                startDate = new Date(today);
                endDate = new Date(today);
        }
        
        // Format dates as YYYY-MM-DD
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        if (goalStartDateInput) {
            goalStartDateInput.value = formatDate(startDate);
        }
        if (goalEndDateInput) {
            goalEndDateInput.value = formatDate(endDate);
        }
        
        // Update the goal title when period changes
        updateGoalTitle();
    }

    // Update goal title based on selected period
    function updateGoalTitle() {
        const period = goalPeriodSelect.value;
        const today = new Date();
        
        switch (period) {
            case 'none':
                goalTitleInput.value = '自定义运动目标';
                break;
            case 'monthly':
                goalTitleInput.value = `${today.getFullYear()}年${today.getMonth() + 1}月运动目标`;
                break;
            case 'weekly':
                // Get the week number
                const weekNumber = getWeekNumber(today);
                goalTitleInput.value = `${today.getFullYear()}年第${weekNumber}周运动目标`;
                break;
            case 'daily':
                goalTitleInput.value = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日运动目标`;
                break;
        }
    }

    // Get week number of the year
    function getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    // Display goals
    function displayGoals() {
        fetch(`/api/exercise-goals?userId=${currentUser.id}`)
            .then(response => response.json())
            .then(goals => {
                console.log('Goals loaded:', goals);
                
                goalsList.innerHTML = '';
                
                if (goals.length === 0) {
                    goalsList.innerHTML = '<div class="no-goals">暂无运动目标，请添加一个目标。</div>';
                    return;
                }
                
                // Get all records for progress calculation
                fetch(`/api/exercise-records?userId=${currentUser.id}`)
                    .then(response => response.json())
                    .then(records => {
                        console.log('Records loaded:', records);
                        
                        goals.forEach(goal => {
                            // Calculate progress
                            const progress = calculateGoalProgress(goal, records);
                            const timeProgress = calculateTimeProgress(goal);
                            
                            // Check goal status
                            const goalStatus = getGoalStatus(goal, progress, timeProgress);
                            
                            const goalElement = document.createElement('div');
                            goalElement.className = 'goal-card';
                            goalElement.innerHTML = `
                                <div class="goal-header">
                                    <div class="goal-title">${goal.title}</div>
                                    ${goalStatus === 'completed' ? '<div class="goal-badge goal-badge-completed">已完成</div>' : ''}
                                    ${goalStatus === 'failed' ? '<div class="goal-badge goal-badge-failed">未完成</div>' : ''}
                                    ${progress.percentage >= 100 ? '<div class="stamp stamp-goal-completed">运动完成</div>' : ''}
                                    ${(goal.initial_weight && goal.current_weight && goal.target_weight) && 
                                     ((Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100) >= 100 ? 
                                     '<div class="stamp stamp-weight-goal-completed">体重完成</div>' : ''}
                                </div>
                                <div class="goal-details">
                                    <div class="detail-row">
                                        <div class="detail-label">目标量:</div>
                                        <div class="detail-value">${goal.target} km</div>
                                    </div>
                                    
                                    <div class="detail-row">
                                        <div class="detail-label">时间范围:</div>
                                        <div class="detail-value">${goal.start_date} 至 ${goal.end_date}</div>
                                    </div>
                                    
                                    ${(goal.initial_weight || goal.current_weight || goal.target_weight) ? `
                                    <div class="detail-row">
                                        <div class="detail-label">体重信息:</div>
                                        <div class="detail-value">
                                            ${goal.initial_weight ? `初始: ${goal.initial_weight}kg` : ''}
                                            ${goal.current_weight ? ` 当前: ${goal.current_weight}kg` : ''}
                                            ${goal.target_weight ? ` 目标: ${goal.target_weight}kg` : ''}
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                                <div class="goal-progress">
                                    <div class="goal-progress-section">
                                        <div class="goal-progress-text">运动进度: ${progress.current.toFixed(1)} / ${progress.target} km (${progress.percentage.toFixed(1)}%)</div>
                                        <div class="goal-progress-bar">
                                            <div class="goal-progress-fill" style="width: ${Math.min(progress.percentage, 100)}%"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="goal-progress-section">
                                        <div class="goal-progress-text">时间进度: ${timeProgress.percentage.toFixed(1)}%</div>
                                        <div class="goal-progress-bar">
                                            <div class="goal-progress-fill" style="width: ${Math.min(timeProgress.percentage, 100)}%; background-color: #3498db"></div>
                                        </div>
                                    </div>
                                    
                                    <!-- 体重目标进度展示 -->
                                    ${(goal.initial_weight && goal.current_weight && goal.target_weight) ? `
                                    <div class="goal-progress-section">
                                        <div class="goal-progress-text">体重进度: ${((Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100).toFixed(1)}%</div>
                                        <div class="goal-progress-bar">
                                            <div class="goal-progress-fill" style="width: ${Math.min(100, (Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100)}%; background-color: ${goal.initial_weight > goal.target_weight ? (goal.current_weight <= goal.target_weight ? '#2ecc71' : '#e74c3c') : (goal.current_weight >= goal.target_weight ? '#2ecc71' : '#e74c3c')}"></div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    
                                    ${progress.percentage < timeProgress.percentage ? 
                                        '<div class="reminder-banner">💡 运动进度落后于时间进度，加油运动吧！</div>' : ''}
                                    
                                    <!-- 目标完成状态提示 -->
                                    <div class="goal-status-text">
                                        ${progress.percentage >= 100 ? '🎉 目标已完成!' : 
                                          progress.percentage >= 80 ? '💪 快完成目标了!' : 
                                          progress.percentage >= 50 ? '👍 已完成一半以上!' : 
                                          progress.percentage >= 30 ? '🏃‍♂️ 加油，继续努力!' : 
                                          '🚀 仍需努力，继续加油!'}
                                    </div>
                                </div>
                                <div class="goal-actions">
                                    <button class="btn-use" onclick="showCheckInModal(${goal.id})">打卡</button>
                                    <button class="btn-details" onclick="showDetailsModal(${goal.id})">打卡明细</button>
                                    <button class="btn-summary" onclick="showGoalSummary(${goal.id})">汇总</button>
                                    <button class="btn-edit" onclick="showEditGoalModal(${goal.id})">编辑</button>
                                    <button class="btn-delete" onclick="deleteGoal(${goal.id})">删除</button>
                                </div>
                            `;
                            goalsList.appendChild(goalElement);
                        });
                    })
                    .catch(error => {
                        console.error('Error loading records:', error);
                        showAlert('加载运动记录失败', 'error');
                    });
            })
            .catch(error => {
                console.error('Error loading goals:', error);
                showAlert('加载运动目标失败', 'error');
            });
    }

    // Get goal status
    function getGoalStatus(goal, progress, timeProgress) {
        const currentDate = new Date();
        const endDate = new Date(goal.end_date);
        
        // If goal is completed (progress >= target)
        if (progress.current >= goal.target) {
            return 'completed';
        }
        
        // If current date is after the end date and goal is not completed
        if (currentDate > endDate && progress.current < goal.target) {
            return 'failed';
        }
        
        // Goal is in progress
        return 'in-progress';
    }

    // Calculate goal progress
    function calculateGoalProgress(goal, records) {
        const recordsForGoal = records.filter(record => record.goal_id == goal.id);
        const current = recordsForGoal.reduce((sum, record) => {
            // Count all exercises as km for progress calculation with conversion rules
            const exerciseType = exerciseTypes.find(type => type.id === record.exercise_type);
            
            // Apply conversion rules:
            // 1. For hour-based activities: 1 hour = 5 km
            // 2. Special case for swimming: 1 hour = 10 km
            // 3. Special case for cycling: 10 km cycling = 5 km target
            if (exerciseType) {
                if (exerciseType.unit === '小时') {
                    // Special case for swimming
                    if (exerciseType.id === 'swimming') {
                        return sum + (record.value * 10); // 1 hour = 10 km
                    } 
                    // Default for other hour-based activities
                    else {
                        return sum + (record.value * 5); // 1 hour = 5 km
                    }
                } 
                // Special case for cycling
                else if (exerciseType.id === 'cycling') {
                    return sum + (record.value * 0.5); // 10 km cycling = 5 km target
                } 
                // Default for km-based activities
                else {
                    return sum + record.value;
                }
            }
            return sum;
        }, 0);
        
        return {
            current: current,
            target: goal.target,
            percentage: goal.target > 0 ? (current / goal.target) * 100 : 0
        };
    }

    // Calculate time progress
    function calculateTimeProgress(goal) {
        const startDate = new Date(goal.start_date);
        const endDate = new Date(goal.end_date);
        const currentDate = new Date();
        
        // Ensure current date is within the goal period
        const actualCurrentDate = currentDate < startDate ? startDate : 
                                 currentDate > endDate ? endDate : currentDate;
        
        const totalDuration = endDate - startDate;
        const elapsedDuration = actualCurrentDate - startDate;
        
        const percentage = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
        
        return {
            percentage: percentage
        };
    }

    // Get period text for display
    function getPeriodText(period) {
        switch (period) {
            case 'none': return '无周期';
            case 'daily': return '每日';
            case 'weekly': return '每周';
            case 'monthly': return '每月';
            default: return period;
        }
    }

    // Show check-in modal
    window.showCheckInModal = function(goalId) {
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Load goals to find the selected goal
        fetch(`/api/exercise-goals?userId=${currentUser.id}`)
            .then(response => response.json())
            .then(goals => {
                const goal = goals.find(g => g.id == goalId);
                if (!goal) {
                    showAlert('未找到目标', 'error');
                    return;
                }
                
                // Create modal
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                
                modal.innerHTML = `
                    <div class="modal">
                        <div class="modal-header">
                            <h3>运动打卡 - ${goal.title}</h3>
                            <button class="modal-close" onclick="closeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="checkin-form">
                                <input type="hidden" id="checkin-goal-id" value="${goalId}">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="checkin-exercise-type">运动类别：</label>
                                        <select id="checkin-exercise-type" required>
                                            <option value="">选择运动类别</option>
                                            ${exerciseTypes.map(type => 
                                                `<option value="${type.id}">${type.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="checkin-value">运动量：</label>
                                        <input type="number" id="checkin-value" step="0.1" min="0" required>
                                        <span id="checkin-unit">km</span>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="checkin-weight">当前体重 (kg)：</label>
                                        <input type="number" id="checkin-weight" step="0.1" min="0" 
                                            ${goal.current_weight ? `value="${goal.current_weight}"` : ''}>
                                    </div>
                                    <div class="form-group">
                                        <label for="checkin-date">日期：</label>
                                        <input type="date" id="checkin-date" value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="checkin-image">打卡截图（可选）：</label>
                                        <input type="file" id="checkin-image" accept="image/*">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="checkin-note">备注（可选）：</label>
                                        <input type="text" id="checkin-note">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <button type="submit" class="btn-add">完成打卡</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Add event listener to update unit when exercise type changes
                const exerciseTypeSelect = document.getElementById('checkin-exercise-type');
                const unitSpan = document.getElementById('checkin-unit');
                
                if (exerciseTypeSelect && unitSpan) {
                    exerciseTypeSelect.addEventListener('change', function() {
                        const selectedType = exerciseTypes.find(type => type.id === this.value);
                        if (selectedType) {
                            unitSpan.textContent = selectedType.unit;
                        } else {
                            unitSpan.textContent = 'km';
                        }
                    });
                }
                
                // Add form submission handler
                const checkinForm = document.getElementById('checkin-form');
                if (checkinForm) {
                    checkinForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        saveCheckIn();
                    });
                }
            })
            .catch(error => {
                console.error('Error loading goals:', error);
                showAlert('加载运动目标失败', 'error');
            });
    };

    // Show details modal
    window.showDetailsModal = function(goalId) {
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        
        // Load goals to find the selected goal
        fetch(`/api/exercise-goals?userId=${currentUser.id}`)
            .then(response => response.json())
            .then(goals => {
                const goal = goals.find(g => g.id == goalId);
                if (!goal) {
                    showAlert('未找到目标', 'error');
                    return;
                }
                
                // Get records for this goal
                fetch(`/api/exercise-records/goal/${goalId}?userId=${currentUser.id}`)
                    .then(response => response.json())
                    .then(records => {
                        // Group records by date
                        const recordsByDate = {};
                        records.forEach(record => {
                            if (!recordsByDate[record.record_date]) {
                                recordsByDate[record.record_date] = [];
                            }
                            recordsByDate[record.record_date].push(record);
                        });
                        
                        // Generate details HTML
                        let detailsHTML = '';
                        Object.keys(recordsByDate).sort().reverse().forEach(date => {
                            const dailyRecords = recordsByDate[date];
                            let dailyTotal = 0;
                            
                            // Calculate daily total
                            dailyRecords.forEach(record => {
                                const exerciseType = exerciseTypes.find(type => type.id === record.exercise_type);
                                if (exerciseType) {
                                    dailyTotal += record.value;
                                }
                            });
                            
                            detailsHTML += `
                                <div class="detail-date-section">
                                    <div class="detail-date-header">
                                        <h4>${date} (总计: ${dailyTotal.toFixed(1)} km)</h4>
                                    </div>
                                    <div class="detail-date-records">
                            `;
                            
                            dailyRecords.forEach(record => {
                                const exerciseType = exerciseTypes.find(type => type.id === record.exercise_type);
                                const typeName = exerciseType ? exerciseType.name : '未知类型';
                                const unit = exerciseType ? exerciseType.unit : 'km';
                                
                                detailsHTML += `
                                    <div class="detail-record">
                                        <div class="detail-record-info">
                                            <div class="detail-record-type">${typeName}</div>
                                            <div class="detail-record-value">${record.value} ${unit}</div>
                                        </div>
                                        ${record.note ? `<div class="detail-record-note">${record.note}</div>` : ''}
                                    </div>
                                `;
                            });
                            
                            detailsHTML += `
                                    </div>
                                </div>
                            `;
                        });
                        
                        if (detailsHTML === '') {
                            detailsHTML = '<div class="no-records">暂无打卡记录</div>';
                        }
                        
                        // Create modal
                        const modal = document.createElement('div');
                        modal.className = 'modal-overlay';
                        
                        modal.innerHTML = `
                            <div class="modal">
                                <div class="modal-header">
                                    <h3>打卡明细 - ${goal.title}</h3>
                                    <button class="modal-close" onclick="closeModal()">&times;</button>
                                </div>
                                <div class="modal-body">
                                    ${detailsHTML}
                                </div>
                            </div>
                        `;
                        
                        document.body.appendChild(modal);
                    })
                    .catch(error => {
                        console.error('Error loading records:', error);
                        showAlert('加载运动记录失败', 'error');
                    });
            })
            .catch(error => {
                console.error('Error loading goals:', error);
                showAlert('加载运动目标失败', 'error');
            });
    };

    // Close modal
    window.closeModal = function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            document.body.removeChild(modal);
        }
    };

    // Delete goal
    window.deleteGoal = function(goalId) {
        showConfirm('确定要删除这个运动目标吗？\n注意：删除目标会同时删除所有相关的打卡记录，此操作不可恢复！', function(confirmed) {
            if (confirmed) {
                fetch(`/api/exercise-goals/${goalId}?userId=${currentUser.id}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        // Refresh display
                        displayGoals();
                        showAlert('目标删除成功！', 'success');
                    } else {
                        throw new Error('删除失败');
                    }
                })
                .catch(error => {
                    console.error('Error deleting goal:', error);
                    showAlert('删除目标失败', 'error');
                });
            }
        });
    };

    // Save check-in
    function saveCheckIn() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const goalId = document.getElementById('checkin-goal-id')?.value;
        const exerciseType = document.getElementById('checkin-exercise-type')?.value;
        const value = parseFloat(document.getElementById('checkin-value')?.value);
        const weight = parseFloat(document.getElementById('checkin-weight')?.value);
        const date = document.getElementById('checkin-date')?.value;
        const note = document.getElementById('checkin-note')?.value;
        const imageInput = document.getElementById('checkin-image');
        
        if (!exerciseType || isNaN(value)) {
            showAlert('请填写完整的运动信息', 'error');
            return;
        }
        
        // Create record data
        const recordData = {
            goalId: parseInt(goalId),
            exerciseType: exerciseType,
            value: value,
            recordDate: date,
            note: note
        };
        
        // Send record to server
        fetch(`/api/exercise-records?userId=${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recordData)
        })
        .then(response => {
            if (response.ok) {
                // If weight is provided, update the goal's current weight
                if (!isNaN(weight)) {
                    return fetch(`/api/exercise-goals/${goalId}/weight?userId=${currentUser.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ currentWeight: weight })
                    });
                }
                return Promise.resolve();
            } else {
                throw new Error('打卡失败');
            }
        })
        .then(response => {
            if (!response || response.ok) {
                // Close modal
                closeModal();
                
                // Refresh display
                displayGoals();
                
                showAlert('打卡成功！', 'success');
            } else {
                throw new Error('更新体重失败');
            }
        })
        .catch(error => {
            console.error('Error saving check-in:', error);
            showAlert('打卡失败', 'error');
        });
    }

    // Add event listeners for period change
    if (goalPeriodSelect) {
        goalPeriodSelect.addEventListener('change', function() {
            updateDateFields();
            updateGoalTitle();
        });
    }

    // Add event listener for summary button
    const summaryBtn = document.getElementById('summary-btn');
    if (summaryBtn) {
        summaryBtn.addEventListener('click', function() {
            showMonthlySummary();
        });
    }

    // Goal form submission
    if (goalForm) {
        goalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const period = document.getElementById('goal-period')?.value;
            
            const goalData = {
                title: document.getElementById('goal-title')?.value,
                target: parseFloat(document.getElementById('goal-target')?.value),
                period: period,
                startDate: document.getElementById('goal-start-date')?.value,
                endDate: document.getElementById('goal-end-date')?.value,
                initialWeight: parseFloat(document.getElementById('initial-weight')?.value) || null,
                targetWeight: parseFloat(document.getElementById('target-weight')?.value) || null,
                currentWeight: parseFloat(document.getElementById('current-weight')?.value) || null
            };
            
            // Validate required fields
            if (!goalData.title || isNaN(goalData.target) || !goalData.startDate || !goalData.endDate) {
                showAlert('请填写所有必填字段', 'error');
                return;
            }
            
            // Check for duplicate titles
            fetch(`/api/exercise-goals?userId=${currentUser.id}`)
                .then(response => response.json())
                .then(goals => {
                    const isDuplicate = goals.some(goal => goal.title === goalData.title);
                    if (isDuplicate) {
                        showAlert('目标标题已存在，请使用其他标题', 'error');
                        return;
                    }
                    
                    // Send to server
                    fetch(`/api/exercise-goals?userId=${currentUser.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(goalData)
                    })
                    .then(response => {
                        if (response.ok) {
                            // Update UI
                            displayGoals();
                            
                            // Reset form but keep the date logic
                            if (document.getElementById('goal-target')) {
                                document.getElementById('goal-target').value = '';
                            }
                            updateDateFields();
                            
                            showAlert('目标创建成功！', 'success');
                        } else {
                            return response.json().then(data => {
                                throw new Error(data.error || '创建目标失败');
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error creating goal:', error);
                        showAlert(error.message || '创建目标失败', 'error');
                    });
                })
                .catch(error => {
                    console.error('Error checking duplicate titles:', error);
                    showAlert('检查标题重复时出错', 'error');
                });
        });
    }

    // Show monthly summary
    function showMonthlySummary() {
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Get current month and year
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const monthName = `${currentYear}年${now.getMonth() + 1}月`;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        // Load all goals and records for analysis
        Promise.all([
            fetch(`/api/exercise-goals?userId=${currentUser.id}`).then(response => response.json()),
            fetch(`/api/exercise-records?userId=${currentUser.id}`).then(response => response.json())
        ])
        .then(([goals, records]) => {
            // Filter goals and records for current month
            const currentMonthGoals = goals.filter(goal => {
                const startDate = new Date(goal.start_date);
                const endDate = new Date(goal.end_date);
                return (startDate.getFullYear() === currentYear && startDate.getMonth() === now.getMonth()) ||
                       (endDate.getFullYear() === currentYear && endDate.getMonth() === now.getMonth()) ||
                       (startDate <= now && endDate >= now);
            });
            
            const currentMonthRecords = records.filter(record => {
                const recordDate = new Date(record.record_date);
                return recordDate.getFullYear() === currentYear && recordDate.getMonth() === now.getMonth();
            });
            
            // Analyze exercise types
            const exerciseTypeStats = {};
            let totalDistance = 0;
            let totalRecords = currentMonthRecords.length;
            
            currentMonthRecords.forEach(record => {
                const exerciseType = exerciseTypes.find(type => type.id === record.exercise_type);
                const typeName = exerciseType ? exerciseType.name : '未知类型';
                
                if (!exerciseTypeStats[typeName]) {
                    exerciseTypeStats[typeName] = {
                        count: 0,
                        distance: 0
                    };
                }
                
                exerciseTypeStats[typeName].count++;
                exerciseTypeStats[typeName].distance += record.value;
                totalDistance += record.value;
            });
            
            // Generate summary HTML
            let summaryHTML = `
                <div class="modal-header">
                    <h3>${monthName}运动总结</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="summary-section">
                        <h4>📊 本月运动概览</h4>
                        <div class="summary-stats">
                            <div class="stat-item">
                                <div class="stat-label">总运动次数</div>
                                <div class="stat-value">${totalRecords} 次</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">总运动距离</div>
                                <div class="stat-value">${totalDistance.toFixed(1)} km</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">参与运动类型</div>
                                <div class="stat-value">${Object.keys(exerciseTypeStats).length} 种</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-section">
                        <h4>🏃‍♂️ 各类运动统计</h4>
            `;
            
            if (Object.keys(exerciseTypeStats).length > 0) {
                for (const [typeName, stats] of Object.entries(exerciseTypeStats)) {
                    summaryHTML += `
                        <div class="exercise-type-stat">
                            <div class="exercise-type-name">${typeName}</div>
                            <div class="exercise-type-details">
                                <span>次数: ${stats.count} 次</span>
                                <span>距离: ${stats.distance.toFixed(1)} km</span>
                            </div>
                        </div>
                    `;
                }
            } else {
                summaryHTML += '<p class="no-data">本月暂无运动记录</p>';
            }
            
            // Generate recommendations
            summaryHTML += `
                    </div>
                    
                    <div class="summary-section">
                        <h4>💡 运动建议</h4>
                        <div class="recommendations">
            `;
            
            if (totalRecords === 0) {
                summaryHTML += '<p class="recommendation">本月还没有开始运动，建议制定一个适合自己的运动计划并坚持执行！</p>';
            } else {
                // Check if user has variety in exercises
                if (Object.keys(exerciseTypeStats).length < 3) {
                    summaryHTML += '<p class="recommendation">建议尝试更多种类的运动，多样化的运动有助于全面提升身体素质。</p>';
                }
                
                // Check if user has consistent exercise habit
                if (totalRecords < 10) {
                    summaryHTML += '<p class="recommendation">本月运动次数较少，建议增加运动频率，每周至少进行3-4次运动。</p>';
                }
                
                // Check if user has sufficient exercise volume
                if (totalDistance < 50) {
                    summaryHTML += '<p class="recommendation">本月运动总量偏低，建议适当增加每次运动的距离或时间。</p>';
                }
                
                // General positive feedback
                summaryHTML += '<p class="recommendation">继续保持良好的运动习惯，注意运动前热身和运动后拉伸，避免运动损伤。</p>';
            }
            
            summaryHTML += `
                        </div>
                    </div>
                </div>
            `;
            
            modal.innerHTML = summaryHTML;
            document.body.appendChild(modal);
        })
        .catch(error => {
            console.error('Error loading data for summary:', error);
            showAlert('加载月度总结数据失败', 'error');
        });
    }

    // Show goal summary
    window.showGoalSummary = function(goalId) {
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Load goals and records
        Promise.all([
            fetch(`/api/exercise-goals?userId=${currentUser.id}`).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load exercise goals');
                }
                return response.json();
            }),
            fetch(`/api/exercise-records?userId=${currentUser.id}`).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load exercise records');
                }
                return response.json();
            })
        ])
        .then(([goals, records]) => {
            if (!Array.isArray(goals) || !Array.isArray(records)) {
                throw new Error('Invalid data format received');
            }
            
            const goal = goals.find(g => g.id == goalId);
            if (!goal) {
                showAlert('未找到目标', 'error');
                return;
            }
            
            // Filter records for this goal
            const goalRecords = records.filter(record => record.goal_id == goalId);
            
            // Analyze exercise types for this goal
            const exerciseTypeStats = {};
            let totalDistance = 0;
            let totalRecords = goalRecords.length;
            
            goalRecords.forEach(record => {
                try {
                    // Find the exercise type in the global exerciseTypes array
                    const exerciseType = exerciseTypes.find(type => type.id === record.exercise_type);
                    const typeName = exerciseType ? exerciseType.name : '未知类型';
                    const unit = exerciseType ? exerciseType.unit : 'km';
                    
                    if (!exerciseTypeStats[typeName]) {
                        exerciseTypeStats[typeName] = {
                            count: 0,
                            distance: 0,
                            unit: unit
                        };
                    }
                    
                    exerciseTypeStats[typeName].count++;
                    exerciseTypeStats[typeName].distance += record.value;
                    totalDistance += record.value;
                } catch (e) {
                    console.error('Error processing record:', record, e);
                }
            });
            
            // Calculate goal progress
            const progress = calculateGoalProgress(goal, records);
            
            // Calculate total time considering unit conversions
            let totalTimeValue = 0;
            let totalDistanceValue = 0;
            let hasTimeBasedActivities = false;
            let hasDistanceBasedActivities = false;
            
            // Calculate converted distance for time-based activities
            let convertedTimeDistance = 0;
            
            for (const [typeName, stats] of Object.entries(exerciseTypeStats)) {
                const exerciseType = exerciseTypes.find(type => type.name === typeName);
                if (exerciseType) {
                    if (exerciseType.unit === '小时') {
                        hasTimeBasedActivities = true;
                        totalTimeValue += stats.distance;
                        
                        // Apply conversion rules for time-based activities:
                        // 1. Swimming: 1 hour = 10 km
                        // 2. Other hour-based activities: 1 hour = 5 km
                        if (exerciseType.id === 'swimming') {
                            convertedTimeDistance += stats.distance * 10;
                        } else {
                            convertedTimeDistance += stats.distance * 5;
                        }
                    } else {
                        hasDistanceBasedActivities = true;
                        totalDistanceValue += stats.distance;
                        
                        // Apply conversion rule for cycling: 10 km cycling = 5 km target
                        if (exerciseType.id === 'cycling') {
                            convertedTimeDistance += stats.distance * 0.5;
                        }
                    }
                }
            }
            
            // Total converted distance (for mixed activities)
            const totalConvertedDistance = totalDistanceValue + convertedTimeDistance;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            
            // Check if weight goal is completed
            const isWeightGoalCompleted = (goal.initial_weight && goal.current_weight && goal.target_weight) && 
                                          ((Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100) >= 100;
                                          
            // Check if exercise goal is completed
            const isExerciseGoalCompleted = progress.current >= goal.target;
            
            let summaryHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3>${goal.title} - 汇总</h3>
                        ${isExerciseGoalCompleted ? '<div class="stamp stamp-goal-completed">运动完成</div>' : ''}
                        ${isWeightGoalCompleted ? '<div class="stamp stamp-weight-goal-completed">体重完成</div>' : ''}
                        <button class="modal-close" onclick="closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="summary-section">
                            <h4>📊 目标完成情况</h4>
                            <div class="summary-stats">
                                <div class="stat-item">
                                    <div class="stat-label">目标量</div>
                                    <div class="stat-value">${goal.target} km</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">已完成</div>
                                    <div class="stat-value">${progress.current.toFixed(1)} km</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">完成率</div>
                                    <div class="stat-value">${progress.percentage.toFixed(1)}%</div>
                                </div>
                            </div>
                            
                            <div class="goal-progress-bar">
                                <div class="goal-progress-fill" style="width: ${Math.min(progress.percentage, 100)}%"></div>
                            </div>
                            
                            <!-- 添加目标进度状态 -->
                            <div class="goal-status-text">
                                ${progress.percentage >= 100 ? '🎉 目标已完成!' : 
                                  progress.percentage >= 80 ? '💪 快完成目标了!' : 
                                  progress.percentage >= 50 ? '👍 已完成一半以上!' : 
                                  progress.percentage >= 30 ? '🏃‍♂️ 加油，继续努力!' : 
                                  '🚀 仍需努力，继续加油!'}
                            </div>
                        </div>
                        
                        ${(goal.initial_weight || goal.current_weight || goal.target_weight) ? `
                        <div class="summary-section">
                            <h4>⚖️ 体重变化情况</h4>
                            <div class="summary-stats">
                                ${goal.initial_weight ? `
                                <div class="stat-item">
                                    <div class="stat-label">初始体重</div>
                                    <div class="stat-value">${goal.initial_weight} kg</div>
                                </div>` : ''}
                                ${goal.current_weight ? `
                                <div class="stat-item">
                                    <div class="stat-label">当前体重</div>
                                    <div class="stat-value">${goal.current_weight} kg</div>
                                </div>` : ''}
                                ${goal.target_weight ? `
                                <div class="stat-item">
                                    <div class="stat-label">目标体重</div>
                                    <div class="stat-value">${goal.target_weight} kg</div>
                                </div>` : ''}
                            </div>
                            
                            ${goal.initial_weight && goal.current_weight && goal.target_weight ? `
                            <div class="weight-progress-container">
                                <div class="weight-progress-label">体重目标进度</div>
                                <div class="weight-progress-bar">
                                    <div class="weight-progress-fill" style="width: ${Math.min((Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100, 100)}%"></div>
                                </div>
                            </div>` : ''}
                        </div>
                        ` : ''}
                        
                        <div class="summary-section">
                            <h4>🏃 运动记录统计</h4>
            `;
            
            if (totalRecords > 0) {
                let totalDisplay = `${totalDistanceValue.toFixed(1)} km`;
                if (hasTimeBasedActivities && !hasDistanceBasedActivities) {
                    // Only time-based activities
                    totalDisplay = `${totalTimeValue.toFixed(1)} 小时 (${convertedTimeDistance.toFixed(1)} km)`;
                } else if (hasTimeBasedActivities && hasDistanceBasedActivities) {
                    // Mixed activities
                    totalDisplay = `${totalConvertedDistance.toFixed(1)} km (${totalTimeValue.toFixed(1)} 小时)`;
                } else if (!hasTimeBasedActivities && hasDistanceBasedActivities) {
                    // Only distance-based activities
                    // totalDisplay is already set correctly above
                }
                
                summaryHTML += `
                    <div class="exercise-stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">运动次数</div>
                            <div class="stat-value">${totalRecords} 次</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">累计${hasTimeBasedActivities && !hasDistanceBasedActivities ? '时长' : '距离'}</div>
                            <div class="stat-value">${totalDisplay}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">运动类型</div>
                            <div class="stat-value">${Object.keys(exerciseTypeStats).length} 种</div>
                        </div>
                    </div>
                    
                    <div class="exercise-types-summary">
                        <h5>各类型运动详情:</h5>
                `;
                
                // Display exercise type stats
                for (const [typeName, stats] of Object.entries(exerciseTypeStats)) {
                    // Find the exercise type to determine the correct unit
                    const exerciseType = exerciseTypes.find(type => type.name === typeName);
                    const unit = exerciseType ? exerciseType.unit : 'km';
                    
                    // Calculate converted distance for display
                    let convertedDistance = 0;
                    let displayText = '';
                    
                    if (exerciseType) {
                        if (exerciseType.unit === '小时') {
                            // Apply conversion rules for time-based activities:
                            // 1. Swimming: 1 hour = 10 km
                            // 2. Other hour-based activities: 1 hour = 5 km
                            if (exerciseType.id === 'swimming') {
                                convertedDistance = stats.distance * 10;
                                displayText = `${stats.distance.toFixed(1)} ${unit} (${convertedDistance.toFixed(1)} km)`;
                            } else {
                                convertedDistance = stats.distance * 5;
                                displayText = `${stats.distance.toFixed(1)} ${unit} (${convertedDistance.toFixed(1)} km)`;
                            }
                        } else {
                            // For distance-based activities
                            if (exerciseType.id === 'cycling') {
                                convertedDistance = stats.distance * 0.5;
                                displayText = `${stats.distance.toFixed(1)} ${unit} (${convertedDistance.toFixed(1)} km)`;
                            } else {
                                convertedDistance = stats.distance;
                                displayText = `${stats.distance.toFixed(1)} ${unit}`;
                            }
                        }
                    } else {
                        displayText = `${stats.distance.toFixed(1)} ${unit}`;
                    }
                    
                    summaryHTML += `
                        <div class="exercise-type-stat">
                            <div class="exercise-type-name">${typeName}</div>
                            <div class="exercise-type-details">
                                <span>次数: ${stats.count} 次</span>
                                <span>${unit === '小时' ? '时长' : '距离'}: ${displayText}</span>
                            </div>
                        </div>
                    `;
                }
                
                summaryHTML += `
                    <div class="summary-stats" style="margin-top: 15px;">
                        <div class="stat-item">
                            <div class="stat-label">总运动次数</div>
                            <div class="stat-value">${totalRecords} 次</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">总${hasTimeBasedActivities && !hasDistanceBasedActivities ? '时长' : '距离'}</div>
                            <div class="stat-value">${totalDisplay}</div>
                        </div>
                    </div>
                `;
            } else {
                summaryHTML += '<p class="no-data">暂无运动记录</p>';
            }
            
            // Generate recommendations
            summaryHTML += `
                        </div>
                        
                        <div class="summary-section">
                            <h4>💡 运动建议</h4>
                            <div class="recommendations">
            `;
            
            if (totalRecords === 0) {
                summaryHTML += '<p class="recommendation">还没有开始运动，建议制定一个适合自己的运动计划并坚持执行！</p>';
            } else {
                // Check if goal is completed
                if (progress.current >= goal.target) {
                    summaryHTML += '<p class="recommendation">🎉 恭喜您完成了运动目标！继续保持良好的运动习惯！</p>';
                } else {
                    summaryHTML += '<p class="recommendation">🎯 您已完成了大部分运动目标，继续努力就可以达成目标了！</p>';
                }
                
                // Check if user has consistent exercise habit
                if (totalRecords < 10) {
                    summaryHTML += '<p class="recommendation">本月运动次数较少，建议增加运动频率，每周至少进行3-4次运动。</p>';
                }
                
                // Check if user has sufficient exercise volume
                if (totalDistance < 50) {
                    summaryHTML += '<p class="recommendation">本月运动总量偏低，建议适当增加每次运动的距离或时间。</p>';
                }
                
                // Weight-related recommendations
                if (goal.initial_weight && goal.current_weight) {
                    const weightChange = goal.current_weight - goal.initial_weight;
                    if (Math.abs(weightChange) > 0.5) { // Significant weight change
                        if (weightChange < 0) {
                            summaryHTML += '<p class="recommendation">📉 您的体重有所下降，继续保持健康的运动习惯！</p>';
                        } else {
                            summaryHTML += '<p class="recommendation">📈 您的体重有所上升，建议关注饮食和运动的平衡。</p>';
                        }
                    }
                }
                
                if (goal.current_weight && goal.target_weight) {
                    const distanceToTarget = Math.abs(goal.current_weight - goal.target_weight);
                    if (distanceToTarget > 2) { // More than 2kg away from target
                        if (goal.current_weight > goal.target_weight) {
                            summaryHTML += '<p class="recommendation">🎯 您距离目标体重还有一定距离，建议增加有氧运动，如跑步、骑车等。</p>';
                        } else {
                            summaryHTML += '<p class="recommendation">🎯 您已经超过目标体重，建议适当增加力量训练并关注营养摄入。</p>';
                        }
                    }
                }
                
                // General positive feedback
                summaryHTML += '<p class="recommendation">注意运动前热身和运动后拉伸，避免运动损伤。</p>';
            }
            
            summaryHTML += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            modal.innerHTML = summaryHTML;
            document.body.appendChild(modal);
        })
        .catch(error => {
            console.error('Error loading data for summary:', error);
            showAlert('加载目标总结数据失败: ' + error.message, 'error');
        });
    }

    // Show edit goal modal
    window.showEditGoalModal = function(goalId) {
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Load goals to find the selected goal
        fetch(`/api/exercise-goals?userId=${currentUser.id}`)
            .then(response => response.json())
            .then(goals => {
                const goal = goals.find(g => g.id == goalId);
                if (!goal) {
                    showAlert('未找到目标', 'error');
                    return;
                }
                
                // Create modal
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                
                modal.innerHTML = `
                    <div class="modal">
                        <div class="modal-header">
                            <h3>编辑运动目标</h3>
                            <button class="modal-close" onclick="closeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-goal-form">
                                <input type="hidden" id="edit-goal-id" value="${goalId}">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="edit-goal-title">目标标题：</label>
                                        <input type="text" id="edit-goal-title" value="${goal.title}" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="edit-goal-target">目标量 (km)：</label>
                                        <input type="number" id="edit-goal-target" step="0.1" min="0" value="${goal.target}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-goal-start-date">开始日期：</label>
                                        <input type="date" id="edit-goal-start-date" value="${goal.start_date}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-goal-end-date">结束日期：</label>
                                        <input type="date" id="edit-goal-end-date" value="${goal.end_date}" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="edit-target-weight">目标体重 (kg)：</label>
                                        <input type="number" id="edit-target-weight" step="0.1" min="0" ${goal.target_weight ? `value="${goal.target_weight}"` : ''}>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-current-weight">当前体重 (kg)：</label>
                                        <input type="number" id="edit-current-weight" step="0.1" min="0" ${goal.current_weight ? `value="${goal.current_weight}"` : ''}>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <button type="submit" class="btn-add">保存修改</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Add form submission handler
                const editGoalForm = document.getElementById('edit-goal-form');
                if (editGoalForm) {
                    editGoalForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        const goalId = document.getElementById('edit-goal-id')?.value;
                        const goalTitle = document.getElementById('edit-goal-title')?.value;
                        
                        // Validate required fields
                        if (!goalTitle) {
                            showAlert('请填写目标标题', 'error');
                            return;
                        }
                        
                        // Check for duplicate titles (excluding current goal)
                        fetch(`/api/exercise-goals?userId=${currentUser.id}`)
                            .then(response => response.json())
                            .then(goals => {
                                const isDuplicate = goals.some(goal => goal.title === goalTitle && goal.id != goalId);
                                if (isDuplicate) {
                                    showAlert('目标标题已存在，请使用其他标题', 'error');
                                    return;
                                }
                                
                                saveEditedGoal();
                            })
                            .catch(error => {
                                console.error('Error checking duplicate titles:', error);
                                showAlert('检查标题重复时出错', 'error');
                            });
                    });
                }
            })
            .catch(error => {
                console.error('Error loading goals:', error);
                showAlert('加载运动目标失败', 'error');
            });
    };

    // Save edited goal
    function saveEditedGoal() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const goalId = document.getElementById('edit-goal-id')?.value;
        const title = document.getElementById('edit-goal-title')?.value;
        const target = parseFloat(document.getElementById('edit-goal-target')?.value);
        const startDate = document.getElementById('edit-goal-start-date')?.value;
        const endDate = document.getElementById('edit-goal-end-date')?.value;
        const targetWeight = parseFloat(document.getElementById('edit-target-weight')?.value) || null;
        const currentWeight = parseFloat(document.getElementById('edit-current-weight')?.value) || null;
        
        if (!title || isNaN(target) || !startDate || !endDate) {
            showAlert('请填写所有必填字段', 'error');
            return;
        }
        
        // Create goal data (excluding initial weight and period)
        const goalData = {
            title: title,
            target: target,
            startDate: startDate,
            endDate: endDate,
            targetWeight: targetWeight,
            currentWeight: currentWeight
        };
        
        // Send to server
        fetch(`/api/exercise-goals/${goalId}?userId=${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalData)
        })
        .then(response => {
            if (response.ok) {
                // Close modal
                closeModal();
                
                // Refresh display
                displayGoals();
                
                showAlert('目标更新成功！', 'success');
            } else {
                throw new Error('更新目标失败');
            }
        })
        .catch(error => {
            console.error('Error updating goal:', error);
            showAlert('更新目标失败', 'error');
        });
    }

    // Initialize the page
    displayGoals();
    updateDateFields();
});

// Close modal function
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

// Authentication functions
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
}
