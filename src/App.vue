<script>
/**
 * ==========================================
 * COMPONENT: App.vue
 * ==========================================
 * Description:
 * The root component of the application. Provides the main layout
 * structure including the navigation, footer, and the router view
 * which dynamically loads each page component.
 */

// Import our shared layout components
import AppNavBar from './components/shared/AppNavBar.vue'
import AppFooter from './components/shared/AppFooter.vue'

export default {
  name: 'App',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    AppNavBar,
    AppFooter,
  },
}
</script>

<template>
  <!-- Explanation: Main application container ensuring footer stays at the bottom -->
  <div class="d-flex flex-column min-vh-100">
    <!-- Shared Top Navigation -->
    <AppNavBar />

    <!-- Dynamically loaded page content based on current route -->
    <main class="flex-grow-1">
      <router-view />
    </main>

    <!-- Shared Footer -->
    <AppFooter />
  </div>
</template>

<style>
/* Explanation: Centralised modern typography imports for the whole project. */
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Zilla+Slab:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
</style>
