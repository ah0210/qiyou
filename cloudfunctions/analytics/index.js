// cloudfunctions/analytics/index.js —— 埋点批量入库（失败不影响业务）
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  try {
    const events = Array.isArray(event.events) ? event.events : []
    for (const ev of events) {
      try { await db.collection('analytics_events').add({ data: { openid: OPENID, ...ev, createdAt: Date.now() } }) } catch (e) {}
    }
    return { code: 0, msg: 'ok', data: { ok: true, count: events.length } }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
