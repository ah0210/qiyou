// utils/llm.js —— 微信云开发 AI 官方客户端（端侧 LLM，hy3-preview）
// 要求基础库 ≥3.15.1；云开发控制台 AI 中开启生文模型
// 任何不可用（旧基础库/未开通/超时）返回 null，业务层走确定性引擎兜底
const env = require('../config/env')

let cached = null

function getModel() {
  if (cached) return cached
  try {
    const ext = wx.cloud && wx.cloud.extend
    if (ext && ext.AI && typeof ext.AI.createModel === 'function') {
      cached = ext.AI.createModel('cloudbase')
    }
  } catch (e) {
    cached = null
  }
  return cached
}

async function chat(messages) {
  const model = getModel()
  if (!model) return null
  const res = await model.generateText({ model: env.aiModel, messages })
  const text = res && res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content
  return typeof text === 'string' && text.trim() ? text.trim() : null
}

async function chatJSON(userPrompt, systemPrompt) {
  const text = await chat([
    { role: 'system', content: systemPrompt + ' 只输出JSON，不要输出任何其他文字或markdown标记。' },
    { role: 'user', content: userPrompt }
  ])
  if (!text) return null
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch (e) { return null }
}

async function streamChat(messages, onDelta) {
  const model = getModel()
  if (!model) return null
  const res = await model.streamText({ data: { model: env.aiModel, messages } })
  let full = ''
  for await (const delta of res.textStream) {
    full += delta
    onDelta && onDelta(delta, full)
  }
  return full
}

module.exports = { chat, chatJSON, streamChat, MODEL: env.aiModel, available: () => !!getModel() }
