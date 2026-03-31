<script setup>
import { computed } from 'vue'
import { useNewsStore } from '@/stores/newsStore'
import { useAuthStore } from '@/stores/authStore'

const newsStore = useNewsStore()
const authStore = useAuthStore()

const stats = computed(() => ({
  total: newsStore.articles.length,
  public: newsStore.articles.filter((a) => a.isPublic).length,
  private: newsStore.articles.filter((a) => !a.isPublic).length,
  categories: [...new Set(newsStore.articles.map((a) => a.category))],
}))
</script>

<template>
  <div class="container py-5 animate-fade-up">
    <div class="mb-5">
      <h1 class="display-5 fw-bold fst-italic mb-1" style="font-family:'Zilla Slab';color:#333">
        Admin Panel
      </h1>
      <p class="text-muted fw-normal mb-0" style="font-family:'Roboto Condensed'">
        Logged in as <strong>{{ authStore.currentUser?.displayName }}</strong>
        <span class="badge bg-primary rounded-pill ms-2 text-xs">Admin</span>
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="row g-4 mb-5">
      <div class="col-6 col-md-3" v-for="(val, key) in {
        'Total Posts': stats.total,
        'Public': stats.public,
        'Private': stats.private,
        'Categories': stats.categories.length
      }" :key="key">
        <div class="card border-0 rounded-4 shadow-sm frosted-glass text-center p-4 h-100">
          <div class="display-6 fw-bolder text-primary mb-1">{{ val }}</div>
          <div class="text-muted text-sm fw-semibold text-uppercase ls-1">{{ key }}</div>
        </div>
      </div>
    </div>

    <!-- Article Management Table -->
    <div class="card border-0 rounded-4 shadow-sm frosted-glass p-4">
      <h2 class="h5 fw-bold mb-4" style="font-family:'Zilla Slab';font-style:italic">All Articles</h2>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="text-uppercase text-xs ls-1 text-muted">
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in newsStore.articles" :key="article.id">
              <td class="fw-semibold text-dark" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {{ article.title }}
              </td>
              <td class="text-muted text-sm">{{ article.authorName }}</td>
              <td>
                <span class="badge rounded-pill glassmorphism-pink text-primary text-xs px-2 py-1 fw-bold">
                  {{ article.category }}
                </span>
              </td>
              <td>
                <span class="material-symbols-outlined text-sm" :class="article.isPublic ? 'text-success' : 'text-muted'">
                  {{ article.isPublic ? 'public' : 'lock' }}
                </span>
              </td>
              <td>
                <button
                  class="btn btn-sm btn-outline-danger rounded-pill px-3"
                  @click="newsStore.deleteArticle(article.id)"
                >
                  <span class="material-symbols-outlined" style="font-size:1rem">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
