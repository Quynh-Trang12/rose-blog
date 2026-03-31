import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const users = ref([
    {
      id: 1,
      username: 'rosegarden',
      password: 'rose123',
      displayName: 'Rose Garden',
      avatar: 'https://i.pravatar.cc/40?u=rosegarden',
    },
  ])

  const isLoggedIn = computed(() => user.value !== null)
  const currentUser = computed(() => user.value)

  function login(username, password) {
    const found = users.value.find((u) => u.username === username && u.password === password)
    if (found) {
      user.value = {
        id: found.id,
        username: found.username,
        displayName: found.displayName,
        avatar: found.avatar,
      }
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
    }
    users.value.push(newUser)
    user.value = {
      id: newUser.id,
      username: newUser.username,
      displayName: newUser.displayName,
      avatar: newUser.avatar,
    }
    return { success: true }
  }

  function logout() {
    user.value = null
  }

  return { isLoggedIn, currentUser, login, register, logout }
})
