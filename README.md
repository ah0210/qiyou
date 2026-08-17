# 栖游（Qiyou）—— AI 旅居康养一体化微信小程序

> 2026 微信小程序开发大赛参赛作品 · 主题「与 AI 共生」
> Slogan：一人一栖迟

栖游是一款面向**数字游民、短期旅居者、康养长者**三类人群的 AI 旅居决策助手。用户输入预算与需求，系统通过「确定性算法 + 大模型语言组织」双通道，给出城市推荐、房源匹配、预算测算、合同风险筛查、政策问答与兴趣结伴服务。

## 一、核心亮点

1. **端云同构（机制而非纪律）**
   打分/合同/种子数据的权威源集中在 `cloudfunctions/_shared/`，通过 `scripts/sync-shared.js` 自动分发到各云函数与端侧，并以 diff 硬校验保证端云算法一致，根治「多份漂移」。

2. **三段式 AI 匹配防幻觉**
   硬约束筛（预算 10% 弹性）→ 六维加权评分（权重随身份变）→ 方案生成。LLM 只做语言组织、**不产生任何数字**，未开通密钥时静默降级为规则模板。

3. **零配置评审演示**
   `config/env.js` 的 `cloudEnvId` 留空时，全部云函数自动降级到 `mock/functions.js`，无需部署即可完整演示全部功能。

4. **适老化产品级**
   康养身份自动开启大字模式（`theme--elder`），语音问答、家属绑定、一键 SOS 呼叫，配套无障碍设施筛选。

## 二、技术栈

- **前端**：微信原生小程序（主包 6 页 + 5 分包 14 页，共 20 页面）
- **后端**：微信云开发（11 云函数：login / city / house / aiMatch / aiChat / aiContract / family / community / companion / policy / analytics / seedData）
- **AI**：端侧官方 `wx.cloud.extend.AI`（hy3-preview）+ 确定性规则引擎双通道
- **语音**：微信同声传译插件 WechatSI（未授权安全降级）

## 三、目录结构

```
qiyou/
├── miniprogram/          # 小程序前端
│   ├── pages/            # 主包 6 页（onboarding/index/city/house-list/ai-chat/profile）
│   ├── packages/         # 5 分包（ai/city/house/community/senior）
│   ├── components/       # score-radar / voice-fab / role-switch
│   ├── utils/            # match/contract/budget/companion/llm/store/cloud/voice/theme/tracker
│   ├── mock/             # 本地降级数据与函数实现
│   ├── config/env.js     # 唯一环境出口
│   ├── app.js / app.json / app.wxss
├── cloudfunctions/       # 云函数
│   ├── _shared/          # ★ 单一权威源（scoreCore/riskCore/seedData）
│   └── <各云函数>/_shared/  # 由 sync-shared.js 自动分发
├── scripts/              # 工程化脚本（零依赖 Node）
│   ├── sync-shared.js    # 端云同步 + 硬校验
│   ├── selftest.js       # 核心算法自测（19 项断言）
│   ├── check-syntax.js   # 递归语法检查（跨平台）
│   ├── audit-wx.js       # 微信运行期专项审计
│   ├── verify-pages.js   # 组件引用校验
│   └── verify-routes.js  # 路由跳转校验
├── docs/                 # 技术架构方案 / 页面路由与原型逻辑
├── project.config.json
└── package.json
```

## 四、快速开始

### 方式 A：本地工程化自检（推荐，Node ≥ 16）

```bash
npm run sync        # 端云同步 + 硬校验
npm run check       # 递归语法检查
npm run test        # 核心算法自测（19 项）
npm run audit:wx    # 微信运行期专项审计
npm run all         # 一键全量检查（sync → check → audit → verify → test）
```

### 方式 B：零配置评审演示（无需部署）

1. 用微信开发者工具打开本目录
2. `miniprogram/config/env.js` 的 `cloudEnvId` 保持留空（默认）
3. 编译运行即可体验全部功能（AI 匹配 / 合同筛查 / 政策问答 / 结伴 / 家属绑定）

### 方式 C：接入真实云开发 + AI

1. 在 `config/env.js` 填入云开发环境 ID
2. 微信开发者工具中，右键 `cloudfunctions/` 各函数 → 上传并部署（顺序：login → city → house → seedData → aiMatch → aiChat → aiContract → family → community → companion → policy → analytics）
3. 部署 `seedData` 云函数并手动触发一次，导入种子数据
4. 配置云函数环境变量：
   - `TENCENT_SECRET_ID` / `TENCENT_SECRET_KEY`（腾讯混元密钥）
   - `HUNYUAN_MODEL`（默认 hunyuan-turbo）
   - `SOS_TMPL_ID`（订阅消息模板，用于 SOS 推送）
   - `AI_FALLBACK_ONLY=1`（应急开关，强制走规则引擎）

## 五、测试与质量保障

| 脚本 | 作用 | 通过标准 |
|------|------|---------|
| `selftest.js` | 评分权重/三身份差异化/预算自洽/合同引擎/端云同构 | 19 项全绿 |
| `check-syntax.js` | 递归 `node --check` 全部 JS | 0 语法错误 |
| `audit-wx.js` | Tab 页跳转/switchTab 带参/页面四件套 | 0 违规 |
| `verify-pages.js` | usingComponents 引用存在性 | 0 缺失 |
| `verify-routes.js` | 跳转目标已注册 | 0 缺失 |

## 六、诚实声明

> 本项目全部 WXML / Canvas / 云函数逻辑已通过本地脚本自动化校验，但**尚未在微信开发者工具真实编译与真机运行验证**；腾讯混元 / 同声传译插件 / 订阅消息尚未用真实密钥联调。请以真机实测为准。

## 七、免责

- 城市数据为公开统计资料人工整理，仅供演示，标注 `dataSource` 来源声明
- 合同风险筛查仅作风险提示，**不构成法律意见**
- AI 生成内容仅供参考，不构成医疗/法律建议
