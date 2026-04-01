import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import CollectionView from '../views/CollectionView.vue'
import NewsView from '../views/NewsView.vue'
import AboutView from '../views/AboutView.vue'
import AdminView from '../views/AdminView.vue'
import UnauthorizedView from '../views/UnauthorizedView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/collection',
    name: 'collection',
    component: CollectionView,
    meta: { requiresAuth: true }, // login required
  },
  {
    path: '/news',
    name: 'news',
    component: NewsView,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true }, // admin only
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
  },
  // Catch-all — always last
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})

// ─── Navigation Guard ──────────────────────────────────────────────────────
// Converted to async/await to prevent race conditions with the router
router.beforeEach(async (to, _from) => {
  // Dynamically import and await so the guard reads fresh store state synchronously
  const { useAuthStore } = await import('@/stores/authStore')
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    // Not logged in → redirect to unauthorized page
    return { name: 'unauthorized' }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    // Logged in but not admin → redirect to unauthorized page
    return { name: 'unauthorized' }
  }

  // Returning undefined (or true) allows the navigation to proceed
  return true
})

export default router
