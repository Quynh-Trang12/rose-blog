<script>
/**
 * ==========================================
 * COMPONENT: CollectionView.vue
 * ==========================================
 * Description:
 * A private view for authenticated users to manage their bookmarked news items.
 * Displays saved items in a responsive masonry grid using the NewsCard component.
 * Includes filtering via NewsSearchBar and pagination via PaginationBar.
 *
 * Fix applied: The search bubble button now uses the same corrected pattern
 * as NewsView — a plain <button> with an explicit `openFilterModal` handler
 * and pointer-events: none on the inner <img> so click events are never blocked.
 */
import { mapGetters, mapState, mapActions } from 'vuex'
import NewsCard from '@/components/news/NewsCard.vue'
import NewsSearchBar from '@/components/news/NewsSearchBar.vue'
import PaginationBar from '@/components/shared/PaginationBar.vue'

export default {
  name: 'CollectionView',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    NewsCard,
    NewsSearchBar,
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
    ...mapState('auth', ['currentUser']),
    ...mapState('news', {
      // Explanation: Map collectionPage from the news module as currentPage.
      currentPage: (state) => state.collectionPage,
    }),
    ...mapGetters('auth', ['isLoggedIn', 'mySavedPostIds']),
    ...mapGetters('news', {
      savedNewsItems: 'paginatedCollectionItems',
      totalPages: 'collectionTotalPages',
      totalItems: 'totalCollectionItems',
    }),
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['setPage', 'clearFilters']),

    /**
     * Opens the search and filter overlay modal.
     */
    openFilterModal() {
      this.showFilterModal = true
    },

    /**
     * Handles page changes emitted by the PaginationBar component.
     * @param {number} page - The target page number.
     */
    handlePageChange(page) {
      this.setPage({ page, target: 'collection' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    /**
     * Dispatches a custom event to open the AppNavBar auth modal.
     */
    openAuthModal() {
      window.dispatchEvent(new Event('openAuthModal'))
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted() {
    // Explanation: Clear any stale collection filters when entering the view.
    this.clearFilters('collection')
  },
}
</script>

<template>
  <div class="collection-view min-vh-100 py-5 bg-light-soft position-relative">

    <!-- ==========================================
         FLOATING SEARCH BUBBLE
         Explanation: Same corrected pattern as NewsView — explicit click handler
         on the <button>, pointer-events: none on the <img> child via SCSS.
         ========================================== -->
    <button
      type="button"
      class="collection-view__search-bubble border-0 bg-transparent p-0 position-fixed d-flex align-items-center justify-content-center animate-fade-up"
      @click="openFilterModal"
      aria-label="Open collection filters"
      :aria-expanded="showFilterModal"
    >
      <img
        src="@/assets/images/search-icon.png"
        alt=""
        aria-hidden="true"
        class="collection-view__search-icon"
      />
    </button>

    <!-- NewsSearchBar teleports its own overlay to <body> -->
    <NewsSearchBar
      :model-value="showFilterModal"
      @update:model-value="showFilterModal = $event"
      target="collection"
    />

    <div class="container pt-5">

      <!-- Page Header -->
      <div class="text-center mb-5 animate-fade-up">
        <h1 class="display-4 fw-bold fst-italic mb-3 font-zilla text-dark">
          My botanical <span class="text-primary">sanctuary</span>
        </h1>
        <p class="text-muted font-roboto fs-5">
          Curating your personal collection of rose wisdom. Everything you save is kept here for
          quick reference.
        </p>
        <div class="collection-view__divider mx-auto border-bottom border-primary border-4"></div>
      </div>

      <!-- Unauthenticated Guard State -->
      <div v-if="!isLoggedIn" class="text-center py-5 animate-fade-up">
        <div class="glassmorphism-pink rounded-5 p-5 border border-white collection-view__auth-card mx-auto">
          <span class="material-symbols-outlined display-1 collection-view__empty-icon mb-4">lock</span>
          <h2 class="font-zilla fst-italic h3 mb-3">Locked Garden</h2>
          <p class="text-muted font-roboto mb-4">
            You must be logged in to view your personal botanical collection.
          </p>
          <button
            class="btn btn-primary rounded-pill px-5 py-2 fw-bold"
            @click="openAuthModal"
          >
            Go to Login
          </button>
        </div>
      </div>

      <!-- Authenticated Content -->
      <template v-else>

        <!-- Saved Items Masonry Grid -->
        <div
          v-if="savedNewsItems.length > 0"
          class="collection-view__masonry-grid pb-4 animate-fade-up"
        >
          <div
            v-for="item in savedNewsItems"
            :key="item.id"
            class="collection-view__card-wrapper"
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

        <!-- Empty Collection State -->
        <div v-else class="text-center py-5 animate-fade-up">
          <div class="glassmorphism-pink rounded-5 p-5 border border-white collection-view__empty-card mx-auto">
            <span class="material-symbols-outlined display-1 collection-view__empty-icon mb-4">
              bookmark_border
            </span>
            <h3 class="font-zilla fst-italic h4 mb-3">Your garden is empty... for now.</h3>
            <p class="text-muted font-roboto mb-5">
              Found an article you love? Click the bookmark icon in the news feed to save it to
              your private sanctuary.
            </p>
            <router-link
              to="/news"
              class="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg"
            >
              Explore News Feed
            </router-link>
            <button
              v-if="totalItems === 0"
              class="btn btn-link text-muted mt-3 d-block mx-auto"
              @click="clearFilters('collection')"
            >
              Reset Collection Filters
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <PaginationBar
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />

      </template>
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
// PAGE HEADER DIVIDER
// ==========================================

.collection-view__divider {
  width: 80px;
}

// ==========================================
// FLOATING SEARCH BUBBLE BUTTON
// ==========================================

.collection-view__search-bubble {
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

.collection-view__search-icon {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  object-fit: cover;
  // Explanation: pointer-events: none ensures clicks pass through to the <button>.
  pointer-events: none;
  filter: drop-shadow(0 4px 16px rgba($pink, 0.35));
  transition: filter 0.2s ease-in-out;

  .collection-view__search-bubble:hover & {
    filter: drop-shadow(0 8px 32px rgba($pink, 0.5));
  }
}

// ==========================================
// MASONRY GRID LAYOUT
// ==========================================

.collection-view__masonry-grid {
  columns: 1;
  column-gap: 1.25rem;
  overflow: visible !important;
  position: relative;
  z-index: 1;

  @include media-breakpoint-up(md) {
    columns: 2;
  }

  @include media-breakpoint-up(xl) {
    columns: 3;
  }
}

.collection-view__card-wrapper {
  break-inside: avoid;
  page-break-inside: avoid;
  -webkit-column-break-inside: avoid;
  display: block;
  width: 100%;
  margin-bottom: 1.25rem;
}

// ==========================================
// AUTH GUARD / EMPTY STATE CARDS
// ==========================================

.collection-view__auth-card,
.collection-view__empty-card {
  max-width: 480px;
}

.collection-view__empty-card {
  max-width: 600px;
}

.collection-view__empty-icon {
  color: rgba($primary, 0.2);
  display: block;
}
</style>
