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

  mounted() {
    this.syncActiveIndex()
    window.addEventListener('openAuthModal', () => {
      this.isAuthModalOpen = true
    })
  },

  beforeUpdate() {
    this.itemRefs = []
  },
}
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-white sticky-top py-2 border-bottom shadow-sm">
    <div class="container position-relative">
      <router-link
        class="navbar-brand d-flex align-items-center gap-2 z-3 position-relative"
        to="/"
        @click="closeMobileMenu"
      >
        <div
          class="logo-box bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center transition-base hover-scale"
        >
          <span class="material-symbols-outlined fs-5">local_florist</span>
        </div>
        <div class="d-flex flex-column lh-1">
          <span class="fw-bold text-dark fs-5 brand-text font-zilla">The Rose Blog</span>
        </div>
      </router-link>

      <button
        class="navbar-toggler border-0 shadow-none hamburger-animated position-relative z-3"
        type="button"
        @click="isMenuOpen = !isMenuOpen"
        :class="{ open: isMenuOpen }"
        aria-label="Toggle navigation"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <div class="navbar-custom-menu bg-white" :class="{ show: isMenuOpen }" id="mainNav">
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
              class="nav-link nav-link-animated px-3 px-lg-4 d-flex align-items-center justify-content-center gap-1 text-lg fw-medium"
              :class="{ 'is-active': activeIndex === index }"
              :to="item.path"
              @click="handleNavClick(index)"
            >
              {{ item.label }}
            </router-link>
          </li>
          <li class="nav-slider-primary d-none d-lg-block" :style="sliderStyle"></li>
        </ul>

        <div class="d-flex flex-column flex-lg-row align-items-center gap-4 pb-4 pb-lg-0">
          <router-link
            v-if="isLoggedIn"
            to="/collection"
            class="position-relative text-decoration-none text-dark d-flex align-items-center gap-3"
            @click="closeMobileMenu"
          >
            <div class="position-relative d-flex mt-1 gap-2">
              <span class="material-symbols-outlined fs-3 text-primary transition-all hover-scale"
                >favorite</span
              >
              <span
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary shadow-sm text-xs ls-1"
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
          >
            Log In
          </button>
          <button
            v-else
            @click="handleLogout"
            class="btn btn-outline-primary btn-sm rounded-pill px-5 px-lg-4 py-2 fw-bolder"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isMenuOpen" class="navbar-mobile-backdrop" @click="closeMobileMenu"></div>
    </Teleport>

    <AuthModal :is-open="isAuthModalOpen" @close="isAuthModalOpen = false" />
  </nav>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';

/* Navbar wrapper stays at top layer with relative positioning */
.navbar {
  position: relative;
  z-index: 1070 !important;
}

.logo-box {
  width: 32px;
  height: 32px;
}
.brand-text {
  letter-spacing: -0.5px;
}

/* Backdrop covers screen under the navbar but over the page */
.navbar-mobile-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1060;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  @include media-breakpoint-up(lg) {
    display: none;
  }
}

/* Mobile dropdown absolutely positioned relative to the .navbar to prevent page push */
.navbar-custom-menu {
  @include media-breakpoint-down(lg) {
    display: none;
    position: absolute;
    top: 100%; /* Positions exactly at bottom border of the navbar */
    left: 0;
    right: 0;
    width: 100%;
    z-index: 1065;
    background: #fff;
    padding: 1.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

    /* Makes sure menu items are scrollable instead of hiding them */
    max-height: calc(100vh - 75px);
    overflow-y: auto;

    /* Heal the blurry sub-pixel cut line gap */
    margin-top: -1px;
    border-top: 1px solid #fff;

    flex-direction: column;

    &.show {
      display: flex;
    }
  }

  @include media-breakpoint-up(lg) {
    display: flex !important;
    align-items: center;
    flex-basis: auto;
    flex-grow: 1;
    background: transparent !important;
  }
}
</style>
