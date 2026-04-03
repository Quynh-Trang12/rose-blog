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
import VueEasyLightbox from 'vue-easy-lightbox'

export default {
  name: 'NewsCard',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    VueEasyLightbox,
  },

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
      // Lightbox State
      lightboxVisible: false,
      lightboxIndex: 0,
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
     * Flag for content that exceeds standard teaser height.
     * Adjusted to 400 chars to better match the 140px fixed height truncation.
     */
    isLongContent: function () {
      return this.contentText.length > 400
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
      if (!this.isAuthed) {
        alert('Please log in to react to news items.')
        this.showReactionPicker = false
        return
      }
      this.$emit('react', { id: this.item.id, reaction: reaction })
      this.showReactionPicker = false
    },

    /**
     * Lightbox Controls
     */
    showLightbox: function (index) {
      this.lightboxIndex = index || 0
      this.lightboxVisible = true
    },
    hideLightbox: function () {
      this.lightboxVisible = false
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
    /**
     * Constructs the shareable URL for the current post.
     * @returns {string} Full URL with anchor hash
     */
    getShareUrl: function () {
      return window.location.origin + window.location.pathname + '#post-' + this.item.id
    },

    handleShare: function (platform) {
      var shareUrl = this.getShareUrl()
      var shareTitle = encodeURIComponent(this.item.title || 'Check out this rose!')

      if (platform === 'facebook') {
        // Explanation: Opens Facebook sharer in a centered popup window matching FB's dialog size
        var fbWidth = 626
        var fbHeight = 436
        var fbLeft = Math.round((screen.width / 2) - (fbWidth / 2))
        var fbTop = Math.round((screen.height / 2) - (fbHeight / 2))
        window.open(
          'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(shareUrl) +
            '&quote=' +
            shareTitle,
          'facebook-share-dialog',
          'width=' + fbWidth + ',height=' + fbHeight + ',top=' + fbTop + ',left=' + fbLeft,
        )
      } else if (platform === 'twitter') {
        // Explanation: Opens Twitter/X intent in a centered popup
        var twWidth = 550
        var twHeight = 420
        var twLeft = Math.round((screen.width / 2) - (twWidth / 2))
        var twTop = Math.round((screen.height / 2) - (twHeight / 2))
        window.open(
          'https://twitter.com/intent/tweet?url=' + encodeURIComponent(shareUrl) + '&text=' + shareTitle,
          'twitter-share-dialog',
          'width=' + twWidth + ',height=' + twHeight + ',top=' + twTop + ',left=' + twLeft + ',toolbar=0,status=0,menubar=0'
        )
      } else if (platform === 'link') {
        // Explanation: Copies the shareable link to the user's clipboard
        try {
          navigator.clipboard.writeText(shareUrl)
          alert('Link copied to clipboard!')
        } catch (err) {
          console.error('Failed to copy link', err)
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
        @click="showLightbox(0)"
        style="cursor: zoom-in"
      >
        <img
          v-lazy-load="item.images && item.images.length > 0 ? item.images[0] : item.image"
          :alt="'Cover image for ' + item.title"
          class="type-b-img w-100 h-100 object-fit-cover"
        />

        <!-- Glassy Stack Badge -->
        <div
          v-if="item.images && item.images.length > 1"
          class="glassy-badge position-absolute bottom-0 end-0 m-3 px-2 py-1 rounded-3 d-flex align-items-center gap-1"
        >
          <span class="material-symbols-outlined fs-6">filter_none</span>
          <span class="text-xs fw-bold">+{{ item.images.length - 1 }}</span>
        </div>

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

        <!-- Content View (Fade-Out Effect) -->
        <div
          class="content-wrapper position-relative overflow-hidden transition-all duration-500"
          :style="{ maxHeight: isExpanded ? '2000px' : '140px' }"
        >
          <div
            class="mb-0 text-muted lh-base rte-rendered"
            style="font-family: 'Roboto Condensed'"
            v-html="contentText"
          ></div>

          <!-- Gradient Mask (Visual Dissolve) -->
          <div v-if="!isExpanded && isLongContent" class="content-fade-mask"></div>
        </div>

        <!-- Centered Read More Button -->
        <div v-if="isLongContent" class="d-flex justify-content-center mt-3 mb-1">
          <button
            class="btn-read-more d-flex align-items-center gap-2"
            @click="isExpanded = !isExpanded"
            :aria-expanded="isExpanded"
          >
            <span class="btn-text">{{ isExpanded ? 'Read Less' : 'Read More' }}</span>
            <span
              class="material-symbols-outlined transition-base"
              :class="{ 'rotate-180': isExpanded }"
            >
              keyboard_arrow_down
            </span>
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

      <!-- Share Menu (Teleported for centering) -->
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

        <teleport to="body">
          <div
            v-if="showShareMenu"
            class="share-modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-index-modal"
            @click.self="closeShare"
          >
            <div
              v-click-outside="closeShare"
              class="share-popup frosted-glass rounded-4 shadow-lg animate-fade-up"
            >
              <!-- Popup Header -->
              <div
                class="share-popup__header d-flex justify-content-between align-items-center px-3 py-3 border-bottom border-light"
              >
                <span class="fw-bold text-dark" style="font-family: 'Roboto Condensed'"
                  >Share this post</span
                >
                <button
                  class="btn btn-sm p-0 border-0 text-muted"
                  @click="closeShare"
                  aria-label="Close share menu"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
              <!-- Share Options -->
              <div class="d-flex flex-column gap-2 p-3">
                <button
                  class="share-popup__item btn btn-sm w-100 text-start d-flex align-items-center gap-3 px-3 py-3 rounded-3 border-0"
                  @click="handleShare('facebook')"
                >
                  <div
                    class="share-popup__icon-circle d-flex align-items-center justify-content-center rounded-circle"
                    style="background: #1877f2"
                  >
                    <i class="bi bi-facebook lh-1 text-white" style="font-size: 1.1rem"></i>
                  </div>
                  <span class="fw-medium text-dark text-md">Share on Facebook</span>
                </button>
                <button
                  class="share-popup__item btn btn-sm w-100 text-start d-flex align-items-center gap-3 px-3 py-3 rounded-3 border-0"
                  @click="handleShare('twitter')"
                >
                  <div
                    class="share-popup__icon-circle d-flex align-items-center justify-content-center rounded-circle"
                    style="background: #000000"
                  >
                    <i class="bi bi-twitter-x lh-1 text-white" style="font-size: 1rem"></i>
                  </div>
                  <span class="fw-medium text-dark text-md">Share on X</span>
                </button>
                <button
                  class="share-popup__item btn btn-sm w-100 text-start d-flex align-items-center gap-3 px-3 py-3 rounded-3 border-0"
                  @click="handleShare('link')"
                >
                  <div
                    class="share-popup__icon-circle d-flex align-items-center justify-content-center rounded-circle"
                    style="background: #65676b"
                  >
                    <span class="material-symbols-outlined text-white" style="font-size: 1.1rem"
                      >link</span
                    >
                  </div>
                  <span class="fw-medium text-dark text-md">Copy Link</span>
                </button>
              </div>
            </div>
          </div>
        </teleport>
      </div>

      <!-- Lightbox Component -->
      <vue-easy-lightbox
        :visible="lightboxVisible"
        :imgs="item.images || [item.image]"
        :index="lightboxIndex"
        @hide="hideLightbox"
      />
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

// Project-specific tokens (aligned with base.scss)
$red: #e2065f;
$custom-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

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

.content-wrapper {
  transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-fade-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  // Dissolves into a white gradient fade as requested
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8) 50%, #ffffff 100%);
  pointer-events: none;
  z-index: 1;
}

.btn-read-more {
  background: rgba($red, 0.05);
  color: $red;
  border: 1px solid rgba($red, 0.15);
  padding: 0.5rem 1.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  transition: all 0.3s $custom-timing-function;
  cursor: pointer;

  .btn-text {
    position: relative;
    top: 1px;
  }

  .material-symbols-outlined {
    font-size: 1.2rem;
    transition: transform 0.4s ease;
  }

  &:hover {
    background: $red;
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba($red, 0.25);
    border-color: $red;
  }

  &:active {
    transform: translateY(-1px);
  }

  .rotate-180 {
    transform: rotate(180deg);
  }
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

// ==========================================
// SHARE POPUP (Facebook-style dialog)
// ==========================================
.share-modal-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.share-popup {
  width: 90%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: sharePopupIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &__header {
    font-family: 'Roboto Condensed', sans-serif;
  }

  &__icon-circle {
    width: 32px;
    height: 32px;
    min-width: 32px;
    transition: transform 0.15s ease;
  }

  &__item {
    transition: background-color 0.15s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);

      .share-popup__icon-circle {
        transform: scale(1.1);
      }
    }
  }
}

.glassy-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.animate-fade-up {
  animation: fadeUp 0.3s ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sharePopupIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
