// scripts/check-syntax.js —— 递归 node --check 所有 JS 文件（跨平台，替代 find）
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const DIRS = ['miniprogram', 'cloudfunctions', 'scripts']
const SKIP = ['node_modules', '.git', '_shared'] // _shared 由 sync 生成，跳过避免重复检查

const jsFiles = []
function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (!SKIP.includes(entry)) walk(full)
    } else if (entry.endsWith('.js')) {
      jsFiles.push(full)
    }
  }
}
DIRS.forEach((d) => walk(path.join(ROOT, d)))

let fail = 0
for (const f of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' })
  } catch (e) {
    fail++
    console.error('✗ 语法错误：' + f)
    console.error(e.stderr ? e.stderr.toString() : e.message)
  }
}
console.log(`\n检查 ${jsFiles.length} 个 JS 文件，${fail} 个错误`)
process.exit(fail ? 1 : 0)
