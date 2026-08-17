// packages/house/compare/index.js —— 房源对比
const { call } = require('../../../utils/cloud')

const DIMS = [
  { key: 'wifi', label: '千兆网络' },
  { key: 'cowork', label: '共享办公' },
  { key: 'kitchen', label: '厨房' },
  { key: 'medicalStation', label: '医护站' },
  { key: 'meal', label: '供餐' }
]

Page({
  data: { houses: [], sel: [], dims: DIMS, compareList: [] },
  onLoad() {
    call('house', { action: 'list' }, { showError: false })
      .then((d) => this.setData({ houses: d.list }))
  },
  onPick(e) {
    const id = e.currentTarget.dataset.id
    let sel = this.data.sel.slice()
    if (sel.includes(id)) sel = sel.filter((x) => x !== id)
    else if (sel.length < 3) sel.push(id)
    this.setData({ sel })
  },
  onCompare() {
    const sel = this.data.sel
    if (sel.length < 2) { wx.showToast({ title: '至少选择 2 个房源', icon: 'none' }); return }
    const compareList = this.data.houses.filter((h) => sel.includes(h._id))
    this.setData({ compareList })
  },
  hasFacility(h, key) {
    return !!(h.facilities && h.facilities[key])
  }
})
