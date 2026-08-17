// packages/ai/policy/index.js —— 政策查询
const { call } = require('../../../utils/cloud')
const { applyTheme } = require('../../../utils/theme')

const TYPES = [
  { key: '', label: '全部' },
  { key: 'medical', label: '异地就医' },
  { key: 'residence', label: '居住证' },
  { key: 'socialsecurity', label: '灵活就业社保' },
  { key: 'elder', label: '老人优待' }
]

Page({
  data: { list: [], type: '', keyword: '', types: TYPES },
  onLoad() { applyTheme(this) },
  onShow() { applyTheme(this); this.load() },
  load() {
    call('policy', { action: 'list', keyword: this.data.keyword }, { showError: false })
      .then((d) => {
        let list = d.list
        if (this.data.type) list = list.filter((p) => p.type === this.data.type)
        this.setData({ list })
      })
  },
  onType(e) {
    this.setData({ type: e.currentTarget.dataset.type || '' }, () => this.load())
  },
  onKeyword(e) {
    this.setData({ keyword: e.detail.value }, () => this.load())
  }
})
