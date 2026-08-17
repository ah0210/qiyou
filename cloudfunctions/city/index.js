// cloudfunctions/city/index.js —— 城市列表与详情（查库失败走 seed 兜底）
const cloud = require('wx-server-sdk')
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

exports.main = async (event = {}) => {
  try {
    const cities = await loadCities()
    if (event.action === 'detail') {
      const c = cities.find((x) => x._id === event.cityId) || null
      return { code: 0, msg: 'ok', data: c }
    }
    return { code: 0, msg: 'ok', data: { list: cities } }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
