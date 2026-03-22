<script setup>
// Import the RouterView component to display our page routes
import { RouterView } from 'vue-router'

// Import our shared layout components
import AppNavBar from './components/shared/AppNavBar.vue'
import AppFooter from './components/shared/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen d-flex flex-column">
    <AppNavBar />

    <main class="grow">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<style>
/* Keep this empty because the importing of global style.css
  and the Bootstrap grid system directly in main.js.
*/
</style>
