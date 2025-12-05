// 月度汇总模块
const SummaryModule = (function() {
    // 显示月度汇总

    function showMonthlySummary(goalId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // 获取目标信息
        fetch(`/api/exercise-goals/${goalId}?userId=${currentUser.id}`)
            .then(response => response.json())
            .then(goal => {
                // 获取该目标的所有记录
                return fetch(`/api/exercise-records?goalId=${goalId}&userId=${currentUser.id}`)
                    .then(response => response.json())
                    .then(records => ({ goal, records }));
            })
            .then(async ({ goal, records }) => {
                // 移除任何现有的模态框
                const existingModal = document.querySelector('.modal-overlay');
                if (existingModal && existingModal.parentNode) {
                    existingModal.parentNode.removeChild(existingModal);
                }
                
                // 计算汇总统计
                const stats = calculateSummaryStats(records);
                
                // 创建模态框
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                modal.id = 'summary-modal-overlay';
                
                // 构建运动类型统计HTML
                let exerciseTypeStatsHtml = '';
                for (const [type, data] of Object.entries(stats.exerciseTypes)) {
                    exerciseTypeStatsHtml += `
                        <div class="exercise-type-stat">
                            <span class="exercise-type-name">${RecordModule.getExerciseTypeName(type)}</span>
                            <span class="exercise-type-value">${data.count}次, ${data.total.toFixed(1)}${RecordModule.getExerciseUnit(type)}</span>
                        </div>
                    `;
                }
                
                // 生成带日期的文件名
                const now = new Date();
                const dateString = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
                const filename = `summary_${dateString}.png`;
                
                modal.innerHTML = `
                    <div class="modal" id="summary-modal">
                        <div class="modal-header">
                            <h3>${goal.title} - 月度汇总</h3>
                            <button class="modal-close" onclick="closeModal()">&times;</button>
                            <button class="btn-export" onclick="exportSummaryAsImage()" title="导出为图片">📷</button>
                        </div>
                        <div class="modal-body" id="summary-content">
                            <div class="summary-section">
                                <h4>总体统计</h4>
                                <div class="summary-stats">
                                    <div class="stat-item">
                                        <div class="stat-label">总次数</div>
                                        <div class="stat-value">${stats.totalCount}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">总距离/时长</div>
                                        <div class="stat-value">${stats.totalValue.toFixed(1)} km/小时</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">参与类型数</div>
                                        <div class="stat-value">${stats.exerciseTypeCount}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">平均每次</div>
                                        <div class="stat-value">${stats.averagePerSession.toFixed(1)} km/小时</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="summary-section">
                                <h4>运动类型分布</h4>
                                ${exerciseTypeStatsHtml}
                            </div>
                            
                            <div class="summary-section">
                                <h4>激励文案</h4>
                                <div class="motivational-message">
                                    ${getMotivationalMessage(stats.completionRate)}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // 将导出函数添加到全局作用域
                window.exportSummaryAsImage = function() {
                    const element = document.getElementById('summary-content');
                    if (element) {
                        Helpers.generateAndDownloadImage(element, filename);
                    }
                };
            })
            .catch(error => {
                console.error('获取月度汇总时出错:', error);
                showAlert('获取月度汇总失败，请重试', 'error');
            });
    }

    // 计算汇总统计
    function calculateSummaryStats(records) {
        const totalCount = records.length;
        const totalValue = records.reduce((sum, record) => sum + parseFloat(record.value || 0), 0);
        const averagePerSession = totalCount > 0 ? totalValue / totalCount : 0;
        
        // 计算运动类型统计
        const exerciseTypes = {};
        records.forEach(record => {
            const type = record.exercise_type;
            if (!exerciseTypes[type]) {
                exerciseTypes[type] = { count: 0, total: 0 };
            }
            exerciseTypes[type].count += 1;
            exerciseTypes[type].total += parseFloat(record.value || 0);
        });
        
        const exerciseTypeCount = Object.keys(exerciseTypes).length;
        
        return {
            totalCount,
            totalValue,
            averagePerSession,
            exerciseTypes,
            exerciseTypeCount
        };
    }

    // 获取激励文案
    function getMotivationalMessage(completionRate) {
        if (completionRate >= 100) {
            return "太棒了！你已经完全达成了目标，继续保持！";
        } else if (completionRate >= 80) {
            return "做得很好！你已经完成了大部分目标，继续努力一点点就完美了！";
        } else if (completionRate >= 60) {
            return "不错哦！你已经完成了一半以上的目标，坚持下去会更棒！";
        } else if (completionRate >= 40) {
            return "加油！虽然进度稍慢，但只要坚持就能看到成果！";
        } else if (completionRate >= 20) {
            return "刚开始总是最难的，坚持下去，你会看到自己的进步！";
        } else {
            return "每一个伟大的成就都始于第一步，继续前进吧！";
        }
    }
    
    // 公共API
    return {
        showMonthlySummary
    };
})();