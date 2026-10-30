import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { applyTheme, savedTheme } from './utils/theme'
import { reloadForNewVersion } from './utils/newVersion'

// Start in the theme used last time on this device, so a dark page doesn't flash white while loading
applyTheme(savedTheme())

// Vite sends this when a file a page needs couldn't be loaded, usually after a new deploy.
// preventDefault stops the error, and the page reloads with the new version instead
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewVersion()) {
    event.preventDefault()
  }
})

const app = createApp(App)

app.use(router)

app.mount('#app')
