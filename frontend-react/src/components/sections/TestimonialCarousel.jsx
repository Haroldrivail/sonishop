import React, { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '../icons'

const TestimonialCarousel = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Marie Dubois',
      role: 'Développeuse Web',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
      rating: 5,
      text: 'Service client exceptionnel et produits de qualité. Mon MacBook Pro est arrivé en parfait état avec une livraison ultra rapide. Je recommande vivement SoniShop !',
      product: 'MacBook Pro 16"'
    },
    {
      id: 2,
      name: 'Jean Kouame',
      role: 'Ingénieur Réseau',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 5,
      text: 'Excellent choix d\'équipements réseau professionnels. L\'équipe technique m\'a parfaitement conseillé pour mon infrastructure. Très satisfait de mon achat !',
      product: 'Switch Gigabit 24 ports'
    },
    {
      id: 3,
      name: 'Fatou Traore',
      role: 'Graphiste',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 5,
      text: 'iPad Pro parfait pour mes créations graphiques. La qualité de l\'écran est exceptionnelle et les performances sont au rendez-vous. Un investissement qui en vaut la peine !',
      product: 'iPad Pro 12.9"'
    },
    {
      id: 4,
      name: 'Ahmed Diallo',
      role: 'Étudiant en Informatique',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 5,
      text: 'Prix compétitifs et large gamme de produits. J\'ai trouvé mon smartphone idéal avec un excellent rapport qualité-prix. Le processus d\'achat est très fluide.',
      product: 'Samsung Galaxy S24'
    },
    {
      id: 5,
      name: 'Aicha Cisse',
      role: 'Chef d\'Entreprise',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rating: 5,
      text: 'Équipé toute mon équipe chez SoniShop. Service professionnel, conseils personnalisés et suivi post-vente impeccable. Une référence dans le domaine !',
      product: 'Dell XPS 13'
    }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Auto-rotation toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [])

  const renderStars = (rating) => {
    return (
      <div className="flex items-center justify-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <section className="py-16 bg-blue-50 w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Nos Clients Témoignent
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez ce que disent nos clients satisfaits de leur expérience SoniShop
          </p>
        </div>

        {/* Carrousel de témoignages */}
        <div className="relative w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 text-center relative overflow-hidden w-full">
            
            {/* Décoration de fond */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-soni-orange/10 to-transparent rounded-full transform -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-soni-navy/10 to-transparent rounded-full transform translate-x-16 translate-y-16"></div>
            
            {/* Contenu du témoignage */}
            <div className="relative z-10">
              {/* Avatar */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Étoiles */}
              {renderStars(testimonials[currentTestimonial].rating)}

              {/* Texte du témoignage */}
              <blockquote className="text-lg lg:text-xl text-gray-700 mb-6 leading-relaxed italic">
                "{testimonials[currentTestimonial].text}"
              </blockquote>

              {/* Informations du client */}
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-1">
                  {testimonials[currentTestimonial].name}
                </h4>
                <p className="text-gray-600 mb-2">
                  {testimonials[currentTestimonial].role}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
                  <span>Produit acheté :</span>
                  <span className="font-medium text-soni-navy">
                    {testimonials[currentTestimonial].product}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons de navigation */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-50 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-soni-navy hover:shadow-xl transition-all duration-300"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-50 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-soni-navy hover:shadow-xl transition-all duration-300"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Indicateurs de pagination */}
        <div className="flex justify-center mt-8 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentTestimonial
                  ? 'bg-blue-500 scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Statistiques de satisfaction */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-soni-navy mb-2">4.9/5</div>
            <div className="text-gray-600">Note moyenne</div>
            <div className="flex justify-center mt-2">
              {renderStars(5)}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-soni-orange mb-2">1,250+</div>
            <div className="text-gray-600">Avis clients</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600">Clients satisfaits</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialCarousel
