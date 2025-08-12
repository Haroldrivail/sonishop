import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ShoppingCartIcon,
    TrashIcon,
    MinusIcon,
    PlusIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
    TruckIcon,
    ShieldCheckIcon
} from '../components/icons'

const Cart = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'iPhone 15 Pro Max',
            price: 850000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
            color: 'Titane naturel',
            storage: '256 GB'
        },
        {
            id: 2,
            name: 'AirPods Pro 2',
            price: 163000,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=200',
            color: 'Blanc',
            storage: null
        }
    ])

    const [promoCode, setPromoCode] = useState('')
    const [appliedPromo, setAppliedPromo] = useState(null)

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) {
            removeItem(id)
            return
        }
        setCartItems(items =>
            items.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        )
    }

    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id))
    }

    const applyPromoCode = () => {
        // Simulation de codes promo
        const validCodes = {
            'WELCOME10': { discount: 10, type: 'percentage' },
            'SAVE50': { discount: 50, type: 'fixed' }
        }

        if (validCodes[promoCode.toUpperCase()]) {
            setAppliedPromo({
                code: promoCode.toUpperCase(),
                ...validCodes[promoCode.toUpperCase()]
            })
        } else {
            alert('Code promo invalide')
        }
        setPromoCode('')
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = subtotal > 65000 ? 0 : 6500 // Livraison gratuite à partir de 65 000 FCFA
    const promoDiscount = appliedPromo
        ? appliedPromo.type === 'percentage'
            ? subtotal * (appliedPromo.discount / 100)
            : appliedPromo.discount * 655 // Convertir les codes promo en FCFA
        : 0
    const total = subtotal + shipping - promoDiscount

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
                        <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center px-6 py-3 bg-soni-navy text-white rounded-lg hover:bg-soni-navy/90 transition-colors font-semibold"
                        >
                            Voir nos produits
                            <ArrowRightIcon className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                to="/products"
                                className="inline-flex items-center text-soni-navy hover:text-soni-navy/80 transition-colors mr-6"
                            >
                                <ChevronLeftIcon className="mr-2 w-5 h-5" />
                                Continuer mes achats
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Mon panier</h1>
                        </div>
                        <div className="text-sm text-gray-600">
                            {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-start gap-4">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {item.name}
                                        </h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>Couleur: {item.color}</p>
                                            {item.storage && <p>Stockage: {item.storage}</p>}
                                        </div>
                                        <p className="price-fcfa-medium text-soni-navy mt-2">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-gray-100 transition-colors"
                                            >
                                                <MinusIcon className="w-4 h-4" />
                                            </button>
                                            <span className="px-4 py-2 font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-2 hover:bg-gray-100 transition-colors"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Sous-total ({item.quantity} {item.quantity > 1 ? 'articles' : 'article'})
                                    </span>
                                    <span className="price-fcfa-medium text-gray-900">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Sous-total</span>
                                    <span className="price-fcfa-small">{formatPrice(subtotal)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Livraison</span>
                                    <span className="price-fcfa-small">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">Gratuite</span>
                                        ) : (
                                            formatPrice(shipping)
                                        )}
                                    </span>
                                </div>

                                {appliedPromo && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Code promo ({appliedPromo.code})</span>
                                        <span className="price-fcfa-small">-{formatPrice(promoDiscount)}</span>
                                    </div>
                                )}

                                <hr className="my-4" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="price-fcfa-large text-soni-navy">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Code promo
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="WELCOME10"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
                                    />
                                    <button
                                        onClick={applyPromoCode}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Appliquer
                                    </button>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <Link 
                                to="/checkout"
                                className="block w-full mt-6 px-6 py-4 bg-gradient-to-r from-soni-navy to-blue-700 hover:from-soni-navy/90 hover:to-blue-700/90 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform text-center"
                            >
                                Procéder au paiement
                            </Link>
                        </div>

                        {/* Security & Shipping Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Avantages inclus</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <TruckIcon className="w-6 h-6 text-soni-orange" />
                                    <div>
                                        <div className="font-medium text-sm">Livraison gratuite</div>
                                        <div className="text-xs text-gray-600">
                                            {subtotal > 65000 ? 'Éligible' : `Manque ${formatPrice(65000 - subtotal)}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldCheckIcon className="w-6 h-6 text-soni-orange" />
                                    <div>
                                        <div className="font-medium text-sm">Paiement sécurisé</div>
                                        <div className="text-xs text-gray-600">Cryptage SSL 256 bits</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Continue Shopping */}
                        <div className="text-center">
                            <Link
                                to="/products"
                                className="inline-flex items-center text-soni-navy hover:text-soni-navy/80 transition-colors font-medium"
                            >
                                <ChevronLeftIcon className="mr-2 w-4 h-4" />
                                Continuer mes achats
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
