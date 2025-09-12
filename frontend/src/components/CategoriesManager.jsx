import React, { useState, useEffect, useCallback } from 'react'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { categoryService } from '../api/categoryService'
import { useToast } from '../context/ToastContext'
import ImageUploader from './ImageUploader'

const CategoriesManager = ({ 
  isOpen, 
  onClose, 
  onCategoryCreated, 
  onCategoryUpdated, 
  onCategoryDeleted 
}) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState('create') // create | edit | view
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  
  const { success: showSuccess, error: showError } = useToast()

  const loadCategories = useCallback(async (isRefresh = false) => {
    const controller = new AbortController()
    
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const result = await categoryService.getCategories({ signal: controller.signal })
      if (result.success) {
        // 🖼️ Gestion des images avec placeholder 'Categorie.png'
        const categoriesWithPlaceholder = result.data.map(cat => ({
          ...cat,
          image: cat.image || '/Categorie.png'
        }))
        setCategories(categoriesWithPlaceholder)
        
        if (isRefresh) {
          showSuccess('Liste des catégories actualisée')
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Categories fetch error:', error)
        showError('Erreur de chargement des catégories')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
    
    return () => controller.abort()
  }, [showSuccess, showError])

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen, loadCategories])

  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openCreateForm = () => {
    setFormData({ name: '', description: '', image: '' })
    setSelectedCategory(null)
    setFormMode('create')
    setShowForm(true)
  }

  const openEditForm = (category) => {
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image || category.image_url || ''
    })
    setSelectedCategory(category)
    setFormMode('edit')
    setShowForm(true)
  }

  const openViewForm = (category) => {
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image || category.image_url || ''
    })
    setSelectedCategory(category)
    setFormMode('view')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setSelectedCategory(null)
    setFormData({ name: '', description: '', image: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = { ...formData }
      
      let result
      if (formMode === 'create') {
        result = await categoryService.createCategory(payload)
        if (result.success) {
          setCategories(prev => [...prev, result.data])
          onCategoryCreated?.(result.data)
          closeForm()
        }
      } else {
        result = await categoryService.updateCategory(selectedCategory.id, payload)
        if (result.success) {
          setCategories(prev => prev.map(cat => 
            cat.id === selectedCategory.id ? result.data : cat
          ))
          onCategoryUpdated?.(result.data)
          closeForm()
        }
      }

      if (!result.success) {
        console.error('Erreur:', result.error)
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category) => {
    setDeleteConfirm(category)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    
    setDeleting(true)
    try {
      const result = await categoryService.deleteCategory(deleteConfirm.id)
      if (result.success) {
        setCategories(prev => prev.filter(cat => cat.id !== deleteConfirm.id))
        onCategoryDeleted?.(deleteConfirm.id)
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({ ...prev, image: imageUrl }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <FolderIcon className="h-6 w-6" />
            <h2 className="text-lg font-bold">Gestion des Catégories</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadCategories(true)}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
              
              <button
                onClick={openCreateForm}
                className="inline-flex items-center px-4 py-2 bg-blue-600 cursor-pointer text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouvelle Catégorie
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Image de la catégorie */}
                  <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
                    {category.image_url || category.image ? (
                      <img
                        src={category.image_url || category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/Categorie.png'
                        }}
                      />
                    ) : (
                      <img
                        src="/Categorie.png"
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description || 'Aucune description'}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{category.products_count || 0} produit(s)</span>
                      <span>ID: {category.id}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openViewForm(category)}
                        className="cursor-pointer flex-1 flex items-center justify-center px-2 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Voir
                      </button>
                      <button
                        onClick={() => openEditForm(category)}
                        className="cursor-pointer flex-1 flex items-center justify-center px-2 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="cursor-pointer flex-1 flex items-center justify-center px-2 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Essayez avec d\'autres mots-clés.' : 'Commencez par créer votre première catégorie.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={openCreateForm}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Créer une catégorie
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 text-white ${
                formMode === 'view' ? 'bg-gray-700' : 'bg-blue-600'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    {formMode === 'create' && <PlusIcon className="h-5 w-5" />}
                    {formMode === 'edit' && <PencilIcon className="h-5 w-5" />}
                    {formMode === 'view' && <EyeIcon className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {formMode === 'create' ? 'Nouvelle Catégorie' : 
                       formMode === 'edit' ? 'Modifier la Catégorie' : 'Détails de la Catégorie'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {formMode === 'create' ? 'Créer une nouvelle catégorie de produits' :
                       formMode === 'edit' ? 'Modifier les informations de la catégorie' : 'Consulter les détails de la catégorie'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Contenu */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                {formMode === 'view' ? (
                  /* ===== MODE CONSULTATION ===== */
                  <div className="p-6 space-y-6">
                    {/* Image de la catégorie */}
                    {formData.image && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <PhotoIcon className="h-4 w-4 text-purple-600" />
                          </div>
                          Image de la catégorie
                        </h4>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-md mx-auto">
                          <img
                            src={formData.image}
                            alt={formData.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="w-full h-full bg-gray-200 hidden items-center justify-center">
                            <PhotoIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Informations principales */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <FolderIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        Informations de la catégorie
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nom de la catégorie</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">{formData.name || 'Non défini'}</p>
                        </div>
                        
                        {selectedCategory?.id && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Identifiant</label>
                            <p className="mt-1 text-base text-gray-700">#{selectedCategory.id}</p>
                          </div>
                        )}

                        {selectedCategory?.products_count !== undefined && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nombre de produits</label>
                            <p className="mt-1 text-lg font-semibold text-soni-orange">
                              {selectedCategory.products_count} produit{selectedCategory.products_count > 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {formData.description && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                          </div>
                          Description
                        </h4>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions rapides */}
                    <div className="bg-indigo-50 rounded-xl p-6 border border-blue-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h4>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setFormMode('edit')}
                          className="flex items-center px-4 py-2 bg-soni-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Modifier cette catégorie
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            closeForm()
                            handleDelete(selectedCategory)
                          }}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ===== MODE CRÉATION/MODIFICATION ===== */
                  <div className="p-6 space-y-6">
                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la catégorie *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Smartphones, Laptops..."
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Description de la catégorie..."
                      />
                    </div>

                    {/* Image */}
                    <div>
                      <ImageUploader
                        value={formData.image}
                        onChange={handleImageUpload}
                        folder="categories"
                        label="Image de la catégorie"
                        multiple={false}
                        className="mb-4"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end space-x-3 rounded-b-2xl">
                {formMode === 'view' ? (
                  /* Footer mode consultation */
                  <>
                    <button 
                      type="button" 
                      onClick={closeForm} 
                      className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      Fermer
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMode('edit')}
                      className="px-6 py-2.5 text-sm font-medium bg-soni-orange text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center space-x-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                  </>
                ) : (
                  /* Footer mode création/modification */
                  <>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !formData.name.trim()}
                      className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    >
                      {saving && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <span>
                        {saving ? 'Enregistrement...' : formMode === 'create' ? 'Créer' : 'Enregistrer'}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              Supprimer la catégorie
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la catégorie <strong>{deleteConfirm.name}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {deleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{deleting ? 'Suppression...' : 'Supprimer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesManager
