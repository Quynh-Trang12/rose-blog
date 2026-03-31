import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'bootstrap'

// Styling: Base Colors
import './assets/base.scss'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { lazyLoad } from './directives/lazyLoad.js'

const app = createApp(App)

app.directive('click-outside', {
  mounted(el, binding) {
    el.__clickOutside__ = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('click', el.__clickOutside__)
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutside__)
  },
})

// v-lazy-load (new)
app.directive('lazy-load', lazyLoad)

app.use(createPinia())
app.use(router)

app.mount('#app')
