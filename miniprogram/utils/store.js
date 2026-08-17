// utils/store.js —— 轻量全局状态（单一状态树 + 发布订阅 + 本地持久化）
const KEY = 'qiyou_state_v1'

const DEFAULT_STATE = {
  role: 'traveler',          // nomad | traveler | senior
  theme: 'normal',           // normal | elder
  voice: { enabled: false, autoRead: false },
  openid: '',
  userInfo: null,
  familyBound: false,
  houseFilter: '',           // 跳房源 Tab 时携带的类型
  pendingVoiceQuery: '',     // 语音指令跳 AI 助手时携带的问题
  lastPlan: null             // 最近一次匹配方案
}

let state = JSON.parse(JSON.stringify(DEFAULT_STATE))
const listeners = {}
const ANY = '*'

function persist() { try { wx.setStorageSync(KEY, state) } catch (e) {} }

function emit(key, val) {
  (listeners[key] ? Array.from(listeners[key]) : [])
    .concat(listeners[ANY] ? Array.from(listeners[ANY]) : [])
    .forEach((fn) => { try { fn(val, key) } catch (e) { console.error(e) } })
}

const store = {
  get(key) { return key ? state[key] : state },
  patch(obj) {
    Object.assign(state, obj)
    persist()
    Object.keys(obj).forEach((k) => emit(k, state[k]))
    emit(ANY, state)
  },
  setRole(role) {
    if (!['nomad', 'traveler', 'senior'].includes(role)) return
    const obj = { role }
    if (role === 'senior') obj.theme = 'elder'
    this.patch(obj)
  },
  setTheme(theme) { this.patch({ theme }) },
  setVoice(v) { this.patch({ voice: { ...state.voice, ...v } }) },
  restore() {
    try {
      const s = wx.getStorageSync(KEY)
      if (s) state = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), s)
    } catch (e) {}
    return state
  },
  on(keys, fn) {
    const arr = Array.isArray(keys) ? keys : [keys]
    arr.forEach((k) => {
      listeners[k] = listeners[k] || new Set()
      listeners[k].add(fn)
    })
    return () => arr.forEach((k) => listeners[k] && listeners[k].delete(fn))
  }
}

// 页面绑定 mixin：{ dataKey: stateKey }
function pageBind(map) {
  return {
    onLoad() {
      this._unsub = store.on(Object.values(map), () => {
        const p = {}
        Object.keys(map).forEach((dk) => { p[dk] = store.get(map[dk]) })
        this.setData(p)
      })
      const init = {}
      Object.keys(map).forEach((dk) => { init[dk] = store.get(map[dk]) })
      this.setData(init)
    },
    onUnload() { this._unsub && this._unsub() }
  }
}

module.exports = { store, pageBind, ROLES: {
  nomad: { key: 'nomad', label: '数字游民', desc: '远程办公 · 低价旅居 · 同城结伴', icon: '💻' },
  traveler: { key: 'traveler', label: '短期旅居', desc: '长短租 · 成本测算 · AI 行程', icon: '🧳' },
  senior: { key: 'senior', label: '康养长者', desc: '适老交互 · 语音问答 · 康养安居', icon: '🌿' }
} }
