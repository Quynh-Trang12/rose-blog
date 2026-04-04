/**
 * ==========================================
 * FILE: store/modules/authStore.js
 * ==========================================
 * Description:
 * Vuex 4 namespaced module handling user authentication, session persistence
 * via localStorage, and a collection of registered users.
 *
 * State: currentUser (Object|null), users (Array of user objects).
 * Getters: isLoggedIn, isAdmin, mySavedPostIds, favoritesCount, blockedUserIds.
 * Mutations: SET_CURRENT_USER, PUSH_USER, PUSH_REGISTERED_USER,
 *            UPDATE_USER_SAVED_POSTS, TOGGLE_BLOCK_USER.
 * Actions: login, register, logout, toggleSavePost, toggleBlockUser.
 */

import { hashPassword } from '@/utils/crypto.js'

export default {
  namespaced: true,

  // ==========================================
  // STATE
  // ==========================================
  state: () => {
    // Explanation: Seed users provide default accounts for demonstration purposes.
    // Their password hashes correspond to known plain-text values.
    const seedUsers = [
      {
        id: 1,
        username: 'rosegarden',
        // Explanation: SHA-256 hash of 'rose123'
        password: '513ff9665fc7a9253f3ded3d71f0f96efc1ec96a12a3e3de559d06c698c1a52c',
        displayName: 'Rose Garden',
        savedPosts: ['post-101', 'post-108'],
        isBlocked: false,
      },
      {
        id: 2,
        username: 'petalpusher',
        // Explanation: SHA-256 hash of 'password'
        password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        displayName: 'Petal Pusher',
        savedPosts: ['post-109'],
        isBlocked: false,
      },
      {
        id: 3,
        username: 'novice',
        // Explanation: SHA-256 hash of 'password'
        password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        displayName: 'Novice Planter',
        savedPosts: [],
        isBlocked: false,
      },
    ]

    // Explanation: Loads any previously registered users from localStorage.
    const registered = JSON.parse(localStorage.getItem('registeredUsers')) || []

    // Explanation: Merges seed users with dynamically registered users.
    // Seed users always take precedence — if a registered user has the same
    // username as a seed user, the registered copy is excluded.
    const merged = [
      ...seedUsers,
      ...registered.filter((r) => !seedUsers.some((s) => s.username === r.username)),
    ]

    return {
      users: merged,
      // Explanation: Restores the authenticated session from localStorage
      // so that the logged-in state persists across hard page refreshes.
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    }
  },

  // ==========================================
  // MUTATIONS
  // ==========================================
  mutations: {
    /**
     * Sets the currently authenticated user and synchronises with localStorage.
     * Explanation: When a user object is provided, the session is persisted.
     * When null is provided (logout), the stored session is removed.
     * @param {Object} state - The Vuex module state
     * @param {Object|null} user - The user object to set, or null to clear
     */
    SET_CURRENT_USER(state, user) {
      state.currentUser = user
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user))
      } else {
        localStorage.removeItem('currentUser')
      }
    },

    /**
     * Appends a new user object to the in-memory users array.
     * Explanation: Used internally — does NOT persist to localStorage.
     * @param {Object} state - The Vuex module state
     * @param {Object} user - The new user object
     */
    PUSH_USER(state, user) {
      state.users.push(user)
    },

    /**
     * Appends a dynamically registered user to both in-memory state
     * and the persistent registeredUsers list in localStorage.
     * Explanation: Ensures that users created via Sign Up survive page refresh.
     * @param {Object} state - The Vuex module state
     * @param {Object} user - The newly registered user object
     */
    PUSH_REGISTERED_USER(state, user) {
      state.users.push(user)
      const registered = JSON.parse(localStorage.getItem('registeredUsers')) || []
      registered.push(user)
      localStorage.setItem('registeredUsers', JSON.stringify(registered))
    },

    /**
     * Replaces the savedPosts array for a specific user.
     * Explanation: Updates both the global users list and the currentUser
     * reference, then synchronises all changes back to localStorage so
     * that saved posts persist across sessions.
     * @param {Object} state - The Vuex module state
     * @param {Object} payload - { userId: number, savedPosts: string[] }
     */
    UPDATE_USER_SAVED_POSTS(state, { userId, savedPosts }) {
      const userIndex = state.users.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        state.users[userIndex].savedPosts = savedPosts
      }

      if (state.currentUser?.id === userId) {
        // Explanation: Creates a new object reference so Vue's reactivity detects the change.
        state.currentUser = { ...state.currentUser, savedPosts }
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser))

        // Explanation: If this user exists in the registeredUsers localStorage list
        // (i.e., they signed up at runtime), their savedPosts must also be synced there.
        const registered = JSON.parse(localStorage.getItem('registeredUsers')) || []
        const regIndex = registered.findIndex((u) => u.id === userId)
        if (regIndex !== -1) {
          registered[regIndex].savedPosts = savedPosts
          localStorage.setItem('registeredUsers', JSON.stringify(registered))
        }
      }
    },

    /**
     * Toggles the isBlocked flag on a specific user.
     * Explanation: Blocked users have their posts hidden from the public feed
     * via the news module's filteredArticles getter.
     * @param {Object} state - The Vuex module state
     * @param {number} userId - The ID of the user to block/unblock
     */
    TOGGLE_BLOCK_USER(state, userId) {
      const user = state.users.find((u) => u.id === userId)
      if (user) {
        user.isBlocked = !user.isBlocked
      }
    },
  },

  // ==========================================
  // ACTIONS
  // ==========================================
  actions: {
    /**
     * Attempts to authenticate a user with username and password.
     * Explanation: Hashes the provided password using SHA-256 via the Web Crypto API,
     * then searches the users list for a matching username + hash combination.
     * @param {Object} context - Vuex action context (destructured to { state, commit })
     * @param {Object} payload - { username: string, password: string }
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async login({ state, commit }, { username, password }) {
      const hash = await hashPassword(password)
      const user = state.users.find(
        (u) => u.username === username && u.password === hash,
      )

      if (user) {
        // Explanation: Spread creates a new object so the stored reference is independent.
        commit('SET_CURRENT_USER', { ...user })
        return { success: true }
      }
      return { success: false, error: 'Invalid username or password.' }
    },

    /**
     * Creates a new user account.
     * Explanation: Checks for duplicate usernames first, then hashes the password
     * and commits the new user to both in-memory state and localStorage.
     * @param {Object} context - Vuex action context
     * @param {Object} payload - { username: string, password: string, displayName: string }
     * @returns {Promise<{success: boolean, error?: string}>}
     */
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
        savedPosts: [],
        isBlocked: false,
      }

      // Explanation: PUSH_REGISTERED_USER also persists to localStorage.
      commit('PUSH_REGISTERED_USER', newUser)
      // Explanation: Automatically log in the newly registered user.
      commit('SET_CURRENT_USER', { ...newUser })
      return { success: true }
    },

    /**
     * Clears the current user session (logs out).
     * Explanation: Passes null to SET_CURRENT_USER, which removes the
     * currentUser entry from localStorage.
     * @param {Object} context - Vuex action context
     */
    logout({ commit }) {
      commit('SET_CURRENT_USER', null)
    },

    /**
     * Toggles a post ID in the current user's saved posts list.
     * Explanation: If the post is not yet saved, it is added. If it is
     * already saved, it is removed. The mutation handles localStorage sync.
     * @param {Object} context - Vuex action context
     * @param {string} postId - The ID of the post to toggle (e.g., 'post-101')
     */
    toggleSavePost({ state, commit }, postId) {
      if (!state.currentUser) return

      const saved = [...state.currentUser.savedPosts]
      const index = saved.indexOf(postId)

      if (index === -1) {
        // Explanation: Post is not saved — add it to the list.
        saved.push(postId)
      } else {
        // Explanation: Post is already saved — remove it from the list.
        saved.splice(index, 1)
      }

      commit('UPDATE_USER_SAVED_POSTS', {
        userId: state.currentUser.id,
        savedPosts: saved,
      })
    },

    /**
     * Toggles the blocked status for a specific user.
     * Explanation: Blocked users have their posts excluded from the
     * public news feed via the filteredArticles getter.
     * @param {Object} context - Vuex action context
     * @param {number} userId - The ID of the user to block/unblock
     */
    toggleBlockUser({ commit }, userId) {
      commit('TOGGLE_BLOCK_USER', userId)
    },
  },

  // ==========================================
  // GETTERS
  // ==========================================
  getters: {
    /**
     * Returns true if a user is currently authenticated.
     * Explanation: The navigation guard and various components use this
     * getter to conditionally show/hide authenticated-only features.
     * @param {Object} state - The Vuex module state
     * @returns {boolean}
     */
    isLoggedIn: (state) => !!state.currentUser,

    /**
     * Returns true if the current user has admin privileges.
     * Explanation: In this application, the first seed user (id: 1)
     * is treated as the administrator.
     * @param {Object} state - The Vuex module state
     * @returns {boolean}
     */
    isAdmin: (state) => state.currentUser?.id === 1,

    /**
     * Returns the array of saved post IDs for the current user.
     * Explanation: Used by NewsCard to determine bookmark icon state
     * and by CollectionView to filter the saved articles list.
     * @param {Object} state - The Vuex module state
     * @returns {string[]}
     */
    mySavedPostIds: (state) => state.currentUser?.savedPosts ?? [],

    /**
     * Returns the total count of saved articles for the current user.
     * Explanation: Displayed as a badge number on the favorites icon
     * in the navigation bar.
     * @param {Object} state - The Vuex module state
     * @returns {number}
     */
    favoritesCount: (state) => (state.currentUser?.savedPosts ?? []).length,

    /**
     * Returns an array of user IDs that are currently blocked.
     * Explanation: The news module's filteredArticles getter cross-references
     * this list via rootGetters to exclude posts from blocked users.
     * @param {Object} state - The Vuex module state
     * @returns {number[]}
     */
    blockedUserIds: (state) =>
      state.users.filter((u) => u.isBlocked).map((u) => u.id),
  },
}
