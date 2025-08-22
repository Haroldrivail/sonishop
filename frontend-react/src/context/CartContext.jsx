import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

const IMAGE_BASE_URL = 'http://public.test/storage/';

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  // Charger les données du localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('sonishop_cart')
    const savedWishlist = localStorage.getItem('sonishop_wishlist')

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error)
      }
    }

    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist)
        setWishlist(parsedWishlist)
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error)
        setWishlist([])
      }
    } else {
      setWishlist([])
    }
  }, [])

  // Sauvegarder le panier dans le localStorage
  useEffect(() => {
    localStorage.setItem('sonishop_cart', JSON.stringify(cart))
  }, [cart])

  // Sauvegarder les favoris dans le localStorage
  useEffect(() => {
    localStorage.setItem('sonishop_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  // Fonctions du panier
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, {
        ...product,
        image: `${IMAGE_BASE_URL}${product.image}`,  // Transforme avant d’ajouter
        quantity
      }]
    })

    return true
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.salePrice || item.price
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Fonctions des favoris
  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev // Produit déjà dans les favoris
      }
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId))
  }

  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.find(item => item.id === product.id)
    if (isInWishlist) {
      removeFromWishlist(product.id)
      return false
    } else {
      addToWishlist(product)
      return true
    }
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId)
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  const value = {
    cart,
    cartItemsCount: getCartItemsCount(),
    cartTotal: getCartTotal(),

    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,

    wishlist,
    wishlistCount: wishlist.length,

    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext
