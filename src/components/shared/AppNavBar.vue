<script setup>
import { ref, computed, nextTick, watch, onBeforeUpdate } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const isLoggedIn = ref(false)
const favoritesCount = ref(0)
const isMenuOpen = ref(false)

const items = [
  { label: 'Home', path: '/' },
  { label: 'Collection', path: '/collection' },
  { label: 'News', path: '/news' },
  { label: 'About', path: '/about' }
]

const toggleLogin = () => {
  isLoggedIn.value = !isLoggedIn.value
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

watch(() => route.path, (newPath) => {
  const index = items.findIndex(item => item.path === newPath)
  if (index !== -1) {
    activeIndex.value = index
  }
}, { immediate: true })

const getDimensions = (index, asActive = false) => {
  const el = itemRefs.value[index]
  if (!el) return { left: 0, width: 0 }
  const w = el.offsetWidth
  return asActive
    ? { left: el.offsetLeft + (w * 0.3), width: w * 0.4 }
    : { left: el.offsetLeft, width: w }
}

const onItemEnter = async (i) => {
  if (isMobileOrTablet()) return
  clearTimeout(leaveTimeout)

  const prev = lastHoveredIndex.value
  const isNeighbor = prev !== -1 && Math.abs(i - prev) === 1
  const isCurrentActive = (i === activeIndex.value)

  if (isNeighbor) {
    if (sliderOpacity.value === 0) {
      const prevIsActive = (prev === activeIndex.value)
      const dim = getDimensions(prev, prevIsActive)
      sliderTransition.value = 'none'
      sliderLeft.value = dim.left
      sliderWidth.value = dim.width
      sliderOpacity.value = 1
      await nextTick()
      if(itemRefs.value[i]) void itemRefs.value[i].offsetWidth
    }

    sliderTransition.value = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    const targetDim = getDimensions(i, isCurrentActive)
    sliderLeft.value = targetDim.left
    sliderWidth.value = targetDim.width

    if (isCurrentActive) {
      setTimeout(() => { if (lastHoveredIndex.value === i) sliderOpacity.value = 0 }, 300)
    }
  } else {
    if (!isCurrentActive) {
      const dim = getDimensions(i)
      sliderTransition.value = 'none'
      sliderLeft.value = dim.left + (dim.width / 2)
      sliderWidth.value = 0
      sliderOpacity.value = 1

      await nextTick()
      if(itemRefs.value[i]) void itemRefs.value[i].offsetWidth

      sliderTransition.value = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
      const isCurrentActive = (i === activeIndex.value)
      const dim = getDimensions(i, isCurrentActive)

      sliderTransition.value = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      sliderLeft.value = dim.left + (dim.width / 2)
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
  sliderTransition.value = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
  transition: sliderTransition.value
}))
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-white sticky-top py-2 border-bottom shadow-sm">
    <div class="container">

      <RouterLink class="navbar-brand d-flex align-items-center gap-2 z-3" to="/">
        <div
          class="bg-danger text-white rounded p-1 d-flex align-items-center justify-content-center"
          style="width: 32px; height: 32px"
        >
          <span class="material-symbols-outlined fs-5">local_florist</span>
        </div>
        <div class="d-flex flex-column lh-1">
          <span class="fw-bold text-dark fs-5" style="letter-spacing: -0.5px">The Rose Blog</span>
        </div>
      </RouterLink>

      <button
        class="navbar-toggler border-0 shadow-none custom-toggler"
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

        <ul class="navbar-nav mx-auto fw-medium text-center text-lg-start mt-1 mt-lg-0 py-3 py-lg-0 position-relative align-items-center">

          <li class="nav-item m-0 p-0"
              v-for="(item, index) in items"
              :key="index"
              :ref="el => { if(el) itemRefs[index] = el }"
              @mouseenter="onItemEnter(index)"
              @mouseleave="onItemLeave(index)">

            <RouterLink
               class="nav-link custom-link px-3 px-lg-4"
               :class="{ 'is-active': activeIndex === index }"
               :to="item.path"
               @click="handleNavClick(index)"
            >
              {{ item.label }}
            </RouterLink>
          </li>

          <div class="desktop-slider d-none d-lg-block" :style="sliderStyle"></div>
        </ul>

        <div class="d-flex flex-column flex-lg-row align-items-center gap-4 pb-4 pb-lg-0">
          <RouterLink
            v-if="isLoggedIn"
            to="/collection"
            class="position-relative text-decoration-none text-dark d-flex align-items-center gap-3"
          >
            <div class="position-relative d-flex mt-1 gap-2">
              <span class="material-symbols-outlined fs-4 text-danger transition-all hover-scale"
                >favorite</span
              >
              <span
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm"
                style="font-size: 0.6rem"
              >
                {{ favoritesCount }}
              </span>
            </div>
            <span class="d-lg-none fw-medium">My Favorites</span>
          </RouterLink>

          <button
            v-if="!isLoggedIn"
            @click="toggleLogin"
            class="btn btn-danger btn-sm rounded-pill px-4 py-2 fw-bold shadow-sm w-100 w-lg-auto"
          >
            Log In
          </button>
          <button
            v-else
            @click="toggleLogin"
            class="btn btn-outline-secondary btn-sm rounded-pill px-4 py-2 fw-bold w-100 w-lg-auto"
          >
            Log Out
          </button>

        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.collapse {
  transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-link {
  color: #4b5563;
  transition: color 0.3s ease, text-shadow 0.3s ease;
  position: relative;
  display: inline-block;
  font-weight: 500;
}

/* CHANGED: Target .is-active instead of .active */
.custom-link:hover,
.custom-link.is-active {
  color: #e11d48;
  text-shadow: 0 0 .65px #e11d48;
}

.hover-scale { transition: transform 0.2s ease; }
.hover-scale:hover { transform: scale(1.15); }

@media (min-width: 992px) {
  .custom-link {
    padding-top: 0.12rem;
    padding-bottom: 0.38rem;
  }
  .custom-link::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    height: 2.3px;
    border-radius: 3px;
    background-color: #e11d48;
    width: 40%;
    transform: translateX(-50%) scaleX(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  /* CHANGED */
  .custom-link.is-active::after {
    transform: translateX(-50%) scaleX(1);
  }

  .desktop-slider {
    position: absolute;
    bottom: 2px;
    height: 2.3px;
    border-radius: 3px;
    background-color: #e11d48;
    pointer-events: none;
  }
}

@media (max-width: 991px) {
  .custom-link::before {
    content: '';
    position: absolute;
    bottom: 2px; left: 50%;
    height: 3px; border-radius: 3px;
    background-color: #e11d48;
    width: 100%;
    transform: translateX(-50%) scaleX(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .custom-link::after {
    content: '';
    position: absolute;
    bottom: 2px; left: 50%;
    height: 3px; border-radius: 3px;
    background-color: #e11d48;
    width: 40%;
    transform: translateX(-50%) scaleX(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* CHANGED */
  .custom-link:hover::before { transform: translateX(-50%) scaleX(1); }
  .custom-link.is-active::after { transform: translateX(-50%) scaleX(1); }
  .custom-link.is-active:hover::before { transform: translateX(-50%) scaleX(0) !important; }
}

.custom-toggler {
  width: 30px;
  height: 24px;
  position: relative;
  cursor: pointer;
  z-index: 10;
}

.hamburger-line {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: #111827;
  border-radius: 2px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
}

.hamburger-line:nth-child(1) { top: 0px; }
.hamburger-line:nth-child(2) { top: 10px; }
.hamburger-line:nth-child(3) { top: 20px; }

.custom-toggler.open .hamburger-line:nth-child(1) {
  top: 10px;
  transform: rotate(135deg);
}
.custom-toggler.open .hamburger-line:nth-child(2) {
  opacity: 0;
  left: -20px;
}
.custom-toggler.open .hamburger-line:nth-child(3) {
  top: 10px;
  transform: rotate(-135deg);
}
</style>
