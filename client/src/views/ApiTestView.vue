<template>
  <div>
  </div>
</template>

<script>
import axios from 'axios';

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
      chatResult: [],
      chatReader: null,
      chatAbortController: null,
      isChat: false,
      isStream: true,
      isSearch: true,
      text: ''
    };
  },
  computed: {
    submitType() {
      return this.isChat ? 'pause' : 'submit';
    },
  },
  methods: {



    
  },

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