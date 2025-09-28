<template>
	<div class="layout">
    <!-- 内容区域 -->
    <div :class="{'chat-view-center': true, 'full': chatting, 'center': !chatting}">
      <chatMain v-show="!chatting" @submit="onSubmit_chatMain"></chatMain>
      <chatToMode ref="chatToMode" v-show="chatting"></chatToMode>
    </div>
	</div>
</template>

<script>
export default {
	name: 'ChatView',
  components: {
    // ModelDropdown: () =>  import('@/components/ModelDropdown.vue'),
    chatMain: () => import('./component/chatMain.vue'),
    chatToMode: () => import('./component/chatToMode.vue'),
  },
	data() {
		return {
      /**是否处于聊天状态*/
      chatting: false,
		}
	},
	mounted() {
	},
	beforeDestroy() {
	},
	methods: {
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
     * 跳转至聊天界面开始聊天
     * @param e 用户输入的聊天文本内容
     */
    chatToMode(e) {
      this.chatting = true;
      this.$refs['chatToMode'].submit(e);
    },

    /***************************************************************
     * 事件函数集合 onevent
     ***************************************************************/
    /**
     * 提交聊天内容
     * @param e 事件对象
     */
    onSubmit_chatMain(e) {
      this.chatToMode(e);
    },






    /***************************************************************
     * 其他函数集合 other
     ***************************************************************/
    on_(...args) {
      console.log(...args);
    }
	}
}
</script>

<style scoped>
.layout {
	display: flex;
  position: relative;
	height: 100%;
}
.chat-view-center {
  max-width: 700px;
  width: calc(100% - 48px);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.chat-view-center.center {
  max-height: calc(100% - 20px - 28px - 10px);
}
.chat-view-center.full {
  height: calc(100% - 20px);
}
</style>
