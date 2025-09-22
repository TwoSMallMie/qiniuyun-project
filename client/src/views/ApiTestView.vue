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
    <p>{{ chatResult }}</p>
  </div>
</template>

<script>
import axios from 'axios';

import MultiLineInput from '@/components/MultiLineInput.vue';

export default {
  name: 'ApiTestView',
  components: {
    MultiLineInput,
  },
  data() {
    return {
      qiniuToken: 'sk-662551935711197f0bb7d54dbbe73d31cb8a51ab2c97966870f63282ebe1ee99',
      chatText: '你是谁，今天是几年几月几号',
      chatResult: '',
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
    }
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
      this.chatResult = ''; // 清空之前回答的结果
      this.isChat = true; // 标记为正在聊天
      
      // isStream为true，进行流式输出
      if (this.isStream) {
        this.chatAbortController = new AbortController(); // 创建取消控制器
        let response; // 保存响应对象

        // 进行请求
        try {
          response = await fetch('http://localhost:3000/api/qiniu/chat-stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chatText: this.chatText, search: this.isSearch }),
            signal: this.chatAbortController.signal
          });
        } 
        catch (err) {
          if (err.name === 'AbortError') {
            console.log('请求已取消');
            return;
          }
          throw err;
        }

        // 检查响应状态
        if (!response.body) {
          console.error('无流式响应');
          return;
        }

        // 处理流式响应
        const reader = response.body.getReader(); // 获取流式读取器
        this.chatReader = reader; // 保存读取器以便后续可能的取消
        const decoder = new TextDecoder(); // 文本解码器
        let done = true; // 标记读取是否完成

        // 读取流式数据
        while(done) {
          // 读取过程中若isChat变为false，停止读取
          if (!this.isChat) {
            done = false;
            break;
          }

          // 读取数据
          const { value } = await reader.read();

          // 处理读取到的数据块
          if (value) {
            const decode = decoder.decode(value); // 解码字符串
            const blocks = decode.split('data:').map(block => block.trim()).filter(block => block); // 按"data:"分割成块
            
            // 处理每个块
            for (let block of blocks) {
              if (block === '[DONE]' || !this.isChat) {
                done = false;
                break;
              }
              try {
                // 解析JSON块为对象
                const obj = JSON.parse(block);
                // 拼接回答内容
                this.chatResult = this.chatResult.concat(obj.choices[0].delta.content || '');
              } catch (err) {
                console.error('非完整JSON块:', block);
                done = false;
                break;
              }
            }
          }
        }
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