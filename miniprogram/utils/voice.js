// utils/voice.js —— 同声传译插件封装（安全降级）
const env = require('../config/env')

let plugin = null
let tipShown = false

function getPlugin() {
  if (plugin) return plugin
  try {
    plugin = requirePlugin('WechatSI')
  } catch (e) {
    plugin = null
  }
  return plugin
}

function available() { return !!getPlugin() }

// 录音识别 → 文本（未授权返回 null，业务层降级文字输入）
function record() {
  const si = getPlugin()
  if (!si || !si.getRecordRecognitionManager) return Promise.resolve(null)
  return new Promise((resolve) => {
    const mgr = si.getRecordRecognitionManager()
    mgr.onRecognize = () => {}
    mgr.onStop = (res) => resolve((res && res.result) || '')
    mgr.onError = () => resolve(null)
    mgr.start({ lang: 'zh_CN', duration: 60000 })
  })
}

function stopRecord() {
  const si = getPlugin()
  if (!si || !si.getRecordRecognitionManager) return
  si.getRecordRecognitionManager().stop()
}

// TTS 朗读（长文分句排队，单句超长截断）
function speak(text, onEnd) {
  const si = getPlugin()
  if (!si || !si.textToSpeech) {
    notReady()
    return Promise.resolve(false)
  }
  const sentences = splitSentences(String(text || ''))
  return new Promise((resolve) => {
    let i = 0
    const next = () => {
      if (i >= sentences.length) { onEnd && onEnd(); return resolve(true) }
      const s = sentences[i++].slice(0, 100)
      si.textToSpeech({ lang: 'zh_CN', tts: true, content: s, success: next, fail: next })
    }
    next()
  })
}

function splitSentences(text) {
  const parts = text.split(/(?<=[。！？!?；;])/)
  const out = []
  let buf = ''
  parts.forEach((p) => {
    buf += p
    if (buf.length >= 90 || /[。！？!?；;]$/.test(buf)) { out.push(buf.trim()); buf = '' }
  })
  if (buf.trim()) out.push(buf.trim())
  return out.filter(Boolean)
}

function notReady() {
  if (!tipShown) {
    tipShown = true
    wx.showToast({ title: '语音功能未授权，已降级为文字', icon: 'none' })
  }
}

module.exports = { available, record, stopRecord, speak, splitSentences }
