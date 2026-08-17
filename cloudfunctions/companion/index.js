// cloudfunctions/companion/index.js —— 兴趣结伴（同城 + 时间重叠 + 兴趣重合）
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function companionScore(mine, other) {
  let score = 0
  if (mine.cityName === other.cityName) score += 30
  const overlap = !(mine.endDate < other.startDate || other.endDate < mine.startDate)
  if (overlap) score += 40
  const common = (mine.interests || []).filter((x) => (other.interests || []).some((y) => y.includes(x) || x.includes(y))).length
  score += common * 3
  if (mine.role === other.role) score += 2
  return { score, common, timeOverlap: overlap }
}

exports.main = async (event = {}) => {
  try {
    if (event.action === 'match') {
      const mine = event.mine || {}
      let users = []
      try {
        const res = await db.collection('companions').limit(100).get()
        users = res.data
      } catch (e) { users = [] }

      const list = users
        .filter((c) => c.openid !== mine.openid)
        .map((c) => {
          const r = companionScore(mine, c)
          return { ...c, score: r.score, common: r.common, timeOverlap: r.timeOverlap }
        })
        .filter((c) => c.score >= 40)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
      return { code: 0, msg: 'ok', data: { list } }
    }
    return { code: 1, msg: '未知操作', data: null }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
