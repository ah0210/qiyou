// packages/ai/match/index.js —— AI 旅居匹配问卷
const { call } = require('../../../utils/cloud')
const { store, ROLES } = require('../../../utils/store')
const { applyTheme } = require('../../../utils/theme')

const NEED_OPTIONS = ['暖和', '海景', '低物价', '医疗强', '网络好', '康养', '美食', '游民聚集', '过冬']

Page({
  data: {
    roles: Object.values(ROLES),
    role: 'traveler',
    budget: '',
    months: 3,
    needs: [],
    needOptions: NEED_OPTIONS,
    submitting: false
  },
  onLoad() { applyTheme(this) },
  onShow() {
    applyTheme(this)
    this.setData({ role: store.get('role') })
  },
  onRole(e) { this.setData({ role: e.currentTarget.dataset.role }) },
  onBudget(e) { this.setData({ budget: e.detail.value }) },
  onMonths(e) { this.setData({ months: Number(e.detail.value) || 3 }) },
  onNeed(e) {
    const n = e.currentTarget.dataset.n
    let needs = this.data.needs.slice()
    if (needs.includes(n)) needs = needs.filter((x) => x !== n)
    else needs.push(n)
    this.setData({ needs })
  },
  onSubmit() {
    const { role, budget, months, needs } = this.data
    if (!budget) { wx.showToast({ title: '请填写预算', icon: 'none' }); return }
    this.setData({ submitting: true })
    call('aiMatch', { action: 'create', role, budget: Number(budget), months, needs }, { loading: 'AI 匹配中...' })
      .then((plan) => {
        store.patch({ lastPlan: plan })
        this.setData({ submitting: false })
        wx.redirectTo({ url: '/packages/ai/result/index' })
      })
      .catch(() => this.setData({ submitting: false }))
  }
})
