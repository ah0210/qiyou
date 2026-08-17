// packages/ai/result/index.js —— 匹配结果（对标旧版栖游：TOP 排名 + 六维条 + 理由 + 双按钮）
const { store } = require('../../../utils/store')
const { applyTheme } = require('../../../utils/theme')
const { call } = require('../../../utils/cloud')
const voice = require('../../../utils/voice')

Page({
  data: { plan: null, loading: true, saved: false, disclaimer: 'AI 生成内容仅供参考，医保/法律事项以官方政策为准' },
  onLoad() {
    applyTheme(this)
    const plan = store.get('lastPlan')
    if (!plan) {
      this.setData({ loading: false })
      return
    }
    this.setData({ plan, loading: false })
  },
  onShow() { applyTheme(this) },
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
  goCity(e) {
    wx.navigateTo({ url: '/pages/city/index?id=' + e.currentTarget.dataset.id })
  },
  goHouses(e) {
    store.patch({ pendingHouseFilter: { cityId: e.currentTarget.dataset.id } })
    wx.switchTab({ url: '/pages/house/list' })
  },
  savePlan() {
    store.patch({ savedPlan: this.data.plan })
    this.setData({ saved: true })
    wx.showToast({ title: '方案已存档', icon: 'success' })
  },
  retry() {
    wx.redirectTo({ url: '/packages/ai/match/index' })
  }
})
