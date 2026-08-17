// cloudfunctions/policy/index.js —— 政策查询
const cloud = require('wx-server-sdk')
const { POLICIES } = require('./_shared/seedData')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event = {}) => {
  try {
    let list = POLICIES
    try {
      const res = await db.collection('policies').get()
      if (res.data && res.data.length) list = res.data
    } catch (e) {}

    const kw = String(event.keyword || '')
    if (kw) list = list.filter((p) => p.title.includes(kw) || p.content.includes(kw))
    return { code: 0, msg: 'ok', data: { list } }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
