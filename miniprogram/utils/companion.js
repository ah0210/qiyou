// utils/companion.js —— 结伴匹配（同城 + 时间重叠 + 兴趣重合度）
// 评分：同城30 + 时间重叠40 + 兴趣命中(3分/个) + 同身份+2
function companionScore(mine, other) {
  let score = 0
  if (mine.cityName === other.cityName) score += 30
  const timeOverlap = !(mine.endDate < other.startDate || other.endDate < mine.startDate)
  if (timeOverlap) score += 40
  const overlap = interestOverlap(mine.interests || [], other.interests || [])
  score += overlap * 3
  if (mine.role === other.role) score += 2
  return { score, overlap, timeOverlap }
}

function interestOverlap(a, b) {
  return a.filter((x) => b.some((y) => y.includes(x) || x.includes(y))).length
}

function matchCompanions(mine, all) {
  return all
    .filter((c) => c.openid !== mine.openid)
    .map((c) => {
      const r = companionScore(mine, c)
      return { ...c, score: r.score, common: r.overlap, timeOverlap: r.timeOverlap }
    })
    .filter((c) => c.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

function buildReason(mine, top) {
  if (!top) return '暂未找到高度匹配的搭子，可先发布行程等待匹配'
  return `为你匹配到${top.nickName || '一位伙伴'}：同在${top.cityName}，共同兴趣${top.common}个，时间重叠，匹配度${top.score}分`
}

module.exports = { companionScore, interestOverlap, matchCompanions, buildReason }
