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
    
    <button @click="testQiniuChat">测试七牛云模型推理</button>
    <div>
      <label>聊天内容：</label>
      <input v-model="chatText" placeholder="请输入聊天内容" style="width:300px" />
      <button
        @click="toggleStream"
        :class="['stream-btn', isStream ? 'selected' : '']"
        style="margin-left:10px;"
      >{{isStream ? '流式输出' : '普通输出'}}</button>
    </div>
    <div>
      <label>返回内容：</label>
      <textarea :value="chatResult" readonly style="width:500px; height:200px; background:#f5f5f5; color:#333; border:1px solid #ccc;"></textarea>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'ApiTestView',
  data() {
    return {
      qiniuToken: 'sk-662551935711197f0bb7d54dbbe73d31cb8a51ab2c97966870f63282ebe1ee99',
      chatText: '你是谁',
      chatResult: '',
      isStream: true,
    };
  },
  methods: {
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
      try {
        this.chatResult = ''; // 清空之前回答的结果
        
        // isStream为true，进行流式输出
        if (this.isStream) {
          // 流式请求
          const response = await fetch('http://localhost:3000/api/qiniu/chat-stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chatText: this.chatText })
          });

          // 处理是否为流式响应
          if (!response.body) {
            console.error('无流式响应');
            return;
          }

          // 处理流式响应
          const reader = response.body.getReader(); // 获取流式读取器
          const decoder = new TextDecoder(); // 文本解码器

          // 读取流式数据
          while(true) {
            const { value } = await reader.read(); // 读取数据块

            // value是Uint8Array类型，需要解码为字符串
            if (value) {
              const decode = decoder.decode(value).slice(5); // 去掉前缀的"data:"

              // 流式数据以"[DONE]"结尾，表示结束
              if (decode.trim() === '[DONE]') {
                break;
              }

              // 流式数据是JSON格式，需要解析
              try {
                const obj = JSON.parse(decode); // 解析JSON
                this.chatResult = this.chatResult.concat(obj.choices[0].delta.content || ''); // 累加回答内容
              } catch (err) {
                // 非完整JSON块时忽略
                console.error('非完整JSON块:', decode);                
              }
            }
          }
        } else {
          // 普通请求 
          try {
            const res = await axios.post('http://localhost:3000/api/qiniu/chat', {
              chatText: this.chatText,
            });
            console.log(res.data);
            this.chatResult = res.data.choices?.[0]?.message?.content || '';
          } catch (e) {
            console.error(e.response?.data?.error || e.message);
          }
        }
      } catch (e) {
        console.error(e.message);
      }
    },
    toggleStream() {
      this.isStream = !this.isStream;
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