// packages/city/detail/index.js —— 城市详情
const { call } = require('../../../utils/cloud')
const { applyTheme } = require('../../../utils/theme')

Page({
  data: { city: null },
  onLoad(options) { applyTheme(this); this.cityId = options.cityId },
  onShow() {
    applyTheme(this)
    call('city', { action: 'detail', cityId: this.cityId }, { showError: false })
      .then((d) => this.setData({ city: d }))
  },
  onBudget() {
    wx.navigateTo({ url: '/packages/city/budget/index?cityId=' + this.cityId })
  },
  onHouse() {
    wx.navigateTo({ url: '/packages/house/detail/index?cityId=' + this.cityId })
  }
})
