<script>
/**
 * ==========================================
 * COMPONENT: AboutView.vue
 * ==========================================
 * Description:
 * The static About page for The Rose Blog. Shares the vision, history,
 * and mission. Includes interactive visitor welcome form and rose type
 * selection (COS30043 Stage 1 requirements).
 */

export default {
  name: 'AboutView',

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Two-way bound fields for the visitor welcome form.
      firstName: '',
      lastName: '',
      // Explanation: Track touched state for input validation feedback.
      touched: {
        firstName: false,
        lastName: false,
      },
      // Explanation: Currently selected rose type (COS30043 radio button requirement).
      selectedRoseType: 'bush',
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    /**
     * Constructs a dynamic welcome message based on visitor input.
     * Explanation: Fulfills the "greeting based on user name input" requirement.
     * @returns {string} The formatted welcome message or empty string.
     */
    welcomeMessage() {
      const fn = this.firstName.trim()
      const ln = this.lastName.trim()
      if (!fn && !ln) return ''
      if (fn && !ln) return `Hello, ${fn}!`
      return `Hello, ${fn} ${ln}! Welcome to The Rose Blog. 🌹`
    },

    /**
     * Determines which image to display based on the selected radio button.
     * @returns {string}
     */
    selectedRoseImage() {
      return this.selectedRoseType === 'climbing'
        ? '/src/assets/images/image10.jpg'
        : '/src/assets/images/image5.jpg'
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Navigates to the news feed with a pre-applied category filter.
     * Explanation: Triggers both a store dispatch and router navigation.
     */
    exploreRoses() {
      const categoryMap = {
        bush: 'Bush Rose',
        climbing: 'Climbing Rose',
      }
      const cat = categoryMap[this.selectedRoseType]
      // Requirement (Issue reset): Correct store dispatch signature
      this.$store.dispatch('news/applyFilters', { filters: { category: cat }, target: 'news' })
      this.$router.push({ path: '/news', query: { category: cat } })
    },
  },
}
</script>

<template>
  <div class="about-view min-vh-100 py-5 position-relative overflow-hidden">
    <div class="container position-relative z-1 pt-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8 animate-fade-up">
          <!-- Section 1: Vision & History -->
          <div class="text-center mb-5">
            <h1 class="display-4 fw-bold fst-italic mb-3 font-zilla text-dark">
              Our Botanical Story
            </h1>
            <div class="mx-auto border-bottom border-primary border-4 about-divider mb-4"></div>
            <p class="text-muted lh-xl font-roboto fs-5">
              Est. 2026 — A digital sanctuary for rose lovers worldwide. Our mission is to
              democratize rose care knowledge, providing expert-level guidance that is accessible to
              every level of gardener.
            </p>
          </div>

          <!-- Section 2: Visitor Welcome Form -->
          <div class="frosted-glass rounded-4 p-4 p-md-5 shadow-sm mb-5">
            <h2 class="fs-3 fw-bold mb-4 font-zilla fst-italic">Visitor Welcome</h2>
            <div class="row g-3 mb-4">
              <div class="col-12 col-md-6">
                <label
                  class="form-label font-roboto fw-bold text-sm text-uppercase small"
                  for="firstName"
                  >First Name</label
                >
                <input
                  id="firstName"
                  type="text"
                  class="form-control rounded-pill border-2 p-2 px-3"
                  :class="{
                    'is-valid': touched.firstName && firstName.trim(),
                    'is-invalid': touched.firstName && !firstName.trim(),
                  }"
                  v-model="firstName"
                  @blur="touched.firstName = true"
                  placeholder="e.g. John"
                />
              </div>
              <div class="col-12 col-md-6">
                <label
                  class="form-label font-roboto fw-bold text-sm text-uppercase small"
                  for="lastName"
                  >Last Name</label
                >
                <input
                  id="lastName"
                  type="text"
                  class="form-control rounded-pill border-2 p-2 px-3"
                  :class="{ 'is-valid': touched.lastName && lastName.trim() }"
                  v-model="lastName"
                  @blur="touched.lastName = true"
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            <transition name="fade">
              <div
                v-show="welcomeMessage"
                class="welcome-message text-center p-3 rounded-3 bg-primary bg-opacity-10 mb-2"
              >
                <div class="h5 fw-bold font-zilla fst-italic mb-0 text-primary animate-fade-up">
                  {{ welcomeMessage }}
                </div>
              </div>
            </transition>
          </div>

          <!-- Section 3: Rose Type Selection (Radio buttons) -->
          <fieldset class="frosted-glass rounded-4 p-4 p-md-5 shadow-sm mb-5 border-0">
            <legend class="visually-hidden">Find Your Perfect Rose Variety</legend>
            <h2 class="fs-3 fw-bold mb-4 font-zilla fst-italic">Find Your Perfect Rose</h2>
            <p class="text-muted mb-4 font-roboto">
              Select which rose variety you wish to explore:
            </p>

            <div class="row g-4">
              <!-- Bush Rose Radio Option -->
              <div class="col-12 col-md-6">
                <label
                  class="rose-selector-card rounded-4 p-3 border h-100 d-flex flex-column align-items-center text-center cursor-pointer transition-base"
                  :class="{ active: selectedRoseType === 'bush' }"
                  for="roseTypeBush"
                >
                  <input
                    id="roseTypeBush"
                    type="radio"
                    name="roseType"
                    value="bush"
                    v-model="selectedRoseType"
                    class="visually-hidden"
                  />
                  <div class="rose-selector-img-box rounded-3 overflow-hidden mb-3">
                    <img
                      v-lazy-load="'/src/assets/images/image5.jpg'"
                      class="w-100 h-100 object-fit-cover"
                      :alt="'Image for ' + selectedRoseType + 'rose type'"
                    />
                  </div>
                  <h3 class="h5 fw-bold font-zilla fst-italic">Bush Rose</h3>
                  <p class="small text-muted font-roboto px-2 mb-0">
                    Compact, fragrant, and perfect for containers or borders.
                  </p>
                </label>
              </div>

              <!-- Climbing Rose Radio Option -->
              <div class="col-12 col-md-6">
                <label
                  class="rose-selector-card rounded-4 p-3 border h-100 d-flex flex-column align-items-center text-center cursor-pointer transition-base"
                  :class="{ active: selectedRoseType === 'climbing' }"
                  for="roseTypeClimbing"
                >
                  <input
                    id="roseTypeClimbing"
                    type="radio"
                    name="roseType"
                    value="climbing"
                    v-model="selectedRoseType"
                    class="visually-hidden"
                  />
                  <div class="rose-selector-img-box rounded-3 overflow-hidden mb-3">
                    <img
                      v-lazy-load="'/src/assets/images/image10.jpg'"
                      class="w-100 h-100 object-fit-cover"
                      alt="Image for climbing rose type"
                    />
                  </div>
                  <h3 class="h5 fw-bold font-zilla fst-italic">Climbing Rose</h3>
                  <p class="small text-muted font-roboto px-2 mb-0">
                    Dramatic vertical growth for fences, pergolas, and walls.
                  </p>
                </label>
              </div>
            </div>

            <!-- Featured Selection Display -->
            <div class="text-center mt-5">
              <div
                class="position-relative d-inline-block featured-rose-box rounded-circle overflow-hidden mb-4 shadow-lg"
              >
                <img
                  :src="selectedRoseImage"
                  class="w-100 h-100 object-fit-cover"
                  alt="Selected Rose"
                />
              </div>
              <div class="mt-2">
                <button
                  type="button"
                  @click="exploreRoses"
                  class="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-sm"
                >
                  Explore {{ selectedRoseType === 'climbing' ? 'Climbing' : 'Bush' }} Roses →
                </button>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

.about-view {
  background: linear-gradient(135deg, $red-500 0%, $pink-100 100%);
}

.about-divider {
  width: 80px;
}

.rose-selector-card {
  background: #fff;
  border-color: #eee !important;
  cursor: pointer;

  &:hover {
    border-color: var(--bs-primary) !important;
    background-color: rgba(226, 6, 95, 0.02);
  }

  &.active {
    border-color: var(--bs-primary) !important;
    border-width: 2px !important;
    background-color: rgba(226, 6, 95, 0.05);
  }
}

.rose-selector-img-box {
  width: 100%;
  aspect-ratio: 16/10;
}

.featured-rose-box {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  border: 8px solid rgba(255, 255, 255, 0.8);
}

.cursor-pointer {
  cursor: pointer;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
