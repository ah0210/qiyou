// packages/ai/contract/index.js —— 合同体检
const { call } = require('../../../utils/cloud')
const { applyTheme } = require('../../../utils/theme')

const DEMO = `房屋租赁合同
1. 押金：乙方需支付 3 个月租金作为押金，合同期满押金不予退还。
2. 违约金：乙方提前退租，需支付年租金 100% 的违约金。
3. 维修：房屋及设施维修费用全部由乙方（租客）承担。
4. 免责：甲方对乙方在房屋内发生的人身伤害概不负责。
5. 租金：甲方有权随时提高租金，乙方须无条件接受。
6. 续约：合同期满自动续约三年，无需另行签订。
7. 管辖：双方争议由甲方所在地法院管辖。`

Page({
  data: { text: '', risks: [], summary: null, loading: false },
  onLoad() { applyTheme(this) },
  onShow() { applyTheme(this) },
  onInput(e) { this.setData({ text: e.detail.value }) },
  loadDemo() { this.setData({ text: DEMO }) },
  onScan() {
    const text = this.data.text.trim()
    if (text.length < 10) { wx.showToast({ title: '请粘贴合同文本（至少10字）', icon: 'none' }); return }
    this.setData({ loading: true })
    call('aiContract', { action: 'scan', text }, { loading: '扫描中...' })
      .then((d) => this.setData({ risks: d.risks, summary: d.summary, loading: false }))
      .catch(() => this.setData({ loading: false }))
  }
})
