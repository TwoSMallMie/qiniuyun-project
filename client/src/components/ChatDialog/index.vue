<!-- 聊天框 - 与模型 -->

<template>
  <div class="chat-container hide_scrolling">
    <div v-for="(msg, idx) in messages" :key="idx" class="chat-row" :class="msg.role === 'user' ? 'user' : (msg.role === 'assistant' ? 'assistant' : 'error')">
      <!-- 图标 -->
      <div v-if="msg.role === 'assistant'" class="avatar left-avatar">
        <img v-if="imgs.assistant" :src="imgs.assistant" alt="" width="36px">
        <span v-else>🤖</span>
      </div>
      <div v-else-if="msg.role === 'user'" class="avatar right-avatar">
        <img v-if="imgs.user" :src="imgs.user" alt="" width="36px">
        <span v-else>🧑</span>
      </div>

      <!-- 文本框和其他 -->
      <div class="chat-content-wrapper">
        <div v-if="msg.thinking" class="chat-bubble loading-bubble">
          <span class="loader"></span>
        </div>
        <div v-if="!msg.thinking" class="chat-bubble" v-html="msg.role !== 'user' ? renderContent_assistant(msg.content) : renderContent_user(msg.content)"></div>
        <div v-if="msg.modernContent !== ''">
          <br />
          <div style="font-size:14px;">翻译结果：</div>
          <div v-if="!msg.thinking" class="chat-modern" v-html="msg.role !== 'user' ? renderContent_assistant(msg.modernContent) : renderContent_user(msg.content)"></div>
        </div>
        <div class="chat-divider">
          <!-- audio -->
          <svg 
            v-if="msg.audio === 'play' && msg.role === 'assistant' && !msg.thinking"
            class="chat-divider-svg"
            @click="onClick_textToSpeech(msg, idx, 'play')"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M460.8 128c-6.4-6.4-19.2-6.4-32 0L224 281.6h-192c-19.2 0-32 19.2-32 32V704c0 19.2 12.8 32 32 32h192L428.8 896c6.4 0 12.8 6.4 19.2 6.4 6.4 0 12.8 0 12.8-6.4 12.8-6.4 19.2-19.2 19.2-25.6V153.6c0-6.4-6.4-19.2-19.2-25.6z m-44.8 678.4L256 684.8c-6.4-6.4-12.8-6.4-19.2-6.4H64V345.6h172.8c6.4 0 12.8 0 19.2-6.4l160-121.6v588.8zM857.6 512c0-115.2-57.6-224-153.6-268.8-12.8-6.4-32 0-44.8 12.8-6.4 12.8 0 32 12.8 44.8 70.4 32 115.2 115.2 115.2 211.2 0 96-44.8 172.8-115.2 211.2-12.8 6.4-19.2 25.6-12.8 44.8 6.4 12.8 19.2 19.2 25.6 19.2 6.4 0 12.8 0 12.8-6.4 102.4-44.8 160-153.6 160-268.8z" p-id="7639" fill="#707070"></path><path d="M601.6 364.8c-12.8-6.4-32 0-44.8 12.8s0 32 12.8 44.8c32 12.8 51.2 51.2 51.2 89.6 0 38.4-19.2 76.8-51.2 89.6-12.8 6.4-19.2 25.6-12.8 44.8 6.4 12.8 19.2 19.2 25.6 19.2 6.4 0 12.8 0 12.8-6.4 57.6-25.6 89.6-83.2 89.6-147.2 0-64-32-121.6-83.2-147.2zM812.8 134.4c-12.8-6.4-32 0-44.8 12.8-6.4 12.8 0 32 12.8 44.8 108.8 51.2 179.2 179.2 179.2 320s-70.4 268.8-179.2 320c-12.8 6.4-19.2 25.6-12.8 44.8 6.4 12.8 19.2 19.2 25.6 19.2 6.4 0 12.8 0 12.8-6.4 128-64 211.2-211.2 211.2-377.6 6.4-166.4-76.8-313.6-204.8-377.6z" fill="#707070"></path>
          </svg>
          <svg
            v-else-if="msg.audio === 'pause' && msg.role === 'assistant' && !msg.thinking"
            class="chat-divider-svg"
            @click="onClick_textToSpeech(msg, idx, 'pause')"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M512 62.389956c-248.312412 0-449.610044 201.297632-449.610044 449.610044s201.297632 449.610044 449.610044 449.610044 449.610044-201.297632 449.610044-449.610044S760.312412 62.389956 512 62.389956zM786.507004 786.507004c-35.672454 35.672454-77.196173 63.672158-123.416867 83.222423-47.821145 20.22667-98.655927 30.482245-151.09116 30.482245-52.435233 0-103.270015-10.255575-151.09116-30.482245-46.220694-19.549242-87.744413-47.549969-123.416867-83.222423-35.672454-35.672454-63.672158-77.196173-83.222423-123.416867-20.22667-47.821145-30.482245-98.655927-30.482245-151.090137 0-52.435233 10.255575-103.270015 30.482245-151.09116 19.549242-46.220694 47.549969-87.744413 83.222423-123.416867 35.672454-35.672454 77.196173-63.672158 123.416867-83.222423 47.821145-20.22667 98.654904-30.482245 151.09116-30.482245 52.435233 0 103.268992 10.255575 151.09116 30.482245 46.220694 19.549242 87.744413 47.549969 123.416867 83.222423 35.672454 35.672454 63.672158 77.196173 83.222423 123.416867 20.22667 47.821145 30.482245 98.655927 30.482245 151.09116 0 52.435233-10.255575 103.268992-30.482245 151.090137C850.179163 709.310831 822.179458 750.83455 786.507004 786.507004zM699.168844 285.84933 583.882144 285.84933c-3.203972 0-5.801123 2.597151-5.801123 5.801123l0 440.698071c0 3.203972 2.597151 5.801123 5.801123 5.801123l115.2867 0c3.203972 0 5.801123-2.597151 5.801123-5.801123L704.969966 291.650453C704.97099 288.446481 702.373839 285.84933 699.168844 285.84933zM440.117856 285.84933 324.830133 285.84933c-3.203972 0-5.801123 2.597151-5.801123 5.801123l0 440.698071c0 3.203972 2.597151 5.801123 5.801123 5.801123L440.117856 738.149647c3.203972 0 5.801123-2.597151 5.801123-5.801123L445.918979 291.650453C445.918979 288.446481 443.321828 285.84933 440.117856 285.84933z" fill="#707070"></path>
          </svg>
          <svg 
            v-else-if="msg.audio === 'loading' && msg.role === 'assistant'&& !msg.thinking"
            class="chat-divider-svg rotating"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M753.365333 270.634667a46.08 46.08 0 0 1-61.226666 3.498666 220.970667 220.970667 0 0 0-14.293334-10.581333 298.752 298.752 0 0 0-441.770666 362.666667 298.666667 298.666667 0 0 0 571.904-74.282667A45.696 45.696 0 0 1 853.333333 512h3.328a37.333333 37.333333 0 0 1 37.12 41.301333 384 384 0 1 1-151.936-348.970666c2.56 1.92 5.418667 4.181333 8.618667 6.826666a40.192 40.192 0 0 1 2.901333 59.477334z" fill="#707070"></path>
          </svg>
          <svg 
            v-else-if="msg.audio === 'replay' && msg.role === 'assistant' && !msg.thinking"
            class="chat-divider-svg"
            @click="onClick_textToSpeech(msg, idx, 'replay')"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M460.8 128c-6.4-6.4-19.2-6.4-32 0L224 281.6h-192c-19.2 0-32 19.2-32 32V704c0 19.2 12.8 32 32 32h192L428.8 896c6.4 0 12.8 6.4 19.2 6.4 6.4 0 12.8 0 12.8-6.4 12.8-6.4 19.2-19.2 19.2-25.6V153.6c0-6.4-6.4-19.2-19.2-25.6z m-44.8 678.4L256 684.8c-6.4-6.4-12.8-6.4-19.2-6.4H64V345.6h172.8c6.4 0 12.8 0 19.2-6.4l160-121.6v588.8zM857.6 512c0-115.2-57.6-224-153.6-268.8-12.8-6.4-32 0-44.8 12.8-6.4 12.8 0 32 12.8 44.8 70.4 32 115.2 115.2 115.2 211.2 0 96-44.8 172.8-115.2 211.2-12.8 6.4-19.2 25.6-12.8 44.8 6.4 12.8 19.2 19.2 25.6 19.2 6.4 0 12.8 0 12.8-6.4 102.4-44.8 160-153.6 160-268.8z" p-id="7639" fill="#707070"></path><path d="M601.6 364.8c-12.8-6.4-32 0-44.8 12.8s0 32 12.8 44.8c32 12.8 51.2 51.2 51.2 89.6 0 38.4-19.2 76.8-51.2 89.6-12.8 6.4-19.2 25.6-12.8 44.8 6.4 12.8 19.2 19.2 25.6 19.2 6.4 0 12.8 0 12.8-6.4 57.6-25.6 89.6-83.2 89.6-147.2 0-64-32-121.6-83.2-147.2zM812.8 134.4c-12.8-6.4-32 0-44.8 12.8-6.4 12.8 0 32 12.8 44.8 108.8 51.2 179.2 179.2 179.2 320s-70.4 268.8-179.2 320c-12.8 6.4-19.2 25.6-12.8 44.8 6.4 12.8 19.2 19.2 25.6 19.2 6.4 0 12.8 0 12.8-6.4 128-64 211.2-211.2 211.2-377.6 6.4-166.4-76.8-313.6-204.8-377.6z" fill="#707070"></path>
          </svg>

          <!-- copy -->
          <svg
            v-if="msg.copy"
            class="chat-divider-svg"
            @click="onClick_copy(msg)"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M704 384v512H192V384h512m32-64h-576a32 32 0 0 0-32 32v576a32 32 0 0 0 32 32h576a32 32 0 0 0 32-32v-576a32 32 0 0 0-32-32z" fill="#707070" p-id="13863"></path><path d="M320 512m32 0l192 0q32 0 32 32l0 0q0 32-32 32l-192 0q-32 0-32-32l0 0q0-32 32-32Z" fill="#707070" p-id="13864"></path><path d="M320 704m32 0l192 0q32 0 32 32l0 0q0 32-32 32l-192 0q-32 0-32-32l0 0q0-32 32-32Z" fill="#707070" p-id="13865"></path><path d="M928 128h-576a32 32 0 0 0-32 32V256h64V192h512v576h-64v64h96a32 32 0 0 0 32-32v-640a32 32 0 0 0-32-32z" fill="#707070"></path>
          </svg>

          <!-- reThinking -->
           <svg
            v-if="msg.reThinking && idx === lastReThinking"
            class="chat-divider-svg"
            @click="onClick_reThinking(idx)"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M192 512c0-176.32 144.992-320 324.8-320 106.304 0 200.608 50.304 259.84 128H672v64h224V160h-64v127.2A389.792 389.792 0 0 0 516.8 128C302.432 128 128 299.52 128 512s174.464 384 388.8 384c183.552 0 337.728-125.76 378.336-295.328l-62.24-14.88C799.136 726.688 670.592 832 516.736 832 336.992 832 192 688.32 192 512z" fill="#707070"></path>
          </svg>

          <!-- 翻译 -->
          <div
            v-if="msg.role === 'assistant' && msg.translate === 'false'"
            class="div-icon"
            @click="onClick_translate(idx)"
          >
            <div>译</div>
          </div>
          <svg 
            v-else-if="msg.role === 'assistant' && msg.translate === 'loading'"
            class="chat-divider-svg rotating"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M753.365333 270.634667a46.08 46.08 0 0 1-61.226666 3.498666 220.970667 220.970667 0 0 0-14.293334-10.581333 298.752 298.752 0 0 0-441.770666 362.666667 298.666667 298.666667 0 0 0 571.904-74.282667A45.696 45.696 0 0 1 853.333333 512h3.328a37.333333 37.333333 0 0 1 37.12 41.301333 384 384 0 1 1-151.936-348.970666c2.56 1.92 5.418667 4.181333 8.618667 6.826666a40.192 40.192 0 0 1 2.901333 59.477334z" fill="#707070"></path>
          </svg>
          <div
            v-else-if="msg.role === 'assistant' && msg.translate === 'true'"
            class="div-icon"
            @click="onClick_translateRestore(idx)"
          >
            <div>原</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import copyToClipboard from '@/utils/copyToClipboard/index.js'; //这里引用了copyToClipboard函数
import { debounce } from '@/utils/helper';
import { Message } from 'element-ui';


export default {
  name: 'ChatDialog',
  props: {
    /**聊天消息列表*/
    messages: {
      type: Array,
      required: true
    },
    /**图片映射表*/ //assistant代表助手的头像 user代表用户的头像
    imgs: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      /**
       * 聊天框底部的svg图标类型_1
       * play loading pause replay
       */
      svgDividerType_1: 'play',
    }
  },
  computed: {
    /**
     * 最后一条消息是否在思考中
     */
    lastReThinking() {
      // 倒序遍历messages
      // 找到最后一个assistant,若它reThinking为true,返回它的下标,否则返回-1
      for (let i = this.messages.length - 1; i >= 0; i--) {
        // 找到最后一个assistant
        if (this.messages[i].role === 'assistant') {
          return this.messages[i].reThinking ? i : -1;
        }
      }
      return -1;
    }
  },
  methods: {
    /***************************************************************
     * 外部调用函数集合 func
     ***************************************************************/
    reset_svgDividerType_1(value) {
      this.svgDividerType_1 = value;
    },

    
    /***************************************************************
     * 工具函数集合 helper
     ***************************************************************/
    /**
     * markdown 转 text，简易实现
     * @param md markdown
     */
    mdToText(md) {
      // 去除标题（# 标题）
      let text = md.replace(/^#+\s*(.*)$/gm, '$1');
      
      // 去除加粗/斜体（**text** 或 *text*）
      text = text.replace(/\*\*(.*?)\*\*/g, '$1');
      text = text.replace(/\*(.*?)\*/g, '$1');
      
      // 去除链接（[text](url)）
      text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');
      
      // 去除图片（![alt](url)）
      text = text.replace(/!\[(.*?)\]\(.*?\)/g, '$1');
      
      // 去除列表（- * 1.）
      text = text.replace(/^[-*+]\s*(.*)$/gm, '$1');
      text = text.replace(/^\d+\.\s*(.*)$/gm, '$1');
      
      // 去除代码块（`code` 或 ```code```）
      text = text.replace(/`(.*?)`/g, '$1');
      text = text.replace(/^```[\s\S]*?^```/gm, '');
      
      // 去除引用（> text）
      text = text.replace(/^>\s*(.*)$/gm, '$1');
      
      // 去除多余空行
      text = text.replace(/\n{3,}/g, '\n\n');
      
      return text.trim();
    },

    /**
     * markdown 转 html
     * @param md markdown
     */
    mdToHtml(md) {
      // 转换markdown为html
      return marked.parse(md);
    },

    /**
     * text 转 html
     * @param text 文本
     */
    textToHtml(text) {
      // 将文本套进p标签
      return `<p>
                ${text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")}
              </p>`;
    },


     
    /***************************************************************
     * 数据函数集合 data
     ***************************************************************/



    /***************************************************************
     * 事件函数集合(部分) onevent_part
     ***************************************************************/
    /**
     * 
     * @param text 要复制的文本
     * @param callback 转换函数
     */
    copyToClipboard(text, callback=(a)=>a) {
      // 转换文本格式
      const transformedText = callback(text);
      // 复制到剪贴板
      return copyToClipboard(transformedText);
    },


    /***************************************************************
     * 事件函数集合 onevent
     ***************************************************************/
    /**
     * 点击语音转文本
     */
    onClick_textToSpeech: debounce(function(msg, idx, type) {
      // this.$emit('textToSpeech', msg.content, idx, type);
      if (type === 'play') {
        const text = this.mdToText(msg.content);
        this.$emit('textToSpeech', text, idx, type);
      }
      else if (type === 'pause') {
        this.$emit('pauseSpeech', idx);
      }
      else if (type === 'replay') {
        this.$emit('replaySpeech', idx);
      }
    }, 256),
    
    /**
     * 点击复制
     * @param msg 要复制的消息
     */
    onClick_copy: debounce(function(msg) {
      let isCopyToClipboard = false;
      
      if (msg.copy) {
        if (msg.role === 'assistant') {
          isCopyToClipboard = this.copyToClipboard(msg.content, this.mdToText);
        }
        else if (msg.role === 'user') {
          isCopyToClipboard = this.copyToClipboard(msg.content);
        }
        else {
          isCopyToClipboard = this.copyToClipboard(msg.content);
        }
      }
      
      if (isCopyToClipboard) {
        Message.success('复制完成！');
      }
      else {
        Message.error('复制失败，请重试');
      }
    }, 256),

    /**
     * 点击重新思考
     * @param idx 要重新思考的消息的下标
     */
    onClick_reThinking(idx) {
      this.$emit('reThinking', idx);
    },

    /**
     * 点击翻译
     * @param idx 要翻译的消息的下标
     */
    onClick_translate(idx) {
      // this.$tooltip.success('操作成功完成！')
      this.$emit('translate', idx);
    },

    /**
     * 点击翻译恢复
     * @param idx 要翻译恢复的消息的下标
     */
    onClick_translateRestore(idx) {
      this.$emit('translateRestore', idx);
    },


    /***************************************************************
     * 其他函数集合 other
     ***************************************************************/
    /**
     * 处理助手文本，将md格式文本转为html
     * @param content md字符串
     */
    renderContent_assistant(content) {
      return this.mdToHtml(content || '');
    },

    /**
     * 处理用户文本，并处理特殊字符，并套在p标签内
     * @param content 字符串
     */
    renderContent_user(content) {
      return this.textToHtml(content);
    },



    on_(...args) {
      console.log(...args);
      
    }
  }
};
</script>

<style scoped>
.chat-container {
  max-height: 500px;
  width: 100%;
  margin: 0 auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(135deg, rgba(245, 245, 245, 0.6) 0%, rgba(245, 245, 245, 0.4) 100%);
  backdrop-filter: blur(10px);
}
.chat-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.chat-row.assistant {
  flex-direction: row;
  justify-content: flex-start;
}
.chat-row.user {
  flex-direction: row-reverse;
  justify-content: flex-start;
}
.chat-row.error {
  flex-direction: row-reverse;
  justify-content: flex-start;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e3eafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transform: translate(0px, -16px);
  overflow: hidden;
}
.left-avatar {
  background: linear-gradient(135deg, rgba(227, 234, 252, 0.9) 0%, rgba(227, 234, 252, 0.7) 100%);
}
.right-avatar {
  background: linear-gradient(135deg, rgba(203, 231, 255, 0.9) 0%, rgba(203, 231, 255, 0.7) 100%);
}
.chat-content-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.chat-row.user .chat-content-wrapper,
.chat-row.error .chat-content-wrapper {
  align-items: flex-end;
}
.chat-bubble {
  max-width: calc(80% - 18px);
  padding: 0px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  color: #2c3e50;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  line-height: 1.5;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.chat-row.user .chat-bubble,
.chat-row.error .chat-bubble {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.9) 0%, rgba(24, 144, 255, 0.7) 100%);
  color: #fff;
  margin-left: auto;
  border: 1px solid rgba(24, 144, 255, 0.3);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
}

.chat-row.user .chat-bubble::before,
.chat-row.error .chat-bubble::before {
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%);
}
.chat-bubble table {
  width: 100%;
  border-collapse: collapse;
}
.chat-bubble th,
.chat-bubble td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.chat-bubble th {
  background-color: #f2f2f2;
}
.error-msg {
  color: #d32f2f;
  font-size: 15px;
  padding: 10px 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 243, 243, 0.9) 0%, rgba(255, 243, 243, 0.7) 100%);
  margin: 0 8px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(211, 47, 47, 0.2);
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.1);
}
.loading-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(245, 247, 250, 0.9) 0%, rgba(245, 247, 250, 0.7) 100%);
  min-height: 38px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}
.chat-row.user .loading-bubble,
.chat-row.error .loading-bubble {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(37, 99, 235, 0.7) 100%);
  border: 1px solid rgba(37, 99, 235, 0.3);
}
.loader {
  width: 24px;
  height: 24px;
  border: 3px solid #cbe7ff;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}
.chat-divider {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  margin: 0px 12px;
  
}
.chat-divider-svg {
  width: 18px;
  height: 18px;
  margin: 8px 4px 0px 4px;
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.chat-divider-svg:hover {
  background: rgba(24, 144, 255, 0.15);
}
.chat-modern {
  padding: 0px 12px;
  font-size: 12px;
  color: #2c3e50;
}
.div-icon {
  margin: 8px 4px 0px 4px;
  padding: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #707070;
  font-size: 12px;
  border-radius: 6px;
  font-weight: bold;
}
.div-icon:hover {
  background: rgba(24, 144, 255, 0.15);
}
.div-icon>div {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #707070;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
/* 隐藏所有滚动条（适用于现代浏览器） */
.hide_scrolling {
  overflow: auto; /* 或 scroll（强制显示滚动条区域） */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE 10+ 隐藏滚动条 */
}
/* Chrome/Safari/Edge 隐藏滚动条 */
.hide_scrolling::-webkit-scrollbar {
  display: none;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 添加旋转动画类 */
.rotating {
  background-color: #ffffff00 !important;
  animation: spin 1s linear infinite;
}
</style>
