// utils/cloud.js —— 云函数调用封装（useCloud=false 时自动降级到 mock/functions.js）
const env = require('../config/env')
const mock = require('../mock/functions')

function call(name, data = {}, options = {}) {
  const { loading = '', showError = true, retry = 1 } = options

  // 未配置云环境 → 直接走本地 mock（零配置演示模式）
  if (!env.useCloud) {
    return Promise.resolve(mock.call(name, data)).then((r) => {
      if (r.code === 0) return r.data
      if (showError) wx.showToast({ title: r.msg || '出错了', icon: 'none' })
      return Promise.reject(Object.assign(new Error(r.msg || 'MOCK_ERROR'), { biz: true }))
    })
  }

  if (loading) wx.showLoading({ title: loading, mask: true })
  let attemptNo = 0
  const attempt = () => wx.cloud.callFunction({ name, data })
    .then((res) => {
      if (loading) wx.hideLoading()
      const r = res.result || {}
      if (r.code === 0) return r.data
      if (showError) wx.showToast({ title: r.msg || '服务开小差了', icon: 'none' })
      return Promise.reject(Object.assign(new Error(r.msg || 'BIZ_ERROR'), { biz: true }))
    })
    .catch((err) => {
      if (err && err.biz) return Promise.reject(err)
      if (attemptNo++ < retry) return attempt()
      if (loading) wx.hideLoading()
      if (showError) wx.showToast({ title: '网络异常，请重试', icon: 'none' })
      return Promise.reject(err)
    })
  return attempt()
}

module.exports = { call, useCloud: env.useCloud }
