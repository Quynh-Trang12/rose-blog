<script setup>
import { ref, computed, nextTick, watch, onBeforeUpdate } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const favoritesCount = ref(0)
const isMenuOpen = ref(false)

const showLoginModal = ref(false)
const isSignUpMode = ref(false)
const loginForm = ref({ username: 'rosegarden', password: 'rose123' })
const signupForm = ref({ username: '', password: '', displayName: '' })
const authError = ref('')

const handleAuth = () => {
  if (isSignUpMode.value) {
    const res = authStore.register(signupForm.value.username, signupForm.value.password, signupForm.value.displayName)
    if (res.success) {
      showLoginModal.value = false
      authError.value = ''
      isSignUpMode.value = false
      signupForm.value = { username: '', password: '', displayName: '' }
    } else {
      authError.value = res.error
    }
  } else {
    const res = authStore.login(loginForm.value.username, loginForm.value.password)
    if (res.success) {
      showLoginModal.value = false
      authError.value = ''
    } else {
      authError.value = res.error
    }
  }
}

const items = [
  { label: 'Home', path: '/' },
  { label: 'Collection', path: '/collection' },
  { label: 'News', path: '/news' },
  { label: 'About', path: '/about' },
]

const toggleLoginModal = () => {
  if (authStore.isLoggedIn) {
    authStore.logout()
  } else {
    showLoginModal.value = true
  }
}

const route = useRoute()
const activeIndex = ref(0)
const itemRefs = ref([])
const lastHoveredIndex = ref(-1)
let leaveTimeout = null

const sliderLeft = ref(0)
const sliderWidth = ref(0)
const sliderOpacity = ref(0)
const sliderTransition = ref('')

onBeforeUpdate(() => {
  itemRefs.value = []
})

const isMobileOrTablet = () => window.innerWidth <= 991

watch(
  () => route.path,
  (newPath) => {
    const index = items.findIndex((item) => item.path === newPath)
    if (index !== -1) {
      activeIndex.value = index
    }
  },
  { immediate: true },
)

const getDimensions = (index, asActive = false) => {
  const el = itemRefs.value[index]
  if (!el) return { left: 0, width: 0 }
  const w = el.offsetWidth
  return asActive
    ? { left: el.offsetLeft + w * 0.3, width: w * 0.4 }
    : { left: el.offsetLeft, width: w }
}

const onItemEnter = async (i) => {
  if (isMobileOrTablet()) return
  clearTimeout(leaveTimeout)

  const prev = lastHoveredIndex.value
  const isNeighbor = prev !== -1 && Math.abs(i - prev) === 1
  const isCurrentActive = i === activeIndex.value

  if (isNeighbor) {
    if (sliderOpacity.value === 0) {
      const prevIsActive = prev === activeIndex.value
      const dim = getDimensions(prev, prevIsActive)
      sliderTransition.value = 'none'
      sliderLeft.value = dim.left
      sliderWidth.value = dim.width
      sliderOpacity.value = 1
      await nextTick()
      if (itemRefs.value[i]) void itemRefs.value[i].offsetWidth
    }

    sliderTransition.value =
      'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    const targetDim = getDimensions(i, isCurrentActive)
    sliderLeft.value = targetDim.left
    sliderWidth.value = targetDim.width

    if (isCurrentActive) {
      setTimeout(() => {
        if (lastHoveredIndex.value === i) sliderOpacity.value = 0
      }, 300)
    }
  } else {
    if (!isCurrentActive) {
      const dim = getDimensions(i)
      sliderTransition.value = 'none'
      sliderLeft.value = dim.left + dim.width / 2
      sliderWidth.value = 0
      sliderOpacity.value = 1

      await nextTick()
      if (itemRefs.value[i]) void itemRefs.value[i].offsetWidth

      sliderTransition.value =
        'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      sliderLeft.value = dim.left
      sliderWidth.value = dim.width
    } else {
      sliderOpacity.value = 0
    }
  }
  lastHoveredIndex.value = i
}

const onItemLeave = (i) => {
  if (isMobileOrTablet()) return

  leaveTimeout = setTimeout(() => {
    if (sliderOpacity.value === 1) {
      const isCurrentActive = i === activeIndex.value
      const dim = getDimensions(i, isCurrentActive)

      sliderTransition.value =
        'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      sliderLeft.value = dim.left + dim.width / 2
      sliderWidth.value = 0

      setTimeout(() => {
        if (lastHoveredIndex.value === -1) sliderOpacity.value = 0
      }, 300)
    }
    lastHoveredIndex.value = -1
  }, 20)
}

const handleNavClick = (i) => {
  activeIndex.value = i
  if (isMobileOrTablet()) {
    isMenuOpen.value = false
    return
  }

  const dim = getDimensions(i, true)
  sliderTransition.value =
    'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  sliderLeft.value = dim.left
  sliderWidth.value = dim.width

  setTimeout(() => {
    if (activeIndex.value === i && lastHoveredIndex.value === i) {
      sliderOpacity.value = 0
    }
  }, 300)
}

const sliderStyle = computed(() => ({
  left: `${sliderLeft.value}px`,
  width: `${sliderWidth.value}px`,
  opacity: sliderOpacity.value,
  transition: sliderTransition.value,
}))
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-white sticky-top py-2 border-bottom shadow-sm">
    <div class="container">
      <RouterLink class="navbar-brand d-flex align-items-center gap-2 z-3" to="/">
        <div
          class="bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center"
          style="width: 32px; height: 32px"
        >
          <span class="material-symbols-outlined fs-5">local_florist</span>
        </div>
        <div class="d-flex flex-column lh-1">
          <span class="fw-bold text-dark fs-5" style="letter-spacing: -0.5px">The Rose Blog</span>
        </div>
      </RouterLink>

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

      <div class="collapse navbar-collapse bg-white" :class="{ show: isMenuOpen }" id="mainNav">
        <ul
          class="navbar-nav mx-auto text-lg fw-medium text-center text-lg-start my-0 py-0 position-relative align-items-center"
        >
          <li
            class="nav-item m-0 p-lg-0 py-2"
            v-for="(item, index) in items"
            :key="index"
            :ref="
              (el) => {
                if (el) itemRefs[index] = el
              }
            "
            @mouseenter="onItemEnter(index)"
            @mouseleave="onItemLeave(index)"
          >
            <RouterLink
              class="nav-link nav-link-animated px-3 px-lg-4"
              :class="{ 'is-active': activeIndex === index }"
              :to="item.path"
              @click="handleNavClick(index)"
            >
              {{ item.label }}
            </RouterLink>
          </li>

          <li class="nav-slider-primary d-none d-lg-block" :style="sliderStyle"></li>
        </ul>

        <div class="d-flex flex-column flex-lg-row align-items-center gap-4 pb-4 pb-lg-0">
          <RouterLink
            v-if="authStore.isLoggedIn"
            to="/collection"
            class="position-relative text-decoration-none text-dark d-flex align-items-center gap-3"
          >
            <div class="position-relative d-flex mt-1 gap-2">
              <span class="material-symbols-outlined fs-3 text-primary transition-all hover-scale"
                >favorite</span
              >
              <span
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary shadow-sm"
                style="font-size: 6.3px"
              >
                {{ favoritesCount }}
              </span>
            </div>
            <span class="d-lg-none text-muted text-lg fw-medium">My Favorites</span>
          </RouterLink>

          <button
            v-if="!authStore.isLoggedIn"
            @click="toggleLoginModal"
            class="btn btn-primary btn-sm rounded-pill px-5 px-lg-4 py-2 fw-bolder shadow-sm"
          >
            Log In
          </button>

          <button
            v-else
            @click="toggleLoginModal"
            class="btn btn-outline-primary btn-sm rounded-pill px-5 px-lg-4 py-2 fw-bolder"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>

    <!-- Login/Signup Modal via Teleport -->
    <Teleport to="body">
      <div v-if="showLoginModal" class="login-modal-overlay d-flex align-items-center justify-content-center frosted-glass position-fixed top-0 start-0 w-100 h-100 p-3" style="z-index: 1055;" @click.self="showLoginModal = false">
        <div class="card border-0 shadow-lg rounded-4 w-100 p-4" style="max-width: 400px">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="mb-0 fw-bold" style="font-family: 'Zilla Slab'; font-style: italic;">
              {{ isSignUpMode ? 'Sign Up' : 'Log In' }}
            </h4>
            <button @click="showLoginModal = false" class="btn-close" aria-label="Close"></button>
          </div>
          <form @submit.prevent="handleAuth">
            <template v-if="!isSignUpMode">
              <div class="mb-3">
                <label for="auth-username" class="form-label text-sm fw-bold">Username</label>
                <input id="auth-username" type="text" class="form-control rounded-3" v-model="loginForm.username" aria-required="true" required>
              </div>
              <div class="mb-4">
                <label for="auth-password" class="form-label text-sm fw-bold">Password</label>
                <input id="auth-password" type="password" class="form-control rounded-3" v-model="loginForm.password" aria-required="true" required>
              </div>
            </template>

            <template v-else>
              <div class="mb-3">
                <label for="signup-display" class="form-label text-sm fw-bold">Display Name</label>
                <input id="signup-display" type="text" class="form-control rounded-3" v-model="signupForm.displayName" aria-required="true" required>
              </div>
              <div class="mb-3">
                <label for="signup-username" class="form-label text-sm fw-bold">Username</label>
                <input id="signup-username" type="text" class="form-control rounded-3" v-model="signupForm.username" aria-required="true" required>
              </div>
              <div class="mb-4">
                <label for="signup-password" class="form-label text-sm fw-bold">Password</label>
                <input id="signup-password" type="password" class="form-control rounded-3" v-model="signupForm.password" aria-required="true" required>
              </div>
            </template>

            <div v-if="authError" class="alert alert-danger py-2 text-sm">{{ authError }}</div>
            
            <button type="submit" class="btn btn-primary w-100 rounded-pill fw-bold">
              {{ isSignUpMode ? 'Sign Up' : 'Log In' }}
            </button>

            <div class="text-center mt-3 text-sm">
              <button type="button" class="btn btn-link text-decoration-none p-0 text-muted" @click="isSignUpMode = !isSignUpMode; authError = ''">
                {{ isSignUpMode ? 'Already have an account? Log In' : "Don't have an account? Sign Up" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </nav>
</template>

<style scoped>
.login-modal-overlay {
  background: rgba(0, 0, 0, 0.4);
}
</style>
