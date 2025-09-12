/**
 * Utilitaires pour le formatage des devises et nombres dans SoniShop
 * Utilise les Francs CFA (XAF) comme devise principale
 */

/**
 * Formate un prix en Francs CFA
 * @param {number} price - Le prix à formater
 * @param {object} options - Options de formatage
 * @returns {string} Prix formaté en FCFA
 */
export const formatPrice = (price, options = {}) => {
    const defaultOptions = {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...options
    }

    return new Intl.NumberFormat('fr-FR', defaultOptions).format(price)
}

/**
 * Formate un prix simple sans symbole de devise
 * @param {number} price - Le prix à formater
 * @returns {string} Prix formaté + "FCFA"
 */
export const formatPriceSimple = (price) => {
    return `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`
}

/**
 * Formate un pourcentage
 * @param {number} value - La valeur du pourcentage
 * @param {number} decimals - Nombre de décimales (défaut: 1)
 * @returns {string} Pourcentage formaté
 */
export const formatPercentage = (value, decimals = 1) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Formate un nombre avec des séparateurs de milliers
 * @param {number} number - Le nombre à formater
 * @returns {string} Nombre formaté
 */
export const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number)
}

/**
 * Convertit un prix d'euros vers FCFA (taux de change fixe pour simulation)
 * @param {number} euroPrice - Prix en euros
 * @param {number} rate - Taux de change (défaut: 655.957 FCFA pour 1 EUR)
 * @returns {number} Prix en FCFA
 */
export const convertEuroToFCFA = (euroPrice, rate = 655.957) => {
    return Math.round(euroPrice * rate)
}

/**
 * Validation et nettoyage d'un prix
 * @param {number|string} price - Prix à valider
 * @returns {number} Prix valide ou 0
 */
export const validatePrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) || numPrice < 0 ? 0 : numPrice
}

/**
 * Constantes utiles pour les prix
 */
export const CURRENCY_CONFIG = {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'Franc CFA',
    locale: 'fr-FR'
}

/**
 * Exemples de prix courants en FCFA pour référence
 */
export const SAMPLE_PRICES = {
    smartphone_entry: 150000,      // 150 000 FCFA - Smartphone d'entrée de gamme
    smartphone_premium: 850000,    // 850 000 FCFA - iPhone/Samsung haut de gamme
    laptop_basic: 400000,          // 400 000 FCFA - Ordinateur portable de base
    laptop_gaming: 1200000,        // 1 200 000 FCFA - PC gaming haut de gamme
    headphones: 50000,             // 50 000 FCFA - Écouteurs Bluetooth
    accessories: 25000,            // 25 000 FCFA - Accessoires divers
    shipping_standard: 5000,       // 5 000 FCFA - Livraison standard
    shipping_express: 15000        // 15 000 FCFA - Livraison express
}
