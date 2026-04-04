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
 * Props: None.
 * Emits: None.
 * Key behaviours: Desktop hover slider animation, mobile hamburger menu
 * with backdrop overlay, favorites badge, login/logout actions.
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
     * Explanation: Returns an object that is bound to the slider element's
     * :style attribute, positioning and sizing it based on the hovered item.
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
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * Reacts to route changes to update the active navigation item index.
     * Explanation: Ensures the correct nav link is visually highlighted
     * after programmatic navigation (e.g., router-link clicks, guards).
     * @param {string} newPath - The updated URL path
     */
    '$route.path'(newPath) {
      const index = this.navItems.findIndex((item) => item.path === newPath)
      this.activeIndex = index !== -1 ? index : -1
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('auth', ['logout']),

    /**
     * Opens the login/signup modal and closes the mobile menu if open.
     * Explanation: Ensures only one overlay is visible at a time.
     */
    toggleLoginModal() {
      this.isMenuOpen = false
      this.isAuthModalOpen = true
    },

    /**
     * Dispatches the logout action to clear the user session.
     * Explanation: Calls the Vuex auth module's logout action,
     * which clears currentUser from both state and localStorage.
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
     * Explanation: The Bootstrap lg breakpoint is 992px. Below this,
     * the navbar collapses into the hamburger menu.
     * @returns {boolean}
     */
    isMobileOrTablet() {
      return window.innerWidth <= 991
    },

    /**
     * Calculates the pixel dimensions and position of a nav item for the slider.
     * Explanation: When calculating for the "active" state (asActive=true),
     * the slider is narrowed to 40% of the item width and centered.
     * @param {number} index - Index of the nav item in navItems
     * @param {boolean} asActive - Whether to calculate the narrower active-state size
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
     * Handles mouse entering a navigation item to trigger slider animation.
     * Explanation: Implements two distinct animation paths —
     * 1. Neighbour transition: smoothly slides from the previous item.
     * 2. Non-neighbour transition: fades in from the centre of the target item.
     * If the hovered item is the active page, the slider fades out after a delay.
     * @param {number} i - Index of the hovered item
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
     * Handles the mouse leaving a navigation item.
     * Explanation: After a short debounce delay (20ms), collapses the slider
     * back to zero width at its centre point and fades it out.
     * @param {number} i - Index of the item being left
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
     * Handles clicking a navigation link.
     * Explanation: On mobile, closes the menu. On desktop, animates the
     * slider to the active-state dimensions and fades it out.
     * @param {number} i - Index of the clicked nav item
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
    // Explanation: Sets the initial active nav index based on the current route
    // at the time the component is created.
    const index = this.navItems.findIndex(
      (item) => item.path === this.$route.path,
    )
    this.activeIndex = index !== -1 ? index : -1
  },

  beforeUpdate() {
    // Explanation: Resets the itemRefs array before each render cycle to ensure
    // correct DOM element mapping via template refs.
    this.itemRefs = []
  },
}
</script>

<template>
  <!-- Explanation: Main navigation bar with sticky positioning and semantic nav element -->
  <nav
    class="navbar navbar-expand-lg bg-white sticky-top py-2 border-bottom shadow-sm"
    aria-label="Main navigation"
  >
    <div class="container">
      <!-- Explanation: Logo and brand name linking to the home page -->
      <router-link class="navbar-brand d-flex align-items-center gap-2 z-3" to="/">
        <div
          class="logo-box bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center"
        >
          <span class="material-symbols-outlined fs-5">local_florist</span>
        </div>
        <div class="d-flex flex-column lh-1">
          <span class="fw-bold text-dark fs-5 brand-text">The Rose Blog</span>
        </div>
      </router-link>

      <!-- Explanation: Mobile hamburger toggle button with animated X transition -->
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

      <!-- Explanation: Mobile backdrop overlay — closes menu when clicked -->
      <div
        v-if="isMenuOpen"
        class="nav-backdrop d-lg-none"
        @click="closeMobileMenu"
        aria-hidden="true"
      ></div>

      <!-- Explanation: Navigation links container — uses absolute positioning on mobile
           to prevent pushing the page content down (Requirement 6) -->
      <div
        class="collapse navbar-collapse bg-white"
        :class="{ show: isMenuOpen, 'nav-mobile-dropdown': isMenuOpen }"
        id="mainNav"
      >
        <ul
          class="navbar-nav mx-auto text-lg fw-medium text-center text-lg-start my-0 py-0 position-relative align-items-center"
        >
          <!-- Explanation: Iterates through navItems to render each navigation link -->
          <li
            class="nav-item m-0 p-lg-0 py-2"
            v-for="(item, index) in navItems"
            :key="item.path"
            :ref="(el) => { if (el) itemRefs[index] = el }"
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

          <!-- Explanation: Animated hover slider element (desktop only) -->
          <li class="nav-slider-primary d-none d-lg-block" :style="sliderStyle"></li>
        </ul>

        <!-- Explanation: Right-side controls — favorites badge and auth button -->
        <div class="d-flex flex-column flex-lg-row align-items-center gap-4 pb-4 pb-lg-0">
          <!-- Explanation: Favorites / Collection link, visible only when logged in -->
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
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary shadow-sm badge-favorites"
              >
                {{ favoritesCount }}
              </span>
            </div>
            <span class="d-lg-none text-muted text-lg fw-medium">My Collection</span>
          </router-link>

          <!-- Explanation: Log In button for unauthenticated users -->
          <button
            v-if="!isLoggedIn"
            @click="toggleLoginModal"
            class="btn btn-primary btn-sm rounded-pill px-5 px-lg-4 py-2 fw-bolder shadow-sm"
            type="button"
          >
            Log In
          </button>

          <!-- Explanation: Log Out button for authenticated users -->
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

    <!-- Explanation: AuthModal handles both Login and Sign Up flows -->
    <AuthModal :is-open="isAuthModalOpen" @close="isAuthModalOpen = false" />
  </nav>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/variables-dark';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';

/* Explanation: Logo box fixed dimensions */
.logo-box {
  width: 32px;
  height: 32px;
}

/* Explanation: Tight letter spacing for the brand name */
.brand-text {
  letter-spacing: -0.5px;
}

/* Explanation: Small badge for the favorites count */
.badge-favorites {
  font-size: 0.65rem;
}

/* Explanation: Mobile nav dropdown — uses absolute positioning to
   prevent pushing the hero section down (Requirement 6) */
@include media-breakpoint-down(lg) {
  .nav-mobile-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1040;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    padding-bottom: 1rem;
  }
}

/* Explanation: Semi-transparent backdrop overlay behind the mobile menu */
.nav-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1019; /* Behind the sticky-top navbar (1020) so brand is not darkened */
  background: rgba(0, 0, 0, 0.4);
}
</style>
