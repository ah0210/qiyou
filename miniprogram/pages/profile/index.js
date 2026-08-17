// pages/profile/index.js —— 我的
const { store, ROLES } = require('../../utils/store')
const { applyTheme } = require('../../utils/theme')

Page({
  data: { role: 'traveler', roleLabel: '', theme: 'normal', voiceAuto: false },
  onLoad() { applyTheme(this) },
  onShow() {
    applyTheme(this)
    this.sync()
    if (this.getTabBar) this.getTabBar().setData({ selected: 3 })
  },
  sync() {
    const role = store.get('role')
    this.setData({
      role,
      roleLabel: (ROLES[role] || ROLES.traveler).label,
      theme: store.get('theme'),
      voiceAuto: store.get('voice').autoRead
    })
  },
  onRole(e) { store.setRole(e.detail.role); this.sync() },
  onToggleTheme() {
    const theme = this.data.theme === 'elder' ? 'normal' : 'elder'
    store.setTheme(theme)
    this.sync()
  },
  onToggleVoice() {
    store.setVoice({ autoRead: !this.data.voiceAuto })
    this.sync()
  },
  go(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }) }
})
