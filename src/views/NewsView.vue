<script>
/**
 * ==========================================
 * COMPONENT: NewsView.vue
 * ==========================================
 * Description:
 * The main news feed of The Rose Blog. Displays news items in a responsive
 * masonry grid with integrated filtering, pagination, and a floating search
 * bubble trigger. Authenticated users can create posts via NewsCreateBar.
 *
 * Fix applied: The search bubble button now correctly toggles `showFilterModal`
 * through a plain click handler with no conflicting pointer-events. The
 * NewsSearchBar is rendered via <teleport to="body"> inside its own component,
 * so it no longer competes for z-index with the fixed bubble button.
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
      // Explanation: Controls whether the NewsSearchBar overlay is visible.
      showFilterModal: false,
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('news', {
      // Explanation: Map newsPage from the news module as currentPage.
      currentPage: (state) => state.newsPage,
    }),
    ...mapState('auth', ['currentUser']),
    ...mapGetters('auth', ['isLoggedIn']),
    ...mapGetters('news', {
      paginatedNewsItems: 'paginatedNewsItems',
      totalPages: 'newsTotalPages',
      totalNewsItems: 'totalNewsItems',
    }),
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['setPage', 'applyFilters', 'clearFilters']),

    /**
     * Opens the search and filter overlay modal.
     */
    openFilterModal() {
      this.showFilterModal = true
    },

    /**
     * Handles page changes emitted by the PaginationBar component.
     * Scrolls smoothly to the top of the page after changing pages.
     * @param {number} page - The target page number.
     */
    handlePageChange(page) {
      this.setPage({ page, target: 'news' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    /**
     * Scrolls smoothly to a hash-targeted element once the DOM has settled.
     * @param {string} hash - The target element selector (e.g. '#post-101').
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
     * Resets filters when navigating to /news without a category query param.
     * @param {Object} newVal - The updated route query object.
     */
    '$route.query'(newVal) {
      if (!newVal.category) {
        this.clearFilters('news')
      }
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted() {
    // Explanation: Apply a category filter if one is present in the URL query.
    const category = this.$route.query.category
    if (category) {
      this.applyFilters({ filters: { category }, target: 'news' })
    } else {
      this.clearFilters('news')
    }

    // Explanation: Scroll to a specific post if a hash anchor is present.
    if (this.$route.hash) {
      this.scrollToTarget(this.$route.hash)
    }
  },
}
</script>

<template>
  <div class="news-view min-vh-100 py-5 bg-light-soft position-relative">

    <!-- ==========================================
         FLOATING SEARCH BUBBLE
         Explanation: Uses a plain <button> with an explicit click handler.
         The image child has pointer-events: none (via SCSS) so all click
         events bubble up to the button — this is the fix for the trigger issue.
         ========================================== -->
    <button
      type="button"
      class="news-view__search-bubble border-0 bg-transparent p-0 position-fixed d-flex align-items-center justify-content-center animate-fade-up"
      @click="openFilterModal"
      aria-label="Open search and filter panel"
      :aria-expanded="showFilterModal"
    >
      <img
        src="@/assets/images/search-icon.png"
        alt=""
        aria-hidden="true"
        class="news-view__search-icon"
      />
    </button>

    <!-- NewsSearchBar teleports its own overlay to <body> -->
    <NewsSearchBar
      :model-value="showFilterModal"
      @update:model-value="showFilterModal = $event"
      target="news"
    />

    <div class="container pt-5">

      <!-- Create Post Bar (authenticated users only) -->
      <NewsCreateBar v-if="isLoggedIn" class="mb-5 animate-fade-up" />

      <!-- News Masonry Grid -->
      <div
        v-if="paginatedNewsItems.length > 0"
        class="news-view__masonry-grid pb-4 animate-fade-up"
      >
        <div
          v-for="item in paginatedNewsItems"
          :key="item.id"
          class="news-view__card-wrapper"
        >
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
        class="news-view__empty text-center py-5 glassmorphism-pink rounded-5 border border-white mx-auto animate-fade-up"
      >
        <span class="material-symbols-outlined display-1 news-view__empty-icon mb-4">
          nest_eco_leaf
        </span>
        <h3 class="font-zilla fst-italic h4 mb-3">The petals are still falling...</h3>
        <p class="text-muted font-roboto">No news items matched your current filters.</p>
        <button
          class="btn btn-primary rounded-pill px-4 mt-3 fw-bold"
          @click="clearFilters('news')"
        >
          Reset All Filters
        </button>
      </div>

      <!-- Pagination -->
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
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';

// ==========================================
// PAGE BACKGROUND
// ==========================================

.bg-light-soft {
  background-color: #fcfcfc;
}

// ==========================================
// FLOATING SEARCH BUBBLE BUTTON
// ==========================================

.news-view__search-bubble {
  // Explanation: Fixed positioning places the bubble over all page content.
  bottom: 2rem;
  right: 2rem;
  // Explanation: Must sit above standard page content but below modals.
  z-index: 1050;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.08);
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 4px;
    border-radius: 50%;
  }

  @include media-breakpoint-down(md) {
    bottom: 1.5rem;
    right: 1.5rem;
  }
}

// ==========================================
// SEARCH ICON IMAGE
// ==========================================

.news-view__search-icon {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  object-fit: cover;
  // Explanation: pointer-events: none ensures clicks pass through the <img>
  // to the parent <button>, which is the fix for the trigger bug.
  pointer-events: none;
  filter: drop-shadow(0 4px 16px rgba($pink, 0.35));
  transition: filter 0.2s ease-in-out;

  .news-view__search-bubble:hover & {
    filter: drop-shadow(0 8px 32px rgba($pink, 0.5));
  }
}

// ==========================================
// MASONRY GRID LAYOUT
// ==========================================

.news-view__masonry-grid {
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
  display: block;
  width: 100%;
  margin-bottom: 1.25rem;
}

// ==========================================
// EMPTY STATE
// ==========================================

.news-view__empty {
  max-width: 600px;
}

.news-view__empty-icon {
  color: rgba($primary, 0.2);
}
</style>
