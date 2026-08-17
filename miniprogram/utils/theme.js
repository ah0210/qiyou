// utils/theme.js —— 适老大字模式（通过根节点 class 切换 CSS 变量）
// 关键点：输出 'theme--elder' / ''，对应 app.wxss 的 .theme--elder 选择器
// （class 挂在页面根 view 上，非 page 上，所以选择器必须是 .theme--elder 而非 page.theme--elder）
const { store } = require('./store')

function applyTheme(page) {
  const theme = store.get('theme')
  page.setData({ _theme: theme === 'elder' ? 'theme--elder' : '' })
}

// 供 custom-tab-bar 组件读取（组件内无页面对象）
function isElder() {
  return store.get('theme') === 'elder'
}

module.exports = { applyTheme, isElder }
