<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-row">
      <div class="form-group">
        <label for="checkin-exercise-type">运动类别：</label>
        <select id="checkin-exercise-type" v-model="formData.exerciseType" required>
          <option value="">选择运动类别</option>
          <option v-for="type in exerciseTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="checkin-value">运动量：</label>
        <input type="number" id="checkin-value" v-model.number="formData.value" step="0.1" min="0" required>
        <span>{{ unit }}</span>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="checkin-weight">当前体重 (kg)：</label>
        <input type="number" id="checkin-weight" v-model.number="formData.weight" step="0.1" min="0" :placeholder="weightPlaceholder">
      </div>
      <div class="form-group">
        <label for="checkin-date">日期：</label>
        <input type="date" id="checkin-date" v-model="formData.date" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="checkin-note">备注（可选）：</label>
        <input type="text" id="checkin-note" v-model="formData.note">
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
  name: 'CheckInForm',
  props: {
    exerciseTypes: {
      type: Array,
      required: true
    },
    initialWeight: {
      type: Number,
      default: null
    },
    isSubmitting: {
      type: Boolean,
      default: false
    },
    submitText: {
      type: String,
      default: '完成打卡'
    },
    submittingText: {
      type: String,
      default: '打卡中...'
    }
  },
  data() {
    return {
      formData: {
        exerciseType: '',
        value: 0,
        weight: this.initialWeight,
        date: new Date().toISOString().split('T')[0],
        note: ''
      }
    }
  },
  computed: {
    unit() {
      const type = this.exerciseTypes.find(t => t.id === this.formData.exerciseType);
      return type ? type.unit : 'km';
    },
    weightPlaceholder() {
      return this.initialWeight ? `当前: ${this.initialWeight}kg` : '请输入体重';
    }
  },
  watch: {
    initialWeight(newVal) {
      if (!this.formData.weight) {
        this.formData.weight = newVal;
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', { ...this.formData });
    },
    resetForm() {
      this.formData = {
        exerciseType: '',
        value: 0,
        weight: this.initialWeight,
        date: new Date().toISOString().split('T')[0],
        note: ''
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