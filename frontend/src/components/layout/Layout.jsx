import React from 'react'
import Header from './Header'
import Footer from './Footer'
import ScrollProgress from '../ui/ScrollProgress'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ScrollProgress />
    </div>
  )
}

export default Layout
