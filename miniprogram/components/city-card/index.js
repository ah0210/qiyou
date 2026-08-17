// components/city-card —— 城市推荐卡（对标旧版栖游，纯 CSS 占位封面）
Component({
  properties: {
    city: { type: Object, value: {} },
    score: { type: Number, value: 0 },
    typeName: { type: String, value: '旅居' }
  },
  data: { topDims: [] },
  observers: {
    city(c) {
      if (!c || !c.scoreDetail) { this.setData({ topDims: [] }); return }
      const order = ['cost', 'medical', 'climate', 'network', 'senior', 'life']
      const labelMap = {
        cost: '物价', medical: '医疗', climate: '气候',
        network: '网络', senior: '养老', life: '生活'
      }
      const top = order
        .map((k) => ({ key: k, label: labelMap[k], score: c.scoreDetail[k] || 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
      this.setData({ topDims: top })
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.city._id || this.data.city.id })
    }
  }
})
