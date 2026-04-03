/**
 * ==========================================
 * FILE: stores/authStore.js
 * ==========================================
 * Description:
 * Vuex module handling user authentication, session persistence
 * via localStorage, and a collection of registered users.
 */

import { hashPassword } from '@/utils/crypto.js'

export default {
  namespaced: true,

  // ==========================================
  // STATE
  // ==========================================
  state: function () {
    var seedUsers = [
      {
        id: 1,
        username: 'rosegarden',
        password: '513ff9665fc7a9253f3ded3d71f0f96efc1ec96a12a3e3de559d06c698c1a52c',
        displayName: 'Rose Garden',
        savedPosts: ['post-101', 'post-108'],
      },
      {
        id: 2,
        username: 'petalpusher',
        password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        displayName: 'Petal Pusher',
        savedPosts: ['post-109'],
      },
      {
        id: 3,
        username: 'novice',
        password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        displayName: 'Novice Planter',
        savedPosts: [],
      },
    ]

    var registered = JSON.parse(localStorage.getItem('registeredUsers')) || []
    // Exclude any stored user whose username already exists in seed (seed wins)
    var merged = seedUsers.concat(
      registered.filter(function (r) {
        return !seedUsers.some(function (s) {
          return s.username === r.username
        })
      }),
    )

    return {
      users: merged,
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    }
  },

  // ==========================================
  // MUTATIONS
  // ==========================================
  mutations: {
    /**
     * Explanation: Sets the currently authenticated user and syncs with localStorage.
     * @param {Object} state - The module state
     * @param {Object|null} user - The user object to set as current
     */
    SET_CURRENT_USER: function (state, user) {
      // Explanation: Persists the authenticated user to localStorage so the session
      // survives a hard page refresh. Clears localStorage on logout (user = null).
      state.currentUser = user
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user))
      } else {
        localStorage.removeItem('currentUser')
      }
    },

    /**
     * Explanation: Adds a newly registered user to the local mock users list.
     * @param {Object} state - The module state
     * @param {Object} user - The new user object
     */
    PUSH_USER: function (state, user) {
      state.users.push(user)
    },

    /**
     * Explanation: Adds a new mutation specifically for dynamically registered users
     * that also persists them to localStorage.
     * @param {Object} state - The module state
     * @param {Object} user - The new user object
     */
    PUSH_REGISTERED_USER: function (state, user) {
      // Explanation: Appends the new user to in-memory state AND persists them
      // to localStorage under 'registeredUsers' so they survive page refresh.
      state.users.push(user)
      var registered = JSON.parse(localStorage.getItem('registeredUsers')) || []
      registered.push(user)
      localStorage.setItem('registeredUsers', JSON.stringify(registered))
    },

    /**
     * Explanation: Updates the savedPosts array for the current user and the global users list.
     * @param {Object} state - The module state
     * @param {Array} savedPosts - The updated array of post IDs
     */
    UPDATE_USER_SAVED_POSTS: function (state, payload) {
      // payload: { userId, savedPosts }
      var userIndex = state.users.findIndex(function (u) {
        return u.id === payload.userId
      })
      if (userIndex !== -1) {
        state.users[userIndex].savedPosts = payload.savedPosts
      }
      if (state.currentUser && state.currentUser.id === payload.userId) {
        state.currentUser = Object.assign({}, state.currentUser, { savedPosts: payload.savedPosts })
        // Sync the updated currentUser back to localStorage
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser))
        // If this user is a registered (non-seed) user, sync their savedPosts
        // back to the registeredUsers list in localStorage as well
        var registered = JSON.parse(localStorage.getItem('registeredUsers')) || []
        var regIndex = registered.findIndex(function (u) {
          return u.id === payload.userId
        })
        if (regIndex !== -1) {
          registered[regIndex].savedPosts = payload.savedPosts
          localStorage.setItem('registeredUsers', JSON.stringify(registered))
        }
      }
    },
  },

  // ==========================================
  // ACTIONS
  // ==========================================
  actions: {
    /**
     * Attempts to log in a user with username and password.
     * @param {Object} context - Vuex action context
     * @param {Object} credentials - { username, password }
     * @returns {Object} { success: boolean, error: string }
     */
    login: function (context, payload) {
      return hashPassword(payload.password).then(function (hash) {
        var user = context.state.users.find(function (u) {
          return u.username === payload.username && u.password === hash
        })
        if (user) {
          context.commit('SET_CURRENT_USER', { ...user })
          return { success: true }
        }
        return { success: false, error: 'Invalid username or password.' }
      })
    },

    /**
     * Registers a new user account.
     * @param {Object} context - Vuex action context
     * @param {Object} payload - { username, password, displayName }
     * @returns {Promise} { success: boolean, error: string }
     */
    register: function (context, payload) {
      var exists = context.state.users.find(function (u) {
        return u.username === payload.username
      })
      if (exists) {
        return Promise.resolve({
          success: false,
          error: 'Username already exists. Please choose another.',
        })
      }
      return hashPassword(payload.password).then(function (hash) {
        var newUser = {
          id: Date.now(),
          username: payload.username,
          password: hash,
          displayName: payload.displayName,
          savedPosts: [],
        }
        context.commit('PUSH_REGISTERED_USER', newUser)
        context.commit('SET_CURRENT_USER', { ...newUser })
        return { success: true }
      })
    },

    /**
     * Logs the current user out.
     * @param {Object} context - Vuex action context
     */
    logout: function ({ commit }) {
      // Explanation: Simply clears the current user state.
      commit('SET_CURRENT_USER', null)
    },

    /**
     * Toggles a post ID in the current user's saved list.
     * @param {Object} context - Vuex action context
     * @param {string} postId - ID of the post to toggle
     */
    toggleSavePost: function ({ state, commit }, postId) {
      if (!state.currentUser) return

      var saved = [...state.currentUser.savedPosts]
      var index = saved.indexOf(postId)

      if (index === -1) {
        // Not saved -> add it
        saved.push(postId)
      } else {
        // Already saved -> remove it
        saved.splice(index, 1)
      }

      // Commit the updated list
      commit('UPDATE_USER_SAVED_POSTS', { userId: state.currentUser.id, savedPosts: saved })
    },
  },

  // ==========================================
  // GETTERS
  // ==========================================
  getters: {
    /**
     * Returns true if a user is currently logged in.
     */
    isLoggedIn: function (state) {
      return !!state.currentUser
    },

    /**
     * Returns the array of saved post IDs for the current user.
     */
    mySavedPostIds: function (state) {
      return state.currentUser ? state.currentUser.savedPosts : []
    },

    /**
     * Returns the total number of saved articles.
     */
    favoritesCount: function (state) {
      return state.currentUser ? (state.currentUser.savedPosts || []).length : 0
    },
  },
}
