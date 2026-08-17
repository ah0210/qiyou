// utils/theme.js —— 适老大字模式（通过根节点 class 切换 CSS 变量）
const { store } = require('./store')

function applyTheme(page) {
  const theme = store.get('theme')
  page.setData({ _theme: theme === 'elder' ? 'elder' : 'normal' })
}

module.exports = { applyTheme }
