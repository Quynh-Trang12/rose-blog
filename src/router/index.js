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
// Import lazily to avoid circular dependency with Pinia
router.beforeEach((to, _from, next) => {
  // Dynamically import so the guard always reads fresh store state
  import('@/stores/authStore').then(({ useAuthStore }) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      // Not logged in → redirect to unauthorized page
      return next({ name: 'unauthorized' })
    }

    if (to.meta.requiresAdmin && !auth.isAdmin) {
      // Logged in but not admin → redirect to unauthorized page
      return next({ name: 'unauthorized' })
    }

    next()
  })
})

export default router
