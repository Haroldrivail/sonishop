import React, { useState, useEffect } from 'react'
import { ArrowUpIcon } from '../icons'

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Fonction pour détecter le scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Fonction pour remonter en haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div
      className={`fixed cursor-pointer bottom-8 right-8 z-50 transition-all duration-300 transform ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-16 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="cursor-pointer group relative bg-gradient-to-r from-soni-navy to-blue-700 hover:from-soni-navy/90 hover:to-blue-700/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-soni-navy/20"
        aria-label="Retour en haut"
      >
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        {/* Icône avec animation */}
        <ArrowUpIcon className="w-6 h-6 relative z-10 group-hover:animate-bounce" />
        
        {/* Badge avec compteur de scroll (optionnel) */}
        <div className="absolute -top-2 -right-2 bg-soni-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ↑
        </div>
      </button>

      {/* Indicateur de progression du scroll */}
      <div className="absolute -inset-1 bg-gradient-to-r from-soni-orange to-orange-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </div>
  )
}

export default BackToTop
