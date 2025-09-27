import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import chatView from './modules/chatView'

export default new Vuex.Store({
  state: {
    /**下拉列表选项*/
    modelDropdownItems: [
      { value: 0, label: '请选择' },
    ],

    /**下拉菜单选中项*/
    selectedModel: { value: 0, label: '请选择' },
  },
  getters: {
  },
  mutations: {
    /**
     * 设置下拉列表选项
     * @param state 状态
     * @param {object[]} value 值
     */
    modelDropdownItems_set(state, value) {
      state.modelDropdownItems = value;
      state.modelDropdownItems.splice();
      if (state.modelDropdownItems.length > 0) {
        state.selectedModel = state.modelDropdownItems[0]; // 此操作会重置下拉菜单选中项
      }
    },

    /**
     * 设置下拉菜单选中项
     * @param state 状态
     * @param {object} value 值
     */
    selectedModel_set(state, value) {
      state.selectedModel = value;
    },
  },
  actions: {
  },
  modules: {
    chatView
  }
})
