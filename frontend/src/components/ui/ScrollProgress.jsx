import React, { useState, useEffect } from 'react'
import { ArrowUpIcon } from '../icons'

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (scrollPx / winHeightPx) * 100

      setScrollProgress(scrolled)
      setIsVisible(scrollPx > 300)
    }

    window.addEventListener('scroll', updateScrollProgress)
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const circumference = 2 * Math.PI * 15
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-all duration-300 transform ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-16 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="group relative w-12 h-12 bg-white hover:bg-gray-50 text-soni-navy rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-soni-navy/20"
        aria-label="Retour en haut"
      >
        {/* Cercle de progression SVG */}
        <svg 
          className="absolute inset-0 w-12 h-12 transform -rotate-90" 
          viewBox="0 0 48 48"
        >
          {/* Cercle de fond */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-200"
          />
          {/* Cercle de progression */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-soni-orange transition-all duration-300"
            style={{
              strokeDasharray,
              strokeDashoffset,
              strokeLinecap: 'round'
            }}
          />
        </svg>

        {/* Icône centrale */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ArrowUpIcon className="w-5 h-5 group-hover:animate-bounce transition-all duration-300" />
        </div>

        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-soni-orange/10 to-transparent rounded-full transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Retour en haut ({Math.round(scrollProgress)}%)
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  )
}

export default ScrollProgress
