<template>
  <div id="app">
    <nav-component></nav-component>
    
    <div class="container">
      <h1>运动目标管理 - Vue模块化版</h1>
      
      <!-- Add Goal Form -->
      <div class="form-section">
        <h2 class="section-title">添加运动目标</h2>
        <GoalForm 
          :is-submitting="isAddingGoal"
          @submit="addGoal"
          submit-text="添加目标"
          submitting-text="添加中..."
        />
      </div>
      
      <!-- Goals List -->
      <div class="goals-section">
        <div class="section-title">
          <h2>我的运动目标</h2>
          <button class="btn-summary" @click="showMonthlySummary" :disabled="isFetchingSummary">
            <span v-if="!isFetchingSummary">月度汇总</span>
            <span v-else><span class="loading-spinner"></span> 加载中...</span>
          </button>
        </div>
        
        <div v-if="isLoadingGoals" class="no-goals">
          加载中...
        </div>
        
        <div v-else-if="goals.length === 0" class="no-goals">
          暂无运动目标，请添加一个目标。
        </div>
        
        <div v-else class="goals-list">
          <GoalCard
            v-for="goal in goals"
            :key="goal.id"
            :goal="goal"
            :progress="calculateGoalProgress(goal)"
            :time-progress="calculateTimeProgress(goal)"
            :goal-status="getGoalStatus(goal)"
            :weight-progress="calculateWeightProgress(goal)"
            :weight-progress-color="getWeightProgressColor(goal)"
            @check-in="showCheckInModal"
            @show-details="showDetailsModal"
            @show-summary="showGoalSummary"
            @edit="showEditGoalModal"
            @delete="deleteGoal"
          />
        </div>
      </div>
    </div>
    
    <!-- Check-in Modal -->
    <Modal 
      :is-visible="showCheckInModalFlag"
      title="运动打卡"
      @close="closeModal"
    >
      <div v-if="selectedGoal">
        <h3>{{ selectedGoal.title }}</h3>
        <CheckInForm
          :exercise-types="exerciseTypes"
          :initial-weight="selectedGoal.current_weight"
          :is-submitting="isSavingCheckIn"
          @submit="saveCheckIn"
          submit-text="完成打卡"
          submitting-text="打卡中..."
        />
      </div>
    </Modal>
    
    <!-- Details Modal -->
    <Modal 
      :is-visible="showDetailsModalFlag"
      title="打卡明细"
      @close="closeModal"
    >
      <div v-if="selectedGoal">
        <h3>{{ selectedGoal.title }}</h3>
        <div v-if="isLoadingRecords" class="no-records">
          加载中...
        </div>
        <div v-else-if="selectedGoalRecords.length === 0" class="no-records">
          暂无打卡记录
        </div>
        <div v-else>
          <div class="detail-date-section" v-for="(records, date) in groupRecordsByDate(selectedGoalRecords)" :key="date">
            <div class="detail-date-header">
              <h4>{{ date }} (总计: {{ calculateDailyTotal(records).toFixed(1) }} km)</h4>
            </div>
            <div class="detail-date-records">
              <RecordDetail
                v-for="record in records"
                :key="record.id"
                :record="record"
                :exercise-type-name="getExerciseTypeName(record.exercise_type)"
                :unit="getUnitForExerciseType(record.exercise_type)"
                @edit="editRecord"
                @delete="deleteRecord"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
    
    <!-- Edit Record Modal -->
    <Modal 
      :is-visible="showEditRecordModal"
      title="编辑打卡记录"
      @close="closeModal"
    >
      <CheckInForm
        v-if="editingRecord.id"
        :exercise-types="exerciseTypes"
        :initial-data="editingRecordFormData"
        :is-submitting="isUpdatingRecord"
        @submit="saveEditedRecord"
        submit-text="保存修改"
        submitting-text="保存中..."
      />
    </Modal>
  </div>
</template>

<script>
import GoalForm from './components/GoalForm.vue';
import GoalCard from './components/GoalCard.vue';
import Modal from './components/Modal.vue';
import CheckInForm from './components/CheckInForm.vue';
import RecordDetail from './components/RecordDetail.vue';

export default {
  name: 'App',
  components: {
    GoalForm,
    GoalCard,
    Modal,
    CheckInForm,
    RecordDetail
  },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
      goals: [],
      records: [],
      isLoadingGoals: false,
      isAddingGoal: false,
      isSavingCheckIn: false,
      isUpdatingRecord: false,
      isFetchingSummary: false,
      isLoadingRecords: false,
      
      // Modals
      showCheckInModalFlag: false,
      showDetailsModalFlag: false,
      showEditRecordModal: false,
      
      // Selected items
      selectedGoal: null,
      selectedGoalRecords: [],
      
      // Editing record
      editingRecord: {
        id: null,
        exerciseType: '',
        value: 0,
        recordDate: new Date().toISOString().split('T')[0],
        note: ''
      },
      
      // Exercise types
      exerciseTypes: [
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
      ]
    }
  },
  computed: {
    editingRecordFormData() {
      return {
        exerciseType: this.editingRecord.exerciseType,
        value: this.editingRecord.value,
        date: this.editingRecord.recordDate,
        note: this.editingRecord.note
      };
    }
  },
  async mounted() {
    if (this.checkAuth()) {
      await this.fetchGoals();
      await this.fetchRecords();
    }
  },
  methods: {
    // Auth check
    checkAuth() {
      if (!this.currentUser) {
        window.location.href = '/login.html';
        return false;
      }
      return true;
    },
    
    // Fetch goals
    async fetchGoals() {
      if (!this.checkAuth()) return;
      
      this.isLoadingGoals = true;
      try {
        const response = await fetch(`/api/exercise-goals?userId=${this.currentUser.id}`);
        if (!response.ok) throw new Error('获取运动目标失败');
        this.goals = await response.json();
      } catch (error) {
        this.showAlert('加载运动目标失败: ' + error.message, 'error');
      } finally {
        this.isLoadingGoals = false;
      }
    },
    
    // Fetch records
    async fetchRecords() {
      if (!this.checkAuth()) return;
      
      try {
        const response = await fetch(`/api/exercise-records?userId=${this.currentUser.id}`);
        if (!response.ok) throw new Error('获取运动记录失败');
        this.records = await response.json();
      } catch (error) {
        this.showAlert('加载运动记录失败: ' + error.message, 'error');
      }
    },
    
    // Add goal
    async addGoal(goalData) {
      if (!this.checkAuth()) return;
      
      this.isAddingGoal = true;
      try {
        const response = await fetch(`/api/exercise-goals?userId=${this.currentUser.id}`, {
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
        await this.fetchGoals();
        
        this.$refs.goalForm.resetForm();
        
        this.showAlert('目标创建成功！', 'success');
      } catch (error) {
        this.showAlert(error.message || '创建目标失败', 'error');
      } finally {
        this.isAddingGoal = false;
      }
    },
    
    // Delete goal
    async deleteGoal(goal) {
      if (!confirm('确定要删除这个运动目标吗？\n\n注意：删除目标会同时删除所有相关的打卡记录，此操作不可恢复！')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/exercise-goals/${goal.id}?userId=${this.currentUser.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '删除失败');
        }
        
        await this.fetchGoals();
        this.showAlert('目标删除成功！', 'success');
      } catch (error) {
        this.showAlert('删除目标失败: ' + error.message, 'error');
      }
    },
    
    // Show check-in modal
    showCheckInModal(goal) {
      this.selectedGoal = goal;
      this.showCheckInModalFlag = true;
    },
    
    // Save check-in
    async saveCheckIn(checkInData) {
      if (!this.checkAuth()) return;
      
      this.isSavingCheckIn = true;
      try {
        const recordData = {
          goalId: this.selectedGoal.id,
          exerciseType: checkInData.exerciseType,
          value: checkInData.value,
          recordDate: checkInData.date,
          note: checkInData.note
        };
        
        const response = await fetch(`/api/exercise-records?userId=${this.currentUser.id}`, {
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
          const weightResponse = await fetch(`/api/exercise-goals/${this.selectedGoal.id}/weight?userId=${this.currentUser.id}`, {
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
        
        this.closeModal();
        await this.fetchGoals();
        this.showAlert('打卡成功！', 'success');
      } catch (error) {
        this.showAlert('打卡失败: ' + error.message, 'error');
      } finally {
        this.isSavingCheckIn = false;
      }
    },
    
    // Show details modal
    async showDetailsModal(goal) {
      this.selectedGoal = goal;
      this.showDetailsModalFlag = true;
      this.isLoadingRecords = true;
      
      try {
        const response = await fetch(`/api/exercise-records/goal/${goal.id}?userId=${this.currentUser.id}`);
        if (!response.ok) throw new Error('获取运动记录失败');
        this.selectedGoalRecords = await response.json();
      } catch (error) {
        this.showAlert('加载运动记录失败: ' + error.message, 'error');
      } finally {
        this.isLoadingRecords = false;
      }
    },
    
    // Edit record
    async editRecord(record) {
      try {
        const response = await fetch(`/api/exercise-records/single/${record.id}?userId=${this.currentUser.id}`);
        if (!response.ok) throw new Error('获取运动记录失败');
        const recordData = await response.json();
        
        this.editingRecord = {
          id: recordData.id,
          exerciseType: recordData.exercise_type,
          value: recordData.value,
          recordDate: recordData.record_date,
          note: recordData.note || ''
        };
        
        this.showEditRecordModal = true;
      } catch (error) {
        this.showAlert('加载打卡记录失败: ' + error.message, 'error');
      }
    },
    
    // Save edited record
    async saveEditedRecord(editedData) {
      this.isUpdatingRecord = true;
      try {
        const recordData = {
          exerciseType: editedData.exerciseType,
          value: editedData.value,
          recordDate: editedData.date,
          note: editedData.note
        };
        
        const response = await fetch(`/api/exercise-records/${this.editingRecord.id}?userId=${this.currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recordData)
        });
        
        if (!response.ok) {
          throw new Error('更新打卡记录失败');
        }
        
        this.closeModal();
        await this.showDetailsModal(this.selectedGoal);
        this.showAlert('打卡记录更新成功！', 'success');
      } catch (error) {
        this.showAlert('更新打卡记录失败: ' + error.message, 'error');
      } finally {
        this.isUpdatingRecord = false;
      }
    },
    
    // Delete record
    async deleteRecord(record) {
      if (!confirm('确定要删除这条打卡记录吗？此操作不可恢复！')) {
        return;
      }
      
      try {
        const response = await fetch(`/api/exercise-records/${record.id}?userId=${this.currentUser.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '删除失败');
        }
        
        await this.showDetailsModal(this.selectedGoal);
        this.showAlert('打卡记录删除成功！', 'success');
      } catch (error) {
        this.showAlert('删除打卡记录失败: ' + error.message, 'error');
      }
    },
    
    // Show edit goal modal
    showEditGoalModal(goal) {
      this.showAlert('编辑功能尚未完全实现', 'info');
    },
    
    // Show goal summary
    showGoalSummary(goal) {
      this.showAlert('目标汇总功能尚未完全实现', 'info');
    },
    
    // Show monthly summary
    async showMonthlySummary() {
      this.isFetchingSummary = true;
      try {
        this.showAlert('月度汇总功能尚未完全实现', 'info');
      } catch (error) {
        this.showAlert('加载月度总结失败: ' + error.message, 'error');
      } finally {
        this.isFetchingSummary = false;
      }
    },
    
    // Calculate goal progress
    calculateGoalProgress(goal) {
      const recordsForGoal = this.records.filter(record => record.goal_id == goal.id);
      let current = 0;
      
      recordsForGoal.forEach(record => {
        const exerciseType = this.exerciseTypes.find(type => type.id === record.exercise_type);
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
    },
    
    // Calculate time progress
    calculateTimeProgress(goal) {
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
    },
    
    // Calculate weight progress
    calculateWeightProgress(goal) {
      if (!(goal.initial_weight && goal.current_weight && goal.target_weight)) {
        return 0;
      }
      
      return (Math.abs(goal.initial_weight - goal.current_weight) / Math.abs(goal.initial_weight - goal.target_weight)) * 100;
    },
    
    // Get weight progress color
    getWeightProgressColor(goal) {
      if (!(goal.initial_weight && goal.current_weight && goal.target_weight)) {
        return '#2ecc71';
      }
      
      return goal.initial_weight > goal.target_weight ? 
        (goal.current_weight <= goal.target_weight ? '#2ecc71' : '#e74c3c') : 
        (goal.current_weight >= goal.target_weight ? '#2ecc71' : '#e74c3c');
    },
    
    // Get goal status
    getGoalStatus(goal) {
      const progress = this.calculateGoalProgress(goal);
      const timeProgress = this.calculateTimeProgress(goal);
      const currentDate = new Date();
      const endDate = new Date(goal.end_date);
      
      if (progress.current >= goal.target) {
        return 'completed';
      }
      
      if (currentDate > endDate && progress.current < goal.target) {
        return 'failed';
      }
      
      return 'in-progress';
    },
    
    // Get unit for exercise type
    getUnitForExerciseType(typeId) {
      const type = this.exerciseTypes.find(t => t.id === typeId);
      return type ? type.unit : 'km';
    },
    
    // Get exercise type name
    getExerciseTypeName(typeId) {
      const type = this.exerciseTypes.find(t => t.id === typeId);
      return type ? type.name : '未知类型';
    },
    
    // Group records by date
    groupRecordsByDate(records) {
      const grouped = {};
      records.forEach(record => {
        if (!grouped[record.record_date]) {
          grouped[record.record_date] = [];
        }
        grouped[record.record_date].push(record);
      });
      return grouped;
    },
    
    // Calculate daily total
    calculateDailyTotal(dailyRecords) {
      let total = 0;
      dailyRecords.forEach(record => {
        const exerciseType = this.exerciseTypes.find(type => type.id === record.exercise_type);
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
    },
    
    // Close modal
    closeModal() {
      this.showCheckInModalFlag = false;
      this.showDetailsModalFlag = false;
      this.showEditRecordModal = false;
    },
    
    // Show alert
    showAlert(message, type = 'info') {
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
    }
  }
}
</script>

<style scoped>
.form-section {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.section-title {
  margin-bottom: 20px;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  font-size: 1.4em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goals-section {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.goals-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.no-goals {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 20px;
}

.btn-summary {
  background-color: #1abc9c;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-summary:hover {
  background-color: #16a085;
}

.btn-summary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.detail-date-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.detail-date-header h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.no-records {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 20px;
}

/* Alert Styles */
.custom-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.custom-alert-success {
  background-color: #2ecc71;
  color: white;
}

.custom-alert-error {
  background-color: #e74c3c;
  color: white;
}

.custom-alert-info {
  background-color: #3498db;
  color: white;
}

.custom-alert-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-alert-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.2em;
  cursor: pointer;
  margin-left: 15px;
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

