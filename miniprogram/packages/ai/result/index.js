// packages/ai/result/index.js —— 匹配结果
const { store } = require('../../../utils/store')
const { applyTheme } = require('../../../utils/theme')
const { call } = require('../../../utils/cloud')
const voice = require('../../../utils/voice')

Page({
  data: { plan: null },
  onLoad() { applyTheme(this) },
  onShow() {
    applyTheme(this)
    const plan = store.get('lastPlan')
    if (plan) this.setData({ plan })
  },
  onSpeak() {
    const p = this.data.plan
    if (p && p.summary) voice.speak(p.summary)
  },
  onBudget() {
    const p = this.data.plan
    if (p && p.top) {
      store.patch({ budgetCity: p.top })
      wx.navigateTo({ url: '/packages/city/budget/index' })
    }
  },
  onListing(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/packages/house/detail/index?houseId=' + id })
  }
})
