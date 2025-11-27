import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
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
  emits: ['edit', 'delete'],
  template: `
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
  `
});