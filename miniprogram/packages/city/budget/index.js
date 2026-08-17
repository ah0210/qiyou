// packages/city/budget/index.js —— 预算测算
const { call } = require('../../../utils/cloud')
const { store } = require('../../../utils/store')
const { applyTheme } = require('../../../utils/theme')

Page({
  data: { cities: [], selIndex: 0, months: 3, result: null },
  onLoad(options) {
    applyTheme(this)
    this.initialCityId = options.cityId
  },
  onShow() {
    applyTheme(this)
    const bc = store.get('budgetCity')
    call('city', { action: 'list' }, { showError: false })
      .then((d) => {
        let idx = 0
        const target = bc ? bc.cityId : this.initialCityId
        if (target) {
          const i = d.list.findIndex((c) => c._id === target)
          if (i >= 0) idx = i
        }
        this.setData({ cities: d.list, selIndex: idx })
        this.calc()
      })
  },
  onCity(e) { this.setData({ selIndex: Number(e.detail.value) || 0 }, () => this.calc()) },
  onMonths(e) { this.setData({ months: Number(e.detail.value) || 3 }, () => this.calc()) },
  calc() {
    const city = this.data.cities[this.data.selIndex]
    if (!city) return
    const role = store.get('role')
    const { calcBudget } = require('../../../utils/budget')
    this.setData({ result: calcBudget(city, role, this.data.months) })
  }
})
