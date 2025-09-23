<!-- 文本输入框 -->

<template>
  <form @submit.prevent="handleSubmit">
    <!-- 文本框 -->
    <div style="margin-top:8px;">
      <textarea
        v-model="inputValue"
        :placeholder="placeholder"
        rows="6"
        class="textarea"
        @input="onInput"
        @keydown.enter.exact.prevent="handleSubmit"
      ></textarea>
    </div>

    <div style="margin-top:8px;color:#666;font-size:14px;">当前字符数: {{ inputValue.length }}</div>
    
    <!-- 提交按钮 -->
    <div style="text-align:right;margin-top:12px;">
      <button
        type="submit"
        class="submit-button"
        :class="{ active: inputValue.trim().length > 0 || submitType === 'pause' }"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="submit-svg" v-show="submitType === 'submit'">
          <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white"/>
        </svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="submit-svg" v-show="submitType === 'pause'">
          <rect x="6" y="5" width="3.5" height="14" rx="1.5" fill="white"/>
          <rect x="14.5" y="5" width="3.5" height="14" rx="1.5" fill="white"/>
        </svg>
        {{ submitType === 'submit' ? '提交' : submitType === 'pause' ? '暂停' : '' }}
      </button> 
    </div>
  </form>
</template>

<script>
export default {
  name: 'MultiLineInput',
  props: {
    /**
     * 绑定的输入内容
     */
    value: {
      type: String,
      default: ''
    },

    /**
     * 输入框的占位符
     */
    placeholder: {
      type: String,
      default: '试着跟他聊聊天吧',
    },

    /**
     * 提交按钮的类型，submit表示提交，pause表示暂停
     */
    submitType: {
      type: String,
      default: 'submit'
    }
  },
  data() {
    return {
      inputValue: this.value,
    };
  },
  watch: {
    value(val) {
      this.inputValue = val;
    }
  },
  methods: {
    /**
     * 输入内容变化时，更新绑定的值
     */
    onInput() {
      this.$emit('input', this.inputValue);
    },

    /**
     * 提交按钮点击时的处理
     */
    handleSubmit() {
      // 若输入文本为空且不在聊天状态内（submitType不为pause），则不提交
      if (this.inputValue.trim().length === 0 && this.submitType === 'submit') return;
      this.$emit('submit', this.inputValue);
    }
  }
};
</script>

<style scoped>
.textarea {
  width: 100%;
  height: 120px;
  padding: 10px;
  border: 2px solid #2a3a5a;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
  outline: none;
}

.submit-button {
  background:#92b1f5;
  color:#fff;
  padding:6px 24px;
  border:none;
  border-radius:8px;
  font-size:14px;
  display:inline-flex;
  align-items:center;
  transition: background-color 0.3s;
}
.submit-button:hover {
  background-color: #8ea6eb;
  cursor: not-allowed;
}

.submit-button.active {
  background: #2563eb;
}
.submit-button.active:hover {
  background: #1d4ed8;
  cursor: pointer;
}

.submit-svg {
  margin-right: 6px;
}
</style>
