<script>
/**
 * ==========================================
 * COMPONENT: HomeView.vue
 * ==========================================
 * Description:
 * The landing page of the application. Highlights a featured rose (computed
 * from Vuex state based on ratings), latest news snippets (computed from
 * Vuex state based on dates), and integrates the live weather widget.
 * Features a full-height hero section with dynamic navbar offset.
 */
import { mapGetters } from 'vuex'
import WeatherWidget from '@/components/weather/WeatherWidget.vue'
import heroImage22 from '@/assets/images/image22.jpg'

export default {
  name: 'HomeView',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    WeatherWidget,
  },

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Reference for the ResizeObserver cleanup on unmount.
      resizeObserver: null,
      // Explanation: Static data for the hero section banner content.
      heroData: {
        badge: 'EST. 2026',
        titleNormal: 'Sanctuary for the',
        titleHighlight: 'Botanical Mind',
        description:
          'Explore our curated showcase of exquisite roses, read expert planting guides, and discover the perfect additions to your garden.',
        image: heroImage22,
      },
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapGetters('news', ['allArticles']),
    ...mapGetters('auth', ['blockedUserIds']),

    /**
     * Derives the "Rose of the Month" featured profile (Req 2.1).
     * Explanation: Finds the article with the highest rating (or reactions
     * if ratings are tied). Strips HTML and limits description to 160 chars.
     * @returns {Object}
     */
    featuredProfile() {
      const articles = this.allArticles
      if (articles.length === 0) return null

      // Sort by rating descending, then by reactions descending if tied
      const sorted = [...articles].sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        if (ratingB !== ratingA) return ratingB - ratingA

        const reactA = a.reactions || 0
        const reactB = b.reactions || 0
        return reactB - reactA
      })

      const best = sorted[0]
      const strippedContent = (best.content || best.description || '').replace(/<[^>]*>/g, '')

      return {
        id: best.id,
        title: best.title,
        description:
          strippedContent.substring(0, 160) + (strippedContent.length > 160 ? '...' : ''),
        image: best.images?.[0] || best.image || '',
        link: `/news#post-${best.id}`,
      }
    },

    /**
     * Derives the "Latest Posts" sidebar content (Req 2.2).
     * Explanation: Takes the 2 most recently dated articles that are public,
     * approved, and authored by non-blocked users.
     * @returns {Array<Object>}
     */
    publications() {
      const articles = this.allArticles
      const blockedIds = this.blockedUserIds || []

      const validLatest = articles
        .filter((a) => {
          return (
            a.isPublic !== false &&
            a.moderation?.status !== 'blocked' &&
            !blockedIds.includes(a.authorID)
          )
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2)

      return validLatest.map((a) => {
        const strippedContent = (a.content || a.description || '').replace(/<[^>]*>/g, '')
        return {
          id: a.id,
          category: (a.type || a.category || 'ROSE NEWS').toUpperCase(),
          title: a.title,
          description:
            strippedContent.substring(0, 80) + (strippedContent.length > 80 ? '...' : ''),
          image: a.images?.[0] || a.image || '',
          link: `/news#post-${a.id}`,
        }
      })
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Calculates the sticky navbar height and sets a CSS variable.
     * Explanation: Ensures the full-height sections fit the screen correctly
     * by subtracting the navbar height from 100vh.
     */
    updateNavbarHeight() {
      const navbar = document.querySelector('.navbar.sticky-top')
      if (navbar && this.$refs.homeRef) {
        const h = navbar.getBoundingClientRect().height
        this.$refs.homeRef.style.setProperty('--nav-h', `${h}px`)
      }
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted() {
    // Explanation: Initialise ResizeObserver to react to navbar resizing.
    const navbar = document.querySelector('.navbar.sticky-top')
    if (navbar) {
      this.resizeObserver = new ResizeObserver(this.updateNavbarHeight)
      this.resizeObserver.observe(navbar)
    }
    this.updateNavbarHeight()
  },

  unmounted() {
    // Explanation: Cleanup observer to prevent memory leaks.
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  },
}
</script>

<template>
  <div ref="homeRef">
    <!-- HERO SECTION -->
    <section
      class="full-height-section position-relative overflow-hidden bg-dark d-flex flex-column justify-content-center hero-banner"
      :style="{ backgroundImage: 'url(' + heroData.image + ')' }"
      aria-label="Welcome to The Rose Blog"
    >
      <div class="container position-relative z-1 d-flex flex-column flex-grow-1 py-0 px-5 px-lg-3">
        <div class="row d-flex flex-column flex-lg-row flex-grow-1">
          <div
            class="col-12 col-lg-8 d-flex flex-column justify-content-center flex-grow-1 animate-fade-up"
          >
            <div>
              <span
                class="badge text-md bg-white text-dark px-3 py-2 rounded-pill fw-bolder my-3 shadow-sm"
              >
                {{ heroData.badge }}
              </span>
              <h1 class="fs-2 text-gray-200 fw-bold text-break">
                {{ heroData.titleNormal }} <br />
                <span class="display-3 fw-bold text-secondary">{{ heroData.titleHighlight }}</span>
              </h1>
              <p class="fs-6 fs-lg-5 text-gray-300 fw-medium w-100 hero-subtitle">
                {{ heroData.description }}
              </p>
              <router-link
                to="/collection"
                class="btn rounded-pill btn-primary px-4 py-2 m-0 text-md fw-bold text-white text-uppercase shadow-sm ls-1"
                aria-label="Explore our rose collection"
              >
                Explore Collection
              </router-link>
            </div>
          </div>

          <!-- SIDEBAR with Weather -->
          <div
            class="col-12 col-lg-4 d-flex flex-column flex-grow-1 justify-content-start justify-content-lg-center"
          >
            <WeatherWidget class="home-weather-widget" />
          </div>
        </div>
      </div>
    </section>

    <!-- CONTENT SECTION (Rose of the Month & Latest Posts) -->
    <section
      class="bg-white full-height-section d-flex flex-column justify-content-center py-5 py-xl-0"
      aria-label="Editorial Content"
    >
      <div class="container">
        <div class="row align-items-stretch mx-2 mx-lg-0 gx-lg-5 gy-5 gy-lg-0">
          <!-- Featured Rose Card (Req 2.1) -->
          <article v-if="featuredProfile" class="col-12 col-lg-6 col-xl-5 d-flex flex-column px-4">
            <div class="d-flex align-items-center gap-3 mb-4">
              <h2 class="fs-4 fw-bolder mb-0 text-dark">Rose of the Month</h2>
              <div class="flex-grow-1 border-bottom border-2 border-primary"></div>
            </div>

            <div
              class="card img-zoom-hover border-0 rounded-4 overflow-hidden shadow-sm position-relative flex-grow-1 d-flex bg-dark featured-card-min"
            >
              <img
                :src="featuredProfile.image"
                alt="Thumbnail for Rose of the Month"
                class="position-absolute w-100 h-100 object-fit-cover img-zoom featured-bg-img"
              />
              <div class="position-relative mt-auto w-100 px-4 py-4 px-md-5 z-1 featured-overlay">
                <h3 class="text-white fw-bold display-7 mb-1 font-zilla fst-italic">
                  {{ featuredProfile.title }}
                </h3>
                <p class="text-white text-md opacity-75 mb-3 fw-medium font-roboto">
                  {{ featuredProfile.description }}
                </p>
                <router-link
                  :to="featuredProfile.link"
                  class="btn btn-outline-light rounded-pill px-4 py-2 fw-bold"
                  :aria-label="'Read full guide on ' + featuredProfile.title"
                >
                  Read Full Guide
                </router-link>
              </div>
            </div>
          </article>

          <!-- Latest Posts Sidebar (Req 2.2) -->
          <div class="col-12 col-lg-6 col-xl-7 d-flex flex-column px-4">
            <div class="d-flex align-items-center gap-3 mb-3">
              <h2 class="fs-4 fw-bolder mb-0 text-dark">Latest Posts</h2>
              <div class="flex-grow-1 border-bottom border-2 border-primary"></div>
            </div>

            <div class="d-flex flex-column justify-content-between flex-grow-1 gap-3">
              <!-- Post Loop -->
              <article
                v-for="item in publications"
                :key="item.id"
                class="card card-hover border-0 bg-transparent h-100 p-1 rounded-4"
              >
                <router-link
                  :to="item.link"
                  class="text-decoration-none d-block h-100"
                  :aria-label="'Read article: ' + item.title"
                >
                  <div class="row g-0 align-items-center h-100">
                    <div
                      class="col-4 col-md-3 col-lg-4 h-100 overflow-hidden rounded-3 shadow-sm latest-img-container"
                    >
                      <img
                        v-lazy-load="item.image"
                        :alt="'Thumbnail for ' + item.title"
                        class="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div class="col-8 col-md-9 col-lg-8 ps-3 ps-md-4">
                      <p
                        class="fw-bolder mb-1 text-uppercase text-primary ls-wide text-sm font-roboto"
                        aria-hidden="true"
                      >
                        {{ item.category }}
                      </p>
                      <h3 class="h5 fw-bold text-dark mb-2 font-zilla fst-italic">
                        {{ item.title }}
                      </h3>
                      <p class="small mb-0 fw-medium text-muted font-roboto">
                        {{ item.description }}
                      </p>
                    </div>
                  </div>
                </router-link>
              </article>
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

/* Explanation: Responsive height logic ensuring consistent fullscreen sections. */
.full-height-section {
  min-height: calc(100vh - var(--nav-h, 0px));
  min-height: calc(100dvh - var(--nav-h, 0px));
}

.hero-banner {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom left, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.6));
  }
}

.hero-subtitle {
  max-width: 660px;
}

.home-weather-widget {
  max-width: 335px;
}

.featured-card-min {
  min-height: 50vh;
}

.featured-bg-img {
  opacity: 0.65;
}

.featured-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
}

.latest-img-container {
  height: 100px; // Standard height for latest posts list
}
</style>
