// packages/ai/match/index.js —— AI 旅居匹配（分步问卷）
const { call } = require('../../../utils/cloud')
const { store, ROLES } = require('../../../utils/store')
const { applyTheme } = require('../../../utils/theme')

const CLIMATE_OPTIONS = [
  { key: 'warm', label: '暖和过冬' },
  { key: 'cool', label: '凉爽宜居' },
  { key: 'coast', label: '海边湿润' },
  { key: 'dry', label: '干燥少雨' }
]
const NEED_OPTIONS = [
  { key: 'warm', label: '暖和' },
  { key: 'sea', label: '海景' },
  { key: 'cheap', label: '低物价' },
  { key: 'medical', label: '医疗强' },
  { key: 'network', label: '网络好' },
  { key: 'wellness', label: '康养' },
  { key: 'food', label: '美食' },
  { key: 'nomad', label: '游民聚集' },
  { key: 'winter', label: '过冬' }
]
const DURATION_OPTIONS = [1, 3, 6, 12]

Page({
  data: {
    roles: Object.values(ROLES),
    role: 'traveler',
    step: 1,
    totalSteps: 4,
    budget: 3000,
    months: 3,
    durationOptions: DURATION_OPTIONS,
    climate: '',
    climateOptions: CLIMATE_OPTIONS,
    climateText: '',
    needs: [],
    needOptions: NEED_OPTIONS,
    submitting: false,
    confirmText: ''
  },
  onLoad() {
    applyTheme(this)
    this.setData({ role: store.get('role') })
  },
  onShow() {
    applyTheme(this)
    this.setData({ role: store.get('role') })
  },
  onRole(e) { this.setData({ role: e.currentTarget.dataset.role }) },

  onBudget(e) {
    this.setData({ budget: Number(e.detail.value) })
    this.syncConfirm()
  },
  onDuration(e) {
    this.setData({ months: Number(e.currentTarget.dataset.v) })
    this.syncConfirm()
  },
  onClimate(e) {
    const k = e.currentTarget.dataset.k
    const opt = CLIMATE_OPTIONS.find((x) => x.key === k)
    this.setData({ climate: k, climateText: opt ? opt.label : '' })
    this.syncConfirm()
  },
  onNeed(e) {
    const k = e.currentTarget.dataset.k
    let needs = this.data.needs.slice()
    if (needs.includes(k)) needs = needs.filter((x) => x !== k)
    else needs.push(k)
    this.setData({ needs })
    this.syncConfirm()
  },
  syncConfirm() {
    const roleName = (ROLES[this.data.role] || ROLES.traveler).label
    const climate = this.data.climateText || '不限'
    const needLabels = this.data.needs.map((k) => {
      const o = NEED_OPTIONS.find((x) => x.key === k)
      return o ? o.label : k
    })
    const needsText = needLabels.length ? needLabels.join('、') : '无特别偏好'
    this.setData({
      confirmText: `身份：${roleName}\n预算：￥${this.data.budget}/月 · 住 ${this.data.months} 个月\n气候：${climate}\n需求：${needsText}`
    })
  },
  next() {
    if (this.data.step < this.data.totalSteps) this.setData({ step: this.data.step + 1 })
  },
  prev() {
    if (this.data.step > 1) this.setData({ step: this.data.step - 1 })
  },
  onSubmit() {
    const { role, budget, months, climate, needs } = this.data
    this.setData({ submitting: true })
    call('aiMatch', { action: 'create', role, budget: Number(budget), months, climate, needs }, { loading: 'AI 匹配中...' })
      .then((plan) => {
        store.patch({ lastPlan: plan })
        this.setData({ submitting: false })
        wx.redirectTo({ url: '/packages/ai/result/index' })
      })
      .catch(() => this.setData({ submitting: false }))
  }
})
