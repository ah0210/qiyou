// scripts/selftest.js —— 核心算法自测（零依赖 Node 脚本，端云同构硬校验）
// 覆盖：评分权重、三身份差异化、预算自洽、合同引擎、端云算法一致性
const path = require('path')
const fs = require('fs')

const ROOT = path.resolve(__dirname, '..')
const score = require(path.join(ROOT, 'cloudfunctions', '_shared', 'scoreCore.js'))
const risk = require(path.join(ROOT, 'cloudfunctions', '_shared', 'riskCore.js'))
const { CITIES, HOUSINGS, POLICIES } = require(path.join(ROOT, 'cloudfunctions', '_shared', 'seedData.js'))
const clientMatch = require(path.join(ROOT, 'miniprogram', 'utils', 'match.js'))
const clientContract = require(path.join(ROOT, 'miniprogram', 'utils', 'contract.js'))

let passed = 0
let failed = 0
const failures = []

function assert(name, cond) {
  if (cond) { passed++ }
  else { failed++; failures.push(name) }
}
function assertEq(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) passed++
  else { failed++; failures.push(`${name}（期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}）`) }
}

// [1] 评分权重和 = 1
for (const role of ['nomad', 'traveler', 'senior']) {
  const sum = Object.values(score.WEIGHTS[role]).reduce((s, v) => s + v, 0)
  assert(`权重和=1 (${role})`, Math.abs(sum - 1) < 0.001)
}

// [2] 三身份推荐差异化
const nomadTop = score.matchCities(CITIES, { role: 'nomad', budget: 3000, needs: [] })[0]
const seniorTop = score.matchCities(CITIES, { role: 'senior', budget: 3000, needs: [] })[0]
assert('游民身份 top1 存在', !!nomadTop)
assert('康养身份 top1 存在', !!seniorTop)
assert('三身份评分有差异化', nomadTop.name !== seniorTop.name || nomadTop.matchScore !== seniorTop.matchScore)

// [3] 预算自洽：分项求和 = 总额
const sheet = score.budgetSheet(CITIES[0], 'nomad', 3)
assert('预算分项求和=总额', sheet.items.reduce((s, i) => s + i.value, 0) === sheet.total)

// [4] 康养房源适老化设施
const wellness = HOUSINGS.filter((h) => h.type === 'wellness')
assert('康养房源全部有电梯+扶手', wellness.every((h) => h.accessible && h.accessible.elevator && h.accessible.grabBar))

// [5] 合同引擎：示例危险合同识别 ≥4 高风险
const DEMO = `1. 押金：乙方需支付 3 个月租金作为押金，合同期满押金不予退还。
2. 违约金：乙方提前退租，需支付年租金 100% 的违约金。
3. 维修：房屋及设施维修费用全部由乙方（租客）承担。
4. 免责：甲方对乙方在房屋内发生的人身伤害概不负责。
5. 租金：甲方有权随时提高租金，乙方须无条件接受。`
const risks = risk.scanByRules(DEMO)
assert('危险合同识别 ≥4 项', risks.length >= 4)
assert('危险合同含高风险', risks.some((r) => r.level === '高'))

// [6] 干净合同低误报
const CLEAN = '甲乙双方本着平等自愿原则，租赁期内租金保持不变，房屋主体维修由房东负责，合同期满无违约全额退还押金。'
const cleanRisks = risk.scanByRules(CLEAN)
assert('干净合同 ≤1 项误报', cleanRisks.length <= 1)

// [7] 端云算法同构：matchCities 结果完全一致
for (const role of ['nomad', 'traveler', 'senior']) {
  const a = score.matchCities(CITIES, { role, budget: 2500, needs: ['暖和'] })
  const b = clientMatch.matchCities(CITIES, { role, budget: 2500, needs: ['暖和'] })
  assertEq(`端云 matchCities 一致 (${role})`, b, a)
}

// [8] 端云合同引擎同构
assertEq('端云 scanByRules 一致', clientContract.scanByRules(DEMO), risks)

// [9] 数据合规：dataSource 声明 + 类型枚举
assert('所有城市有 dataSource', CITIES.every((c) => c.dataSource && c.dataSource.length > 5))
assert('房源 cityKey 存在', HOUSINGS.every((h) => CITIES.some((c) => c._id === h.cityId)))
assert('房源类型枚举合法', HOUSINGS.every((h) => ['nomad', 'wellness', 'short'].includes(h.type)))

// [10] 政策数据完整
assert('政策 ≥3 条', POLICIES.length >= 3)

console.log(`\n通过 ${passed} 项，失败 ${failed} 项`)
if (failures.length) {
  console.error('失败项：')
  failures.forEach((f) => console.error('  ✗ ' + f))
  process.exit(1)
}
console.log('✓ 全部自测通过')
