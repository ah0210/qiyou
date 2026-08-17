// utils/tracker.js —— 轻量埋点（本地攒批，失败回填，上限 200）
const { call } = require('./cloud')

const KEY = 'qiyou_tracker'
let queue = load()

function load() {
  try { return wx.getStorageSync(KEY) || [] } catch (e) { return [] }
}
function save() { try { wx.setStorageSync(KEY, queue) } catch (e) {} }

function track(event, props = {}) {
  queue.push({ event, props, t: Date.now() })
  if (queue.length > 200) queue = queue.slice(-200)
  save()
  if (queue.length >= 20) flush()
}

function flush() {
  if (!queue.length) return
  const batch = queue.slice()
  queue = []
  save()
  call('analytics', { action: 'track', events: batch }, { showError: false })
    .catch(() => { queue = batch.concat(queue).slice(0, 200); save() })
}

module.exports = { track, flush }
