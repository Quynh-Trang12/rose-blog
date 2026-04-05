<script>
/**
 * ==========================================
 * COMPONENT: HomeView.vue
 * ==========================================
 * Description:
 * This file combines the best features from both versions:
 * - Full-screen background image with dynamic height calculation (ResizeObserver).
 * - 66% / 33% layout split in the hero section with two action buttons.
 * - Featured post and Latest posts with external titles and blue horizontal dividers.
 * - Frosted glass design for latest news, with text on the left and a square image on the right.
 */
import { mapGetters } from 'vuex'
import WeatherWidget from '@/components/weather/WeatherWidget.vue'
import heroImage22 from '@/assets/images/image22.jpg'

export default {
  name: 'HomeView',

  components: {
    WeatherWidget,
  },

  data() {
    return {
      // Reference for the ResizeObserver to clean up on unmount
      resizeObserver: null,
      // Static data for the hero section
      heroData: {
        image: heroImage22,
      },
    }
  },

  computed: {
    // Vuex helpers for cleaner state access
    ...mapGetters('news', ['allNewsItems']),
    ...mapGetters('auth', ['blockedUserIds']),

    /**
     * Filters the raw news items to only those that are publicly visible.
     */
    _publicFeed() {
      const blockedIds = this.blockedUserIds || []
      const items = this.allNewsItems || []

      return items.filter((a) => {
        const isPublic = a.isPublic !== false
        const isApproved = a.moderation?.status === 'approved' || !a.moderation
        const isAuthorBlocked = blockedIds.includes(a.authorID)
        return isPublic && isApproved && !isAuthorBlocked
      })
    },

    /**
     * Identifies the highest-rated post to use as the Featured Guide.
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
     * Fetches the 2 most recent publications for the "Latest Posts" column.
     * @returns {Array}
     */
    publications() {
      const feed = [...this._publicFeed]
      return feed
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2)
        .map((a) => ({
          id: a.id,
          category: (a.type || a.category || 'Rose News').toUpperCase(),
          title: a.title,
          description:
            (a.content || a.description || '').replace(/<[^>]*>/g, '').substring(0, 80) + '...',
          image: a.images?.[0] || a.image || '',
          link: `/news#post-${a.id}`,
        }))
    },
  },

  methods: {
    /**
     * Calculates the sticky navbar height and sets a CSS variable
     * to ensure the hero section fits exactly 100% of the viewport.
     */
    updateNavbarHeight() {
      const navbar = document.querySelector('.navbar.sticky-top')
      if (navbar && this.$refs.homeRef) {
        const h = navbar.getBoundingClientRect().height
        this.$refs.homeRef.style.setProperty('--nav-h', `${h}px`)
      }
    },
  },

  mounted() {
    // Initialize ResizeObserver when the component mounts
    const navbar = document.querySelector('.navbar.sticky-top')
    if (navbar) {
      this.resizeObserver = new ResizeObserver(this.updateNavbarHeight)
      this.resizeObserver.observe(navbar)
    }
    this.updateNavbarHeight()
  },

  unmounted() {
    // Clean up observer to prevent memory leaks
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  },
}
</script>

<template>
  <div ref="homeRef">
    <!-- HERO SECTION -->
    <header
      class="full-height-section hero-banner position-relative d-flex align-items-center"
      :style="{ backgroundImage: 'url(' + heroData.image + ')' }"
      aria-label="Welcome to The Rose Blog"
    >
      <div class="container position-relative z-1 pt-5 pb-5">
        <div class="row align-items-center g-5">
          <!-- Hero Text -->
          <div class="col-12 col-lg-8 animate-fade-up text-white">
            <h1 class="display-3 fw-bold fst-italic mb-3 font-zilla lh-tight">
              A Petal for<br /><span class="text-primary">Your Thoughts</span>
            </h1>
            <p class="fs-5 text-gray-300 mb-4 font-roboto mw-600">
              Welcome to The Rose Blog — a digital collection dedicated to the timeless elegance of
              the world's timeless flower. Discover pruning techniques, botanical updates, and a
              community passionate about every bloom.
            </p>
            <div class="d-flex flex-row flex-wrap gap-2 gap-lg-3">
              <router-link
                to="/news"
                class="btn btn-primary rounded-pill text-sm px-4 py-3 fw-bold shadow-lg ls-1 text-uppercase"
              >
                Join the Garden
              </router-link>
              <router-link
                to="/about"
                class="btn btn-outline-secondary rounded-pill px-4 py-3 text-sm fw-bold ls-1 text-uppercase"
              >
                Our Story
              </router-link>
            </div>
          </div>

          <!-- Hero Widget Area -->
          <div class="col-12 col-lg-4 animate-fade-up d-flex">
            <WeatherWidget class="w-100 mw-300" />
          </div>
        </div>
      </div>
    </header>

    <!-- CONTENT SECTION (Rose of the Month & Latest Posts) -->
    <section
      class="bg-white full-height-section d-flex flex-column justify-content-center py-5 py-xl-0"
      id="guides"
      aria-label="Editorial Content"
    >
      <div class="container">
        <div class="row align-items-stretch">
          <!-- Featured Profile Card -->
          <article v-if="featuredProfile" class="col-12 col-lg-6 col-xl-5 d-flex flex-column px-4">
            <div class="d-flex align-items-center gap-3 mb-4">
              <h2 class="fs-4 fw-bolder mb-0 text-dark">Rose of the Month</h2>
              <div class="flex-grow-1 border-bottom border-2 border-primary"></div>
            </div>

            <div
              class="card img-zoom-hover rounded-4 overflow-hidden shadow-lg position-relative flex-grow-1 d-flex bg-dark"
            >
              <img
                v-lazy-load="featuredProfile.image"
                alt="Featured Botanical Profile"
                class="position-absolute w-100 h-100 object-fit-cover img-zoom opacity-75"
              />
              <div
                class="position-relative mt-auto w-100 p-4 px-md-5 z-1 overlay-gradient text-gray-300"
              >
                <h3 class="fw-bold display-6 mb-2 font-zilla fst-italic">
                  {{ featuredProfile.title }}
                </h3>
                <p class="mw-480 text-md opacity-75 mb-3 fw-medium font-roboto lh-lg">
                  {{ featuredProfile.description }}
                </p>
                <router-link
                  :to="featuredProfile.link"
                  class="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                  :aria-label="'Read full guide on ' + featuredProfile.title"
                >
                  Read Full Guide
                </router-link>
              </div>
            </div>
          </article>

          <!-- Latest Publications Column -->
          <div class="col-12 col-lg-6 col-xl-7 d-flex flex-column px-5">
            <div class="d-flex align-items-center gap-3 mb-4">
              <h2 class="fs-4 fw-bolder mb-0 text-dark">Latest Posts</h2>
              <div class="flex-grow-1 border-bottom border-2 border-primary"></div>
            </div>

            <div class="d-flex flex-column justify-content-between flex-grow-1 gap-3 h-100">
              <div
                v-for="item in publications"
                :key="item.id"
                class="publication-card frosted-glass border border-2 border-white rounded-5 p-4 shadow-sm d-flex flex-column justify-content-center transition-base card-hover"
              >
                <div class="d-flex flex-row align-items-center gap-4">
                  <div class="flex-grow-1">
                    <span
                      class="text-primary text-uppercase fw-bold ls-1 x-small d-block mb-1 font-roboto"
                    >
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

/* Dynamic height adjustment to subtract the navbar height */
.full-height-section {
  min-height: calc(100vh - var(--nav-h, 0px));
  min-height: calc(100dvh - var(--nav-h, 0px));
}

/* Set up the real background image and apply a dark fade overlay */
.hero-banner {
  background-color: radial-gradient(
    circle at 10% 20%,
    rgba($red-700, 1) 0%,
    rgba($pink-100, 1) 60%
  );
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Creates a dark overlay fading from 80% opacity to 30% opacity */
  background: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3));
}

/* Bottom gradient overlay for the featured post image */
.overlay-gradient {
  background: linear-gradient(to top, rgba($black, 0.9) 0%, rgba($black, 0.4) 60%, transparent);
}

// /* Minimum height constraint for the featured card */
// .featured-card {
//   min-height: 450px;
// }

.group-hover-scale {
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.featured-card:hover .group-hover-scale {
  transform: scale(1.05);
}

/* Frosted glass effect for latest news cards */
.publication-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Fixed dimensions for the right-side images */
.publication-img {
  width: 100px;
  height: 100px;
}

.x-small {
  font-size: 0.75rem;
}

/* Truncates description text if it exceeds two lines */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
