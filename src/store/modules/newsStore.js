/**
 * ==========================================
 * FILE: store/modules/newsStore.js
 * ==========================================
 * Description:
 * Vuex 4 namespaced module managing the collection of news articles.
 * Handles filtering (keyword, type, color, fragrance, blooming season,
 * strength, thorn level, idealFor, date), pagination, and social
 * interactions (reactions, comments, shares).
 *
 * State: articles, searchQuery, filters, currentPage, itemsPerPage.
 * Getters: filteredArticles, totalArticles, totalPages, paginatedArticles, allArticles.
 * Mutations: UNSHIFT_ARTICLE, UPDATE_ARTICLE, DELETE_ARTICLE,
 *            SET_SEARCH_QUERY, SET_FILTERS, CLEAR_FILTERS, SET_PAGE,
 *            INCREMENT_REACTIONS, PUSH_COMMENT, INCREMENT_SHARES.
 * Actions: addArticle, updateArticle, deleteArticle, setSearchQuery,
 *          applyFilters, clearFilters, setPage, reactToArticle,
 *          addComment, incrementShare.
 */

import newsData from '@/data/news.json'

export default {
  namespaced: true,

  // ==========================================
  // STATE
  // ==========================================
  state: () => ({
    // Explanation: The articles array is initialised from the static JSON data file.
    // At runtime, new articles can be added via the addArticle action.
    articles: newsData,

    // Explanation: The global search query string, bound to the search input.
    searchQuery: '',

    // Explanation: An object holding every active filter criterion.
    // Each key defaults to 'all' (no filtering) or an empty string.
    filters: {
      date: 'all',
      type: [],
      color: [],
      fragrance: [],
      bloomingSeason: [],
      strength: [],
      thornLevel: [],
      idealFor: [],
      keyword: '',
    },

    // Explanation: Pagination state — currentPage is 1-indexed.
    currentPage: 1,
    // Explanation: Number of articles displayed per page in the news feed.
    itemsPerPage: 6,
  }),

  // ==========================================
  // MUTATIONS
  // ==========================================
  mutations: {
    /**
     * Prepends a new article to the beginning of the articles array.
     * Explanation: New posts appear at the top of the feed by design.
     * @param {Object} state - The Vuex module state
     * @param {Object} article - The complete article object to add
     */
    UNSHIFT_ARTICLE(state, article) {
      state.articles.unshift(article)
    },

    /**
     * Merges updated fields into an existing article.
     * Explanation: Finds the article by ID and spreads the payload
     * over the existing object, preserving unmodified fields.
     * @param {Object} state - The Vuex module state
     * @param {Object} payload - Must include { id, ...fieldsToUpdate }
     */
    UPDATE_ARTICLE(state, payload) {
      const index = state.articles.findIndex((a) => a.id === payload.id)
      if (index !== -1) {
        state.articles[index] = { ...state.articles[index], ...payload }
      }
    },

    /**
     * Removes an article by its ID and adjusts pagination if needed.
     * Explanation: After deletion, if the currentPage exceeds the new
     * total page count, it is clamped to the last valid page.
     * @param {Object} state - The Vuex module state
     * @param {string|number} id - The ID of the article to remove
     */
    DELETE_ARTICLE(state, id) {
      state.articles = state.articles.filter((article) => article.id !== id)
      const totalPages = Math.ceil(state.articles.length / state.itemsPerPage) || 1
      if (state.currentPage > totalPages) {
        state.currentPage = totalPages
      }
    },

    /**
     * Updates the global search query and resets pagination to page 1.
     * Explanation: Any change in search criteria should display results
     * starting from the first page.
     * @param {Object} state - The Vuex module state
     * @param {string} query - The new search term
     */
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query
      state.currentPage = 1
    },

    /**
     * Merges new filter values into the existing filters object and resets to page 1.
     * Explanation: Partial updates are supported — only the keys present
     * in the payload are overwritten; other filters remain unchanged.
     * @param {Object} state - The Vuex module state
     * @param {Object} filters - Key/value pairs to merge into state.filters
     */
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
      state.currentPage = 1
    },

    /**
     * Resets all search and filter state back to default values.
     * Explanation: Called by the "Reset All" button in the filter panel.
     * @param {Object} state - The Vuex module state
     */
    CLEAR_FILTERS(state) {
      state.searchQuery = ''
      state.filters = {
        date: 'all',
        type: [],
        color: [],
        fragrance: [],
        bloomingSeason: [],
        strength: [],
        thornLevel: [],
        idealFor: [],
        keyword: '',
      }
      state.currentPage = 1
    },

    /**
     * Sets the current pagination page number.
     * Explanation: Directly updates the page index used by paginatedArticles.
     * @param {Object} state - The Vuex module state
     * @param {number} page - The target page number (1-indexed)
     */
    SET_PAGE(state, page) {
      state.currentPage = page
    },

    /**
     * Increments the reaction count on a specific article.
     * Explanation: Finds the article by ID and adds 1 to its reactions field.
     * Initialises to 0 if the field does not yet exist.
     * @param {Object} state - The Vuex module state
     * @param {string|number} id - The ID of the article to react to
     */
    INCREMENT_REACTIONS(state, id) {
      const article = state.articles.find((a) => a.id === id)
      if (article) {
        article.reactions = (article.reactions || 0) + 1
      }
    },

    /**
     * Appends a comment object to an article's comments array.
     * Explanation: Creates the comments array if it does not already exist.
     * @param {Object} state - The Vuex module state
     * @param {Object} payload - { id: string|number, comment: Object }
     */
    PUSH_COMMENT(state, { id, comment }) {
      const article = state.articles.find((a) => a.id === id)
      if (article) {
        if (!article.comments) article.comments = []
        article.comments.push(comment)
      }
    },

    /**
     * Increments the share count on a specific article.
     * Explanation: Tracks how many times the article has been shared.
     * @param {Object} state - The Vuex module state
     * @param {string|number} id - The ID of the article
     */
    INCREMENT_SHARES(state, id) {
      const article = state.articles.find((a) => a.id === id)
      if (article) {
        article.shares = (article.shares || 0) + 1
      }
    },
  },

  // ==========================================
  // ACTIONS
  // ==========================================
  actions: {
    /**
     * Creates and prepends a new article with default social counters.
     * Explanation: Generates a unique numeric ID by finding the current
     * maximum and incrementing by 1. Newly created articles start with
     * zero reactions, shares, reviews, and an empty comments array.
     * @param {Object} context - Vuex action context
     * @param {Object} articleData - User-provided fields (title, content, type, images, etc.)
     */
    addArticle({ state, commit }, articleData) {
      const newId = state.articles.length > 0 ? Math.max(...state.articles.map((a) => a.id)) + 1 : 1

      const newArticle = {
        ...articleData,
        id: newId,
        date: new Date().toISOString(),
        rating: 5,
        reviews: 0,
        reactions: 0,
        shares: 0,
        comments: [],
      }

      // Explanation: UNSHIFT places the new article at the top of the feed.
      commit('UNSHIFT_ARTICLE', newArticle)
    },

    /**
     * Updates an existing article's fields.
     * Explanation: The payload must include the article's id plus any
     * fields to overwrite (e.g., { id: 'post-101', title: '...' }).
     * @param {Object} context - Vuex action context
     * @param {Object} updatedArticle - { id, ...fieldsToUpdate }
     */
    updateArticle({ commit }, updatedArticle) {
      commit('UPDATE_ARTICLE', updatedArticle)
    },

    /**
     * Removes an article from the list permanently.
     * @param {Object} context - Vuex action context
     * @param {string|number} id - The ID of the article to delete
     */
    deleteArticle({ commit }, id) {
      commit('DELETE_ARTICLE', id)
    },

    /**
     * Updates the global search query string.
     * @param {Object} context - Vuex action context
     * @param {string} query - The new search string
     */
    setSearchQuery({ commit }, query) {
      commit('SET_SEARCH_QUERY', query)
    },

    /**
     * Applies a set of filter criteria to the news feed.
     * @param {Object} context - Vuex action context
     * @param {Object} newFilters - Filter key/value pairs to merge
     */
    applyFilters({ commit }, newFilters) {
      commit('SET_FILTERS', newFilters)
    },

    /**
     * Resets all filters and the search query to their defaults.
     * @param {Object} context - Vuex action context
     */
    clearFilters({ commit }) {
      commit('CLEAR_FILTERS')
    },

    /**
     * Changes the current page, with bounds checking.
     * Explanation: Only commits if the requested page falls within
     * the valid range [1, totalPages].
     * @param {Object} context - Vuex action context
     * @param {number} page - The target page number
     */
    setPage({ getters, commit }, page) {
      if (page >= 1 && page <= getters.totalPages) {
        commit('SET_PAGE', page)
      }
    },

    /**
     * Records a reaction on an article.
     * Explanation: Increments the aggregate reactions counter.
     * @param {Object} context - Vuex action context
     * @param {string|number} id - The article ID
     */
    reactToArticle({ commit }, id) {
      commit('INCREMENT_REACTIONS', id)
    },

    /**
     * Adds a comment to an article.
     * @param {Object} context - Vuex action context
     * @param {Object} payload - { id: string|number, comment: Object }
     */
    addComment({ commit }, payload) {
      commit('PUSH_COMMENT', payload)
    },

    /**
     * Records a share event on an article.
     * @param {Object} context - Vuex action context
     * @param {string|number} id - The article ID
     */
    incrementShare({ commit }, id) {
      commit('INCREMENT_SHARES', id)
    },
  },

  // ==========================================
  // GETTERS
  // ==========================================
  getters: {
    /**
     * Returns all articles without any filtering applied.
     * Explanation: Used by admin/collection views that need unfiltered access,
     * and by HomeView to compute featured and latest posts.
     * @param {Object} state - The Vuex module state
     * @returns {Array} The complete articles array
     */
    allArticles: (state) => state.articles,

    /**
     * Computes the list of articles filtered by all active criteria.
     *
     * @param {Object} state - The Vuex module state
     * @param {Object} getters - Other getters in this module
     * @param {Object} rootState - The root Vuex state (unused)
     * @param {Object} rootGetters - Getters from all modules
     * @returns {Array} The filtered articles list
     */
    filteredArticles(state, getters, rootState, rootGetters) {
      // Explanation: Retrieve the list of blocked user IDs from the auth module.
      const blockedIds = rootGetters['auth/blockedUserIds'] || []

      let result = state.articles.filter((a) => {
        // Explanation: Exclude private posts from the public feed.
        if (a.isPublic === false) return false

        // Explanation: Exclude posts with a blocked moderation status.
        if (a.moderation?.status === 'blocked') return false

        // Explanation: Exclude posts authored by blocked users.
        if (blockedIds.includes(a.authorID)) return false

        return true
      })

      // 1. Keyword search (combined from searchQuery and filters.keyword)
      const query = (state.searchQuery || state.filters.keyword || '').toLowerCase()
      if (query) {
        result = result.filter((a) => {
          const content = a.content || a.description || ''
          return a.title.toLowerCase().includes(query) || content.toLowerCase().includes(query)
        })
      }

      // 2. Type filter (multi-select)
      if (state.filters.type.length > 0) {
        result = result.filter((a) =>
          state.filters.type.some((val) =>
            (a.type || '').toLowerCase().includes(val.toLowerCase()),
          ),
        )
      }

      // 3. Color filter (multi-select)
      if (state.filters.color.length > 0) {
        result = result.filter((a) =>
          state.filters.color.some((val) =>
            (a.color || '').toLowerCase().includes(val.toLowerCase()),
          ),
        )
      }

      // 4. Fragrance filter (multi-select)
      if (state.filters.fragrance.length > 0) {
        result = result.filter((a) =>
          state.filters.fragrance.some((val) =>
            (a.fragrance || '').toLowerCase().includes(val.toLowerCase()),
          ),
        )
      }

      // 5. Blooming Season filter (multi-select)
      if (state.filters.bloomingSeason.length > 0) {
        result = result.filter((a) =>
          state.filters.bloomingSeason.some((val) =>
            (a.bloomingSeason || '').toLowerCase().includes(val.toLowerCase()),
          ),
        )
      }

      // 6. Strength filter (multi-select)
      if (state.filters.strength.length > 0) {
        result = result.filter((a) => state.filters.strength.includes(String(a.strength)))
      }

      // 7. Thorn Level filter (multi-select)
      if (state.filters.thornLevel.length > 0) {
        result = result.filter((a) => state.filters.thornLevel.includes(a.thornLevel))
      }

      // 8. IdealFor filter (multi-select)
      if (state.filters.idealFor.length > 0) {
        result = result.filter((a) => state.filters.idealFor.includes(a.idealFor))
      }

      // 9. Date filter (relative time ranges)
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

    /**
     * Returns the total number of articles after all filters are applied.
     * Explanation: Used for display purposes (e.g., "Showing X of Y articles").
     * @param {Object} _state - Unused
     * @param {Object} getters - Module getters
     * @returns {number}
     */
    totalArticles: (_state, getters) => getters.filteredArticles.length,

    /**
     * Computes the total number of pagination pages required.
     * Explanation: Divides the filtered count by itemsPerPage and rounds up.
     * Returns at least 1 to avoid a zero-page scenario.
     * @param {Object} state - The Vuex module state
     * @param {Object} getters - Module getters
     * @returns {number}
     */
    totalPages: (state, getters) =>
      Math.ceil(getters.filteredArticles.length / state.itemsPerPage) || 1,

    /**
     * Slices the filtered articles list to return only the current page's items.
     * Explanation: Implements offset-based pagination using currentPage
     * and itemsPerPage to calculate the start and end indices.
     * @param {Object} state - The Vuex module state
     * @param {Object} getters - Module getters
     * @returns {Array}
     */
    paginatedArticles: (state, getters) => {
      const startIndex = (state.currentPage - 1) * state.itemsPerPage
      const endIndex = startIndex + state.itemsPerPage
      return getters.filteredArticles.slice(startIndex, endIndex)
    },
  },
}
