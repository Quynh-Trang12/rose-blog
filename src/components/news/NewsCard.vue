<script>
/**
 * ==========================================
 * COMPONENT: NewsCard.vue
 * ==========================================
 * Description:
 * A versatile news display card that supports multiple layout styles (A, B, C).
 * Handles social interactions (likes, comments, shares) and provides
 * edit/delete functionality if the current user is the author.
 */
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NewsCard',

  // ==========================================
  // PROPS
  // ==========================================
  props: {
    item: {
      type: Object,
      required: true,
    },
    isAuthed: {
      type: Boolean,
      default: false,
    },
    isOwner: {
      type: Boolean,
      default: false,
    },
  },

  // ==========================================
  // EMITS
  // ==========================================
  emits: ['react', 'comment', 'share', 'edit', 'delete'],

  // ==========================================
  // DATA
  // ==========================================
  data: function () {
    return {
      isExpanded: false,
      showEllipsisMenu: false,
      showReactionPicker: false,
      showComments: false,
      showShareMenu: false,
      commentText: '',
      isEditing: false,
      editTitle: '',
      editContent: '',
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapGetters('auth', ['mySavedPostIds']),

    /**
     * Determines if the current post has associated imagery.
     */
    hasImage: function () {
      return (this.item.images && this.item.images.length > 0) || !!this.item.image
    },

    /**
     * Normalizes the content source (handling legacy content vs description fields).
     */
    contentText: function () {
      return this.item.content || this.item.description || ''
    },

    /**
     * Flag for content that exceeds standard teaser length.
     */
    isLongContent: function () {
      return this.contentText.length > 150
    },

    /**
     * Truncated version of the content for teaser views.
     */
    truncatedContent: function () {
      var stripped = this.contentText.replace(/<[^>]*>/g, '')
      return stripped.length > 150 ? stripped.substring(0, 120) : stripped
    },

    /**
     * Formats the ISO date string into a user-friendly local date.
     */
    formattedDate: function () {
      var d = new Date(this.item.date)
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },

    /**
     * Checks if this post ID is in the current user's saved list via Vuex.
     */
    isSaved: function () {
      var self = this
      return this.mySavedPostIds.some(function (id) {
        return String(id) === String(self.item.id)
      })
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('auth', ['toggleSavePost']),

    /**
     * Toggles bookmark state for the current post.
     */
    toggleSave: function () {
      if (!this.isAuthed) {
        alert('Please log in to save news items.')
        return
      }
      // Explanation: Dispatching to Vuex to update persistent saved list.
      this.toggleSavePost(this.item.id)
      this.showEllipsisMenu = false
    },

    /**
     * Toggles the post options menu (ellipsis).
     */
    toggleEllipsis: function () {
      this.showEllipsisMenu = !this.showEllipsisMenu
      this.showShareMenu = false
    },

    /**
     * Toggles the share options menu.
     */
    toggleShare: function () {
      this.showShareMenu = !this.showShareMenu
      this.showEllipsisMenu = false
    },

    /**
     * Closes the ellipsis menu.
     */
    closeEllipsis: function () {
      this.showEllipsisMenu = false
    },

    /**
     * Closes the share menu.
     */
    closeShare: function () {
      this.showShareMenu = false
    },

    /**
     * Prepares the card for inline editing if ownership is verified.
     */
    initiateEdit: function () {
      this.showEllipsisMenu = false
      if (!this.isOwner) return
      this.isEditing = true
      this.editTitle = this.item.title
      this.editContent = this.contentText
    },

    /**
     * Emits the updated content to the parent for persistence.
     */
    saveEdit: function () {
      if (this.editTitle.trim() && this.editContent.trim()) {
        this.$emit('edit', this.item.id, {
          title: this.editTitle.trim(),
          content: this.editContent.trim(),
        })
        this.isEditing = false
      }
    },

    /**
     * Exits edit mode without saving.
     */
    cancelEdit: function () {
      this.isEditing = false
    },

    /**
     * Emits a delete request if confirmed by the user.
     */
    requestDelete: function () {
      this.showEllipsisMenu = false
      if (!this.isOwner) return
      if (window.confirm('Are you sure you want to delete this post?')) {
        this.$emit('delete', this.item.id)
      }
    },

    /**
     * Emits a reaction event to be handled by the parent.
     * @param {string} reaction - Type of reaction (favorite, thumb_up, etc.)
     */
    handleReact: function (reaction) {
      this.$emit('react', { id: this.item.id, reaction: reaction })
      this.showReactionPicker = false
    },

    /**
     * Validates and emits a new comment.
     */
    submitComment: function () {
      if (this.commentText.trim() && this.isAuthed) {
        this.$emit('comment', {
          id: this.item.id,
          comment: {
            id: Date.now(),
            text: this.commentText.trim(),
            authorName: this.$store.state.auth.currentUser.displayName,
            authorAvatar:
              'https://i.pravatar.cc/40?u=' + this.$store.state.auth.currentUser.username,
          },
        })
        this.commentText = ''
      }
    },

    /**
     * Handles sharing to various platforms.
     * @param {string} platform - The target platform key
     */
    handleShare: function (platform) {
      // var self = this
      if (platform === 'link') {
        try {
          navigator.clipboard.writeText(
            window.location.href.split('#')[0] + '#post-' + this.item.id,
          )
          alert('Link copied to clipboard')
        } catch (err) {
          console.error('Failed to copy', err)
        }
      }
      this.$emit('share', { id: this.item.id, platform: platform })
      this.showShareMenu = false
    },
  },
}
</script>

<template>
  <!-- Main Card Container -->
  <div
    class="news-card frosted-glass rounded-4 shadow-sm p-3 position-relative d-flex flex-column gap-3"
    :id="'post-' + item.id"
  >
    <!-- 1. Card Header: Author info and status -->
    <div class="d-flex justify-content-between align-items-start">
      <div class="d-flex align-items-center gap-2 mb-2">
        <img
          :src="item.authorAvatar || 'https://i.pravatar.cc/150?u=anonymous'"
          :alt="'Avatar for ' + item.id"
          class="rounded-circle"
          width="40"
          height="40"
        />
        <div>
          <p class="fw-semibold text-dark mb-0 text-md" style="font-family: 'Roboto Condensed'">
            {{ item.authorName || 'Guest Gardener' }}
          </p>
          <div class="d-flex align-items-center gap-1">
            <span class="text-muted text-xs" style="font-family: 'Roboto Condensed'">{{
              formattedDate
            }}</span>
            <span
              class="material-symbols-outlined text-muted"
              style="font-size: 0.85rem"
              aria-hidden="true"
            >
              {{ item.isPublic !== false ? 'public' : 'lock' }}
            </span>
          </div>
        </div>
      </div>

      <div class="d-flex align-items-center gap-3">
        <!-- Category Badge -->
        <span
          class="badge rounded-pill text-xs fw-bolder ls-1 text-primary text-uppercase glassmorphism-pink p-2"
        >
          {{ item.type || item.category || 'Rose News' }}
        </span>

        <!-- Post Options Menu (Ellipsis) -->
        <div class="position-relative">
          <button
            class="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center"
            @click.stop="toggleEllipsis"
            aria-label="Post options"
            :aria-expanded="showEllipsisMenu"
            style="width: 32px; height: 32px"
          >
            <span class="material-symbols-outlined fs-5">more_horiz</span>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showEllipsisMenu"
            v-click-outside="closeEllipsis"
            class="frosted-glass rounded-3 shadow-lg position-absolute end-0 top-100 mt-1 py-1 d-flex flex-column z-3"
            style="min-width: 150px; border: 1px solid rgba(255, 255, 255, 0.2)"
          >
            <!-- Save Post -->
            <button
              class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item"
              :disabled="!isAuthed"
              :class="{ 'text-muted': !isAuthed }"
              @click="toggleSave"
              :title="!isAuthed ? 'Log in to save news items' : ''"
            >
              <span class="material-symbols-outlined fs-5">{{
                isSaved ? 'bookmark_added' : 'bookmark_add'
              }}</span>
              {{ isSaved ? 'Unsave' : 'Save' }}
            </button>
            <!-- Edit Post (Owner only) -->
            <button
              class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item"
              :disabled="!isAuthed || !isOwner"
              :class="{ 'text-muted': !isAuthed || !isOwner }"
              :title="
                !isAuthed ? 'Log in to manage posts' : !isOwner ? 'Cannot edit others posts' : ''
              "
              :aria-disabled="!isAuthed || !isOwner"
              @click="initiateEdit"
            >
              <span class="material-symbols-outlined fs-5">edit</span> Edit
            </button>
            <!-- Delete Post (Owner only) -->
            <button
              class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item text-danger"
              :disabled="!isAuthed || !isOwner"
              :class="{ 'text-muted opacity-50': !isAuthed || !isOwner }"
              :title="
                !isAuthed ? 'Log in to manage posts' : !isOwner ? 'Cannot delete others posts' : ''
              "
              :aria-disabled="!isAuthed || !isOwner"
              @click="requestDelete"
            >
              <span class="material-symbols-outlined fs-5">delete</span> Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Card Body: Content area -->

    <!-- Inline Edit Form -->
    <div v-if="isEditing" class="edit-form p-2 bg-white rounded-3 mb-2 shadow-sm border">
      <input
        type="text"
        class="form-control mb-2 fw-bold"
        style="font-family: 'Zilla Slab'"
        v-model="editTitle"
      />
      <textarea
        class="form-control mb-3"
        rows="3"
        v-model="editContent"
        style="font-family: 'Roboto Condensed'"
      ></textarea>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="cancelEdit">
          Cancel
        </button>
        <button class="btn btn-sm btn-primary rounded-pill px-4" @click="saveEdit">Save</button>
      </div>
    </div>

    <div v-else>
      <!-- Layout Type B: Featured Image with Overlay Text -->
      <div
        v-if="item.layoutType === 'B' && hasImage"
        class="type-b-card position-relative overflow-hidden rounded-4 mb-3 card-hover shadow-sm z-0"
      >
        <img
          v-lazy-load="item.images && item.images.length > 0 ? item.images[0] : item.image"
          :alt="'Cover image for ' + item.title"
          class="type-b-img w-100 h-100 object-fit-cover"
        />
        <div class="position-absolute bottom-0 start-0 w-100 p-4 pt-5 overlay-gradient text-white">
          <h2
            class="fs-4 mb-2 fw-bold text-shadow"
            style="font-family: 'Zilla Slab'; font-style: italic"
          >
            {{ item.title }}
          </h2>
          <p class="mb-0 text-sm opacity-75 text-truncate" style="font-family: 'Roboto Condensed'">
            {{ contentText }}
          </p>
        </div>
      </div>

      <!-- Layout Type A & C: Standard Text Layout -->
      <div v-else class="type-text-card pt-2 pb-1 px-1">
        <h2
          class="fs-4 mb-2 fw-bold"
          style="font-family: 'Zilla Slab'; font-style: italic; color: #333"
        >
          {{ item.title }}
        </h2>

        <!-- Short Content View -->
        <p
          v-if="!isLongContent"
          class="mb-0 text-muted lh-base rte-rendered"
          style="font-family: 'Roboto Condensed'"
          v-html="contentText"
        ></p>

        <!-- Long Content View with Read More toggle -->
        <div v-else>
          <p
            v-if="!isExpanded"
            class="mb-0 text-muted lh-base rte-rendered"
            style="font-family: 'Roboto Condensed'"
            v-html="truncatedContent + '...'"
          ></p>
          <div
            v-else
            class="mb-0 text-muted lh-base rte-rendered"
            style="font-family: 'Roboto Condensed'"
            v-html="contentText"
          ></div>
          <button
            class="btn btn-link p-0 m-0 align-baseline text-primary fw-semibold text-decoration-none"
            @click="isExpanded = !isExpanded"
          >
            {{ isExpanded ? 'Read less' : 'Read more' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Social Interaction Row (Reactions, Comments, Share) -->
    <div class="d-flex align-items-center gap-3 pt-2 border-top border-light position-relative">
      <!-- Reaction Picker and Count -->
      <div
        class="position-relative"
        @mouseenter="showReactionPicker = true"
        @mouseleave="showReactionPicker = false"
      >
        <button
          class="btn btn-sm d-flex align-items-center gap-2 border-0 shadow-none px-2 rounded-pill social-btn"
          :class="item.userReaction ? 'text-primary bg-primary bg-opacity-10' : 'text-muted'"
          aria-label="React to post"
          :aria-pressed="!!item.userReaction"
        >
          <span class="material-symbols-outlined fs-5">
            {{
              item.userReaction === 'favorite'
                ? 'favorite'
                : item.userReaction === 'sentiment_very_satisfied'
                  ? 'sentiment_very_satisfied'
                  : item.userReaction === 'sentiment_very_dissatisfied'
                    ? 'sentiment_very_dissatisfied'
                    : 'thumb_up'
            }}
          </span>
          <span class="fw-semibold text-sm">{{ (item.likes || 0) + (item.hearts || 0) }}</span>
        </button>

        <!-- Dynamic Reaction Popover -->
        <div
          v-show="showReactionPicker"
          class="position-absolute start-0 z-3 pb-2"
          style="bottom: calc(100% - 10px)"
        >
          <div
            class="frosted-glass rounded-pill shadow-sm d-flex gap-2 p-2 px-3 border border-white"
          >
            <button
              class="btn btn-sm p-0 rounded-circle text-primary hover-scale transition-base"
              @click.stop="handleReact('favorite')"
              aria-label="Heart reaction"
            >
              <span class="material-symbols-outlined fs-4">favorite</span>
            </button>
            <button
              class="btn btn-sm p-0 rounded-circle text-primary hover-scale transition-base"
              @click.stop="handleReact('thumb_up')"
              aria-label="Like reaction"
            >
              <span class="material-symbols-outlined fs-4">thumb_up</span>
            </button>
            <button
              class="btn btn-sm p-0 rounded-circle text-warning hover-scale transition-base"
              @click.stop="handleReact('sentiment_very_satisfied')"
              aria-label="Wow reaction"
            >
              <span class="material-symbols-outlined fs-4">sentiment_very_satisfied</span>
            </button>
            <button
              class="btn btn-sm p-0 rounded-circle text-info hover-scale transition-base"
              @click.stop="handleReact('sentiment_very_dissatisfied')"
              aria-label="Sad reaction"
            >
              <span class="material-symbols-outlined fs-4">sentiment_very_dissatisfied</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Comment Toggle -->
      <button
        class="btn btn-sm d-flex align-items-center gap-2 text-muted border-0 shadow-none px-2 rounded-pill social-btn"
        @click="showComments = !showComments"
        aria-label="Toggle comments"
        :aria-expanded="showComments"
      >
        <span class="material-symbols-outlined fs-5">chat_bubble_outline</span>
        <span class="fw-semibold text-sm">{{ (item.comments || []).length }}</span>
      </button>

      <!-- Share Menu -->
      <div class="position-relative ms-auto">
        <button
          class="btn btn-sm d-flex align-items-center gap-2 text-muted border-0 shadow-none px-2 rounded-pill social-btn"
          @click.stop="toggleShare"
          aria-label="Share post"
          :aria-expanded="showShareMenu"
        >
          <span class="material-symbols-outlined fs-5">share</span>
          <span class="fw-semibold text-sm">{{ item.shares || 0 }}</span>
        </button>

        <div
          v-if="showShareMenu"
          v-click-outside="closeShare"
          class="position-absolute bottom-100 end-0 mb-2 z-3 frosted-glass rounded-4 shadow-lg p-3 d-flex flex-column gap-2"
          style="min-width: 180px"
        >
          <button
            class="btn btn-sm btn-outline-primary rounded-pill w-100 text-start d-flex align-items-center gap-2 border-0 glassmorphism-pink"
            @click="handleShare('facebook')"
          >
            <i class="bi bi-facebook lh-1 fs-6"></i> Share Facebook
          </button>
          <button
            class="btn btn-sm btn-outline-primary rounded-pill w-100 text-start d-flex align-items-center gap-2 border-0 glassmorphism-pink"
            @click="handleShare('twitter')"
          >
            <i class="bi bi-twitter-x lh-1 fs-6"></i> Share on X
          </button>
          <button
            class="btn btn-sm btn-outline-primary rounded-pill w-100 text-start d-flex align-items-center gap-2 border-0 glassmorphism-pink"
            @click="handleShare('link')"
          >
            <span class="material-symbols-outlined fs-6 lh-1">link</span> Copy Link
          </button>
        </div>
      </div>
    </div>

    <!-- 4. Comments Section (Collapsible) -->
    <transition name="fade">
      <div v-show="showComments" class="pt-3 border-top border-light mt-1 w-100">
        <div class="d-flex flex-column gap-3 mb-3">
          <!-- Explanation: Iterates through comments stored in the article object -->
          <div v-for="c in item.comments || []" :key="c.id" class="d-flex gap-2">
            <img
              :src="c.authorAvatar"
              alt="Commenter Avatar"
              class="rounded-circle mt-1"
              width="28"
              height="28"
            />
            <div class="bg-light p-2 px-3 rounded-4 w-100">
              <p class="mb-0 fw-bold text-dark text-sm" style="font-family: 'Roboto Condensed'">
                {{ c.authorName }}
              </p>
              <p class="mb-0 text-muted text-sm lh-sm" style="font-family: 'Roboto Condensed'">
                {{ c.text }}
              </p>
            </div>
          </div>
        </div>

        <!-- New Comment Input (Visible only if logged in) -->
        <div v-if="isAuthed" class="d-flex gap-2 align-items-start mt-2">
          <textarea
            class="form-control rounded-3 border bg-light text-sm"
            rows="2"
            placeholder="Write a comment..."
            v-model="commentText"
            @keyup.enter.exact="submitComment"
          ></textarea>
          <button
            class="btn btn-primary rounded-pill btn-sm d-flex align-items-center"
            @click="submitComment"
            :disabled="!commentText.trim()"
          >
            <span class="material-symbols-outlined fs-5">send</span>
          </button>
        </div>
        <!-- Lock placeholder for guests -->
        <div
          v-else
          class="text-center p-2 rounded-3 bg-light d-flex align-items-center justify-content-center gap-2 mt-2 border"
        >
          <span class="material-symbols-outlined text-muted fs-6">lock</span>
          <p class="mb-0 text-muted fst-italic text-sm">Log in to join the conversation.</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

:deep(.rte-rendered) {
  /* Prevent large injected elements from breaking the layout */
  word-wrap: break-word;
  overflow-wrap: break-word;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }
}

.type-b-img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

:deep(.rte-rendered a) {
  color: #e2065f;
  text-decoration: underline;
}
:deep(.rte-rendered blockquote) {
  border-left: 3px solid #e2065f;
  padding-left: 1rem;
  color: #6c757d;
  font-style: italic;
}
:deep(.rte-rendered ul),
:deep(.rte-rendered ol) {
  padding-left: 1.5rem;
  margin-bottom: 0;
}
:deep(.rte-rendered p) {
  margin-bottom: 0.5rem;
}
:deep(.rte-rendered p:last-child) {
  margin-bottom: 0;
}

.overlay-gradient {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.menu-item {
  transition: all 0.2s;
  border: none;
}
.menu-item:not(:disabled):hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.social-btn {
  transition: all 0.2s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.hover-scale {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.hover-scale:hover {
  transform: scale(1.15);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    margin 0.3s ease,
    padding 0.3s ease,
    max-height 0.3s ease;
  overflow: hidden;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
