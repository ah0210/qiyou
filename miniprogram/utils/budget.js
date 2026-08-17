// utils/budget.js —— 预算测算（分项求和=总额，防幻觉）
function calcBudget(city, role, months) {
  const mo = Number(months) || 1
  const items = [
    { name: '租房', value: Math.round(city.cost.rent1b * mo) },
    { name: '餐饮', value: Math.round(city.cost.meal * mo) },
    { name: '交通', value: Math.round(city.cost.transport * mo) },
    { name: '其他', value: Math.round(300 * mo) }
  ]
  if (role === 'nomad') items.splice(3, 0, { name: '共享办公', value: Math.round(city.cost.cowork * mo) })
  const total = items.reduce((s, i) => s + i.value, 0)
  return { city: city.name, months: mo, items, total, monthly: Math.round(total / mo) }
}

module.exports = { calcBudget }
