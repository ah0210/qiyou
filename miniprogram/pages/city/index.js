// pages/city/index.js —— 城市列表
const { call } = require('../../utils/cloud')
const { applyTheme } = require('../../utils/theme')

Page({
  data: { cities: [], loading: true },
  onLoad() { applyTheme(this) },
  onShow() {
    applyTheme(this)
    this.load()
  },
  load() {
    call('city', { action: 'list' }, { showError: false })
      .then((d) => this.setData({ cities: d.list, loading: false }))
      .catch(() => this.setData({ loading: false }))
  },
  onTapCity(e) {
    wx.navigateTo({ url: '/packages/city/detail/index?cityId=' + e.currentTarget.dataset.id })
  },
  onBudget() {
    wx.navigateTo({ url: '/packages/city/budget/index' })
  }
})
