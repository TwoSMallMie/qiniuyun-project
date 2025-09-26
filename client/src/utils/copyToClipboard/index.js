/**
 * 兼容性剪贴板复制函数
 * @param {string} text - 要复制的文本
 * @returns {Promise<void>} - 异步操作结果
 */
async function copyToClipboard(text) {
  // 现代浏览器：使用 Clipboard API
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      // console.log('【现代API】复制成功');
      return true;
    }
    catch (err) {
      // console.warn('【现代API】复制失败，降级到传统方法', err);
      return false;
    }
  }

  // 传统浏览器：使用 execCommand
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';  // 防止页面滚动
  textarea.style.opacity = '0';       // 隐藏元素
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      // console.log('【传统方法】复制成功');
      return true;
    }
    else {
      throw new Error('execCommand 返回失败');
    }
  }
  catch (err) {
    console.error('复制失败', err);
    return false;
  }
  finally {
    document.body.removeChild(textarea);
  }
}

export default copyToClipboard;