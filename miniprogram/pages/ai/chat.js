// pages/ai/chat.js —— AI 助手（语音 + 文字问答）
const { call } = require('../../utils/cloud')
const { store } = require('../../utils/store')
const { applyTheme } = require('../../utils/theme')
const voice = require('../../utils/voice')

Page({
  data: { messages: [], input: '', listening: false, pending: '' },
  onLoad() { applyTheme(this) },
  onShow() {
    applyTheme(this)
    const p = store.get('pendingVoiceQuery')
    if (p) {
      store.patch({ pendingVoiceQuery: '' })
      this.ask(p)
    }
  },
  onInput(e) { this.setData({ input: e.detail.value }) },
  onSend() {
    const q = this.data.input.trim()
    if (!q) return
    this.setData({ input: '' })
    this.ask(q)
  },
  onVoiceResult(e) {
    this.ask(e.detail.text)
  },
  ask(q) {
    const messages = this.data.messages.concat([{ role: 'user', text: q }])
    this.setData({ messages })
    call('aiChat', { action: 'chat', question: q }, { showError: false })
      .then((d) => {
        this.setData({ messages: this.data.messages.concat([{ role: 'ai', text: d.answer }]) })
        if (store.get('voice').autoRead) voice.speak(d.answer)
      })
      .catch(() => {})
  },
  onSpeakLast() {
    const last = this.data.messages.filter((m) => m.role === 'ai').pop()
    if (last) voice.speak(last.text)
  }
})
