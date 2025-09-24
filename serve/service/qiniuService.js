const axios = require('axios');

// 七牛云模型推理API地址
const QINIU_MODEL_API_URL = 'https://api.qnaigc.com/v1';
const QINIU_ACCESS_TOKEN = 'sk-6e04767d16a9342629f42ef580a485520a46b2b37b84bcf08d4c8066641ec578';

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
// 参数为对象形式: { messages, stream, search, res }
async function chatModel({ messages, stream = false, search = false, res = null }) {
    try {
        // 流式请求必须提供res参数
        if (stream && !res) {
            throw new Error('流式请求必须提供res参数');
        }

        // 构造请求体
        const postData = {
            "messages": messages,
            "model": "deepseek/deepseek-v3.1-terminus" + (search ? "?search" : ""),
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
        const url = QINIU_MODEL_API_URL + '/chat/completions';

        // 发送请求
        console.log('发送了请求', url);
        console.log('请求参数', postData);
        console.log('是否流式输出', stream, '是否联网', search);
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

// 语音识别
async function chatASR({ file_url }) {
    // 构造请求体
    const postData = {
        "model": "asr",
        "audio": {
            "format": "mp3",
            "url": file_url,
        }
    };

    // 构造请求头
    const axiosConfig = {
        headers: {
            'Authorization': `Bearer ${QINIU_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        }
    };

    //拼接请求
    const url = QINIU_MODEL_API_URL + '/voice/asr';

    // 发送请求
    // console.log('发送了请求', url);
    // console.log('请求参数', postData);
    // console.log('是否流式输出', stream, '是否联网', search);
    const response = await axios.post(
        url,
        postData,
        axiosConfig
    );

    console.log(response);

    return response;
    
}

// 获取音色列表
async function getVoice() {
    try {
        const response = await axios.get(QINIU_MODEL_API_URL + '/voice/list', {
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

// 文本转语音
async function tts({ text='', voiceType='' }) {
    try {
        // 创建请求头
        const axiosConfig = {
            headers: {
                'Authorization': `Bearer ${QINIU_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            }
        };

        // 创建请求体
        const postData = {
            audio: {
                "voice_type": voiceType,
                "encoding": 'mp3',
                "speed_ratio": 1.0,
            },
            request: {
                text: text,
            }
        }

        // console.log(postData, headers);
        

        // 拼接请求
        const url = QINIU_MODEL_API_URL + '/voice/tts';

        // 发送请求
        const response = await axios.post(
            url,
            postData,
            axiosConfig,
        );
        
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = {
    getModel,
    chatModel,
    chatASR,
    getVoice,
    tts,
};
