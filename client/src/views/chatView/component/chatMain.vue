<template>
  <div class="content">
    <h1>{{ title }}</h1>
    <MultiLineInput :value="chatText" :submitType="'submit'" @input="onInput_setText" @submit="onSubmit_toChat"></MultiLineInput>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
	name: 'chatMain',
	components: {
		MultiLineInput: () => import('@/components/MultiLineInput/index.vue'),
	},
	props: {
	},
	data() {
    return {
      titleTemplate: (name) => `来跟${name}聊天吧！`,
      title: ' ',
    }
  },
  computed: {
    ...mapState({
      chatText: state => state.chatView.chatText, //聊天文本内容
      selectedName: state => state.selectedModel.label, // 选中的模型名称
    })
  },
  watch: {
  },
  methods: {
    ...mapMutations({
      chatText_set: 'chatView/chatText_set'
    }),
    /***************************************************************
     * 外部调用函数集合 func
     ***************************************************************/


    
    /***************************************************************
     * 工具函数集合 helper
     ***************************************************************/


     
    /***************************************************************
     * 数据函数集合 data
     ***************************************************************/



    /***************************************************************
     * 事件函数集合(部分) onevent_part
     ***************************************************************/
    /**
     * 选中模型名称变化时，更新标题
     */
    async updateTitle() {
      /**
       * 生成器函数，用于按字符迭代字符串
       * @param {string} text 要迭代的字符串
       * @return {Generator<string, void, undefined>} 字符迭代器
       */
      function* createTextIterator(text) {
        for (let i = 0; i < text.length; i++) {
          yield text[i];
        }
      }

      // 按字符迭代init_title，模拟打字机效果
      const iterator = createTextIterator(this.titleTemplate(this.selectedName));

      // q清空标题，迭代更新标题
      this.title = '';
      let result = iterator.next();
      while (!result.done) {
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (250 - 100 + 1)) + 100));
        //可能打1-3字，随机数 1字50% 2字30% 3字20%
        const randomNum = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
        let charNum = 1;
        if (randomNum <= 50) charNum = 1;
        else if (randomNum <= 80) charNum = 2;
        else charNum = 3;

        // 拼接字符
        for (let i = 0; i < charNum; i++) {
          if (result.done) {
            break;
          }
          this.title = this.title.concat(result.value);
          result = iterator.next();
        }
      }
    },


    /***************************************************************
     * 事件函数集合 onevent
     ***************************************************************/
    onInput_setText(e) {
      this.chatText_set(e);
    },
    onSubmit_toChat(e) {
      this.$emit('submit', e);
    },


    /***************************************************************
     * 其他函数集合 other
     ***************************************************************/


    


    on_(...args) {
      console.log(...args);

    }
  },
  mounted() {
    this.updateTitle();
  },
}
</script>

<style scoped>
h1 {
  text-align: center;
}
</style>
