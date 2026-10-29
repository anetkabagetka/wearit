import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { applyTheme, savedTheme } from './utils/theme'

// Start in the theme used last time on this device, so a dark page doesn't flash white while loading
applyTheme(savedTheme())

const app = createApp(App)

app.use(router)

app.mount('#app')
