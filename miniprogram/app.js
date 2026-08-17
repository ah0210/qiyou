// app.js —— 栖游全局逻辑
const { store } = require('./utils/store')
const env = require('./config/env')

App({
  globalData: { env, hyReady: false },

  onLaunch() {
    // 云开发初始化（未配置 env 时 useCloud=false，走 mock）
    if (env.useCloud && wx.cloud) {
      wx.cloud.init({ env: env.cloudEnvId, traceUser: true })
      this.globalData.hyReady = !!(wx.cloud.extend && wx.cloud.extend.AI)
    } else {
      console.warn('[栖游] 未配置云环境，全功能走本地 mock 演示模式')
    }

    store.restore()

    // 全局异常上报
    wx.onError && wx.onError((err) => this.reportError('onError', err))
    wx.onUnhandledRejection && wx.onUnhandledRejection((res) => this.reportError('unhandledRejection', res && res.reason))
  },

  onShow() {
    store.restore()
    if (env.useCloud && wx.cloud) this.globalData.hyReady = !!(wx.cloud.extend && wx.cloud.extend.AI)
  },

  reportError(type, err) {
    console.error('[栖游][error]', type, err)
  }
})
