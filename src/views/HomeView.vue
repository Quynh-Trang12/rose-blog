<script>
/**
 * ==========================================
 * COMPONENT: HomeView.vue
 * ==========================================
 * Description:
 * The landing page of the application. Highlighting featured roses,
 * latest news snippets, and integrating the live weather widget.
 * Features a full-height hero section with dynamic navbar offset.
 */
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
  data: function () {
    return {
      resizeObserver: null,
      // Explanation: Static data for the hero section
      heroData: {
        badge: 'EST. 2026',
        titleNormal: 'Sanctuary for the',
        titleHighlight: 'Botanical Mind',
        description:
          'Explore our curated showcase of exquisite roses, read expert planting guides, and discover the perfect additions to your garden.',
        image: heroImage22,
      },
      // Explanation: Data for the featured rose article
      featuredProfile: {
        title: 'The Pink Paradise',
        description:
          'A compact bush rose known for exceptional disease resistance and continuous blooming cycle from early spring to late fall.',
        image:
          'https://images.unsplash.com/photo-1697557167328-eafb1f94a731?ixlib=rb-4.1.0&auto=format&fit=crop&w=1080&q=80',
        link: '/collection',
      },
      // Explanation: Mock publications list
      publications: [
        {
          id: 1,
          category: 'PLANTING GUIDE',
          title: 'How to Prune the White Elegance',
          description: 'Learn the best techniques for encouraging new growth...',
          image:
            'https://images.unsplash.com/photo-1623945392355-12af183b7acd?ixlib=rb-4.1.0&auto=format&fit=crop&w=300&q=80',
          link: '/news',
        },
        {
          id: 2,
          category: 'SHOP UPDATE',
          title: 'Ruby Romance is Back in Stock!',
          description: 'Our most requested deep red climbing rose is available...',
          image:
            'https://images.unsplash.com/photo-1662110497736-06601647fe27?ixlib=rb-4.1.0&auto=format&fit=crop&w=300&q=80',
          link: '/news',
        },
      ],
    }
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Calculates the sticky navbar height and sets a CSS variable.
     * Explanation: Ensures the sections fit the screen flawlessly on all devices.
     */
    updateNavbarHeight: function () {
      var navbar = document.querySelector('.navbar.sticky-top')
      if (navbar && this.$refs.homeRef) {
        var h = navbar.getBoundingClientRect().height
        this.$refs.homeRef.style.setProperty('--nav-h', h + 'px')
      }
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted: function () {
    // Explanation: Initialize ResizeObserver to react to navbar resizing.
    var navbar = document.querySelector('.navbar.sticky-top')
    if (navbar) {
      this.resizeObserver = new ResizeObserver(this.updateNavbarHeight)
      this.resizeObserver.observe(navbar)
    }
    this.updateNavbarHeight()
  },

  unmounted: function () {
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
      class="full-height-section position-relative overflow-hidden bg-dark d-flex flex-column justify-content-center"
      :style="{
        background:
          'linear-gradient(to bottom left, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(' +
          heroData.image +
          ') center/cover no-repeat',
      }"
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
              <p class="fs-6 fs-lg-5 text-gray-300 fw-medium w-100" style="max-width: 660px">
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
            <WeatherWidget style="max-width: 335px" />
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
          <!-- Featured Rose Card -->
          <article class="col-12 col-lg-6 col-xl-5 d-flex flex-column px-4">
            <div class="d-flex align-items-center gap-3 mb-4">
              <h2 class="fs-4 fw-bolder mb-0 text-dark">Rose of the Month</h2>
              <div class="flex-grow-1 border-bottom border-2 border-primary"></div>
            </div>

            <div
              class="card img-zoom-hover border-0 rounded-4 overflow-hidden shadow-sm position-relative flex-grow-1 d-flex bg-dark"
              style="min-height: 50vh"
            >
              <img
                :src="featuredProfile.image"
                alt="Thumbnail for Rose of the Month"
                class="position-absolute w-100 h-100 object-fit-cover img-zoom"
                style="opacity: 0.65"
              />
              <div
                class="position-relative mt-auto w-100 px-4 py-4 px-md-5 z-1"
                style="background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)"
              >
                <h3 class="text-white fw-bold display-7 mb-1">{{ featuredProfile.title }}</h3>
                <p class="text-white text-md opacity-75 mb-3 fw-medium">
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

          <!-- Latest Posts Sidebar -->
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
                    <div class="col-4 col-md-3 col-lg-4 h-100 overflow-hidden rounded-3 shadow-sm">
                      <img
                        v-lazy-load="item.image"
                        :alt="'Thumbnail for ' + item.title"
                        class="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div class="col-8 col-md-9 col-lg-8 ps-3 ps-md-4">
                      <p
                        class="fw-bolder mb-1 text-uppercase text-primary ls-wide text-sm"
                        aria-hidden="true"
                      >
                        {{ item.category }}
                      </p>
                      <h3 class="h5 fw-bolder text-dark mb-2">{{ item.title }}</h3>
                      <p class="small mb-0 fw-medium text-muted">{{ item.description }}</p>
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

<style scoped>
/* Explanation: Responsive height logic ensuring consistent fullscreen sections. */
.full-height-section {
  min-height: calc(100vh - var(--nav-h, 0px));
  min-height: calc(100dvh - var(--nav-h, 0px));
}
</style>
