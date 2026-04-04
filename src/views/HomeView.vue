<script>
/**
 * ==========================================
 * COMPONENT: HomeView.vue
 * ==========================================
 * Description:
 * The landing page of The Rose Blog. Features a heroic sanctuary vision,
 * a weather-driven gardening assistant, and a curated feed of the latest
 * news and guides.
 *
 * Requirements (Issue 6):
 *  - Compute 'featuredProfile' and 'publications' directly from Vuex newsItems.
 *  - Use hash-based navigation Links (/news#post-101) to scroll to exact items.
 */
import WeatherWidget from '@/components/weather/WeatherWidget.vue'

export default {
  name: 'HomeView',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    WeatherWidget,
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    /**
     * Filters the raw news items to only those that are publicly visible.
     * @returns {Array} All public, non-blocked, approved news items.
     */
    _publicFeed() {
      const blockedIds = this.$store.getters['auth/blockedUserIds'] || []
      return this.$store.getters['news/allNewsItems'].filter((a) => {
        const isPublic = a.isPublic !== false
        const isApproved = a.moderation?.status === 'approved' || !a.moderation
        const isAuthorBlocked = blockedIds.includes(a.authorID)
        return isPublic && isApproved && !isAuthorBlocked
      })
    },

    /**
     * Identifies the highest-rated (or most popular) post as the featured guide.
     * @returns {Object|null}
     */
    featuredProfile() {
      const feed = [...this._publicFeed]
      if (feed.length === 0) return null

      const winner = feed.sort((a, b) => {
        const scoreA = a.rating ?? a.reactions ?? 0
        const scoreB = b.rating ?? b.reactions ?? 0
        return scoreB - scoreA
      })[0]

      const plain = (winner.content || winner.description || '').replace(/<[^>]*>/g, '')
      return {
        title: winner.title,
        description: plain.substring(0, 160) + '...',
        image: winner.images?.[0] || winner.image || '',
        link: `/news#post-${winner.id}`,
      }
    },

    /**
     * Latest two publications for the "Recent News" cards.
     * @returns {Array}
     */
    publications() {
      const feed = [...this._publicFeed]
      return feed
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2)
        .map((a) => ({
          id: a.id,
          category: a.type || a.category || 'Rose News',
          title: a.title,
          description:
            (a.content || a.description || '').replace(/<[^>]*>/g, '').substring(0, 80) + '...',
          image: a.images?.[0] || a.image || '',
          link: `/news#post-${a.id}`,
        }))
    },
  },
}
</script>

<template>
  <div class="home-view overflow-hidden">
    <!-- Hero Section -->
    <header class="hero-section min-vh-100 d-flex align-items-center position-relative pb-5">
      <div class="container pt-5">
        <div class="row align-items-center g-5">
          <!-- Hero Text -->
          <div class="col-lg-6 animate-fade-up">
            <h1 class="display-3 fw-bold fst-italic mb-4 font-zilla text-dark lh-tight">
              A Petal for Your <span class="text-primary">Thoughts</span>
            </h1>
            <p class="fs-4 text-muted mb-5 font-roboto about-body-text">
              Welcome to The Rose Blog — a digital sanctuary dedicated to the timeless elegance of
              the world's most beloved flower. Discover pruning wisdom, botanical updates, and a
              community passionate about every bloom.
            </p>
            <div class="d-flex flex-row flex-wrap gap-3">
              <router-link
                to="/news"
                class="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg ls-1 text-uppercase"
              >
                Join the Garden
              </router-link>
              <router-link
                to="/about"
                class="btn btn-outline-primary rounded-pill px-5 py-3 fw-bold ls-1 text-uppercase"
              >
                Our Story
              </router-link>
            </div>
          </div>

          <!-- Hero Widget Area -->
          <div class="col-lg-5 offset-lg-1 animate-fade-up">
            <WeatherWidget />
          </div>
        </div>
      </div>
    </header>

    <!-- Curated Feed Section -->
    <section class="feed-section py-5 bg-white position-relative" id="guides">
      <!-- Decorative background -->
      <div
        class="bg-light-stripe position-absolute top-0 w-100 h-50 opacity-25"
        aria-hidden="true"
      ></div>

      <div class="container position-relative z-1 pt-5">
        <!-- Section Header -->
        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-end mb-5 gap-3"
        >
          <div class="section-title-wrapper">
            <span class="text-primary text-uppercase fw-bold ls-wide small">The Collective</span>
            <h2 class="display-5 fw-bold fst-italic font-zilla text-dark mb-0">Petals & Prose</h2>
          </div>
          <router-link
            to="/news"
            class="btn btn-link text-primary text-decoration-none fw-bold p-0"
          >
            View full sanctuary catalogue →
          </router-link>
        </div>

        <div class="row g-4">
          <!-- Featured Profile Card -->
          <div class="col-12 col-lg-7" v-if="featuredProfile">
            <div
              class="featured-card position-relative overflow-hidden rounded-5 shadow-lg h-100 group card-hover"
            >
              <img
                v-lazy-load="featuredProfile.image"
                class="w-100 h-100 object-fit-cover transition-slow group-hover-scale"
                alt="Featured Botanical Profile"
              />
              <div
                class="position-absolute bottom-0 start-0 w-100 p-5 pt-5 overlay-gradient text-white"
              >
                <span
                  class="badge glassmorphism-pink text-primary fw-bold px-3 py-2 rounded-pill mb-3 text-sm"
                >
                  Rose of the Month
                </span>
                <h3 class="display-6 fw-bold fst-italic font-zilla mb-3">
                  {{ featuredProfile.title }}
                </h3>
                <p class="text-white-50 font-roboto mw-480 mb-4 lh-lg">
                  {{ featuredProfile.description }}
                </p>
                <router-link
                  :to="featuredProfile.link"
                  class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                >
                  Read Full Guide
                </router-link>
              </div>
            </div>
          </div>

          <!-- Latest Publications Column -->
          <div class="col-12 col-lg-5">
            <div class="d-flex flex-column gap-4 h-100">
              <div
                v-for="item in publications"
                :key="item.id"
                class="publication-card frosted-glass rounded-5 p-4 shadow-sm border border-white h-50 d-flex flex-column justify-content-center transition-base card-hover"
              >
                <div class="d-flex column gap-3">
                  <div class="flex-grow-1">
                    <span class="text-primary text-uppercase fw-bold ls-1 x-small d-block mb-1">
                      {{ item.category }}
                    </span>
                    <h4 class="h5 fw-bold fst-italic font-zilla text-dark mb-2">
                      {{ item.title }}
                    </h4>
                    <p class="text-muted small font-roboto mb-3 line-clamp-2">
                      {{ item.description }}
                    </p>
                    <router-link
                      :to="item.link"
                      class="btn btn-xs btn-link text-primary text-decoration-none fw-bold p-0"
                    >
                      Explore Post →
                    </router-link>
                  </div>
                  <div class="publication-img rounded-4 overflow-hidden shadow-sm flex-shrink-0">
                    <img
                      v-lazy-load="item.image"
                      class="w-100 h-100 object-fit-cover"
                      :alt="item.title"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';

/* Hero Section background and height */
.hero-section {
  background: radial-gradient(
    circle at 10% 20%,
    rgba(255, 237, 245, 1) 0%,
    rgba(255, 255, 255, 1) 70%
  );
}

.bg-light-stripe {
  background: linear-gradient(180deg, #f8f9fa 0%, transparent 100%);
}

.overlay-gradient {
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 60%,
    transparent 100%
  );
}

/* Specific card heights and transitions */
.featured-card {
  min-height: 500px;
}

.group-hover-scale {
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.featured-card:hover .group-hover-scale {
  transform: scale(1.05);
}

.publication-card {
  border-width: 1.5px !important;
}

.publication-img {
  width: 100px;
  height: 100px;
}

.x-small {
  font-size: 0.7rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@include media-breakpoint-down(lg) {
  .hero-section {
    padding-top: 5rem;
    min-height: auto;
  }
  .featured-card {
    min-height: 400px;
  }
}
</style>
