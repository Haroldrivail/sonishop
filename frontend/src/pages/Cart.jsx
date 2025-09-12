import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
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
    const {
        cart,
        cartItemsCount,
        cartTotal,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        pendingOpsCount,
        queueProcessing
    } = useCart()
    const { success } = useToast()

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return
        updateCartQuantity(id, newQuantity)
    }

    const removeItem = (id) => {
        removeFromCart(id)
    }

    const subtotal = cart.reduce((sum, item) => {
        const price = item.salePrice || item.price
        return sum + (price * item.quantity)
    }, 0)
    const shipping = subtotal > 65000 ? 0 : 6500 // Livraison gratuite à partir de 65 000 FCFA
    const total = subtotal + shipping

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
                        <p className="text-gray-600 mb-8">
                            Découvrez nos produits et ajoutez-les à votre panier pour voir vos articles ici.
                            <br />
                            <span className="text-sm text-gray-500 mt-2 block">
                                💡 Astuce : Utilisez les boutons "Ajouter au panier" sur les pages produits
                            </span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/products"
                                className="inline-flex items-center px-6 py-3 bg-soni-navy text-primary rounded-lg hover:bg-soni-navy/90 transition-colors font-semibold"
                            >
                                Voir nos produits
                                <ArrowRightIcon className="ml-2 w-5 h-5" />
                            </Link>
                            <Link
                                to="/categories"
                                className="inline-flex items-center px-6 py-3 border border-soni-navy text-soni-navy rounded-lg hover:bg-soni-navy/5 transition-colors font-semibold"
                            >
                                Parcourir les catégories
                            </Link>
                        </div>
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
                        <div className="flex items-center gap-4">
                            <Link
                                to="/products"
                                className="inline-flex items-center text-soni-navy hover:text-soni-navy/80 transition-colors mr-6"
                            >
                                <ChevronLeftIcon className="mr-2 w-5 h-5" />
                                Continuer mes achats
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900">Mon panier</h1>
                            {cart.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Vider complètement le panier ?')) {
                                            clearCart()
                                            success('Panier vidé')
                                        }
                                    }}
                                    className="ml-4 inline-flex items-center text-xs font-medium px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4 mr-1" /> Vider
                                </button>
                            )}
                            {(pendingOpsCount > 0 || queueProcessing) && (
                                <span className="ml-2 text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                                    Sync {queueProcessing ? '...' : pendingOpsCount}
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-600">
                            {cart.length} article{cart.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-8 xl:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-shadow hover:shadow-md">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                                    {/* Product Image */}
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden mx-auto sm:mx-0 ring-1 ring-gray-100">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0 w-full md:pr-4">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug md:max-w-[60%] xl:max-w-[65%]">
                                                {item.name}
                                            </h3>
                                            <div className="hidden md:flex items-center gap-2 flex-shrink-0 mt-1">
                                                <p className="price-fcfa-medium text-soni-navy tracking-tight">
                                                    {formatPrice(item.salePrice || item.price)}
                                                </p>
                                                {item.salePrice && item.price !== item.salePrice && (
                                                    <p className="text-xs text-gray-400 line-through">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-1 text-xs sm:text-sm text-gray-600 space-y-1">
                                            {item.category && (
                                                <p className="truncate">Catégorie: {item.category}</p>
                                            )}
                                            {item.description && (
                                                <p className="hidden xs:block text-[11px] sm:text-xs text-gray-500 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Mobile / Small Price + Quantity */}
                                        <div className="mt-3 flex md:hidden items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <p className="price-fcfa-small text-soni-navy font-semibold">
                                                    {formatPrice(item.salePrice || item.price)}
                                                </p>
                                                {item.salePrice && item.price !== item.salePrice && (
                                                    <p className="text-[11px] text-gray-400 line-through">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                                <button
                                                    aria-label="Diminuer la quantité"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1.5 hover:bg-gray-100 transition-colors"
                                                >
                                                    <MinusIcon className="w-4 h-4" />
                                                </button>
                                                <span className="px-2 text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    aria-label="Augmenter la quantité"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1.5 hover:bg-gray-100 transition-colors"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price / Quantity Controls (desktop & laptop) */}
                                    <div className="hidden md:flex items-stretch gap-4 ml-auto">
                                        <div className="flex flex-col justify-between items-end">
                                            <div className="flex items-center gap-2">
                                                <p className="price-fcfa-medium text-soni-navy font-semibold">
                                                    {formatPrice(item.salePrice || item.price)}
                                                </p>
                                                {item.salePrice && item.price !== item.salePrice && (
                                                    <p className="text-xs text-gray-400 line-through">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden mt-3">
                                                <button
                                                    aria-label="Diminuer la quantité"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                                >
                                                    <MinusIcon className="w-4 h-4" />
                                                </button>
                                                <span className="px-4 py-2 font-medium tabular-nums min-w-[2.5rem] text-center">{item.quantity}</span>
                                                <button
                                                    aria-label="Augmenter la quantité"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between items-center">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end"
                                                aria-label="Retirer l'article"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between sm:items-center">
                                    <span className="text-xs sm:text-sm text-gray-600">
                                        Sous-total ({item.quantity} {item.quantity > 1 ? 'articles' : 'article'})
                                    </span>
                                    <div className="flex justify-between sm:justify-end items-center w-full sm:w-auto">
                                        <span className="price-fcfa-medium text-gray-900">{formatPrice((item.salePrice || item.price) * item.quantity)}</span>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="sm:hidden ml-4 px-3 py-1.5 text-[11px] font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                                        >
                                            Retirer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6 order-first lg:order-none lg:sticky lg:top-6 h-fit">
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

                                <hr className="my-4" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="price-fcfa-large text-soni-navy">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Promo moved to checkout */}
                            <div className="mt-6 text-xs text-gray-500">Les codes promo s'appliquent maintenant lors du paiement.</div>

                            {/* Checkout Button */}
                            <Link 
                                to="/checkout"
                                className="group w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-soni-navy/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform active:scale-[0.98] hover:cursor-pointer my-2"
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
