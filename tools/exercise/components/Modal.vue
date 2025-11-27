<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="modal-close" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  emits: ['close']
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #aaa;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}
</style>