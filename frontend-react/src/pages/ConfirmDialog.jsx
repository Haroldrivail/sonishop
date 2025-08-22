import React, { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import axios from '../axios'


export default function ConfirmDialog({
    showConfirmDialog,
    setShowConfirmDialog,
    orderNumber,
    userInfo,
    deliveryOptions,
    deliveryMode,
    getEstimatedDeliveryDate,
    cart,
    subtotal,
    shipping,
    total,
    formatPrice,
    clearCart,
    showSuccess,
    showError,
    navigate,
    paymentMethod,  // ← ajouté ici

}) {
    const [isProcessing, setIsProcessing] = useState(false)

    if (!showConfirmDialog) return null

    const handleFinalizeOrder = async () => {
console.log('paymentMethod:', paymentMethod);

        setIsProcessing(true)

        try {
            const orderPayload = {
                user_id: userInfo.id || null,
                customer_name: `${userInfo.firstName} ${userInfo.lastName}`,
                email: userInfo.email,
                phone: userInfo.phone,
                address: `${userInfo.address}, ${userInfo.city}, ${userInfo.postalCode}, ${userInfo.country}`,
                amount: total,
                status: 'pending',
                delivery_mode: deliveryMode,
                payment_method: paymentMethod,   // ← ajouté ici
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.salePrice || item.price,
                })),
                date: new Date().toISOString(),
            }

            const response = await axios.post('/orders', orderPayload, {
                headers: { 'Content-Type': 'application/json' },
            })

            clearCart()
            showSuccess('Commande confirmée avec succès !')
            navigate('/order-tracking', { state: { orderId: response.data.order_number || orderNumber } })

        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Erreur lors de la création de la commande'
            showError(message)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">📋 Bon de commande #{orderNumber}</h2>
                    <button
                        onClick={() => setShowConfirmDialog(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Détails de la commande */}
                <div className="space-y-6">
                    {/* Informations client */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-3">👤 Informations client</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Nom:</span> {userInfo.firstName} {userInfo.lastName}
                            </div>
                            <div>
                                <span className="font-medium">Email:</span> {userInfo.email}
                            </div>
                            <div>
                                <span className="font-medium">Téléphone:</span> {userInfo.phone}
                            </div>
                            <div className="col-span-2">
                                <span className="font-medium">Adresse:</span> {userInfo.address}, {userInfo.city}
                            </div>
                        </div>
                    </div>

                    {/* Mode de livraison */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-3">🚚 Livraison</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-xl mr-2">{deliveryOptions[deliveryMode].icon}</span>
                                <div>
                                    <div className="font-medium">{deliveryOptions[deliveryMode].label}</div>
                                    <div className="text-sm text-gray-600">
                                        {deliveryMode === 'pickup'
                                            ? 'Retrait immédiat'
                                            : `Livraison estimée: ${getEstimatedDeliveryDate()}`}
                                    </div>
                                </div>
                            </div>
                            <div className="font-semibold">
                                {shipping === 0 ? 'Gratuit' : formatPrice(shipping)}
                            </div>
                        </div>
                    </div>

                    {/* Méthode de paiement */}
                    <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                        <h3 className="font-semibold mb-3">💳 Méthode de paiement</h3>
                        <p className="text-gray-800 capitalize">{(paymentMethod || '').replace(/_/g, ' ')}</p>
                    </div>


                    {/* Articles commandés */}
                    <div>
                        <h3 className="font-semibold mb-3">🛍️ Articles commandés</h3>
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-soni-navy">
                                        {formatPrice((item.salePrice || item.price) * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-soni-navy/5 rounded-lg p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Sous-total:</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Livraison:</span>
                                <span>{shipping === 0 ? 'Gratuit' : formatPrice(shipping)}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total à payer:</span>
                                <span className="text-soni-navy">{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => setShowConfirmDialog(false)}
                        className="flex-1 py-3 border border-gray-300 text-white font-semibold rounded-lg bg-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                        Modifier les informations
                    </button>
                    <button
                        onClick={handleFinalizeOrder}
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {isProcessing ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Finalisation...
                            </div>
                        ) : (
                            '✅ Confirmer la commande'
                        )}
                    </button>

                </div>
            </div>
        </div>
    )
}
