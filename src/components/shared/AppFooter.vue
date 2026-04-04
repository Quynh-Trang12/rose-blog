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
  <footer class="app-footer bg-dark text-white pt-5 pb-4 mt-5 position-relative overflow-hidden">
    <!-- Decorative subtle overlay (Issue 1 Fix: ensure z-index is behind links) -->
    <div class="footer-bg-blob position-absolute top-0 start-0 w-100 h-100 opacity-5" aria-hidden="true"></div>

    <div class="container position-relative z-1">
      <div class="row g-4 justify-content-between align-items-start">
        <!-- 1. Brand Section -->
        <div class="col-12 col-md-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="footer-logo bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center">
              <span class="material-symbols-outlined fs-5">local_florist</span>
            </div>
            <h2 class="h5 fw-bold font-zilla fst-italic mb-0">The Rose Blog</h2>
          </div>
          <p class="text-muted font-roboto small mw-480 mb-4">
            Curating the finest petals of wisdom for the modern gardener. 
            Join our global community of botanical enthusiasts.
          </p>
          <!-- Social Icons (Issue 1 Fix: hover effects clearly visible) -->
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
        <div class="col-12 col-md-5 col-lg-4">
          <h3 class="h6 fw-bold text-uppercase ls-1 mb-4 font-zilla text-primary">Join the Sanctuary</h3>
          <p class="text-muted small mb-3">Receive weekly botanical tips and bloom alerts.</p>
          
          <form v-if="!isSubscribed" @submit="checkForm" class="subscribe-form" novalidate>
            <div class="input-group">
              <input
                v-model="email"
                type="email"
                class="form-control bg-dark border-secondary text-white rounded-pill-start p-3 px-4 shadow-none"
                :class="{ 'is-invalid': error }"
                placeholder="Enter your email"
                aria-label="Newsletter email"
                @input="error = ''"
              />
              <button class="btn btn-primary rounded-pill-end px-4 fw-bold shadow-sm" type="submit">
                Join
              </button>
            </div>
            <div v-show="error" class="text-danger small mt-2 ms-3 animate-fade-up">
              {{ error }}
            </div>
          </form>

          <div v-else class="text-primary fw-bold p-3 rounded-3 bg-white bg-opacity-10 animate-fade-up">
            <div class="d-flex align-items-center gap-2">
              <span class="material-symbols-outlined">mark_email_read</span>
              <span>Welcome to the community! Check your inbox.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Bottom Bar -->
      <div class="border-top border-secondary mt-5 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <p class="text-muted small mb-0 font-roboto">
          &copy; 2026 The Rose Blog &bull; Hand-pollinated with love.
        </p>
        <div class="d-flex gap-4">
          <router-link to="/about" class="text-muted text-decoration-none small transition-base hover-primary">Our Story</router-link>
          <router-link to="/news" class="text-muted text-decoration-none small transition-base hover-primary">Public Access</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

.app-footer {
  background-color: #121212 !important;
}

.footer-logo {
  width: 32px;
  height: 32px;
}

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

.subscribe-form {
  .form-control:focus {
    border-color: $primary;
    background-color: #1a1a1a !important;
  }
}

.rounded-pill-start {
  border-top-left-radius: 50rem;
  border-bottom-left-radius: 50rem;
}

.rounded-pill-end {
  border-top-right-radius: 50rem;
  border-bottom-right-radius: 50rem;
}

.footer-bg-blob {
  background: radial-gradient(circle at top right, rgba(226, 6, 95, 0.4) 0%, transparent 40%);
}

.hover-primary:hover {
  color: var(--bs-primary) !important;
}
</style>
