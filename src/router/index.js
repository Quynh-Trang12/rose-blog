import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store/index.js'

import HomeView from '../views/HomeView.vue'
import CollectionView from '../views/CollectionView.vue'
import NewsView from '../views/NewsView.vue'
import AboutView from '../views/AboutView.vue'
import UnauthorizedView from '../views/UnauthorizedView.vue'

// ==========================================
// ROUTES
// ==========================================
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/home', name: 'homePage', component: HomeView },
  {
    path: '/collection',
    name: 'collection',
    component: CollectionView,
    meta: { requiresAuth: true },
  },
  { path: '/news', name: 'news', component: NewsView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/unauthorized', name: 'unauthorized', component: UnauthorizedView },
  // Catch-all route — redirects any unknown paths back to home.
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  /**
   * Controls scroll behaviour when navigating between routes.
   * @param {Object} to - The target route object
   * @param {Object} _from - The previous route object
   * @param {Object} savedPosition - The previous scroll position
   * @returns {Promise|Object} Scroll position descriptor
   */
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return new Promise((resolve) => {
        // Defer scroll to allow DOM to settle after page load/mount
        setTimeout(() => {
          resolve({ el: to.hash, behavior: 'smooth', top: 80 })
        }, 350)
      })
    }
    return { top: 0, behavior: 'smooth' }
  },
})

// ==========================================
// NAVIGATION GUARD
// ==========================================
/**
 * The beforeEach guard runs before every route transition.
 * Uses Vuex 4 auth module's isLoggedIn getter to control protected access.
 */
router.beforeEach((to, _from, next) => {
  const isLoggedIn = store.getters['auth/isLoggedIn']

  if (to.meta.requiresAuth && !isLoggedIn) {
    // Redirect to the unauthorized view when a guest
    // attempts to access a protected route (/collection).
    next({ name: 'unauthorized' })
  } else {
    // Allow navigation to proceed normally.
    next()
  }
})

export default router
