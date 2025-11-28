document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!checkAuth()) {
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // 添加检查确保currentUser存在且有id属性
    if (!currentUser || !currentUser.id) {
        console.error('无法获取当前用户信息');
        showAlert('用户信息无效，请重新登录', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }

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
    
    // 页面加载完成后立即显示目标
    displayGoals();
    
    // Set up event listeners
    goalPeriodSelect.addEventListener('change', function() {
        updateDateFields();
    });

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
        const existingConfirm = document.querySelector('.custom-confirm-overlay');
        if (existingConfirm && existingConfirm.parentNode) {
            existingConfirm.parentNode.removeChild(existingConfirm);
        }
        
        // Create confirm element
        const confirmElement = document.createElement('div');
        confirmElement.className = 'custom-confirm-overlay';
        confirmElement.innerHTML = `
            <div class="custom-confirm">
                <div class="custom-confirm-content">
                    <p>${message}</p>
                    <div class="custom-confirm-buttons">
                        <button class="btn-confirm-no" type="button">取消</button>
                        <button class="btn-confirm-yes" type="button">确定</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(confirmElement);
        
        // Force reflow
        confirmElement.offsetHeight;
        
        // Ensure the overlay covers the entire viewport
        confirmElement.style.position = 'fixed';
        confirmElement.style.top = '0';
        confirmElement.style.left = '0';
        confirmElement.style.width = '100vw';
        confirmElement.style.height = '100vh';
        confirmElement.style.display = 'flex';
        confirmElement.style.justifyContent = 'center';
        confirmElement.style.alignItems = 'center';
        
        // Ensure the dialog is centered
        const dialog = confirmElement.querySelector('.custom-confirm');
        if (dialog) {
            dialog.style.margin = 'auto';
        }
        
        // Add event listeners
        const yesButton = confirmElement.querySelector('.btn-confirm-yes');
        const noButton = confirmElement.querySelector('.btn-confirm-no');
        
        const handleConfirm = function(result) {
            // Remove event listeners to prevent multiple triggers
            if (yesButton) {
                yesButton.removeEventListener('click', handleYes);
            }
            if (noButton) {
                noButton.removeEventListener('click', handleNo);
            }
            
            // Remove the confirm dialog
            if (confirmElement && confirmElement.parentNode) {
                confirmElement.parentNode.removeChild(confirmElement);
            }
            
            // Execute callback
            if (callback && typeof callback === 'function') {
                callback(result);
            }
        };
        
        const handleYes = function() {
            handleConfirm(true);
        };
        
        const handleNo = function() {
            handleConfirm(false);
        };
        
        if (yesButton) {
            yesButton.addEventListener('click', handleYes);
        }
        if (noButton) {
            noButton.addEventListener('click', handleNo);
        }
        
        // Allow closing with Escape key
        const handleKeyDown = function(event) {
            if (event.key === 'Escape') {
                handleConfirm(false);
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Allow closing by clicking on the overlay (not on the dialog itself)
        confirmElement.addEventListener('click', function(event) {
            if (event.target === confirmElement) {
                handleConfirm(false);
            }
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
        console.log('正在获取用户ID为', currentUser.id, '的运动目标');
        fetch(`/api/exercise-goals?userId=${currentUser.id}`)
            .then(response => {
                console.log('运动目标API响应状态:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(goals => {
                console.log('接收到的运动目标数据:', goals);
                
                // Clear the goals list
                goalsList.innerHTML = '';
                
                if (goals.length === 0) {
                    goalsList.innerHTML = '<div class="no-goals">暂无运动目标，请添加一个目标。</div>';
                    return;
                }
                
                // Get all records for progress calculation
                fetch(`/api/exercise-records?userId=${currentUser.id}`)
                    .then(response => {
                        console.log('运动记录API响应状态:', response.status);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(records => {
                        console.log('接收到的运动记录数据:', records);
                        
                        // Create a document fragment to batch DOM updates
                        const fragment = document.createDocumentFragment();
                        
                        goals.forEach(goal => {
                            // Filter records for this specific goal
                            const recordsForGoal = records.filter(record => record.goal_id == goal.id);
                            
                            // Calculate progress
                            const progress = calculateGoalProgress(goal, recordsForGoal);
                            const timeProgress = calculateTimeProgress(goal);
                            
                            // Check goal status
                            const goalStatus = getGoalStatus(goal, progress, timeProgress);
                            
                            const goalElement = document.createElement('div');
                            goalElement.className = 'goal-card';
                            
                            // Check if each stamp should be shown
                            const showExerciseStamp = progress.percentage >= 100;
                            const showWeightStamp = (goal.initial_weight && goal.current_weight && goal.target_weight) && 
                                                    ((Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100) >= 100;
                            
                            // Determine if stamps need single positioning
                            const singleStamp = showExerciseStamp !== showWeightStamp; // XOR - only one is true
                            
                            goalElement.innerHTML = `
                                <div class="goal-header">
                                    <div class="goal-title">${goal.title}${goal.visibility === 'private' ? ' 🔐' : ''}</div>
                                    ${goalStatus === 'failed' ? '<div class="goal-badge goal-badge-failed">未完成</div>' : ''}
                                    ${showExerciseStamp ? `<div class="stamp stamp-goal-completed${singleStamp ? ' single-stamp' : ''}">运动完成</div>` : ''}
                                    ${showWeightStamp ? `<div class="stamp stamp-weight-goal-completed${singleStamp ? ' single-stamp' : ''}">减重完成</div>` : ''}
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
                                    ${goal.user_id == currentUser.id ? `
                                        <button class="btn-edit" onclick="showEditGoalModal(${goal.id})">编辑</button>
                                        <button class="btn-delete" onclick="deleteGoal(${goal.id})">删除</button>
                                    ` : ''}
                                </div>
                            `;
                            fragment.appendChild(goalElement);
                        });
                        
                        // Clear and append all at once
                        goalsList.innerHTML = '';
                        goalsList.appendChild(fragment);
                    })
                    .catch(error => {
                        console.error('加载运动记录时出错:', error);
                        showAlert('加载运动记录失败: ' + error.message, 'error');
                    });
            })
            .catch(error => {
                console.error('加载运动目标时出错:', error);
                showAlert('加载运动目标失败: ' + error.message, 'error');
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
        // Filter records to only include those for this specific goal
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
            percentage: goal.target > 0 ? (current / goal.target) * 100 : 0,
            isCompleted: current >= goal.target // 添加这一行来标识目标是否完成
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
                                        <div class="detail-record-actions">
                                            <button class="btn-edit-small" onclick="editRecord(${record.id})">编辑</button>
                                            <button class="btn-delete-small" onclick="deleteRecord(${record.id})">删除</button>
                                        </div>
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

    // Function to close modal
    window.closeModal = function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    };

    // 导出汇总为图片
    window.exportSummaryToImage = function() {
        // 先确保html2canvas已加载
        loadHtml2Canvas()
            .then(html2canvas => {
                return html2canvas(document.querySelector('.summary-container'));
            })
            .then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = '运动汇总.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    };

    // 导出记录为CSV
    window.exportRecordsToCSV = function() {
        const records = JSON.parse(localStorage.getItem('records')) || [];
        const csvContent = records.map(record => `${record.date},${record.distance},${record.time}`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '运动记录.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 导出目标为CSV
    window.exportGoalsToCSV = function() {
        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        const csvContent = goals.map(goal => `${goal.date},${goal.distance},${goal.time}`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '运动目标.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 显示警告信息
    window.showAlert = function(message, type) {
        const alertContainer = document.querySelector('.alert-container');
        const alertElement = document.createElement('div');
        alertElement.className = `alert ${type}`;
        alertElement.textContent = message;
        alertContainer.appendChild(alertElement);

        setTimeout(() => {
            alertContainer.removeChild(alertElement);
        }, 3000);
    };

    // 初始化页面
    window.onload = function() {
        loadGoals();
        loadRecords();
    };


    // Delete goal
    window.deleteGoal = function(goalId) {
        showConfirm('确定要删除这个运动目标吗？\n\n注意：删除目标会同时删除所有相关的打卡记录，此操作不可恢复！', function(confirmed) {
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
                        return response.json().then(data => {
                            throw new Error(data.error || '删除失败');
                        });
                    }
                })
                .catch(error => {
                    console.error('Error deleting goal:', error);
                    showAlert('删除目标失败: ' + error.message, 'error');
                });
            }
        });
    };

    // Edit a record
    window.editRecord = function(recordId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Get the record details
        fetch(`/api/exercise-records/single/${recordId}?userId=${currentUser.id}`)
            .then(response => response.json())
            .then(record => {
                // Remove any existing modal
                const existingModal = document.querySelector('.modal-overlay');
                if (existingModal && existingModal.parentNode) {
                    existingModal.parentNode.removeChild(existingModal);
                }
                
                // Create modal for editing
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                
                modal.innerHTML = `
                    <div class="modal">
                        <div class="modal-header">
                            <h3>编辑打卡记录</h3>
                            <button class="modal-close" onclick="closeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-record-form">
                                <input type="hidden" id="edit-record-id" value="${record.id}">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="edit-exercise-type">运动类别：</label>
                                        <select id="edit-exercise-type" required>
                                            <option value="">选择运动类别</option>
                                            ${exerciseTypes.map(type => 
                                                `<option value="${type.id}" ${type.id === record.exercise_type ? 'selected' : ''}>${type.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-value">运动量：</label>
                                        <input type="number" id="edit-value" step="0.1" min="0" value="${record.value}" required>
                                        <span id="edit-unit">${exerciseTypes.find(t => t.id === record.exercise_type)?.unit || 'km'}</span>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="edit-date">日期：</label>
                                        <input type="date" id="edit-date" value="${record.record_date}" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="edit-note">备注（可选）：</label>
                                        <input type="text" id="edit-note" value="${record.note || ''}">
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
                
                // Add event listener to update unit when exercise type changes
                const exerciseTypeSelect = document.getElementById('edit-exercise-type');
                const unitSpan = document.getElementById('edit-unit');
                
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
                const editRecordForm = document.getElementById('edit-record-form');
                if (editRecordForm) {
                    editRecordForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        saveEditedRecord();
                    });
                }
            })
            .catch(error => {
                console.error('Error loading record:', error);
                showAlert('加载打卡记录失败', 'error');
            });
    };

    // Save edited record
    function saveEditedRecord() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const recordId = document.getElementById('edit-record-id')?.value;
        const exerciseType = document.getElementById('edit-exercise-type')?.value;
        const value = parseFloat(document.getElementById('edit-value')?.value);
        const date = document.getElementById('edit-date')?.value;
        const note = document.getElementById('edit-note')?.value;
        
        if (!exerciseType || isNaN(value) || !date) {
            showAlert('请填写完整信息', 'error');
            return;
        }
        
        // Create record data
        const recordData = {
            exerciseType: exerciseType,
            value: value,
            recordDate: date,
            note: note
        };
        
        // Send update to server
        fetch(`/api/exercise-records/${recordId}?userId=${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recordData)
        })
        .then(response => {
            if (response.ok) {
                // Close modal
                closeModal();
                
                // Refresh display
                const goalId = document.querySelector('#checkin-goal-id')?.value;
                if (goalId) {
                    showDetailsModal(goalId);
                } else {
                    displayGoals();
                }
                
                showAlert('打卡记录更新成功！', 'success');
            } else {
                throw new Error('更新打卡记录失败');
            }
        })
        .catch(error => {
            console.error('Error updating record:', error);
            showAlert('更新打卡记录失败', 'error');
        });
    }

    // Delete a record
    window.deleteRecord = function(recordId) {
        showConfirm('确定要删除这条打卡记录吗？此操作不可恢复！', function(confirmed) {
            if (confirmed) {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (!currentUser) return;
                
                fetch(`/api/exercise-records/${recordId}?userId=${currentUser.id}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        // Refresh display
                        const goalId = document.querySelector('#checkin-goal-id')?.value;
                        if (goalId) {
                            showDetailsModal(goalId);
                        } else {
                            displayGoals();
                        }
                        
                        showAlert('打卡记录删除成功！', 'success');
                    } else {
                        return response.json().then(data => {
                            throw new Error(data.error || '删除失败');
                        });
                    }
                })
                .catch(error => {
                    console.error('Error deleting record:', error);
                    showAlert('删除打卡记录失败: ' + error.message, 'error');
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
                return Promise.resolve({ ok: true });
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
        const visibility = document.getElementById('edit-goal-visibility')?.value || 'private';
        
        if (!title || isNaN(target) || !startDate || !endDate) {
            showAlert('请填写所有必填字段', 'error');
            return;
        }
        
        // Create goal data
        const goalData = {
            title: title,
            target: target,
            startDate: startDate,
            endDate: endDate,
            targetWeight: targetWeight,
            currentWeight: currentWeight,
            visibility: visibility
        };
        
        // Send update to server
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
                return response.json().then(data => {
                    throw new Error(data.error || '更新目标失败');
                });
            }
        })
        .catch(error => {
            console.error('Error updating goal:', error);
            showAlert('更新目标失败: ' + (error.message || '未知错误'), 'error');
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
            const visibility = document.getElementById('goal-visibility')?.value || 'private';
            
            const goalData = {
                title: document.getElementById('goal-title')?.value,
                target: parseFloat(document.getElementById('goal-target')?.value),
                period: period,
                startDate: document.getElementById('goal-start-date')?.value,
                endDate: document.getElementById('goal-end-date')?.value,
                initialWeight: parseFloat(document.getElementById('initial-weight')?.value) || null,
                targetWeight: parseFloat(document.getElementById('target-weight')?.value) || null,
                currentWeight: parseFloat(document.getElementById('current-weight')?.value) || null,
                visibility: visibility // 添加可见性字段
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
                            return response.json(); // Return the created goal
                        } else {
                            return response.json().then(data => {
                                throw new Error(data.error || '创建目标失败');
                            });
                        }
                    })
                    .then(createdGoal => {
                        // Update UI
                        displayGoals();
                        
                        // Reset form but keep the date logic
                        if (document.getElementById('goal-target')) {
                            document.getElementById('goal-target').value = '';
                        }
                        updateDateFields();
                        
                        showAlert('目标创建成功！', 'success');
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
    window.showMonthlySummary = function() {
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Load records for the current month
        fetch(`/api/exercise-records/monthly-summary?userId=${currentUser.id}&year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`)
        .then(response => response.json())
        .then(async data => {
            const { exerciseTypeStats, totalDistance, totalRecords } = data;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            
            // Prepare user data for AI recommendations
            const userData = {
                totalRecords,
                totalDistance,
                exerciseTypeCount: Object.keys(exerciseTypeStats).length,
                exerciseTypes: Object.keys(exerciseTypeStats)
            };
            
            // Get AI-powered recommendations
            const aiRecommendations = await getAIRecommendations(userData);
            
            let summaryHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3>月度运动总结</h3>
                        <button class="modal-close" onclick="closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="summary-section">
                            <h4>📊 本月运动数据</h4>
                            <div class="summary-stats">
                                <div class="stat-item">
                                    <div class="stat-label">运动次数</div>
                                    <div class="stat-value">${totalRecords}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">累计距离</div>
                                    <div class="stat-value">${totalDistance.toFixed(1)} km</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">运动类型</div>
                                    <div class="stat-value">${Object.keys(exerciseTypeStats).length}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="summary-section">
                            <h4>📈 各类型运动详情</h4>
            `;
            
            if (Object.keys(exerciseTypeStats).length > 0) {
                for (const [typeName, stats] of Object.entries(exerciseTypeStats)) {
                    summaryHTML += `
                        <div class="exercise-type-stat">
                            <span class="exercise-type-name">${typeName}</span>
                            <span class="exercise-type-value">${stats.count} 次，${stats.distance.toFixed(1)} km</span>
                        </div>
                    `;
                }
            } else {
                summaryHTML += '<p>本月暂无运动记录</p>';
            }
            
            summaryHTML += `
                        </div>
                        
                        <div class="summary-section">
                            <h4>🤖 AI运动建议</h4>
                            <div class="ai-recommendations">
            `;
            
            // Display AI recommendations
            aiRecommendations.forEach(rec => {
                summaryHTML += `<p class="recommendation">${rec}</p>`;
            });
            
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
            showAlert('加载月度总结数据失败', 'error');
        });
    };

    // Show goal summary
    window.showGoalSummary = function(goalId) {
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Check if exerciseTypes is defined
        if (typeof exerciseTypes === 'undefined' || !Array.isArray(exerciseTypes)) {
            showAlert('运动类型数据未定义', 'error');
            return;
        }
        
        // Show loading state
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>运动目标总结</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="loading">加载中...</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
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
            
            // Check if weight goal is completed
            const isWeightGoalCompleted = (goal.initial_weight && goal.current_weight && goal.target_weight) && 
                                          ((Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100) >= 100;
                                          
            // Check if exercise goal is completed
            const isExerciseGoalCompleted = progress.current >= goal.target;
            
            // Calculate total time considering unit conversions
            let totalTimeValue = 0;
            let totalDistanceValue = 0;
            let hasTimeBasedActivities = false;
            let hasDistanceBasedActivities = false;
            
            // Calculate converted distance for time-based activities
            let convertedTimeDistance = 0;
            
            // Make sure exerciseTypeStats is valid
            if (typeof exerciseTypeStats !== 'object') {
                showAlert('运动统计数据格式错误', 'error');
                return;
            }
            
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
            
            // Prepare user data for AI recommendations
            const userData = {
                totalRecords,
                totalDistance: totalConvertedDistance,
                exerciseTypeCount: Object.keys(exerciseTypeStats).length,
                exerciseTypes: Object.keys(exerciseTypeStats),
                goalProgress: progress.percentage,
                goalTarget: goal.target,
                goalAchieved: progress.isCompleted
            };
            
            // Add weight data if available
            if (goal.initial_weight && goal.current_weight) {
                userData.weightChange = goal.current_weight - goal.initial_weight;
                userData.initialWeight = goal.initial_weight;
                userData.currentWeight = goal.current_weight;
            }
            
            if (goal.target_weight) {
                userData.targetWeight = goal.target_weight;
                userData.distanceToTarget = Math.abs(goal.current_weight - goal.target_weight);
            }
            
            // Get AI-powered recommendations from server
            return fetch(`/api/exercise-goals/${goalId}/recommendations?userId=${currentUser.id}`)
                .then(response => response.json())
                .then(aiData => {
                    // Create modal
                    const modal = document.createElement('div');
                    modal.className = 'modal-overlay';
                    
                    let summaryHTML = `
                        <div class="modal">
                            <div class="modal-header">
                                <h3>${goal.title} - 汇总</h3>
                                ${isExerciseGoalCompleted ? '<div class="stamp stamp-goal-completed">运动完成</div>' : ''}
                                ${isWeightGoalCompleted ? '<div class="stamp stamp-weight-goal-completed">减重完成</div>' : ''}
                                <button class="modal-close" onclick="closeModal()">&times;</button>
                            </div>
                            <div class="modal-body">
                                <div class="summary-section">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                        <h4 style="margin: 0;">🎯 目标进度</h4>
                                        <button id="export-image-btn" class="btn-use" style="padding: 6px 12px; font-size: 13px;">导出图片</button>
                                    </div>
                                    <div class="summary-stats">
                                        <div class="stat-item">
                                            <div class="stat-label">目标名称</div>
                                            <div class="stat-value">${goal.title}</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-label">完成度</div>
                                            <div class="stat-value">${progress.percentage.toFixed(1)}%</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-label">状态</div>
                                            <div class="stat-value">
                                                ${progress.isCompleted ? 
                                                    '<span class="goal-status-completed">✅ 已完成</span>' : 
                                                    (new Date() > new Date(goal.end_date) ? 
                                                        '<span class="goal-status-expired">❌ 已过期</span>' : 
                                                        '<span class="goal-status-active">⏳ 进行中</span>')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="goal-progress-bar">
                                    <div class="goal-progress-fill" style="width: ${Math.min(progress.percentage, 100)}%"></div>
                                </div>
                            </div>
                            
                            ${goal.initial_weight && goal.current_weight && goal.target_weight ? `
                            <div class="summary-section">
                                <h4>⚖️ 体重目标</h4>
                                <div class="summary-stats">
                                    <div class="stat-item">
                                        <div class="stat-label">初始体重</div>
                                        <div class="stat-value">${goal.initial_weight} kg</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">当前体重</div>
                                        <div class="stat-value">${goal.current_weight} kg</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">目标体重</div>
                                        <div class="stat-value">${goal.target_weight} kg</div>
                                    </div>
                                </div>
                                
                                <div class="goal-progress-container">
                                    <div class="goal-progress-label">体重目标进度</div>
                                    <div class="goal-progress-bar">
                                        <div class="goal-progress-fill weight-progress" style="width: ${Math.min((Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100, 100)}%"></div>
                                    </div>
                                    <div class="weight-change-info">
                                        ${goal.initial_weight > goal.current_weight ? 
                                          `📉 已减重 ${(goal.initial_weight - goal.current_weight).toFixed(1)} kg` : 
                                          `📈 还需${goal.current_weight > goal.target_weight ? '减重' : '增重'} ${Math.abs(goal.current_weight - goal.target_weight).toFixed(1)} kg`}
                                    </div>
                                </div>
                            </div>` : ''}
                            
                            <div class="summary-section">
                                <h4>🏃 运动记录统计</h4>
                    `;
                    
                    if (totalRecords > 0) {
                        let totalDisplay = `${(totalDistanceValue || 0).toFixed(1)} km`;
                        if (hasTimeBasedActivities && !hasDistanceBasedActivities) {
                            // Only time-based activities
                            totalDisplay = `${(convertedTimeDistance || 0).toFixed(1)} km`;
                        } else if (hasTimeBasedActivities && hasDistanceBasedActivities) {
                            // Mixed activities
                            totalDisplay = `${(totalConvertedDistance || 0).toFixed(1)} km`;
                        } else if (!hasTimeBasedActivities && hasDistanceBasedActivities) {
                            // Only distance-based activities
                            // totalDisplay is already set correctly above
                        }
                        
                        summaryHTML += `
                            <div class="exercise-stats-grid">
                                <div class="stat-item">
                                    <div class="stat-label">运动次数</div>
                                    <div class="stat-value">${totalRecords || 0} 次</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">累计距离</div>
                                    <div class="stat-value">${totalDisplay}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">运动类型</div>
                                    <div class="stat-value">${Object.keys(exerciseTypeStats).length || 0} 种</div>
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
                                        convertedDistance = (stats.distance || 0) * 10;
                                        displayText = `${(stats.distance || 0).toFixed(1)} ${unit} (${convertedDistance.toFixed(1)} km)`;
                                    } else {
                                        convertedDistance = (stats.distance || 0) * 5;
                                        displayText = `${(stats.distance || 0).toFixed(1)} ${unit} (${convertedDistance.toFixed(1)} km)`;
                                    }
                                } else {
                                    // For distance-based activities
                                    if (exerciseType.id === 'cycling') {
                                        convertedDistance = (stats.distance || 0) * 0.5;
                                        displayText = `${(stats.distance || 0).toFixed(1)} ${unit} (${convertedDistance.toFixed(1)} km)`;
                                    } else {
                                        convertedDistance = stats.distance || 0;
                                        displayText = `${(stats.distance || 0).toFixed(1)} ${unit}`;
                                    }
                                }
                            } else {
                                displayText = `${(stats.distance || 0).toFixed(1)} ${unit}`;
                            }
                            
                            summaryHTML += `
                                <div class="exercise-type-stat">
                                    <span class="exercise-type-name">${typeName}</span>
                                    <span class="exercise-type-value">${stats.count || 0} 次，${displayText}</span>
                                </div>
                            `;
                        }
                        
                        summaryHTML += `
                                    </div>
                                </div>
                                
                                <div class="summary-section">
                                    <h4>🤖 AI个性化建议</h4>
                                    <div class="ai-recommendations">
                        `;
                        
                        // Display AI recommendations
                        if (Array.isArray(aiData.recommendations)) {
                            aiData.recommendations.forEach(rec => {
                                summaryHTML += `<p class="recommendation">${rec}</p>`;
                            });
                        } else {
                            summaryHTML += `<p class="recommendation">暂无个性化建议</p>`;
                        }
                        
                        summaryHTML += `
                                    </div>
                                </div>
                            `;
                    } else {
                        summaryHTML += '<p>暂无运动记录</p>';
                        
                        summaryHTML += `
                            <div class="summary-section">
                                <h4>🤖 AI个性化建议</h4>
                                <div class="ai-recommendations">
                        `;
                        
                        if (Array.isArray(aiData.recommendations)) {
                            aiData.recommendations.forEach(rec => {
                                summaryHTML += `<p class="recommendation">${rec}</p>`;
                            });
                        }
                        
                        summaryHTML += `
                                </div>
                            </div>
                        `;
                    }
                    
                    summaryHTML += `
                                </div>
                            </div>
                        </div>
                    `;
                    
                    modal.innerHTML = summaryHTML;
                    document.body.appendChild(modal);
                });
        })
        .catch(error => {
            console.error('Error loading data for summary:', error);
            showAlert('加载目标总结数据失败: ' + (error.message || '未知错误'), 'error');
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
                                        <label for="edit-goal-visibility">可见性：</label>
                                        <select id="edit-goal-visibility" required>
                                            <option value="private" ${goal.visibility === 'private' ? 'selected' : ''}>私有</option>
                                            <option value="public" ${goal.visibility === 'public' ? 'selected' : ''}>公有</option>
                                        </select>
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
                return response.json(); // Return the updated goal
            } else {
                throw new Error('更新目标失败');
            }
        })
        .then(updatedGoal => {
            // Close modal
            closeModal();
            
            // Refresh display
            displayGoals();
            
            showAlert('目标更新成功！', 'success');
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

// Function to get AI-powered recommendations
function getAIRecommendations(userData) {
    // In a real implementation, this would call an actual AI service
    // For now, we'll simulate an AI response with more personalized suggestions
    
    // This is a placeholder for actual AI integration
    // You would replace this with a real API call to your AI service
    /*
    return fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => data.recommendations);
    */
    
    // Simulated AI recommendations based on user data
    const recommendations = [];
    
    if (userData.totalRecords === 0) {
        recommendations.push("👋 你好！看起来你这个月还没有开始运动。建议从简单的运动开始，比如每天散步30分钟，逐渐培养运动习惯。");
        recommendations.push("📝 制定一个现实可行的运动计划，比如每周运动3次，每次30分钟。");
        recommendations.push("👟 选择你感兴趣的运动，这样更容易坚持下去。");
    } else {
        // Variety recommendation
        if (userData.exerciseTypeCount < 3) {
            recommendations.push("🔄 你尝试的运动类型较少，建议尝试更多种类的运动，比如游泳、瑜伽或骑行，多样化的运动有助于全面提升身体素质。");
        }
        
        // Frequency recommendation
        if (userData.totalRecords < 10) {
            recommendations.push("📅 本月运动次数较少，建议增加运动频率，每周至少进行3-4次运动。可以尝试将运动安排在固定时间，养成习惯。");
        }
        
        // Volume recommendation
        if (userData.totalDistance < 50) {
            recommendations.push("💪 本月运动总量偏低，建议适当增加每次运动的距离或时间。可以每周增加10%的运动量，循序渐进地提升。");
        }
        
        // Positive feedback
        recommendations.push("🌟 你已经养成了运动的好习惯！继续保持，并注意运动前热身和运动后拉伸，避免运动损伤。");
        
        // Advanced recommendations based on user data
        if (userData.exerciseTypeCount >= 3 && userData.totalRecords >= 10) {
            recommendations.push("🚀 你已经是运动达人了！可以考虑挑战更高难度的运动项目，或者尝试参加马拉松等赛事。");
        }
        
        // Weight-related recommendations
        if (userData.weightChange) {
            if (userData.weightChange > 0) {
                recommendations.push("📈 你的体重有所上升，建议关注饮食和运动的平衡，可以增加有氧运动，如跑步、骑车等。");
            } else if (userData.weightChange < 0) {
                recommendations.push("📉 你的体重有所下降，继续保持健康的运动习惯！注意营养摄入，避免过度减重。");
            }
        }
        
        if (userData.distanceToTarget) {
            if (userData.distanceToTarget > 2) {
                if (userData.currentWeight > userData.targetWeight) {
                    recommendations.push("🎯 你距离目标体重还有一定距离，建议增加有氧运动，如跑步、骑车等，并控制饮食热量摄入。");
                } else {
                    recommendations.push("🎯 你已经超过目标体重，建议适当增加力量训练并关注营养摄入，保持健康体重。");
                }
            } else {
                recommendations.push("🎉 恭喜你接近或达到目标体重！继续保持良好的运动和饮食习惯。");
            }
        }
        
        // Goal progress recommendations
        if (userData.goalProgress !== undefined) {
            if (userData.goalProgress < 30) {
                recommendations.push("🏁 你的目标完成度还比较低，不要气馁，制定小目标逐步完成更容易获得成就感。");
            } else if (userData.goalProgress >= 30 && userData.goalProgress < 70) {
                recommendations.push("🏁 你的目标完成度已经过半，继续保持这个节奏，相信你一定能够达成目标！");
            } else if (userData.goalProgress >= 70 && userData.goalProgress < 100) {
                recommendations.push("🏆 你已经接近完成目标了，最后的冲刺阶段更要坚持，胜利就在眼前！");
            } else if (userData.goalProgress >= 100) {
                recommendations.push("🏅 恭喜你完成了运动目标！为自己设定一个新的挑战吧。");
            }
        }
    }
    
    return Promise.resolve(recommendations);
}

// 导出汇总为图片
window.exportSummaryToImage = function() {
    const modalBody = document.querySelector('.modal-body');
    if (!modalBody) {
        showAlert('无法找到汇总内容', 'error');
        return;
    }
    
    // 显示正在生成图片的提示
    const exportBtn = document.getElementById('export-image-btn');
    const originalBtnText = exportBtn.textContent;
    exportBtn.textContent = '正在生成...';
    exportBtn.disabled = true;
    
    try {
        // 创建一个临时的DOM副本用于截图
        const clone = modalBody.cloneNode(true);
        // 添加特殊类名以避免样式冲突
        clone.className = 'export-image-clone';
        document.body.appendChild(clone);
        
        // 隐藏原始模态框
        modalBody.style.visibility = 'hidden';
        
        // 设置克隆元素样式
        const cloneStyle = clone.style;
        cloneStyle.position = 'absolute';
        cloneStyle.top = '0';
        cloneStyle.left = '0';
        cloneStyle.width = '100%';
        cloneStyle.maxWidth = '800px';
        cloneStyle.height = 'auto';
        cloneStyle.zIndex = '-1000';
        cloneStyle.backgroundColor = '#fff';
        cloneStyle.padding = '20px';
        cloneStyle.margin = '20px auto';
        cloneStyle.boxSizing = 'border-box';
        
        // 强制重排
        clone.offsetHeight;
        
        // 使用本地的html2canvas生成图片
        function loadHtml2Canvas() {
            return new Promise((resolve, reject) => {
                // 检查是否已经加载了html2canvas
                if (window.html2canvas) {
                    resolve(window.html2canvas);
                    return;
                }
                
                // 动态创建script标签加载本地的html2canvas
                const script = document.createElement('script');
                script.src = '/tools/exercise/src/libs/html2canvas.min.js';
                script.onload = () => {
                    // 等待一点时间让库初始化
                    setTimeout(() => {
                        // 检查各种可能的导出方式
                        if (typeof window.html2canvas === 'function') {
                            resolve(window.html2canvas);
                        } else if (window.html2canvas && typeof window.html2canvas.default === 'function') {
                            window.html2canvas = window.html2canvas.default;
                            resolve(window.html2canvas);
                        } else if (window.html2canvas && typeof window.html2canvas.html2canvas === 'function') {
                            resolve(window.html2canvas.html2canvas);
                        } else if (typeof window.html2canvas === 'object') {
                            // 查找对象中的函数
                            for (let key in window.html2canvas) {
                                if (typeof window.html2canvas[key] === 'function') {
                                    window.html2canvas = window.html2canvas[key];
                                    resolve(window.html2canvas);
                                    return;
                                }
                            }
                            reject(new Error('html2canvas加载完成但未找到可调用的函数'));
                        } else {
                            reject(new Error('html2canvas加载完成但未定义或不是函数'));
                        }
                    }, 100);
                };
                script.onerror = () => reject(new Error('html2canvas加载失败'));
                document.head.appendChild(script);
            });
        }
        
        // 加载并使用html2canvas
        loadHtml2Canvas()
            .then(html2canvas => {
                if (!html2canvas) {
                    throw new Error('html2canvas不可用');
                }
                
                // 等待确保样式应用
                return new Promise(resolve => setTimeout(() => {
                    resolve(html2canvas);
                }, 200));
            })
            .then(html2canvas => {
                // 配置html2canvas选项
                const options = {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: '#fff',
                    logging: false,
                    width: clone.scrollWidth,
                    height: clone.scrollHeight,
                    x: 0,
                    y: 0
                };
                
                return html2canvas(clone, options);
            })
            .then(canvas => {
                // 删除克隆元素
                try {
                    document.body.removeChild(clone);
                } catch(e) {
                    console.warn('删除克隆元素时出错:', e);
                }
                
                // 恢复原始模态框
                modalBody.style.visibility = 'visible';
                
                // 检查canvas是否有效
                if (!canvas || !canvas.toDataURL) {
                    throw new Error('生成的canvas无效');
                }
                
                // 创建下载链接
                const link = document.createElement('a');
                link.download = `运动目标总结_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL('image/png');
                
                // 触发下载
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // 恢复按钮状态
                exportBtn.textContent = originalBtnText;
                exportBtn.disabled = false;
                
                showAlert('图片导出成功', 'success');
            })
            .catch(error => {
                // 清理
                try {
                    document.body.removeChild(clone);
                } catch(e) {
                    console.warn('清理克隆元素时出错:', e);
                }
                
                // 恢复原始模态框
                modalBody.style.visibility = 'visible';
                
                // 恢复按钮状态
                exportBtn.textContent = originalBtnText;
                exportBtn.disabled = false;
                
                console.error('导出图片失败:', error);
                
                // 根据错误类型提供不同的提示
                if (error.message.includes('加载失败') || error.message.includes('Failed to fetch')) {
                    showAlert('图片库加载失败，请检查网络连接后重试', 'error');
                } else {
                    showAlert('导出图片失败: ' + error.message, 'error');
                }
            });
    } catch (error) {
        // 恢复按钮状态
        exportBtn.textContent = originalBtnText;
        exportBtn.disabled = false;
        
        console.error('导出图片失败:', error);
        showAlert('导出图片失败: ' + error.message, 'error');
    }
};

// 在DOM加载完成后为导出按钮添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 使用事件委托处理导出按钮点击事件
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'export-image-btn') {
            exportSummaryToImage();
        }
    });
});
