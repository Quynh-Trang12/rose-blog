<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  article: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="d-flex flex-column h-100 w-100">
    <div class="d-flex align-items-center gap-3 mb-4 border-bottom border-dark pb-2">
      <h2 class="h3 fw-bold mb-0 text-dark">Featured Profile</h2>
    </div>

    <div class="card border-0 rounded-4 overflow-hidden shadow position-relative flex-grow-1 bg-dark min-vh-50">
      <img
        :src="article.imageUrl"
        :alt="`Photograph of ${article.title}`"
        class="position-absolute w-100 h-100 object-fit-cover"
        style="opacity: 0.65;"
      >

      <div class="position-relative mt-auto w-100 p-4 p-md-5 z-1" style="background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);">
        <h3 class="text-white fw-bold display-6 mb-3">{{ article.title }}</h3>
        <p class="text-white fs-5 mb-4 fw-medium" style="max-width: 550px;">{{ article.description }}</p>

        <RouterLink
          :to="article.link"
          class="btn btn-light rounded-pill px-4 fw-bold text-dark"
          :aria-label="`Read full guide about ${article.title}`"
        >
          Read Full Guide
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.object-fit-cover { object-fit: cover; }
.min-vh-50 { min-height: 50vh; }
</style>
