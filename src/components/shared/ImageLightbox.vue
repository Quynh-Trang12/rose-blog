<script>
/**
 * ==========================================
 * COMPONENT: ImageLightbox.vue
 * ==========================================
 * Description:
 * An accessible, keyboard-navigable image lightbox rendered via Teleport
 * to the document body. Displays a single image at a time with prev/next
 * navigation when multiple images are provided.
 *
 * Props: visible (Boolean), images (Array of URL strings), startIndex (Number).
 * Emits: close — signals the parent to hide the lightbox.
 *
 * Accessibility: role="dialog", aria-modal="true", Escape to close,
 * ArrowLeft/ArrowRight to navigate, focus trap via tabindex.
 */

export default {
  name: 'ImageLightbox',

  // ==========================================
  // PROPS
  // ==========================================
  props: {
    /**
     * Controls the visibility of the lightbox overlay.
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * Array of image URL strings to display.
     */
    images: {
      type: Array,
      default: () => [],
    },
    /**
     * The initial image index to display when the lightbox opens.
     */
    startIndex: {
      type: Number,
      default: 0,
    },
  },

  // ==========================================
  // EMITS
  // ==========================================
  emits: ['close'],

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Tracks the currently displayed image index within the images array.
      currentIndex: 0,
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    /**
     * Returns the total number of images in the gallery.
     * @returns {number}
     */
    totalImages() {
      return this.images.length
    },

    /**
     * Returns the URL of the currently displayed image.
     * @returns {string}
     */
    currentImage() {
      return this.images[this.currentIndex] || ''
    },

    /**
     * Returns true if there are multiple images to navigate between.
     * @returns {boolean}
     */
    hasMultiple() {
      return this.totalImages > 1
    },

    /**
     * Generates the ARIA label string showing current position.
     * Explanation: Read by screen readers to announce position context.
     * @returns {string}
     */
    ariaLabel() {
      return `Image ${this.currentIndex + 1} of ${this.totalImages}`
    },
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * Resets the current index to startIndex each time the lightbox opens.
     * Explanation: Ensures the lightbox always opens at the correct image.
     * @param {boolean} newVal - The new visibility state
     */
    visible(newVal) {
      if (newVal) {
        this.currentIndex = this.startIndex
      }
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Emits the close event to hide the lightbox.
     */
    closeLightbox() {
      this.$emit('close')
    },

    /**
     * Navigates to the previous image, wrapping around to the last image.
     */
    prevImage() {
      if (this.hasMultiple) {
        this.currentIndex =
          (this.currentIndex - 1 + this.totalImages) % this.totalImages
      }
    },

    /**
     * Navigates to the next image, wrapping around to the first image.
     */
    nextImage() {
      if (this.hasMultiple) {
        this.currentIndex = (this.currentIndex + 1) % this.totalImages
      }
    },

    /**
     * Handles keyboard events for lightbox navigation and dismissal.
     * Explanation: Escape closes the lightbox, ArrowLeft/ArrowRight
     * navigate between images.
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.closeLightbox()
      } else if (event.key === 'ArrowLeft') {
        this.prevImage()
      } else if (event.key === 'ArrowRight') {
        this.nextImage()
      }
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted() {
    // Explanation: Attach a global keydown listener for keyboard navigation.
    window.addEventListener('keydown', this.handleKeydown)
  },

  unmounted() {
    // Explanation: Clean up the global keydown listener to prevent memory leaks.
    window.removeEventListener('keydown', this.handleKeydown)
  },
}
</script>

<template>
  <!-- Explanation: Teleport renders the lightbox at the document body root
       to escape any parent stacking context or overflow constraints -->
  <teleport to="body">
    <transition name="lightbox-fade">
      <div
        v-if="visible"
        class="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        @click.self="closeLightbox"
        tabindex="-1"
      >
        <!-- Explanation: Close button positioned at the top-right corner -->
        <button
          class="lightbox-close btn btn-sm d-flex align-items-center justify-content-center"
          @click="closeLightbox"
          aria-label="Close lightbox"
          type="button"
        >
          <span class="material-symbols-outlined fs-4 text-white">close</span>
        </button>

        <!-- Explanation: Previous image navigation arrow (left side) -->
        <button
          v-if="hasMultiple"
          class="lightbox-nav lightbox-nav--prev btn btn-sm d-flex align-items-center justify-content-center"
          @click.stop="prevImage"
          aria-label="Previous image"
          type="button"
        >
          <span class="material-symbols-outlined fs-3 text-white">chevron_left</span>
        </button>

        <!-- Explanation: The main image element with constrained dimensions -->
        <img
          :src="currentImage"
          :alt="ariaLabel"
          class="lightbox-image"
        />

        <!-- Explanation: Next image navigation arrow (right side) -->
        <button
          v-if="hasMultiple"
          class="lightbox-nav lightbox-nav--next btn btn-sm d-flex align-items-center justify-content-center"
          @click.stop="nextImage"
          aria-label="Next image"
          type="button"
        >
          <span class="material-symbols-outlined fs-3 text-white">chevron_right</span>
        </button>

        <!-- Explanation: Image counter indicator at the bottom -->
        <div v-if="hasMultiple" class="lightbox-counter text-white text-sm fw-bold">
          {{ currentIndex + 1 }} / {{ totalImages }}
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
/* Explanation: Full-screen fixed overlay with dark backdrop */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1070;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Explanation: Constrained image dimensions for responsive display */
.lightbox-image {
  max-width: min(90vw, 960px);
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  user-select: none;
}

/* Explanation: Close button at the top-right of the overlay */
.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 2;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Explanation: Shared styles for prev/next navigation arrows */
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 2;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.25);
}

.lightbox-nav--prev {
  left: 1rem;
}

.lightbox-nav--next {
  right: 1rem;
}

/* Explanation: Image counter positioned at the bottom centre */
.lightbox-counter {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  padding: 0.35rem 1rem;
  border-radius: 100px;
}

/* Explanation: Fade transition for lightbox enter/leave */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.25s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
