/**
 * ==========================================
 * FILE: stores/newsStore.js
 * ==========================================
 * Description:
 * Vuex module handling the collection of news articles, including
 * filtering, searching, pagination, and social interactions.
 */

import newsData from '@/data/news.json'

export default {
  namespaced: true,

  // ==========================================
  // STATE
  // ==========================================
  state: function () {
    return {
      // Explanation: Initialize articles with the imported JSON data
      articles: newsData,
      searchQuery: '',
      filters: {
        date: 'all',
        category: 'all',
        keyword: '',
      },
      currentPage: 1,
      itemsPerPage: 6,
    }
  },

  // ==========================================
  // MUTATIONS
  // ==========================================
  mutations: {
    /**
     * Explanation: Adds a new article to the beginning of the list.
     * @param {Object} state - The module state
     * @param {Object} article - The complete article object
     */
    UNSHIFT_ARTICLE: function (state, article) {
      state.articles.unshift(article)
    },

    /**
     * Explanation: Updates fields on an existing article.
     * @param {Object} state - The module state
     * @param {Object} payload - { id, ...updates }
     */
    UPDATE_ARTICLE: function (state, payload) {
      var index = state.articles.findIndex(function (a) {
        return a.id === payload.id
      })
      if (index !== -1) {
        state.articles[index] = { ...state.articles[index], ...payload }
      }
    },

    /**
     * Explanation: Removes an article by ID and handles pagination boundary.
     * @param {Object} state - The module state
     * @param {string|number} id - ID of the article to delete
     */
    DELETE_ARTICLE: function (state, id) {
      // Explanation: Filters out the article with the given id.
      state.articles = state.articles.filter(function (article) {
        return article.id !== id
      })
      // Explanation: Recalculates total pages to ensure current page is still valid.
      var totalPages = Math.ceil(state.articles.length / state.itemsPerPage) || 1
      if (state.currentPage > totalPages) {
        state.currentPage = totalPages
      }
    },

    /**
     * Explanation: Sets the search query and resets to page 1.
     * @param {Object} state - The module state
     * @param {string} query - The search term
     */
    SET_SEARCH_QUERY: function (state, query) {
      state.searchQuery = query
      state.currentPage = 1
    },

    /**
     * Explanation: Merges new filters and resets to page 1.
     * @param {Object} state - The module state
     * @param {Object} filters - New filter values to merge
     */
    SET_FILTERS: function (state, filters) {
      state.filters = { ...state.filters, ...filters }
      state.currentPage = 1
    },

    /**
     * Explanation: Resets all search and filter state to defaults.
     * @param {Object} state - The module state
     */
    CLEAR_FILTERS: function (state) {
      state.searchQuery = ''
      state.filters = {
        date: 'all',
        category: 'all',
        keyword: '',
      }
      state.currentPage = 1
    },

    /**
     * Explanation: Updates the current pagination page index.
     * @param {Object} state - The module state
     * @param {number} page - The target page number
     */
    SET_PAGE: function (state, page) {
      state.currentPage = page
    },

    /**
     * Explanation: Increments the reaction count for a specific article.
     * @param {Object} state - The module state
     * @param {string|number} id - ID of the target article
     */
    INCREMENT_REACTIONS: function (state, id) {
      var article = state.articles.find(function (a) {
        return a.id === id
      })
      if (article) {
        article.reactions = (article.reactions || 0) + 1
      }
    },

    /**
     * Explanation: Appends a new comment to an article's comment array.
     * @param {Object} state - The module state
     * @param {Object} payload - { id, comment }
     */
    PUSH_COMMENT: function (state, payload) {
      var article = state.articles.find(function (a) {
        return a.id === payload.id
      })
      if (article) {
        if (!article.comments) article.comments = []
        article.comments.push(payload.comment)
      }
    },

    /**
     * Explanation: Increments the share count for a specific article.
     * @param {Object} state - The module state
     * @param {string|number} id - ID of the target article
     */
    INCREMENT_SHARES: function (state, id) {
      var article = state.articles.find(function (a) {
        return a.id === id
      })
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
     * Adds a new article with standard default values.
     * @param {Object} context - Vuex action context
     * @param {Object} articleData - Post details (title, description, image, etc.)
     */
    addArticle: function ({ state, commit }, articleData) {
      var newId =
        state.articles.length > 0
          ? Math.max.apply(
              null,
              state.articles.map(function (a) {
                return a.id
              }),
            ) + 1
          : 1

      var newArticle = {
        ...articleData,
        id: newId,
        date: new Date().toISOString(),
        rating: 5,
        reviews: 0,
        reactions: 0,
        shares: 0,
        comments: [],
      }

      commit('UNSHIFT_ARTICLE', newArticle)
    },

    /**
     * Updates an existing article's data.
     */
    updateArticle: function ({ commit }, updatedArticle) {
      commit('UPDATE_ARTICLE', updatedArticle)
    },

    /**
     * Deletes an article by its ID.
     */
    deleteArticle: function ({ commit }, id) {
      commit('DELETE_ARTICLE', id)
    },

    /**
     * Updates the global search string.
     */
    setSearchQuery: function ({ commit }, query) {
      commit('SET_SEARCH_QUERY', query)
    },

    /**
     * Applies a set of filter criteria.
     */
    applyFilters: function ({ commit }, newFilters) {
      commit('SET_FILTERS', newFilters)
    },

    /**
     * Resets all search and filter sets.
     */
    clearFilters: function ({ commit }) {
      commit('CLEAR_FILTERS')
    },

    /**
     * Changes the current page in the news list.
     */
    setPage: function ({ state, getters, commit }, page) {
      // Explanation: Only allows changing to a page that exists.
      if (page >= 1 && page <= getters.totalPages) {
        commit('SET_PAGE', page)
      }
    },

    /**
     * Social: Records a new reaction.
     */
    reactToArticle: function ({ commit }, id) {
      commit('INCREMENT_REACTIONS', id)
    },

    /**
     * Social: Adds a new user comment.
     */
    addComment: function ({ commit }, payload) {
      // payload: { id, comment }
      commit('PUSH_COMMENT', payload)
    },

    /**
     * Social: Records a share event.
     */
    incrementShare: function ({ commit }, id) {
      commit('INCREMENT_SHARES', id)
    },
  },

  // ==========================================
  // GETTERS
  // ==========================================
  getters: {
    /**
     * Calculates the list of articles filtered by keyword, category, and date.
     * Derives this data from the base articles array and current filter state.
     */
    filteredArticles: function (state) {
      var result = [...state.articles]

      // 1. Keyword search (SearchQuery + Keyword filter)
      var query = (state.searchQuery || state.filters.keyword || '').toLowerCase()
      if (query) {
        result = result.filter(function (a) {
          var content = a.content || a.description || ''
          return (
            a.title.toLowerCase().indexOf(query) !== -1 ||
            content.toLowerCase().indexOf(query) !== -1
          )
        })
      }

      // 2. Category filter
      if (state.filters.category && state.filters.category !== 'all') {
        result = result.filter(function (a) {
          return (a.category || a.type) === state.filters.category
        })
      }

      // 3. Date filter (Simplified implementation for mock)
      if (state.filters.date && state.filters.date !== 'all') {
        var now = new Date()
        result = result.filter(function (a) {
          var postDate = new Date(a.date)
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
     * Returns the total count of filtered articles.
     */
    totalArticles: function (state, getters) {
      return getters.filteredArticles.length
    },

    /**
     * Returns the total number of pagination pages needed.
     */
    totalPages: function (state, getters) {
      return Math.ceil(getters.filteredArticles.length / state.itemsPerPage) || 1
    },

    /**
     * Returns the specific chunk of articles for the current page view.
     */
    paginatedArticles: function (state, getters) {
      var startIndex = (state.currentPage - 1) * state.itemsPerPage
      var endIndex = startIndex + state.itemsPerPage
      return getters.filteredArticles.slice(startIndex, endIndex)
    },
  },
}
