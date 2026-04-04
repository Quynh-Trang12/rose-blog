<script>
/**
 * ==========================================
 * COMPONENT: CollectionView.vue
 * ==========================================
 * Description:
 * A dedicated gallery for authenticated users to view their saved news
 * articles and curated rose information. Access is restricted by the
 * Vue Router navigation guard (requires authentication).
 */
import { mapState, mapGetters, mapActions } from 'vuex'
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
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Controls the visibility of the legacy rose detail modal.
      selectedRose: null,
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('auth', ['currentUser']),
    ...mapGetters('auth', ['isLoggedIn', 'mySavedPostIds']),
    ...mapGetters('news', ['allArticles']),

    /**
     * Filters the global news articles to only include those saved by the current user.
     * Explanation: Cross-references the mySavedPostIds getter from the auth module
     * against allArticles to build the user's personal collection.
     * @returns {Array} List of saved article objects
     */
    savedArticles() {
      // Accessing allArticles to ensure we find saved posts even if they are filtered
      // in the public news feed (though normally private posts aren't savable).
      return this.allArticles.filter((article) =>
        this.mySavedPostIds.some((savedId) => String(savedId) === String(article.id)),
      )
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', [
      'reactToArticle',
      'addComment',
      'incrementShare',
      'updateArticle',
      'deleteArticle',
    ]),

    /**
     * Checks if the current user is the author of a specific item.
     * @param {Object} item - The news item object
     * @returns {boolean}
     */
    isOwner(item) {
      if (!this.isLoggedIn) return false
      return this.currentUser?.displayName === item.authorName
    },

    /**
     * Closes the rose detail modal.
     */
    closeDetail() {
      this.selectedRose = null
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
  },
}
</script>

<template>
  <div class="position-relative min-vh-100 py-5">
    <!-- Visual Background Layer -->
    <div class="position-fixed top-0 start-0 w-100 h-100 collection-bg" aria-hidden="true"></div>

    <div class="container position-relative z-1 pt-4">
      <!-- Unauthorized State -->
      <div v-if="!isLoggedIn" class="text-center py-5 animate-fade-up">
        <span class="material-symbols-outlined fs-1 text-muted d-block mb-2">lock</span>
        <p class="text-muted fst-italic text-lg font-zilla">
          Please login to view your collection.
        </p>
      </div>

      <!-- Empty Collection State -->
      <div v-else-if="savedArticles.length === 0" class="text-center py-5 animate-fade-up">
        <span class="material-symbols-outlined fs-1 text-muted d-block mb-2">bookmark_border</span>
        <p class="text-muted fst-italic text-lg font-zilla">You have no saved articles yet.</p>
      </div>

      <!-- Saved Articles Grid -->
      <div v-if="savedArticles.length > 0" class="mt-5 pt-3 animate-fade-up">
        <div class="mb-4 d-flex align-items-center gap-3">
          <h2 class="display-5 fw-bold fst-italic mb-0 font-zilla text-dark">My Collection</h2>
          <span class="badge rounded-pill bg-primary px-3 py-2 fs-6 shadow-sm">
            {{ savedArticles.length }} Articles
          </span>
        </div>
        <p class="text-muted mb-5 font-roboto collection-subtitle">
          A dedicated space for the stories, tips, and inspirations you've saved from our daily news
          feed.
        </p>

        <div class="row g-4">
          <div v-for="item in savedArticles" :key="item.id" class="col-12 col-md-6">
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
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

.collection-bg {
  z-index: -1;
  background: linear-gradient(135deg, #fff5f8 0%, #fce7f3 50%, #f5f3ff 100%);
  opacity: 0.8;
}

.collection-subtitle {
  max-width: 600px;
}

.animate-fade-up {
  // Reusing keyframe from base.scss if needed, but defining it here for local scope safety
  animation: fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
