
/**
 * 防抖函数
 * @param {*} func 函数
 * @param {*} delay 延迟时间
 * @returns 
 */
function debounce(func, delay) {
  let timer = null;
  
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param {*} func 函数
 * @param {*} delay 延迟时间
 * @returns 
 */
function throttle(func, delay) {
  let timer = null;

  return function (...args) {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      func.apply(this, args);
      timer = null;
    }, delay);
  };
}

export {
  debounce,
  throttle
}
