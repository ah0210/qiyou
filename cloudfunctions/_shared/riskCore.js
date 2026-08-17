// cloudfunctions/_shared/riskCore.js —— 合同风险规则库（单一权威源）
// 由 scripts/sync-shared.js 从 miniprogram/utils/contract.js 回写生成，请勿手改
// 仅做风险提示，不构成法律意见。

const RISK_RULES = [
  { type: '押金退还', level: '高', re: /押金[^。；\n]{0,12}(不退|不予退还|没收)/, reason: '约定押金一律不退，违反公平原则与租赁惯例', suggestion: '改为"无违约且结清水电、房屋无损时，退房 X 日内全额退还押金"' },
  { type: '押金金额', level: '中', re: /押金[^。；\n]{0,6}([三四3-4])\s*个?月/, reason: '押金金额偏高，通常为 1 个月租金', suggestion: '协商将押金降至 1 个月，并明确退还条件与时间' },
  { type: '违约金', level: '高', re: /(违约金[^。；\n]{0,20}([3-9]\d|100)\s*%)|(([3-9]\d|100)\s*%[^。；\n]{0,20}违约金)/, reason: '违约金比例过高，司法实践通常以实际损失 30% 为限', suggestion: '将违约金调整为不超过剩余租金或月租的 20%–30%' },
  { type: '转租限制', level: '低', re: /(不得|禁止|无权)[^。；\n]{0,6}转租/, reason: '完全禁止转租可能限制灵活性（数字游民中途离开常见）', suggestion: '可争取"经房东书面同意可转租，不得无故拒绝"' },
  { type: '维修责任', level: '高', re: /((房东|甲方)[^。；\n]{0,8}(不承担|无需承担|概不负责)[^。；\n]{0,10}(维修|修缮|损坏))|((维修|修缮)[^。；\n]{0,12}(由乙方|租客|承租人)[^。；\n]{0,6}(承担|负责))/, reason: '将房屋维修义务全部推给租客，与法律规定相悖', suggestion: '明确"房屋主体与固有设施由房东负责维修，因租客使用不当造成的除外"' },
  { type: '租期涨租', level: '中', re: /(随时|有权)[^。；\n]{0,8}(涨租|提高租金|调整价格)/, reason: '房东可随时单方涨租，租期内租金无保障', suggestion: '约定租期内租金固定，续租涨幅不超过 X%' },
  { type: '提前退租', level: '中', re: /(提前解约|提前退租)[^。；\n]{0,12}(不退|没收)[^。；\n]{0,6}(租金|押金)/, reason: '提前退租即没收全部已付租金，责任过重', suggestion: '改为"提前 30 天通知，扣除 1 个月租金作为补偿，余款退还"' },
  { type: '口头承诺', level: '中', re: /(口头|微信)[^。；\n]{0,8}(承诺|约定)[^。；\n]{0,8}(有效|为准)|以[^。；\n]{0,6}口头[^。；\n]{0,6}为准/, reason: '重要事项依赖口头承诺，举证困难', suggestion: '将家电、维修、退租等承诺全部写入合同补充条款' },
  { type: '人身伤害免责', level: '高', re: /(人身|意外|伤害|伤亡|安全)[^。；\n]{0,15}(不承担|免责|概不负责|无关)/, reason: '试图免除人身伤害/安全保障责任，此类免责条款常因违反法律强制规定而无效', suggestion: '删除此类免责条款；因房屋固有瑕疵致损的，房东应依法担责' },
  { type: '康养免责', level: '高', re: /(养老|康养|护理|医疗)[^。；\n]{0,20}(不承担|免责|无关)/, reason: '康养机构试图免除其照护/安全保障核心责任', suggestion: '要求明确服务内容、护理等级、安全保障义务与违约责任，核实机构资质' },
  { type: '自动续约', level: '中', re: /(自动续约|自动续签|自动转为)[^。；\n]{0,10}(无固定|长期|永久)/, reason: '自动转为长期/无固定期限，退租灵活性受限', suggestion: '约定续约需双方书面确认，租客有权提前通知不续租' },
  { type: '添附归属', level: '低', re: /(合同期满|到期)[^。；\n]{0,10}(装修|添附|附属)[^。；\n]{0,8}(归|无偿)/, reason: '装修与添附归属约定可能损害租客投入', suggestion: '明确可拆除设施归租客，不可拆除部分协商折价补偿' },
  { type: '管辖地', level: '低', re: /(争议|纠纷)[^。；\n]{0,15}(仲裁|起诉|法院)[^。；\n]{0,15}(甲方|房东|出租方)[^。；\n]{0,6}(所在地)/, reason: '管辖地约定在房东所在地，异地维权成本高', suggestion: '争取约定为房屋所在地或被告所在地法院管辖' }
]

const LEVEL_ORDER = { 高: 0, 中: 1, 低: 2 }

// 规则扫描，返回结构化风险
function scanByRules(text) {
  if (!text || text.length < 10) return []
  const found = []
  RISK_RULES.forEach((rule) => {
    if (rule.re.test(text)) {
      const m = text.match(rule.re)
      const idx = m.index
      const excerpt = text.slice(Math.max(0, idx - 10), Math.min(text.length, idx + 50)).replace(/\s+/g, ' ')
      found.push({
        type: rule.type, level: rule.level,
        excerpt: '…' + excerpt + '…',
        reason: rule.reason, suggestion: rule.suggestion, source: 'rule'
      })
    }
  })
  // 同类去重（保留最严重）
  const seen = {}
  return found.filter((c) => {
    if (seen[c.type] && LEVEL_ORDER[seen[c.type]] <= LEVEL_ORDER[c.level]) return false
    seen[c.type] = c.level
    return true
  })
}

// 合并 LLM 结果与规则结果（同类去重，规则兜底）
function mergeResults(aiClauses, ruleClauses) {
  const map = {}
  ruleClauses.concat(aiClauses).forEach((c) => {
    if (!map[c.type] || LEVEL_ORDER[c.level] < LEVEL_ORDER[map[c.type].level]) map[c.type] = c
  })
  return Object.keys(map).map((k) => map[k]).sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
}

function summarize(clauses) {
  return {
    riskCount: clauses.length,
    highCount: clauses.filter((c) => c.level === '高').length,
    midCount: clauses.filter((c) => c.level === '中').length,
    lowCount: clauses.filter((c) => c.level === '低').length
  }
}

module.exports = { RISK_RULES, scanByRules, mergeResults, summarize, LEVEL_ORDER }
