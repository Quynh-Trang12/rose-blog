/**
 * ==========================================
 * FILE: store/modules/news.js
 * ==========================================
 * Description:
 * Vuex 4 namespaced module managing the collection of news items.
 * Handles filtering (keyword, type, date, botanical attributes),
 * pagination, and social interactions (reactions, comments, shares).
 *
 * Fix B2: itemsFilter now passes currentUser so private posts
 * are visible only to their author.
 */

import newsData from '@/data/news.json'

export default {
  namespaced: true,

  // ==========================================
  // STATE
  // ==========================================
  state: () => ({
    newsItems: newsData,

    newsFilters: {
      keyword: '', category: 'all', date: 'all',
      color: 'all', fragrance: 'all', bloomingSeason: 'all',
      strength: 'all', thornLevel: 'all', idealFor: 'all',
    },
    collectionFilters: {
      keyword: '', category: 'all', date: 'all',
      color: 'all', fragrance: 'all', bloomingSeason: 'all',
      strength: 'all', thornLevel: 'all', idealFor: 'all',
    },
    newsPage: 1,
    collectionPage: 1,
    itemsPerPage: 6,
  }),

  // ==========================================
  // MUTATIONS
  // ==========================================
  mutations: {
    ADD_NEWS_ITEM(state, item) {
      state.newsItems.unshift(item)
    },

    UPDATE_NEWS_ITEM(state, updatedItem) {
      const index = state.newsItems.findIndex((a) => a.id === updatedItem.id)
      if (index !== -1) {
        state.newsItems[index] = { ...state.newsItems[index], ...updatedItem }
      }
    },

    DELETE_NEWS_ITEM(state, id) {
      state.newsItems = state.newsItems.filter((item) => item.id !== id)
      const totalPages = Math.ceil(state.newsItems.length / state.itemsPerPage) || 1
      if (state.newsPage > totalPages) state.newsPage = totalPages
    },

    SET_SEARCH_QUERY(state, { query, target = 'news' }) {
      if (target === 'news') {
        state.newsFilters.keyword = query
        state.newsPage = 1
      } else {
        state.collectionFilters.keyword = query
        state.collectionPage = 1
      }
    },

    APPLY_FILTERS(state, { filters, target = 'news' }) {
      if (target === 'news') {
        state.newsFilters = { ...state.newsFilters, ...filters }
        state.newsPage = 1
      } else {
        state.collectionFilters = { ...state.collectionFilters, ...filters }
        state.collectionPage = 1
      }
    },

    CLEAR_FILTERS(state, target = 'news') {
      const emptyFilters = {
        keyword: '', category: 'all', date: 'all',
        color: 'all', fragrance: 'all', bloomingSeason: 'all',
        strength: 'all', thornLevel: 'all', idealFor: 'all',
      }
      if (target === 'news') {
        state.newsFilters = { ...emptyFilters }
        state.newsPage = 1
      } else {
        state.collectionFilters = { ...emptyFilters }
        state.collectionPage = 1
      }
    },

    SET_PAGE(state, { page, target = 'news' }) {
      if (target === 'news') state.newsPage = page
      else state.collectionPage = page
    },

    REACT_TO_NEWS_ITEM(state, id) {
      const item = state.newsItems.find((a) => a.id === id)
      if (item) item.reactions = (item.reactions || 0) + 1
    },

    ADD_COMMENT(state, { id, comment }) {
      const newsItem = state.newsItems.find((n) => n.id === id)
      if (newsItem) {
        if (!newsItem.comments) newsItem.comments = []
        newsItem.comments.push({
          id: Date.now(),
          text: comment.text,
          authorName: comment.author?.displayName || 'Guest',
          authorAvatar: comment.author?.avatar || 'https://i.pravatar.cc/40',
          date: new Date().toISOString(),
        })
      }
    },

    INCREMENT_SHARE(state, id) {
      const item = state.newsItems.find((a) => a.id === id)
      if (item) item.shares = (item.shares || 0) + 1
    },
  },

  // ==========================================
  // ACTIONS
  // ==========================================
  actions: {
    addNewsItem({ commit }, itemData) {
      const newItem = {
        ...itemData,
        id: `post-${Date.now()}`,
        date: new Date().toISOString(),
        reactions: 0,
        shares: 0,
        comments: [],
        // Preserve isPublic flag from payload; default to true if not set.
        isPublic: itemData.isPublic !== false,
      }
      commit('ADD_NEWS_ITEM', newItem)
    },

    updateArticle({ commit }, updatedItem) {
      commit('UPDATE_NEWS_ITEM', updatedItem)
    },

    deleteArticle({ commit }, id) {
      commit('DELETE_NEWS_ITEM', id)
    },

    setSearchQuery({ commit }, payload) {
      if (typeof payload === 'string') commit('SET_SEARCH_QUERY', { query: payload, target: 'news' })
      else commit('SET_SEARCH_QUERY', payload)
    },

    applyFilters({ commit }, payload) {
      commit('APPLY_FILTERS', payload)
    },

    clearFilters({ commit }, target = 'news') {
      commit('CLEAR_FILTERS', target)
    },

    setPage({ getters, commit }, payload) {
      const page   = typeof payload === 'number' ? payload : payload.page
      const target = typeof payload === 'number' ? 'news'  : payload.target
      const total  = target === 'news' ? getters.newsTotalPages : getters.collectionTotalPages
      if (page >= 1 && page <= total) commit('SET_PAGE', { page, target })
    },

    reactToNewsItem({ commit }, id)         { commit('REACT_TO_NEWS_ITEM', id)  },
    addComment({ commit }, payload)          { commit('ADD_COMMENT', payload)     },
    incrementShare({ commit }, id)           { commit('INCREMENT_SHARE', id)      },
  },

  // ==========================================
  // GETTERS
  // ==========================================
  getters: {
    allNewsItems: (state) => state.newsItems,

    /**
     * Core filter pipeline.
     * Fix B2: receives currentUserId so private posts are visible
     * only to their author; all other users see only public posts.
     *
     * @param {Array}  items
     * @param {Object} filters
     * @param {number|string|null} currentUserId
     * @returns {Array}
     */
    itemsFilter: () => (items, filters, currentUserId = null) => {
      let result = items.filter((a) => {
        // Blocked moderation status — always hidden.
        if (a.moderation?.status === 'blocked') return false
        if (a.moderation && a.moderation.status !== 'approved' && a.moderation.status !== 'pending') return false

        // B2: Private post visibility — only the author can see their own private posts.
        if (a.isPublic === false) {
          return currentUserId !== null && String(a.authorID) === String(currentUserId)
        }
        return true
      })

      // Keyword search
      const query = (filters.keyword || '').toLowerCase().trim()
      if (query) {
        result = result.filter((a) => {
          const content = a.content || a.description || ''
          return (
            a.title.toLowerCase().includes(query) ||
            content.toLowerCase().includes(query) ||
            a.color?.toLowerCase().includes(query) ||
            a.fragrance?.toLowerCase().includes(query) ||
            a.bloomingSeason?.toLowerCase().includes(query) ||
            String(a.strength || '').toLowerCase().includes(query) ||
            a.thornLevel?.toLowerCase().includes(query) ||
            a.idealFor?.toLowerCase().includes(query)
          )
        })
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        result = result.filter((a) => (a.category || a.type) === filters.category)
      }

      // Attribute filters
      if (filters.color        && filters.color        !== 'all') result = result.filter((a) => a.color         === filters.color)
      if (filters.fragrance    && filters.fragrance    !== 'all') result = result.filter((a) => a.fragrance     === filters.fragrance)
      if (filters.bloomingSeason && filters.bloomingSeason !== 'all') result = result.filter((a) => a.bloomingSeason === filters.bloomingSeason)
      if (filters.strength     && filters.strength     !== 'all') result = result.filter((a) => String(a.strength) === String(filters.strength))
      if (filters.thornLevel   && filters.thornLevel   !== 'all') result = result.filter((a) => a.thornLevel    === filters.thornLevel)
      if (filters.idealFor     && filters.idealFor     !== 'all') result = result.filter((a) => a.idealFor      === filters.idealFor)

      // Date filter
      if (filters.date && filters.date !== 'all') {
        const now = new Date()
        result = result.filter((a) => {
          const postDate = new Date(a.date)
          if (filters.date === 'today') return postDate.toDateString() === now.toDateString()
          if (filters.date === 'week')  return (now - postDate) / 86400000 <= 7
          if (filters.date === 'month') return (now - postDate) / 86400000 <= 31
          return true
        })
      }

      return result
    },

    filteredNewsItems: (state, getters, rootState) => {
      const uid = rootState.auth?.currentUser?.id ?? null
      return getters.itemsFilter(state.newsItems, state.newsFilters, uid)
    },

    filteredCollectionItems: (state, getters, rootState, rootGetters) => {
      const savedIds   = rootGetters['auth/mySavedPostIds'] || []
      const uid        = rootState.auth?.currentUser?.id ?? null
      const savedItems = state.newsItems.filter((i) =>
        savedIds.some((id) => String(id) === String(i.id)),
      )
      return getters.itemsFilter(savedItems, state.collectionFilters, uid)
    },

    totalNewsItems:       (state, getters) => getters.filteredNewsItems.length,
    totalCollectionItems: (state, getters) => getters.filteredCollectionItems.length,

    newsTotalPages:       (state, getters) => Math.ceil(getters.totalNewsItems       / state.itemsPerPage) || 1,
    collectionTotalPages: (state, getters) => Math.ceil(getters.totalCollectionItems / state.itemsPerPage) || 1,

    paginatedNewsItems: (state, getters) => {
      const start = (state.newsPage - 1) * state.itemsPerPage
      return getters.filteredNewsItems.slice(start, start + state.itemsPerPage)
    },

    paginatedCollectionItems: (state, getters) => {
      const start = (state.collectionPage - 1) * state.itemsPerPage
      return getters.filteredCollectionItems.slice(start, start + state.itemsPerPage)
    },
  },
}
