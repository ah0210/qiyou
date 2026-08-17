// cloudfunctions/house/index.js —— 房源列表与详情
const cloud = require('wx-server-sdk')
const { HOUSINGS } = require('./_shared/seedData')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function loadHouses() {
  try {
    const res = await db.collection('housings').get()
    if (res.data && res.data.length >= 3) return res.data
    return HOUSINGS
  } catch (e) { return HOUSINGS }
}

exports.main = async (event = {}) => {
  try {
    const houses = await loadHouses()
    if (event.action === 'detail') {
      const h = houses.find((x) => x._id === event.houseId) || null
      return { code: 0, msg: 'ok', data: h }
    }
    let list = houses.slice()
    if (event.type) list = list.filter((h) => h.type === event.type)
    if (event.cityId) list = list.filter((h) => h.cityId === event.cityId)
    return { code: 0, msg: 'ok', data: { list } }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
