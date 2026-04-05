<script>
/**
 * ==========================================
 * COMPONENT: AppNavBar.vue
 * ==========================================
 * Description:
 * The main application navigation bar. Handles routing, responsive menu
 * toggling with an absolute-positioned mobile overlay (prevents page push),
 * desktop slider animations for hover effects, and orchestrates the
 * authentication modal visibility.
 *
 * Requirements (Issue 2, Bug F):
 *  - Fixed: slider state becomes stale after logout.
 *  - Fixed: navbar brand dims when hamburger menu opens.
 *  - Remove all Admin links and features.
 */
import { mapGetters, mapActions } from 'vuex'
import AuthModal from '@/components/auth/AuthModal.vue'

export default {
  name: 'AppNavBar',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    AuthModal,
  },

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Controls whether the mobile hamburger menu is expanded.
      isMenuOpen: false,
      // Explanation: Controls the visibility of the AuthModal login/signup dialog.
      isAuthModalOpen: false,
      // Explanation: Static navigation items rendered in the nav bar.
      // Admin link is removed per user requirements.
      navItems: [
        { label: 'Home', path: '/' },
        { label: 'News', path: '/news' },
        { label: 'About', path: '/about' },
      ],
      // Explanation: Index of the currently active navigation link.
      activeIndex: 0,
      // Explanation: Array of DOM element references for each nav item (for slider calc).
      itemRefs: [],
      // Explanation: Tracks the last hovered nav item index for slider animation continuity.
      lastHoveredIndex: -1,
      // Explanation: Timeout reference for debouncing mouse leave events.
      leaveTimeout: null,
      // Explanation: CSS left position of the hover slider element (in pixels).
      sliderLeft: 0,
      // Explanation: CSS width of the hover slider element (in pixels).
      sliderWidth: 0,
      // Explanation: CSS opacity of the hover slider (0 = hidden, 1 = visible).
      sliderOpacity: 0,
      // Explanation: CSS transition string applied to the slider for smooth animation.
      sliderTransition: '',
      // Explanation: Duration (ms) for slider animation timing.
      SLIDER_TIMING: 300,
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapGetters('auth', ['isLoggedIn', 'favoritesCount']),

    /**
     * Calculates the dynamic CSS styles for the navigation hover slider.
     * @returns {Object} CSS style object with left, width, opacity, transition
     */
    sliderStyle() {
      return {
        left: `${this.sliderLeft}px`,
        width: `${this.sliderWidth}px`,
        opacity: this.sliderOpacity,
        transition: this.sliderTransition,
      }
    },

    /**
     * Helper to track the number of navigation items for the slider watcher.
     * @returns {number}
     */
    navItemsLength() {
      return this.navItems.length
    },
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * Reacts to route changes to update the active navigation item index.
     * @param {string} newPath - The updated URL path
     */
    '$route.path'() {
      this.syncActiveIndex()
    },

    /**
     * Requirement: Fix Bug F — reset slider when the nav items change (e.g. logout).
     */
    navItemsLength() {
      this.syncActiveIndex()
      this.sliderOpacity = 0 // immediately hide slider
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('auth', ['logout']),

    /**
     * Synchronizes the active index with current router path.
     */
    syncActiveIndex() {
      const index = this.navItems.findIndex((item) => item.path === this.$route.path)
      this.activeIndex = index !== -1 ? index : -1
    },

    /**
     * Opens the login/signup modal and closes the mobile menu if open.
     */
    toggleLoginModal() {
      this.isMenuOpen = false
      this.isAuthModalOpen = true
    },

    /**
     * Dispatches the logout action to clear the user session.
     */
    handleLogout() {
      this.logout()
    },

    /**
     * Closes the mobile menu and its backdrop overlay.
     */
    closeMobileMenu() {
      this.isMenuOpen = false
    },

    /**
     * Determines if the current viewport is mobile/tablet width.
     * @returns {boolean}
     */
    isMobileOrTablet() {
      return window.innerWidth <= 991
    },

    /**
     * Calculates the pixel dimensions and position of a nav item for the slider.
     * @param {number} index - Index of the nav item in navItems
     * @param {boolean} asActive - Whether to calculate the active-state size
     * @returns {Object} { left: number, width: number }
     */
    getDimensions(index, asActive) {
      const el = this.itemRefs[index]
      if (!el) return { left: 0, width: 0 }
      const w = el.offsetWidth
      return asActive
        ? { left: el.offsetLeft + w * 0.3, width: w * 0.4 }
        : { left: el.offsetLeft, width: w }
    },

    /**
     * Handles slider animation during mouse entry.
     */
    onItemEnter(i) {
      if (this.isMobileOrTablet()) return
      clearTimeout(this.leaveTimeout)

      const prev = this.lastHoveredIndex
      const isNeighbor = prev !== -1 && Math.abs(i - prev) === 1
      const isCurrentActive = i === this.activeIndex

      if (isNeighbor) {
        if (this.sliderOpacity === 0) {
          const prevIsActive = prev === this.activeIndex
          const dim = this.getDimensions(prev, prevIsActive)
          this.sliderTransition = 'none'
          this.sliderLeft = dim.left
          this.sliderWidth = dim.width
          this.sliderOpacity = 1
          this.$nextTick(() => {
            if (this.itemRefs[i]) void this.itemRefs[i].offsetWidth
          })
        }

        this.sliderTransition =
          'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        const targetDim = this.getDimensions(i, isCurrentActive)
        this.sliderLeft = targetDim.left
        this.sliderWidth = targetDim.width

        if (isCurrentActive) {
          setTimeout(() => {
            if (this.lastHoveredIndex === i) this.sliderOpacity = 0
          }, this.SLIDER_TIMING)
        }
      } else {
        if (!isCurrentActive) {
          const dimAlt = this.getDimensions(i, false)
          this.sliderTransition = 'none'
          this.sliderLeft = dimAlt.left + dimAlt.width / 2
          this.sliderWidth = 0
          this.sliderOpacity = 1

          this.$nextTick(() => {
            if (this.itemRefs[i]) void this.itemRefs[i].offsetWidth
            this.sliderTransition =
              'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            this.sliderLeft = dimAlt.left
            this.sliderWidth = dimAlt.width
          })
        } else {
          this.sliderOpacity = 0
        }
      }
      this.lastHoveredIndex = i
    },

    /**
     * Handles slider animation during mouse leave.
     */
    onItemLeave(i) {
      if (this.isMobileOrTablet()) return

      this.leaveTimeout = setTimeout(() => {
        if (this.sliderOpacity === 1) {
          const isCurrentActive = i === this.activeIndex
          const dim = this.getDimensions(i, isCurrentActive)

          this.sliderTransition =
            'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          this.sliderLeft = dim.left + dim.width / 2
          this.sliderWidth = 0

          setTimeout(() => {
            if (this.lastHoveredIndex === -1) this.sliderOpacity = 0
          }, this.SLIDER_TIMING)
        }
        this.lastHoveredIndex = -1
      }, 20)
    },

    /**
     * Handles nav click logic.
     */
    handleNavClick(i) {
      this.activeIndex = i
      if (this.isMobileOrTablet()) {
        this.isMenuOpen = false
        return
      }

      const dim = this.getDimensions(i, true)
      this.sliderTransition =
        'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      this.sliderLeft = dim.left
      this.sliderWidth = dim.width

      setTimeout(() => {
        if (this.activeIndex === i && this.lastHoveredIndex === i) {
          this.sliderOpacity = 0
        }
      }, this.SLIDER_TIMING)
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  created() {
    this.syncActiveIndex()
  },

  beforeUpdate() {
    this.itemRefs = []
  },
}
</script>

<template>
  <nav
    class="navbar navbar-expand-lg bg-white sticky-top py-2 border-bottom shadow-sm"
    aria-label="Main navigation"
  >
    <div class="container position-relative">
      <!-- Navbar Brand (Issue 2 Fix: brand z-index explicit 1050) -->
      <router-link class="navbar-brand d-flex align-items-center gap-2" to="/home">
        <div
          class="logo-box bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center"
        >
          <span class="material-symbols-outlined fs-5">local_florist</span>
        </div>
        <div class="d-flex flex-column lh-1">
          <span class="fw-bold text-dark fs-5 brand-text">The Rose Blog</span>
        </div>
      </router-link>

      <!-- Hamburger (Issue 2 Fix: z-index higher than overlay) -->
      <button
        class="navbar-toggler border-0 shadow-none hamburger-animated"
        type="button"
        @click="isMenuOpen = !isMenuOpen"
        :class="{ open: isMenuOpen }"
        aria-label="Toggle navigation"
        :aria-expanded="isMenuOpen"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Mobile Backdrop (Issue 2 Fix) -->
      <div
        v-if="isMenuOpen"
        class="navbar-mobile-backdrop"
        @click="closeMobileMenu"
        aria-hidden="true"
      ></div>

      <!-- Navigation links (Issue 2 Fix: absolute positioning for dropdown) -->
      <div class="collapse navbar-collapse bg-white" :class="{ show: isMenuOpen }" id="mainNav">
        <ul
          class="navbar-nav mx-auto text-lg fw-medium text-center text-lg-start my-0 py-0 position-relative align-items-center"
        >
          <li
            class="nav-item m-0 p-lg-0 py-2"
            v-for="(item, index) in navItems"
            :key="item.path"
            :ref="
              (el) => {
                if (el) itemRefs[index] = el
              }
            "
            @mouseenter="onItemEnter(index)"
            @mouseleave="onItemLeave(index)"
          >
            <router-link
              class="nav-link nav-link-animated px-3 px-lg-4 d-flex align-items-center justify-content-center gap-1"
              :class="{ 'is-active': activeIndex === index }"
              :to="item.path"
              @click="handleNavClick(index)"
            >
              {{ item.label }}
            </router-link>
          </li>

          <!-- Slider (Desktop only) -->
          <li class="nav-slider-primary d-none d-lg-block" :style="sliderStyle"></li>
        </ul>

        <!-- Right Side: Interaction & Auth -->
        <div class="d-flex flex-column flex-lg-row align-items-center gap-4 pb-4 pb-lg-0">
          <router-link
            v-if="isLoggedIn"
            to="/collection"
            class="position-relative text-decoration-none text-dark d-flex align-items-center gap-3"
            @click="closeMobileMenu"
          >
            <div class="position-relative d-flex mt-1 gap-2">
              <span class="material-symbols-outlined fs-3 text-primary transition-base hover-scale"
                >favorite</span
              >
              <span
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary shadow-sm text-xs"
              >
                {{ favoritesCount }}
              </span>
            </div>
            <span class="d-lg-none text-muted text-lg fw-medium">My Collection</span>
          </router-link>

          <button
            v-if="!isLoggedIn"
            @click="toggleLoginModal"
            class="btn btn-primary btn-sm rounded-pill px-5 px-lg-4 py-2 fw-bolder shadow-sm"
            type="button"
          >
            Log In
          </button>

          <button
            v-else
            @click="handleLogout"
            class="btn btn-outline-primary btn-sm rounded-pill px-5 px-lg-4 py-2 fw-bolder"
            type="button"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal :is-open="isAuthModalOpen" @close="isAuthModalOpen = false" />
  </nav>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';

.logo-box {
  width: 32px;
  height: 32px;
}

.brand-text {
  letter-spacing: -0.5px;
}

/* Nav brand and hamburger explicit z-index (Issue 2) */
.navbar-brand {
  position: relative;
  z-index: 1050;
}

.hamburger-animated {
  z-index: 1050;
}

/* Mobile backdrop: position fixed, behind dropdown, above content (Issue 2) */
.navbar-mobile-backdrop {
  position: fixed;
  inset: 0;
  top: var(--navbar-height, 76px);
  z-index: 1039;
  background: rgba(0, 0, 0, 0.25);
  @include media-breakpoint-up(lg) {
    display: none;
  }
}

/* Mobile dropdown positioning (Issue 2) */
@include media-breakpoint-down(lg) {
  .navbar-collapse {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1040;
    background: white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    padding: 1rem 1.5rem 1.5rem;
  }
}
</style>
