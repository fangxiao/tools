import { defineComponent, ref, reactive, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import GoalForm from './components/GoalForm.vue.js';
import GoalCard from './components/GoalCard.vue.js';
import Modal from './components/Modal.vue.js';
import CheckInForm from './components/CheckInForm.vue.js';
import RecordDetail from './components/RecordDetail.vue.js';

export default defineComponent({
  name: 'App',
  components: {
    GoalForm,
    GoalCard,
    Modal,
    CheckInForm,
    RecordDetail
  },
  setup() {
    // State
    const currentUser = ref(JSON.parse(localStorage.getItem('currentUser')) || null);
    const goals = ref([]);
    const records = ref([]);
    const isLoadingGoals = ref(false);
    const isAddingGoal = ref(false);
    const isSavingCheckIn = ref(false);
    const isUpdatingRecord = ref(false);
    const isFetchingSummary = ref(false);
    const isLoadingRecords = ref(false);
    
    // Modals
    const showCheckInModalFlag = ref(false);
    const showDetailsModalFlag = ref(false);
    const showEditRecordModal = ref(false);
    
    // Selected items
    const selectedGoal = ref(null);
    const selectedGoalRecords = ref([]);
    
    // Editing record
    const editingRecord = reactive({
      id: null,
      exerciseType: '',
      value: 0,
      recordDate: new Date().toISOString().split('T')[0],
      note: ''
    });
    
    // Exercise types
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
    
    // Computed properties
    const editingRecordFormData = reactive({
      exerciseType: editingRecord.exerciseType,
      value: editingRecord.value,
      date: editingRecord.recordDate,
      note: editingRecord.note
    });
    
    // Auth check
    const checkAuth = () => {
      if (!currentUser.value) {
        window.location.href = '/login.html';
        return false;
      }
      return true;
    };
    
    // Fetch goals
    const fetchGoals = async () => {
      if (!checkAuth()) return;
      
      isLoadingGoals.value = true;
      try {
        const response = await fetch(`/api/exercise-goals?userId=${currentUser.value.id}`);
        if (!response.ok) throw new Error('获取运动目标失败');
        goals.value = await response.json();
      } catch (error) {
        showAlert('加载运动目标失败: ' + error.message, 'error');
      } finally {
        isLoadingGoals.value = false;
      }
    };
    
    // Fetch records
    const fetchRecords = async () => {
      if (!checkAuth()) return;
      
      try {
        const response = await fetch(`/api/exercise-records?userId=${currentUser.value.id}`);
        if (!response.ok) throw new Error('获取运动记录失败');
        records.value = await response.json();
      } catch (error) {
        showAlert('加载运动记录失败: ' + error.message, 'error');
      }
    };
    
    // Add goal
    const addGoal = async (goalData) => {
      if (!checkAuth()) return;
      
      isAddingGoal.value = true;
      try {
        const response = await fetch(`/api/exercise-goals?userId=${currentUser.value.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(goalData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '创建目标失败');
        }
        
        await response.json();
        await fetchGoals();
        
        // Reset form would happen in the child component
        
        showAlert('目标创建成功！', 'success');
      } catch (error) {
        showAlert(error.message || '创建目标失败', 'error');
      } finally {
        isAddingGoal.value = false;
      }
    };
    
    // Delete goal
    const deleteGoal = async (goal) => {
      if (!confirm('确定要删除这个运动目标吗？\n\n注意：删除目标会同时删除所有相关的打卡记录，此操作不可恢复！')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/exercise-goals/${goal.id}?userId=${currentUser.value.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '删除失败');
        }
        
        await fetchGoals();
        showAlert('目标删除成功！', 'success');
      } catch (error) {
        showAlert('删除目标失败: ' + error.message, 'error');
      }
    };
    
    // Show check-in modal
    const showCheckInModal = (goal) => {
      selectedGoal.value = goal;
      showCheckInModalFlag.value = true;
    };
    
    // Save check-in
    const saveCheckIn = async (checkInData) => {
      if (!checkAuth()) return;
      
      isSavingCheckIn.value = true;
      try {
        const recordData = {
          goalId: selectedGoal.value.id,
          exerciseType: checkInData.exerciseType,
          value: checkInData.value,
          recordDate: checkInData.date,
          note: checkInData.note
        };
        
        const response = await fetch(`/api/exercise-records?userId=${currentUser.value.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recordData)
        });
        
        if (!response.ok) {
          throw new Error('打卡失败');
        }
        
        // If weight is provided, update the goal's current weight
        if (checkInData.weight) {
          const weightResponse = await fetch(`/api/exercise-goals/${selectedGoal.value.id}/weight?userId=${currentUser.value.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentWeight: checkInData.weight })
          });
          
          if (!weightResponse.ok) {
            throw new Error('更新体重失败');
          }
        }
        
        closeModal();
        await fetchGoals();
        showAlert('打卡成功！', 'success');
      } catch (error) {
        showAlert('打卡失败: ' + error.message, 'error');
      } finally {
        isSavingCheckIn.value = false;
      }
    };
    
    // Show details modal
    const showDetailsModal = async (goal) => {
      selectedGoal.value = goal;
      showDetailsModalFlag.value = true;
      isLoadingRecords.value = true;
      
      try {
        const response = await fetch(`/api/exercise-records/goal/${goal.id}?userId=${currentUser.value.id}`);
        if (!response.ok) throw new Error('获取运动记录失败');
        selectedGoalRecords.value = await response.json();
      } catch (error) {
        showAlert('加载运动记录失败: ' + error.message, 'error');
      } finally {
        isLoadingRecords.value = false;
      }
    };
    
    // Edit record
    const editRecord = async (record) => {
      try {
        const response = await fetch(`/api/exercise-records/single/${record.id}?userId=${currentUser.value.id}`);
        if (!response.ok) throw new Error('获取运动记录失败');
        const recordData = await response.json();
        
        editingRecord.id = recordData.id;
        editingRecord.exerciseType = recordData.exercise_type;
        editingRecord.value = recordData.value;
        editingRecord.recordDate = recordData.record_date;
        editingRecord.note = recordData.note || '';
        
        showEditRecordModal.value = true;
      } catch (error) {
        showAlert('加载打卡记录失败: ' + error.message, 'error');
      }
    };
    
    // Save edited record
    const saveEditedRecord = async (editedData) => {
      isUpdatingRecord.value = true;
      try {
        const recordData = {
          exerciseType: editedData.exerciseType,
          value: editedData.value,
          recordDate: editedData.date,
          note: editedData.note
        };
        
        const response = await fetch(`/api/exercise-records/${editingRecord.id}?userId=${currentUser.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recordData)
        });
        
        if (!response.ok) {
          throw new Error('更新打卡记录失败');
        }
        
        closeModal();
        await showDetailsModal(selectedGoal.value);
        showAlert('打卡记录更新成功！', 'success');
      } catch (error) {
        showAlert('更新打卡记录失败: ' + error.message, 'error');
      } finally {
        isUpdatingRecord.value = false;
      }
    };
    
    // Delete record
    const deleteRecord = async (record) => {
      if (!confirm('确定要删除这条打卡记录吗？此操作不可恢复！')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/exercise-records/${record.id}?userId=${currentUser.value.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '删除失败');
        }
        
        await showDetailsModal(selectedGoal.value);
        showAlert('打卡记录删除成功！', 'success');
      } catch (error) {
        showAlert('删除打卡记录失败: ' + error.message, 'error');
      }
    };
    
    // Show edit goal modal
    const showEditGoalModal = (goal) => {
      showAlert('编辑功能尚未完全实现', 'info');
    };
    
    // Show goal summary
    const showGoalSummary = (goal) => {
      showAlert('目标汇总功能尚未完全实现', 'info');
    };
    
    // Show monthly summary
    const showMonthlySummary = async () => {
      isFetchingSummary.value = true;
      try {
        showAlert('月度汇总功能尚未完全实现', 'info');
      } catch (error) {
        showAlert('加载月度总结失败: ' + error.message, 'error');
      } finally {
        isFetchingSummary.value = false;
      }
    };
    
    // Calculate goal progress
    const calculateGoalProgress = (goal) => {
      const recordsForGoal = records.value.filter(record => record.goal_id == goal.id);
      let current = 0;
      
      recordsForGoal.forEach(record => {
        const exerciseType = exerciseTypes.find(type => type.id === record.exercise_type);
        if (exerciseType) {
          if (exerciseType.unit === '小时') {
            if (exerciseType.id === 'swimming') {
              current += record.value * 10;
            } else {
              current += record.value * 5;
            }
          } else if (exerciseType.id === 'cycling') {
            current += record.value * 0.5;
          } else {
            current += record.value;
          }
        }
      });
      
      return {
        current: current,
        target: goal.target,
        percentage: goal.target > 0 ? (current / goal.target) * 100 : 0
      };
    };
    
    // Calculate time progress
    const calculateTimeProgress = (goal) => {
      const startDate = new Date(goal.start_date);
      const endDate = new Date(goal.end_date);
      const currentDate = new Date();
      
      const actualCurrentDate = currentDate < startDate ? startDate : 
                              currentDate > endDate ? endDate : currentDate;
      
      const totalDuration = endDate - startDate;
      const elapsedDuration = actualCurrentDate - startDate;
      
      const percentage = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
      
      return {
        percentage: percentage
      };
    };
    
    // Calculate weight progress
    const calculateWeightProgress = (goal) => {
      if (!(goal.initial_weight && goal.current_weight && goal.target_weight)) {
        return 0;
      }
      
      return (Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100;
    };
    
    // Get weight progress color
    const getWeightProgressColor = (goal) => {
      if (!(goal.initial_weight && goal.current_weight && goal.target_weight)) {
        return '#2ecc71';
      }
      
      return goal.initial_weight > goal.target_weight ? 
        (goal.current_weight <= goal.target_weight ? '#2ecc71' : '#e74c3c') : 
        (goal.current_weight >= goal.target_weight ? '#2ecc71' : '#e74c3c');
    };
    
    // Get goal status
    const getGoalStatus = (goal) => {
      const progress = calculateGoalProgress(goal);
      const timeProgress = calculateTimeProgress(goal);
      const currentDate = new Date();
      const endDate = new Date(goal.end_date);
      
      if (progress.current >= goal.target) {
        return 'completed';
      }
      
      if (currentDate > endDate && progress.current < goal.target) {
        return 'failed';
      }
      
      return 'in-progress';
    };
    
    // Get unit for exercise type
    const getUnitForExerciseType = (typeId) => {
      const type = exerciseTypes.find(t => t.id === typeId);
      return type ? type.unit : 'km';
    };
    
    // Get exercise type name
    const getExerciseTypeName = (typeId) => {
      const type = exerciseTypes.find(t => t.id === typeId);
      return type ? type.name : '未知类型';
    };
    
    // Group records by date
    const groupRecordsByDate = (records) => {
      const grouped = {};
      records.forEach(record => {
        if (!grouped[record.record_date]) {
          grouped[record.record_date] = [];
        }
        grouped[record.record_date].push(record);
      });
      return grouped;
    };
    
    // Calculate daily total
    const calculateDailyTotal = (dailyRecords) => {
      let total = 0;
      dailyRecords.forEach(record => {
        const exerciseType = exerciseTypes.find(type => type.id === record.exercise_type);
        if (exerciseType) {
          if (exerciseType.unit === '小时') {
            if (exerciseType.id === 'swimming') {
              total += record.value * 10;
            } else {
              total += record.value * 5;
            }
          } else if (exerciseType.id === 'cycling') {
            total += record.value * 0.5;
          } else {
            total += record.value;
          }
        }
      });
      return total;
    };
    
    // Close modal
    const closeModal = () => {
      showCheckInModalFlag.value = false;
      showDetailsModalFlag.value = false;
      showEditRecordModal.value = false;
    };
    
    // Show alert
    const showAlert = (message, type = 'info') => {
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
    };
    
    // Lifecycle
    onMounted(() => {
      if (checkAuth()) {
        fetchGoals();
        fetchRecords();
      }
    });
    
    // Return exposed state and methods
    return {
      // State
      currentUser,
      goals,
      records,
      isLoadingGoals,
      isAddingGoal,
      isSavingCheckIn,
      isUpdatingRecord,
      isFetchingSummary,
      isLoadingRecords,
      
      // Modals
      showCheckInModalFlag,
      showDetailsModalFlag,
      showEditRecordModal,
      
      // Selected items
      selectedGoal,
      selectedGoalRecords,
      
      // Editing record
      editingRecord,
      editingRecordFormData,
      
      // Constants
      exerciseTypes,
      
      // Methods
      addGoal,
      deleteGoal,
      showCheckInModal,
      saveCheckIn,
      showDetailsModal,
      editRecord,
      saveEditedRecord,
      deleteRecord,
      showEditGoalModal,
      showGoalSummary,
      showMonthlySummary,
      calculateGoalProgress,
      calculateTimeProgress,
      calculateWeightProgress,
      getWeightProgressColor,
      getGoalStatus,
      getUnitForExerciseType,
      getExerciseTypeName,
      groupRecordsByDate,
      calculateDailyTotal,
      closeModal
    };
  }
});