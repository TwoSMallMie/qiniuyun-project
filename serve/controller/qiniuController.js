const qiniuService = require('../service/qiniuService');

// 接受请求：获取可用模型
const getModel = async (req, res) => {
    try {
        const result = await qiniuService.getModel();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: '七牛云模型查询失败', detail: err.message });
    }
};

//接受请求：模型推理请求
const chatModel = async (req, res) => {
    try {
        const { messages, search } = req.body;
        const param = { messages, search };

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: '请求参数缺失' });
        }

        const result = await qiniuService.chatModel(param);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: '七牛云模型推理失败', detail: err.message });
    }
};

// 接受请求：流式模型推理
const chatStreamModel = async (req, res) => {
    try {
        const { messages, search } = req.body;
        param = { messages, stream: true, search, res };

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: '请求参数缺失' });
        }

        await qiniuService.chatModel(param);
    } catch (err) {
        res.status(500).json({ error: '七牛云模型推理失败', detail: err.message });
    }
};

// // 接受请求：语音识别
// const chatASR = async(req, res) => {

// }

// 接受请求：获取音色列表
const getVoice = async(req, res) => {
    try {
        const result = await qiniuService.getVoice();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: '获取音色列表失败', detail: err.message });
    }
}

// 接受请求：文本转语音
const tts = async(req, res) => {
    try {
        const { text, voiceType } = req.body;
        if (!text || !voiceType) {
            return res.status(400).json({ error: '请求参数缺失' });
        }
        const result = await qiniuService.tts({ text, voiceType });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: '文本转语音失败', detail: err.message });
    }
}

module.exports = {
    getModel,
    chatModel,
    chatStreamModel,
    getVoice,
    tts,
};
