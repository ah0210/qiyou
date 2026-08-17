// cloudfunctions/aiContract/index.js —— 合同风险筛查（规则引擎 + LLM 语义互校）
const cloud = require('wx-server-sdk')
const { scanByRules, mergeResults, summarize } = require('./_shared/riskCore')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// LLM 语义扫描（可选增强，未配置返回空数组）
async function llmScan(text) {
  if (process.env.AI_FALLBACK_ONLY === '1') return []
  if (!process.env.TENCENT_SECRET_ID || !process.env.TENCENT_SECRET_KEY) return []
  // 部署时接入混元，强制输出 JSON 数组 [{clause,level,reason,suggestion}]
  return []
}

exports.main = async (event = {}) => {
  const text = String(event.text || '').trim()
  if (text.length < 10) return { code: 1, msg: '合同文本过短', data: null }

  try {
    const rules = scanByRules(text)
    const ai = await llmScan(text)
    const risks = mergeResults(ai, rules)
    const data = { risks, summary: summarize(risks), model: ai.length ? 'hunyuan+rule' : 'rule-v1', traceId: 'tr-' + Date.now() }

    try {
      const { OPENID } = cloud.getWXContext()
      await db.collection('contracts').add({ data: { openid: OPENID, riskCount: risks.length, createdAt: Date.now() } })
    } catch (e) {}

    return { code: 0, msg: 'ok', data }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
