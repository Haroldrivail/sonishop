import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { ShoppingCartIcon, ChevronDownIcon, MenuIcon } from '../icons'

function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cartItemsCount } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-soni-navy">
              SoniShop
            </Link>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-soni-orange px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Accueil
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-soni-orange px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Produits
            </Link>
            <Link 
              to="/categories" 
              className="text-gray-700 hover:text-soni-orange px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Catégories
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-soni-orange px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Contact
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Panier */}
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition">
              <ShoppingCartIcon />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="font-medium">{user?.name}</span>
                  <ChevronDownIcon />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mes commandes
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mes favoris
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Administration
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {/* Menu mobile ouvert */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/products"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Produits
              </Link>
              <Link
                to="/categories"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Catégories
              </Link>
              <Link
                to="/contact"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {!isAuthenticated && (
                <div className="border-t pt-4 mt-4">
                  <Link
                    to="/login"
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium transition mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
