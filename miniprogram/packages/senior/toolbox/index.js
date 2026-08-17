// packages/senior/toolbox/index.js —— 养老工具箱
const { call } = require('../../../utils/cloud')
const { applyTheme } = require('../../../utils/theme')

Page({
  data: { houses: [] },
  onLoad() { applyTheme(this) },
  onShow() {
    applyTheme(this)
    call('house', { action: 'list', type: 'wellness' }, { showError: false })
      .then((d) => this.setData({ houses: d.list }))
  },
  go(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }) },
  onHouse(e) {
    wx.navigateTo({ url: '/packages/house/detail/index?houseId=' + e.currentTarget.dataset.id })
  }
})
