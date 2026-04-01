/**
 * ==========================================
 * FILE: stores/authStore.js
 * ==========================================
 * Description:
 * Vuex module handling user authentication, session persistence
 * via localStorage, and a collection of registered users.
 */

export default {
  namespaced: true,

  // ==========================================
  // STATE
  // ==========================================
  state: function () {
    return {
      // Explanation: Rehydrates the current user from localStorage on app load.
      // This means a logged-in session persists across hard page refreshes.
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
      users: [
        {
          id: 1,
          username: 'rosegarden',
          password: 'rose123',
          displayName: 'Rose Garden',
          savedPosts: ['post-101', 'post-108'],
        },
        {
          id: 2,
          username: 'petalpusher',
          password: 'password',
          displayName: 'Petal Pusher',
          savedPosts: ['post-112'],
        },
        {
          id: 3,
          username: 'novice',
          password: 'password',
          displayName: 'Novice Planter',
          savedPosts: [],
        },
      ],
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
     * Explanation: Updates the savedPosts array for the current user and the global users list.
     * @param {Object} state - The module state
     * @param {Array} savedPosts - The updated array of post IDs
     */
    UPDATE_USER_SAVED_POSTS: function (state, savedPosts) {
      if (state.currentUser) {
        // Update current user
        state.currentUser.savedPosts = [...savedPosts]
        // Sync to the users array
        var userIndex = state.users.findIndex(function (u) {
          return u.id === state.currentUser.id
        })
        if (userIndex !== -1) {
          state.users[userIndex].savedPosts = [...savedPosts]
        }
        // Persist the updated currentUser to localStorage
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser))
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
    login: function ({ state, commit }, credentials) {
      // Explanation: Searches the state for a user with matching credentials.
      var user = state.users.find(function (u) {
        return u.username === credentials.username && u.password === credentials.password
      })

      if (user) {
        // Success: Commit the found user to the store
        commit('SET_CURRENT_USER', user)
        return { success: true }
      } else {
        // Failure: Return a generic error message
        return { success: false, error: 'Invalid username or password' }
      }
    },

    /**
     * Registers a new user account.
     * @param {Object} context - Vuex action context
     * @param {Object} userData - { username, password, displayName }
     * @returns {Object} { success: boolean, error: string }
     */
    register: function ({ state, commit }, userData) {
      // Explanation: Checks for username uniqueness before creating a user.
      var exists = state.users.some(function (u) {
        return u.username === userData.username
      })

      if (exists) {
        return { success: false, error: 'Username already exists' }
      }

      // Build the new user object
      var newUser = {
        id: Date.now(),
        username: userData.username,
        password: userData.password,
        displayName: userData.displayName,
        savedPosts: [],
      }

      // Commit to the store and login the new user
      commit('PUSH_USER', newUser)
      commit('SET_CURRENT_USER', newUser)
      return { success: true }
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
      commit('UPDATE_USER_SAVED_POSTS', saved)
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
