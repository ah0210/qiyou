// custom-tab-bar/index.js —— 自定义 TabBar（中央凸起 AI 匹配按钮）
// 5 个 tab：首页 / 房源 / AI匹配(中央凸起) / 社群 / 我的
const { store } = require('../utils/store')
const { isElder } = require('../utils/theme')

Component({
  data: {
    selected: 0,
    elder: false,
    color: '#7a857e',
    selectedColor: '#2f6b4f',
    list: [
      { pagePath: '/pages/index/index', text: '首页', icon: '🏠', tab: true },
      { pagePath: '/pages/house/list', text: '房源', icon: '🏘️', tab: true },
      { pagePath: '/packages/ai/match/index', text: 'AI匹配', icon: '✦', tab: false },
      { pagePath: '/packages/community/feed/index', text: '社群', icon: '👥', tab: false },
      { pagePath: '/pages/profile/index', text: '我的', icon: '👤', tab: true }
    ]
  },
  lifetimes: {
    attached() {
      this.setData({ elder: isElder() })
    }
  },
  pageLifetimes: {
    show() {
      this.setData({ elder: isElder() })
    }
  },
  methods: {
    switchTab(e) {
      const idx = e.currentTarget.dataset.index
      const item = this.data.list[idx]
      if (this.data.selected === idx) return
      if (item.tab) {
        wx.switchTab({ url: item.pagePath })
      } else {
        wx.navigateTo({ url: item.pagePath })
      }
    }
  }
})
