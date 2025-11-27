import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
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
  emits: ['close'],
  template: `
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
  `
});