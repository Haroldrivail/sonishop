import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

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

  // Produits de démonstration pour la wishlist
  const demoProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 915000,
      salePrice: 850000,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      description: 'Le smartphone le plus avancé d\'Apple avec puce A17 Pro et caméra révolutionnaire.',
      rating: 4.8,
      reviews: 324,
      inStock: true,
      brand: 'Apple',
      category: 'smartphones'
    },
    {
      id: 5,
      name: 'MacBook Pro M3',
      price: 1635000,
      salePrice: 1200000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      description: 'Ordinateur portable professionnel avec puce M3 Pro pour les créatifs.',
      rating: 4.9,
      reviews: 156,
      inStock: true,
      brand: 'Apple',
      category: 'laptops'
    }
  ]

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
        setWishlist(parsedWishlist.length > 0 ? parsedWishlist : demoProducts)
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error)
        setWishlist(demoProducts)
      }
    } else {
      // Si pas de favoris sauvegardés, utiliser les produits de démonstration
      setWishlist(demoProducts)
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
      return [...prev, { ...product, quantity }]
    })
    
    // Notification de succès
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
      return false // Retiré des favoris
    } else {
      addToWishlist(product)
      return true // Ajouté aux favoris
    }
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId)
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  const value = {
    // État du panier
    cart,
    cartItemsCount: getCartItemsCount(),
    cartTotal: getCartTotal(),
    
    // Actions du panier
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    
    // État des favoris
    wishlist,
    wishlistCount: wishlist.length,
    
    // Actions des favoris
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
