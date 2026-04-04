/**
 * ==========================================
 * FILE: store/modules/news.js
 * ==========================================
 * Description:
 * Vuex 4 namespaced module managing the collection of news items.
 * Handles filtering (keyword, type, date), pagination, and social
 * interactions (reactions, comments, shares).
 *
 * State: newsItems, searchQuery, filters, currentPage, itemsPerPage.
 * Getters: filteredNewsItems, totalNewsItems, totalPages, paginatedNewsItems, allNewsItems.
 * Mutations: ADD_NEWS_ITEM, UPDATE_NEWS_ITEM, DELETE_NEWS_ITEM,
 *            SET_SEARCH_QUERY, APPLY_FILTERS, CLEAR_FILTERS, SET_PAGE,
 *            REACT_TO_NEWS_ITEM, ADD_COMMENT, INCREMENT_SHARE.
 * Actions: addNewsItem, updateNewsItem, deleteNewsItem, setSearchQuery,
 *          applyFilters, clearFilters, setPage, reactToNewsItem,
 *          addComment, incrementShare.
 */

import newsData from '@/data/news.json'

export default {
  namespaced: true,

  // ==========================================
  // STATE
  // ==========================================
  state: () => ({
    newsItems: newsData,
    searchQuery: '',
    filters: { date: 'all', category: 'all', keyword: '' },
    currentPage: 1,
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
      if (state.currentPage > totalPages) {
        state.currentPage = totalPages
      }
    },

    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query
      state.currentPage = 1
    },

    APPLY_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
      state.currentPage = 1
    },

    CLEAR_FILTERS(state) {
      state.searchQuery = ''
      state.filters = { date: 'all', category: 'all', keyword: '' }
      state.currentPage = 1
    },

    SET_PAGE(state, page) {
      state.currentPage = page
    },

    REACT_TO_NEWS_ITEM(state, id) {
      const item = state.newsItems.find((a) => a.id === id)
      if (item) {
        item.reactions = (item.reactions || 0) + 1
      }
    },

    ADD_COMMENT(state, { id, comment }) {
      const newsItem = state.newsItems.find(n => n.id === id)
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
      if (item) {
        item.shares = (item.shares || 0) + 1
      }
    },
  },

  // ==========================================
  // ACTIONS
  // ==========================================
  actions: {
    addNewsItem({ commit }, itemData) {
      const newId = Date.now() // Simple unique ID
      const newItem = {
        ...itemData,
        id: `post-${newId}`,
        date: new Date().toISOString(),
        reactions: 0,
        shares: 0,
        comments: [],
      }
      commit('ADD_NEWS_ITEM', newItem)
    },

    updateNewsItem({ commit }, updatedItem) {
      commit('UPDATE_NEWS_ITEM', updatedItem)
    },

    deleteNewsItem({ commit }, id) {
      commit('DELETE_NEWS_ITEM', id)
    },

    setSearchQuery({ commit }, query) {
      commit('SET_SEARCH_QUERY', query)
    },

    applyFilters({ commit }, newFilters) {
      commit('APPLY_FILTERS', newFilters)
    },

    clearFilters({ commit }) {
      commit('CLEAR_FILTERS')
    },

    setPage({ getters, commit }, page) {
      if (page >= 1 && page <= getters.totalPages) {
        commit('SET_PAGE', page)
      }
    },

    reactToNewsItem({ commit }, id) {
      commit('REACT_TO_NEWS_ITEM', id)
    },

    addComment({ commit }, payload) {
      commit('ADD_COMMENT', payload)
    },

    incrementShare({ commit }, id) {
      commit('INCREMENT_SHARE', id)
    },
  },

  // ==========================================
  // GETTERS
  // ==========================================
  getters: {
    allNewsItems: (state) => state.newsItems,

    filteredNewsItems(state, getters, rootState, rootGetters) {
      const blockedIds = rootGetters['auth/blockedUserIds'] || []
      let result = state.newsItems.filter((a) => {
        // Exclude private posts
        if (a.isPublic === false) return false

        // Exclude posts with a blocked moderation status
        if (a.moderation?.status === 'blocked') return false

        // Exclude posts authored by blocked users
        // Note: Field in JSON is authorID (capital ID)
        if (blockedIds.includes(a.authorID)) return false

        // Approved or pending are okay
        if (a.moderation && a.moderation.status !== 'approved' && a.moderation.status !== 'pending') {
            return false
        }

        return true
      })

      // Keyword search
      const query = (state.searchQuery || state.filters.keyword || '').toLowerCase().trim()
      if (query) {
        result = result.filter((a) => {
          const content = a.content || a.description || ''
          return a.title.toLowerCase().includes(query) || content.toLowerCase().includes(query)
        })
      }

      // Category filter
      if (state.filters.category && state.filters.category !== 'all') {
        result = result.filter((a) => (a.category || a.type) === state.filters.category)
      }

      // Date filter
      if (state.filters.date && state.filters.date !== 'all') {
        const now = new Date()
        result = result.filter((a) => {
          const postDate = new Date(a.date)
          if (state.filters.date === 'today') {
            return postDate.toDateString() === now.toDateString()
          }
          if (state.filters.date === 'week') {
            return (now - postDate) / (1000 * 60 * 60 * 24) <= 7
          }
          if (state.filters.date === 'month') {
            return (now - postDate) / (1000 * 60 * 60 * 24) <= 31
          }
          return true
        })
      }

      return result
    },

    totalNewsItems: (_state, getters) => getters.filteredNewsItems.length,

    totalPages: (state, getters) =>
      Math.ceil(getters.filteredNewsItems.length / state.itemsPerPage) || 1,

    paginatedNewsItems: (state, getters) => {
      const startIndex = (state.currentPage - 1) * state.itemsPerPage
      const endIndex = startIndex + state.itemsPerPage
      return getters.filteredNewsItems.slice(startIndex, endIndex)
    },
  },
}
