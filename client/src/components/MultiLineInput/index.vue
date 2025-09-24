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
    
    <!-- 提交按钮列表 -->
    <div class="submit-list">
      <div
        class="microphone"
        :class="{ active: microphone }"
        @click="onClick_microphone"
      >
        <svg viewBox="0 0 1024 1024"  width="18" height="18" fill="white">
          <path d="M512 62a184.09090869 184.09090869 0 0 1 184.09090869 184.09090869v204.54545478a184.09090869 184.09090869 0 1 1-368.18181738 1e-8v-204.54545479A184.09090869 184.09090869 0 0 1 512 62z m0 65.45454521a118.63636348 118.63636348 0 0 0-118.63636348 118.63636348v204.54545479a118.63636348 118.63636348 0 1 0 237.27272695 0v-204.54545479A118.63636348 118.63636348 0 0 0 512 127.45454521z"></path>
          <path d="M192.90909131 471.09090869a319.09090869 319.09090869 0 0 0 638.18181738 0 32.72727305 32.72727305 0 1 0-65.45454521 0 253.63636348 253.63636348 0 0 1-507.27272695 0 32.72727305 32.72727305 0 1 0-65.45454522 0z" p-id="5256"></path><path d="M479.27272695 757.45454521v131.85a32.72727305 32.72727305 0 1 0 65.4545461 0V757.45454521a32.72727305 32.72727305 0 1 0-65.4545461 0z"></path>
          <path d="M409.72727305 953.81818174h206.87727216a32.72727305 32.72727305 0 1 0 0-65.45454522H409.72727305a32.72727305 32.72727305 0 1 0 0 65.45454522z"></path></svg>
      </div>
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
      default: '',
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
      /**
       * 输入框文本
       */
      inputValue: this.value,

      /**
       * 麦克风是否被开启
       */
      microphone: false,
    };
  },
  watch: {
    value(val) {
      this.inputValue = val;
    }
  },
  methods: {
    

    
    /***************************************************************
     * 工具函数集合 helper
     ***************************************************************/


     
    /***************************************************************
     * 数据函数集合 data
     ***************************************************************/



    /***************************************************************
     * 事件函数集合(部分) onevent_part
     ***************************************************************/


    /***************************************************************
     * 事件函数集合 onevent
     ***************************************************************/
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
    },
    
    /**
     * 开启或关闭麦克风
     */
    onClick_microphone() {
      this.microphone = !this.microphone;
    },


    /***************************************************************
     * 其他函数集合 other
     ***************************************************************/
    

  }
};
</script>

<style scoped>
.textarea {
  width: 100%;
  height: 120px;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
  outline: none;
}

.submit-list {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top:12px;
}

.microphone {
  width: 32px;
  height: 32px;
  border: 1px solid #00000000;
  border-radius: 50%;
  background: #2563eb;
  display:inline-flex;
  justify-content: center;
  align-items: center;
}
.microphone:hover {
  background: #1d4ed8;
  cursor: pointer;
}

.microphone.active {
  background: #92b1f5;
}
.microphone.active:hover {
  background: #8ea6eb;
  cursor: pointer;
}

.submit-button {
  background: #92b1f5;
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
