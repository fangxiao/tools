import { defineComponent, ref, reactive, computed, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
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
    },
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const formData = reactive({
      exerciseType: props.initialData.exerciseType || '',
      value: props.initialData.value || 0,
      weight: props.initialData.weight || props.initialWeight,
      date: props.initialData.date || new Date().toISOString().split('T')[0],
      note: props.initialData.note || ''
    });
    
    const unit = computed(() => {
      const type = props.exerciseTypes.find(t => t.id === formData.exerciseType);
      return type ? type.unit : 'km';
    });
    
    const weightPlaceholder = computed(() => {
      return props.initialWeight ? `当前: ${props.initialWeight}kg` : '请输入体重';
    });
    
    watch(() => props.initialWeight, (newVal) => {
      if (!formData.weight) {
        formData.weight = newVal;
      }
    });
    
    const handleSubmit = () => {
      emit('submit', { ...formData });
    };
    
    const resetForm = () => {
      formData.exerciseType = '';
      formData.value = 0;
      formData.weight = props.initialWeight;
      formData.date = new Date().toISOString().split('T')[0];
      formData.note = '';
    };
    
    return {
      formData,
      unit,
      weightPlaceholder,
      handleSubmit,
      resetForm
    };
  },
  template: `
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
  `
});