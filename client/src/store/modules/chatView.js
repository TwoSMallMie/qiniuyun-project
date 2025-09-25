export default {
  namespaced: true,
  state: {
    /**
     * 聊天文本内容
     */
    chatText: '你是谁？今天是几年几月几号',
    // chatText: '',
    
    /**
     * 聊天结果
     */
    chatResult: [],

    /**
     * 音频列表
     */
    audioMap: new Map(),
  },
  getters: {
  },
  mutations: {
    /**
     * 设置聊天文本内容
     * @param state 状态
     * @param {string} value 值
     */
    chatText_set(state, value) {
      state.chatText = value;
    },

    /**
     * 设置聊天结果
     * @param state 状态
     * @param {number[]} args 参数
     * @param {number} args[0] 索引
     * @param {object} args[1] 值
     */
    chatResult_setByIndex(state, [index, value]) {
      state.chatResult[index] = Object.assign({}, value);
      state.chatResult.splice();
    },
    /**
     * 添加聊天结果
     * @param state 状态
     * @param {object} value 值
     */
    chatResult_push(state, value) {
      state.chatResult.push(value);
    },
    /**
     * 截取聊天结果
     * @param state 状态
     * @param {number[]} args 参数
     */
    chatResult_splice(state, args) {
      state.chatResult.splice(...args);
    },


    /**
     * 设置音频列表
     * @param state 状态
     * @param {number[]} args 参数
     * @param {number} args[0] 索引
     * @param {object} args[1] 值
     */
    audioMap_setByIndex(state, [index, value]) {
      state.audioMap.set(index, value);
    },
    /**
     * 从音频列表中删除指定索引的元素
     * @param state 状态
     * @param {number} index 索引
     */
    audioMap_deleteByIndex(state, index) {
      state.audioMap.delete(index);
    },
    /**
     * 获取音频列表中指定索引的元素
     * @param state 状态
     * @param {number} index 索引
     * @returns {object} 元素
     */
    audioMap_getByIndex(state, index) {
      return state.audioMap.get(index);
    },
  },
  actions: {
  }
}
