// config/env.js —— 唯一环境出口（部署时只需改这里）
// cloudEnvId 留空 → 全量走本地 mock（零配置评审演示模式）
// 填入云开发环境 ID → 走真实云函数

const env = {
  // 云开发环境 ID（部署时替换；留空则 useCloud=false，全量本地 mock）
  cloudEnvId: '',

  // 同声传译插件 provider（固定值，需后台添加授权）
  wechatSIProvider: 'wx069ba97219f66d99',

  // 端侧 LLM 模型（官方 wx.cloud.extend.AI，共享 Token 配额包内置）
  aiModel: 'hy3-preview',

  // AI 提示词版本（写入 ai_logs 满足 AI 可追溯）
  promptVersion: 'v1.0.0',

  // 是否使用云开发（由 cloudEnvId 是否为空决定）
  get useCloud() {
    return !!(this.cloudEnvId && this.cloudEnvId.trim())
  }
}

module.exports = env
