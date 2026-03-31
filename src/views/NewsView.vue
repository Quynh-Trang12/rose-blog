<script setup>
import { ref } from 'vue'
import { useNewsStore } from '@/stores/newsStore'
import { useAuthStore } from '@/stores/authStore'
import NewsCard from '@/components/news/NewsCard.vue'
import NewsCreateBar from '@/components/news/NewsCreateBar.vue'
import NewsSearchBar from '@/components/news/NewsSearchBar.vue'

const newsStore = useNewsStore()
const authStore = useAuthStore()

const showFilterModal = ref(false)

const isOwner = (item) => {
  return authStore.currentUser && authStore.currentUser.displayName === item.authorName
}

const handlePageChange = (page) => {
  if (page >= 1 && page <= newsStore.totalPages) {
    newsStore.setPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="position-relative min-vh-100 py-5">
    <!-- Background Layer -->
    <div class="news-bg-layer position-fixed top-0 start-0 w-100 h-100" aria-hidden="true"></div>

    <div class="container position-relative z-1 pt-4">
      <!-- Header Row -->
      <div class="d-flex justify-content-between align-items-start mb-5">
        <div>
          <h1
            class="display-4 fw-bold fst-italic mb-1"
            style="font-family: 'Zilla Slab'; color: #333"
          >
            News
          </h1>
          <p class="text-muted text-md fw-normal mb-0" style="font-family: 'Roboto Condensed'">
            Stories, rituals, and inspirations from the world of roses.
          </p>
        </div>

        <!-- FLOATING SEARCH BUBBLE -->
        <div class="d-flex flex-column align-items-center gap-1 position-relative">
          <p class="text-muted text-xs fst-italic mb-1" style="font-family: 'Zilla Slab'">
            Click to<br />Search & Filter
          </p>
          <button
            class="search-bubble frosted-glass border-0 shadow-lg d-flex align-items-center justify-content-center"
            @click.stop="showFilterModal = true"
            aria-label="Open search and filter panel"
            :aria-expanded="showFilterModal"
          >
            <span class="material-symbols-outlined fs-3 text-dark">search</span>
          </button>
        </div>
      </div>

      <!-- Create Bar -->
      <NewsCreateBar v-if="authStore.isLoggedIn" class="mb-4" />

      <!-- News Feed -->
      <div class="news-columns" v-if="newsStore.paginatedArticles.length > 0">
        <div class="news-card-wrapper" v-for="item in newsStore.paginatedArticles" :key="item.id">
          <NewsCard
            :item="item"
            :is-authed="authStore.isLoggedIn"
            :is-owner="isOwner(item)"
            @react="newsStore.reactToArticle"
            @comment="newsStore.addComment"
            @share="newsStore.incrementShare"
            @edit="newsStore.updateArticle"
            @delete="newsStore.deleteArticle"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5 animate-fade-up">
        <span class="material-symbols-outlined fs-1 text-muted d-block mb-2">search_off</span>
        <p class="text-muted fst-italic text-lg">No articles match your search.</p>
        <button
          class="btn btn-sm btn-outline-primary rounded-pill mt-2 fw-medium"
          @click="newsStore.clearFilters()"
        >
          Clear Filters
        </button>
      </div>

      <!-- Pagination -->
      <nav
        v-if="newsStore.totalPages > 1"
        class="d-flex justify-content-center mt-5 mb-5 align-items-center"
        aria-label="News pagination"
      >
        <div
          class="d-flex gap-2 align-items-center frosted-glass rounded-pill p-2 shadow-sm border border-light bg-white bg-opacity-50"
        >
          <button
            class="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm hover-scale transition-base"
            style="width: 36px; height: 36px"
            :disabled="newsStore.currentPage === 1"
            aria-label="Previous page"
            @click="handlePageChange(newsStore.currentPage - 1)"
          >
            <span class="material-symbols-outlined fs-5">chevron_left</span>
          </button>

          <div class="d-flex gap-1 px-2">
            <button
              v-for="page in newsStore.totalPages"
              :key="page"
              class="btn btn-sm rounded-circle fw-bold transition-base d-flex align-items-center justify-content-center border-0"
              style="width: 36px; height: 36px"
              :class="
                newsStore.currentPage === page
                  ? 'btn-primary shadow-sm text-white'
                  : 'text-dark hover-bg-light'
              "
              @click="handlePageChange(page)"
              :aria-current="newsStore.currentPage === page ? 'page' : null"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm hover-scale transition-base"
            style="width: 36px; height: 36px"
            :disabled="newsStore.currentPage === newsStore.totalPages"
            aria-label="Next page"
            @click="handlePageChange(newsStore.currentPage + 1)"
          >
            <span class="material-symbols-outlined fs-5">chevron_right</span>
          </button>
        </div>
      </nav>
    </div>

    <!-- Filter Modal component -->
    <NewsSearchBar v-model="showFilterModal" />
  </div>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/variables-dark';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';
@import 'bootstrap/scss/utilities';

.news-bg-layer {
  z-index: -1;
  background-image: url('@/assets/images/image5.jpg');
  background-size: cover;
  background-position: center;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(#fffcd8, 0.52);
  }
}

.search-bubble {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 32px rgba($pink, 0.25) !important;
  }
}

.news-columns {
  columns: 2;
  column-gap: 1.25rem;

  @include media-breakpoint-down(md) {
    columns: 1;
  }
}

.news-columns .news-card-wrapper {
  break-inside: avoid;
  display: inline-block;
  width: 100%;
  margin-bottom: 1.25rem;

  /* Safari fix */
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
}

.hover-bg-light:hover {
  background-color: var(--bs-gray-200);
}

.transition-base {
  transition: all 0.2s ease-in-out;
}

.hover-scale {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.hover-scale:hover:not(:disabled) {
  transform: scale(1.1);
}
</style>
