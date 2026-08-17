// cloudfunctions/community/index.js —— 同城问答（内容安全 + 种子兜底）
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const SEED_POSTS = [
  { _id: 'post1', title: '大理冬天冷吗？适合过冬吗', cityName: '大理', content: '打算 11 月去大理，想问问当地冬天的体感和物价。', replies: ['白天 18 度左右，早晚凉，很舒服', '物价不高，古城单间 1500 左右'] },
  { _id: 'post2', title: '数字游民在昆明怎么找共享办公', cityName: '昆明', content: '远程办公，求推荐性价比高的共享办公点。', replies: ['翠湖周边有几家，工位 300/月起'] },
  { _id: 'post3', title: '北海适合带老人过冬吗', cityName: '北海', content: '想带父母去北海过冬，医疗条件如何？', replies: ['三甲医院有，但重症还是建议南宁/广州'] }
]

async function msgSecCheck(content) {
  try {
    const res = await cloud.openapi.security.msgSecCheck({ content })
    return !!(res && res.result && res.result.suggest === 'risky')
  } catch (e) { return false }
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action
  try {
    if (action === 'feed') {
      try {
        const res = await db.collection('posts').orderBy('createdAt', 'desc').limit(50).get()
        if (res.data && res.data.length) return { code: 0, msg: 'ok', data: { list: res.data } }
      } catch (e) {}
      return { code: 0, msg: 'ok', data: { list: SEED_POSTS } }
    }

    if (action === 'detail') {
      try {
        const res = await db.collection('posts').doc(event.id).get()
        if (res.data) return { code: 0, msg: 'ok', data: res.data }
      } catch (e) {}
      return { code: 0, msg: 'ok', data: SEED_POSTS.find((p) => p._id === event.id) || null }
    }

    if (action === 'ask') {
      const content = String(event.content || '').trim()
      if (!content) return { code: 1, msg: '内容不能为空', data: null }
      if (await msgSecCheck(content)) return { code: 3, msg: '内容涉及违规', data: null }
      await db.collection('posts').add({ data: { title: content.slice(0, 30), content, cityName: '栖游', replies: [], openid: OPENID, createdAt: Date.now() } })
      return { code: 0, msg: 'ok', data: { ok: true } }
    }

    if (action === 'reply') {
      const content = String(event.content || '').trim()
      if (!content) return { code: 1, msg: '内容不能为空', data: null }
      if (await msgSecCheck(content)) return { code: 3, msg: '内容涉及违规', data: null }
      const _ = db.command
      await db.collection('posts').doc(event.id).update({ data: { replies: _.push([content]) } })
      return { code: 0, msg: 'ok', data: { ok: true } }
    }

    return { code: 1, msg: '未知操作', data: null }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
