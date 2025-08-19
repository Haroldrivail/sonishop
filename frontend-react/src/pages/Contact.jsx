import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, MailIcon, UserIcon, CheckIcon } from '../components/icons'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulation d'envoi - remplacer par l'API réelle
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: MailIcon,
      title: 'Email',
      content: 'support@sonishop.com',
      subtitle: 'Nous répondons sous 24h'
    },
    {
      icon: UserIcon,
      title: 'Support Client',
      content: '+33 1 23 45 67 89',
      subtitle: 'Lun-Ven 9h-18h'
    },
    {
      icon: CheckIcon,
      title: 'Chat en Direct',
      content: 'Disponible maintenant',
      subtitle: 'Support instantané'
    }
  ]

  const faqs = [
    {
      question: 'Comment puis-je suivre ma commande ?',
      answer: 'Vous recevrez un email de confirmation avec un lien de suivi dès l\'expédition de votre commande.'
    },
    {
      question: 'Quels sont les délais de livraison ?',
      answer: 'Livraison standard sous 3-5 jours ouvrés, express sous 24-48h selon votre localisation.'
    },
    {
      question: 'Puis-je retourner un produit ?',
      answer: 'Oui, vous avez 30 jours pour retourner un produit en parfait état avec sa facture.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10 10-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center bg-soni-orange/10 border border-soni-orange/20 rounded-full px-4 py-2 mb-8">
            <span className="text-soni-orange text-sm font-medium">💬 Nous sommes là pour vous aider</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Contactez-nous
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Une question ? Un problème ? Notre équipe d'experts est prête à vous accompagner 
            dans votre expérience SoniShop.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-2xl mb-6">
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-lg font-medium text-soni-navy mb-1">
                  {info.content}
                </p>
                <p className="text-gray-600 text-sm">
                  {info.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Form Side */}
              <div className="p-8 lg:p-12">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Envoyez-nous un message
                  </h2>
                  <p className="text-gray-600">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                  </p>
                </div>

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6">
                    <div className="flex items-center">
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white focus:border-soni-orange focus:outline-none focus:ring-2 focus:ring-soni-orange/20 transition-colors duration-200"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white focus:border-soni-orange focus:outline-none focus:ring-2 focus:ring-soni-orange/20 transition-colors duration-200"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Sujet
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white focus:border-soni-orange focus:outline-none focus:ring-2 focus:ring-soni-orange/20 transition-colors duration-200"
                      placeholder="Comment pouvons-nous vous aider ?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white focus:border-soni-orange focus:outline-none focus:ring-2 focus:ring-soni-orange/20 transition-colors duration-200"
                      placeholder="Décrivez votre demande en détail..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex items-center justify-center px-8 py-4 bg-blue-700 hover:from-soni-navy/90 hover:to-blue-700/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer le message
                        <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Info Side */}
              <div className="bg-blue-800 p-8 lg:p-12 text-white">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-6">
                      Besoin d'aide immédiate ?
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Support Priority</h4>
                        <p className="text-blue-100">
                          Accès prioritaire au support avec nos plans Premium et Business.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Base de connaissances</h4>
                        <p className="text-blue-100">
                          Consultez notre FAQ et nos guides détaillés pour résoudre rapidement vos questions.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Communauté</h4>
                        <p className="text-blue-100">
                          Rejoignez notre communauté d'utilisateurs pour échanger et obtenir des conseils.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link
                      to="/"
                      className="inline-flex items-center text-soni-orange hover:text-orange-500 font-medium transition-colors"
                    >
                      ← Retour à l'accueil
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-gray-600">
              Trouvez rapidement les réponses aux questions les plus courantes.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Vous ne trouvez pas la réponse à votre question ?
            </p>
            <Link
              to="#contact-form"
              className="inline-flex items-center font-medium text-soni-navy hover:text-soni-orange transition-colors"
            >
              Contactez notre équipe support
              <ArrowRightIcon className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
