/**
 * ==========================================
 * FILE: store/index.js
 * ==========================================
 * Description:
 * Root Vuex 4 store configuration. Combines the auth and news namespaced
 * modules into a single store instance that is registered with the Vue
 * application via app.use(store) in main.js.
 *
 * The auth module handles user authentication, session persistence,
 * and user blocking.
 * The news module handles articles, filtering, pagination, and social
 * interactions.
 */
import { createStore } from 'vuex'
import authModule from './modules/authStore.js'
import newsModule from './modules/newsStore.js'

// Explanation: createStore() initialises the Vuex 4 store with two
// namespaced modules. Components access state and dispatch actions
// via this.$store using prefixed paths (e.g., 'auth/login', 'news/addArticle').
const store = createStore({
  modules: {
    auth: authModule,
    news: newsModule,
  },
})

export default store
