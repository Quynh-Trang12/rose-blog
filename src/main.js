/**
 * ==========================================
 * FILE: main.js
 * ==========================================
 * Description:
 * Application entry point. Creates the Vue 3 app instance, registers
 * the Vuex store, Vue Router, and custom directives (v-click-outside,
 * v-lazy-load), then mounts the application to the #app DOM element.
 */

import { createApp } from 'vue'
import store from './store/index.js'
import App from './App.vue'
import router from './router'

// ==========================================
// STYLING
// ==========================================
// Import the compiled SCSS base file which includes
// Bootstrap 5 SCSS source with custom overrides, mixins, and utilities.
import './assets/base.scss'
import 'bootstrap-icons/font/bootstrap-icons.css'

// ==========================================
// DIRECTIVES
// ==========================================
import { lazyLoad } from './directives/lazyLoad.js'

const app = createApp(App)

// v-click-outside directive detects clicks outside the
// bound element and invokes the provided callback. A deferred event
// listener attachment (setTimeout 0) prevents the opening click event
// from immediately triggering the handler via event bubbling.
app.directive('click-outside', {
  mounted(el, binding) {
    el.__clickOutside__ = (e) => {
      // If the click target is not the element or any of its
      // descendants, execute the bound handler function.
      if (!el.contains(e.target)) {
        binding.value(e)
      }
    }
    // Defer to the next microtask so the opening click
    // (which triggered this mount) does not immediately fire the handler.
    setTimeout(() => {
      document.addEventListener('click', el.__clickOutside__)
    }, 0)
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutside__)
  },
})

// v-lazy-load directive implements IntersectionObserver-based
// lazy loading for images — sets a placeholder SVG and swaps to the real
// src when the element enters the viewport.
app.directive('lazy-load', lazyLoad)

// ==========================================
// REGISTER PLUGINS & MOUNT
// ==========================================
// Register the root Vuex store instance.
app.use(store)
// Register Vue Router for client-side navigation.
app.use(router)

// Mount the application to the DOM element with id="app".
app.mount('#app')
