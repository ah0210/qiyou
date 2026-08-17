// scripts/audit-wx.js —— 微信运行期专项审计（跨平台 Node）
// 检查：① 页面四件套完整性 ② Tab 页禁 navigateTo/redirectTo ③ switchTab 禁带 ?query
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const APP_JSON = JSON.parse(fs.readFileSync(path.join(ROOT, 'miniprogram', 'app.json'), 'utf8'))

const errors = []

// 收集所有页面路径
const pages = [...APP_JSON.pages]
APP_JSON.subpackages.forEach((sp) => sp.pages.forEach((p) => pages.push(`${sp.root}${p}`)))
const tabs = (APP_JSON.tabBar && APP_JSON.tabBar.list) ? APP_JSON.tabBar.list.map((t) => t.pagePath) : []

// ① 页面四件套完整性
pages.forEach((p) => {
  const base = path.join(ROOT, 'miniprogram', p)
  for (const ext of ['.js', '.json', '.wxml', '.wxss']) {
    if (!fs.existsSync(base + ext)) errors.push(`页面 ${p} 缺少 ${ext}`)
  }
})

// 收集所有 js 文件
const jsFiles = []
function collect(dir) {
  if (!fs.existsSync(dir)) return
  fs.readdirSync(dir).forEach((e) => {
    const full = path.join(dir, e)
    if (fs.statSync(full).isDirectory()) collect(full)
    else if (e.endsWith('.js')) jsFiles.push(full)
  })
}
collect(path.join(ROOT, 'miniprogram'))

// ② Tab 页禁 navigateTo/redirectTo（改用 switchTab）
const navRe = /(navigateTo|redirectTo)\s*\(\s*\{\s*url:\s*['"]([^'"?]+)['"]/g
jsFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8')
  let m
  while ((m = navRe.exec(content))) {
    const url = m[2].replace(/^\//, '')
    if (tabs.includes(url)) {
      errors.push(`${file} 对 Tab 页 ${url} 使用了 ${m[1]}，应改用 switchTab`)
    }
  }
})

// ③ switchTab 禁带 ?query
const switchRe = /switchTab\s*\(\s*\{\s*url:\s*['"]([^'"]*\?[^'"]*)['"]/g
jsFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8')
  let m
  while ((m = switchRe.exec(content))) {
    errors.push(`${file} switchTab 携带 query 参数：${m[1]}`)
  }
})

if (errors.length) {
  console.error('✗ 微信运行期审计失败：')
  errors.forEach((e) => console.error('  - ' + e))
  process.exit(1)
}
console.log(`✓ 微信运行期审计通过（${pages.length} 个页面，${jsFiles.length} 个 JS 文件）`)
