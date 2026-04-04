<script>
/**
 * ==========================================
 * COMPONENT: AuthModal.vue
 * ==========================================
 * Description:
 * A cohesive authentication modal handling both Login and Sign Up flows.
 * Communicates with the Vuex auth store and manages internal form state.
 *
 * Props: isOpen (Boolean).
 * Emits: close — signals the parent to hide the modal.
 */
import { mapActions } from 'vuex'

export default {
  name: 'AuthModal',

  // ==========================================
  // PROPS
  // ==========================================
  props: {
    /**
     * Controls the visibility of the modal overlay.
     */
    isOpen: {
      type: Boolean,
      default: false,
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
      // Explanation: Toggles between login and sign-up form views.
      isSignUpMode: false,
      // Explanation: Toggles password field visibility (text vs password type).
      showPassword: false,
      // Explanation: Stores the error message string when authentication fails.
      authError: '',
      // Explanation: Pre-filled login form for demo convenience.
      loginForm: {
        username: 'rosegarden',
        password: 'rose123',
      },
      // Explanation: Empty sign-up form fields.
      signupForm: {
        username: '',
        password: '',
        displayName: '',
      },
    }
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('auth', ['login', 'register']),

    /**
     * Emits the close event to the parent component.
     * Explanation: The parent (AppNavBar) listens for this event
     * and sets isAuthModalOpen to false.
     */
    closeModal() {
      this.$emit('close')
    },

    /**
     * Toggles between Login and Sign Up form modes.
     * Explanation: Clears any existing error message and resets
     * password visibility when switching modes.
     */
    toggleMode() {
      this.isSignUpMode = !this.isSignUpMode
      this.authError = ''
      this.showPassword = false
    },

    /**
     * Validates and processes the authentication form submission.
     * Explanation: Uses async/await to handle the asynchronous password
     * hashing performed by the auth store's login/register actions.
     * On success, closes the modal. On failure, displays the error.
     * @param {Event} event - Native DOM submit event
     */
    async checkForm(event) {
      event.preventDefault()

      const action = this.isSignUpMode ? 'auth/register' : 'auth/login'
      const payload = this.isSignUpMode
        ? {
            username: this.signupForm.username,
            password: this.signupForm.password,
            displayName: this.signupForm.displayName,
          }
        : {
            username: this.loginForm.username,
            password: this.loginForm.password,
          }

      try {
        // Explanation: dispatch() returns a Promise because both login and register
        // hash the password asynchronously via the Web Crypto API before committing.
        const res = await this.$store.dispatch(action, payload)

        if (res.success) {
          if (this.isSignUpMode) {
            // Explanation: Reset to login mode after successful registration.
            this.isSignUpMode = false
            this.signupForm = { username: '', password: '', displayName: '' }
          }
          this.closeModal()
        } else {
          this.authError = res.error
        }
      } catch (err) {
        this.authError = 'Something went wrong. Please try again.'
        console.error('Auth error:', err)
      }
    },

    /**
     * Handles global Escape key press to close the modal.
     * Explanation: Attached as a window-level keydown listener when
     * the modal is open. Provides keyboard dismissal without requiring
     * a click on the backdrop (Requirement 6).
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleEscapeKey(event) {
      if (event.key === 'Escape' && this.isOpen) {
        this.closeModal()
      }
    },
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * Resets internal modal state when visibility changes.
     * Explanation: On open, attaches the Escape key listener.
     * On close, clears errors, hides password, and removes the listener.
     * @param {boolean} newVal - The new isOpen value
     */
    isOpen(newVal) {
      if (newVal) {
        // Explanation: Attach Escape key handler when the modal opens.
        window.addEventListener('keydown', this.handleEscapeKey)
      } else {
        this.authError = ''
        this.showPassword = false
        // Explanation: Clean up the Escape key handler when the modal closes.
        window.removeEventListener('keydown', this.handleEscapeKey)
      }
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  unmounted() {
    // Explanation: Safety cleanup to prevent memory leaks if the component
    // is destroyed while the modal is still open.
    window.removeEventListener('keydown', this.handleEscapeKey)
  },
}
</script>

<template>
  <!-- Explanation: Teleport renders the modal at the document body root
       to escape parent stacking contexts and z-index constraints -->
  <teleport to="body">
    <transition name="modal-fade">
      <!-- Explanation: Modal backdrop — NO @click.self to prevent accidental
           dismissal. Users must use the X button or Escape key (Requirement 6). -->
      <div
        v-if="isOpen"
        class="modal d-block bg-dark bg-opacity-50 z-index-modal"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content border-0 shadow-lg rounded-4 p-4 frosted-glass w-100">
            <!-- Explanation: Modal header with title and explicit close button -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h4 id="auth-modal-title" class="mb-0 fw-bold font-zilla fst-italic text-dark">
                {{ isSignUpMode ? 'Sign Up' : 'Log In' }}
              </h4>
              <button
                @click="closeModal"
                class="btn-close"
                aria-label="Close"
                type="button"
              ></button>
            </div>

            <!-- Explanation: Authentication form — uses checkForm pattern with novalidate -->
            <form @submit="checkForm" novalidate>
              <!-- Explanation: Login mode input fields -->
              <template v-if="!isSignUpMode">
                <div class="mb-3">
                  <label for="auth-username" class="form-label text-sm fw-bold">Username</label>
                  <input
                    id="auth-username"
                    type="text"
                    class="form-control rounded-3"
                    v-model="loginForm.username"
                    aria-required="true"
                    required
                  />
                </div>
                <div class="mb-4">
                  <label for="auth-password" class="form-label text-sm fw-bold">Password</label>
                  <div class="input-group">
                    <input
                      id="auth-password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control rounded-start-3"
                      v-model="loginForm.password"
                      aria-required="true"
                      required
                    />
                    <!-- Explanation: Password visibility toggle button -->
                    <button
                      class="btn btn-outline-secondary rounded-end-3 d-flex align-items-center"
                      type="button"
                      @click="showPassword = !showPassword"
                      :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    >
                      <span class="material-symbols-outlined fs-5">
                        {{ showPassword ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                </div>
              </template>

              <!-- Explanation: Sign Up mode input fields -->
              <template v-else>
                <div class="mb-3">
                  <label for="signup-display" class="form-label text-sm fw-bold"
                    >Display Name</label
                  >
                  <input
                    id="signup-display"
                    type="text"
                    class="form-control rounded-3"
                    v-model="signupForm.displayName"
                    aria-required="true"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="signup-username" class="form-label text-sm fw-bold">Username</label>
                  <input
                    id="signup-username"
                    type="text"
                    class="form-control rounded-3"
                    v-model="signupForm.username"
                    aria-required="true"
                    required
                  />
                </div>
                <div class="mb-4">
                  <label for="signup-password" class="form-label text-sm fw-bold">Password</label>
                  <div class="input-group">
                    <input
                      id="signup-password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control rounded-start-3"
                      v-model="signupForm.password"
                      aria-required="true"
                      required
                    />
                    <!-- Explanation: Password visibility toggle button -->
                    <button
                      class="btn btn-outline-secondary rounded-end-3 d-flex align-items-center"
                      type="button"
                      @click="showPassword = !showPassword"
                      :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    >
                      <span class="material-symbols-outlined fs-5">
                        {{ showPassword ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                </div>
              </template>

              <!-- Explanation: Error alert with aria-live for screen reader announcement -->
              <div
                v-if="authError"
                class="alert alert-danger py-2 text-sm"
                role="alert"
                aria-live="polite"
              >
                {{ authError }}
              </div>

              <!-- Explanation: Submit button labelled based on current mode -->
              <button type="submit" class="btn btn-primary w-100 rounded-pill fw-bold">
                {{ isSignUpMode ? 'Sign Up' : 'Log In' }}
              </button>

              <!-- Explanation: Toggle link to switch between Login and Sign Up modes -->
              <div class="text-center mt-3 text-sm">
                <button
                  type="button"
                  class="btn btn-link text-decoration-none p-0 text-muted"
                  @click="toggleMode"
                >
                  {{
                    isSignUpMode
                      ? 'Already have an account? Log In'
                      : "Don't have an account? Sign Up"
                  }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
/* Explanation: Fade transition for modal enter/leave animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
