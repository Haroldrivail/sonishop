import React, { useState } from 'react'

const improvementsData = {
    overview: {
        title: 'Améliorations - Vue d\'ensemble',
        tasks: [
            'Rien a modifier des que tout modifier je supprime cette page',
        ]
    },
    analytics: {
        title: 'Améliorations - Analytiques',
        tasks: []
    },
    orders: {
        title: 'Améliorations - Gestion des Commandes',
        tasks: [
            'Ajouter un filtre par statut (en cours, livré, annulé)',
            'Modifier (à faire plus tard) Le bouton existe, mais il ne fait encore rien',
            'Imprimer les commandes	Bientôt (le bouton existe, logique à ajouter)',
            'Notifications email ou SMS lors d un changement de statut'
        
        ]
    },
    products: {
        title: 'Améliorations - Gestion des Produits',
        tasks: [
            'Afficher la quantité restante en stock',
            'Mettre en place un filtre par catégorie',
            'Afficher les produits en rupture de stock',
            'Permettre l’import/export en CSV',
            'ajouter un systeme de notification pour les actions importantes',
           ' Ajouter la suppression des produits (le bouton TrashIcon est cliquable mais inactif actuellement)',
            'Ajouter un système de pagination pour les produits',
'Ajouter des filtres avancés quand on clique sur "Filtres avancés',
'Ajouter un système de tags ou labels personnalisés sur les produits',
'Optimiser la performance ou structurer le code différemment (ex: séparer les composants)',
'Ajouter des notifications/toasts au succès ou à l’échec d’une action (ajout, édition, suppression)',
'Intégrer un loader/spinner pendant le chargement des données',
'Tu crées une interface qui affiche toutes les images uploadées',
'Tu ajoutes une API pour récupérer/supprimer ces images',
'Tu peux appeler cette page depuis un bouton dans ton admin pour gérer les images orphelines',
'Tu évites ainsi que des images inutilisées s’accumulent.',
'Ajouter un système de nettoyage automatique des images non utilisées',
        ]
    },
    customers: {
        title: 'Améliorations - Gestion des Clients',
        tasks: [
            'Compter les clients actifs (`activeCustomers`) et VIP (`vipCustomers`)',
            'Implémenter la logique de filtrage par statut (`statuses`)',
            'Calculer le chiffre d\'affaires total (`totalRevenue`)',
            'Désactiver process.env avec define:\'process.env\': {} pour éviter les erreurs',
            '🕓 Laisser "Dernière connexion" comme À implémenter jusqu’à la gestion des sessions',
            'S assurer que l ajoutla modification et la suppression des clients est bien pris en compte',
            'Ajouter un système de notification pour toutes les actions importantes',
        ]
    },
    reports: {
        title: 'Améliorations - Rapports',
        tasks: []
    },
    improvements: {
        title: 'Améliorations - Améliorations',
        tasks: []
    },
    settings: {
        title: 'Améliorations - Paramètres',
        tasks: []
    },
    notifications: {
        title: 'Améliorations - Notifications',
        tasks: []
    }
}

const Improvements = () => {
    const [selectedPage, setSelectedPage] = useState(null)

    const handleOpen = (key) => setSelectedPage(key)
    const handleClose = () => setSelectedPage(null)

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🔧 Améliorations par Module</h2>

            <div className="space-y-4">
                {Object.keys(improvementsData).map((key) => (
                    <button
                        key={key}
                        onClick={() => handleOpen(key)}
                        className="w-full text-left px-5 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold shadow-sm transition-all"
                    >
                        {improvementsData[key].title}
                    </button>
                ))}
            </div>

            {/* Modale */}
            {selectedPage && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">
                            {improvementsData[selectedPage].title}
                        </h3>
                        {improvementsData[selectedPage].tasks.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                                {improvementsData[selectedPage].tasks.map((task, i) => (
                                    <li key={i}>{task}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">Aucune amélioration définie pour cette page.</p>
                        )}
                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
                            aria-label="Fermer la modale"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Improvements
