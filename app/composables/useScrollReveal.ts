export function useScrollReveal() {
  function createObserver(el: HTMLElement, options?: { threshold?: number; rootMargin?: string }) {
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('revealed')
      return null
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: options?.threshold ?? 0.1, rootMargin: options?.rootMargin ?? '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return observer
  }

  function vReveal() {
    return {
      mounted(el: HTMLElement, binding?: any) {
        const delay = binding?.value?.delay ?? 0
        const direction = binding?.value?.direction ?? 'up'
        el.classList.add('scroll-reveal', `reveal-${direction}`)
        if (delay) el.style.transitionDelay = `${delay}ms`
        createObserver(el)
      }
    }
  }

  return { createObserver, vReveal }
}
