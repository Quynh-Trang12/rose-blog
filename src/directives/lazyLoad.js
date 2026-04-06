/**
 * ==========================================
 * DIRECTIVE: v-lazy-load
 * ==========================================
 * Description:
 * Efficiently loads images using IntersectionObserver. Replaces the
 * src with a placeholder while out of viewport, then swaps it for
 * the real image once visible.
 */

export const lazyLoad = {
  /**
   * Initial mount logic: sets placeholder and starts observer.
   */
  mounted(el, binding) {
    const placeholder = 'https://placehold.co/800x600?text=Rose+Blog...'
    const realSrc = binding.value

    // If no source provided, set placeholder and exit
    if (!realSrc) {
      el.src = placeholder
      return
    }

    // Set initial loading state
    el.src = placeholder
    el.classList.add('lazy-loading')

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image()
            img.src = realSrc
            img.onload = () => {
              el.src = realSrc
              el.classList.remove('lazy-loading')
              el.classList.add('lazy-loaded')
            }
            obs.unobserve(el)
          }
        })
      },
      { threshold: 0.1 },
    )

    el._lazyObserver = observer
    observer.observe(el)
  },

  /**
   * Updated cleanup/reset logic.
   * If the binding value (realSrc) changes, we need to re-observe the element.
   */
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      // Cleanup previous observer
      if (el._lazyObserver) {
        el._lazyObserver.unobserve(el)
      }
      // Reset to loading state
      el.src = 'https://placehold.co/800x600?text=Rose+Blog...'
      el.classList.remove('lazy-loaded')
      el.classList.add('lazy-loading')
      // Re-trigger observer
      if (el._lazyObserver) {
        el._lazyObserver.observe(el)
      }
    }
  },

  /**
   * Cleanup observer when element is destroyed.
   */
  unmounted(el) {
    if (el._lazyObserver) {
      el._lazyObserver.unobserve(el)
      delete el._lazyObserver
    }
  },
}
