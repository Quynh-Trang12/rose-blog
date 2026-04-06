/**
 * ==========================================
 * FILE: store/modules/auth.js
 * ==========================================
 * Description:
 * Vuex 4 namespaced module handling user authentication, session persistence
 * via localStorage, and a collection of registered users.
 *
 * State: currentUser (Object|null), users (Array of user objects).
 * Getters: isLoggedIn, mySavedPostIds, favoritesCount.
 * Mutations: SET_CURRENT_USER, TOGGLE_SAVE_POST, PUSH_REGISTERED_USER.
 * Actions: login, register, logout, toggleSavePost.
 */

import { hashPassword } from '@/utils/crypto.js'

export default {
  namespaced: true,

  // ==========================================
  // STATE
  // ==========================================
  state: () => {
    const seedUsers = [
      {
        id: 1,
        username: 'rosegarden',
        // SHA-256 hash of 'rose123'
        password: '513ff9665fc7a9253f3ded3d71f0f96efc1ec96a12a3e3de559d06c698c1a52c',
        role: 'user',
        displayName: 'Rose Garden',
        savedPosts: ['post-101', 'post-108'],
        reactions: {},
      },
      {
        id: 2,
        username: 'petalpusher',
        // SHA-256 hash of 'password'
        password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        displayName: 'Petal Pusher',
        role: 'user',
        savedPosts: ['post-109'],
        reactions: {},
      },
      {
        id: 3,
        username: 'novice',
        // SHA-256 hash of 'password'
        password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        displayName: 'Novice Planter',
        role: 'user',
        savedPosts: [],
        reactions: {},
      },
    ]

    const registered = JSON.parse(localStorage.getItem('registeredUsers')) || []
    const merged = [
      ...seedUsers,
      ...registered.filter((r) => !seedUsers.some((s) => s.username === r.username)),
    ]

    return {
      users: merged,
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    }
  },

  // ==========================================
  // MUTATIONS
  // ==========================================
  mutations: {
    SET_CURRENT_USER(state, user) {
      state.currentUser = user ? { ...user } : null
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser))
      } else {
        localStorage.removeItem('currentUser')
      }
    },

    TOGGLE_SAVE_POST(state, postId) {
      if (!state.currentUser) return

      const user = state.users.find((u) => u.id === state.currentUser.id)
      if (user) {
        if (!user.savedPosts) user.savedPosts = []
        const index = user.savedPosts.indexOf(postId)
        if (index === -1) {
          user.savedPosts.push(postId)
        } else {
          user.savedPosts.splice(index, 1)
        }
        // Re-set currentUser to trigger reactivity
        state.currentUser = { ...user }
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser))

        // Sync to registeredUsers if applicable
        const registered = JSON.parse(localStorage.getItem('registeredUsers')) || []
        const regIndex = registered.findIndex((u) => u.id === user.id)
        if (regIndex !== -1) {
          registered[regIndex].savedPosts = user.savedPosts
          localStorage.setItem('registeredUsers', JSON.stringify(registered))
        }
      }
    },

    TOGGLE_REACTION(state, { postId, reactionKey }) {
      if (!state.currentUser) return

      const user = state.users.find((u) => u.id === state.currentUser.id)
      if (user) {
        if (!user.reactions) user.reactions = {}

        // If same reaction is clicked, remove it. Otherwise set/replace it.
        if (user.reactions[postId] === reactionKey) {
          delete user.reactions[postId]
        } else {
          user.reactions[postId] = reactionKey
        }

        // Re-set currentUser for reactivity
        state.currentUser = { ...user }
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser))

        // Sync to registeredUsers
        const registered = JSON.parse(localStorage.getItem('registeredUsers')) || []
        const regIndex = registered.findIndex((u) => u.id === user.id)
        if (regIndex !== -1) {
          registered[regIndex].reactions = user.reactions
          localStorage.setItem('registeredUsers', JSON.stringify(registered))
        }
      }
    },



    PUSH_REGISTERED_USER(state, user) {
      state.users.push(user)
      const registered = JSON.parse(localStorage.getItem('registeredUsers')) || []
      registered.push(user)
      localStorage.setItem('registeredUsers', JSON.stringify(registered))
    },
  },

  // ==========================================
  // ACTIONS
  // ==========================================
  actions: {
    async login({ state, commit }, { username, password }) {
      const hash = await hashPassword(password)
      const user = state.users.find((u) => u.username === username && u.password === hash)

      if (user) {
        commit('SET_CURRENT_USER', user)
        return { success: true }
      }
      return { success: false, error: 'Invalid username or password.' }
    },

    async register({ state, commit }, { username, password, displayName }) {
      const exists = state.users.find((u) => u.username === username)
      if (exists) {
        return {
          success: false,
          error: 'Username already exists. Please choose another.',
        }
      }

      const hash = await hashPassword(password)
      const newUser = {
        id: Date.now(),
        username,
        password: hash,
        displayName,
        role: 'user',
        savedPosts: [],
        reactions: {},
      }

      commit('PUSH_REGISTERED_USER', newUser)
      commit('SET_CURRENT_USER', newUser)
      return { success: true }
    },

    logout({ commit }) {
      commit('SET_CURRENT_USER', null)
    },

    toggleSavePost({ commit, state }, postId) {
      if (!state.currentUser) return
      commit('TOGGLE_SAVE_POST', postId)
    },

    toggleReaction({ commit, state }, payload) {
      if (!state.currentUser) return
      commit('TOGGLE_REACTION', payload)
    },
  },

  // ==========================================
  // GETTERS
  // ==========================================
  getters: {
    isLoggedIn: (state) => !!state.currentUser,
    mySavedPostIds: (state) => state.currentUser?.savedPosts || [],
    favoritesCount: (state) => (state.currentUser?.savedPosts || []).length,
  },
}
