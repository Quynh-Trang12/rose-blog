import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import newsData from '@/data/news.json'

export const useNewsStore = defineStore('news', () => {
  const articles = ref(JSON.parse(JSON.stringify(newsData)))
  const filters = ref({ date: 'all', category: 'all', keyword: '' })
  const currentPage = ref(1)
  const ITEMS_PER_PAGE = 6

  const filteredArticles = computed(() => {
    let list = [...articles.value]

    if (filters.value.date !== 'all') {
      const now = new Date()
      const cutoffs = {
        today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        week: new Date(now - 7 * 864e5),
        month: new Date(now.getFullYear(), now.getMonth(), 1),
        year: new Date(now.getFullYear(), 0, 1),
      }
      const cutoff = cutoffs[filters.value.date]
      if (cutoff) list = list.filter((a) => new Date(a.date) >= cutoff)
    }

    if (filters.value.category !== 'all') {
      list = list.filter((a) => a.category === filters.value.category)
    }

    if (filters.value.keyword.trim()) {
      const kw = filters.value.keyword.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(kw) ||
          a.content.toLowerCase().includes(kw) ||
          a.authorName.toLowerCase().includes(kw) ||
          a.category.toLowerCase().includes(kw),
      )
    }

    return list
  })

  const totalPages = computed(() => Math.ceil(filteredArticles.value.length / ITEMS_PER_PAGE))

  const paginatedArticles = computed(() => {
    const start = (currentPage.value - 1) * ITEMS_PER_PAGE
    return filteredArticles.value.slice(start, start + ITEMS_PER_PAGE)
  })

  function applyFilters(newFilters) {
    filters.value = { ...newFilters }
    currentPage.value = 1
  }

  function clearFilters() {
    filters.value = { date: 'all', category: 'all', keyword: '' }
    currentPage.value = 1
  }

  function setPage(page) {
    currentPage.value = page
  }

  function addArticle(article) {
    articles.value.unshift({
      ...article,
      id: Date.now(),
      likes: 0,
      hearts: 0,
      comments: [],
      shares: 0,
      userReaction: null,
    })
    currentPage.value = 1
  }

  function updateArticle(id, updates) {
    const idx = articles.value.findIndex((a) => a.id === id)
    if (idx !== -1) articles.value[idx] = { ...articles.value[idx], ...updates }
  }

  function deleteArticle(id) {
    articles.value = articles.value.filter((a) => a.id !== id)
  }

  function reactToArticle({ id, reaction }) {
    const article = articles.value.find((a) => a.id === id)
    if (!article) return
    if (article.userReaction === reaction) {
      article.userReaction = null
      article.likes = Math.max(0, article.likes - 1)
    } else {
      if (!article.userReaction) article.likes++
      article.userReaction = reaction
    }
  }

  function addComment({ id, text, author }) {
    const article = articles.value.find((a) => a.id === id)
    if (!article) return
    article.comments.push({
      id: Date.now(),
      authorName: author.displayName,
      authorAvatar: author.avatar,
      text,
      date: new Date().toISOString(),
    })
  }

  function incrementShare(id) {
    const article = articles.value.find((a) => a.id === id)
    if (article) article.shares++
  }

  return {
    articles,
    filters,
    currentPage,
    totalPages,
    filteredArticles,
    paginatedArticles,
    applyFilters,
    clearFilters,
    setPage,
    addArticle,
    updateArticle,
    deleteArticle,
    reactToArticle,
    addComment,
    incrementShare,
  }
})
