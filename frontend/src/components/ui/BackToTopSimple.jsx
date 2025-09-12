import React, { useState, useEffect } from 'react'
import { ArrowUpIcon } from '../icons'

const BackToTopSimple = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 400)
    }

    const throttledToggleVisibility = throttle(toggleVisibility, 100)
    window.addEventListener('scroll', throttledToggleVisibility)

    return () => {
      window.removeEventListener('scroll', throttledToggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Fonction de throttle pour optimiser les performances
  function throttle(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed cursor-pointer bottom-8 right-8 z-50 p-2 bg-blue-300 hover:bg-blue-200 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-soni-navy/30 ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-12 opacity-0 scale-90 pointer-events-none'
      }`}
      aria-label="Retour en haut de la page"
    >
      <ArrowUpIcon className="w-5 h-5" />
    </button>
  )
}

export default BackToTopSimple
