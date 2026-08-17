// components/score-bars —— 多维评分可视化条（对标旧版栖游）
Component({
  properties: {
    scoreDetail: { type: Object, value: {} },  // {cost,medical,climate,network,senior,life}
    compact: { type: Boolean, value: false }
  },
  data: { dims: [] },
  observers: {
    scoreDetail(sd) {
      if (!sd) { this.setData({ dims: [] }); return }
      const order = [
        { key: 'cost', label: '物价' }, { key: 'medical', label: '医疗' },
        { key: 'climate', label: '气候' }, { key: 'network', label: '网络' },
        { key: 'senior', label: '养老' }, { key: 'life', label: '生活' }
      ]
      const dims = order.map((o) => ({ label: o.label, score: sd[o.key] || 0 }))
      this.setData({ dims })
    }
  }
})
