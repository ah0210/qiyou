// packages/senior/family/index.js —— 家属绑定
const { call } = require('../../../utils/cloud')
const { applyTheme } = require('../../../utils/theme')

Page({
  data: { inviteCode: '', bindCode: '', list: [], inviting: false },
  onLoad() { applyTheme(this) },
  onShow() { applyTheme(this); this.load() },
  load() {
    call('family', { action: 'list' }, { showError: false })
      .then((d) => this.setData({ list: d.list || [] }))
  },
  onInvite() {
    this.setData({ inviting: true })
    call('family', { action: 'invite' }, { loading: '生成邀请码...' })
      .then((d) => this.setData({ inviteCode: d.code6, inviting: false }))
      .catch(() => this.setData({ inviting: false }))
  },
  onBindInput(e) { this.setData({ bindCode: e.detail.value }) },
  onBind() {
    const code = this.data.bindCode.trim()
    if (code.length !== 6) { wx.showToast({ title: '请输入 6 位邀请码', icon: 'none' }); return }
    call('family', { action: 'bind', code }, { loading: '绑定中...' })
      .then(() => {
        this.setData({ bindCode: '' })
        this.load()
        wx.showToast({ title: '绑定成功', icon: 'success' })
      })
  }
})
