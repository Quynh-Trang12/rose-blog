<script>
/**
 * ==========================================
 * COMPONENT: AuthModal.vue
 * ==========================================
 * Description:
 * A highly cohesive authentication modal handling both Login and Sign Up flows.
 * Communicates directly with the Vuex auth store and manages internal form state.
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
  data: function () {
    return {
      isSignUpMode: false,
      showPassword: false,
      authError: '',
      loginForm: {
        username: 'rosegarden',
        password: 'rose123',
      },
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
     * Emits the close event to the parent.
     */
    closeModal: function () {
      this.$emit('close')
    },

    /**
     * Toggles between Login and Sign Up modes.
     */
    toggleMode: function () {
      this.isSignUpMode = !this.isSignUpMode
      this.authError = ''
      this.showPassword = false
    },

    /**
     * Validates and processes the authentication request.
     * Explanation: Following the week-6 taught pattern of explicit preventDefault.
     * @param {Event} event - Native DOM submit event
     */
    checkForm: function (event) {
      event.preventDefault()
      // Explanation: No complex validation here yet, just direct handleAuth call.
      this.handleAuth()
    },

    /**
     * Orchestrates the actual login/register logic via Vuex.
     */
    handleAuth: function () {
      var self = this
      if (this.isSignUpMode) {
        // Registration Flow
        this.register(this.signupForm).then(function (res) {
          // Explanation: Handle registration response
          if (res.success) {
            self.isSignUpMode = false
            self.signupForm = { username: '', password: '', displayName: '' }
            self.closeModal()
          } else {
            self.authError = res.error
          }
        })
      } else {
        // Login Flow
        this.login(this.loginForm).then(function (res) {
          // Explanation: Handle login response
          if (res.success) {
            self.closeModal()
          } else {
            self.authError = res.error
          }
        })
      }
    },
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * Resets internal modal state when it opens or closes.
     */
    isOpen: function (newVal) {
      if (!newVal) {
        this.authError = ''
        this.showPassword = false
      }
    },
  },
}
</script>

<template>
  <!-- Teleport: Renders the modal at the root level of the document body -->
  <teleport to="body">
    <transition name="modal-fade">
      <!-- Explanation: Only renders when isOpen prop is true -->
      <div
        v-if="isOpen"
        class="modal d-block bg-dark bg-opacity-50 z-index-modal"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        @click.self="closeModal"
      >
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content border-0 shadow-lg rounded-4 p-4 frosted-glass w-100">
            <!-- Modal Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h4 id="auth-modal-title" class="mb-0 fw-bold font-heading fst-italic text-dark">
                {{ isSignUpMode ? 'Sign Up' : 'Log In' }}
              </h4>
              <button @click="closeModal" class="btn-close" aria-label="Close"></button>
            </div>

            <!-- Auth Form -->
            <!-- Explanation: Using explicit checkForm pattern with novalidate -->
            <form @submit="checkForm" novalidate>
              <!-- Login Mode Inputs -->
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
                    <button
                      class="btn btn-outline-secondary rounded-end-3 d-flex align-items-center"
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <span class="material-symbols-outlined fs-5">
                        {{ showPassword ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                </div>
              </template>

              <!-- Sign Up Mode Inputs -->
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
                    <button
                      class="btn btn-outline-secondary rounded-end-3 d-flex align-items-center"
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <span class="material-symbols-outlined fs-5">
                        {{ showPassword ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                </div>
              </template>

              <!-- Error Alert -->
              <div
                v-if="authError"
                class="alert alert-danger py-2 text-sm"
                role="alert"
                aria-live="polite"
              >
                {{ authError }}
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn btn-primary w-100 rounded-pill fw-bold">
                {{ isSignUpMode ? 'Sign Up' : 'Log In' }}
              </button>

              <!-- Switch Mode Link -->
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
.font-heading {
  font-family: 'Zilla Slab', serif;
}
.z-index-modal {
  z-index: 1055;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
