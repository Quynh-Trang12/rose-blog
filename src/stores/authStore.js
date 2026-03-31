import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'roseblog_auth'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveToStorage(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Seed users list from localStorage so registered accounts persist
  const persistedSession = loadFromStorage()

  const users = ref([
    {
      id: 1,
      username: 'rosegarden',
      password: 'rose123',
      displayName: 'Rose Garden',
      avatar: 'https://i.pravatar.cc/40?u=rosegarden',
      role: 'admin', // 'admin' | 'user'
    },
  ])

  // Restore session on mount
  const user = ref(persistedSession || null)

  const isLoggedIn = computed(() => user.value !== null)
  const currentUser = computed(() => user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function login(username, password) {
    const found = users.value.find((u) => u.username === username && u.password === password)
    if (found) {
      const session = {
        id: found.id,
        username: found.username,
        displayName: found.displayName,
        avatar: found.avatar,
        role: found.role,
      }
      user.value = session
      saveToStorage(session)
      return { success: true }
    }
    return { success: false, error: 'Invalid username or password.' }
  }

  function register(username, password, displayName) {
    if (users.value.find((u) => u.username === username)) {
      return { success: false, error: 'Username is already taken.' }
    }
    const newUser = {
      id: Date.now(),
      username,
      password,
      displayName,
      avatar: `https://i.pravatar.cc/40?u=${username}`,
      role: 'user',
    }
    users.value.push(newUser)
    const session = {
      id: newUser.id,
      username: newUser.username,
      displayName: newUser.displayName,
      avatar: newUser.avatar,
      role: newUser.role,
    }
    user.value = session
    saveToStorage(session)
    return { success: true }
  }

  function logout() {
    user.value = null
    saveToStorage(null)
  }

  return { isLoggedIn, currentUser, isAdmin, login, register, logout }
})
