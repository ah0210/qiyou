// scripts/verify-routes.js —— 校验所有 navigateTo/switchTab/redirectTo 的目标页面已注册
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const APP_JSON = JSON.parse(fs.readFileSync(path.join(ROOT, 'miniprogram', 'app.json'), 'utf8'))

const pages = new Set([...APP_JSON.pages])
APP_JSON.subpackages.forEach((sp) => sp.pages.forEach((p) => pages.add(`${sp.root}${p}`)))

const errors = []
const re = /(navigateTo|redirectTo|switchTab|reLaunch)\s*\(\s*\{\s*url:\s*['"]([^'"?]+)/g

function scan(file) {
  if (!fs.existsSync(file)) return
  const content = fs.readFileSync(file, 'utf8')
  let m
  while ((m = re.exec(content))) {
    const url = m[2].replace(/^\//, '')
    if (!pages.has(url)) errors.push(`${file} 跳转到未注册页面：${url}`)
  }
}
function walk(dir) {
  if (!fs.existsSync(dir)) return
  fs.readdirSync(dir).forEach((e) => {
    const full = path.join(dir, e)
    if (fs.statSync(full).isDirectory()) walk(full)
    else if (e.endsWith('.js')) scan(full)
  })
}
walk(path.join(ROOT, 'miniprogram'))

if (errors.length) {
  console.error('✗ 路由校验失败：')
  errors.forEach((e) => console.error('  - ' + e))
  process.exit(1)
}
console.log(`✓ 路由校验通过（${pages.size} 个页面）`)
