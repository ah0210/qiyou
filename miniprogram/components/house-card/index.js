// components/house-card —— 房源卡片（纯 CSS 占位封面，无图片依赖）
Component({
  properties: {
    house: { type: Object, value: {} }
  },
  data: { typeName: '' },
  observers: {
    house(h) {
      const map = { nomad: '游民公寓', short: '短租旅居', wellness: '康养公寓' }
      this.setData({ typeName: (h && map[h.type]) || '' })
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.house._id || this.data.house.id })
    }
  }
})
