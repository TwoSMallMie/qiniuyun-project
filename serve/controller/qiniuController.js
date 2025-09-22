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
        const { chatText, search } = req.body;
        const param = { chatText, search };

        if (!chatText) {
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
        const { chatText, search } = req.body;
        param = { chatText, stream: true, search, res };

        if (!chatText) {
            return res.status(400).json({ error: '请求参数缺失' });
        }

        await qiniuService.chatModel(param);
    } catch (err) {
        res.status(500).json({ error: '七牛云模型推理失败', detail: err.message });
    }
};

module.exports = {
    getModel,
    chatModel,
    chatStreamModel,
};
