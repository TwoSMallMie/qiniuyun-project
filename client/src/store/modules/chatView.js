
export default {
  namespaced: true,
  state: {
    /**聊天文本内容*/
    chatText: '你对酒是什么情感？',
    // chatText: '',

    /**聊天结果*/
    chatResult: [],

    /**音频列表*/
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
      state.chatResult[index] = value;
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
     * 设置聊天结果内容
     * @param state 状态
     * @param {number[]} args 参数
     * @param {number} args[0] 索引
     * @param {string} args[1] 值
     */
    chatResult_setContentByIndex(state, [index, value]) {
      state.chatResult[index].content = value;
      // 强制触发数组更新以确保视图重新渲染
      state.chatResult.splice(index, 1, state.chatResult[index]);
    },
    /**
     * 设置聊天的audio属性
     * @param state 状态
     * @param {number[]} args 参数
     * @param {number} args[0] 索引
     * @param {'none' | 'play' | 'loading' | 'pause' | 'replay'} args[1] 值
     */
    chatResult_setAudioByIndex(state, [index, value]) {
      state.chatResult[index].audio = value;
      // 强制触发数组更新以确保视图重新渲染
      state.chatResult.splice(index, 1, state.chatResult[index]);
    },
    /**
     * 设置聊天结果的属性
     * @param state 状态
     * @param {number[]} args 参数
     * @param {number} args[0] 索引
     * @param {string} args[1] 属性名
     * @param {*} args[2] 值
     */
    chatResult_setAttrByIndex(state, [index, attr, value]) {
      state.chatResult[index][attr] = value;
      // 强制触发数组更新以确保视图重新渲染
      state.chatResult.splice(index, 1, state.chatResult[index]);
    },
    /**
     * 清空聊天结果
     * @param state 状态
     */
    chatResult_clear(state) {
      state.chatResult = [];
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
    /**
     * 清空音频列表
     * @param state 状态
     */
    audioMap_clear(state) {
      state.audioMap.clear();
    },
  },
  actions: {
  }
}
