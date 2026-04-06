<script>
/**
 * ==========================================
 * COMPONENT: AppFooter.vue
 * ==========================================
 * Description:
 * The application footer. Includes a newsletter subscription form
 * with email validation, social media links, and copyright info.
 *
 * Requirements (Issue 1):
 *  - Implement checkForm email validation pattern.
 *  - Fixed: footer background covers social link hover effects.
 *  - Removed decorative flower absolute elements that obstructed clicks.
 */

export default {
  name: 'AppFooter',

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Dynamically calculate the current year for the copyright notice.
      currentYear: new Date().getFullYear(),
      // Explanation: Two-way bound field for the newsletter email.
      email: '',
      // Explanation: Provides validation error feedback to the user.
      error: '',
      // Explanation: Controls success message visibility.
      isSubscribed: false,
      // Explanation: Brief message shown when link is copied.
      shareMsg: '',
    }
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Requirement (Issue 1): Copies the current page URL to clipboard.
     */
    shareApp() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.shareMsg = 'Link copied!'
        setTimeout(() => {
          this.shareMsg = ''
        }, 2000)
      })
    },

    /**
     * Requirement (Issue 1): Redirects to the news section.
     */
    goToNews() {
      this.$router.push('/news')
    },

    /**
     * Requirement (Issue 1): checkForm validation pattern.
     * Validates the email format before allowing subscription.
     * @param {Event} e - Submit event
     */
    checkForm(e) {
      e.preventDefault()
      this.error = ''

      if (!this.email) {
        this.error = 'Email is required to join our sanctuary.'
        return false
      }
      if (!this.isValidEmail(this.email)) {
        this.error = 'Please enter a valid botanical update address.'
        return false
      }

      this.subscribe()
      return true
    },

    /**
     * Regex check for valid email format.
     */
    isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },

    /**
     * Simulates a subscription API call.
     */
    subscribe() {
      // Mock API delay
      setTimeout(() => {
        this.isSubscribed = true
        this.email = ''
        // Reset success message after 5 seconds
        setTimeout(() => (this.isSubscribed = false), 5000)
      }, 500)
    },
  },
}
</script>

<template>
  <!-- Explanation: Footer with gradient background and relative positioning for decorative elements -->
  <footer class="grad-pink mt-auto py-5 position-relative overflow-hidden">
    <div class="container position-relative z-1">
      <div class="row g-5">
        <!-- Explanation: Brand information column with logo and description -->
        <div class="col-12 col-lg-9">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-secondary fs-3">local_florist</span>
            <div class="fs-4 text-gray-800 fw-bold font-zilla fst-italic mb-0">The Rose Blog</div>
          </div>
          <p class="text-gray-800 lh-xl mb-4 text-md font-roboto mw-600">
            A personal collection for botanical enthusiasts. Written with love to share expert
            planting guides, seasonal care tips, and a beautifully curated showcase of exquisite
            rose varieties.
          </p>
          <!-- Social Icons (hover effects clearly visible) -->
          <div class="d-flex align-items-center gap-3 text-gray-800 position-relative">
            <button
              type="button"
              class="btn p-0 border-0 text-gray-800 hover-slide-primary d-flex align-items-center justify-content-center"
              aria-label="Share this blog"
              @click="shareApp"
            >
              <span class="material-symbols-outlined fs-4">share</span>
            </button>
            <button
              type="button"
              class="btn p-0 border-0 text-gray-800 hover-slide-primary d-flex align-items-center justify-content-center"
              aria-label="View our gallery"
              @click="goToNews"
            >
              <span class="material-symbols-outlined fs-4">photo_camera</span>
            </button>
            <a
              href="mailto:contact@theroseblog.com"
              class="text-gray-800 text-decoration-none hover-slide-primary d-flex align-items-center justify-content-center"
              aria-label="Contact via email"
              rel="noopener noreferrer"
            >
              <span class="material-symbols-outlined fs-4">mail</span>
            </a>
            <transition name="fade">
              <span v-if="shareMsg" class="small text-secondary fw-bold ms-2">{{ shareMsg }}</span>
            </transition>
          </div>
        </div>

        <!-- Explanation: Quick links column with navigation shortcuts -->
        <div class="col-12 col-lg-3">
          <div class="fs-5 fw-bold text-gray-800 mb-4">Explore</div>
          <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li>
              <router-link
                to="/"
                class="text-gray-800 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Home</router-link
              >
            </li>
            <li>
              <router-link
                to="/collection"
                class="text-gray-800 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> The Collection
              </router-link>
            </li>
            <li>
              <router-link
                to="/news"
                class="text-gray-800 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Latest News
              </router-link>
            </li>
            <li>
              <router-link
                to="/about"
                class="text-gray-800 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> About
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Explanation: Footer bottom row with copyright and attribution -->
      <div class="row mt-5 pt-4 border-top border-gray-900">
        <div
          class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-gray-800 mb-0 small"
        >
          <p>&copy; {{ currentYear }} The Rose Blog. All rights reserved.</p>
          <p>Designed for botanical inspiration.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

.social-link {
  width: 42px;
  height: 42px;
  color: $gray-400;
  border-color: #333;

  &:hover {
    color: white;
    border-color: $primary;
    background-color: $primary;
    transform: translateY(-4px) scale(1.1);
    box-shadow: 0 8px 16px rgba($primary, 0.4);
  }
}

.form-control:focus {
  background-color: $gray-900;
}
</style>
