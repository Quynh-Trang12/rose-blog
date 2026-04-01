<script>
/**
 * ==========================================
 * COMPONENT: CollectionView.vue
 * ==========================================
 * Description:
 * A dedicated gallery for authenticated users to view their saved news
 * articles and curated rose information. Restricted by navigation guards.
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
  data: function () {
    return {
      // Explanation: selectedRose state for the (optional/legacy) detail modal.
      selectedRose: null,
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('auth', ['currentUser']),
    ...mapState('news', ['articles']),
    ...mapGetters('auth', ['isLoggedIn', 'mySavedPostIds']),
    ...mapGetters('news', ['filteredArticles']),

    /**
     * Filters the global news articles to only include those saved by the current user.
     * @returns {Array} List of saved article objects
     */
    savedArticles: function () {
      var self = this
      return this.filteredArticles.filter(function (article) {
        return self.mySavedPostIds.some(function (savedId) {
          return String(savedId) === String(article.id)
        })
      })
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
    isOwner: function (item) {
      if (!this.isLoggedIn) return false
      return this.currentUser.displayName === item.authorName
    },

    /**
     * Closes the rose detail modal.
     */
    closeDetail: function () {
      this.selectedRose = null
    },
  },
}
</script>

<template>
  <div class="position-relative min-vh-100 py-5">
    <!-- Visual Background Layer -->
    <div
      class="position-fixed top-0 start-0 w-100 h-100"
      aria-hidden="true"
      style="
        z-index: -1;
        background: linear-gradient(135deg, #fff5f8 0%, #fce7f3 50%, #f5f3ff 100%);
      "
    ></div>

    <div class="container position-relative z-1 pt-4">
      <!-- Page Header -->
      <div class="mb-5">
        <h1
          class="display-4 fw-bold fst-italic mb-1 animate-fade-up"
          style="font-family: 'Zilla Slab'; color: #333"
        >
          The Collection
        </h1>
        <p class="text-muted fw-normal mb-0" style="font-family: 'Roboto Condensed'">
          A curated gallery of exceptional roses. Members-only access.
        </p>
      </div>

      <!-- Stats Summary -->
      <div class="mb-4">
        <p class="text-muted text-sm" style="font-family: 'Roboto Condensed'">
          Showing saved articles: <strong>{{ savedArticles.length }}</strong> of
          <strong>{{ articles.length }}</strong>
        </p>
      </div>

      <!-- Unauthorized State -->
      <div v-if="!isLoggedIn" class="text-center py-5 animate-fade-up">
        <span class="material-symbols-outlined fs-1 text-muted d-block mb-2">lock</span>
        <p class="text-muted fst-italic text-lg">Please login to view your collection.</p>
      </div>

      <!-- Empty Collection State -->
      <div v-else-if="savedArticles.length === 0" class="text-center py-5 animate-fade-up">
        <span class="material-symbols-outlined fs-1 text-muted d-block mb-2">bookmark_border</span>
        <p class="text-muted fst-italic text-lg">You have no saved articles yet.</p>
      </div>

      <!-- Saved Articles Grid -->
      <div v-if="savedArticles.length > 0" class="mt-5 pt-3 animate-fade-up">
        <div class="mb-4 d-flex align-items-center gap-3">
          <h2
            class="display-5 fw-bold fst-italic mb-0"
            style="font-family: 'Zilla Slab'; color: #333"
          >
            My Collection
          </h2>
          <span class="badge rounded-pill bg-primary px-3 py-2 fs-6 shadow-sm">
            {{ savedArticles.length }} Articles
          </span>
        </div>
        <p class="text-muted mb-5" style="font-family: 'Roboto Condensed'; max-width: 600px">
          A dedicated space for the stories, tips, and inspirations you've saved from our daily news
          feed.
        </p>

        <div class="row g-4">
          <div v-for="item in savedArticles" :key="item.id" class="col-12 col-md-6">
            <NewsCard
              :item="item"
              layout="A"
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
      </div>
    </div>

    <!-- Rose Detail Modal (Legacy/Optional - triggered by specific card interactions) -->
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="selectedRose"
          class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style="z-index: 1055; background: rgba(0, 0, 0, 0.55)"
          role="dialog"
          :aria-label="'Details for ' + selectedRose.name"
          @click.self="closeDetail"
        >
          <div
            class="card border-0 rounded-4 shadow-lg overflow-hidden animate-fade-up"
            style="max-width: 680px; width: 100%"
          >
            <!-- Image Area -->
            <div style="position: relative; height: 280px; overflow: hidden">
              <img
                v-lazy-load="selectedRose.imageUrl"
                :alt="selectedRose.name"
                class="w-100 h-100"
                style="object-fit: cover"
              />
              <div
                style="
                  position: absolute;
                  inset: 0;
                  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
                "
              ></div>
              <button
                class="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3"
                @click="closeDetail"
                aria-label="Close"
                style="width: 36px; height: 36px"
              >
                <span class="material-symbols-outlined fs-6">close</span>
              </button>
              <div class="position-absolute bottom-0 start-0 p-4">
                <h2
                  class="text-white fw-bold display-6 mb-0"
                  style="font-family: 'Zilla Slab'; font-style: italic"
                >
                  {{ selectedRose.name }}
                </h2>
              </div>
            </div>
            <!-- Body Content -->
            <div class="card-body p-4">
              <p
                class="text-muted mb-4"
                style="font-family: 'Roboto Condensed'; font-size: 1rem; line-height: 1.7"
              >
                {{ selectedRose.description }}
              </p>
              <!-- Info grid -->
              <div class="row g-3 text-center">
                <div
                  v-for="info in [
                    { label: 'Type', value: selectedRose.type },
                    { label: 'Color', value: selectedRose.color },
                    { label: 'Fragrance', value: selectedRose.fragrance },
                    { label: 'Bloom', value: selectedRose.bloomSeason },
                    { label: 'Hardiness', value: selectedRose.hardiness },
                  ]"
                  :key="info.label"
                  class="col-4 col-sm"
                >
                  <div class="frosted-glass rounded-3 p-3 h-100">
                    <div class="text-xs text-muted fw-bold text-uppercase ls-1 mb-1">
                      {{ info.label }}
                    </div>
                    <div class="fw-bold text-dark text-sm">{{ info.value }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
