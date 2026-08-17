// cloudfunctions/_shared/seedData.js —— 种子数据（单一权威源）
// 由 scripts/sync-shared.js 分发到各云函数 + 生成 miniprogram/mock/data.js
// 数据来自公开统计资料人工整理，仅供演示，标注 dataSource 来源声明

const CITIES = [
  { _id: 'c_dali', name: '大理', province: '云南', tags: ['暖和', '慢节奏', '游民聚集', '风景'],
    scoreDetail: { cost: 90, medical: 72, climate: 92, network: 80, senior: 78, life: 88 },
    cost: { rent1b: 1200, meal: 900, transport: 150, cowork: 300, totalMonthly: 2550 },
    desc: '四季如春，苍山洱海，游民社区成熟', dataSource: '公开统计资料人工整理' },
  { _id: 'c_kunming', name: '昆明', province: '云南', tags: ['暖和', '医疗较强', '低物价', '康养'],
    scoreDetail: { cost: 88, medical: 85, climate: 90, network: 82, senior: 86, life: 84 },
    cost: { rent1b: 1500, meal: 950, transport: 180, cowork: 280, totalMonthly: 2910 },
    desc: '春城，三甲医院多，适合康养长居', dataSource: '公开统计资料人工整理' },
  { _id: 'c_beihai', name: '北海', province: '广西', tags: ['海景', '暖和', '低物价', '过冬'],
    scoreDetail: { cost: 92, medical: 68, climate: 88, network: 70, senior: 80, life: 76 },
    cost: { rent1b: 1000, meal: 800, transport: 120, cowork: 200, totalMonthly: 2120 },
    desc: '滨海康养小城，生活成本低', dataSource: '公开统计资料人工整理' },
  { _id: 'c_chengdu', name: '成都', province: '四川', tags: ['美食', '医疗强', '生活便利', '三甲'],
    scoreDetail: { cost: 82, medical: 92, climate: 75, network: 88, senior: 85, life: 92 },
    cost: { rent1b: 1800, meal: 1100, transport: 200, cowork: 350, totalMonthly: 3450 },
    desc: '医疗资源顶尖，生活气息浓厚', dataSource: '公开统计资料人工整理' },
  { _id: 'c_zhuhai', name: '珠海', province: '广东', tags: ['海景', '宜居', '空气质量好', '康养'],
    scoreDetail: { cost: 75, medical: 88, climate: 86, network: 85, senior: 87, life: 86 },
    cost: { rent1b: 2200, meal: 1200, transport: 200, cowork: 300, totalMonthly: 3900 },
    desc: '百岛之市，宜居康养，环境宜人', dataSource: '公开统计资料人工整理' },
  { _id: 'c_hangzhou', name: '杭州', province: '浙江', tags: ['数字游民', '电商', '风景', '创业'],
    scoreDetail: { cost: 70, medical: 90, climate: 78, network: 95, senior: 84, life: 90 },
    cost: { rent1b: 2600, meal: 1300, transport: 220, cowork: 400, totalMonthly: 4520 },
    desc: '数字经济之都，创业氛围浓，配套完善', dataSource: '公开统计资料人工整理' },
  { _id: 'c_sanya', name: '三亚', province: '海南', tags: ['海景', '过冬', '候鸟', '温暖'],
    scoreDetail: { cost: 65, medical: 75, climate: 95, network: 75, senior: 82, life: 80 },
    cost: { rent1b: 3000, meal: 1400, transport: 200, cowork: 350, totalMonthly: 4950 },
    desc: '热带海滨，冬季候鸟首选，度假康养', dataSource: '公开统计资料人工整理' },
  { _id: 'c_xishuangbanna', name: '西双版纳', province: '云南', tags: ['温暖', '过冬', '异域风情', '康养'],
    scoreDetail: { cost: 85, medical: 65, climate: 93, network: 68, senior: 79, life: 78 },
    cost: { rent1b: 1300, meal: 850, transport: 130, cowork: 250, totalMonthly: 2530 },
    desc: '热带雨林，四季温暖，候鸟过冬地', dataSource: '公开统计资料人工整理' }
]

const HOUSINGS = [
  { _id: 'h1', cityId: 'c_dali', cityName: '大理', type: 'nomad', title: '大理古城数字游民公寓', priceMin: 1500, priceMax: 2600, priceUnit: '月', tags: ['千兆宽带', '共享办公', '短租可'], facilities: { wifi: true, cowork: true, kitchen: true }, desc: '带工位与社群，步行到古城' },
  { _id: 'h2', cityId: 'c_kunming', cityName: '昆明', type: 'wellness', title: '滇池康养公寓', priceMin: 3200, priceMax: 5000, priceUnit: '月', tags: ['电梯', '无障碍', '医护站'], accessible: { elevator: true, ramp: true, grabBar: true, emergencyCall: true }, facilities: { medicalStation: true, meal: true }, desc: '24 小时医护站，适老化改造' },
  { _id: 'h3', cityId: 'c_beihai', cityName: '北海', type: 'short', title: '银滩海景短租套房', priceMin: 120, priceMax: 200, priceUnit: '日', tags: ['海景', '可做饭', '7天起租'], facilities: { wifi: true, kitchen: true }, desc: '推窗见海，适合冬季短住' },
  { _id: 'h4', cityId: 'c_chengdu', cityName: '成都', type: 'wellness', title: '温江医养结合社区', priceMin: 4000, priceMax: 6500, priceUnit: '月', tags: ['医养结合', '康复室', '紧急呼叫'], accessible: { elevator: true, ramp: true, grabBar: true, emergencyCall: true }, facilities: { medicalStation: true, meal: true }, desc: '毗邻三甲医院，康复护理齐全' },
  { _id: 'h5', cityId: 'c_zhuhai', cityName: '珠海', type: 'wellness', title: '珠海情侣路海景康养公寓', priceMin: 3500, priceMax: 5500, priceUnit: '月', tags: ['海景', '电梯', '适老'], accessible: { elevator: true, ramp: true, grabBar: true }, facilities: { medicalStation: true, meal: true }, desc: '海景房，适老化设施齐全' },
  { _id: 'h6', cityId: 'c_hangzhou', cityName: '杭州', type: 'nomad', title: '杭州滨江创业谷公寓', priceMin: 2800, priceMax: 4500, priceUnit: '月', tags: ['千兆宽带', '共享办公', '创业社群'], facilities: { wifi: true, cowork: true, kitchen: true }, desc: '数字经济核心区，创业者聚集' },
  { _id: 'h7', cityId: 'c_sanya', cityName: '三亚', type: 'short', title: '三亚湾候鸟短租公寓', priceMin: 250, priceMax: 400, priceUnit: '日', tags: ['海景', '过冬', '拎包入住'], facilities: { wifi: true, kitchen: true }, desc: '冬季候鸟过冬，月租可谈' },
  { _id: 'h8', cityId: 'c_xishuangbanna', cityName: '西双版纳', type: 'short', title: '景洪热带康养短租', priceMin: 150, priceMax: 260, priceUnit: '日', tags: ['温暖', '过冬', '可做饭'], facilities: { wifi: true, kitchen: true }, desc: '热带气候，适合冬季旅居' }
]

const POLICIES = [
  { _id: 'p_medical', type: 'medical', title: '异地就医直接结算', city: '全国通用', content: '参保人先在国家医保服务平台 App 办理异地就医备案，在就医地定点医院持医保凭证直接结算，执行就医地目录、参保地政策。', source: '国家医保局', year: 2025 },
  { _id: 'p_residence', type: 'residence', title: '居住登记与居住证', city: '全国通用', content: '在其他城市居住半年以上，符合合法稳定就业、住所、连续就读之一的，可申领居住证，享受基本公共服务。', source: '居住证暂行条例', year: 2025 },
  { _id: 'p_social', type: 'socialsecurity', title: '灵活就业人员社保', city: '全国通用', content: '灵活就业人员可在就业地或户籍地以个人身份参加职工养老与医疗保险，多地已放开户籍限制。', source: '人社部', year: 2025 },
  { _id: 'p_elder', type: 'elder', title: '老年人优待政策', city: '全国通用', content: '部分城市 60 岁以上老人享公交/景区优惠，具体以当地政策为准。', source: '各地政府公开政策', year: 2025 }
]

module.exports = { CITIES, HOUSINGS, POLICIES }
