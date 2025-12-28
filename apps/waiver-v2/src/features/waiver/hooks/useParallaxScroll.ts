import { useEffect, useState } from 'react'

/**
 * Hook for parallax scroll effect with reduced motion support
 * Returns scroll offset that can be used for subtle background drift
 */
export const useParallaxScroll = (intensity: number = 0.5) => {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    if (mediaQuery.matches) {
      setOffset(0)
      return
    }

    let rafId: number | null = null
    let isActive = true

    const handleScroll = () => {
      if (!isActive) return
      const scrollY = window.scrollY || window.pageYOffset
      setOffset(scrollY * intensity)
    }

    // Use requestAnimationFrame for smooth, performant updates
    const onScroll = () => {
      if (!isActive) return
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      rafId = requestAnimationFrame(handleScroll)
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        isActive = false
        setOffset(0)
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
          rafId = null
        }
      } else {
        isActive = true
        handleScroll()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    mediaQuery.addEventListener('change', handleChange)
    handleScroll() // Initial calculation

    return () => {
      isActive = false
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [intensity])

  return offset
}

