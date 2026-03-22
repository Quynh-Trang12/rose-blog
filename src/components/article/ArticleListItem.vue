<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="card border-0 bg-transparent h-100">
    <RouterLink
      :to="item.link"
      class="text-decoration-none text-dark d-block h-100 p-2 rounded-4 hover-bg transition-all"
      :aria-label="`Read article: ${item.title}`"
    >
      <div class="row g-0 align-items-center h-100">
        <div class="col-4 col-sm-3 h-100 overflow-hidden rounded-3 shadow-sm" style="min-height: 120px;">
          <img :src="item.imageUrl" :alt="`Thumbnail for ${item.title}`" class="w-100 h-100 object-fit-cover">
        </div>
        <div class="col-8 col-sm-9 ps-4">
          <p class="fw-bolder mb-1 text-uppercase" style="font-size: 0.75rem; color: #9e0026; letter-spacing: 1px;" aria-hidden="true">
            {{ item.category }}
          </p>
          <h3 class="h5 fw-bold text-dark mb-1">{{ item.title }}</h3>
          <p class="small mb-0 fw-medium" style="color: #343a40;">{{ item.description }}</p>
        </div>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.object-fit-cover { object-fit: cover; }
.hover-bg:hover { background-color: #f8f9fa !important; }
.transition-all { transition: all 0.2s ease-in-out; }
</style>
