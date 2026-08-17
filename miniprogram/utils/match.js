// utils/match.js —— 城市六维评分 + 旅居匹配（端侧权威源，自动生成，请勿手改）
// 由 scripts/sync-shared.js 从 cloudfunctions/_shared/scoreCore.js 生成
// cloudfunctions/_shared/scoreCore.js —— 城市六维评分 + 旅居匹配（单一权威源）
// 由 scripts/sync-shared.js 分发到 aiMatch/city 云函数 + 生成 miniprogram/utils/match.js 的评分核心
// 纯函数、零依赖、确定性可复算（端云同构硬校验）

// 六维定义
const DIMS = ['cost', 'medical', 'climate', 'network', 'senior', 'life']
const DIM_LABEL = {
  cost: '物价友好', medical: '医疗资源', climate: '气候空气',
  network: '网络办公', senior: '养老配套', life: '生活便利'
}

// 身份权重（和=1）
const WEIGHTS = {
  nomad:    { cost: 0.30, network: 0.20, life: 0.20, climate: 0.15, medical: 0.10, senior: 0.05 },
  traveler: { cost: 0.30, life: 0.25, climate: 0.20, medical: 0.10, network: 0.10, senior: 0.05 },
  senior:   { medical: 0.35, senior: 0.25, cost: 0.15, climate: 0.15, life: 0.07, network: 0.03 }
}

// 身份标签亲和（用于需求命中加分）
const AFFINITY = {
  nomad:    ['游民', '社群', '办公', '宽带', '青旅', '咖啡'],
  traveler: ['海景', '美食', '四季如春', '慢节奏', '风景'],
  senior:   ['康养', '医养', '过冬', '适老', '三甲', '温泉']
}

// 六维加权评分（scoreDetail 六维 0-100）
function scoreByPersona(scoreDetail, role) {
  const w = WEIGHTS[role] || WEIGHTS.traveler
  return Math.round(DIMS.reduce((s, d) => s + (scoreDetail[d] || 60) * w[d], 0))
}

// 需求命中加分（每命中一个 +5，上限 15）
function needsBonus(tags, needs, role) {
  const aff = (AFFINITY[role] || []).concat(needs || [])
  const hit = (needs || []).filter((n) =>
    (tags || []).some((t) => t.includes(n) || n.includes(t))).length
  return Math.min(15, hit * 5)
}

// 三段式匹配：硬筛（预算1.1弹性）→ 评分 → Top3
function matchCities(cities, input) {
  const role = ['nomad', 'traveler', 'senior'].includes(input.role) ? input.role : 'traveler'
  const budget = Number(input.budget) || 99999
  const needs = Array.isArray(input.needs) ? input.needs : []

  // ① 硬筛：预算（10% 弹性）；需求为软约束进评分，避免近义不匹配误剔除
  let filtered = cities.filter((c) => (c.cost.totalMonthly || 0) <= budget * 1.1)
  if (!filtered.length) filtered = cities // 条件过严放宽，保证有结果

  // ② 评分 + 排序
  return filtered
    .map((c) => {
      const base = scoreByPersona(c.scoreDetail, role)
      const bonus = needsBonus(c.tags, needs, role)
      return {
        cityId: c._id, name: c.name, province: c.province, tags: c.tags,
        scoreDetail: c.scoreDetail, cost: c.cost, desc: c.desc,
        matchScore: Math.max(35, Math.min(98, base + bonus)),
        scoreBase: base, scoreNeeds: bonus,
        reasons: buildReasons(c, role, needs)
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
}

function buildReasons(c, role, needs) {
  const parts = []
  if (role === 'senior') parts.push(`医疗 ${c.scoreDetail.medical}、养老 ${c.scoreDetail.senior}`)
  if (role === 'nomad') parts.push(`网络办公 ${c.scoreDetail.network}`)
  parts.push(`月成本约 ¥${c.cost.totalMonthly}`)
  const hit = (needs || []).filter((n) => (c.tags || []).some((t) => t.includes(n) || n.includes(t)))
  if (hit.length) parts.push('命中需求：' + hit.join('、'))
  parts.push(c.desc || '')
  return parts
}

// 预算明细（分项求和 = 总额，防幻觉）
function budgetSheet(city, role, months) {
  const mo = Number(months) || 1
  const items = [
    { name: '租房', value: Math.round(city.cost.rent1b * mo) },
    { name: '餐饮', value: Math.round(city.cost.meal * mo) },
    { name: '交通', value: Math.round(city.cost.transport * mo) },
    { name: '其他', value: Math.round(300 * mo) }
  ]
  if (role === 'nomad') items.splice(3, 0, { name: '共享办公', value: Math.round(city.cost.cowork * mo) })
  return { city: city.name, items, total: items.reduce((s, i) => s + i.value, 0) }
}

module.exports = { DIMS, DIM_LABEL, WEIGHTS, AFFINITY, scoreByPersona, needsBonus, matchCities, budgetSheet }

