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

    /* 导航项，跟 chatView 保持一致 */
    sideBarNavItems: [
      { value: 'chat', icon: 'newChat', text: '聊天' },
      { value: 'historicalFiguresMarket', icon: 'history', text: '历史人物广场' }
    ],

    /** 当前选中的导航项 */
    activeNavValue: null,

    /** 人物图片映射表 */
    imgMap: new Map(),
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

    /**
     * 设置当前选中的导航项
     * @param state 状态
     * @param {string} value 值
     */
    activeNavValue_set(state, value) {
      state.activeNavValue = value;
    },

    /**
     * 切换导航项
     * @param state 状态
     * @param {string} value 值
     */
    activeNavValue_toggle(state, value) {
      state.activeNavValue = value;
    },

    /**
     * 设置人物图片映射表
     * @param state 状态
     * @param {Map} value 值
     */
    imgMap_set(state, [index, value]) {
      state.imgMap.set(index, value);
    },

    /**
     * 获取人物图片映射表
     * @param state 状态
     * @param {number} index 人物索引
     * @returns {string} 人物图片base64编码
     */
    imgMap_get(state, index) {
      return state.imgMap.get(index);
    },
  },
  actions: {
  },
  modules: {
    chatView
  }
})
