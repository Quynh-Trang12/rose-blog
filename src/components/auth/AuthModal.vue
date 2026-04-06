<script>
/**
 * ==========================================
 * COMPONENT: AuthModal.vue
 * ==========================================
 * Description:
 * A unified authentication modal handling Login and Registration.
 * Supports password visibility toggling, email validation, and
 * prevents race conditions during authentication requests.
 *
 * Requirements (Bug K, Part 8.1):
 *  - Fixed: Race condition — don't close modal until successful login response.
 *  - Fixed: Prevent duplicate submissions via 'isSubmitting' state.
 *  - Implement: checkForm validation pattern for both Login and Register.
 *  - Fully Options API migration.
 */
import { mapActions } from 'vuex'

export default {
  name: 'AuthModal',

  // ==========================================
  // PROPS
  // ==========================================
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },

  // ==========================================
  // EMITS
  // ==========================================
  emits: ['close'],

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Toggles between 'login' and 'register' modes.
      mode: 'login',
      // Explanation: Two-way bound form fields.
      username: '',
      password: '',
      displayName: '',
      // Explanation: Toggle for the password input type (password/text).
      showPassword: false,
      // Explanation: Tracks form submission state to prevent double-clicks.
      isSubmitting: false,
      // Explanation: Validation and API error feedback.
      error: '',
    }
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * Reset form state whenever the modal closes.
     */
    isOpen(newVal) {
      if (!newVal) {
        this.handleReset()
      } else {
        // Prevent body scroll
        document.body.classList.add('overflow-hidden')
      }
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('auth', ['login', 'register']),

    /**
     * Requirement: checkForm validation pattern.
     * Validates input fields before calling the Vuex auth actions.
     */
    checkForm(e) {
      e.preventDefault()
      if (this.isSubmitting) return false
      this.error = ''

      if (!this.username.trim()) {
         this.error = 'Username is required.'
         return false
      }
      if (!this.password.trim()) {
         this.error = 'Password is required.'
         return false
      }
      if (this.mode === 'register' && !this.displayName.trim()) {
         this.error = 'Display name is required for identification.'
         return false
      }

      this.submit()
      return true
    },

    /**
     * Requirement (Bug K): Handles the authentication request asynchronously.
     * Ensures the modal only closes upon successful authentication success.
     */
    async submit() {
      this.isSubmitting = true
      try {
        let result
        if (this.mode === 'login') {
          result = await this.login({
            username: this.username.trim(),
            password: this.password.trim(),
          })
        } else {
          result = await this.register({
            username: this.username.trim(),
            password: this.password.trim(),
            displayName: this.displayName.trim(),
          })
        }

        if (result.success) {
          // Success: Close modal and reset
          this.close()
        } else {
          // Failure: Show error and keep modal open
          this.error = result.error || 'Authentication failed.'
        }
      } catch (err) {
        console.error('Auth Request Error:', err)
        this.error = 'The botanical server is unreachable. Please try again.'
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * Closes the modal and emits the close event.
     */
    close() {
      document.body.classList.remove('overflow-hidden')
      this.$emit('close')
    },

    /**
     * Resets the form fields.
     */
    handleReset() {
      this.username = ''
      this.password = ''
      this.displayName = ''
      this.error = ''
      this.isSubmitting = false
      this.showPassword = false
      this.mode = 'login'
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  beforeUnmount() {
    document.body.classList.remove('overflow-hidden')
  },
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="auth-overlay position-fixed inset-0 z-index-modal"
        @click.self="close"
        role="dialog"
        aria-modal="true"
        aria-label="Account access"
      >
        <div class="auth-modal frosted-glass rounded-5 shadow-2xl p-4 p-md-5 mw-480 position-relative animate-fade-up border border-white mx-3">
          <!-- Close button -->
          <button class="position-absolute top-0 end-0 m-4 btn btn-link text-dark opacity-50 p-2" @click="close" :disabled="isSubmitting">
             <span class="material-symbols-outlined fs-3">close</span>
          </button>

          <!-- Modal Header -->
          <header class="text-center mb-5">
             <div class="footer-logo bg-primary text-white rounded-circle p-2 d-inline-flex align-items-center justify-content-center mb-3 shadow-sm">
                <span class="material-symbols-outlined fs-2">local_florist</span>
             </div>
             <h2 class="display-6 fw-bold font-zilla fst-italic mb-1">
                {{ mode === 'login' ? 'Welcome Back' : 'Join the Sanctuary' }}
             </h2>
             <p class="text-muted small text-uppercase ls-wide">
                {{ mode === 'login' ? 'Login' : 'Register' }} to access the garden
             </p>
          </header>

          <!-- Auth Form -->
          <form @submit="checkForm" novalidate>
             <div class="mb-3">
               <label class="form-label font-roboto fw-bold text-sm text-uppercase small" for="username">Username</label>
               <input v-model="username" id="username" type="text" class="form-control rounded-pill border-2 p-3 px-4 shadow-sm font-roboto" placeholder="flower_lover_99" :disabled="isSubmitting" />
             </div>

             <div class="mb-4 position-relative">
               <label class="form-label font-roboto fw-bold text-sm text-uppercase small" for="password">Password</label>
               <input v-model="password" id="password" :type="showPassword ? 'text' : 'password'" class="form-control rounded-pill border-2 p-3 px-4 shadow-sm font-roboto" placeholder="••••••••" :disabled="isSubmitting" />
               <button type="button" class="btn btn-link position-absolute end-0 top-50 translate-middle-y me-3 mt-3 text-muted" @click="showPassword = !showPassword">
                  <span class="material-symbols-outlined fs-5">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
               </button>
             </div>

             <div v-if="mode === 'register'" class="mb-4 animate-fade-up">
                <label class="form-label font-roboto fw-bold text-sm text-uppercase small" for="displayName">Display Name</label>
                <input v-model="displayName" id="displayName" type="text" class="form-control rounded-pill border-2 p-3 px-4 shadow-sm font-roboto" placeholder="Lily Gardener" :disabled="isSubmitting" />
             </div>

             <div v-if="error" class="alert alert-danger rounded-4 py-2 text-sm text-center mb-4 animate-fade-up">
                {{ error }}
             </div>

             <button type="submit" class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg mb-4 text-uppercase ls-1" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ mode === 'login' ? 'Grant Access' : 'Create Sanctuary Account' }}
             </button>

             <div class="text-center">
                <button type="button" class="btn btn-link text-muted text-decoration-none small fw-bold" @click="mode = (mode === 'login' ? 'register' : 'login')" :disabled="isSubmitting">
                   {{ mode === 'login' ? "Don't have an account? Sign up" : 'Already part of the garden? Login' }}
                </button>
             </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  display: flex !important;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  z-index: 2000;
  padding: 2rem 0;
}

.auth-modal {
  background-color: white;
  width: 100%;
  margin: 0 auto;
}

.inset-0 { top: 0; left: 0; right: 0; bottom: 0; }

.footer-logo {
  width: 56px;
  height: 56px;
}

.ls-wide { letter-spacing: 0.15rem; }
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}

// Fade transition
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
