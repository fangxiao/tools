import { defineComponent, ref, reactive, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
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
  emits: ['submit'],
  setup(props, { emit }) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formData = reactive({
      period: 'monthly',
      title: generateTitle('monthly', today),
      target: 50,
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: lastDayOfMonth.toISOString().split('T')[0],
      initialWeight: null,
      targetWeight: null,
      ...props.initialData
    });
    
    function getWeekNumber(date) {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    function generateTitle(period, today) {
      switch (period) {
        case 'none':
          return '自定义运动目标';
        case 'monthly':
          return `${today.getFullYear()}年${today.getMonth() + 1}月运动目标`;
        case 'weekly':
          const weekNumber = getWeekNumber(today);
          return `${today.getFullYear()}年第${weekNumber}周运动目标`;
        case 'daily':
          return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日运动目标`;
        default:
          return '运动目标';
      }
    }
    
    watch(() => formData.period, (newVal) => {
      const today = new Date();
      formData.title = generateTitle(newVal, today);
      
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
          if (formData.startDate && formData.endDate) {
            return;
          }
          startDate = new Date(today);
          endDate = new Date(today);
      }
      
      formData.startDate = startDate.toISOString().split('T')[0];
      formData.endDate = endDate.toISOString().split('T')[0];
    });
    
    const handleSubmit = () => {
      emit('submit', { ...formData });
    };
    
    const resetForm = () => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      formData.period = 'monthly';
      formData.title = generateTitle('monthly', today);
      formData.target = 50;
      formData.startDate = firstDayOfMonth.toISOString().split('T')[0];
      formData.endDate = lastDayOfMonth.toISOString().split('T')[0];
      formData.initialWeight = null;
      formData.targetWeight = null;
    };
    
    return {
      formData,
      handleSubmit,
      resetForm
    };
  },
  template: `
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
  `
});