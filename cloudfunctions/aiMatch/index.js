// cloudfunctions/aiMatch/index.js —— AI 旅居匹配（三段式：硬筛 → 六维评分 → 方案生成）
// LLM 只做语言组织，不产生数字，防幻觉；未开通密钥走 rule-fallback
const cloud = require('wx-server-sdk')
const score = require('./_shared/scoreCore')
const { CITIES } = require('./_shared/seedData')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function loadCities() {
  try {
    const res = await db.collection('cities').get()
    if (res.data && res.data.length >= 3) return res.data
    return CITIES
  } catch (e) { return CITIES }
}

// 大模型叙述（可选增强，仅描述已算好结果）
async function llmNarrate(plan) {
  const AI_FALLBACK_ONLY = process.env.AI_FALLBACK_ONLY === '1'
  if (AI_FALLBACK_ONLY) return null
  try {
    const apiKey = process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY
    if (!apiKey) return null
    // 此处接入腾讯混元 ChatCompletions（非流式），8 秒超时
    const text = await Promise.race([
      callHunyuan(plan),
      new Promise((_, rej) => setTimeout(() => rej(new Error('AI timeout')), 8000))
    ])
    return text
  } catch (e) { return null }
}

async function callHunyuan(plan) {
  // 占位：实际部署时用 tencentcloud-sdk-nodejs 调用混元
  // 返回 null 表示未配置，走 rule-fallback
  return null
}

exports.main = async (event = {}) => {
  const { role, budget, months, needs } = event
  try {
    const cities = await loadCities()
    const top = score.matchCities(cities, { role, budget, months, needs })
    const summary = top.length
      ? `推荐${top[0].name}，匹配度${top[0].matchScore}分，月成本约 ¥${top[0].cost.totalMonthly}`
      : '未找到匹配城市'

    const plan = {
      cities: top,
      top: top[0] || null,
      budgetSheet: top[0] ? score.budgetSheet(top[0], role, months) : null,
      summary,
      model: 'rule-v1',
      traceId: 'tr-' + Date.now()
    }

    const aiText = await llmNarrate(plan)
    if (aiText) { plan.summary = aiText; plan.model = 'hunyuan+rule' }

    // 留痕（集合缺失不阻塞）
    try {
      const { OPENID } = cloud.getWXContext()
      await db.collection('ai_plans').add({ data: { ...plan, openid: OPENID, createdAt: Date.now() } })
    } catch (e) {}

    return { code: 0, msg: 'ok', data: plan }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
