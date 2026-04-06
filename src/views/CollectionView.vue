<script>
/**
 * ==========================================
 * COMPONENT: CollectionView.vue
 * ==========================================
 * Description:
 * A private view for authenticated users to manage their bookmarked
 * news items. Displays saved items in a masonry grid using the
 * NewsCard component.
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
      showFilterModal: false,
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('auth', ['currentUser']),
    ...mapState('news', {
        currentPage: state => state.collectionPage
    }),
    ...mapGetters('auth', ['isLoggedIn', 'mySavedPostIds']),
    ...mapGetters('news', {
      savedNewsItems: 'paginatedCollectionItems',
      totalPages: 'collectionTotalPages',
      totalItems: 'totalCollectionItems'
    }),
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['setPage', 'clearFilters']),

    handlePageChange(page) {
      this.setPage({ page, target: 'collection' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    openAuthModal() {
      window.dispatchEvent(new Event('openAuthModal'))
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted() {
    this.clearFilters('collection')
  },
}
</script>

<template>
  <div class="collection-view min-vh-100 py-5 bg-light-soft position-relative">
    <!-- Search Bubble Trigger -->
    <button
      class="search-bubble-btn shadow-lg rounded-circle position-fixed d-flex align-items-center justify-content-center z-index-filter animate-fade-up"
      @click.stop="showFilterModal = true"
      aria-label="Open collection filters"
    >
      <img src="@/assets/images/search-icon.png" style="width: 32px; height: 32px; filter: brightness(0) invert(1);" alt="Search" />
    </button>

    <!-- Filter Modal (Overlay) -->
    <NewsSearchBar
      :model-value="showFilterModal"
      @update:model-value="showFilterModal = $event"
      target="collection"
    />

    <div class="container pt-5">
      <!-- 1. Header Section -->
      <div class="text-center mb-5 animate-fade-up">
        <h1 class="display-4 fw-bold fst-italic mb-3 font-zilla text-dark">
          My botanical <span class="text-primary">sanctuary</span>
        </h1>
        <p class="text-muted font-roboto fs-5">
          Curating your personal collection of rose wisdom. Everything you save is kept here for
          quick reference.
        </p>
        <div class="mx-auto border-bottom border-primary border-4 collection-divider"></div>
      </div>

      <!-- 2. Auth Guard State -->
      <div v-if="!isLoggedIn" class="text-center py-5 animate-fade-up">
        <div class="glassmorphism-pink rounded-5 p-5 border border-white mw-480 mx-auto">
          <span class="material-symbols-outlined display-1 text-primary-light mb-4">lock</span>
          <h2 class="font-zilla fst-italic h3 mb-3">Locked Garden</h2>
          <p class="text-muted font-roboto mb-4">
            You must be logged in to view your personal botanical collection.
          </p>
          <button class="btn btn-primary rounded-pill px-5 py-2 fw-bold" @click="openAuthModal">
            Go to Login
          </button>
        </div>
      </div>

      <!-- 3. Main Collection Content -->
      <template v-else>
        <!-- Saved Items Feed -->
        <div v-if="savedNewsItems.length > 0" class="news-masonry-grid pb-4 animate-fade-up">
          <div v-for="item in savedNewsItems" :key="item.id" class="news-view__card-wrapper">
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
          <div class="glassmorphism-pink rounded-5 p-5 border border-white mw-600 mx-auto">
            <span class="material-symbols-outlined display-1 text-primary-light mb-4"
              >bookmark_border</span
            >
            <h3 class="font-zilla fst-italic h4 mb-3">Your garden is empty... for now.</h3>
            <p class="text-muted font-roboto mb-5">
              Found an article you love? Click the bookmark icon in the news feed to save it to your
              private sanctuary.
            </p>
            <router-link
              to="/news"
              class="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg"
            >
              Explore News Feed
            </router-link>
            <button v-if="totalItems === 0" class="btn btn-link text-muted mt-3" @click="clearFilters('collection')">
              Reset Collection Filters
            </button>
          </div>
        </div>

        <!-- Pagination Section -->
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
@import 'bootstrap/scss/mixins';

.bg-light-soft {
  background-color: #fcfcfc;
}

.collection-divider {
  width: 80px;
}

/* Floating Search Bubble Styling */
.search-bubble-btn {
  width: 64px;
  height: 64px;
  bottom: 2rem;
  right: 2rem;
  background-color: $primary;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 12px 24px rgba($primary, 0.3);
  z-index: 100;

  &:hover {
    transform: scale(1.1) rotate(5deg);
    background-color: darken($primary, 5%);
    box-shadow: 0 16px 32px rgba($primary, 0.4);
  }

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
</style>
