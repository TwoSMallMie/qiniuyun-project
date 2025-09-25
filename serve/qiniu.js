// 七牛云模型推理API地址
export const QINIU_MODEL_API_URL = 'https://api.qnaigc.com/v1';
export const QINIU_ACCESS_TOKEN = 'sk-6e04767d16a9342629f42ef580a485520a46b2b37b84bcf08d4c8066641ec578';


// 录音转文本并调用 OpenAI LLM
// 依赖：node-record-lpcm16、node-fetch、openai、pako、ws、uuid
// 其中 node-record-lpcm16 依赖 sox，需要提前安装，可以参考该文档：https://github.com/gillesdemey/node-record-lpcm16

import pako from "pako";
import WebSocket from 'ws';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import record from 'node-record-lpcm16';

// 配置
const OPENAI_MODEL = 'deepseek-v3' // 可根据需要更换
const OPENAI_KEY = QINIU_ACCESS_TOKEN
const OPENAI_BASE_URL = 'https://openai.qiniu.com/v1'
const openai = new OpenAI({ baseURL: OPENAI_BASE_URL, apiKey: OPENAI_KEY })

class LiveASR2LLM {
  constructor({
    wsUrl = 'wss://openai.qiniu.com/v1/voice/asr',
    token = OPENAI_KEY,
    sampleRate = 16000,
    channels = 1,
    bits = 16,
    segDuration = 300,
    silenceTimeout = 1500,
    openaiModel = OPENAI_MODEL
  } = {}) {
    this.wsUrl = wsUrl
    this.token = token
    this.sampleRate = sampleRate
    this.channels = channels
    this.bits = bits
    this.segDuration = segDuration
    this.silenceTimeout = silenceTimeout
    this.openaiModel = openaiModel
    this.seq = 1
    this.ws = null
    this.llmOffset = 0
    this.llmTimer = null
    this.lastAsrText = ''
  }

  /**
   * 生成协议头
   */
  generateHeader(messageType = 1, flags = 1, serial = 1, compress = 1) {
    const header = Buffer.alloc(4)
    header[0] = (1 << 4) | 1
    header[1] = (messageType << 4) | flags
    header[2] = (serial << 4) | compress
    header[3] = 0
    return header
  }
  /**
   * 生成协议头后的序列号部分
   */
  generateBeforePayload(sequence) {
    const buf = Buffer.alloc(4)
    buf.writeInt32BE(sequence)
    return buf
  }
  /**
   * 发送 ASR 配置包
   */
  sendConfig() {
    const req = {
      user: { uid: uuidv4() },
      audio: {
        format: 'pcm', sample_rate: this.sampleRate, bits: this.bits, channel: this.channels, codec: 'raw'
      },
      request: { model_name: 'asr', enable_punc: true }
    }
    let payload = Buffer.from(JSON.stringify(req), 'utf8')
    payload = pako.gzip(payload)
    const msg = Buffer.concat([
      this.generateHeader(1, 1, 1, 1),
      this.generateBeforePayload(this.seq),
      Buffer.alloc(4, 0),
      payload
    ])
    msg.writeInt32BE(payload.length, 8)
    this.ws.send(msg)
  }
  /**
   * 发送音频分片数据
   */
  sendAudioChunk(chunk) {
    this.seq++
    const compressed = pako.gzip(chunk)
    const msg = Buffer.concat([
      this.generateHeader(2, 1, 1, 1),
      this.generateBeforePayload(this.seq),
      Buffer.alloc(4, 0),
      compressed
    ])
    msg.writeInt32BE(compressed.length, 8)
    this.ws.send(msg)
  }
  /**
   * 解析服务端返回的文本内容，兼容多种协议格式
   * @param {Buffer} data - WebSocket 接收到的原始数据
   * @returns {string} 识别出的文本
   */
  parseTextFromResponse(data) {
    try {
      if (!Buffer.isBuffer(data)) return ''
      const headerSize = data[0] & 0x0f
      const messageType = data[1] >> 4
      const messageTypeSpecificFlags = data[1] & 0x0f
      const serializationMethod = data[2] >> 4
      const messageCompression = data[2] & 0x0f
      let payload = data.slice(headerSize * 4)
      if (messageTypeSpecificFlags & 0x01) {
        payload = payload.slice(4)
      }
      if (messageType === 0b1001 && payload.length >= 4) {
        const payloadSize = payload.readInt32BE(0)
        payload = payload.slice(4, 4 + payloadSize)
      }
      if (messageCompression === 0b0001) {
        payload = pako.ungzip(payload)
      }
      let obj
      if (serializationMethod === 0b0001) {
        obj = JSON.parse(payload.toString('utf8'))
      } else {
        obj = payload.toString('utf8')
      }
      if (obj && obj.result && obj.result.text) return obj.result.text
      if (obj && obj.payload_msg && obj.payload_msg.result && obj.payload_msg.result.text) return obj.payload_msg.result.text
      if (typeof obj === 'string') return obj
      return ''
    } catch (e) {
      console.error('[ASR] parseTextFromResponse 解析失败:', e)
      return ''
    }
  }
  /**
   * 调用 LLM 进行推理，仅发送本次新增文本
   * @param {string} text - 新识别出的文本
   */
  tryCallLLM(text) {
    if (!text) return
    console.log('[LLM] 发送:', text)
    openai.chat.completions.create({
      model: this.openaiModel,
      messages: [
        { role: 'system', content: '你是一个语音助手。' },
        { role: 'user', content: text }
      ]
    })
      .then(chatCompletion => {
        const reply = chatCompletion.choices[0].message.content
        console.log('[LLM] 回复:', reply)
      })
      .catch(err => console.error('[LLM] 推理失败:', err))
  }
  /**
   * 启动 WebSocket 连接并监听麦克风，自动识别与推理
   */
  start() {
    this.ws = new WebSocket(this.wsUrl, {
      headers: { Authorization: `Bearer ${this.token}` }
    })
    let rec = null
    let stream = null
    let isLLMReplying = false
    this.ws.on('open', () => {
      try {
        this.sendConfig()
        console.log('[ASR] WebSocket 连接已建立，开始录音...')
        rec = record.record({ sampleRate: this.sampleRate, channels: this.channels, threshold: 0, verbose: false, recordProgram: 'sox', silence: '1.0' })
        stream = rec.stream()
        stream.on('data', chunk => {
          if (!isLLMReplying) {
            try {
              this.sendAudioChunk(chunk)
            } catch (err) {
              console.error('[ASR] 音频分片发送失败:', err)
            }
          }
        })
        stream.on('error', err => {
          console.error('[ASR] 录音流错误:', err)
        })
      } catch (err) {
        console.error('[ASR] WebSocket open 阶段异常:', err)
      }
    })
    this.ws.on('message', async (data) => {
      try {
        const text = this.parseTextFromResponse(data)
        if (text === this.lastAsrText) return // 内容没变化
        this.lastAsrText = text
        // 检测 asr 内容与上次处理的位置是否更长
        // 更长说明是有新的识别结果
        if (text.length > this.llmOffset) {
          const newText = text.slice(this.llmOffset).trim()
          if (newText) {
            console.log('[ASR] 识别文本:', newText)
            if (this.llmTimer) clearTimeout(this.llmTimer)
            this.llmTimer = setTimeout(async () => {
              if (rec) {
                rec.stop()
                rec = null
                stream = null
              }
              isLLMReplying = true
              await this.tryCallLLM(newText)
              isLLMReplying = false
              this.llmOffset += newText.length
              rec = record.record({ sampleRate: this.sampleRate, channels: this.channels, threshold: 0, verbose: false, recordProgram: 'sox', silence: '1.0' })
              stream = rec.stream()
              stream.on('data', chunk => {
                if (!isLLMReplying) {
                  try {
                    this.sendAudioChunk(chunk)
                  } catch (err) {
                    console.error('[ASR] 音频分片发送失败:', err)
                  }
                }
              })
              stream.on('error', err => {
                console.error('[ASR] 录音流错误:', err)
              })
            }, this.silenceTimeout)
          }
        }
      } catch (err) {
        console.error('[ASR] 消息处理异常:', err)
      }
    })
    this.ws.on('close', () => {
      console.log('[ASR] WebSocket 已关闭')
    })
    this.ws.on('error', (err) => {
      console.error('[ASR] WebSocket 错误:', err)
    })
  }
}

