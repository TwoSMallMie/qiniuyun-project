const express = require('express');

const qiniuController = require('../controller/qiniuController');

const router = express.Router();

// 获取七牛云可用的模型
router.get('/model', qiniuController.getModel);

// 进行七牛云模型推理api
router.post('/chat', qiniuController.chatModel);

// 七牛云模型推理API - 流式输出
router.post('/chat-stream', qiniuController.chatStreamModel);

// 语音识别
router.post('/asr', qiniuController.asr);

// 获取七牛云音色列表
router.get('/voice', qiniuController.getVoice);

// 文本转语音
router.post('/tts', qiniuController.tts);

module.exports = router;