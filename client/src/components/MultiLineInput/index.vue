<!-- 文本输入框 -->

<template>
  <form @submit.prevent="onSubmit">
    <!-- 文本框 -->
    <div style="margin-top:4px;">
      <textarea
        v-model="inputValue"
        :placeholder="placeholder"
        rows="6"
        maxlength="2000"
        class="textarea"
        @click="onClick_stopAsr"
        @input="onInput"
        @keydown.enter.exact.prevent="handleSubmit"
      >
      </textarea>
    </div>

    <div style="margin-top:4px;color:#666;font-size:14px;">当前字符数: {{ inputValue.length }}</div>
    
    <!-- 提交按钮列表 -->
    <div class="submit-list">
      <!-- 麦克风/语音输入 -->
      <div
        class="microphone"
        @click="onClick_microphone"
      >
        <svg v-show="!microphone" viewBox="0 0 1024 1024"  width="18" height="18" fill="white">
          <path d="M512 62a184.09090869 184.09090869 0 0 1 184.09090869 184.09090869v204.54545478a184.09090869 184.09090869 0 1 1-368.18181738 1e-8v-204.54545479A184.09090869 184.09090869 0 0 1 512 62z m0 65.45454521a118.63636348 118.63636348 0 0 0-118.63636348 118.63636348v204.54545479a118.63636348 118.63636348 0 1 0 237.27272695 0v-204.54545479A118.63636348 118.63636348 0 0 0 512 127.45454521z"></path>
          <path d="M192.90909131 471.09090869a319.09090869 319.09090869 0 0 0 638.18181738 0 32.72727305 32.72727305 0 1 0-65.45454521 0 253.63636348 253.63636348 0 0 1-507.27272695 0 32.72727305 32.72727305 0 1 0-65.45454522 0z" p-id="5256"></path><path d="M479.27272695 757.45454521v131.85a32.72727305 32.72727305 0 1 0 65.4545461 0V757.45454521a32.72727305 32.72727305 0 1 0-65.4545461 0z"></path>
          <path d="M409.72727305 953.81818174h206.87727216a32.72727305 32.72727305 0 1 0 0-65.45454522H409.72727305a32.72727305 32.72727305 0 1 0 0 65.45454522z"></path>
        </svg>
        <svg v-show="microphone" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
          <path d="M365.014704 657.815846H657.084939V365.74561H365.014704V657.815846z m584.140471-146.035118c0-240.906781-197.125482-438.105353-438.105353-438.105353-240.979872 0-438.105353 197.198572-438.105354 438.105353 0 240.979872 197.125482 438.178444 438.105354 438.178444 240.979872 0 438.105353-197.198572 438.105353-438.178444zM511.634547 0.730906c281.399001 0 511.634547 230.235546 511.634547 511.634547s-230.235546 511.634547-511.634547 511.634547-511.634547-230.235546-511.634547-511.634547 230.235546-511.634547 511.634547-511.634547z" fill="white"></path>
        </svg>
      </div>

      <!-- 提交按钮 -->
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
import { debounce } from '@/utils/helper';
import { mapState } from 'vuex'; 

// import request from '@/utils/request';

export default {
  name: 'MultiLineInput',
  props: {
    /**绑定的输入内容*/
    value: {
      type: String,
      default: ''
    },

    /**输入框的占位符*/
    placeholder: {
      type: String,
      default: '',
    },

    /**提交按钮的类型，submit表示提交，pause表示暂停*/
    submitType: {
      type: String,
      default: 'submit'
    }
  },
  data() {
    return {
      /**输入框文本*/
      inputValue: this.value,

      /**用来按顺序存语音识别的所有片段*/
      asrBuffer: [],

      /**风格选择：史实/风格 */
      

      /**麦克风是否被开启*/
      microphone: false,

      /**WebSocket实例*/
      ws: null,

      /**语音识别对象*/
      recognition: null,
    };
  },
  computed: {
    /**当前选择的风格*/
    ...mapState({
      selectedName: state => state.selectedModel.figureName
    }),
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
    initData() {
      this.asrBuffer = [];
      this.microphone = false;
      this.ws = null;
      this.recognition = null;
    },


    /***************************************************************
     * 事件函数集合(部分) onevent_part
     ***************************************************************/
    /**
     * 重置输入框的文本内容
     * @param value 输入框的文本内容
     */
    reset_inputValue(value) {
      this.$emit('input', value);
    },

    /**
     * 提交聊天内容
     * @param {string} inputValue 要提交的聊天内容，默认值为当前输入框的文本内容
     */
    submitChat(inputValue=this.inputValue) {
      // 若此时在录音阶段，关闭录音在提交
      if (this.microphone) {
        this.onClick_stopAsr();
      }
      this.$emit('submit', inputValue);
    },

    /**
     * 测试七牛云语音识别 - 启动语音输入
     */
    async QiniuAsr() {
      try {
        // 检查浏览器是否支持语音识别
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          alert('您的浏览器不支持语音识别功能，请使用Chrome、Edge或Safari等现代浏览器');
          return;
        }

        // 保存当前输入框的文本
        this.temp_inputValue = this.inputValue;

        // 初始化WebSocket连接（如果尚未连接）
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          this.initializeWebSocket();
          
          // 等待WebSocket连接建立
          await new Promise((resolve) => {
            const checkConnection = () => {
              if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                resolve();
              }
              else {
                setTimeout(checkConnection, 100);
              }
            };
            setTimeout(checkConnection, 100);
          });
        }

        // 创建语音识别对象
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // 配置语音识别参数
        this.recognition.lang = 'zh-CN'; // 设置语言为中文
        this.recognition.continuous = true; // 连续识别
        this.recognition.interimResults = true; // 返回临时结果
        this.recognition.maxAlternatives = 1; // 最大备选结果数

        // 开始识别事件
        this.recognition.onstart = () => {
          console.log('语音识别已启动');
        };

        // 识别结果事件
        this.recognition.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const piece = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += piece
            } else {
              interimTranscript += piece
            }
          }

          // 临时结果：只做界面预览，不进缓冲区
          if (interimTranscript && this.recognition) {
            console.log('临时识别结果:', interimTranscript);
            
            this.reset_inputValue([...this.asrBuffer, interimTranscript].join(''))
          }

          // 最终结果：整块压入缓冲区，再一次性写回
          if (finalTranscript && this.recognition) {
            console.log('最终识别结果:', finalTranscript);
            this.asrBuffer.push(finalTranscript)
            const fullText = this.asrBuffer.join('').trim()
            this.reset_inputValue(fullText)

            // 把最终文本也发给后端
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({
                type: 'audio_data',
                data: fullText,
                isFinal: true
              }))
            }
          }
        };

        // 识别错误事件
        this.recognition.onerror = (event) => {
          console.error('语音识别异常:', event.error);
          this.stopAsr();
        };

        // 识别结束事件
        this.recognition.onend = () => {
          console.log('语音识别已结束');
        };

        // 请求麦克风权限并开始识别
        try {
          // 请求麦克风权限
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // 停止媒体流（我们只是需要权限，不需要实际的音频流）
          stream.getTracks().forEach(track => track.stop());
          
          // 开始语音识别
          this.recognition.start();
        }
        catch (error) {
          console.error('获取麦克风权限失败:', error);
          this.stopAsr();
        }
      }
      catch (error) {
        console.error('启动语音识别失败:', error);
        this.stopAsr();
      }
    },

    /**
     * 结束语音识别和断开WebSocket连接
     */
    stopAsr() {
      // 停止语音识别
      if (this.recognition) {
        this.recognition.stop();
        console.log('语音识别已停止');
      }
      
      // 关闭WebSocket连接
      if (this.ws) {
        this.ws.close();
        console.log('WebSocket连接已断开');
      }

      this.initData();
    },

    /**
     * 获取选中项的显示标签
     */
    getSelectedLabel() {
      if (!this.selectedName) return '';
      if (this.selectedName === '风格') {
        return `${this.selectedName}风`;
      }
      const option = this.styleOptions.find(opt => opt.value === this.selectedName);
      return option ? option.label : this.selectedName;
    },

    



    /***************************************************************
     * 事件函数集合 onevent
     ***************************************************************/
    /**
     * 输入内容变化时，更新绑定的值
     */
    onInput() {
      this.reset_inputValue(this.inputValue);
      this.stopAsr();
    },

    /**
     * 提交按钮点击时的处理
     */
    onSubmit() {
      // 若输入文本为空且不在聊天状态内（submitType不为pause），则不提交
      if (this.inputValue.trim().length === 0 && this.submitType === 'submit') return;
      // 提交聊天内容
      this.submitChat(this.inputValue);
    },

    /**
     * 回车时的处理
     */
    handleSubmit() {
      // 若输入文本为空且不在聊天状态内（submitType不为pause），则不提交
      if (this.inputValue.trim().length === 0 && this.submitType === 'submit') return;
      // 若提交类型为暂停，则不提交
      if (this.submitType === 'pause') return;
      // 提交聊天内容
      this.submitChat(this.inputValue);
    },
    
    /**
     * 开启或关闭麦克风
     */
    onClick_microphone: debounce(async function() {
      this.microphone = !this.microphone;

      // 若麦克风被开启
      if (this.microphone) {
        try {
          // 若麦克风被开启，则启动语音识别
          this.QiniuAsr();
        }
        catch (error) {
          console.error('录制声音失败', error);
          return;
        }
      }
      // 若麦克风被关闭
      else {
        // 若麦克风被关闭，则停止语音识别
        this.stopAsr();
      }
    }, 256),

    /**
     * 点击停止语音识别按钮
     */
    onClick_stopAsr: debounce(function() {
      // 若麦克风被开启
      if (this.microphone) {
        // 若麦克风被开启，则停止语音识别
        this.stopAsr();
      }
    }, 256),


    /***************************************************************
     * 其他函数集合 other
     ***************************************************************/
    /**
     * 初始化WebSocket连接
     */
    initializeWebSocket() {
      try {
        // 创建WebSocket连接（连接到本地WebSocket服务器）
        this.ws = new WebSocket('ws://localhost:3001');
        
        this.ws.onopen = () => {
          console.log('WebSocket连接已建立');
          // 发送配置信息
          this.sendAsrConfig();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'recognition_result' && data.text) {
              console.log('识别结果:', data.text);
            } else if (data.type === 'connected') {
              console.log('服务器连接确认:', data.message);
            } else if (data.type === 'asr_disconnected') {
              console.warn('ASR服务断开:', data.message);
            } else if (data.type === 'asr_error') {
              console.error('ASR服务错误:', data.message);
            }
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket错误:', error);
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket连接已关闭');
        };
        
      } catch (error) {
        console.error('创建WebSocket连接失败:', error);
      }
    },
    /**
     * 发送ASR配置到WebSocket服务器
     */
    sendAsrConfig() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const config = {
          type: 'config',
          data: {
            token: this.qiniuToken,
            format: 'pcm',
            sampleRate: 16000,
            channels: 1,
            language: 'zh-CN'
          }
        };
        
        this.ws.send(JSON.stringify(config));
        console.log('ASR配置已发送');
      }
    },
  },
  beforeDestroy() {
    // 组件销毁时，关闭WebSocket连接
    this.stopAsr();
  },
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
  line-height: 21px;
}

.textarea:focus {
  border-color: #7f8fbe;
}

.submit-list {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.microphone {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-color-best);
  display:inline-flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s;
}
.microphone:hover {
  background-color: var(--blue-2-hover);
  cursor: pointer;
}

.submit-button {
  background: var(--bg-color-best-disabled);
  color:#fff;
  padding:6px 20px;
  border:none;
  border-radius:8px;
  font-size:14px;
  display:inline-flex;
  align-items:center;
  transition: background-color 0.3s;
}
.submit-button:hover {
  cursor: not-allowed;
}

.submit-button.active {
  background: var(--bg-color-best);
}
.submit-button.active:hover {
  background-color: var(--blue-2-hover);
  cursor: pointer;
}

.submit-svg {
  margin-right: 6px;
}
</style>
