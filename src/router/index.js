/**
 * ==========================================
 * FILE: router/index.js
 * ==========================================
 * Description:
 * Main router configuration for the application using Vue Router 4.
 * Defines all view routes, applies navigation guards for authentication,
 * and provides smooth scrolling with hash-based anchor support.
 *
 * Routes: / (Home), /news, /collection (auth required), /about,
 *         /unauthorized, catch-all redirect to /.
 */
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
// Explanation: Each route object defines a URL path, a named identifier,
// and the component to render. The meta.requiresAuth flag is checked
// by the navigation guard below.
const routes = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/collection',
    name: 'collection',
    component: CollectionView,
    // Explanation: This route is accessible only to authenticated users.
    meta: { requiresAuth: true },
  },
  { path: '/news', name: 'news', component: NewsView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/unauthorized', name: 'unauthorized', component: UnauthorizedView },
  // Explanation: Catch-all route — redirects any unknown paths back to home.
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  /**
   * Controls scroll behaviour when navigating between routes.
   * Explanation: If the target route includes a hash (e.g., /news#post-101),
   * the browser scrolls to that element. Otherwise, it scrolls to the top.
   * @param {Object} to - The target route object
   * @returns {Object} Scroll position descriptor
   */
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80,
      }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

// ==========================================
// NAVIGATION GUARD
// ==========================================
/**
 * Explanation: The beforeEach guard runs before every route transition.
 * It checks whether the target route requires authentication (via the
 * meta.requiresAuth flag) and redirects unauthenticated users to the
 * /unauthorized view. Authentication state is read from the Vuex
 * auth module's isLoggedIn getter.
 */
router.beforeEach((to, _from, next) => {
  const isLoggedIn = store.getters['auth/isLoggedIn']

  if (to.meta.requiresAuth && !isLoggedIn) {
    // Explanation: Redirect to the unauthorized view when a guest
    // attempts to access a protected route.
    next({ name: 'unauthorized' })
  } else {
    // Explanation: Allow navigation to proceed normally.
    next()
  }
})

export default router
