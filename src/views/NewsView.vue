<script>
/**
 * ==========================================
 * COMPONENT: NewsView.vue
 * ==========================================
 * Description:
 * The main news feed page. Features a CSS-columns masonry grid of news
 * articles with support for advanced searching, filtering, and pagination
 * via the PaginationBar shared component. Users can create new posts
 * if they are authenticated.
 */
import { mapState, mapGetters, mapActions } from 'vuex'
import NewsCard from '@/components/news/NewsCard.vue'
import NewsCreateBar from '@/components/news/NewsCreateBar.vue'
import NewsSearchBar from '@/components/news/NewsSearchBar.vue'
import PaginationBar from '@/components/shared/PaginationBar.vue'

export default {
  name: 'NewsView',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    NewsCard,
    NewsCreateBar,
    NewsSearchBar,
    PaginationBar,
  },

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Controls the visibility of the filter/search modal.
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
     * @param {Object} item - The blog post/news item object
     * @returns {boolean}
     */
    isOwner(item) {
      if (!this.isLoggedIn) return false
      return this.currentUser?.displayName === item.authorName
    },

    /**
     * Handles pagination page changes with smooth scrolling to top.
     * @param {number} page - The target page number
     */
    handlePageChange(page) {
      this.setPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    /**
     * Handles edit events from NewsCard.
     * Explanation: payload is { id, title, content }.
     * @param {Object} payload - Corrected format from NewsCard emit.
     */
    handleEdit(payload) {
      this.updateArticle(payload)
    },

    /**
     * Handles share events from NewsCard.
     * @param {Object} payload - { id, platform }
     */
    handleShare(payload) {
      this.incrementShare(payload.id)
    },

    /**
     * Handles react events from NewsCard.
     * @param {Object} payload - { id, reaction }
     */
    handleReact(payload) {
      this.reactToArticle(payload.id)
    },

    /**
     * Scrolls the window to a post specified in the URL hash.
     * Explanation: Uses setTimeout to ensure the DOM is rendered before scrolling.
     */
    scrollToAnchor() {
      const hash = this.$route.hash
      if (hash && hash.startsWith('#post-')) {
        // Retry a few times in case masonry has not fully laid out yet
        let attempts = 0
        const interval = setInterval(() => {
          const el = document.querySelector(hash)
          if (el) {
            clearInterval(interval)
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Highlight the card for better visual feedback
            el.classList.add('highlight-flash')
            setTimeout(() => el.classList.remove('highlight-flash'), 2000)
          }
          attempts++
          if (attempts > 20) clearInterval(interval) // Max 2 seconds
        }, 100)
      }
    },
  },

  mounted() {
    this.scrollToAnchor()
  },

  watch: {
    '$route.hash'() {
      this.scrollToAnchor()
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
        <div class="d-flex flex-column align-items-center gap-1 position-relative z-3">
          <p
            class="news-view__search-hint text-muted text-xs fst-italic mb-1 text-center font-zilla"
          >
            Click to<br />Search & Filter
          </p>
          <button
            class="news-view__search-bubble border-0 bg-transparent p-0"
            @click="showFilterModal = true"
            aria-label="Open search and filter panel"
            :aria-expanded="showFilterModal"
          >
            <img
              src="@/assets/images/search-icon.png"
              alt="Search and filter"
              class="news-view__search-icon"
            />
          </button>
        </div>
      </div>

      <!-- Creation Bar (Auth users only) -->
      <NewsCreateBar v-if="isLoggedIn" class="mb-4" />

      <!-- Masonry Grid of Articles (Req 11) -->
      <div class="news-view__columns" v-if="paginatedArticles.length > 0">
        <div class="news-view__card-wrapper" v-for="item in paginatedArticles" :key="item.id">
          <NewsCard
            :item="item"
            :is-authed="isLoggedIn"
            :is-owner="isOwner(item)"
            @react="handleReact"
            @comment="addComment"
            @share="handleShare"
            @edit="handleEdit"
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

      <!-- Pagination -->
      <PaginationBar
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Slide-down Search/Filter Modal -->
    <NewsSearchBar v-model="showFilterModal" />
  </div>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';

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
      background: linear-gradient(
        to top right,
        rgba(255, 255, 255, 0.6),
        rgba(255, 255, 255, 0.85)
      );
    }
  }

  &__title {
    font-family: 'Zilla Slab', serif;
  }
  &__subtitle {
    font-family: 'Roboto Condensed', sans-serif;
  }

  &__search-bubble {
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    &:hover {
      transform: scale(1.08);
    }
  }

  &__search-icon {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    object-fit: cover;
    filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.15));
  }

  // Req 11 Fix: Genuine masonry grid layout
  &__columns {
    columns: 2;
    column-gap: 1.25rem;

    @include media-breakpoint-down(md) {
      columns: 1;
    }
  }

  &__card-wrapper {
    break-inside: avoid;
    display: block;
    width: 100%;
    margin-bottom: 1.25rem;
    -webkit-column-break-inside: avoid;
    transition: transform 0.3s ease;

    &.highlight-flash {
      animation: highlightFlash 2s ease-out;
    }
  }
}

@keyframes highlightFlash {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--bs-primary-rgb), 0);
  }
  15% {
    transform: scale(1.02);
    box-shadow: 0 0 20px 5px rgba(var(--bs-primary-rgb), 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--bs-primary-rgb), 0);
  }
}
</style>
