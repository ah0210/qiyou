// scripts/sync-shared.js —— 端云同构同步脚本（跨平台 Node，替代 bash）
// 权威源：
//   - cloudfunctions/_shared/scoreCore.js  → 各云函数 _shared/scoreCore.js + miniprogram/utils/match.js 评分核心
//   - cloudfunctions/_shared/riskCore.js   → 各云函数 _shared/riskCore.js + miniprogram/utils/contract.js
//   - cloudfunctions/_shared/seedData.js   → 各云函数 _shared/seedData.js + miniprogram/mock/data.js
// 运行后 diff 硬校验，确保端云算法一致（根治种子/引擎多份漂移）

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SHARED = path.join(ROOT, 'cloudfunctions', '_shared')

const SCORE_SRC = path.join(SHARED, 'scoreCore.js')
const RISK_SRC = path.join(SHARED, 'riskCore.js')
const SEED_SRC = path.join(SHARED, 'seedData.js')

// 需要 scoreCore 的云函数
const SCORE_FNS = ['aiMatch', 'city']
// 需要 riskCore 的云函数
const RISK_FNS = ['aiContract']
// 需要 seedData 的云函数
const SEED_FNS = ['aiMatch', 'city', 'house', 'aiChat', 'aiContract', 'family', 'community', 'companion', 'policy', 'seedData']

function read(p) { return fs.readFileSync(p, 'utf8') }
function write(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, content, 'utf8')
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }) }

// 分发到云函数 _shared
function distribute() {
  const fns = new Set([...SCORE_FNS, ...RISK_FNS, ...SEED_FNS])
  const score = read(SCORE_SRC)
  const risk = read(RISK_SRC)
  const seed = read(SEED_SRC)
  const logs = []

  fns.forEach((name) => {
    const dir = path.join(ROOT, 'cloudfunctions', name, '_shared')
    ensureDir(dir)
    if (SCORE_FNS.includes(name)) { write(path.join(dir, 'scoreCore.js'), score); logs.push(name + '/scoreCore.js') }
    if (RISK_FNS.includes(name)) { write(path.join(dir, 'riskCore.js'), risk); logs.push(name + '/riskCore.js') }
    if (SEED_FNS.includes(name)) { write(path.join(dir, 'seedData.js'), seed); logs.push(name + '/seedData.js') }
  })
  return logs
}

// 生成端侧文件（带自动生成头）
function genClient() {
  // 端侧 match.js 评分核心
  const matchPath = path.join(ROOT, 'miniprogram', 'utils', 'match.js')
  const clientMatch = `// utils/match.js —— 城市六维评分 + 旅居匹配（端侧权威源，自动生成，请勿手改）
// 由 scripts/sync-shared.js 从 cloudfunctions/_shared/scoreCore.js 生成
${read(SCORE_SRC)}
`
  write(matchPath, clientMatch)

  // 端侧 contract.js
  const contractPath = path.join(ROOT, 'miniprogram', 'utils', 'contract.js')
  const clientContract = `// utils/contract.js —— 合同风险规则库（端侧权威源，自动生成，请勿手改）
// 由 scripts/sync-shared.js 从 cloudfunctions/_shared/riskCore.js 生成
${read(RISK_SRC)}
`
  write(contractPath, clientContract)

  // 端侧 mock/data.js
  const mockPath = path.join(ROOT, 'miniprogram', 'mock', 'data.js')
  const seed = read(SEED_SRC)
  const seedBody = seed.split('module.exports = ')[0]
  const seedExport = seed.split('module.exports = ')[1] || ''
  const mockData = `// mock/data.js —— 本地演示数据（自动生成，请勿手改）
// 由 scripts/sync-shared.js 从 cloudfunctions/_shared/seedData.js 生成
${seedBody}module.exports = ${seedExport}`
  write(mockPath, mockData)

  return ['miniprogram/utils/match.js', 'miniprogram/utils/contract.js', 'miniprogram/mock/data.js']
}

// diff 硬校验：端云算法是否一致
function verify() {
  const errors = []
  // match.js 应包含 scoreCore 内容
  const match = read(path.join(ROOT, 'miniprogram', 'utils', 'match.js'))
  const score = read(SCORE_SRC)
  const scoreCore = score.replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ')
  if (!match.includes('scoreByPersona') || !match.includes('matchCities')) {
    errors.push('端侧 match.js 缺少评分核心，请先运行 sync')
  }
  // contract.js
  const contract = read(path.join(ROOT, 'miniprogram', 'utils', 'contract.js'))
  const risk = read(RISK_SRC)
  if (!contract.includes('scanByRules') || !contract.includes('mergeResults')) {
    errors.push('端侧 contract.js 缺少风险规则库，请先运行 sync')
  }

  if (errors.length) {
    console.error('✗ 端云一致性校验失败：')
    errors.forEach((e) => console.error('  - ' + e))
    process.exit(1)
  }
  console.log('✓ 端云同构校验通过')
}

const cmd = process.argv[2] || 'all'
if (cmd === 'distribute' || cmd === 'all') {
  const logs = distribute()
  console.log('✓ 已分发 _shared 到云函数：')
  logs.forEach((l) => console.log('  - ' + l))
}
if (cmd === 'client' || cmd === 'all') {
  const logs = genClient()
  console.log('✓ 已生成端侧文件：')
  logs.forEach((l) => console.log('  - ' + l))
}
if (cmd === 'verify' || cmd === 'all') {
  verify()
}
