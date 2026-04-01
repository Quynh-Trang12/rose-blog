/**
 * ==========================================
 * STORE: authStore.js
 * ==========================================
 * Description:
 * Manages user authentication, session state, Supreme Admin
 * moderation controls (blocking users), and user-specific
 * collections (saved posts).
 * * Note for Production: 
 * This is a frontend-only mock store. In a real-world application,
 * passwords must NEVER be stored in plain text, and session 
 * management should rely on secure, HttpOnly cookies.
 */

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Mock database perfectly aligned with data/news.json authors
    users: [
      { 
        id: 1, 
        username: 'admin', 
        password: 'password', 
        displayName: 'Supreme Admin', 
        role: 'admin',
        isBlocked: false,
        savedPosts: [] 
      },
      { 
        id: 2, 
        username: 'rosegarden', 
        password: 'rose123', 
        displayName: 'Rose Garden', 
        role: 'user',
        isBlocked: false,
        savedPosts: ['post-101', 'post-108'] // Pre-populated for testing
      },
      { 
        id: 3, 
        username: 'thorny', 
        password: 'password', 
        displayName: 'Thorny User', 
        role: 'user',
        isBlocked: true, // This user is suspended. Their posts will be hidden.
        savedPosts: [] 
      },
      { 
        id: 4, 
        username: 'petalpusher', 
        password: 'password', 
        displayName: 'Petal Pusher', 
        role: 'user',
        isBlocked: false,
        savedPosts: ['post-112'] 
      },
      { 
        id: 5, 
        username: 'novice', 
        password: 'password', 
        displayName: 'Novice Planter', 
        role: 'user',
        isBlocked: false,
        savedPosts: [] 
      }
    ],
    // The currently authenticated user session
    currentUser: null,
  }),

  getters: {
    /**
     * Boolean checks for UI conditional rendering (e.g., NavBar tabs)
     */
    isLoggedIn: (state) => !!state.currentUser,
    isAdmin: (state) => state.currentUser?.role === 'admin',
    
    /**
     * Returns an array of post IDs saved by the current user.
     * Used by the CollectionView to fetch the specific posts.
     */
    mySavedPostIds: (state) => {
      if (!state.currentUser) return []
      return state.currentUser.savedPosts || []
    },
    
    /**
     * Returns the total count for the NavBar heart badge.
     */
    favoritesCount: (state) => {
      if (!state.currentUser) return 0
      return (state.currentUser.savedPosts || []).length
    }
  },

  actions: {
    // ==========================================
    // AUTHENTICATION CONTROLS
    // ==========================================
    login(username, password) {
      const user = this.users.find(u => u.username === username && u.password === password)
      
      if (user) {
        // Trust & Safety: Prevent blocked users from logging in
        if (user.isBlocked) {
          return { success: false, error: 'Your account has been suspended by the administrator.' }
        }
        
        // Establish session
        this.currentUser = { ...user }
        return { success: true }
      }
      
      return { success: false, error: 'Invalid username or password.' }
    },

    register(username, password, displayName) {
      const exists = this.users.find(u => u.username === username)
      if (exists) {
        return { success: false, error: 'Username already exists. Please choose another.' }
      }
      
      const newUser = {
        id: Date.now(), // Generate a mock unique ID
        username,
        password,
        displayName,
        role: 'user',
        isBlocked: false,
        savedPosts: []
      }
      
      this.users.push(newUser)
      this.currentUser = { ...newUser } // Auto-login upon registration
      return { success: true }
    },

    logout() {
      this.currentUser = null
    },

    // ==========================================
    // COLLECTION CONTROLS
    // ==========================================
    /**
     * Toggles a post ID inside the user's savedPosts array.
     * @param {String} postId - The ID of the Rose post
     */
    toggleSavePost(postId) {
      if (!this.currentUser) return false
      
      // Find the user in the "database" array to update the source of truth
      const userIndex = this.users.findIndex(u => u.id === this.currentUser.id)
      if (userIndex === -1) return false

      const user = this.users[userIndex]
      if (!user.savedPosts) user.savedPosts = []
      
      const postIndex = user.savedPosts.indexOf(postId)
      if (postIndex === -1) {
        // Not saved yet, add it
        user.savedPosts.push(postId)
      } else {
        // Already saved, remove it
        user.savedPosts.splice(postIndex, 1)
      }
      
      // Update the reactive currentUser state to instantly reflect in the NavBar UI
      this.currentUser = { ...user }
      return true
    },

    // ==========================================
    // SUPREME ADMIN CONTROLS
    // ==========================================
    /**
     * Toggles a user's blocked status. 
     * @param {Number} userId - The ID of the target user
     */
    toggleBlockUser(userId) {
      // Authorization check
      if (!this.isAdmin) return false
      
      const targetUser = this.users.find(u => u.id === userId)
      
      // Prevent the Admin from accidentally blocking themselves
      if (targetUser && targetUser.role !== 'admin') {
        targetUser.isBlocked = !targetUser.isBlocked
        return true
      }
      return false
    }
  }
})