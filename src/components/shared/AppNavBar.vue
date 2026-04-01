<script>
/**
 * ==========================================
 * COMPONENT: AppNavBar.vue
 * ==========================================
 * Description:
 * The main application navigation bar. Handles routing, responsive menu toggling,
 * desktop slider animations, and orchestrates the authentication modal visibility.
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
  data: function () {
    return {
      isMenuOpen: false,
      isAuthModalOpen: false,
      // Explanation: Static navigation items now defined in data for Item 4 requirements.
      navItems: [
        { label: 'Home', path: '/' },
        { label: 'News', path: '/news' },
        { label: 'About', path: '/about' },
      ],
      activeIndex: 0,
      itemRefs: [],
      lastHoveredIndex: -1,
      leaveTimeout: null,
      sliderLeft: 0,
      sliderWidth: 0,
      sliderOpacity: 0,
      sliderTransition: '',
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
     * @returns {Object} Inline style object
     */
    sliderStyle: function () {
      return {
        left: this.sliderLeft + 'px',
        width: this.sliderWidth + 'px',
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
     * Explanation: Ensures the correct nav link is highlighted when navigating.
     * @param {string} newPath - The updated URL path
     */
    '$route.path': function (newPath) {
      var index = this.navItems.findIndex(function (item) {
        return item.path === newPath
      })
      this.activeIndex = index !== -1 ? index : -1
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('auth', ['logout']),

    /**
     * Opens the login modal and closes the mobile menu if it was open.
     */
    toggleLoginModal: function () {
      this.isMenuOpen = false
      this.isAuthModalOpen = true
    },

    /**
     * Dispatches the logout action to clear the user session.
     */
    handleLogout: function () {
      // Explanation: Calls the Vuex auth module's logout action.
      this.logout()
    },

    /**
     * Helper to determine if the current viewport is mobile/tablet size.
     * @returns {boolean}
     */
    isMobileOrTablet: function () {
      return window.innerWidth <= 991
    },

    /**
     * Calculates the dimensions and position of a specific nav item for the slider.
     * @param {number} index - Index of the nav item
     * @param {boolean} asActive - Whether to calculate for the "active" underline state
     */
    getDimensions: function (index, asActive) {
      var el = this.itemRefs[index]
      if (!el) return { left: 0, width: 0 }
      var w = el.offsetWidth
      return asActive
        ? { left: el.offsetLeft + w * 0.3, width: w * 0.4 }
        : { left: el.offsetLeft, width: w }
    },

    /**
     * Handles the mouse entering a navigation item to trigger the slider animation.
     * @param {number} i - Index of the hovered item
     */
    onItemEnter: function (i) {
      if (this.isMobileOrTablet()) return
      clearTimeout(this.leaveTimeout)

      var prev = this.lastHoveredIndex
      var isNeighbor = prev !== -1 && Math.abs(i - prev) === 1
      var isCurrentActive = i === this.activeIndex
      var self = this

      if (isNeighbor) {
        if (this.sliderOpacity === 0) {
          var prevIsActive = prev === this.activeIndex
          var dim = this.getDimensions(prev, prevIsActive)
          this.sliderTransition = 'none'
          this.sliderLeft = dim.left
          this.sliderWidth = dim.width
          this.sliderOpacity = 1
          this.$nextTick(function () {
            if (self.itemRefs[i]) void self.itemRefs[i].offsetWidth
          })
        }

        this.sliderTransition =
          'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        var targetDim = this.getDimensions(i, isCurrentActive)
        this.sliderLeft = targetDim.left
        this.sliderWidth = targetDim.width

        if (isCurrentActive) {
          setTimeout(function () {
            if (self.lastHoveredIndex === i) self.sliderOpacity = 0
          }, this.SLIDER_TIMING)
        }
      } else {
        if (!isCurrentActive) {
          var dimAlt = this.getDimensions(i, false)
          this.sliderTransition = 'none'
          this.sliderLeft = dimAlt.left + dimAlt.width / 2
          this.sliderWidth = 0
          this.sliderOpacity = 1

          this.$nextTick(function () {
            if (self.itemRefs[i]) void self.itemRefs[i].offsetWidth
            self.sliderTransition =
              'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            self.sliderLeft = dimAlt.left
            self.sliderWidth = dimAlt.width
          })
        } else {
          this.sliderOpacity = 0
        }
      }
      this.lastHoveredIndex = i
    },

    /**
     * Handles the mouse leaving a navigation item.
     * @param {number} i - Index of the item being left
     */
    onItemLeave: function (i) {
      if (this.isMobileOrTablet()) return
      var self = this

      this.leaveTimeout = setTimeout(function () {
        if (self.sliderOpacity === 1) {
          var isCurrentActive = i === self.activeIndex
          var dim = self.getDimensions(i, isCurrentActive)

          self.sliderTransition =
            'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          self.sliderLeft = dim.left + dim.width / 2
          self.sliderWidth = 0

          setTimeout(function () {
            if (self.lastHoveredIndex === -1) self.sliderOpacity = 0
          }, self.SLIDER_TIMING)
        }
        self.lastHoveredIndex = -1
      }, 20)
    },

    /**
     * Handles clicking a navigation link.
     * @param {number} i - Index of click
     */
    handleNavClick: function (i) {
      this.activeIndex = i
      if (this.isMobileOrTablet()) {
        this.isMenuOpen = false
        return
      }

      var dim = this.getDimensions(i, true)
      this.sliderTransition =
        'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      this.sliderLeft = dim.left
      this.sliderWidth = dim.width

      var self = this
      setTimeout(function () {
        if (self.activeIndex === i && self.lastHoveredIndex === i) {
          self.sliderOpacity = 0
        }
      }, this.SLIDER_TIMING)
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  created: function () {
    // Explanation: Sets the initial active nav index based on the initial route.
    var self = this
    var index = this.navItems.findIndex(function (item) {
      return item.path === self.$route.path
    })
    this.activeIndex = index !== -1 ? index : -1
  },

  beforeUpdate: function () {
    // Explanation: Resets the itemRefs array before each update cycle to ensure correct mapping.
    this.itemRefs = []
  },
}
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-white sticky-top py-2 border-bottom shadow-sm">
    <div class="container">
      <!-- Logo and Brand -->
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

      <!-- Mobile Hamburger Toggler -->
      <button
        class="navbar-toggler border-0 shadow-none hamburger-animated"
        type="button"
        @click="isMenuOpen = !isMenuOpen"
        :class="{ open: isMenuOpen }"
        aria-label="Toggle navigation"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Nav Links Container -->
      <div class="collapse navbar-collapse bg-white" :class="{ show: isMenuOpen }" id="mainNav">
        <ul
          class="navbar-nav mx-auto text-lg fw-medium text-center text-lg-start my-0 py-0 position-relative align-items-center"
        >
          <!-- Explanation: Iterates through nav items to build the menu -->
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

          <!-- Animated Hover Slider (Desktop only) -->
          <li class="nav-slider-primary d-none d-lg-block" :style="sliderStyle"></li>
        </ul>

        <!-- Right Side: Favorites and Auth -->
        <div class="d-flex flex-column flex-lg-row align-items-center gap-4 pb-4 pb-lg-0">
          <!-- Favorites / Collection Link (Auth only) -->
          <router-link
            v-if="isLoggedIn"
            to="/collection"
            class="position-relative text-decoration-none text-dark d-flex align-items-center gap-3"
          >
            <div class="position-relative d-flex mt-1 gap-2">
              <span class="material-symbols-outlined fs-3 text-primary transition-all hover-scale"
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

          <!-- Authentication Button -->
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

    <!-- Auth Modal - Handles Login/Register -->
    <AuthModal :is-open="isAuthModalOpen" @close="isAuthModalOpen = false" />
  </nav>
</template>

<style scoped>
.logo-box {
  width: 32px;
  height: 32px;
}
.brand-text {
  letter-spacing: -0.5px;
}
.badge-favorites {
  font-size: 0.65rem;
}
.icon-sm {
  font-size: 1rem;
  vertical-align: -2px;
}
</style>
