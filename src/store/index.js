/**
 * ==========================================
 * FILE: store/index.js
 * ==========================================
 * Description:
 * Root Vuex store. Combines the auth and news namespaced modules
 * into a single store instance that is registered with the Vue application.
 */
import { createStore } from 'vuex'
import authModule from './modules/authStore.js'
import newsModule from './modules/newsStore.js'

const store = createStore({
  modules: {
    auth: authModule,
    news: newsModule,
  },
})

export default store
