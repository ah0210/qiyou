// components/score-radar/index.js —— 六维雷达图（Canvas 2d，零依赖）
const { DIMS, DIM_LABEL } = require('../../utils/match')

Component({
  properties: {
    scoreDetail: { type: Object, value: {} },
    size: { type: Number, value: 300 }
  },
  data: { labels: DIMS.map((d) => DIM_LABEL[d]) },
  lifetimes: {
    ready() {
      this.draw()
    }
  },
  observers: {
    scoreDetail() { this.draw() }
  },
  methods: {
    draw() {
      const { scoreDetail, size } = this.data
      if (!scoreDetail || !Object.keys(scoreDetail).length) return
      const query = this.createSelectorQuery()
      query.select('#radar').fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) return
        const canvas = res[0].node
        const dpr = wx.getSystemInfoSync().pixelRatio || 2
        canvas.width = size * dpr
        canvas.height = size * dpr
        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)

        const cx = size / 2, cy = size / 2, r = size / 2 - 30
        const n = DIMS.length
        const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2

        const values = DIMS.map((d) => Math.max(0, Math.min(100, scoreDetail[d] || 60)))

        // 网格（5 层）
        for (let ring = 1; ring <= 5; ring++) {
          ctx.beginPath()
          for (let i = 0; i < n; i++) {
            const rr = (r * ring) / 5
            const x = cx + Math.cos(angle(i)) * rr
            const y = cy + Math.sin(angle(i)) * rr
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.strokeStyle = '#e5eae7'
          ctx.stroke()
        }

        // 轴线
        for (let i = 0; i < n; i++) {
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r)
          ctx.strokeStyle = '#e5eae7'
          ctx.stroke()
        }

        // 数据多边形
        ctx.beginPath()
        for (let i = 0; i < n; i++) {
          const rr = (r * values[i]) / 100
          const x = cx + Math.cos(angle(i)) * rr
          const y = cy + Math.sin(angle(i)) * rr
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fillStyle = 'rgba(47, 107, 79, 0.25)'
        ctx.fill()
        ctx.strokeStyle = '#2f6b4f'
        ctx.lineWidth = 2
        ctx.stroke()

        // 标签
        ctx.fillStyle = '#1f2a25'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        for (let i = 0; i < n; i++) {
          const lr = r + 22
          const x = cx + Math.cos(angle(i)) * lr
          const y = cy + Math.sin(angle(i)) * lr
          ctx.fillText(DIM_LABEL[DIMS[i]], x, y)
        }
      })
    }
  }
})
