<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-row">
      <div class="form-group">
        <label for="goal-period">目标周期:</label>
        <select id="goal-period" v-model="localGoal.period" @change="updateDateFields">
          <option value="none">无周期</option>
          <option value="daily">每日</option>
          <option value="weekly">每周</option>
          <option value="monthly">每月</option>
        </select>
      </div>
      <div class="form-group">
        <label for="goal-title">目标标题:</label>
        <input type="text" id="goal-title" v-model="localGoal.title" required>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label for="goal-target">目标值 (公里):</label>
        <input type="number" id="goal-target" v-model.number="localGoal.target" step="0.1" min="0" required>
      </div>
      <div class="form-group">
        <label for="goal-start-date">开始日期:</label>
        <input type="date" id="goal-start-date" v-model="localGoal.startDate" required>
      </div>
      <div class="form-group">
        <label for="goal-end-date">结束日期:</label>
        <input type="date" id="goal-end-date" v-model="localGoal.endDate" required>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>体重目标 (可选):</label>
        <div class="weight-inputs">
          <div class="weight-input">
            <input type="number" v-model.number="localGoal.initialWeight" step="0.1" min="0" placeholder="初始体重">
          </div>
          <div class="weight-input">
            <input type="number" v-model.number="localGoal.targetWeight" step="0.1" min="0" placeholder="目标体重">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="goal-visibility">可见性:</label>
        <select id="goal-visibility" v-model="localGoal.visibility">
          <option value="private">仅自己可见</option>
          <option value="public">公开</option>
        </select>
      </div>
    </div>
    
    <div class="form-actions">
      <button type="button" class="btn-secondary" @click="handleCancel" :disabled="loading">
        取消
      </button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? (isEdit ? '更新中...' : '创建中...') : (isEdit ? '更新目标' : '创建目标') }}
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'GoalForm',
  props: {
    goal: {
      type: Object,
      default: () => ({
        period: 'none',
        title: '',
        target: '',
        startDate: '',
        endDate: '',
        initialWeight: '',
        targetWeight: '',
        visibility: 'private'
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localGoal: { ...this.goal }
    };
  },
  watch: {
    goal: {
      handler(newVal) {
        this.localGoal = { ...newVal };
      },
      deep: true
    }
  },
  methods: {
    updateDateFields() {
      this.$emit('update-date-fields', this.localGoal.period);
    },
    handleSubmit() {
      // 验证必填字段
      if (!this.localGoal.title || !this.localGoal.target || 
          !this.localGoal.startDate || !this.localGoal.endDate) {
        alert('请填写必填项');
        return;
      }
      
      this.$emit('submit', { ...this.localGoal });
    },
    handleCancel() {
      this.$emit('cancel');
    }
  }
};
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

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #7f8c8d;
}
</style>