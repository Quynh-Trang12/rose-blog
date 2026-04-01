<script setup>
/**
 * A highly cohesive authentication modal handling both Login
 * and Sign Up flows. It communicates directly with the AuthStore
 * and manages its own internal form state.
 *
 * Props:
 * - isOpen (Boolean): Controls the visibility of the modal.
 *
 * Emits:
 * - close: Fired when the user clicks the close button, overlay,
 * or successfully authenticates.
 */

import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// ==========================================
// 1. PROPS & EMITS
// ==========================================
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

// ==========================================
// 2. STATE & STORE
// ==========================================
const authStore = useAuthStore()

const isSignUpMode = ref(false)
const showPassword = ref(false)
const authError = ref('')

const loginForm = ref({ username: 'rosegarden', password: 'rose123' })
const signupForm = ref({ username: '', password: '', displayName: '' })

// Reset errors and password visibility when the modal opens/closes
watch(
  () => props.isOpen,
  (newVal) => {
    if (!newVal) {
      authError.value = ''
      showPassword.value = false
    }
  },
)

// ==========================================
// 3. METHODS
// ==========================================
const closeModal = () => {
  emit('close')
}

const toggleMode = () => {
  isSignUpMode.value = !isSignUpMode.value
  authError.value = ''
  showPassword.value = false
}

const handleAuth = () => {
  if (isSignUpMode.value) {
    const res = authStore.register(
      signupForm.value.username,
      signupForm.value.password,
      signupForm.value.displayName,
    )
    if (res.success) {
      isSignUpMode.value = false
      signupForm.value = { username: '', password: '', displayName: '' }
      closeModal()
    } else {
      authError.value = res.error
    }
  } else {
    const res = authStore.login(loginForm.value.username, loginForm.value.password)
    if (res.success) {
      closeModal()
    } else {
      authError.value = res.error
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
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
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h4 id="auth-modal-title" class="mb-0 fw-bold font-heading fst-italic text-dark">
                {{ isSignUpMode ? 'Sign Up' : 'Log In' }}
              </h4>
              <button @click="closeModal" class="btn-close" aria-label="Close"></button>
            </div>

            <form @submit.prevent="handleAuth">
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

              <div
                v-if="authError"
                class="alert alert-danger py-2 text-sm"
                role="alert"
                aria-live="polite"
              >
                {{ authError }}
              </div>

              <button type="submit" class="btn btn-primary w-100 rounded-pill fw-bold">
                {{ isSignUpMode ? 'Sign Up' : 'Log In' }}
              </button>

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
    </Transition>
  </Teleport>
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
