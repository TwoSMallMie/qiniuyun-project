<template>
  <div ref="content" class="content">
    <!-- 聊天框 -->
    <ChatDialog
      ref="ChatDialog"
      :messages="chatResult"
      :imgs="imgs"
      @textToSpeech="onTextToSpeech_do"
      @pauseSpeech="onPauseSpeech_pause"
      @replaySpeech="onReplaySpeech_replay"
      @reThinking="onReThinking_do"
      @translate="onTranslate_do"
      @translateRestore="onTranslateRestore_do"
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
import { Message } from 'element-ui';

import request from '@/utils/request';
import { createChatResult } from '@/views/chatView/chatResult';
import { throttle } from '@/utils/helper';

import MultiLineInput from '@/components/MultiLineInput/index.vue'
import ChatDialog from '@/components/ChatDialog/index.vue';

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
      /**聊天读取器*/
      chatReader: null,

      /**请求取消控制器*/
      chatAbortController: null,

      /**翻译读取器*/
      translateReader: null,

      /**请求取消控制器*/
      translateAbortController: null,

      /**是否在聊天*/
      isChat: false,

      /**是否联网搜索*/
      isSearch: true,

      /**快速下拉浮标是否可见*/
      scroller_visible: false,

      /**滚动事件监听器*/
      scrollListener: null,

      /**DOM内容变化监听器*/
      contentObserver: null,

      /**浏览器大小变化监听器*/
      browserSizeListener: null,


      imgs: {},
    }
  },
  computed: {
    ...mapState({
      chatText: state => state.chatView.chatText, // 用户输入的聊天文本内容
      chatResult: state => state.chatView.chatResult, // 聊天结果
      audioMap: state => state.chatView.audioMap, // 音频列表
      selectedModel: state => state.selectedModel, // 选中的模型
      imgMap: state => state.imgMap, // 图片映射表
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
      chatResult_clear: 'chatView/chatResult_clear',
      chatResult_setContentByIndex: 'chatView/chatResult_setContentByIndex',
      chatResult_setAudioByIndex: 'chatView/chatResult_setAudioByIndex',
      chatResult_setAttrByIndex: 'chatView/chatResult_setAttrByIndex',
      audioMap_setByIndex: 'chatView/audioMap_setByIndex',
      audioMap_deleteByIndex: 'chatView/audioMap_deleteByIndex',
      audioMap_getByIndex: 'chatView/audioMap_getByIndex',
      audioMap_clear: 'chatView/audioMap_clear',
      imgMap_set: 'imgMap_set',
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
    /**
     * 转换图片base64编码为png格式并保存
     * @param {String} img_base64 - 图片base64编码
     * @returns {String} 转换后的png图片base64编码
     */
    Imgbase64ToPng(img_base64) {
      try {
        const base64 = img_base64.split(',')[1];
        const png = atob(base64);
        const arrayBuffer = new ArrayBuffer(png.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < png.length; i++) {
          uint8Array[i] = png.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        
        return url;
      }
      catch(e) {
        console.error('保存图片到本地失败:', e);
        return '';
      }
    },

     
    /***************************************************************
     * 数据函数集合 _data_
     ***************************************************************/
    /**
     * 初始化一些聊天相关数据
     * @param {'all' | 'chat' | 'translate'} type 初始化类型，可选值为'all'（初始化所有数据）或'chat'（仅初始化聊天相关数据）
     */
    initChatData(type='all') {
      if (type === 'all' || type === 'chat') {
        this.isChat = false; // 标记为未在聊天
        this.chatReader = null; // 清除读取器
        this.chatAbortController = null; // 清除取消控制器
      }
      if (type === 'all' || type === 'translate') {
        this.translateReader = null; // 清除读取器
        this.translateAbortController = null; // 清除取消控制器
      }
    },


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
     * 开始聊天
     * @param isReChat 是否属于重新聊天
     */
    async QiniuChat(isReChat=false) {
      /**
       * 发送请求
       * @returns {Promise<Response>} 响应对象
       */
      async function toRequest() {
        this.chatAbortController = new AbortController(); // 创建取消控制器
        let response; // 保存响应对象

        const systemPrompt = [{
          "role": "system",
          "content": [{
            type: 'text',
            text: '这是一个利用 AI 来做角色扮演的网页，你将扮演一个角色与用户进行沟通，其常用词，思维方式，情绪，社会经验，回答文本不需要使用括号描述动作和情绪，及要求如下：',
          }]
          .concat(Object.keys(this.selectedModel.prompt).map(key=>({
            type: 'text',
            text: Array.isArray(this.selectedModel.prompt[key]) ? this.selectedModel.prompt[key].join(';') : this.selectedModel.prompt[key],
          })))
        }]

        // 设置请求体
        const requestBody = {
          search: this.isSearch,
          messages: systemPrompt
          .concat(this.chatResult.slice(0, -1).map(item=>({
            "role": item.role,
            "content": item.content
          })))
        };

        // 进行请求
        try {
          response = await fetch('http://localhost:3000/api/qiniu/chat-stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
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

      /**
       * 处理流式响应数据
       * @param response 响应对象
       * @param index 聊天结果索引
       * @param callback 每次进行一次处理的回调函数
       */
      async function processStreamData(response, index, callback=null) {
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
              this.chatResult_setContentByIndex([index, this.chatResult[index].content.concat(obj.choices[0].delta.content || '')]);
            }
          }

          if (callback) {
            callback();
          }
        }
      }

      // 若非重新聊天,需提交文本框内容
      if (!isReChat) {
        this.chatResult_push(createChatResult('user', this.chatText, {copy:true}));
        this.chatText_set('');
      }
      
      // 开始聊天，记录助手信息，设置助手的思考状态
      this.isChat = true;
      this.chatResult_push(createChatResult('assistant', '', {thinking: true}));
      const index = this.chatResult.length - 1;
      
      let response = await toRequest.call(this); //获取请求的response

      // 若无响应或响应无body，视为请求失败
      if (!response || !response.body) {
        this.initChatData('chat'); // 重置聊天状态
        this.chatResult_splice([-1]); //删除
        this.chatResult_push(createChatResult('assistant', '⚠️ 请求失败或已取消', {reThinking: true})); // 添加错误消息
        return;
      }

      // 请求完成，助手关闭思考，直接删除，在添加一段空文本数据
      this.chatResult_splice([-1]);
      this.chatResult_push(createChatResult('assistant', '', {})); // 添加空文本数据

      try {
        // 读取文字
        await processStreamData.call(this, response, index, ()=>this.ChatDialogToBottom());

        // 读取完成,添加audio,允许copy,和重新加载
        this.chatResult_setByIndex([index, createChatResult(
          this.chatResult[index].role,
          this.chatResult[index].content,
          {
            audio: 'play',
            copy: true,
            reThinking: true,
            translate: 'false',
          }
        )]);
      }
      catch(e) {
        // 读取失败
        if (e.msg !== '读取被中止') {
          this.chatResult_splice([-1]); //删除
          this.chatResult_push(createChatResult('assistant', '⚠️ 生成失败，请重试', {reThinking: true})); // 添加错误消息
        }
      }
      
      // 聊天结束，重置状态
      this.initChatData('chat');
    },

    /**
     * 文本转语音
     * @param text 要转换的文本
     * @param voiceType 音色类型
     * @returns {Audio | null} 音频对象 null表示转换失败
     */
    async QiniuTextToSpeech(text, voiceType='qiniu_zh_male_ljfdxz') {
      /**
       * 文本转语音
       * @param text 文本内容
       * @param voiceType 音色类型
       * @returns {object | null} 响应数据 null表示请求失败
       */
      async function requestTextToSpeech(text, voiceType) {
        // 文本可能包含html占位符如&quot等，需要转换为纯文本形式
        const htmlReplacements = ['&quot;','&lt;','&gt;','&amp;'];
        htmlReplacements.forEach(replacement => {
          text = text.replace(new RegExp(replacement, 'g'), ''); // 替换所有出现的占位符
        });

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
          response = await request({
            url: '/api/qiniu/tts',
            method: 'POST',
            data: requestBody,
          });
        }
        catch(e) {
          console.error('请求失败:', e);
          return null;
        }

        return response;
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
      const response = await requestTextToSpeech(text, voiceType);
      
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
        this.chatResult_setAudioByIndex([idx, 'play']);
      };

      // 挂载添加暂停播放的事件
      audio.onpause = () => {
        // 暂停播放，将svgDividerType_1 改为replay
        this.chatResult_setAudioByIndex([idx, 'replay']);
      };

      // 挂载添加播放事件
      audio.onplay = () => {
        // 播放中，将svgDividerType_1 改为pause
        this.chatResult_setAudioByIndex([idx, 'pause']);
      };
    },

    /**
     * 取消聊天
     */
    stopChat() {
      // 若已建立了读取器，取消流式读取
      if (this.chatReader) {
        this.chatReader.cancel();
      }

      // 取消请求
      if (this.chatAbortController) {
        this.chatAbortController.abort();
      }

      // 重置聊天状态
      this.initChatData('chat');
    },

    /**
     * 取消语音播放
     */
    stopAudio() {
      // 若已建立了音频资源，取消播放
      if (this.audioMap.size > 0) {
        this.audioMap.forEach(audio => {
          audio.pause();
        });
      }
      
      // 清空音频列表
      this.audioMap_clear();
    },

    /**
     * 翻译
     * @param idx 消息索引
     */
    async translate(idx) {
      /**
       * 发送请求
       * @param content 拟翻译内容
       * @returns {Promise<Response>} 响应对象
       */
      async function toRequest(content) {
        let response; // 保存响应对象

        const systemPrompt = [{
          "role": "system",
          "content": [{
            type: 'text',
            text: '你是精通中国古文的翻译机器人，我将给你一段古文，要求将它翻译成现代汉语白话文，仅输出翻译结果',
          }]
        }]

        // 设置请求体
        const requestBody = {
          search: this.isSearch,
          messages: systemPrompt
          .concat({
            "role": 'user',
            "content": content,
          })
        };

        // 进行请求
        try {
          response = await request({
            url: '/api/qiniu/chat',
            method: 'POST',
            data: requestBody,
          });
        } 
        catch (err) {
          if (err.name === 'AbortError') {
            console.log('请求已取消');
            return {};
          }
          throw err;
        }

        return response;
      }

      // 请求获取翻译结果
      this.chatResult_setAttrByIndex([idx, 'translate', 'loading']);

      let response;
      try {
        response = await toRequest.call(this, this.chatResult[idx].content);
      }
      catch(e) {
        console.error('翻译异常:', e);
        // 若翻译异常，清空翻译内容
        this.chatResult_setAttrByIndex([idx, 'modernContent', '']);
        this.chatResult_setAttrByIndex([idx, 'translate', 'false']);
        Message({
          showClose: true,
          message: '网络异常，请重试',
          type: 'error'
        });
        return;
      }
      
      
      // 获取翻译结果
      try {
        const modernContent = response.choices[0].message.content;
        this.chatResult_setAttrByIndex([idx, 'modernContent', modernContent]);
        this.chatResult_setAttrByIndex([idx, 'translate', 'true']);
      }
      catch(e) {
        console.error('翻译异常:', e);
        // 若翻译异常，清空翻译内容
        this.chatResult_setAttrByIndex([idx, 'translate', 'false']);
        this.chatResult_setAttrByIndex([idx, 'modernContent', '']);
        Message({
          showClose: true,
          message: '翻译异常，请重试',
          type: 'error'
        });
        return;
      }
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
      this.chatResult_setAudioByIndex([idx, 'loading']);

      // 转为文本转语音
      const cleanText = text.replace(/\([^)]*\)|（[^）]*）/g, ''); // 删除文本里的括号及其内容包括中文的括号
      const audio = await this.QiniuTextToSpeech(cleanText, this.chatResult[idx].voiceType);

      if (!audio) {
        // 转换失败,设置为play
        this.chatResult_setAudioByIndex([idx, 'play']);
        Message({
          showClose: true,
          message: '文本转语音失败，请重试',
          type: 'error'
        });
        return;
      }

      // 挂载事件
      this.addEventToAudio(audio, idx);

      // 播放音频
      audio.play();

      // 转换完成,设置为pause
      this.chatResult_setAudioByIndex([idx, 'pause']);

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
      
      if (audio) {
        audio.pause();
      }
      
      // 调整状态为replay
      this.chatResult_setAudioByIndex([idx, 'replay']);
    },

    /**
     * 继续播放
     * @param idx 消息索引
     */
    onReplaySpeech_replay(idx) {
      // 继续播放
      const audio = this.audioMap.get(idx);
      if (audio) {
        audio.play();
      }
      
      // 调整状态为pause
      this.chatResult_setAudioByIndex([idx, 'pause']);
    },

    /**
     * 重新思考
     * @param idx 消息索引
     */
    onReThinking_do(idx) {
      // 删除该项及其随后项
      this.chatResult_splice([idx]);

      // 关闭声音,并清除音频资源
      this.audioMap.get(idx)?.pause();
      this.audioMap_deleteByIndex(idx);

      // 进行重新思考
      this.QiniuChat(true);
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
        // 取消聊天
        this.stopChat();
      }
      // 未在聊天在则开始聊天
      else {
        this.QiniuChat();
        this.$nextTick(() => {
          this.ChatDialogToBottom();
        });
      }
    },

    /**
     * 点击翻译
     * @param idx 消息索引
     */
    async onTranslate_do(idx) {
      console.log('点击翻译', idx);

      // 若已完成翻译了，则显示翻译文章
      if (this.chatResult[idx].translate === 'true') {
        return;
      }

      this.translate(idx);

      this.initChatData('translate');
    },

    /**
     * 点击翻译恢复
     * @param idx 要翻译恢复的消息的下标
     */
    onTranslateRestore_do(idx) {
      this.chatResult_setAttrByIndex([idx, 'translate', 'false']);
      this.chatResult_setAttrByIndex([idx, 'modernContent', '']);
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

      // 若聊天框不存在，或滚动到最底部时，隐藏浮标
      if (!ChatDialog || 
          ChatDialog.$el.scrollTop + ChatDialog.$el.clientHeight >= ChatDialog.$el.scrollHeight - 1) {
        this.scroller_visible = false;
      }
      // 当聊天内容高度超过容器高度时显示浮标
      else if (ChatDialog.$el.scrollHeight > ChatDialog.$el.clientHeight) {
        this.scroller_visible = true;
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
      this.scrollListener = throttle(function() {
        this.update_scroller_visibility();
      }.bind(this), 128);

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

    /**
     * 初始化内容变化监听
     */
    init_content_observer() {
      // 移除旧的监听器
      if (this.contentObserver) {
        this.contentObserver.disconnect();
      }
      
      // 创建新的监听器
      const ChatDialog = this.$refs['ChatDialog'];
      if (!ChatDialog) return;

      // 创建MutationObserver监听内容变化
      this.contentObserver = new MutationObserver(throttle(function() {
        this.update_scroller_visibility();
      }.bind(this), 128));

      // 配置监听选项
      const config = { 
        childList: true, 
        subtree: true, 
        characterData: true 
      };

      // 开始监听
      this.contentObserver.observe(ChatDialog.$el, config);
    },

    /**
     * 清理内容变化监听
     */
    cleanup_content_observer() {
      if (this.contentObserver) {
        this.contentObserver.disconnect();
        this.contentObserver = null;
      }
    },

    /**
     * 初始化浏览器大小变化监听,，通过animation api 实现平滑过渡
     */
    init_browser_size_listener() {
      // 移除旧的监听器
      if (this.browserSizeListener) {
        window.removeEventListener('resize', this.browserSizeListener);
      }

      // 创建新的监听器
      this.browserSizeListener = () => {
        // 使用 requestAnimationFrame 实现平滑过渡
        requestAnimationFrame(() => {
          this.reset_scroller();
          this.update_scroller_visibility();
        });
      };

      // 添加浏览器大小变化监听
      window.addEventListener('resize', this.browserSizeListener);
    },

    /**
     * 清除浏览器大小变化监听
     */
    cleanup_browser_size_listener() {
      if (this.browserSizeListener) {
        window.removeEventListener('resize', this.browserSizeListener);
        this.browserSizeListener = null;
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
    this.init_content_observer();
    this.init_browser_size_listener();

    // 若当前选中项对应的历史人物没有图片
    // 则加载图片
    if (this.imgMap.has(this.selectedModel.figureId)) {
      const img = this.imgMap.get(this.selectedModel.figureId);
      this.imgs = {
        assistant: img,
      }
    }
    else {
      request({
        url: `/api/historicalFigures/figures/image/${this.selectedModel.figureId}`,
        method: 'GET',
      })
      .then(res => {
        return res.data.image_base64;
      })
      .then(base64 => {
        // 转换为png格式并保存
        const pngBase64 = this.Imgbase64ToPng(base64);
        // 保存到vuex状态管理
        this.imgMap_set([this.selectedModel.figureId, pngBase64]);
        this.imgs = {
          assistant: pngBase64,
        }
      })
      .catch(err => {
        console.error('获取图片失败:', err);
      })
    }
  },
  beforeDestroy() {
    // 组件销毁时，清理相关的监听
    this.cleanup_scroll_listener();
    this.cleanup_content_observer();
    this.cleanup_browser_size_listener();

    this.stopChat();// 取消聊天
    this.chatResult_clear();// 清空聊天结果
    this.stopAudio();// 取消可能的语音播放
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
