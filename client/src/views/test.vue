<template>
  <div>
     <button @click="testQiniuAsr">测试七牛云语音识别</button>
     <textarea v-model="chatText" placeholder="语音识别结果将显示在这里..."></textarea>
    
  </div>
</template>

<script>

// import MultiLineInput from '@/components/MultiLineInput/index.vue';
// import ChatDialog from '@/components/ChatDialog/index.vue';


export default {
  name: 'ApiTestView',
  components: {
    // MultiLineInput,
    // ChatDialog,
  },
  data() {
    return {
      qiniuToken: 'sk-662551935711197f0bb7d54dbbe73d31cb8a51ab2c97966870f63282ebe1ee99',
      chatText: '你是谁，今天是几年几月几号',
    };
  },
  computed: {
  },
  methods: {
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
              // 将识别结果添加到聊天内容
              this.chatText = data.text;
              // 自动提交聊天
              if (data.isFinal) {
                this.submitChat();
              }
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
     * 测试七牛云语音识别 - 启动语音输入
     */
    async qiniuAsr() {
      try {
        // 检查浏览器是否支持语音识别
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          alert('您的浏览器不支持语音识别功能，请使用Chrome、Edge或Safari浏览器');
          return;
        }

        // 初始化WebSocket连接（如果尚未连接）
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          this.initializeWebSocket();
          
          // 等待WebSocket连接建立
          await new Promise((resolve) => {
            const checkConnection = () => {
              if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                resolve();
              } else {
                setTimeout(checkConnection, 100);
              }
            };
            setTimeout(checkConnection, 100);
          });
        }

        // 创建语音识别对象
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // 配置语音识别参数
        recognition.lang = 'zh-CN'; // 设置语言为中文
        recognition.continuous = true; // 连续识别
        recognition.interimResults = true; // 返回临时结果
        recognition.maxAlternatives = 1; // 最大备选结果数

        // 开始识别事件
        recognition.onstart = () => {
          console.log('语音识别已启动');
          this.chatText = '正在听取语音输入...';
        };

        // 识别结果事件
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          // 处理识别结果
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // 显示临时结果
          if (interimTranscript) {
            this.chatText = interimTranscript;
          }

          // 如果有最终结果，发送到WebSocket服务器
          if (finalTranscript && this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('发送最终识别结果到服务器:', finalTranscript);
            
            // 发送音频数据到WebSocket服务器
            const audioData = {
              type: 'audio_data',
              data: finalTranscript, // 这里可以改为实际的音频数据
              isFinal: true
            };
            
            this.ws.send(JSON.stringify(audioData));
          }
        };

        // 识别错误事件
        recognition.onerror = (event) => {
          console.error('语音识别错误:', event.error);
          
          let errorMessage = '语音识别出错';
          switch (event.error) {
            case 'no-speech':
              errorMessage = '未检测到语音，请说话';
              break;
            case 'audio-capture':
              errorMessage = '无法访问麦克风';
              break;
            case 'not-allowed':
              errorMessage = '麦克风权限被拒绝';
              break;
            case 'network':
              errorMessage = '网络错误';
              break;
            default:
              errorMessage = `语音识别错误: ${event.error}`;
          }
          
          this.chatText = errorMessage;
        };

        // 识别结束事件
        recognition.onend = () => {
          console.log('语音识别已结束');
          
          if (this.chatText === '正在听取语音输入...') {
            this.chatText = '未检测到语音输入';
          }
        };

        // 请求麦克风权限并开始识别
        try {
          // 请求麦克风权限
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // 停止媒体流（我们只是需要权限，不需要实际的音频流）
          stream.getTracks().forEach(track => track.stop());
          
          // 开始语音识别
          recognition.start();
          
        } catch (error) {
          console.error('获取麦克风权限失败:', error);
          
          if (error.name === 'NotAllowedError') {
            this.chatText = '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问';
          } else if (error.name === 'NotFoundError') {
            this.chatText = '未找到麦克风设备';
          } else {
            this.chatText = '获取麦克风权限失败: ' + error.message;
          }
        }

      } catch (error) {
        console.error('启动语音识别失败:', error);
        this.chatText = '启动语音识别失败: ' + error.message;
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
  mounted() {
    // // 组件挂载时初始化WebSocket连接
    // this.initializeWebSocket();
  },
};
</script>

<style scoped>

</style>