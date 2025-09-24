export default {
  namespaced: true,
  state: {
    /**
     * 聊天文本内容
     */
    chatText: '你是谁？今天是几年几月几号',
    // chatText: '',
    // chatResult: [{ "role": "user", "content": "你是谁，今天是几年几月几号" }, { "role": "assistant", "content": "我是你的AI助手！今天是**2025年9月23日**。😊 有什么我可以帮你的吗？" }, { "role": "user", "content": "今天的金价是？" }, { "role": "assistant", "content": "根据实时查询，截至 **2025年9月23日**，国际黄金价格约为 **每盎司 1,850 美元**（具体数值可能因市场波动略有变化）。国内金价方面，上海黄金交易所的 Au99.99 价格约为 **每克 520 元人民币**左右。  \n\n如需更精确的实时数据或不同规格（如首饰金、金条等）的价格，建议查看以下来源：  \n- **国际金价**：[Kitco黄金实时行情](https://www.kitco.com/)  \n- **国内金价**：[上海黄金交易所](http://www.sge.com.cn/) 或各大银行报价（如工商银行、建设银行等）。  \n\n请注意，金价随时波动，以上信息仅供参考。😊" }],
    
    /**
     * 聊天结果
     */
    chatResult: [],

    /**
     * 音频列表
     */
    audioList: [],
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
     * 设置音色列表
     * @param state 状态
     * @param {number[]} args 参数
     * @param {number} args[0] 索引
     * @param {object} args[1] 值
     */
    audioList_setByIndex(state, [index, value]) {
      state.audioList[index] = Object.assign({}, value);
      state.audioList.splice(index, 1);
    },
    /**
     * 添加音色列表
     * @param state 状态
     * @param {object} value 值
     */
    audioList_push(state, value) {
      state.audioList.push(value);
    },
    /**
     * 截取音色列表
     * @param state 状态
     * @param {number[]} args 参数
     */
    audioList_splice(state, args) {
      state.audioList.splice(...args);
    },
  },
  actions: {
  }
}
