// packages/house/detail/index.js —— 房源详情
const { call } = require('../../../utils/cloud')
const { applyTheme } = require('../../../utils/theme')

Page({
  data: { house: null },
  onLoad(options) { applyTheme(this); this.houseId = options.houseId },
  onShow() {
    applyTheme(this)
    const params = { action: 'detail' }
    if (this.houseId) params.houseId = this.houseId
    call('house', params, { showError: false })
      .then((d) => this.setData({ house: d }))
  },
  onContract() {
    wx.navigateTo({ url: '/packages/ai/contract/index' })
  }
})
