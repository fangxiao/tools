import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
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
  emits: ['check-in', 'show-details', 'show-summary', 'edit', 'delete'],
  template: `
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
  `
});