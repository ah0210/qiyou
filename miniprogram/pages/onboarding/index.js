// pages/onboarding/index.js —— 首次进入身份选择
const { store, ROLES } = require('../../utils/store')

Page({
  data: { roles: Object.values(ROLES) },
  onSelect(e) {
    const role = e.currentTarget.dataset.role
    store.setRole(role)
    wx.switchTab({ url: '/pages/index/index' })
  }
})
