// mock/functions.js —— 云函数本地降级实现（零配置评审演示模式）
// 与云函数同构，返回结构一致：{ code, msg, data }
const { CITIES, HOUSINGS, POLICIES } = require('./data')
const { matchCities, budgetSheet } = require('../utils/match')
const { scanByRules, mergeResults, summarize } = require('../utils/contract')
const { matchCompanions } = require('../utils/companion')

let _id = 100000
function mockId() { return 'mock_' + (++_id) }
function traceId() { return 'mock-trace-' + Date.now() }

const DISCLAIMER = '（以上内容由规则引擎生成，仅供参考，不构成法律/医疗意见）'

function call(name, data = {}) {
  const action = data.action || ''
  const fn = HANDLERS[name]
  if (!fn) return Promise.resolve({ code: 404, msg: '未知云函数 ' + name, data: null })
  try {
    return Promise.resolve({ code: 0, msg: 'ok', data: fn(action, data) })
  } catch (e) {
    return Promise.resolve({ code: 500, msg: e.message, data: null })
  }
}

const HANDLERS = {
  login(action, d) {
    return { openid: 'mock_openid', user: { role: d.role || 'traveler', theme: d.theme || 'normal' } }
  },

  city(action, d) {
    if (action === 'detail') return CITIES.find((c) => c._id === d.cityId) || null
    return { list: CITIES }
  },

  house(action, d) {
    if (action === 'detail') return HOUSINGS.find((h) => h._id === d.houseId) || null
    let list = HOUSINGS.slice()
    if (d.type) list = list.filter((h) => h.type === d.type)
    if (d.cityId) list = list.filter((h) => h.cityId === d.cityId)
    return { list }
  },

  aiMatch(action, d) {
    const cities = matchCities(CITIES, d)
    const top = cities[0]
    const plan = {
      planId: mockId(),
      cities,
      top,
      budgetSheet: top ? budgetSheet(top, d.role, d.months) : null,
      summary: top ? `推荐${top.name}，匹配度${top.matchScore}分，月成本约 ¥${top.cost.totalMonthly}` : '',
      model: 'mock-rule-v1',
      traceId: traceId(),
      fallbackReason: '未配置云环境，使用本地 mock'
    }
    return plan
  },

  aiChat(action, d) {
    const q = String(d.question || '').trim()
    const a = answer(q)
    return { answer: a.answer, scene: a.scene, model: 'mock-rule-v1', traceId: traceId() }
  },

  aiContract(action, d) {
    const rules = scanByRules(d.text || '')
    const merged = mergeResults([], rules)
    return { risks: merged, summary: summarize(merged), model: 'mock-rule-v1', traceId: traceId() }
  },

  companion(action, d) {
    if (action === 'match') {
      const list = matchCompanions(d.mine, MOCK_USERS)
      return { list }
    }
    return { list: [] }
  },

  family(action, d) {
    if (action === 'invite') return { code6: String(Math.floor(100000 + Math.random() * 900000)) }
    if (action === 'list') return { list: MOCK_FAMILY }
    if (action === 'bind') return { ok: true }
    if (action === 'sos') return { notified: false }
    return { ok: true }
  },

  community(action, d) {
    if (action === 'feed') return { list: MOCK_POSTS }
    if (action === 'detail') return MOCK_POSTS.find((p) => p._id === d.id) || null
    if (action === 'ask' || action === 'reply') return { ok: true }
    return { list: [] }
  },

  policy(action, d) {
    if (d.keyword) return { list: POLICIES.filter((p) => p.title.includes(d.keyword) || p.content.includes(d.keyword)) }
    return { list: POLICIES }
  },

  analytics(action, d) {
    return { ok: true }
  }
}

const MOCK_FAMILY = [
  { openid: 'u_f1', nickName: '家人甲', phone: '13800000000' }
]

const MOCK_POSTS = [
  { _id: 'post1', title: '大理冬天冷吗？适合过冬吗', cityName: '大理', content: '打算 11 月去大理，想问问当地冬天的体感和物价。', replies: ['白天 18 度左右，早晚凉，很舒服', '物价不高，古城单间 1500 左右'] },
  { _id: 'post2', title: '数字游民在昆明怎么找共享办公', cityName: '昆明', content: '远程办公，求推荐性价比高的共享办公点。', replies: ['翠湖周边有几家，工位 300/月起'] },
  { _id: 'post3', title: '北海适合带老人过冬吗', cityName: '北海', content: '想带父母去北海过冬，医疗条件如何？', replies: ['三甲医院有，但重症还是建议南宁/广州'] }
]

const MOCK_USERS = [
  { openid: 'u2', nickName: '阿May', role: 'nomad', cityName: '大理', startDate: '2026-10-01', endDate: '2026-12-31', interests: ['远程办公', '摄影'] },
  { openid: 'u3', nickName: '老周', role: 'senior', cityName: '昆明', startDate: '2026-11-01', endDate: '2027-03-31', interests: ['下棋', '散步'] },
  { openid: 'u4', nickName: '小鹿', role: 'traveler', cityName: '大理', startDate: '2026-10-15', endDate: '2026-11-15', interests: ['徒步', '美食'] }
]

// 场景化规则回答（医保/居住证/社保/预算/养老），政策类内联免责
function answer(q) {
  if (/医保|异地|就医|报销/.test(q)) return { scene: 'medical', answer: '异地就医可先在国家医保服务平台 App 办理备案，之后在就医地定点医院持医保凭证直接结算。' + DISCLAIMER }
  if (/居住证|居住登记|落户/.test(q)) return { scene: 'residence', answer: '居住半年以上且符合稳定就业/住所/连续就读之一的，可申领居住证。' + DISCLAIMER }
  if (/社保|养老.*保险|灵活就业/.test(q)) return { scene: 'social', answer: '灵活就业人员可在就业地或户籍地以个人身份参加职工养老与医疗保险。' + DISCLAIMER }
  if (/预算|花费|成本|多少钱|月开销/.test(q)) return { scene: 'budget', answer: '可前往「城市」页查看各城月成本明细，或用 AI 旅居匹配输入预算获得个性化推荐。' }
  if (/养老|康养|适老|长者/.test(q)) return { scene: 'elder', answer: '可前往「养老工具箱」查看康养房源、家属绑定与一键呼叫，系统已为你开启大字模式。' }
  return { scene: 'general', answer: '这个问题建议在「AI 旅居匹配」中填写预算与需求，我会为你生成个性化方案。' }
}

module.exports = { call }
