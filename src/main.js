import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// REMOVED: import 'bootstrap' (No conflicting vanilla JS)

// Styling: Base Colors
import './assets/base.scss'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { lazyLoad } from './directives/lazyLoad.js'

const app = createApp(App)

// Deferred event listener attachment prevents instant event bubbling bugs
app.directive('click-outside', {
  mounted(el, binding) {
    el.__clickOutside__ = (e) => {
      // If the clicked target is not the element itself or its children, trigger the bound function
      if (!el.contains(e.target)) {
        binding.value(e)
      }
    }
    // Defer attaching the listener to the next tick so the opening click isn't caught
    setTimeout(() => {
      document.addEventListener('click', el.__clickOutside__)
    }, 0)
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
