// packages/senior/emergency/index.js —— 一键呼叫
const { call } = require('../../../utils/cloud')
const { store } = require('../../../utils/store')
const { applyTheme } = require('../../../utils/theme')

Page({
  data: { contacts: [], calling: false },
  onLoad() { applyTheme(this) },
  onShow() {
    applyTheme(this)
    const contacts = store.get('emergency') || []
    this.setData({ contacts })
  },
  onCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (!phone) { wx.showToast({ title: '未设置紧急联系人', icon: 'none' }); return }
    wx.makePhoneCall({ phoneNumber: phone })
    this.sendSos(phone)
  },
  sendSos(phone) {
    call('family', { action: 'sos', phone }, { showError: false }).catch(() => {})
  },
  onAdd() {
    wx.showModal({
      title: '添加紧急联系人',
      editable: true,
      placeholderText: '请输入手机号',
      success: (res) => {
        if (res.confirm && res.content) {
          const contacts = store.get('emergency') || []
          contacts.push({ name: '紧急联系人', phone: res.content })
          store.patch({ emergency: contacts })
          this.setData({ contacts })
        }
      }
    })
  }
})
