<script setup>
// Import the RouterView component to display our page routes
import { RouterView } from 'vue-router'

// Import our shared layout components
import AppNavBar from './components/shared/AppNavBar.vue'
import AppFooter from './components/shared/AppFooter.vue'
</script>

<template>
  <div class="d-flex flex-column">
    <AppNavBar />

    <main>
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Zilla+Slab:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
</style>
