// cloudfunctions/family/index.js —— 家属绑定（邀请码双向确认）+ 紧急呼叫
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const INVITE_TTL = 5 * 60 * 1000 // 5 分钟

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action

  try {
    if (action === 'invite') {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      await db.collection('invites').add({ data: { code, from: OPENID, expireAt: Date.now() + INVITE_TTL, createdAt: Date.now() } })
      return { code: 0, msg: 'ok', data: { code6: code } }
    }

    if (action === 'bind') {
      const code = String(event.code || '')
      if (!/^\d{6}$/.test(code)) return { code: 1, msg: '邀请码格式错误', data: null }
      const res = await db.collection('invites').where({ code, used: _.neq(true) }).get()
      const inv = res.data[0]
      if (!inv) return { code: 1, msg: '邀请码无效或已过期', data: null }
      if (Date.now() > inv.expireAt) return { code: 1, msg: '邀请码已过期', data: null }
      if (inv.from === OPENID) return { code: 1, msg: '不能绑定自己', data: null }

      // 双向确认：A 绑定 B，B 也记录 A
      await db.collection('family').add({ data: { elder: inv.from, member: OPENID, createdAt: Date.now() } })
      await db.collection('invites').where({ code }).update({ data: { used: true } })
      return { code: 0, msg: 'ok', data: { ok: true } }
    }

    if (action === 'list') {
      const res = await db.collection('family').where(_.or([{ elder: OPENID }, { member: OPENID }])).get()
      return { code: 0, msg: 'ok', data: { list: res.data } }
    }

    if (action === 'sos') {
      // 订阅消息推送（需配置 SOS_TMPL_ID 环境变量）
      const tmpl = process.env.SOS_TMPL_ID
      if (!tmpl) return { code: 0, msg: 'ok', data: { notified: false } }
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: OPENID, templateId: tmpl, page: 'packages/senior/emergency/index',
          data: { thing1: { value: '家人发来紧急呼叫' }, time2: { value: new Date().toLocaleString() } }
        })
        return { code: 0, msg: 'ok', data: { notified: true } }
      } catch (e) { return { code: 0, msg: 'ok', data: { notified: false } } }
    }

    return { code: 1, msg: '未知操作', data: null }
  } catch (e) {
    return { code: 500, msg: e.message, data: null }
  }
}
