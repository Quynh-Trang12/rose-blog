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

// METHODS
/**
 * Checks if the current user owns the news item or is an admin.
 * @param {Object} item - The news item object
 * @returns {boolean} True if the user has owner privileges
 */
const isOwner = (item) => {
  if (!authStore.currentUser) return false
  if (authStore.isAdmin) return true // Admins own everything
  return authStore.currentUser.displayName === item.authorName
}

/**
 * Handles page navigation and scrolls to top smoothly.
 * @param {number} page - The target page number
 */
const handlePageChange = (page) => {
  if (page >= 1 && page <= newsStore.totalPages) {
    newsStore.setPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * Dynamically assigns layout A, B, or C based on the loop index.
 * @param {number} index - The current index in the v-for loop
 * @returns {string} Layout identifier ('A', 'B', or 'C')
 */
const getDynamicLayout = (index) => {
  if (index % 5 === 0) return 'C'
  if (index % 4 === 0) return 'B'
  return 'A'
}
</script>

<template>
  <div class="news-view position-relative min-vh-100 py-5">
    <div
      class="news-view__bg-layer position-fixed top-0 start-0 w-100 h-100"
      aria-hidden="true"
    ></div>

    <div class="container position-relative z-1 pt-4">
      <div class="d-flex justify-content-between align-items-start mb-5 animate-fade-up">
        <div>
          <h1 class="news-view__title display-4 fw-bold fst-italic mb-1 text-dark">News</h1>
          <p class="news-view__subtitle text-muted text-md fw-normal mb-0">
            Stories, rituals, and inspirations from the world of roses.
          </p>
        </div>

        <div class="d-flex flex-column align-items-center gap-1 position-relative">
          <p class="news-view__search-hint text-muted text-xs fst-italic mb-1">
            Click to<br />Search & Filter
          </p>
          <button
            class="news-view__search-bubble frosted-glass border-0 shadow-lg d-flex align-items-center justify-content-center"
            @click.stop="showFilterModal = true"
            aria-label="Open search and filter panel"
            :aria-expanded="showFilterModal"
          >
            <span class="material-symbols-outlined fs-3 text-dark">search</span>
          </button>
        </div>
      </div>

      <NewsCreateBar v-if="authStore.isLoggedIn" class="mb-4" />

      <div class="news-view__columns" v-if="newsStore.paginatedArticles.length > 0">
        <div
          class="news-view__card-wrapper"
          v-for="(item, index) in newsStore.paginatedArticles"
          :key="item.id"
        >
          <NewsCard
            :item="item"
            :layout="getDynamicLayout(index)"
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

      <div v-else class="text-center py-5 animate-fade-up">
        <span class="material-symbols-outlined fs-1 text-muted d-block mb-2">search_off</span>
        <p class="news-view__empty-text text-muted fst-italic text-lg">
          No articles match your search.
        </p>
        <button
          class="btn btn-sm btn-outline-primary rounded-pill mt-2 fw-medium"
          @click="newsStore.clearFilters()"
        >
          Clear Filters
        </button>
      </div>

      <nav
        v-if="newsStore.totalPages > 1"
        class="d-flex justify-content-center mt-5 mb-5 align-items-center"
        aria-label="News pagination"
      >
        <div
          class="d-flex gap-2 align-items-center frosted-glass rounded-pill p-2 shadow-sm border border-light bg-white bg-opacity-50"
        >
          <button
            class="news-view__page-btn btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-base"
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
              class="news-view__page-btn btn btn-sm rounded-circle fw-bold transition-base d-flex align-items-center justify-content-center border-0"
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
            class="news-view__page-btn btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-base"
            :disabled="newsStore.currentPage === newsStore.totalPages"
            aria-label="Next page"
            @click="handlePageChange(newsStore.currentPage + 1)"
          >
            <span class="material-symbols-outlined fs-5">chevron_right</span>
          </button>
        </div>
      </nav>
    </div>

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

.news-view {
  &__bg-layer {
    z-index: -1;
    background-image: url('@/assets/images/image5.jpg');
    background-size: cover;
    background-position: center;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top right, rgba($pink-200, 0.6), rgba($yellow-100, 0.8));
    }
  }

  &__title {
    font-family: 'Zilla Slab', serif;
  }

  &__subtitle {
    font-family: 'Roboto Condensed', sans-serif;
  }

  &__search-hint {
    font-family: 'Zilla Slab', serif;
  }

  &__search-bubble {
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

  &__columns {
    columns: 2;
    column-gap: 1.25rem;

    @include media-breakpoint-down(md) {
      columns: 1;
    }
  }

  &__card-wrapper {
    break-inside: avoid;
    display: inline-block;
    width: 100%;
    margin-bottom: 1.25rem;

    /* Safari fix */
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
  }

  &__page-btn {
    width: 36px;
    height: 36px;

    &:hover:not(:disabled) {
      transform: scale(1.1);
    }
  }
}

/* Base Transition Utilities used across the component */
.transition-base {
  transition: all 0.2s ease-in-out;
}

.hover-bg-light:hover {
  background-color: var(--bs-gray-200);
}
</style>
