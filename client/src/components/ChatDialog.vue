<!-- 聊天框 - 与模型 -->

<template>
  <div class="chat-container hide_scrolling">
    <div v-for="(msg, idx) in messages" :key="idx" class="chat-row" :class="msg.role === 'user' ? 'user' : (msg.role === 'assistant' ? 'assistant' : 'error')">
      <!-- 图标 -->
      <div v-if="msg.role === 'assistant'" class="avatar left-avatar">🤖</div>
      <div v-else-if="msg.role === 'user'" class="avatar right-avatar">🧑</div>

      <!-- 文本框和其他 -->
      <div v-if="msg.thinking" class="chat-bubble loading-bubble">
        <span class="loader"></span>
      </div>
      <div v-else class="chat-bubble" v-html="msg.role !== 'user' ? renderContent_assistant(msg.content) : renderContent_user(msg.content)"></div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';

export default {
  name: 'ChatDialog',
  props: {
    messages: {
      type: Array,
      required: true
    }
  },
  methods: {
    renderContent_assistant(content) {
      // 支持 markdown 渲染
      return marked(content || '');
    },
    renderContent_user(content) {
      return marked(
        content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
      )
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
  gap: 18px;
  overflow-y: auto;
}
.chat-row {
  display: flex;
  align-items: flex-end;
}
.chat-row.assistant {
  flex-direction: row;
  justify-content: flex-start;
}
.chat-row.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
.chat-row.error {
  flex-direction: row-reverse;
  justify-content: flex-end;
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
  margin: 0 8px;
}
.left-avatar {
  background: #e3eafc;
}
.right-avatar {
  background: #cbe7ff;
}
.chat-bubble {
  max-width: 80%;
  padding: 0px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: #f5f7fa;
  color: #222;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.chat-row.user .chat-bubble,
.chat-row.error .chat-bubble {
  background: #2563eb;
  color: #fff;
  margin-left: auto;
}
.chat-row.user .avatar,
.chat-row.error .avatar {
  margin-left: 8px;
  margin-right: 0;
}
.error-msg {
  color: #d32f2f;
  font-size: 15px;
  padding: 10px 18px;
  border-radius: 8px;
  background: #fff3f3;
  margin: 0 8px;
}
.loading-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  min-height: 38px;
}
.chat-row.user .loading-bubble,
.chat-row.error .loading-bubble {
  background: #2563eb;
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
</style>
