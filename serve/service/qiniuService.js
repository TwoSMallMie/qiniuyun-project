const axios = require('axios');

// 七牛云模型推理API地址
const QINIU_MODEL_API_URL = 'https://api.qnaigc.com/v1';
const QINIU_ACCESS_TOKEN = 'sk-662551935711197f0bb7d54dbbe73d31cb8a51ab2c97966870f63282ebe1ee99';

// 获取可用模型列表
async function getModel() {
    try {
        const response = await axios.get(QINIU_MODEL_API_URL + '/models', {
            headers: {
                'Authorization': `Bearer ${QINIU_ACCESS_TOKEN}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// 模型推理
// 参数为对象形式: { chatText, stream, search, res }
async function chatModel({ chatText, stream = false, search = false, res = null }) {
    try {
        // 流式请求必须提供res参数
        if (stream && !res) {
            throw new Error('流式请求必须提供res参数');
        }

        // 构造请求体
        const postData = {
            "messages": [{"role": "user", "content": chatText}],
            "model": "deepseek-v3",
        };
        if (stream) postData.stream = true;

        // 构造请求头
        const axiosConfig = {
            headers: {
                'Authorization': `Bearer ${QINIU_ACCESS_TOKEN}`,
                'Content-Type': stream ? 'text/event-stream' : 'application/json',
            }
        };
        if (stream) axiosConfig.responseType = 'stream';

        //拼接请求
        const url = QINIU_MODEL_API_URL + '/chat/completions' + (search ? '?search' : '');

        // 发送请求
        console.log('发送了请求', url);
        const response = await axios.post(
            url,
            postData,
            axiosConfig
        );

        // 若是流式请求，直接将数据流写入响应
        if (stream && res) {
            response.data.on('data', chunk => res.write(chunk));
            response.data.on('end', () => res.end());
            return;
        }
        // 非流式请求，返回完整响应数据
        return response.data;
    } catch (error) {
        res.status(500).json({ error: '七牛云模型推理失败', detail: error.message });
    }
}

module.exports = {
    getModel,
    chatModel
};
