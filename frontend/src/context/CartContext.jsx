import React, { createContext, useContext, useState, useEffect, useCallback, useReducer, useRef } from 'react'
import { api } from '../api/client'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  // --- Reducer (a) ---
  const initialState = {
    cart: [],
    lastSyncAt: null,
    clearedAt: null,
    version: 1,
    pendingOps: [], // { id: string, type:'add'|'update'|'remove'|'clear', productId, quantity?, createdAt }
    processingQueue: false,
  }

  const reducer = (state, action) => {
    switch (action.type) {
      case 'INIT_FROM_STORAGE':
        return { ...state, cart: action.payload || [] }
      case 'SET_REMOTE_CART':
        return { ...state, cart: action.payload, lastSyncAt: Date.now() }
      case 'ADD_ITEM': {
        const { product, quantity } = action.payload
        const existing = state.cart.find(i => i.id === product.id)
        let next
        if (existing) {
          next = state.cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        } else {
          next = [...state.cart, { ...product, quantity }]
        }
        return { ...state, cart: next }
      }
      case 'UPDATE_QTY': {
        const { productId, quantity } = action.payload
        if (quantity <= 0) {
          return { ...state, cart: state.cart.filter(i => i.id !== productId) }
        }
        return { ...state, cart: state.cart.map(i => i.id === productId ? { ...i, quantity } : i) }
      }
      case 'REMOVE_ITEM':
        return { ...state, cart: state.cart.filter(i => i.id !== action.payload) }
      case 'CLEAR_CART':
  return { ...state, cart: [], pendingOps: [], clearedAt: Date.now() }
      case 'QUEUE_OP':
        return { ...state, pendingOps: [...state.pendingOps, action.payload] }
      case 'DEQUEUE_OP': {
        return { ...state, pendingOps: state.pendingOps.filter(op => op.id !== action.payload) }
      }
      case 'SET_QUEUE_PROCESSING':
        return { ...state, processingQueue: action.payload }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)
  // cart items: { id (productId), itemId?, quantity, price, salePrice, image, name, ... }
  const cart = state.cart
  const pendingOps = state.pendingOps
  const [wishlist, setWishlist] = useState([])
  const [wishlistLoaded, setWishlistLoaded] = useState(false)

  const isAuthenticated = () => !!localStorage.getItem('token')

  // ---- Remote cart mapping helpers ----
  const mapServerCartItem = useCallback((it) => {
    const product = it.product || {}
    const snap = it.product_snapshot || {}
    const basePrice = product.price ?? snap.price
    return {
      itemId: it.id,
      id: product.id || it.product_id, // maintain existing interface (id = productId)
      productId: product.id || it.product_id,
      name: product.name || snap.name,
      price: product.price || snap.price || basePrice,
      salePrice: product.sale_price || product.salePrice || null,
      image: product.image_url || product.image || null,
      description: product.description || '',
      quantity: it.quantity,
      inStock: product.in_stock !== undefined ? product.in_stock : true,
      isNew: product.is_new,
      freeShipping: product.free_shipping,
      category: product.category?.slug || product.category_id,
    }
  }, [])

  const refreshRemoteCart = useCallback(async () => {
    if (!isAuthenticated()) return
    try {
      const res = await api.cart.get()
      const serverCart = res.data?.data
      if (serverCart?.items) {
        const mapped = serverCart.items.map(mapServerCartItem)
        dispatch({ type: 'SET_REMOTE_CART', payload: mapped })
      }
    } catch (err) {
      console.warn('Impossible de charger le panier distant:', err?.response?.status || err.message)
    }
  }, [mapServerCartItem])

  // --- Persistence pending ops ---
  useEffect(() => {
    try { localStorage.setItem('sonishop_cart_ops', JSON.stringify(pendingOps)) } catch (_) {}
  }, [pendingOps])

  useEffect(() => {
    const savedOps = localStorage.getItem('sonishop_cart_ops')
    if (savedOps) {
      try {
        const arr = JSON.parse(savedOps)
        if (Array.isArray(arr) && arr.length) {
          // réinjecter (éviter doublons id)
          arr.forEach(op => dispatch({ type: 'QUEUE_OP', payload: op }))
        }
      } catch (e) { console.error('Ops LS parse', e) }
    }
  }, [])

  // Helper pour créer un op
  const enqueueOp = (op) => {
    const withId = { id: op.id || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, createdAt: Date.now(), ...op }
    dispatch({ type: 'QUEUE_OP', payload: withId })
  }

  const processQueueRef = useRef(false)
  const processQueue = useCallback(async () => {
    if (!isAuthenticated()) return
    if (processQueueRef.current) return
    if (!pendingOps.length) return
    processQueueRef.current = true
    dispatch({ type: 'SET_QUEUE_PROCESSING', payload: true })
    try {
      for (const op of pendingOps) {
        try {
          if (op.type === 'add') {
            await api.cart.addItem(op.productId, op.quantity || 1)
          } else if (op.type === 'update') {
            // trouver itemId actuel (après éventuels ajouts précédents)
            const current = cart.find(i => i.id === op.productId)
            if (current?.itemId) {
              await api.cart.updateItem(current.itemId, op.quantity)
            } else {
              // si itemId absent, tenter addItem pour refléter qty (fallback)
              await api.cart.addItem(op.productId, op.quantity)
            }
          } else if (op.type === 'remove') {
            const current = cart.find(i => i.id === op.productId)
            if (current?.itemId) await api.cart.removeItem(current.itemId)
          } else if (op.type === 'clear') {
            if (api.cart.sync) await api.cart.sync([])
          }
          dispatch({ type: 'DEQUEUE_OP', payload: op.id })
        } catch (innerErr) {
          console.warn('Échec op queue, arrêt temporaire', op, innerErr?.response?.status || innerErr.message)
          break // sortir pour retry plus tard
        }
      }
      await refreshRemoteCart()
    } finally {
      processQueueRef.current = false
      dispatch({ type: 'SET_QUEUE_PROCESSING', payload: false })
    }
  }, [pendingOps, cart, refreshRemoteCart])

  // Traiter la queue quand auth ou quand pendingOps change
  useEffect(() => {
    if (isAuthenticated() && pendingOps.length) {
      processQueue()
    }
  }, [pendingOps, processQueue])

  // Rejouer à l'événement online
  useEffect(() => {
    const onOnline = () => { processQueue() }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [processQueue])

  // Map produit backend -> objet frontend minimal (aligné sur Products.jsx)
  const mapApiProduct = (p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    salePrice: p.sale_price,
    image: p.image_url || p.image,
    description: p.description,
    rating: p.rating,
    reviews: p.reviews_count,
    inStock: p.in_stock,
    isNew: p.is_new,
    freeShipping: p.free_shipping,
    category: p.category?.slug || p.category?.name || p.category_id,
  })

  // Initial load: local storage (fallback) + remote cart if authenticated
  useEffect(() => {
    const savedCart = localStorage.getItem('sonishop_cart')
    const savedWishlist = localStorage.getItem('sonishop_wishlist')
    if (savedCart) {
      try { dispatch({ type: 'INIT_FROM_STORAGE', payload: JSON.parse(savedCart) }) } catch (e) { console.error('Cart LS parse', e) }
    }
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)) } catch (e) { console.error('Wishlist LS parse', e) }
    }
    // remote cart fetch
    refreshRemoteCart()
  }, [refreshRemoteCart])

  // Charger la wishlist depuis l'API si authentifié
  useEffect(() => {
    const loadRemoteWishlist = async () => {
      if (!isAuthenticated() || wishlistLoaded) return
      try {
        const res = await api.wishlist.getAll()
        if (res.data?.data) {
          const mapped = res.data.data.map(mapApiProduct)
          setWishlist(mapped)
        }
      } catch (err) {
        // En cas d'erreur (ex: 401), on reste sur la version locale silencieusement
        console.warn('Impossible de charger la wishlist distante:', err?.response?.status || err.message)
      } finally {
        setWishlistLoaded(true)
      }
    }
    loadRemoteWishlist()
  }, [wishlistLoaded])

  // Sauvegarder le panier dans le localStorage
  useEffect(() => {
    localStorage.setItem('sonishop_cart', JSON.stringify(state.cart))
  }, [state.cart])

  // Sauvegarder les favoris dans le localStorage
  useEffect(() => {
    localStorage.setItem('sonishop_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  // Fonctions du panier
  const addToCart = async (product, quantity = 1) => { // (b)
    if (!product) return false
    if (isAuthenticated()) {
      try {
        await api.cart.addItem(product.id, quantity)
        await refreshRemoteCart() // ce call mettra à jour via SET_REMOTE_CART
        return true
      } catch (err) {
        console.warn('Erreur API addToCart, fallback local', err)
        enqueueOp({ type: 'add', productId: product.id, quantity })
      }
    }
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } })
    return true
  }

  const removeFromCart = async (productId) => {
    if (isAuthenticated()) {
      const item = cart.find(i => i.id === productId)
      if (item?.itemId) {
        try { await api.cart.removeItem(item.itemId); await refreshRemoteCart(); dispatch({ type: 'REMOVE_ITEM', payload: productId }); return } catch (e) { console.warn('API removeItem échec, fallback local'); enqueueOp({ type: 'remove', productId }) }
      } else {
        enqueueOp({ type: 'remove', productId })
      }
    }
  dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const updateCartQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }
    if (isAuthenticated()) {
      const item = cart.find(i => i.id === productId)
      if (item?.itemId) {
        try { await api.cart.updateItem(item.itemId, quantity); await refreshRemoteCart(); dispatch({ type: 'UPDATE_QTY', payload: { productId, quantity } }); return } catch (e) { console.warn('API updateItem échec, fallback local'); enqueueOp({ type: 'update', productId, quantity }) }
      } else {
        enqueueOp({ type: 'update', productId, quantity })
      }
    }
  dispatch({ type: 'UPDATE_QTY', payload: { productId, quantity } })
  }

  const clearCart = async () => { // (b)
    if (isAuthenticated()) {
      try {
        if (api.cart.sync) {
          await api.cart.sync([])
        } else {
          const itemsSnapshot = [...cart]
          for (const it of itemsSnapshot) {
            if (it.itemId) {
              try { await api.cart.removeItem(it.itemId) } catch (_) { enqueueOp({ type: 'remove', productId: it.id }) }
            }
          }
        }
      } catch (err) {
        console.warn('Échec clear cart distant, on planifie les ops restantes:', err?.response?.status || err.message)
        enqueueOp({ type: 'clear' })
      }
    } else {
      enqueueOp({ type: 'clear' })
    }
    dispatch({ type: 'CLEAR_CART' })
    try {
      localStorage.removeItem('sonishop_cart')
      localStorage.removeItem('sonishop_cart_ops')
    } catch (_) {}
  }

  const getCartTotal = () => {
    return state.cart.reduce((total, item) => {
      const price = item.salePrice || item.price
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartItemsCount = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Fonctions des favoris
  const addToWishlist = async (product) => {
    if (!isAuthenticated()) {
      // Local only mode
      setWishlist(prev => prev.find(i => i.id === product.id) ? prev : [...prev, product])
      return { attached: true, localOnly: true }
    }
    const res = await api.wishlist.toggle(product.id)
    const attached = res.data?.attached
    if (attached) {
      setWishlist(prev => prev.find(i => i.id === product.id) ? prev : [...prev, product])
    }
    return { attached }
  }

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated()) {
      setWishlist(prev => prev.filter(item => item.id !== productId))
      return { attached: false, localOnly: true }
    }
    const res = await api.wishlist.toggle(productId)
    const attached = res.data?.attached
    if (attached === false) {
      setWishlist(prev => prev.filter(item => item.id !== productId))
    }
    return { attached }
  }

  const toggleWishlist = async (product) => {
    if (!isAuthenticated()) {
      const exists = wishlist.some(i => i.id === product.id)
      if (exists) {
        setWishlist(prev => prev.filter(i => i.id !== product.id))
        return { attached: false, localOnly: true }
      }
      setWishlist(prev => [...prev, product])
      return { attached: true, localOnly: true }
    }
    try {
      const res = await api.wishlist.toggle(product.id)
      const attached = res.data?.attached
      if (attached === true) {
        setWishlist(prev => prev.find(i => i.id === product.id) ? prev : [...prev, product])
      } else if (attached === false) {
        setWishlist(prev => prev.filter(i => i.id !== product.id))
      }
      return { attached }
    } catch (err) {
      console.error('Erreur API wishlist:', err)
      return { attached: wishlist.some(i => i.id === product.id) }
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
  pendingOpsCount: pendingOps.length,
  queueProcessing: state.processingQueue,
  forceProcessQueue: processQueue,
    
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
