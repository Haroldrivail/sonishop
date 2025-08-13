import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, TagIcon, TruckIcon, ClockIcon } from '../icons'

const SpecialOffers = () => {
  const offers = [
    {
      id: 1,
      title: 'Offre Flash',
      subtitle: 'Jusqu\'à -50% sur les smartphones',
      description: 'Profitez de nos prix exceptionnels sur une sélection de smartphones haut de gamme.',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
      badge: 'Flash Sale',
      discount: '50%',
      timeLeft: '2j 14h 32m',
      bgGradient: 'from-red-500 to-pink-600',
      link: '/products?category=smartphones',
      features: ['Livraison gratuite', 'Garantie 2 ans', 'SAV premium']
    },
    {
      id: 2,
      title: 'Nouveau Arrivage',
      subtitle: 'MacBook Pro M3 disponible',
      description: 'Découvrez les nouveaux MacBook Pro avec la puce M3 révolutionnaire.',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
      badge: 'Nouveau',
      discount: null,
      timeLeft: null,
      bgGradient: 'from-blue-600 to-purple-600',
      link: '/products?category=laptops',
      features: ['Puce M3 Pro', 'Écran Liquid Retina', 'Autonomie 22h']
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Offres Spéciales
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ne manquez pas nos promotions exceptionnelles et nos dernières nouveautés
          </p>
        </div>

        {/* Grille des offres */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {offers.map(offer => (
            <div
              key={offer.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform "
            >
              {/* Image de fond */}
              <div className="relative h-64 lg:h-80 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay avec gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${offer.bgGradient} opacity-85 group-hover:opacity-75 transition-opacity duration-300`}></div>
                
                {/* Badge */}
                <div className="absolute top-6 left-6">
                  <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    {offer.badge}
                  </div>
                </div>

                {/* Discount (si applicable) */}
                {offer.discount && (
                  <div className="absolute top-6 right-6">
                    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-lg font-bold">
                      -{offer.discount}
                    </div>
                  </div>
                )}

                {/* Contenu principal */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <h3 className="text-3xl font-bold mb-2 transform group-hover:translate-y-0 transition-transform duration-300">
                    {offer.title}
                  </h3>
                  <h4 className="text-xl mb-3 transform group-hover:translate-y-0 transition-transform duration-300">
                    {offer.subtitle}
                  </h4>
                  <p className="text-white/90 mb-4 transform group-hover:translate-y-0 transition-transform duration-300">
                    {offer.description}
                  </p>

                  {/* Compte à rebours (si applicable) */}
                  {offer.timeLeft && (
                    <div className="flex items-center gap-2 mb-4 text-sm bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                      <ClockIcon className="w-4 h-4" />
                      <span>Se termine dans : {offer.timeLeft}</span>
                    </div>
                  )}

                  {/* Fonctionnalités */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {offer.features.map((feature, index) => (
                      <div
                        key={index}
                        className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Bouton d'action */}
                  <Link
                    to={offer.link}
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 transform group-hover:scale-105 w-fit"
                  >
                    {offer.discount ? 'Profiter de l\'offre' : 'Découvrir'}
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bannière promotionnelle supplémentaire */}
        <div className="mt-16 bg-blue-700 to-soni-orange rounded-3xl p-8 lg:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <TruckIcon className="w-16 h-16 mx-auto mb-6 text-white/80" />
            <h3 className="text-xl lg:text-3xl font-bold mb-4">
              Livraison Gratuite
            </h3>
            <p className="text-lg text-white/90 mb-6">
              Profitez de la livraison gratuite sur toutes vos commandes de plus de 50 000 FCFA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Livraison en 24-48h</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Suivi en temps réel</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Emballage sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SpecialOffers
