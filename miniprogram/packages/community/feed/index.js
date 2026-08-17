// packages/community/feed/index.js —— 同城问答
const { call } = require('../../../utils/cloud')
const { store } = require('../../../utils/store')
const { applyTheme } = require('../../../utils/theme')

Page({
  data: { posts: [], content: '' },
  onLoad() { applyTheme(this) },
  onShow() { applyTheme(this); this.load() },
  load() {
    call('community', { action: 'feed' }, { showError: false })
      .then((d) => this.setData({ posts: d.list }))
  },
  onInput(e) { this.setData({ content: e.detail.value }) },
  onPublish() {
    const content = this.data.content.trim()
    if (!content) { wx.showToast({ title: '请输入内容', icon: 'none' }); return }
    call('community', { action: 'ask', content }, { loading: '发布中...' })
      .then(() => {
        this.setData({ content: '' })
        this.load()
      })
  },
  onDetail(e) {
    wx.navigateTo({ url: '/packages/community/post-detail/index?id=' + e.currentTarget.dataset.id })
  }
})
