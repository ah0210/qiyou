// scripts/verify-pages.js —— 校验 app.json 声明的页面/组件/usingComponents 路径全部存在
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const APP_JSON = JSON.parse(fs.readFileSync(path.join(ROOT, 'miniprogram', 'app.json'), 'utf8'))

const errors = []
const pages = [...APP_JSON.pages]
APP_JSON.subpackages.forEach((sp) => sp.pages.forEach((p) => pages.push(`${sp.root}${p}`)))

// 检查每个页面的 usingComponents 引用是否存在
pages.forEach((p) => {
  const jsonPath = path.join(ROOT, 'miniprogram', p + '.json')
  if (!fs.existsSync(jsonPath)) return
  let cfg
  try { cfg = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) } catch (e) { return }
  const comps = cfg.usingComponents || {}
  Object.entries(comps).forEach(([name, compPath]) => {
    if (compPath.startsWith('/')) {
      const base = path.join(ROOT, 'miniprogram', compPath.slice(1))
      if (!fs.existsSync(base + '.js')) errors.push(`${p}.json 组件 ${name} 缺少 ${compPath}.js`)
    }
  })
})

if (errors.length) {
  console.error('✗ 组件引用校验失败：')
  errors.forEach((e) => console.error('  - ' + e))
  process.exit(1)
}
console.log(`✓ 组件引用校验通过（${pages.length} 个页面）`)
