/**
 * ==========================================
 * FILE: router/index.js
 * ==========================================
 * Description:
 * Main router configuration for the application using Vue Router.
 * Handles view definitions and navigation guards for authentication.
 */
import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store/index.js'

import HomeView from '../views/HomeView.vue'
import CollectionView from '../views/CollectionView.vue'
import NewsView from '../views/NewsView.vue'
import AboutView from '../views/AboutView.vue'
import UnauthorizedView from '../views/UnauthorizedView.vue'
// AdminView is NOT imported

// ==========================================
// ROUTES
// ==========================================
var routes = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/collection',
    name: 'collection',
    component: CollectionView,
    meta: { requiresAuth: true }, // Restricted access
  },
  { path: '/news', name: 'news', component: NewsView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/unauthorized', name: 'unauthorized', component: UnauthorizedView },
  // Catch-all: Redirects any unknown paths back to the home page
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Smoothly scrolls to the top of the page on navigation
  scrollBehavior: function () {
    return { top: 0, behavior: 'smooth' }
  },
})

// ==========================================
// NAVIGATION GUARD
// ==========================================
router.beforeEach(function (to, from, next) {
  // Explanation: Guards routes that require the user to be logged in.
  // requiresAuth is the only access level in this application — there is no admin role.
  var isLoggedIn = store.getters['auth/isLoggedIn']

  if (to.meta.requiresAuth && !isLoggedIn) {
    // Explanation: If the route requires auth and we aren't logged in, send to unauthorized view.
    next({ name: 'unauthorized' })
  } else {
    // Explanation: Otherwise, allow navigation to proceed.
    next()
  }
})

export default router
