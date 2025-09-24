<template>
  <div>
    <h2>Serve API 测试</h2>
    <button @click="callApi">调用 /api/hello</button>

    <hr />
    <button @click="getUsers">获取用户列表</button>

    <hr />
    <h3>七牛云模型推理API测试</h3>
    <button @click="testQiniuModel">测试获取七牛云模型</button>
    <br />
    
    <!-- <button @click="testQiniuChat">测试七牛云模型推理</button> -->
    <!-- <div>
      <label>聊天内容：</label>
      <input v-model="chatText" placeholder="请输入聊天内容" style="width:300px" />
      <button
        @click="toggleStream"
        :class="['stream-btn', isStream ? 'selected' : '']"
        style="margin-left:10px;"
      >{{isStream ? '流式输出' : '普通输出'}}</button>
      <button
        @click="toggleSearch"
        :class="['stream-btn', isSearch ? 'selected' : '']"
        style="margin-left:10px;"
      >{{isSearch ? '√联网搜索' : '×联网搜索'}}</button>
    </div>
    <div>
      <label>返回内容：</label>
      <textarea :value="chatResult" readonly style="width:500px; height:200px; background:#f5f5f5; color:#333; border:1px solid #ccc;"></textarea>
    </div> -->
    <MultiLineInput v-model="chatText" :submitType="submitType" @submit="submitChat"></MultiLineInput>
    <ChatDialog :messages="chatResult"></ChatDialog>
  </div>
</template>

<script>
import axios from 'axios';

import MultiLineInput from '@/components/MultiLineInput/index.vue';
import ChatDialog from '@/components/ChatDialog/index.vue';


export default {
  name: 'ApiTestView',
  components: {
    MultiLineInput,
    ChatDialog,
  },
  data() {
    return {
      qiniuToken: 'sk-662551935711197f0bb7d54dbbe73d31cb8a51ab2c97966870f63282ebe1ee99',
      chatText: '你是谁，今天是几年几月几号',
      chatResult: [],
      chatReader: null,
      chatAbortController: null,
      isChat: false,
      isStream: true,
      isSearch: true,
    };
  },
  computed: {
    submitType() {
      return this.isChat ? 'pause' : 'submit';
    },
  },
  methods: {
    initChatData() {
      this.isChat = false; // 标记为未在聊天
      this.chatReader = null; // 清除读取器
      this.chatAbortController = null; // 清除取消控制器
    },
    async callApi() {
      try {
        const res = await axios.get('http://localhost:3000/api/hello');
        console.log(res.data.message);
      } catch (e) {
        console.error(e);
      }
    },
    async getUsers() {
      try {
        const res = await axios.get('http://localhost:3000/api/users');
        console.log(res.data);
      } catch (e) {
        console.error(e);
        
      }
    },
    async testQiniuModel() {
      try {
        const res = await axios.get('http://localhost:3000/api/qiniu/model');
        console.log(res.data.data.map((item) => item.id));
      } catch (e) {
        console.error(e.response?.data?.error || e.message);
      }
    },
    async testQiniuChat() {
      this.chatResult.push({ role: 'user', content: this.chatText }); // 记录用户消息
      this.isChat = true; // 标记为正在聊天
      this.chatText = ''; // 清空输入框
      this.chatResult.push({ role: 'assistant', content: '', thinking: true }); // 记录助手信息，初始时助手在思考
      const chatResultAssistant = this.chatResult[this.chatResult.length - 1]; // 获取当前助手消息对象，后续通过引用修改值
      
      // isStream为true，进行流式输出
      if (this.isStream) {
        //发送请求
        async function toRequest() {
          this.chatAbortController = new AbortController(); // 创建取消控制器
          let response; // 保存响应对象

          // 进行请求
          try {
            response = await fetch('http://localhost:3000/api/qiniu/chat-stream', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ messages: this.chatResult, search: this.isSearch }),
              signal: this.chatAbortController.signal
            });
          } 
          catch (err) {
            if (err.name === 'AbortError') {
              console.log('请求已取消');
              return {};
            }
            throw err;
          }

          // 检查响应状态
          if (!response.body) {
            console.error('无流式响应');
            return {};
          }

          return response;
        }

        //开始处理流式响应
        async function processStreamData(response, chatResultAssistant) {
          const reader = response.body.getReader(); // 获取流式读取器
          this.chatReader = reader; // 保存读取器以便后续可能的取消
          const decoder = new TextDecoder(); // 文本解码器
          let done = true; // 标记读取是否完成

          // 读取流式数据
          while(done) {
            // 读取过程中若isChat变为false，停止读取
            if (!this.isChat) {
              done = false;
              return {message: '读取被中止'};
            }

            // 读取数据
            const { value } = await reader.read();

            // 处理读取到的数据块
            if (value) {
              const decode = decoder.decode(value); // 解码字符串
              const blocks = decode.split('data:').map(block => block.trim()).filter(block => block); // 按"data:"分割成块
              
              // 处理每个块
              for (let block of blocks) {
                if (block === '[DONE]') {
                  done = false;
                  return {message: '读取完成'};
                }

                try {
                  // 解析JSON块为对象
                  const obj = JSON.parse(block);
                  // 拼接回答内容
                  chatResultAssistant.content = chatResultAssistant.content.concat(obj.choices[0].delta.content || ''); // 实时更新回答内容
                } 
                catch (err) {
                  console.error('非完整JSON块:', block);
                  done = false;
                  return {message: '读取异常'};
                }
              }
            }
          }
        }

        
        const response = await toRequest.call(this); //获取请求的response

        // 若无响应或响应无body，视为请求失败
        if (!response || !response.body) {
          this.initChatData(); // 重置聊天状态
          this.chatResult.pop(); // 移除最后一条助手消息
          this.chatResult.push({ role: 'assistant', content: '⚠️ 请求失败或已取消' }); // 添加错误消息
          return;
        }

        // 请求完成，助手关闭思考，直接删除属性
        this.$delete(chatResultAssistant, 'thinking');

        await processStreamData.call(this, response, chatResultAssistant);
      }
      // else {
      //   // 普通请求 
      //   try {
      //     const res = await axios.post('http://localhost:3000/api/qiniu/chat', {
      //       chatText: this.chatText,
      //       search: this.isSearch,
      //     });
      //     console.log(res.data);
      //     this.chatResult = res.data.choices?.[0]?.message?.content || '';
      //   } catch (e) {
      //     console.error('普通请求失败', e.response?.data?.error || e.message);
      //   }
      // }

      // 聊天结束，重置状态
      this.initChatData();
    },
    submitChat() {
      // 如果正在聊天，则停止请求
      if (this.isChat) {
        // 若已建立了读取器，取消流式读取
        if (this.chatReader) {
          this.chatReader.cancel();
        }

        // 取消请求
        if (this.chatAbortController) {
          this.chatAbortController.abort();
        }

        // 重置聊天状态
        this.initChatData();
      }
      // 未在聊天在则开始聊天
      else {
        this.testQiniuChat();
      }
    },
    toggleStream() {
      this.isStream = !this.isStream;
    },
    toggleSearch() {
      this.isSearch = !this.isSearch;
    },
  }
};
</script>

<style scoped>
.stream-btn {
  padding: 6px 18px;
  border: none;
  border-radius: 4px;
  background: #e0e0e0;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.stream-btn.selected {
  background: #222;
  color: #fff;
}
.stream-btn:hover {
  background: #bdbdbd;
  color: #222;
}
.stream-btn.selected:hover {
  background: #111;
  color: #fff;
}
</style>