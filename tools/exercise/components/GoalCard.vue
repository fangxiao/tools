<template>
  <div class="goal-card">
    <div class="goal-header">
      <div class="goal-title">{{ goal.title }}</div>
      <div v-if="goalStatus === 'failed'" class="goal-badge goal-badge-failed">未完成</div>
      <div v-if="progress.percentage >= 100" 
           class="stamp stamp-goal-completed"
           :class="{ 'single-stamp': !((goal.initial_weight && goal.current_weight && goal.target_weight) && weightProgress >= 100) }">
        运动完成
      </div>
      <div v-if="(goal.initial_weight && goal.current_weight && goal.target_weight) && weightProgress >= 100" 
           class="stamp stamp-weight-goal-completed"
           :class="{ 'single-stamp': !(progress.percentage >= 100) }">
        减重完成
      </div>
    </div>
    <div class="goal-details">
      <div class="detail-row">
        <div class="detail-label">目标量:</div>
        <div class="detail-value">{{ goal.target }} km</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">时间范围:</div>
        <div class="detail-value">{{ goal.start_date }} 至 {{ goal.end_date }}</div>
      </div>
      <div v-if="goal.initial_weight || goal.current_weight || goal.target_weight" class="detail-row">
        <div class="detail-label">体重信息:</div>
        <div class="detail-value">
          <span v-if="goal.initial_weight">初始: {{ goal.initial_weight }}kg</span>
          <span v-if="goal.current_weight"> 当前: {{ goal.current_weight }}kg</span>
          <span v-if="goal.target_weight"> 目标: {{ goal.target_weight }}kg</span>
        </div>
      </div>
    </div>
    <div class="goal-progress">
      <div class="goal-progress-section">
        <div class="goal-progress-text">运动进度: {{ progress.current.toFixed(1) }} / {{ progress.target }} km ({{ progress.percentage.toFixed(1) }}%)</div>
        <div class="goal-progress-bar">
          <div class="goal-progress-fill" :style="{ width: Math.min(progress.percentage, 100) + '%' }"></div>
        </div>
      </div>
      
      <div class="goal-progress-section">
        <div class="goal-progress-text">时间进度: {{ timeProgress.percentage.toFixed(1) }}%</div>
        <div class="goal-progress-bar">
          <div class="goal-progress-fill" :style="{ width: Math.min(timeProgress.percentage, 100) + '%', backgroundColor: '#3498db' }"></div>
        </div>
      </div>
      
      <div v-if="goal.initial_weight && goal.current_weight && goal.target_weight" class="goal-progress-section">
        <div class="goal-progress-text">体重进度: {{ weightProgress.toFixed(1) }}%</div>
        <div class="goal-progress-bar">
          <div class="goal-progress-fill" 
               :style="{ 
                 width: Math.min(100, weightProgress) + '%', 
                 backgroundColor: weightProgressColor
               }">
          </div>
        </div>
      </div>
      
      <div v-if="progress.percentage < timeProgress.percentage" class="reminder-banner">
        💡 运动进度落后于时间进度，加油运动吧！
      </div>
      
      <div class="goal-status-text">
        <span v-if="progress.percentage >= 100">🎉 目标已完成!</span>
        <span v-else-if="progress.percentage >= 80">💪 快完成目标了!</span>
        <span v-else-if="progress.percentage >= 50">👍 已完成一半以上!</span>
        <span v-else-if="progress.percentage >= 30">🏃‍♂️ 加油，继续努力!</span>
        <span v-else>🚀 仍需努力，继续加油!</span>
      </div>
    </div>
    <div class="goal-actions">
      <button class="btn-use" @click="$emit('check-in', goal)">打卡</button>
      <button class="btn-details" @click="$emit('show-details', goal)">打卡明细</button>
      <button class="btn-summary" @click="$emit('show-summary', goal)">汇总</button>
      <button class="btn-edit" @click="$emit('edit', goal)">编辑</button>
      <button class="btn-delete" @click="$emit('delete', goal)">删除</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoalCard',
  props: {
    goal: {
      type: Object,
      required: true
    },
    progress: {
      type: Object,
      required: true
    },
    timeProgress: {
      type: Object,
      required: true
    },
    goalStatus: {
      type: String,
      required: true
    },
    weightProgress: {
      type: Number,
      required: true
    },
    weightProgressColor: {
      type: String,
      required: true
    }
  },
  emits: ['check-in', 'show-details', 'show-summary', 'edit', 'delete']
}
</script>

<style scoped>
.goal-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background-color: #fafafa;
  position: relative;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.goal-title {
  font-size: 1.2em;
  font-weight: bold;
  color: #2c3e50;
}

.goal-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}

.goal-badge-completed {
  background-color: #2ecc71;
  color: white;
}

.goal-badge-failed {
  background-color: #e74c3c;
  color: white;
}

/* 运动完成印章样式 */
.stamp-goal-completed {
  position: absolute;
  top: 60px; /* 调整位置避免遮挡模态框关闭按钮 */
  right: 20px;
  width: 60px;
  height: 60px;
  background-color: rgba(46, 204, 113, 0.85);
  color: white;
  font-weight: bold;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform: rotate(20deg);
  z-index: 10;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.stamp-goal-completed.single-stamp {
  right: 20px;
}

.stamp-goal-completed::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px dashed white;
  border-radius: 50%;
}

/* 减重完成印章样式 */
.stamp-weight-goal-completed {
  position: absolute;
  top: 60px; /* 调整位置避免遮挡模态框关闭按钮 */
  right: 90px; /* 调整位置避免与运动完成印章重叠 */
  width: 60px;
  height: 60px;
  background-color: rgba(241, 196, 15, 0.85);
  color: white;
  font-weight: bold;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform: rotate(20deg);
  z-index: 10;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.stamp-weight-goal-completed.single-stamp {
  right: 10px;
}

.stamp-weight-goal-completed::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px dashed white;
  border-radius: 50%;
}

.goal-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 600;
  width: 100px;
  color: #555;
}

.detail-value {
  flex: 1;
  color: #333;
}

.goal-progress {
  margin: 20px 0;
}

.goal-progress-section {
  margin-bottom: 15px;
}

.goal-progress-text {
  margin-bottom: 5px;
  font-size: 0.9em;
  color: #555;
}

.goal-progress-bar {
  height: 10px;
  background-color: #ecf0f1;
  border-radius: 5px;
  overflow: hidden;
}

.goal-progress-fill {
  height: 100%;
  background-color: #2ecc71;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.reminder-banner {
  background-color: #f39c12;
  color: white;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
}

.goal-status-text {
  text-align: center;
  font-weight: bold;
  margin: 10px 0;
}

.goal-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-use, .btn-details, .btn-summary, .btn-edit, .btn-delete {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-use {
  background-color: #3498db;
  color: white;
}

.btn-use:hover {
  background-color: #2980b9;
}

.btn-details {
  background-color: #9b59b6;
  color: white;
}

.btn-details:hover {
  background-color: #8e44ad;
}

.btn-summary {
  background-color: #1abc9c;
  color: white;
}

.btn-summary:hover {
  background-color: #16a085;
}

.btn-edit {
  background-color: #f39c12;
  color: white;
}

.btn-edit:hover {
  background-color: #d35400;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background-color: #c0392b;
}
</style>