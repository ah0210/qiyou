// cloudfunctions/seedData/index.js —— 一次性导入种子数据（幂等）
const cloud = require('wx-server-sdk')
const { CITIES, HOUSINGS, POLICIES } = require('./_shared/seedData')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function seed(collection, items) {
  let ok = 0
  for (const item of items) {
    try {
      await db.collection(collection).doc(item._id).set({ data: item })
      ok++
    } catch (e) {}
  }
  return ok
}

exports.main = async () => {
  try {
    const c = await seed('cities', CITIES)
    const h = await seed('housings', HOUSINGS)
    const p = await seed('policies', POLICIES)
    return { code: 0, msg: 'ok', data: { cities: c, housings: h, policies: p } }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
