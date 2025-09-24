<template>
  <div ref="content" class="content">
    <!-- 聊天框 -->
    <ChatDialog
      ref="ChatDialog"
      :messages="chatResult"
      @textToSpeech="onTextToSpeech_do"
      @pauseSpeech="onPauseSpeech_pause"
      @replaySpeech="onReplaySpeech_repaly"
    >
    </ChatDialog>

    <!-- 快速下拉浮标 -->
    <div ref="scroller" v-show="scroller_visible" class="scroll-to-bottom" @click="onClick_toBottom">
      <svg width="32" height="32" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13 L17 21 L23 13" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- 文本输入框 --> 
    <MultiLineInput ref="multiLineInput" :value="chatText" :submitType="submitType" @input="onInput_setText" @submit="onSubmit_toChat"></MultiLineInput>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { marked } from 'marked';

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
      /**
       * 聊天读取器
       */
      chatReader: null,

      /**
       * 请求取消控制器
       */
      chatAbortController: null,

      /**
       * 是否在聊天
       */
      isChat: false,

      /**
       * 是否联网搜索
       */
      isSearch: true,

      /**
       * 快速下拉浮标是否可见
       */
      scroller_visible: false,

      /**
       * 滚动事件监听器
       */
      scrollListener: null,
    }
  },
  computed: {
    ...mapState({
      chatText: state => state.chatView.chatText, // 用户输入的聊天文本内容
      chatResult: state => state.chatView.chatResult, // 聊天结果
      audioMap: state => state.chatView.audioMap, // 音频列表
    }),

    /**
     * 提交按钮类型
     */
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
      chatResult_splice: 'chatView/chatResult_splice',
      audioMap_setByIndex: 'chatView/audioMap_setByIndex',
      audioMap_deleteByIndex: 'chatView/audioMap_deleteByIndex',
      audioMap_getByIndex: 'chatView/audioMap_getByIndex',
    }),
    /***************************************************************
     * 外部调用函数集合 func
     ***************************************************************/
    submit(e) {
      this.onSubmit_toChat(e);
      this.$nextTick(() => {
        this.reset_scroller();
        this.update_scroller_visibility();
      })
    },

    
    /***************************************************************
     * 工具函数集合 helper
     ***************************************************************/


     
    /***************************************************************
     * 数据函数集合 _data_
     ***************************************************************/



    /***************************************************************
     * 事件函数集合(部分) onevent_part
     ***************************************************************/
    /**
     * 滚动至聊天框底部
     */
    ChatDialogToBottom() {
      //获取容器
      const ChatDialog = this.$refs['ChatDialog'];
      
      if (!ChatDialog) {
        return;
      }

      //滚动至底部
      ChatDialog.$el.scrollTo({ top: ChatDialog.$el.scrollHeight, behavior: "smooth" });
    },

    /**
     * 初始化一些聊天相关数据
     */
    initChatData() {
      this.isChat = false; // 标记为未在聊天
      this.chatReader = null; // 清除读取器
      this.chatAbortController = null; // 清除取消控制器
    },

    /**
     * 开始聊天
     */
    async QiniuChat() {
      this.chatResult_push({ role: 'user', content: this.chatText });
      this.isChat = true; // 标记为正在聊天
      this.chatText_set('');
      this.chatResult_push({ role: 'assistant', content: '', thinking: true, audio: 'none' }); // 记录助手信息，初始时助手在思考
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
            throw new Error('读取被中止', {msg: '读取被中止', status: true});
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
                return {msg: '读取完成', status: true};
              }   

              try {
                // 解析JSON块为对象
                obj = JSON.parse(block);
              } 
              catch (err) {
                console.error('非完整JSON块:', block);
                done = false;
                throw new Error('读取异常', {msg: '读取异常', status: false});
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
      
      let response = await toRequest.call(this); //获取请求的response

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

      try {
        // 读取文字
        await processStreamData.call(this, response, index, this.update_scroller_visibility);

        // 读取完成,添加audio
        this.chatResult_setByIndex([index, {
          ...this.chatResult[index],
          audio: 'play'
        }]);
      }
      catch(e) {
        // 读取失败
        if (e.msg !== '读取被中止') {
          this.chatResult_splice([-1]); //删除
          this.chatResult_push({ role: 'assistant', content: '⚠️ 生成失败' }); // 添加错误消息
        }
      }
      
      // 聊天结束，重置状态
      this.initChatData();
    },

    /**
     * 文本转语音
     * @param text 要转换的文本
     * @returns {Audio | null} 音频对象 null表示转换失败
     */
    async QiniuTextToSpeech(text) {
      /**
       * 文本转语音
       * @param text 文本内容
       * @param voiceType 音色类型
       * @returns {object | null} 响应数据 null表示请求失败
       */
      async function requestTextToSpeech(text, voiceType) {
        // 文本可能时md格式，需要转换为纯文本形式
        text = marked(text); // 转换为html
        text = text.replace(/<[^>]+>/g, ''); // 移除html标签

        // 检查文本是否为空
        if (!text) {
          console.error('未收到文本数据');
          return null;
        }

        // 配置请求体
        const requestBody = {
          text: text,
          voiceType: voiceType,
        };       

        let response; // 响应对象

        // 发送请求
        try {
          response = await fetch('http://localhost:3000/api/qiniu/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          // 检查响应状态
          if (!response.ok && response) {
            throw new Error('网络响应失败', {msg: '网络响应失败', status: false});
          }
        }
        catch(e) {
          console.error('请求失败:', e);
          return null;
        }

        return response.json();
      }
      
      /**
       * 将base64编码转为MP3
       * @param base64Code base64编码
       * @returns {Audio | null} 音频对象 null表示转换失败
       */
      function base64ToMP3(base64Code) {
        let audio = null;

        // 检查base64数据是否存在
        if (!base64Code) {
          console.error('未收到音频数据');
          return null;
        }

        // 将base64编码转换为MP3
        try {
          // 移除可能的data URL前缀,解码base64数据
          const cleanBase64Code = base64Code.replace(/^data:audio\/mp3;base64,/, '');
          const binaryString = atob(cleanBase64Code);
          
          // 转换为Uint8Array
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // 创建Blob对象
          const mp3Blob = new Blob([bytes], { type: 'audio/mp3' });
          const mp3Url = URL.createObjectURL(mp3Blob);
          
          // 转为音频
          audio = new Audio(mp3Url);
        } catch (error) {
          console.error('音频数据处理失败:', error);
          return null;
        }

        return audio;
      }

      // 进行请求，并检查responce，responce为null，表示请求失败，不必后续进程
      const response = await requestTextToSpeech(text, 'qiniu_zh_female_tmjxxy');
      
      if (!response) {
        return null;
      }

      // 获取base64编码,并将base64编码转为MP3
      const base64Code = response.data;
      const audio = base64ToMP3(base64Code);

      if (!audio) {
        return null;
      }

      return audio;
    },
    
    /**
     * 添加audio事件
     */
    addEventToAudio(audio, idx) {
      // 挂载添加错误处理事件
      audio.onerror = (e) => {
        console.error('音频播放错误:', e);
      };
      
      // 挂载添加播放结束后，释放URL对象事件
      audio.onended = () => {
        // 删除音频资源
        this.audioMap_deleteByIndex(idx);

        // // 从头开始重新播放
        // if (audio) {
        //   audio.currentTime = 0;
        // }
        
        // 结束播放，将svgDividerType_1 改为play
        this.chatResult_setByIndex([idx, {
          ...this.chatResult[idx],
          audio: 'play'
        }]);
      };

      // 挂载添加暂停播放的事件
      audio.onpause = () => {
        // 暂停播放，将svgDividerType_1 改为replay
        this.chatResult_setByIndex([idx, {
          ...this.chatResult[idx],
          audio: 'replay'
        }]);
      };

      // 挂载添加播放事件
      audio.onplay = () => {
        // 播放中，将svgDividerType_1 改为pause
        this.chatResult_setByIndex([idx, {
          ...this.chatResult[idx],
          audio: 'pause'
        }]);
      };
    },


    /***************************************************************
     * 事件函数集合 onevent
     ***************************************************************/
    /**
     * 文本转语音
     * @param text 文本内容
     * @param idx 消息索引
     */
    async onTextToSpeech_do(text, idx) {
      // 转换前,设置为loading
      this.chatResult_setByIndex([idx, {
        ...this.chatResult[idx],
        audio: 'loading'
      }]);

      // 转为文本转语音
      const audio = await this.QiniuTextToSpeech(text);

      if (!audio) {
        return;
      }

      // 挂载事件
      this.addEventToAudio(audio, idx);

      // 播放音频
      audio.play();

      // 转换完成,设置为pause
      this.chatResult_setByIndex([idx, {
        ...this.chatResult[idx],
        audio: 'pause'
      }]);

      // 存储音频资源
      this.audioMap_setByIndex([idx, audio]);
    },

    /**
     * 暂停播放
     * @param idx 消息索引
     */
    onPauseSpeech_pause(idx) {
      // 暂停播放 
      const audio = this.audioMap.get(idx);
      console.log(audio, idx, );
      
      if (audio) {
        audio.pause();
      }
      
      // 调整状态为replay
      this.chatResult_setByIndex([idx, {
        ...this.chatResult[idx],
        audio: 'replay'
      }]);
    },

    /**
     * 继续播放
     * @param idx 消息索引
     */
    onReplaySpeech_repaly(idx) {
      // 继续播放
      const audio = this.audioMap.get(idx);
      if (audio) {
        audio.play();
      }
      
      // 调整状态为pause
      this.chatResult_setByIndex([idx, {
        ...this.chatResult[idx],
        audio: 'pause'
      }]);
    },

    /**
     * 点击滚动至聊天框底部
     */
    onClick_toBottom() {
      this.ChatDialogToBottom();
    },

    /**
     * 修改聊天文本内容
     * @param e 文本内容
     */
    onInput_setText(e) {
      this.chatText_set(e);
    },

    /**
     * 进行聊天或结束聊天
     */
    onSubmit_toChat() {
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
    

    /***************************************************************
     * 其他函数集合 other
     ***************************************************************/
    /**
     * 计算游标位置
     */
    reset_scroller() {
      try {
        // 获取容器宽
        // 获取表单高
        // 获取游标宽高
        // 填写边距数值
        const content_width = this.$refs['content'].clientWidth;
        const MultiLineInput_height = this.$refs['multiLineInput'].$el.clientHeight;
        const scroller_width = this.$refs['scroller'].clientWidth;
        const height = 8;
        // const width = 0;

        // 计算游标位置            
        this.$refs['scroller'].style.left = `${(content_width - scroller_width) / 2}px`;
        this.$refs['scroller'].style.bottom = `${MultiLineInput_height + height}px`;
      }
      catch(e) {
        console.error(e);
        return;
      }
    },

    /**
     * 判断快速下拉浮标是否可见
     * 当聊天内容高度超过容器高度时显示浮标
     */
    update_scroller_visibility() {
      const ChatDialog = this.$refs['ChatDialog'];

      // 若聊天框不存在，隐藏浮标
      if (!ChatDialog) {
        this.scroller_visible = false;
        return;
      }

      // 当聊天内容高度超过容器高度时显示浮标
      const shouldShow = ChatDialog.$el.scrollHeight > ChatDialog.$el.clientHeight;
      this.scroller_visible = shouldShow;

      // 当滚动到最底部时，隐藏浮标
      if (ChatDialog.$el.scrollTop + ChatDialog.$el.clientHeight >= ChatDialog.$el.scrollHeight - 1) {
        this.scroller_visible = false;
      }
    },

    /**
     * 初始化滚动事件监听
     */
    init_scroll_listener() {
      const ChatDialog = this.$refs['ChatDialog'];
      if (!ChatDialog) return;

      // 移除旧的监听器
      if (this.scrollListener) {
        ChatDialog.$el.removeEventListener('scroll', this.scrollListener);
      }

      // 创建新的监听器
      this.scrollListener = () => {
        this.update_scroller_visibility();
      };

      // 添加滚动事件监听
      ChatDialog.$el.addEventListener('scroll', this.scrollListener);
    },

    /**
     * 清理滚动事件监听
     */
    cleanup_scroll_listener() {
      if (this.scrollListener) {
        const ChatDialog = this.$refs['ChatDialog'];
        if (ChatDialog) {
          ChatDialog.$el.removeEventListener('scroll', this.scrollListener);
        }
        this.scrollListener = null;
      }
    },

    on_(...args) {
      console.log(...args);
    }
  },
  mounted() {
    this.reset_scroller();
    this.update_scroller_visibility();
    this.init_scroll_listener();
  },
  beforeDestroy() {
    this.cleanup_scroll_listener();
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
