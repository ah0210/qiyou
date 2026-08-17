// pages/index/index.js —— 首页（角色化模块入口）
const { store, pageBind, ROLES } = require('../../utils/store')
const { applyTheme } = require('../../utils/theme')
const { CITIES } = require('../../mock/data')
const score = require('../../utils/match')

const HOME_MODULES = {
  nomad: [
    { icon: '🧭', title: 'AI 旅居匹配', desc: '预算 + 需求 → 推荐城市', url: '/packages/ai/match/index' },
    { icon: '🏠', title: '找游民公寓', desc: '千兆网络 · 共享办公', url: '/pages/house/list', tab: true },
    { icon: '👥', title: '找同城搭子', desc: '兴趣 · 时间 · 同城', url: '/packages/community/companion/index' },
    { icon: '📊', title: '城市成本', desc: '六维评分 · 生活成本', url: '/pages/city/index', tab: true },
    { icon: '📄', title: '合同体检', desc: '12 类风险筛查', url: '/packages/ai/contract/index' },
    { icon: '🎙', title: '语音问答', desc: '说一句话就懂', url: '/pages/ai/chat' }
  ],
  traveler: [
    { icon: '🧭', title: 'AI 旅居匹配', desc: '预算 + 需求 → 推荐城市', url: '/packages/ai/match/index' },
    { icon: '🏠', title: '找短租房', desc: '长短租 · 拎包入住', url: '/pages/house/list', tab: true },
    { icon: '📊', title: '城市成本', desc: '六维评分 · 生活成本', url: '/pages/city/index', tab: true },
    { icon: '📄', title: '合同体检', desc: '12 类风险筛查', url: '/packages/ai/contract/index' },
    { icon: '👥', title: '找同城搭子', desc: '兴趣 · 时间 · 同城', url: '/packages/community/companion/index' },
    { icon: '🎙', title: '语音问答', desc: '说一句话就懂', url: '/pages/ai/chat' }
  ],
  senior: [
    { icon: '🧭', title: '康养安居匹配', desc: '医养 · 适老 · 预算', url: '/packages/ai/match/index' },
    { icon: '🛠', title: '养老工具箱', desc: '康养房源 · 一键呼叫', url: '/packages/senior/toolbox/index' },
    { icon: '👨‍👩‍👧', title: '家属绑定', desc: '邀请码双向确认', url: '/packages/senior/family/index' },
    { icon: '📄', title: '合同体检', desc: '康养合同筛查', url: '/packages/ai/contract/index' },
    { icon: '🎙', title: '语音问答', desc: '说一句话就懂', url: '/pages/ai/chat' },
    { icon: '🆘', title: '一键呼叫', desc: '紧急情况快速联系', url: '/packages/senior/emergency/index' }
  ]
}

Page({
  data: { modules: [], roleLabel: '', greeting: '', recCities: [], tipQuestion: '' },
  onLoad() {
    applyTheme(this)
    this.setRoleModules()
  },
  onShow() {
    applyTheme(this)
    this.setRoleModules()
    if (this.getTabBar) this.getTabBar().setData({ selected: 0 })
  },
  setRoleModules() {
    const role = store.get('role') || 'traveler'
    const roleLabel = (ROLES[role] || ROLES.traveler).label
    // 推荐城市：按当前身份评分 Top3
    const rec = CITIES
      .map((c) => ({ c, s: score.scoreByPersona(c.scoreDetail, role) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => Object.assign({}, x.c, { score: x.s }))
    const tips = {
      nomad: '大理 3000 元旅居一个月够吗？',
      traveler: '带爸妈去三亚过冬要准备多少预算？',
      senior: '异地看病怎么直接刷医保？'
    }
    this.setData({
      modules: HOME_MODULES[role] || HOME_MODULES.traveler,
      roleLabel,
      greeting: this.greet(),
      recCities: rec,
      tipQuestion: tips[role] || tips.traveler
    })
  },
  greet() {
    const h = new Date().getHours()
    return h < 11 ? '上午好' : h < 18 ? '下午好' : '晚上好'
  },
  onTapModule(e) {
    const { url, tab } = e.currentTarget.dataset
    if (tab) wx.switchTab({ url })
    else wx.navigateTo({ url })
  },
  onCityTap(e) {
    const id = e.detail.id
    wx.navigateTo({ url: '/pages/city/index?id=' + id })
  },
  askTip() {
    wx.navigateTo({ url: '/pages/ai/chat?q=' + encodeURIComponent(this.data.tipQuestion) })
  }
})
