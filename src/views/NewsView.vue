<script>
/**
 * ==========================================
 * COMPONENT: NewsView.vue
 * ==========================================
 * Description:
 * The main news feed page. Features a masonry-style grid of news articles
 * with support for searching, filtering, and pagination. Users can also
 * create new posts if they are authenticated.
 */
import { mapState, mapGetters, mapActions } from 'vuex'
import NewsCard from '@/components/news/NewsCard.vue'
import NewsCreateBar from '@/components/news/NewsCreateBar.vue'
import NewsSearchBar from '@/components/news/NewsSearchBar.vue'

export default {
  name: 'NewsView',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    NewsCard,
    NewsCreateBar,
    NewsSearchBar,
  },

  // ==========================================
  // DATA
  // ==========================================
  data: function () {
    return {
      showFilterModal: false,
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('auth', ['currentUser']),
    ...mapState('news', ['currentPage']),
    ...mapGetters('auth', ['isLoggedIn']),
    ...mapGetters('news', ['paginatedArticles', 'totalPages']),
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', [
      'setPage',
      'reactToArticle',
      'addComment',
      'incrementShare',
      'updateArticle',
      'deleteArticle',
      'clearFilters',
    ]),

    /**
     * Checks if the current user owns a specific news item.
     * Explanation: Display-name based match with no admin override.
     * @param {Object} item - The blog post/news item object
     * @returns {boolean}
     */
    isOwner: function (item) {
      if (!this.isLoggedIn) return false
      return this.currentUser.displayName === item.authorName
    },

    /**
     * Handles pagination clicks with smooth scrolling to top.
     * @param {number} page - The target page number
     */
    handlePageChange: function (page) {
      if (page >= 1 && page <= this.totalPages) {
        // Explanation: Update the Vuex store's page state.
        this.setPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },

    /**
     * Determines a masonry layout type (A, B, or C) based on current index.
     * @param {number} index - Index in the v-for loop
     * @returns {string}
     */
    getDynamicLayout: function (index) {
      if (index % 5 === 0) return 'C'
      if (index % 4 === 0) return 'B'
      return 'A'
    },
  },
}
</script>

<template>
  <div class="news-view position-relative min-vh-100 py-5">
    <!-- Background Decor Layer -->
    <div
      class="news-view__bg-layer position-fixed top-0 start-0 w-100 h-100"
      aria-hidden="true"
    ></div>

    <div class="container position-relative z-1 pt-4">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-start mb-5 animate-fade-up">
        <div>
          <h1 class="news-view__title display-4 fw-bold fst-italic mb-1 text-dark">News</h1>
          <p class="news-view__subtitle text-muted text-md fw-normal mb-0">
            Stories, rituals, and inspirations from the world of roses.
          </p>
        </div>

        <!-- Filter Bubble Entry -->
        <div class="d-flex flex-column align-items-center gap-1 position-relative">
          <p class="news-view__search-hint text-muted text-xs fst-italic mb-1 text-center">
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

      <!-- Creation Bar (Auth users only) -->
      <NewsCreateBar v-if="isLoggedIn" class="mb-4" />

      <!-- Masonry Grid of Articles -->
      <div class="news-view__columns" v-if="paginatedArticles.length > 0">
        <div
          class="news-view__card-wrapper"
          v-for="(item, index) in paginatedArticles"
          :key="item.id"
        >
          <NewsCard
            :item="item"
            :layout="getDynamicLayout(index)"
            :is-authed="isLoggedIn"
            :is-owner="isOwner(item)"
            @react="reactToArticle"
            @comment="addComment"
            @share="incrementShare"
            @edit="updateArticle"
            @delete="deleteArticle"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5 animate-fade-up">
        <span class="material-symbols-outlined fs-1 text-muted d-block mb-2">search_off</span>
        <p class="news-view__empty-text text-muted fst-italic text-lg">
          No articles match your search.
        </p>
        <button
          class="btn btn-sm btn-outline-primary rounded-pill mt-2 fw-medium"
          @click="clearFilters"
        >
          Clear Filters
        </button>
      </div>

      <!-- Pagination Navigation -->
      <nav
        v-if="totalPages > 1"
        class="d-flex justify-content-center mt-5 mb-5 align-items-center"
        aria-label="News pagination"
      >
        <div
          class="d-flex gap-2 align-items-center frosted-glass rounded-pill p-2 shadow-sm border border-light bg-white bg-opacity-50"
        >
          <button
            class="news-view__page-btn btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-base"
            :disabled="currentPage === 1"
            aria-label="Previous page"
            @click="handlePageChange(currentPage - 1)"
          >
            <span class="material-symbols-outlined fs-5">chevron_left</span>
          </button>

          <div class="d-flex gap-1 px-2">
            <button
              v-for="page in totalPages"
              :key="page"
              class="news-view__page-btn btn btn-sm rounded-circle fw-bold transition-base d-flex align-items-center justify-content-center border-0"
              :class="
                currentPage === page
                  ? 'btn-primary shadow-sm text-white'
                  : 'text-dark hover-bg-light'
              "
              @click="handlePageChange(page)"
              :aria-current="currentPage === page ? 'page' : null"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="news-view__page-btn btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-base"
            :disabled="currentPage === totalPages"
            aria-label="Next page"
            @click="handlePageChange(currentPage + 1)"
          >
            <span class="material-symbols-outlined fs-5">chevron_right</span>
          </button>
        </div>
      </nav>
    </div>

    <!-- Slide-down Search/Filter Modal -->
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

    /* Safari fix for column-break */
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

.transition-base {
  transition: all 0.2s ease-in-out;
}

.hover-bg-light:hover {
  background-color: var(--bs-gray-200);
}
</style>
