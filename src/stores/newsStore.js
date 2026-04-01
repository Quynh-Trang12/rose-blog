import { defineStore } from 'pinia'

// 1. Import your JSON data
import newsData from '@/data/news.json'

export const useNewsStore = defineStore('news', {
  state: () => ({
    // 1. Initialize articles with the imported JSON data
    articles: newsData,
    searchQuery: '',
    filters: {
      date: 'all',
      category: 'all',
      keyword: '',
    },
    currentPage: 1,
    itemsPerPage: 6,
  }),

  // 2. Getters: Derived state (like computed properties)
  getters: {
    // Returns articles filtered by search query AND advanced filters
    filteredArticles: (state) => {
      let result = [...state.articles]

      // 1. Keyword search (SearchQuery + Keyword filter)
      const query = (state.searchQuery || state.filters.keyword || '').toLowerCase()
      if (query) {
        result = result.filter((a) => {
          const content = a.content || a.description || ''
          return a.title.toLowerCase().includes(query) || content.toLowerCase().includes(query)
        })
      }

      // 2. Category filter
      if (state.filters.category && state.filters.category !== 'all') {
        result = result.filter((a) => (a.category || a.type) === state.filters.category)
      }

      // 3. Date filter (Simplified implementation for mock)
      if (state.filters.date && state.filters.date !== 'all') {
        const now = new Date()
        result = result.filter((a) => {
          const postDate = new Date(a.date)
          if (state.filters.date === 'today') return postDate.toDateString() === now.toDateString()
          if (state.filters.date === 'week') return (now - postDate) / (1000 * 60 * 60 * 24) <= 7
          if (state.filters.date === 'month') return (now - postDate) / (1000 * 60 * 60 * 24) <= 31
          return true
        })
      }

      return result
    },
    // Returns the total number of items after filtering
    totalArticles() {
      return this.filteredArticles.length
    },

    // Calculates total pages needed for pagination
    totalPages() {
      return Math.ceil(this.filteredArticles.length / this.itemsPerPage) || 1
    },

    // Returns only the chunk of articles for the current page
    paginatedArticles() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage
      return this.filteredArticles.slice(startIndex, endIndex)
    },
  },

  // 3. Actions: Methods to modify the state
  actions: {
    // Adds a new article to the state
    addArticle(articleData) {
      const newId = this.articles.length > 0 ? Math.max(...this.articles.map((a) => a.id)) + 1 : 1
      this.articles.unshift({
        ...articleData,
        id: newId,
        date: new Date().toISOString(),
        rating: 5,
        reviews: 0,
        reactions: 0,
        shares: 0,
        comments: [],
      })
    },

    // Updates an existing article
    updateArticle(updatedArticle) {
      const index = this.articles.findIndex((a) => a.id === updatedArticle.id)
      if (index !== -1) {
        this.articles[index] = { ...this.articles[index], ...updatedArticle }
      }
    },

    // Removes an article by its ID
    deleteArticle(id) {
      this.articles = this.articles.filter((article) => article.id !== id)
      // Prevent currentPage from being out of bounds
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages
      }
    },

    // Updates the search query string and resets pagination
    setSearchQuery(query) {
      this.searchQuery = query
      this.currentPage = 1
    },

    // Applies advanced filters from NewsSearchBar
    applyFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.currentPage = 1
    },

    // Clears all filters and search state
    clearFilters() {
      this.searchQuery = ''
      this.filters = {
        date: 'all',
        category: 'all',
        keyword: '',
      }
      this.currentPage = 1
    },

    // Navigates to a specific pagination page
    setPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    // Social feature: Increment reaction count
    reactToArticle(id) {
      const article = this.articles.find((a) => a.id === id)
      if (article) {
        article.reactions = (article.reactions || 0) + 1
      }
    },

    // Social feature: Add a comment object
    addComment(id, comment) {
      const article = this.articles.find((a) => a.id === id)
      if (article) {
        if (!article.comments) article.comments = []
        article.comments.push(comment)
      }
    },

    // Social feature: Increment share count
    incrementShare(id) {
      const article = this.articles.find((a) => a.id === id)
      if (article) {
        article.shares = (article.shares || 0) + 1
      }
    },
  },
})
