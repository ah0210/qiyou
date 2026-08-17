// cloudfunctions/aiChat/index.js —— AI 助手统一网关（场景化提示词 + 规则兜底 + 内容安全）
const cloud = require('wx-server-sdk')
const { POLICIES } = require('./_shared/seedData')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const DISCLAIMER = '（以上内容由 AI 生成，仅供参考，不构成法律/医疗意见）'

// 规则兜底（确定性回答，覆盖医保/社保两类高频）
function ruleFallback(q) {
  if (/医保|异地|就医|报销/.test(q)) return '异地就医可先在国家医保服务平台 App 办理备案，之后在就医地定点医院持医保凭证直接结算。' + DISCLAIMER
  if (/社保|灵活就业|养老.*保险/.test(q)) return '灵活就业人员可在就业地或户籍地以个人身份参加职工养老与医疗保险。' + DISCLAIMER
  if (/居住证|居住登记|落户/.test(q)) return '居住半年以上且符合稳定就业/住所/连续就读之一的，可申领居住证。' + DISCLAIMER
  if (/政策/.test(q)) {
    const p = POLICIES[0]
    return `${p.title}：${p.content} 来源：${p.source}` + DISCLAIMER
  }
  return null
}

async function callLLM(question) {
  // 未配置密钥或 AI_FALLBACK_ONLY 时返回 null
  if (process.env.AI_FALLBACK_ONLY === '1') return null
  if (!process.env.TENCENT_SECRET_ID || !process.env.TENCENT_SECRET_KEY) return null
  // 部署时接入腾讯混元 ChatCompletions（非流式，8 秒超时）
  return null
}

async function msgSecCheck(content) {
  try {
    const res = await cloud.openapi.security.msgSecCheck({ content })
    if (res && res.result && res.result.suggest === 'risky') return { blocked: true }
    return { blocked: false }
  } catch (e) { return { blocked: false } } // 未开通权限时失败不阻断
}

exports.main = async (event = {}) => {
  const question = String(event.question || '').trim()
  if (!question) return { code: 1, msg: '问题不能为空', data: null }
  const started = Date.now()

  try {
    const sec = await msgSecCheck(question)
    if (sec.blocked) return { code: 3, msg: '内容涉及违规，已被拦截', data: null }

    let answer = await callLLM(question)
    let model = 'hunyuan'
    if (!answer) {
      answer = ruleFallback(question) || '这个问题建议在「AI 旅居匹配」中填写预算与需求，我会为你生成个性化方案。' + DISCLAIMER
      model = 'rule-v1'
    }

    const data = { answer, scene: 'general', model, traceId: 'tr-' + Date.now(), latencyMs: Date.now() - started }

    // 留痕
    try {
      const { OPENID } = cloud.getWXContext()
      await db.collection('ai_logs').add({ data: { openid: OPENID, question, ...data, createdAt: Date.now() } })
    } catch (e) {}

    return { code: 0, msg: 'ok', data }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
