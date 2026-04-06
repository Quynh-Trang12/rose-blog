<script>
/**
 * ==========================================
 * COMPONENT: NewsView.vue
 * ==========================================
 * Description:
 * The main news feed of The Rose Blog. Displays news items in a masonry
 * grid with integrated filtering, pagination, and a floating search bubble.
 *
 * Requirements (Issue 4, 9, 11):
 *  - Use PaginationBar component.
 *  - Remove getDynamicLayout and use item.layoutType directly.
 *  - Navigate to specific post on mount if #hash is present.
 *  - Support query-based filtering (?category=...) on mount.
 */
import { mapGetters, mapActions, mapState } from 'vuex'
import NewsCard from '@/components/news/NewsCard.vue'
import NewsSearchBar from '@/components/news/NewsSearchBar.vue'
import NewsCreateBar from '@/components/news/NewsCreateBar.vue'
import PaginationBar from '@/components/shared/PaginationBar.vue'

export default {
  name: 'NewsView',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    NewsCard,
    NewsSearchBar,
    NewsCreateBar,
    PaginationBar,
  },

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Controls visibility of the search bubble modal.
      showFilterModal: false,
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('news', {
      currentPage: (state) => state.newsPage,
    }),
    ...mapState('auth', ['currentUser']),
    ...mapGetters('auth', ['isLoggedIn']),
    ...mapGetters('news', {
      paginatedNewsItems: 'paginatedNewsItems',
      totalPages: 'newsTotalPages',
      totalNewsItems: 'totalNewsItems',
    }),

    /**
     * Requirement (Issue 12): Manageable items count.
     */
    totalItems() {
      return this.totalNewsItems
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['setPage', 'applyFilters', 'clearFilters']),

    /**
     * Handles page changes from the PaginationBar.
     * @param {number} page - The target page number
     */
    handlePageChange(page) {
      this.setPage({ page, target: 'news' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    /**
     * Scrolls smoothly to the target hash element if it exists in the DOM.
     * @param {string} hash - The target element ID (#post-101)
     */
    scrollToTarget(hash) {
      if (!hash) return
      this.$nextTick(() => {
        setTimeout(() => {
          const el = document.querySelector(hash)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 500)
      })
    },
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * Requirement (Issue reset): Reset filters when navigating back to news
     * without a specific query.
     */
    '$route.query'(newVal) {
      if (!newVal.category) {
        this.clearFilters('news')
      }
    },
  },

  mounted() {
    // 1. Initial category filter check (Requirement 9)
    const category = this.$route.query.category
    if (category) {
      this.applyFilters({ filters: { category }, target: 'news' })
    } else {
      this.clearFilters('news')
    }

    // 2. Initial hash scroll check (Requirement 11)
    if (this.$route.hash) {
      this.scrollToTarget(this.$route.hash)
    }
  },
}
</script>

<template>
  <div class="news-view min-vh-100 py-5 bg-light-soft position-relative">
    <!-- Search Bubble Trigger -->
    <button
      type="button"
      class="search-bubble-btn news-view__search-bubble border-0 bg-transparent p-0 position-fixed d-flex align-items-center justify-content-center z-index-filter animate-fade-up"
      @click="showFilterModal = true"
      aria-label="Open search and filter panel"
      :aria-expanded="showFilterModal"
    >
      <img
        src="@/assets/images/search-icon.png"
        alt="Search and filter"
        class="news-view__search-icon"
        style="pointer-events: none;"
      />
    </button>

    <!-- Filter Modal (Overlay) -->
    <NewsSearchBar :model-value="showFilterModal" @update:model-value="showFilterModal = $event" />

    <div class="container pt-5">
      <!-- Create Post Bar (Authenticated only) -->
      <NewsCreateBar v-if="isLoggedIn" class="mb-5 animate-fade-up" />

      <!-- News Feed Grid -->
      <div v-if="paginatedNewsItems.length > 0" class="news-masonry-grid pb-4 animate-fade-up">
        <div v-for="item in paginatedNewsItems" :key="item.id" class="news-view__card-wrapper">
          <NewsCard
            :item="item"
            :is-authed="isLoggedIn"
            :is-owner="currentUser && String(currentUser.id) === String(item.authorID)"
            @edit="$store.dispatch('news/updateArticle', $event)"
            @delete="$store.dispatch('news/deleteArticle', $event)"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="empty-state text-center py-5 glassmorphism-pink rounded-5 border border-white mw-600 mx-auto animate-fade-up"
      >
        <span class="material-symbols-outlined display-1 text-primary-light mb-4"
          >nest_eco_leaf</span
        >
        <h3 class="font-zilla fst-italic h4 mb-3">The petals are still falling...</h3>
        <p class="text-muted font-roboto">No news items matched your current filters.</p>
        <button class="btn btn-primary rounded-pill px-4 mt-3 fw-bold" @click="clearFilters">
          Reset All Filters
        </button>
      </div>

      <!-- Pagination Section -->
      <PaginationBar
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';

.bg-light-soft {
  background-color: #fcfcfc;
}

/* Floating Search Bubble Styling */
.search-bubble-btn {
  bottom: 2rem;
  right: 2rem;
  // border: none;

  @include media-breakpoint-down(md) {
    width: 56px;
    height: 56px;
    bottom: 1.5rem;
    right: 1.5rem;
  }
}

/* Masonry Layout implementation (Requirement 11) */
.news-masonry-grid {
  columns: 1;
  column-gap: 1.25rem;

  @include media-breakpoint-up(md) {
    columns: 2;
  }

  @include media-breakpoint-up(xl) {
    columns: 3;
  }
}

.news-view__card-wrapper {
  break-inside: avoid;
  page-break-inside: avoid;
  -webkit-column-break-inside: avoid;
  display: block; // Fix Safari/Firefox masonry bugs
  width: 100%;
  margin-bottom: 1.25rem;
}

.text-primary-light {
  color: rgba($primary, 0.2);
}

.news-view {
  &__search-bubble {
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: scale(1.08);
    }

    &:focus {
      outline: none;
    }
  }

  &__search-icon {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    object-fit: cover;
    filter: drop-shadow(0 4px 16px rgba($pink, 0.3));
    transition: filter 0.2s ease-in-out;

    &:hover {
      filter: drop-shadow(0 8px 32px rgba($pink, 0.45));
    }
  }
}
</style>
