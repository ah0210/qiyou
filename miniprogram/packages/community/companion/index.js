// packages/community/companion/index.js —— 兴趣结伴
const { call } = require('../../../utils/cloud')
const { store } = require('../../../utils/store')
const { applyTheme } = require('../../../utils/theme')

Page({
  data: { matches: [], mine: {} },
  onLoad() { applyTheme(this) },
  onShow() {
    applyTheme(this)
    const role = store.get('role')
    const mine = { openid: 'me', role, cityName: '大理', startDate: '2026-10-01', endDate: '2026-12-31', interests: ['远程办公', '徒步'] }
    this.setData({ mine })
    call('companion', { action: 'match', mine }, { showError: false })
      .then((d) => this.setData({ matches: d.list }))
  },
  onContact() {
    wx.showToast({ title: '请通过微信联系对方', icon: 'none' })
  }
})
