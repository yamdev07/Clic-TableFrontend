import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Toaster } from 'vue-sonner'

import App from './App.vue'
import router from './router'
import './assets/skeleton.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Toaster est un composant, pas un plugin
app.component('Toaster', Toaster)

app.mount('#app')