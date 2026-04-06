<script>
/**
 * ==========================================
 * COMPONENT: ImageLightbox.vue
 * ==========================================
 * Description:
 * A fullscreen image overlay (lightbox) to view gallery images.
 * Supports keyboard navigation (ESC, LEFT, RIGHT), teleporting to <body>.
 *
 * Props:
 *   images (Array of strings): Array of image URLs to display.
 *   initialIndex (Number): The starting image index.
 *   isOpen (Boolean): Controls visibility.
 *
 * Emits:
 *   close: Fired when closing the lightbox.
 */

export default {
  name: 'ImageLightbox',

  props: {
    images: {
      type: Array,
      required: true,
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['close'],

  data() {
    return {
      // The current image index being viewed.
      currentIndex: this.initialIndex,
      // Controls the zoom state of the image.
      isZoomed: false,
    }
  },

  /**
   * Watcher to synchronize the currentIndex when the lightbox opens.
   */
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.currentIndex = this.initialIndex
        this.isZoomed = false
        // Add keyboard listeners
        window.addEventListener('keydown', this.handleKeyDown)
        // Prevent body scrolling
        document.body.classList.add('overflow-hidden')
      } else {
        // Remove keyboard listeners
        window.removeEventListener('keydown', this.handleKeyDown)
        // Re-enable body scrolling
        document.body.classList.remove('overflow-hidden')
      }
    },
    initialIndex(newVal) {
      this.currentIndex = newVal
    },
  },

  /**
   * Clean up keyboard listeners if component is unmounted.
   */
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
    document.body.classList.remove('overflow-hidden')
  },

  methods: {
    /**
     * Handles keyboard events for navigation and exit.
     */
    handleKeyDown(e) {
      if (!this.isOpen) return
      if (e.key === 'Escape') this.close()
      if (e.key === 'ArrowLeft' && this.images.length > 1) this.prev()
      if (e.key === 'ArrowRight' && this.images.length > 1) this.next()
    },

    /**
     * Shows the previous image in the array.
     */
    prev() {
      this.isZoomed = false
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length
    },

    /**
     * Shows the next image in the array.
     */
    next() {
      this.isZoomed = false
      this.currentIndex = (this.currentIndex + 1) % this.images.length
    },

    /**
     * Toggles the zoom state.
     */
    toggleZoom() {
      this.isZoomed = !this.isZoomed
    },

    /**
     * Emits the close event to the parent.
     */
    close() {
      this.isZoomed = false
      this.$emit('close')
    },
  },
}
</script>

<template>
  <teleport to="body">
    <!-- Overlay Backdrop -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="lightbox-overlay d-flex align-items-center justify-content-center"
        role="dialog"
        aria-modal="true"
        :aria-label="'Image ' + (currentIndex + 1) + ' of ' + images.length"
        @click.self="close"
      >
        <!-- Close Button -->
        <button
          class="close-btn btn btn-dark rounded-circle p-2 shadow-lg"
          @click="close"
          aria-label="Close lightbox"
        >
          <span class="material-symbols-outlined fs-3">close</span>
        </button>

        <!-- Main Image Display -->
        <div
          class="position-content position-relative animate-fade-up d-flex align-items-center justify-content-center p-3"
          :class="{ 'overflow-auto': isZoomed }"
        >
          <img
            :src="images[currentIndex]"
            alt="Rose Gallery Item"
            class="img-fluid rounded-3 shadow-lg lightbox-image cursor-zoom-in"
            :class="{ zoomed: isZoomed }"
            @click="toggleZoom"
          />

          <!-- Navigation Buttons -->
          <template v-if="images.length > 1 && !isZoomed">
            <button
              class="nav-btn nav-btn-left btn btn-dark rounded-circle shadow-lg"
              @click="prev"
              aria-label="Previous image"
            >
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              class="nav-btn nav-btn-right btn btn-dark rounded-circle shadow-lg"
              @click="next"
              aria-label="Next image"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </template>
        </div>

        <!-- Image counter -->
        <div
          v-if="!isZoomed"
          class="position-absolute bottom-0 mb-4 bg-dark bg-opacity-75 text-white px-3 py-1 rounded-pill text-sm"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
/* High z-index (1070) overlay backdrop covering the whole viewport */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1070;
  backdrop-filter: blur(8px);
}

.lightbox-image {
  max-width: min(90vw, 960px);
  max-height: 90vh;
  object-fit: contain;
  transition: all 0.3s ease;
}

.lightbox-image.zoomed {
  max-width: 150vw;
  max-height: 150vh;
  cursor: zoom-out;
}

.cursor-zoom-in {
  cursor: zoom-in;
}
.cursor-zoom-out {
  cursor: zoom-out;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Close button positioning */
.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1071;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Nav button positioning */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1072;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.nav-btn-left {
  left: -4rem;
}

.nav-btn-right {
  right: -4rem;
}

/* Desktop only: move buttons inside on smaller screens or adjust their offset */
@media (max-width: 1200px) {
  .nav-btn-left {
    left: 1rem;
  }
  .nav-btn-right {
    right: 1rem;
  }
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

.animate-fade-up {
  animation: fadeUp 0.4s ease forwards;
}
</style>
