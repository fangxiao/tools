<template>
  <div id="app" v-cloak>
    <header>
      <h1>运动目标管理 - Vue组件版</h1>
      <div class="user-info" v-if="currentUser">
        <span>欢迎, {{ currentUser.username }}!</span>
        <button class="btn-logout" @click="logout">退出登录</button>
      </div>
    </header>

    <div class="container">
      <!-- 创建目标表单 -->
      <section class="form-section">
        <h2 class="section-title">创建新目标</h2>
        <GoalForm 
          :goal="newGoal"
          :loading="isAddingGoal"
          @submit="addGoal"
          @cancel="resetNewGoalForm"
          @update-date-fields="updateDateFields"
        />
      </section>

      <!-- 目标列表区域 -->
      <section class="goals-section">
        <h2 class="section-title">我的运动目标</h2>
        <div v-if="isLoadingGoals" class="loading">加载中...</div>
        <div v-else-if="goals.length === 0" class="no-goals">暂无运动目标</div>
        <div v-else>
          <GoalList 
            :goals="goals"
            @show-details="handleShowDetails"
            @show-check-in="handleShowCheckIn"
            @show-edit-goal="handleShowEditGoal"
            @delete-goal="handleDeleteGoal"
            @show-summary="handleShowSummary"
          />
        </div>
      </section>
    </div>

    <!-- 添加目标模态框 -->
    <div v-if="modal.addGoal.visible" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modal.addGoal.title }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <GoalForm 
            :goal="newGoal"
            :loading="isAddingGoal"
            @submit="addGoal"
            @cancel="closeModal"
            @update-date-fields="updateDateFields"
          />
        </div>
      </div>
    </div>

    <!-- 编辑目标模态框 -->
    <div v-if="modal.editGoal.visible" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modal.editGoal.title }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <GoalForm 
            :goal="editForm"
            :is-edit="true"
            :loading="isUpdatingGoal"
            @submit="updateGoal"
            @cancel="closeModal"
            @update-date-fields="updateDateFields"
          />
        </div>
      </div>
    </div>

    <!-- 打卡模态框 -->
    <div v-if="modal.checkIn.visible" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modal.checkIn.title }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <CheckInForm 
            :goal="selectedGoal"
            :exercise-types="exerciseTypes"
            :loading="isSubmittingCheckIn"
            @submit="submitCheckIn"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>

    <!-- 明细模态框 -->
    <DetailsModal 
      v-if="modal.details.visible"
      :records="detailRecords"
      :exercise-types="exerciseTypes"
      :title="modal.details.title"
      :loading="isLoadingDetails"
      @edit-record="handleShowEditRecord"
      @delete-record="handleDeleteRecord"
      @close="closeModal"
    />

    <!-- 汇总模态框 -->
    <SummaryModal
      v-if="modal.summary.visible"
      :goal="selectedGoal"
      :stats="summaryStats"
      :exercise-types="exerciseTypes"
      :ai-recommendations="summaryStats.aiRecommendations"
      :ai-loading="summaryStats.aiLoading"
      :title="modal.summary.title"
      @refresh-ai="handleRefreshAI"
      @export-image="exportSummaryAsImage"
      @close="closeModal"
    />

    <!-- 编辑记录模态框 -->
    <div v-if="modal.editRecord.visible" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modal.editRecord.title }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <EditRecordForm
            :record="editRecordForm"
            :exercise-types="exerciseTypes"
            :loading="isUpdatingRecord"
            @submit="updateRecord"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>

    <!-- 确认对话框 -->
    <div v-if="confirmDialog.visible" class="modal-overlay" @click="confirmDialog.onCancel">
      <div class="modal-content small" @click.stop>
        <div class="modal-header">
          <h3>确认操作</h3>
        </div>
        <div class="modal-body">
          <p>{{ confirmDialog.message }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="confirmDialog.onCancel">取消</button>
            <button class="btn-danger" @click="confirmDialog.onConfirm">确认</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div v-if="alert.visible" class="alert" :class="'alert-' + alert.type">
      {{ alert.message }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import GoalList from './GoalList.vue';
import GoalForm from './GoalForm.vue';
import CheckInForm from './CheckInForm.vue';
import DetailsModal from './DetailsModal.vue';
import SummaryModal from './SummaryModal.vue';
import EditRecordForm from './EditRecordForm.vue';

export default {
  name: 'App',
  components: {
    GoalList,
    GoalForm,
    CheckInForm,
    DetailsModal,
    SummaryModal,
    EditRecordForm
  },
  setup() {
    // 用户信息
    const currentUser = ref(null);
    
    // 目标数据
    const goals = ref([]);
    const isLoadingGoals = ref(false);
    
    // 记录数据
    const detailRecords = ref([]);
    const isLoadingDetails = ref(false);
    
    // 模态框状态
    const modal = reactive({
      addGoal: {
        visible: false,
        title: '新建运动目标'
      },
      editGoal: {
        visible: false,
        title: '编辑运动目标'
      },
      checkIn: {
        visible: false,
        title: '运动打卡'
      },
      details: {
        visible: false,
        title: '打卡明细'
      },
      summary: {
        visible: false,
        title: '运动汇总'
      },
      editRecord: {
        visible: false,
        title: '编辑运动记录'
      }
    });
    
    // 表单数据
    const isAddingGoal = ref(false);
    const isUpdatingGoal = ref(false);
    const isSubmittingCheckIn = ref(false);
    const isUpdatingRecord = ref(false);
    
    // 编辑状态
    const selectedGoal = ref({});
    const editForm = reactive({});
    const editRecordForm = reactive({});
    
    // 汇总统计
    const summaryStats = reactive({
      totalRecords: 0,
      totalDistance: 0,
      exerciseTypeStats: {},
      progress: {
        current: 0,
        target: 0,
        percentage: 0
      },
      initialWeight: null,
      currentWeight: null,
      targetWeight: null,
      aiRecommendations: [],
      aiLoading: false
    });
    
    // 对话框和提示
    const confirmDialog = reactive({
      visible: false,
      message: '',
      onConfirm: function() {},
      onCancel: function() {}
    });
    
    const alert = reactive({
      visible: false,
      message: '',
      type: 'info'
    });
    
    // 运动类型
    const exerciseTypes = {
      running: { name: '跑步', unit: '公里' },
      cycling: { name: '骑行', unit: '公里' },
      swimming: { name: '游泳', unit: '公里' },
      walking: { name: '步行', unit: '公里' },
      gym: { name: '健身', unit: '小时' },
      yoga: { name: '瑜伽', unit: '小时' }
    };
    
    // 新建目标表单
    const newGoal = reactive({
      period: 'none',
      title: '',
      target: '',
      startDate: '',
      endDate: '',
      initialWeight: '',
      targetWeight: '',
      visibility: 'private'
    });
    
    // 初始化日期字段
    const initDateFields = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      if (!newGoal.startDate) {
        newGoal.startDate = todayStr;
      }
      
      if (!newGoal.endDate) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextYear = nextMonth.getFullYear();
        const nextMonthStr = String(nextMonth.getMonth() + 1).padStart(2, '0');
        const nextDay = String(nextMonth.getDate()).padStart(2, '0');
        newGoal.endDate = `${nextYear}-${nextMonthStr}-${nextDay}`;
      }
    };
    
    // 检查认证状态
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('currentUser');
      
      if (!token || !user) {
        window.location.href = '/login.html';
        return false;
      }
      
      currentUser.value = JSON.parse(user);
      return true;
    };
    
    // 显示模态框
    const showModal = (modalName, title) => {
      modal[modalName].visible = true;
      modal[modalName].title = title;
    };
    
    // 关闭模态框
    const closeModal = () => {
      for (let key in modal) {
        modal[key].visible = false;
      }
    };
    
    // 显示确认对话框
    const showConfirm = (message, onConfirm, onCancel) => {
      confirmDialog.visible = true;
      confirmDialog.message = message;
      confirmDialog.onConfirm = () => {
        confirmDialog.visible = false;
        onConfirm();
      };
      confirmDialog.onCancel = () => {
        confirmDialog.visible = false;
        if (onCancel) onCancel();
      };
    };
    
    // 显示提醒
    const showAlert = (message, type = 'info') => {
      alert.visible = true;
      alert.message = message;
      alert.type = type;
      
      setTimeout(() => {
        alert.visible = false;
      }, 3000);
    };
    
    // 获取目标列表
    const fetchGoals = async () => {
      if (!checkAuth()) return;
      
      isLoadingGoals.value = true;
      try {
        const response = await fetch(`/api/exercise-goals?userId=${currentUser.value.id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        goals.value = await response.json();
      } catch (error) {
        console.error('获取目标列表时出错:', error);
        showAlert('获取目标列表失败，请重试', 'error');
      } finally {
        isLoadingGoals.value = false;
      }
    };
    
    // 添加目标
    const addGoal = async (goalData) => {
      if (!checkAuth()) return;
      
      isAddingGoal.value = true;
      try {
        const goalPayload = {
          title: goalData.title,
          target: parseFloat(goalData.target),
          start_date: goalData.startDate,
          end_date: goalData.endDate,
          initial_weight: goalData.initialWeight ? parseFloat(goalData.initialWeight) : null,
          target_weight: goalData.targetWeight ? parseFloat(goalData.targetWeight) : null,
          visibility: goalData.visibility,
          user_id: currentUser.value.id
        };
        
        const response = await fetch('/api/exercise-goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(goalPayload)
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        showAlert('目标创建成功！', 'success');
        closeModal();
        await fetchGoals();
        
        // 重置表单
        resetNewGoalForm();
      } catch (error) {
        console.error('创建目标时出错:', error);
        showAlert('创建目标失败，请重试', 'error');
      } finally {
        isAddingGoal.value = false;
      }
    };
    
    // 重置新建目标表单
    const resetNewGoalForm = () => {
      Object.assign(newGoal, {
        period: 'none',
        title: '',
        target: '',
        startDate: '',
        endDate: '',
        initialWeight: '',
        targetWeight: '',
        visibility: 'private'
      });
      initDateFields();
    };
    
    // 显示编辑目标模态框
    const handleShowEditGoal = (goal) => {
      Object.assign(editForm, goal);
      showModal('editGoal', '编辑运动目标');
    };
    
    // 更新目标
    const updateGoal = async (updatedGoal) => {
      if (!checkAuth()) return;
      
      isUpdatingGoal.value = true;
      try {
        const response = await fetch(`/api/exercise-goals/${editForm.id}?userId=${currentUser.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedGoal)
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        showAlert('目标更新成功！', 'success');
        closeModal();
        await fetchGoals();
      } catch (error) {
        console.error('更新目标时出错:', error);
        showAlert('更新目标失败，请重试', 'error');
      } finally {
        isUpdatingGoal.value = false;
      }
    };
    
    // 删除目标
    const handleDeleteGoal = (goal) => {
      showConfirm(
        '确定要删除这个运动目标吗？此操作无法撤销。',
        async () => {
          try {
            const response = await fetch(`/api/exercise-goals/${goal.id}?userId=${currentUser.value.id}`, {
              method: 'DELETE'
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            showAlert('目标删除成功！', 'success');
            await fetchGoals();
          } catch (error) {
            console.error('删除目标时出错:', error);
            showAlert('删除目标失败，请重试', 'error');
          }
        }
      );
    };
    
    // 显示打卡模态框
    const handleShowCheckIn = (goal) => {
      selectedGoal.value = goal;
      showModal('checkIn', `为"${goal.title}"打卡`);
    };
    
    // 提交打卡
    const submitCheckIn = async (checkInData) => {
      if (!checkAuth()) return;
      
      isSubmittingCheckIn.value = true;
      try {
        const recordData = {
          goal_id: selectedGoal.value.id,
          date: checkInData.date,
          type: checkInData.type,
          distance: parseFloat(checkInData.distance),
          duration: checkInData.duration || null,
          start_time: checkInData.startTime || null,
          end_time: checkInData.endTime || null,
          user_id: currentUser.value.id
        };
        
        const response = await fetch('/api/exercise-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recordData)
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        showAlert('打卡成功！', 'success');
        closeModal();
        await fetchGoals();
      } catch (error) {
        console.error('打卡时出错:', error);
        showAlert('打卡失败，请重试', 'error');
      } finally {
        isSubmittingCheckIn.value = false;
      }
    };
    
    // 显示详情模态框
    const handleShowDetails = async (goal) => {
      if (!checkAuth()) return;
      
      isLoadingDetails.value = true;
      try {
        const response = await fetch(`/api/exercise-records?goalId=${goal.id}&userId=${currentUser.value.id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        detailRecords.value = await response.json();
        
        selectedGoal.value = goal;
        showModal('details', `"${goal.title}"的打卡明细`);
      } catch (error) {
        console.error('获取明细时出错:', error);
        showAlert('获取打卡明细失败，请重试', 'error');
      } finally {
        isLoadingDetails.value = false;
      }
    };
    
    // 显示编辑记录模态框
    const handleShowEditRecord = (record) => {
      Object.assign(editRecordForm, record);
      showModal('editRecord', '编辑运动记录');
    };
    
    // 更新记录
    const updateRecord = async (updatedRecord) => {
      if (!checkAuth()) return;
      
      isUpdatingRecord.value = true;
      try {
        const response = await fetch(`/api/exercise-records/${editRecordForm.id}?userId=${currentUser.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedRecord)
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        showAlert('记录更新成功！', 'success');
        closeModal();
        // 刷新相关数据
        await fetchGoals();
        if (modal.details.visible) {
          await handleShowDetails(selectedGoal.value);
        }
      } catch (error) {
        console.error('更新记录时出错:', error);
        showAlert('更新记录失败，请重试', 'error');
      } finally {
        isUpdatingRecord.value = false;
      }
    };
    
    // 删除记录
    const handleDeleteRecord = (recordId) => {
      showConfirm(
        '确定要删除这条运动记录吗？此操作无法撤销。',
        async () => {
          try {
            const response = await fetch(`/api/exercise-records/${recordId}?userId=${currentUser.value.id}`, {
              method: 'DELETE'
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            showAlert('记录删除成功！', 'success');
            // 刷新相关数据
            await fetchGoals();
            if (modal.details.visible) {
              await handleShowDetails(selectedGoal.value);
            }
          } catch (error) {
            console.error('删除记录时出错:', error);
            showAlert('删除记录失败，请重试', 'error');
          }
        }
      );
    };
    
    // 显示汇总
    const handleShowSummary = async (goal) => {
      if (!checkAuth()) return;
      
      try {
        // 获取汇总统计数据
        const response = await fetch(`/api/exercise-stats/${goal.id}?userId=${currentUser.value.id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const stats = await response.json();
        
        // 更新响应式数据
        Object.assign(summaryStats, stats);
        
        selectedGoal.value = goal;
        showModal('summary', `"${goal.title}"的运动汇总`);
        
        // 获取AI建议
        await fetchAIRecommendations(goal.id);
      } catch (error) {
        console.error('获取汇总时出错:', error);
        showAlert('获取运动汇总失败，请重试', 'error');
      }
    };
    
    // 获取AI建议
    const fetchAIRecommendations = async (goalId) => {
      summaryStats.aiLoading = true;
      try {
        const response = await fetch(`/api/spark/recommendations?goalId=${goalId}&userId=${currentUser.value.id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        summaryStats.aiRecommendations = data.recommendations || [];
      } catch (error) {
        console.error('获取AI建议时出错:', error);
        summaryStats.aiRecommendations = ['暂时无法获取个性化建议，请稍后再试。'];
      } finally {
        summaryStats.aiLoading = false;
      }
    };
    
    // 刷新AI建议
    const handleRefreshAI = async () => {
      if (selectedGoal.value.id) {
        await fetchAIRecommendations(selectedGoal.value.id);
      }
    };
    
    // 导出为图片
    const exportSummaryAsImage = async () => {
      try {
        showAlert('正在生成图片...', 'info');
        
        // 等待html2canvas加载
        if (typeof html2canvas === 'undefined') {
          throw new Error('html2canvas library not loaded');
        }
        
        // 获取要截图的元素
        const element = document.getElementById('summary-content');
        if (!element) {
          throw new Error('Summary content element not found');
        }
        
        // 保存原始滚动条状态
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        
        // 隐藏滚动条以避免截图时出现滚动条
        document.body.style.overflow = 'hidden';
        // 临时移除滚动条占据的空间
        document.body.style.paddingRight = '0px';
        
        // 强制重排以应用样式更改
        document.body.offsetHeight;
        
        // 配置html2canvas选项
        const options = {
          scale: 2, // 提高图片质量
          useCORS: true, // 支持跨域图片
          logging: false, // 减少控制台日志
          scrollX: 0,
          scrollY: 0,
        };
        
        // 在移动设备上限制最大宽度
        if (window.innerWidth < 768) {
          options.width = Math.min(element.scrollWidth, window.innerWidth);
        }
        
        // 渲染元素为canvas
        const canvas = await html2canvas(element, options);
        
        // 恢复原始滚动条状态
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        
        // 将canvas转换为blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95));
        
        // 生成带日期的文件名
        const now = new Date();
        const dateString = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const filename = `summary_${dateString}.png`;
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // 检查浏览器支持
        if (typeof link.download !== 'undefined') {
          // 现代浏览器支持download属性
          try {
            // 添加链接到DOM
            document.body.appendChild(link);
            
            // 触发点击事件
            if (link.click) {
              link.click();
            } else if (document.createEvent) {
              const event = document.createEvent('MouseEvents');
              event.initEvent('click', true, true);
              link.dispatchEvent(event);
            }
            
            // 延迟清理以确保下载触发
            setTimeout(() => {
              try {
                if (link.parentNode) {
                  link.parentNode.removeChild(link);
                }
                URL.revokeObjectURL(url);
              } catch (e) {
                console.warn("清理下载链接时出错:", e);
              }
            }, 100);
          } catch (e) {
            console.error("添加或点击下载链接时出错:", e);
            // 清理可能已创建但未正确添加的元素
            try {
              if (link && link.parentNode) {
                link.parentNode.removeChild(link);
              }
              URL.revokeObjectURL(url);
            } catch (cleanupError) {
              console.warn("清理下载链接时出错:", cleanupError);
            }
            throw e;
          }
        } else {
          // fallback方案
          try {
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
          } catch (e) {
            console.error("Fallback下载方案失败:", e);
            // 最后的fallback
            showAlert("无法自动下载文件，请手动保存图片", "warning");
          }
        }
      } catch (error) {
        console.error("下载文件时出错:", error);
        showAlert("下载文件时出错，请手动保存图片: " + (error.message || ""), "error");
      }
    };
    
    // 登出
    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login.html';
    };
    
    // 更新日期字段
    const updateDateFields = (period) => {
      const today = new Date();
      let startDate, endDate;
      
      switch (period) {
        case 'daily':
          startDate = today;
          endDate = new Date(today);
          endDate.setDate(endDate.getDate() + 1);
          break;
        case 'weekly':
          // 本周一
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
          // 下周一
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 7);
          break;
        case 'monthly':
          // 本月第一天
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          // 下月第一天
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          break;
        default:
          return;
      }
      
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      newGoal.startDate = formatDate(startDate);
      newGoal.endDate = formatDate(endDate);
    };
    
    // 组件挂载时执行
    onMounted(() => {
      if (!checkAuth()) return;
      
      // 初始化日期字段
      initDateFields();
      
      // 获取目标列表
      fetchGoals();
    });
    
    // 暴露给模板的方法和数据
    return {
      // 状态
      isLoadingGoals,
      isLoadingDetails,
      isAddingGoal,
      isSubmittingCheckIn,
      isUpdatingGoal,
      isUpdatingRecord,
      
      // 数据
      goals,
      detailRecords,
      summaryStats,
      currentUser,
      exerciseTypes,
      newGoal,
      editForm,
      editRecordForm,
      selectedGoal,
      
      // 模态框
      modal,
      confirmDialog,
      alert,
      
      // 方法
      addGoal,
      handleShowEditGoal,
      updateGoal,
      handleDeleteGoal,
      handleShowCheckIn,
      submitCheckIn,
      handleShowDetails,
      handleShowEditRecord,
      updateRecord,
      handleDeleteRecord,
      handleShowSummary,
      exportSummaryAsImage,
      handleRefreshAI,
      closeModal,
      showConfirm,
      showAlert,
      logout,
      updateDateFields,
      resetNewGoalForm
    };
  }
};
</script>

<style scoped>
[v-cloak] {
  display: none;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

header h1 {
  margin: 0;
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-logout {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background-color: #c0392b;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section-title {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.form-section {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.goals-section {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.loading,
.no-goals {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-style: italic;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.small {
  width: 90%;
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 25px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  max-width: 400px;
  animation: slideIn 0.3s, fadeOut 0.5s 2.5s;
}

.alert-success {
  background-color: #2ecc71;
  color: white;
}

.alert-error {
  background-color: #e74c3c;
  color: white;
}

.alert-info {
  background-color: #3498db;
  color: white;
}

.alert-warning {
  background-color: #f39c12;
  color: white;
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

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>