// pages/house/list.js —— 房源列表
const { call } = require('../../utils/cloud')
const { store } = require('../../utils/store')
const { applyTheme } = require('../../utils/theme')

const TYPE_LABEL = { nomad: '游民公寓', wellness: '康养公寓', short: '短租' }

Page({
  data: { houses: [], type: '', typeLabel: '全部', loading: true },
  onLoad() { applyTheme(this) },
  onShow() {
    applyTheme(this)
    const t = store.get('houseFilter') || ''
    this.setData({ type: t, typeLabel: t ? TYPE_LABEL[t] : '全部' })
    this.load()
    if (this.getTabBar) this.getTabBar().setData({ selected: 2 })
  },
  load() {
    call('house', { action: 'list', type: this.data.type }, { showError: false })
      .then((d) => this.setData({ houses: d.list, loading: false }))
      .catch(() => this.setData({ loading: false }))
  },
  onFilter(e) {
    const t = e.currentTarget.dataset.type || ''
    store.patch({ houseFilter: t })
    this.setData({ type: t, typeLabel: t ? TYPE_LABEL[t] : '全部' })
    this.load()
  },
  onTapHouse(e) {
    wx.navigateTo({ url: '/packages/house/detail/index?houseId=' + e.currentTarget.dataset.id })
  },
  onCompare() {
    wx.navigateTo({ url: '/packages/house/compare/index' })
  }
})
