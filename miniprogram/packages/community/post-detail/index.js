// packages/community/post-detail/index.js —— 问答详情
const { call } = require('../../../utils/cloud')
const { applyTheme } = require('../../../utils/theme')

Page({
  data: { post: null, reply: '' },
  onLoad(options) { applyTheme(this); this.id = options.id },
  onShow() {
    applyTheme(this)
    call('community', { action: 'detail', id: this.id }, { showError: false })
      .then((d) => this.setData({ post: d }))
  },
  onInput(e) { this.setData({ reply: e.detail.value }) },
  onReply() {
    const reply = this.data.reply.trim()
    if (!reply) return
    call('community', { action: 'reply', id: this.id, content: reply }, { loading: '回复中...' })
      .then(() => {
        this.setData({ reply: '' })
        this.onShow()
      })
  }
})
