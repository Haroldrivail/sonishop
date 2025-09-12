import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  ShoppingCartIcon,
  HeartIcon,
  TruckIcon
} from '../components/icons'

const Profile = () => {
  const navigate = useNavigate()
  const { user, updateProfile, updatePassword, refreshUser } = useAuth()
  const { cart, wishlist } = useCart()
  const { success, error } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [loading, setLoading] = useState(false) // profile saving
  const [pwdLoading, setPwdLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])
  const [ordersCount, setOrdersCount] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)

  // Données du formulaire
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    quartier: user?.quartier || '',
    postalCode: user?.postalCode || '',
    country: user?.country || 'Cameroun'
  })

  // Données pour changer le mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        quartier: user.quartier || '',
        postalCode: user.postalCode || '',
        country: user.country || 'Cameroun'
      })
    }
  }, [user])

  // Chargement explicite des données profil détaillées (assure qu'on ne reste pas sur des valeurs hardcodées)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      setProfileLoading(true)
      setProfileError(null)
      try {
        const res = await api.profile.get()
        const data = res.data?.user || res.data || {}
        setFormData(prev => ({
          ...prev,
          name: data.name ?? prev.name,
          email: data.email ?? prev.email,
          phone: data.phone ?? prev.phone,
          city: data.city ?? prev.city,
          quartier: data.quartier ?? prev.quartier,
          postalCode: data.postalCode ?? data.postal_code ?? prev.postalCode,
          country: data.country ?? prev.country
        }))
        if (data.avatar_url || data.avatar) {
          const raw = data.avatar_url || data.avatar
          setAvatarUrl(resolveAvatarUrl(raw))
        }
      } catch (e) {
        setProfileError('Impossible de charger le profil')
      } finally {
        setProfileLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await updateProfile(formData)
      if (!result.success) {
        error('Erreur de validation du profil')
      } else {
        success('Profil mis à jour avec succès')
        setIsEditing(false)
      }
    } catch (err) {
      error('Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (() => {
    const p = passwordData.newPassword
    if (!p) return 0
    let score = 0
    if (p.length >= 6) score++
    if (p.length >= 10) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return Math.min(score, 5)
  })()

  const validatePasswordForm = () => {
    const errs = []
    if (!passwordData.currentPassword.trim()) errs.push('Mot de passe actuel requis')
    if (passwordData.newPassword.length < 6) errs.push('Au moins 6 caractères')
    if (passwordData.newPassword !== passwordData.confirmPassword) errs.push('Confirmation différente')
    setPasswordErrors(errs)
    return errs.length === 0
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!validatePasswordForm()) return
    setPwdLoading(true)
    setPasswordErrors([])
    try {
      const result = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      })
      if (!result.success) {
        const backendErrors = result.errors ? Object.values(result.errors).flat() : []
        if (backendErrors.length) setPasswordErrors(backendErrors)
        error('Échec du changement de mot de passe')
      } else {
        success('Mot de passe modifié')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordSection(false)
      }
    } catch (err) {
      error('Erreur réseau mot de passe')
    } finally {
      setPwdLoading(false)
    }
  }

  // Charger le nombre de commandes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return
      try {
        const res = await api.orders.getAll()
        const items = res.data?.data || res.data || []
        setOrdersCount(Array.isArray(items) ? items.length : (items.total ?? items.count ?? 0))
      } catch (e) {
        setOrdersCount(0)
      }
    }
    fetchOrders()
  }, [user])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      error('Aucun fichier sélectionné')
      return
    }
    setAvatarUploading(true)
    try {
      const res = await api.uploads.uploadAvatar(file)
      const raw = res.data?.url || res.data?.avatar_url || res.data?.path
      if (raw) {
        setAvatarUrl(resolveAvatarUrl(raw))
      }
  await refreshUser()
      success('Avatar mis à jour')
    } catch (err) {
      const backendMsg = err?.response?.data?.message
      error(backendMsg || 'Erreur lors du téléversement de l\'avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const stats = [
    {
      label: 'Articles dans le panier',
      value: cart.reduce((total, item) => total + item.quantity, 0),
      icon: ShoppingCartIcon,
      color: 'text-blue-600'
    },
    {
      label: 'Articles favoris',
      value: wishlist.length,
      icon: HeartIcon,
      color: 'text-red-600'
    },
    {
      label: 'Commandes totales',
      value: ordersCount === null ? '...' : ordersCount,
      icon: TruckIcon,
      color: 'text-green-600'
    }
  ]

  function resolveAvatarUrl(raw) {
    if (!raw) return null
    // Si déjà absolu (http/https/data)
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw
    // Laravel Storage::url() retourne typiquement /storage/... => préfixer origin
    if (raw.startsWith('/')) return window.location.origin + raw
    // Cas path "public/avatars/xyz" => retirer public/ et préfixer /storage
    if (raw.startsWith('public/')) {
      const relative = raw.replace(/^public\//, '')
      return window.location.origin + '/storage/' + relative
    }
    // Cas avatars/xyz => supposer stocké sous /storage/avatars
    if (raw.startsWith('avatars/')) return window.location.origin + '/storage/' + raw
    return window.location.origin + '/' + raw
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserIcon className="h-8 w-8 text-[#1a237e] mr-3" />
            Mon Profil
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte d'informations personnelles */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Informations personnelles
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#1a237e] hover:text-blue-800 font-medium cursor-pointer"
                    >
                      Modifier
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setIsEditing(false)
                            setFormData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || '',
                            city: user?.city || '',
                            quartier: user?.quartier || '',
                            postalCode: user?.postalCode || '',
                            country: user?.country || 'Cameroun'
                          })
                        }}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-[#1a237e] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors duration-200 disabled:opacity-50"
                      >
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-500' : ''
                            }`}
                          placeholder="Votre nom complet"
                        />
                        <UserIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-500' : ''
                            }`}
                          placeholder="votre@email.com"
                        />
                        <MailIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-500' : ''
                            }`}
                          placeholder="+237 6XX XXX XXX"
                        />
                        <PhoneIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pays
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-500' : ''
                          }`}
                      >
                        <option value="Cameroun">Cameroun</option>
                        <option value="France">France</option>
                        <option value="Canada">Canada</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                      <input
                        type="text"
                        name="quartier"
                        value={formData.quartier}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                        placeholder="Bonapriso, Bastos..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                        placeholder="Yaoundé, Douala..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${!isEditing ? 'bg-gray-50 text-gray-500' : ''
                          }`}
                        placeholder="Code postal"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Section changement de mot de passe */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Sécurité
                  </h2>
                  <button
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="text-[#1a237e] hover:text-blue-800 font-medium cursor-pointer"
                  >
                    {showPasswordSection ? 'Masquer' : 'Changer le mot de passe'}
                  </button>
                </div>
              </div>

              {showPasswordSection && (
                <div className="p-6">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                          placeholder="Mot de passe actuel"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                          placeholder="Nouveau mot de passe (min. 6 caractères)"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                          placeholder="Confirmer le nouveau mot de passe"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {passwordErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 text-xs text-red-600 space-y-1">
                        {passwordErrors.map((pe,i) => <div key={i}>• {pe}</div>)}
                      </div>
                    )}

                    {passwordData.newPassword && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-gray-500">Robustesse</span>
                          <span className="text-[11px] text-gray-500">{passwordStrength}/5</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${passwordStrength <=2 ? 'bg-red-500' : passwordStrength===3 ? 'bg-yellow-500' : 'bg-green-600'}`} style={{ width: `${(passwordStrength/5)*100}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={pwdLoading || passwordErrors.length>0}
                        className="bg-[#1a237e] text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors duration-200 disabled:opacity-50"
                      >
                        {pwdLoading ? 'Modification...' : 'Modifier le mot de passe'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordSection(false)
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          })
                          setPasswordErrors([])
                        }}
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar et statut */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 bg-[#1a237e] rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 cursor-pointer shadow-sm hover:bg-gray-50 h-8 w-8 flex items-center justify-center">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <span className="text-xs text-[#1a237e] font-semibold">{avatarUploading ? '...' : '📸'}</span>
                </label>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {user?.name || 'Utilisateur'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {user?.email}
              </p>
              {profileLoading && (
                <p className="text-xs text-gray-400 mb-2">Chargement des détails...</p>
              )}
              {profileError && (
                <p className="text-xs text-red-500 mb-2">{profileError}</p>
              )}
              {user && (
                user.email_verified_at ? (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Email vérifié
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                    Email non vérifié
                  </div>
                )
              )}
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mes statistiques
              </h3>
              <div className="space-y-4">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-5 w-5 ${stat.color}`} />
                        <span className="text-gray-700">{stat.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {stat.value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions rapides
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/favorites')}
                  className="cursor-pointer w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  aria-label="Voir mes favoris"
                >
                  <div className="flex items-center space-x-3">
                    <HeartIcon className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">Voir mes favoris</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="cursor-pointer w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  aria-label="Mes commandes"
                >
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Mes commandes</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="cursor-pointer w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  aria-label="Mon panier"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Mon panier</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
