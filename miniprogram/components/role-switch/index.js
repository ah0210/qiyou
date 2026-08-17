// components/role-switch/index.js —— 身份切换器
const { store, ROLES } = require('../../utils/store')

Component({
  data: { roles: Object.values(ROLES), active: store.get('role') },
  methods: {
    onSelect(e) {
      const role = e.currentTarget.dataset.role
      store.setRole(role)
      this.setData({ active: role })
      this.triggerEvent('change', { role })
    }
  }
})
