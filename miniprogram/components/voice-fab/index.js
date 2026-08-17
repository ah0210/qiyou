// components/voice-fab/index.js —— 语音悬浮球（长按说话 / 点击 TTS）
const voice = require('../../utils/voice')
const { store } = require('../../utils/store')

Component({
  properties: {
    autoReadText: { type: String, value: '' }
  },
  data: { recording: false, listening: false },
  methods: {
    onTap() {
      if (this.properties.autoReadText) {
        voice.speak(this.properties.autoReadText)
      } else if (!this.data.recording) {
        this.startRecord()
      }
    },
    onTouchStart() { this.startRecord() },
    onTouchEnd() { this.stopRecord() },

    startRecord() {
      if (this.data.recording) return
      this.setData({ recording: true, listening: true })
      voice.record().then((text) => {
        this.setData({ recording: false, listening: false })
        if (text) this.triggerEvent('result', { text })
      })
    },
    stopRecord() {
      voice.stopRecord()
    }
  }
})
