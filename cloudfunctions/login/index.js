// cloudfunctions/login/index.js —— 登录 + 用户档案（字段白名单防越权）
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const ALLOWED_PATCH = ['role', 'theme', 'nickName', 'avatarUrl', 'phone', 'ageRange', 'emergencyPhone', 'voice']

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action
  try {
    if (action === 'login') {
      const res = await db.collection('users').where({ openid: OPENID }).get()
      if (res.data.length) return { code: 0, msg: 'ok', data: { openid: OPENID, user: res.data[0] } }
      const user = { openid: OPENID, role: 'traveler', theme: 'normal', createdAt: Date.now() }
      await db.collection('users').add({ data: user })
      return { code: 0, msg: 'ok', data: { openid: OPENID, user } }
    }

    if (action === 'profile') {
      const res = await db.collection('users').where({ openid: OPENID }).get()
      return { code: 0, msg: 'ok', data: res.data[0] || null }
    }

    if (action === 'updateProfile') {
      const patch = {}
      ALLOWED_PATCH.forEach((k) => {
        if (event[k] !== undefined) patch[k] = event[k]
      })
      if (!Object.keys(patch).length) return { code: 1, msg: '无可更新字段', data: null }
      await db.collection('users').where({ openid: OPENID }).update({ data: patch })
      return { code: 0, msg: 'ok', data: { ok: true } }
    }

    return { code: 1, msg: '未知操作', data: null }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
