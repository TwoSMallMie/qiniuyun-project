<template>
  <div ref="content" class="content">
    <ChatDialog ref="ChatDialog" :messages="chatResult"></ChatDialog>

    <div ref="scroller" v-show="scroller_visible" class="scroll-to-bottom" @click="onClick_toBottom">
      <svg width="32" height="32" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13 L17 21 L23 13" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <MultiLineInput ref="multiLineInput" :value="chatText" :submitType="submitType" @input="onInput" @submit="onSubmitChat"></MultiLineInput>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

import MultiLineInput from '@/components/MultiLineInput.vue'
import ChatDialog from '@/components/ChatDialog.vue';

export default {
	name: 'chatToMode',
	components: {
    ChatDialog,
    MultiLineInput,
	},
	props: {
	},
	data() {
    return {
      chatReader: null,
      chatAbortController: null,
      isChat: false,
      isSearch: true,
      scroller_visible: false,
    }
  },
  computed: {
    ...mapState({
      chatText: state => state.chatView.chatText,
      chatResult: state => state.chatView.chatResult,
    }),
    submitType() {
      return this.isChat ? 'pause' : 'submit';
    },
  },
  watch: {
  },
  methods: {
    ...mapMutations({
      chatText_set: 'chatView/chatText_set',
      chatResult_setByIndex: 'chatView/chatResult_setByIndex',
      chatResult_push: 'chatView/chatResult_push',
      chatResult_splice: 'chatView/chatResult_splice'
    }),

    //func
    
    submit(e) {
      this.onSubmitChat(e);
      this.$nextTick(() => {
        this.reset_scroller();
        this.judge_scroller_visible();
      })
    },
    reset_scroller() {
      // 获取容器高和宽
      const content_height = this.$refs['content'].clientHeight;
      const content_width = this.$refs['content'].clientWidth;

      // 获取表单高
      const MultiLineInput_height = this.$refs['multiLineInput'].$el.clientHeight;

      // 获取游标宽高
      const scroller_height = this.$refs['scroller'].clientHeight;
      const scroller_width = this.$refs['scroller'].clientWidth;

      // 填写边距数值
      const height = 8;
      // const width = 0;

      // 计算游标位置      
      console.log(content_height - scroller_height - MultiLineInput_height);
      
      this.$refs['scroller'].style.left = `${(content_width - scroller_width) / 2}px`;
      this.$refs['scroller'].style.bottom = `${MultiLineInput_height + height}px`;
    },
    judge_scroller_visible() {
      const ChatDialog = this.$refs['ChatDialog'];
      
      if (ChatDialog) {
        const ChatDialog_el = ChatDialog.$el;

        if (ChatDialog_el.scrollHeight <= ChatDialog_el.clientHeight) {
          this.scroller_visible =  false;
        }
        else {
          this.scroller_visible =  true;
        }
      }
      else {
        this.scroller_visible =  false;
      }
    },



    //on
    onInput(e) {
      this.chatText_set(e);
    },
    onSubmitChat() {
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
        this.QiniuChat();
      }
    },
    initChatData() {
      this.isChat = false; // 标记为未在聊天
      this.chatReader = null; // 清除读取器
      this.chatAbortController = null; // 清除取消控制器
    },
    async QiniuChat() {
      this.chatResult_push({ role: 'user', content: this.chatText });
      this.isChat = true; // 标记为正在聊天
      this.chatText_set('');
      this.chatResult_push({ role: 'assistant', content: '', thinking: true }); // 记录助手信息，初始时助手在思考
      const index = this.chatResult.length - 1;
      
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
            body: JSON.stringify({ messages: this.chatResult.slice(0, -1), search: this.isSearch }),
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
      async function processStreamData(response, index, done_callback=null) {
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
            let obj; //解析JSON块的对象
            
            // 处理每个块
            for (let block of blocks) {
              if (block === '[DONE]') {
                done = false;
                return {message: '读取完成'};
              }   

              try {
                // 解析JSON块为对象
                obj = JSON.parse(block);
              } 
              catch (err) {
                console.error('非完整JSON块:', block);
                done = false;
                return {message: '读取异常'};
              }

              // 拼接回答内容, 实时更新回答内容
              let chatResultContent = this.chatResult[index].content;
              this.chatResult_setByIndex([index, {
                ...this.chatResult[index],
                content: chatResultContent.concat(obj.choices[0].delta.content || '')
              }]);
            }
          }

          // 每次处理一个块结束后的回调
          if (done_callback) {
            done_callback();
          }
        }
      }

      
      const response = await toRequest.call(this); //获取请求的response

      // 若无响应或响应无body，视为请求失败
      if (!response || !response.body) {
        this.initChatData(); // 重置聊天状态
        this.chatResult_splice([-1]); //删除
        this.chatResult_push({ role: 'assistant', content: '⚠️ 请求失败或已取消' }); // 添加错误消息
        return;
      }

      // 请求完成，助手关闭思考，直接删除，在添加一段空文本数据
      this.chatResult_splice([-1]);
      this.chatResult_push({ role: 'assistant', content: '' });

      await processStreamData.call(this, response, index, this.judge_scroller_visible);

      // 聊天结束，重置状态
      this.initChatData();
    },
    onClick_toBottom() {
      //获取容器
      const ChatDialog = this.$refs['ChatDialog'].$el;

      //滚动至底部
      ChatDialog.scrollTo({ top: ChatDialog.scrollHeight, behavior: "smooth" })
    },

    on_(...args) {
      console.log(...args);
    }
  },
  mounted() {
    this.reset_scroller();
  },
}
</script>

<style scoped>
.content {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.scroll-to-bottom {
  position: absolute;
  width: 32px;
  height: 32px;
  background-color: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 50%;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
.scroll-to-bottom:hover {
  background-color: #eeeeee;
}
</style>
