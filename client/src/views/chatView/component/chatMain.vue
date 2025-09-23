<template>
  <div class="content">
    <h1>早上好，中午好，下午好，晚上好</h1>
    <MultiLineInput :value="chatText" :submitType="'submit'" @input="onInput" @submit="onSubmit"></MultiLineInput>
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
	},
	data() {
    return {
    }
  },
  computed: {
    ...mapState({
      chatText: state => state.chatView.chatText,
    })


  },
  watch: {
  },
  methods: {
    ...mapMutations({
      chatText_set: 'chatView/chatText_set'
    }),


    onInput(e) {
      this.chatText_set(e);
    },
    onSubmit(e) {
      this.$emit('submit', e);
    },
    


    on_(...args) {
      console.log(...args);

    }
  }
}
</script>

<style scoped>
h1 {
  text-align: center;
}
</style>
