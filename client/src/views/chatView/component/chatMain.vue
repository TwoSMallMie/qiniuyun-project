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
		MultiLineInput: () => import('@/components/MultiLineInput.vue'),
	},
	props: {
    init_title: {
      type: String,
      default: '早上好，中午好，下午好，晚上好'
    }
	},
	data() {
    return {
      title: ' ',
    }
  },
  computed: {
    ...mapState({
      chatText: state => state.chatView.chatText, //聊天文本内容
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
    (async function() {
      function* createTextIterator(text) {
        for (let i = 0; i < text.length; i++) {
          yield text[i];
        }
      }

      const iterator = createTextIterator(this.init_title);
      let result = iterator.next();
      while (!result.done) {
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (125 - 75 + 1)) + 75));
        this.title = this.title.concat(result.value);
        result = iterator.next();
      }
    }).call(this);
    

    
  },
}
</script>

<style scoped>
h1 {
  text-align: center;
}
</style>
