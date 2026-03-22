/**
 * Vue Router Configuration
 * Maps URL paths to specific View components.
 */

import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import CollectionView from '../views/CollectionView.vue'
import NewsView from '../views/NewsView.vue'
import AboutView from '../views/AboutView.vue'

// 1. Define the routes array separately
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/collection',
    name: 'collecion',
    component: CollectionView,
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
]

// 2. Pass the routes variable into the router config
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes, // This is short for `routes: routes`
})

export default router
