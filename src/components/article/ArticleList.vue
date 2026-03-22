<script setup>
import ArticleListItem from './ArticleListItem.vue'

defineProps({
  articles: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <aside class="d-flex flex-column h-100 w-100">
    <div class="d-flex align-items-center gap-3 mb-4 border-bottom border-dark pb-2">
      <h2 class="h3 fw-bold mb-0 text-dark">Latest Publications</h2>
    </div>

    <div class="d-flex flex-column justify-content-between flex-grow-1 gap-4">
      <ArticleListItem
        v-for="article in articles"
        :key="article.id"
        :item="article"
      />
    </div>
  </aside>
</template>
