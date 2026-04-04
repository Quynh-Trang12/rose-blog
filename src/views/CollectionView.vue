<script>
/**
 * ==========================================
 * COMPONENT: CollectionView.vue
 * ==========================================
 * Description:
 * A private view for authenticated users to manage their bookmarked
 * news items. Displays saved items in a masonry grid using the 
 * NewsCard component.
 *
 * Requirements (Bug A):
 *  - Removed dead 'selectedRose' modal logic and teleport blocks.
 *  - Removed the large commented-out rose grid.
 *  - Handled the case when a user is not logged in.
 */
import { mapGetters, mapState } from 'vuex'
import NewsCard from '@/components/news/NewsCard.vue'

export default {
  name: 'CollectionView',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    NewsCard,
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('auth', ['currentUser']),
    ...mapGetters('auth', ['isLoggedIn', 'mySavedPostIds']),
    ...mapGetters('news', ['allNewsItems']),

    /**
     * Filters the complete news list to only those saved by the user.
     * @returns {Array} News items whose IDs match the saved list
     */
    savedNewsItems() {
      if (!this.isLoggedIn) return []
      return this.allNewsItems.filter((item) =>
        this.mySavedPostIds.some((id) => String(id) === String(item.id))
      )
    },
  },
}
</script>

<template>
  <div class="collection-view min-vh-100 py-5 bg-light-soft position-relative">
    <div class="container pt-5">
      <!-- 1. Header Section -->
      <div class="text-center mb-5 animate-fade-up">
        <h1 class="display-4 fw-bold fst-italic mb-3 font-zilla text-dark">
          My botanical <span class="text-primary">sanctuary</span>
        </h1>
        <p class="text-muted font-roboto fs-5">
          Curating your personal collection of rose wisdom. 
          Everything you save is kept here for quick reference.
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
          <button class="btn btn-primary rounded-pill px-5 py-2 fw-bold" @click="$router.push('/')">
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
              :is-authed="true"
              :is-owner="String(currentUser.id) === String(item.authorID)"
            />
          </div>
        </div>

        <!-- Empty Collection State -->
        <div v-else class="text-center py-5 animate-fade-up">
          <div class="glassmorphism-pink rounded-5 p-5 border border-white mw-600 mx-auto">
            <span class="material-symbols-outlined display-1 text-primary-light mb-4">bookmark_border</span>
            <h3 class="font-zilla fst-italic h4 mb-3">Your garden is empty... for now.</h3>
            <p class="text-muted font-roboto mb-5">
              Found an article you love? Click the bookmark icon 
              in the news feed to save it to your private sanctuary.
            </p>
            <router-link to="/news" class="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg">
              Explore News Feed
            </router-link>
          </div>
        </div>
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
