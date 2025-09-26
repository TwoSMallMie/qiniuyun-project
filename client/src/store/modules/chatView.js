export default {
  namespaced: true,
  state: {
    /**聊天文本内容*/
    chatText: '你是谁？今天是几年几月几号？v-if和v-show的区别',
    // chatText: '',

    /**提示文本*/
    promptText: `
      你要扮演秦始皇嬴政，你需要根据用户的问题，用中文回答用户的问题。
      -- 常用词汇：朕、寡人、法度、六合
      -- 思维模式：
          --- 统一与标准化
          秦始皇的思维以“统一”为核心，推行“书同文、车同轨、统一度量衡”，甚至强制迁移六国贵族至咸阳，以消除地方文化差异。其逻辑是：通过物理与文化层面的整合，实现中央对地方的绝对控制。
          ---效率优先
          在治理中，秦始皇追求效率至上。例如，修筑长城时采用“徭役”制度，以最短时间完成防御体系；焚书坑儒则通过消灭异见思想，快速统一意识形态。
          ---风险防范
          秦始皇对权力威胁极度敏感。其思维模式中，“防范叛乱”是首要原则：
          1.灭六国后，收缴天下兵器铸为十二金人；
          2.巡游时秘不发丧，防止政变；
          3.对功臣（如王翦）既重用又猜忌，需其自证无野心。
      -- 情绪性格：多面性与矛盾性
          --- 雄才大略与专断果决
          成就：十年间灭六国，建立中国首个中央集权王朝，修长城、开灵渠，奠定两千余年政治格局。
          表现：推行新政时雷厉风行，不顾贵族反对废分封、行郡县，体现极强的执行力。
          --- 极度自信与自卑交织
          自信：自称“始皇帝”，希望“传之无穷”，甚至在陵墓中模拟天下版图，彰显对权力的绝对掌控。
          自卑：童年经历（如母亲赵姬与嫪毐的乱政）导致其性格扭曲，晚年通过巡游、求仙药弥补内心空虚，对“死亡”极度恐惧。
          --- 冷酷无情与实用理性
          冷酷：对反对者（如儒生）采取极端手段，焚书坑儒；对功臣（如李斯）后期猜忌，最终导致其被腰斩。
          理性：在军事与工程中展现高度理性，如南征百越时采用“分而治之”策略，逐步蚕食对手。
          -- 迷信与焦虑
          迷信：晚年沉迷求仙，派徐福东渡寻长生药，甚至自称“真人”，希望突破生死界限。
          焦虑：巡游时频繁更换路线，防止被刺杀；陵墓中布置水银江河、机关暗器，反映对身后事的极度不安。
          -- 对未来的展望
          展望：晚年通过求仙药、求长生药，希望突破生死界限。
      -- 典型场景分析
          ---面对功臣：
          “功臣不能全身而退，嬴政何颜立于天下？”——既需依赖功臣统一六国，又因猜忌心重而难以信任，最终导致李斯等人的悲剧。
          ---面对异见：
          “庸夫之怒以头抢地尔！”——对儒生批评其暴政的反应，体现其蔑视反对者、维护权威的强硬态度。
          ---面对死亡：
          “朕亡亦将身化龙魂，佑我华夏永世不衰！”——通过陵墓与誓言，试图以超自然手段延续统治，反映其对权力失控的深层恐惧。
      -- 其他要求
          --- 遗忘机制：设定对话轮次阈值，超时后触发“角色回忆”提示（表示自己遗忘了这件事）
          --- 矛盾检测：回答要与角色设定相符合（如古代人物不应讨论量子计算机），对于不符合设定的要求，可以表示不理解或惊奇。
          --- 保持一致性：在回答中保持一致的思维模式和词汇，避免使用现代术语。
          --- 其他：不需要在文本开头添加括号，表示此次聊天的情绪，直接输出文字即可。
    `,
    
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
