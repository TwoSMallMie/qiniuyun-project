/**
 * 聊天结果类
 * 用于表示聊天中的一条消息，包含角色、内容和语音识别结果
 */
class chatResult {
  constructor(role, content, audio, copy, thinking, reThinking, translate) {
    this.role = role;
    this.content = content;
    this.modernContent = '';
    this.audio = audio;
    this.copy = copy;
    if (thinking) this.thinking = thinking;
    this.reThinking = reThinking;
    this.translate = translate;
  }
}



/**
 * 用于创建chatResult对象的工厂函数
 * @param {'user' | 'assistant'} role 消息角色，user或assistant
 * @param {string} content 消息内容
 * @param {Object} options 可选参数
 * @param {'none' | 'play' | 'loading' | 'pause' | 'replay'} options.audio 可选，语音识别结果，默认'none'
 * @param {boolean} options.copy 可选，是否可复制，默认false
 * @param {boolean} options.thinking 可选，是否在思考，默认false
 * @param {boolean} options.reThinking 可选，是否重新思考，默认false
 * @param {'none' | 'false' | 'true' | 'loading '} options.translate 可选，翻译结果是否完成，默认none
 * @returns {chatResult} 新创建的chatResult对象
 */
export function createChatResult(
    role, content, 
    { audio = 'none', copy = false, thinking = false, reThinking = false, translate = 'none' } =
    { audio: 'none', copy: false, thinking: false, reThinking: false, translate: 'none' }) 
{
  return new chatResult(role, content, audio, copy, thinking, reThinking, translate);
}


