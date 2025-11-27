<template>
  <div class="detail-record">
    <div class="detail-record-info">
      <div class="detail-record-type">{{ exerciseTypeName }}</div>
      <div class="detail-record-value">{{ record.value }} {{ unit }}</div>
    </div>
    <div v-if="record.note" class="detail-record-note">{{ record.note }}</div>
    <div class="detail-record-actions">
      <button class="btn-edit-small" @click="$emit('edit', record)">编辑</button>
      <button class="btn-delete-small" @click="$emit('delete', record)">删除</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecordDetail',
  props: {
    record: {
      type: Object,
      required: true
    },
    exerciseTypeName: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  },
  emits: ['edit', 'delete']
}
</script>

<style scoped>
.detail-record {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.detail-record-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.detail-record-type {
  font-weight: bold;
  color: #3498db;
}

.detail-record-value {
  color: #2c3e50;
}

.detail-record-note {
  font-size: 0.9em;
  color: #7f8c8d;
  font-style: italic;
}

.detail-record-actions {
  margin-top: 10px;
  display: flex;
  gap: 5px;
}

.btn-edit-small, .btn-delete-small {
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.btn-edit-small {
  background-color: #3498db;
  color: white;
}

.btn-delete-small {
  background-color: #e74c3c;
  color: white;
}

.btn-edit-small:hover {
  background-color: #2980b9;
}

.btn-delete-small:hover {
  background-color: #c0392b;
}
</style>