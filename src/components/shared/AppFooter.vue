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
      // Explanation: Mock social links for navigation.
      socialLinks: [
        { id: 'f', icon: 'facebook', label: 'Facebook', url: 'https://facebook.com' },
        { id: 'i', icon: 'instagram', label: 'Instagram', url: 'https://instagram.com' },
        { id: 't', icon: 'twitter', label: 'Twitter', url: 'https://twitter.com' },
      ],
    }
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
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
  <footer class="bg-grad-tright mt-auto py-5 position-relative overflow-hidden">
    <div class="container position-relative z-1">
      <div class="row g-5">
        <!-- Explanation: Brand information column with logo and description -->
        <div class="col-12 col-lg-4 pe-lg-5">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-secondary fs-3">local_florist</span>
            <div class="fs-4 text-gray-300 fw-bold font-zilla fst-italic mb-0">The Rose Blog</div>
          </div>
          <p class="text-gray-300 lh-xl mb-4 text-md font-roboto mw-480">
            Curating the finest petals of wisdom for the modern gardener. Join our global community
            of botanical enthusiasts.
          </p>
          <!-- Social Icons (hover effects clearly visible) -->
          <div class="d-flex gap-3 mt-4">
            <a
              v-for="s in socialLinks"
              :key="s.id"
              :href="s.url"
              target="_blank"
              class="social-link btn btn-outline-light rounded-circle shadow-sm transition-base d-flex align-items-center justify-content-center"
              :aria-label="'Follow us on ' + s.label"
            >
              <i :class="'bi bi-' + s.icon"></i>
            </a>
          </div>
        </div>

        <!-- 2. Newsletter Section (Requirement 1: checkForm) -->
        <div class="col-12 col-md-6 col-lg-3 offset-lg-1">
          <h3 class="h6 fw-bold text-uppercase ls-1 mb-4 font-zilla text-primary">
            Join the Sanctuary
          </h3>
          <p class="text-gray-300 small mb-3">Receive weekly botanical tips and bloom alerts.</p>

          <form v-if="!isSubscribed" @submit="checkForm" novalidate>
            <div class="input-group">
              <input
                v-model="email"
                type="email"
                class="form-control border-primary text-white rounded-start-5 p-3 px-4 shadow-none"
                :class="{ 'is-invalid': error }"
                placeholder="Enter your email"
                aria-label="Newsletter email"
                @input="error = ''"
              />
              <button
                class="btn btn-primary border-primary rounded-end-5 px-4 fw-bold shadow-sm"
                type="submit"
              >
                Join
              </button>
            </div>
            <div v-show="error" class="text-secondary small mt-2 ms-3 animate-fade-up">
              {{ error }}
            </div>
          </form>

          <div
            v-else
            class="text-primary fw-bold p-3 rounded-3 bg-white bg-opacity-10 animate-fade-up"
          >
            <div class="d-flex align-items-center gap-2">
              <span class="material-symbols-outlined">mark_email_read</span>
              <span>Welcome to the community! Check your inbox.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Explanation: Footer bottom row with copyright and attribution -->
      <div class="row mt-5 pt-4 border-top border-gray-300 border-opacity-25">
        <div
          class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-gray-300 mb-0 small"
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
