// 动态加载html2canvas库
function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        // 检查是否已经加载了html2canvas
        if (window.html2canvas) {
            resolve(window.html2canvas);
            return;
        }

        // 动态创建script标签加载本地的html2canvas
        const script = document.createElement('script');
        script.src = './src/libs/html2canvas.min.js';
        script.onload = () => {
            if (window.html2canvas) {
                console.log('html2canvas loaded successfully from local file');
                resolve(window.html2canvas);
            } else {
                reject(new Error('html2canvas not available after loading'));
            }
        };
        script.onerror = () => {
            console.error('Failed to load html2canvas from local file');
            // 如果本地加载失败，尝试CDN加载
            const cdnScript = document.createElement('script');
            cdnScript.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            cdnScript.onload = () => {
                if (window.html2canvas) {
                    console.log('html2canvas loaded successfully from CDN');
                    resolve(window.html2canvas);
                } else {
                    reject(new Error('html2canvas not available after CDN loading'));
                }
            };
            cdnScript.onerror = () => {
                reject(new Error('Failed to load html2canvas from both local and CDN sources'));
            };
            document.head.appendChild(cdnScript);
        };
        document.head.appendChild(script);// Modal module for handling modal dialogs
const modalModule = {
    // Show modal with title and message
    showModal: function(title, content, type = 'info') {
        // Try to get existing modal or create new one
        let modal = document.getElementById('custom-modal');
        if (!modal) {
            modal = this.createModal();
            document.body.appendChild(modal);
        }
        
        // Update modal content
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-body').textContent = content;
        
        // Set type (info, success, error, warning)
        modal.className = `modal fade custom-modal modal-${type}`;
        
        // Show modal using Bootstrap
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    },
    
    // Create modal element if it doesn't exist
    createModal: function() {
        const modal = document.createElement('div');
        modal.id = 'custom-modal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    },
    
    // Show alert using modal
    showAlert: function(message, type = 'info') {
        this.showModal('提示', message, type);
    }
};

// Check authentication function
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showAlert('请先登录', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return false;
    }
    return true;
}

    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuth()) {
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.id) {
        console.error('Invalid user data in localStorage');
        showAlert('用户信息无效，请重新登录', 'error');
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
        // Check if document.body exists
        if (!document.body) {
            console.warn('Document body not available for alert:', message);
            return;
        }
        
        // Remove any existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert && document.body.contains(existingAlert)) {
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
        
        // Check if document.body still exists before appending
        if (document.body) {
            document.body.appendChild(alertElement);
        } else {
            console.warn('Document body not available for alert:', message);
            return;
        }
        
        // Add close event
        const closeButton = alertElement.querySelector('.custom-alert-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                if (document.body && document.body.contains(alertElement)) {
                    document.body.removeChild(alertElement);
                }
            });
        }
        
        // Auto close after 3 seconds
        setTimeout(() => {
            if (document.body && document.body.contains(alertElement)) {
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
                                        <button class="btn-delete" onclick="GoalModule.deleteGoal(${goal.id})">删除</button>
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
                            <form id="checkin-form" enctype="multipart/form-data">
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
                                        <label for="checkin-image">打卡截图（可选，小于10MB）：</label>
                                        <input type="file" id="checkin-image" accept="image/*">
                                        <div id="image-upload-result"></div>
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
                                        ${record.image_path ? `<div class="detail-record-image"><img src="${record.image_path}" alt="打卡图片" style="max-width: 100%; height: auto; margin-top: 10px;"></div>` : ''}
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

    // 使closeModal函数全局可用
    window.closeModal = function() {
        // 检查是否是关闭打卡明细模态框
        const detailModalHeader = document.querySelector('.modal-overlay .modal-header h3');
        if (detailModalHeader && detailModalHeader.textContent.trim().startsWith('打卡明细')) {
            // 如果是打卡明细模态框，关闭后更新目标面板
            window.displayGoals();
        }
        
        // 调用原始的closeModal函数
        Helpers.closeModal();
    };

    // 使closeModal函数全局可用
    window.closeModal = function() {
        // 调用原始的closeModal函数
        Helpers.closeModal();
    };

    // Function to close modal
    window.closeModal = function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
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

    // 页面加载完成后执行
    document.addEventListener('DOMContentLoaded', function() {
        // 检查用户是否已登录
        if (!checkAuth()) {
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        // 添加检查确保currentUser存在且有id属性
        if (!currentUser || !currentUser.id) {
            console.error('无法获取当前用户信息');
            Helpers.showAlert('用户信息无效，请重新登录', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }

        // 初始化目标表单
        GoalModule.initializeGoalForm();
        
        // 页面加载完成后立即显示目标
        DisplayModule.displayGoals();
        
        // 设置表单提交事件监听器
        const goalForm = document.getElementById('goal-form');
        if (goalForm) {
            goalForm.addEventListener('submit', GoalModule.handleGoalSubmit);
        }
        
        // 添加检查确保所有必需的DOM元素都存在
        const requiredElements = [
            'goal-form', 'goals-list', 'goal-period', 'goal-title', 
            'goal-target', 'goal-start-date', 'goal-end-date'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.warn('缺少以下必需的DOM元素:', missingElements);
        }
    });

    // 删除目标
    function deleteGoal(goalId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        Helpers.showConfirm(
            '确认删除',
            '确定要删除这个运动目标吗？此操作无法撤销。',
            function() {
                // 用户确认删除
                fetch(`/api/exercise-goals/${goalId}?userId=${currentUser.id}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => {
                    Helpers.showAlert('目标删除成功！', 'success');
                    // 重新加载目标列表
                    DisplayModule.displayGoals();
                })
                .catch(error => {
                    console.error('删除目标时出错:', error);
                    Helpers.showAlert('删除目标失败，请重试', 'error');
                }); // 注意：这行保持不变，但上面的删除逻辑已移除
            },
            function() {    
                // 用户取消删除
            }
        );
    }

    // 使closeModal函数全局可用
    window.closeModal = Helpers.closeModal;

    // 使模块全局可用
    window.GoalModule = GoalModule;
    window.DisplayModule = DisplayModule;
    window.CheckInModule = CheckInModule;
    window.RecordModule = RecordModule;
    window.SummaryModule = SummaryModule;
    window.EditModule = EditModule;
    window.Helpers = Helpers;

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
                        // 获取当前显示的打卡记录数量
                        const recordElements = document.querySelectorAll('.detail-record');
                        const recordCount = recordElements.length;
                        
                        // 如果只剩一条记录，删除后更新目标面板
                        if (recordCount <= 1) {
                            closeModal();
                            window.displayGoals();
                        } else {
                            // 否则刷新打卡明细页面
                            const goalId = document.querySelector('#checkin-goal-id')?.value;
                            if (goalId) {
                                showDetailsModal(goalId);
                            } else {
                                displayGoals();
                            }
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
                
                // Refresh the details modal instead of the goals panel
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
    };

    // Add a new record
    function addNewRecord() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const exerciseType = document.getElementById('new-exercise-type')?.value;
        const value = parseFloat(document.getElementById('new-value')?.value);
        const date = document.getElementById('new-date')?.value;
        const note = document.getElementById('new-note')?.value;
        
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
                // Close modal
                closeModal();
                
                // Refresh display
                const goalId = document.querySelector('#checkin-goal-id')?.value;
                if (goalId) {
                    showDetailsModal(goalId);
                } else {
                    displayGoals();
                }
                
                showAlert('打卡记录添加成功！', 'success');
                // 更新目标面板
                window.displayGoals();
            } else {
                throw new Error('添加打卡记录失败');
            }
        })
        .catch(error => {
            console.error('Error adding record:', error);
            showAlert('添加打卡记录失败', 'error');
        });
    };

    // Display goals
    window.displayGoals = function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        fetch(`/api/exercise-goals?userId=${currentUser.id}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('获取目标列表失败');
            }
        })
        .then(goals => {
            const goalsContainer = document.getElementById('goals-container');
            goalsContainer.innerHTML = '';
            
            goals.forEach(goal => {
                const goalElement = document.createElement('div');
                goalElement.className = 'goal';
                goalElement.innerHTML = `
                    <div class="goal-header">
                        <h3>${goal.name}</h3>
                        <button onclick="showDetailsModal('${goal.id}')">详情</button>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar" style="width: ${goal.progress}%"></div>
                    </div>
                `;
                goalsContainer.appendChild(goalElement);
            });
        })
        .catch(error => {
            console.error('Error fetching goals:', error);
            showAlert('获取目标列表失败', 'error');
        });
    }

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
        
        // Validation
        if (!exerciseType || isNaN(value)) {
            showAlert('请填写完整的运动信息', 'error');
            return;
        }
        
        // Check that value is greater than 0
        if (value <= 0) {
            showAlert('运动量必须大于0', 'error');
            return;
        }
        
        // Handle image upload
        const formData = new FormData();
        formData.append('goalId', goalId);
        formData.append('exerciseType', exerciseType);
        formData.append('value', value);
        formData.append('recordDate', date);
        formData.append('note', note || '');
        
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            
            // Check file size (less than 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showAlert('图片大小不能超过10MB', 'error');
                return;
            }
            
            // Check file type (popular image formats)
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
            if (!allowedTypes.includes(file.type)) {
                showAlert('只支持常见的图片格式 (JPEG, PNG, GIF, WebP, BMP)', 'error');
                return;
            }
            
            formData.append('image', file);
        }
        
        // Send record to server
        fetch(`/api/exercise-records?userId=${currentUser.id}`, {
            method: 'POST',
            body: formData
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
        .then(data => {
            // If weight is provided, update the goal's current weight
            if (!isNaN(weight)) {
                return fetch(`/api/exercise-goals/${goalId}/weight?userId=${currentUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ currentWeight: weight })
                }).then(response => {
                    if (!response.ok) {
                        throw new Error('更新体重失败');
                    }
                    return data;
                });
            }
            return data;
        })
        .then(() => {
            // Close modal
            closeModal();
            
            // Refresh display
            displayGoals();
            
            showAlert('打卡成功！', 'success');
        })
        .catch(error => {
            console.error('Error saving check-in:', error);
            showAlert('打卡失败: ' + error.message, 'error');
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
            return getAIRecommendations(userData)
                .then(recommendations => {
                    // Wrap recommendations in the expected format
                    const aiData = {
                        success: true,
                        recommendations: recommendations
                    };
                    
                    // Create modal
                    const modal = document.createElement('div');
                    modal.className = 'modal-overlay';
                    
                    let summaryHTML = `
                        <div class="modal">
                            <div class="modal-header">
                                <h3>${goal.title} - 汇总</h3>
                                ${isWeightGoalCompleted ? '<div class="stamp stamp-weight-goal-completed">减重完成</div>' : ''}
                                <button class="modal-close" onclick="closeModal()">&times;</button>
                            </div>
                            <div class="modal-body">
                                <div class="summary-section">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                        <h4 style="margin: 0;">🎯 目标进度</h4>
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

    // 将displayGoals函数挂载到window对象上，以便其他模块可以访问
    window.displayGoals = displayGoals;

    // Initialize the page
    displayGoals();
    updateDateFields();
});

// Close modal function - 统一的关闭模态框函数
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

// 确保window上也有这个函数，以供HTML中的onclick调用
window.closeModal = closeModal;



// Function to get AI-powered recommendations
function getAIRecommendations(userData) {
    // First try to get recommendations from the server (Spark service)
    return fetch('/api/spark/recommendations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.recommendations;
        } else {
            // Fallback to simulated recommendations if service fails
            return getSimulatedRecommendations(userData);
        }
    })
    .catch(error => {
        console.error('获取讯飞星火AI建议失败:', error);
        // Final fallback to simulated recommendations
        return getSimulatedRecommendations(userData);
    });
}




