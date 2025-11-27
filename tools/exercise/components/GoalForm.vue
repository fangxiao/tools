<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-row">
      <div class="form-group">
        <label for="goal-period">目标周期：</label>
        <select id="goal-period" v-model="formData.period">
          <option value="none">无周期</option>
          <option value="daily">每日</option>
          <option value="weekly">每周</option>
          <option value="monthly">每月</option>
        </select>
      </div>
      <div class="form-group">
        <label for="goal-title">目标标题：</label>
        <input type="text" id="goal-title" v-model="formData.title" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="goal-target">目标量 (km)：</label>
        <input type="number" id="goal-target" v-model.number="formData.target" step="0.1" min="0" required>
      </div>
      <div class="form-group">
        <label for="goal-start-date">开始日期：</label>
        <input type="date" id="goal-start-date" v-model="formData.startDate" required>
      </div>
      <div class="form-group">
        <label for="goal-end-date">结束日期：</label>
        <input type="date" id="goal-end-date" v-model="formData.endDate" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>体重信息（可选）：</label>
        <div class="weight-inputs">
          <div class="weight-input">
            <input type="number" v-model.number="formData.initialWeight" step="0.1" min="0" placeholder="初始体重(kg)">
          </div>
          <div class="weight-input">
            <input type="number" v-model.number="formData.targetWeight" step="0.1" min="0" placeholder="目标体重(kg)">
          </div>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <button type="submit" class="btn-add" :disabled="isSubmitting">
          <span v-if="!isSubmitting">{{ submitText }}</span>
          <span v-else><span class="loading-spinner"></span> {{ submittingText }}</span>
        </button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'GoalForm',
  props: {
    isSubmitting: {
      type: Boolean,
      default: false
    },
    submitText: {
      type: String,
      default: '添加目标'
    },
    submittingText: {
      type: String,
      default: '添加中...'
    },
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return {
      formData: {
        period: 'monthly',
        title: this.generateTitle('monthly', today),
        target: 50,
        startDate: firstDayOfMonth.toISOString().split('T')[0],
        endDate: lastDayOfMonth.toISOString().split('T')[0],
        initialWeight: null,
        targetWeight: null,
        ...this.initialData
      }
    }
  },
  watch: {
    'formData.period'(newVal) {
      const today = new Date();
      this.formData.title = this.generateTitle(newVal, today);
      
      let startDate, endDate;
      
      switch (newVal) {
        case 'monthly':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'weekly':
          const dayOfWeek = today.getDay();
          const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          startDate = new Date(today);
          startDate.setDate(today.getDate() - diffToMonday);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'daily':
          startDate = new Date(today);
          endDate = new Date(today);
          break;
        default:
          if (this.formData.startDate && this.formData.endDate) {
            return;
          }
          startDate = new Date(today);
          endDate = new Date(today);
      }
      
      this.formData.startDate = startDate.toISOString().split('T')[0];
      this.formData.endDate = endDate.toISOString().split('T')[0];
    }
  },
  methods: {
    getWeekNumber(date) {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    },
    
    generateTitle(period, today) {
      switch (period) {
        case 'none':
          return '自定义运动目标';
        case 'monthly':
          return `${today.getFullYear()}年${today.getMonth() + 1}月运动目标`;
        case 'weekly':
          const weekNumber = this.getWeekNumber(today);
          return `${today.getFullYear()}年第${weekNumber}周运动目标`;
        case 'daily':
          return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日运动目标`;
        default:
          return '运动目标';
      }
    },
    
    handleSubmit() {
      this.$emit('submit', { ...this.formData });
    },
    
    resetForm() {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      this.formData = {
        period: 'monthly',
        title: this.generateTitle('monthly', today),
        target: 50,
        startDate: firstDayOfMonth.toISOString().split('T')[0],
        endDate: lastDayOfMonth.toISOString().split('T')[0],
        initialWeight: null,
        targetWeight: null
      };
    }
  }
}
</script>

<style scoped>
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.weight-inputs {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.weight-input {
  flex: 1;
  min-width: 140px;
}

.weight-input input {
  width: 100%;
}

.btn-add {
  background-color: #2ecc71;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-add:hover {
  background-color: #27ae60;
}

.btn-add:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>