import React, { useState, useRef, useCallback } from 'react'
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon, EyeIcon } from '@heroicons/react/24/outline'
import { uploadService } from '../api/uploadService'
import { useToast } from '../context/ToastContext'

const ImageUploader = ({ 
  value = [], 
  onChange, 
  multiple = false, 
  folder = 'uploads',
  maxFiles = 10,
  className = '',
  accept = 'image/*',
  showPreview = true,
  disabled = false,
  label = 'Images'
}) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewModal, setPreviewModal] = useState(null)
  const fileInputRef = useRef(null)
  const { success: showSuccess, error: showError } = useToast()

  // Normaliser les valeurs pour toujours avoir un tableau
  const images = Array.isArray(value) ? value : (value ? [value] : [])

  const handleFileSelect = useCallback(async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      const fileArray = Array.from(files)
      
      if (multiple) {
        // Upload multiple
        const result = await uploadService.uploadMultipleFiles(fileArray, folder)
        
        if (result.success && result.data.length > 0) {
          const newUrls = result.data.map(item => item.url)
          const updatedImages = [...images, ...newUrls].slice(0, maxFiles)
          onChange(updatedImages)
          showSuccess(`${newUrls.length} image(s) uploadée(s) avec succès !`)
        }
        
        if (result.errors && result.errors.length > 0) {
          console.error('Erreurs d\'upload:', result.errors)
          showError(`Erreurs d'upload: ${result.errors.length} fichier(s) ont échoué`)
        }
      } else {
        // Upload simple
        const result = await uploadService.uploadFile(fileArray[0], folder)
        
        if (result.success) {
          onChange(result.data.url)
          showSuccess('Image uploadée avec succès !')
        } else {
          console.error('Erreur d\'upload:', result.error)
          showError('Erreur lors de l\'upload de l\'image')
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      showError('Erreur lors de l\'upload des images')
    } finally {
      setUploading(false)
    }
  }, [images, onChange, multiple, folder, maxFiles])

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [handleFileSelect, disabled])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const removeImage = (index) => {
    if (multiple) {
      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)
      showSuccess('Image supprimée avec succès !')
    } else {
      onChange('')
      showSuccess('Image supprimée avec succès !')
    }
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const moveImage = (fromIndex, toIndex) => {
    if (!multiple) return
    
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
  }

  const setAsPrimary = (index) => {
    if (index === 0 || !multiple) return
    moveImage(index, 0)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {multiple && images.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({images.length}/{maxFiles})
            </span>
          )}
        </label>
      )}

      {/* Zone d'upload */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragOver ? 'border-soni-orange bg-orange-50' : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled ? openFileSelector : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-soni-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-600">Upload en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <ArrowUpTrayIcon className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Glissez et déposez vos images ici
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ou cliquez n'importe où pour parcourir vos fichiers
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                openFileSelector()
              }}
              className="px-4 py-2 bg-soni-orange text-blue-200 rounded-lg hover:bg-blue-600 hover:text-white cursor-pointer transition-colors font-medium text-sm"
            >
              Choisir {multiple ? 'des fichiers' : 'un fichier'}
            </button>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP jusqu'à 5MB {multiple && `(max ${maxFiles} images)`}
            </p>
          </div>
        )}
      </div>

      {/* Prévisualisation des images */}
      {showPreview && images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Images uploadées</h4>
            {multiple && images.length < maxFiles && (
              <button
                type="button"
                onClick={openFileSelector}
                disabled={disabled}
                className="text-sm text-soni-orange hover:text-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Ajouter des images
              </button>
            )}
          </div>
          <div className={`grid gap-4 ${multiple ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="w-full h-full bg-gray-200 hidden items-center justify-center">
                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                </div>

                {/* Badge image principale */}
                {multiple && index === 0 && (
                  <div className="absolute top-2 left-2 bg-soni-orange text-white text-xs px-2 py-1 rounded-full font-medium">
                    Principal
                  </div>
                )}

                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewModal(imageUrl)
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Voir l'image"
                  >
                    <EyeIcon className="h-4 w-4 text-gray-700" />
                  </button>
                  
                  {multiple && index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setAsPrimary(index)
                      }}
                      className="p-2 bg-soni-orange rounded-full hover:bg-accent-700 transition-colors"
                      title="Définir comme image principale"
                    >
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}

                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      title="Supprimer l'image"
                    >
                      <XMarkIcon className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setPreviewModal(null)}>
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={previewModal}
              alt="Prévisualisation"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewModal(null)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
