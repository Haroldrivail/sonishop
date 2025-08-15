import React, { useState, useEffect } from 'react'

const categories = ['Smartphones', 'Ordinateurs', 'Audio', 'Tablettes', 'Accessoires']
const statuses = ['active', 'out_of_stock', 'low_stock', 'inactive']

const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Actif'
    case 'out_of_stock': return 'Rupture de stock'
    case 'low_stock': return 'Stock faible'
    case 'inactive': return 'Inactif'
    default: return status
  }
}

const ImageInput = ({
  imageInputType,
  setImageInputType,
  imageURL,
  setImageURL,
  uploadedFile,
  setUploadedFile,
  imagePreview,
  setImagePreview,
  setFormData,
  formData
}) => {
  const [error, setError] = useState(null)
  const maxFileSize = 2 * 1024 * 1024 // 2 Mo

  const handleFileChange = (e) => {
    setError(null)
    const file = e.target.files[0]
    if (file) {
      if (file.size > maxFileSize) {
        setError('Le fichier est trop volumineux (max 2 Mo).')
        setUploadedFile(null)
        setImagePreview(null)
        setFormData({ ...formData, image: '' })
        return
      }
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagePreview(ev.target.result)
        setFormData({ ...formData, image: ev.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageInputTypeChange = (e) => {
    const val = e.target.value
    setImageInputType(val)
    setError(null)

    if (val === 'url') {
      // Remettre l'URL sans perdre la valeur précédente
      setUploadedFile(null)
      setImagePreview(imageURL || null)
      setFormData({ ...formData, image: imageURL || '' })
    } else {
      // Mode upload : vider URL et preview
      setImagePreview(null)
      setFormData({ ...formData, image: '' })
    }
  }

  return (
    <div>
      <div className="mb-2">
        <label className="mr-4">
          <input
            id="imageTypeUrl"
            type="radio"
            name="imageInputType"
            value="url"
            checked={imageInputType === 'url'}
            onChange={handleImageInputTypeChange}
            className="mr-1"
          />
          URL
        </label>
        <label>
          <input
            id="imageTypeUpload"
            type="radio"
            name="imageInputType"
            value="upload"
            checked={imageInputType === 'upload'}
            onChange={handleImageInputTypeChange}
            className="mr-1"
          />
          Upload
        </label>
      </div>

      {imageInputType === 'url' ? (
        <input
          id="imageUrlInput"
          type="text"
          placeholder="URL de l'image"
          value={imageURL || ''}
          onChange={(e) => {
            setImageURL(e.target.value)
            setFormData({ ...formData, image: e.target.value })
          }}
          className="w-full border border-gray-200 rounded px-4 py-2 focus:ring-2 focus:ring-soni-orange focus:outline-none"
        />
      ) : (
        <>
          <input
            id="imageFileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          {error && <p className="text-red-600 mt-1">{error}</p>}
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Aperçu"
              className="mt-2 max-h-40 rounded border border-gray-200"
            />
          )}
        </>
      )}
    </div>
  )
}

const DashboardProductFormModal = ({
  formData,
  setFormData,
  onClose,
  onSubmit,
  isEdit = false
}) => {
  // Deux états séparés pour mieux gérer url vs upload
  const [imageInputType, setImageInputType] = useState(formData.image?.startsWith('data:') ? 'upload' : 'url')
  const [imagePreview, setImagePreview] = useState(formData.image || null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [imageURL, setImageURL] = useState(
    formData.image && !formData.image.startsWith('data:') ? formData.image : ''
  )

  // Synchronisation si formData.image change extérieurement
  useEffect(() => {
    if (formData.image) {
      if (formData.image.startsWith('data:')) {
        setImageInputType('upload')
        setImagePreview(formData.image)
        setUploadedFile(null) // pas moyen de recharger le fichier côté client
        setImageURL('')
      } else {
        setImageInputType('url')
        setImagePreview(formData.image)
        setImageURL(formData.image)
        setUploadedFile(null)
      }
    } else {
      setImagePreview(null)
      setImageURL('')
      setUploadedFile(null)
    }
  }, [formData.image])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto w-full max-w-md p-6 shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isEdit ? 'Modifier le produit' : 'Ajouter un produit'}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
          className="space-y-4"
        >
          <label htmlFor="productName" className="block font-semibold text-gray-700">Nom :</label>
          <input
            id="productName"
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-200 rounded px-4 py-2 focus:ring-2 focus:ring-soni-orange focus:outline-none"
            required
          />

          <label htmlFor="productDescription" className="block font-semibold text-gray-700">Description :</label>
          <textarea
            id="productDescription"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-200 rounded px-4 py-2 focus:ring-2 focus:ring-soni-orange focus:outline-none"
          />

          <label htmlFor="productCategory" className="block font-semibold text-gray-700">Catégorie :</label>
          <select
            id="productCategory"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border border-gray-200 rounded px-4 py-2 focus:ring-2 focus:ring-soni-orange focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label htmlFor="productPrice" className="block font-semibold text-gray-700">Prix :</label>
          <input
            id="productPrice"
            type="number"
            value={formData.price !== undefined ? formData.price : ''}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })
            }
            className="w-full border border-gray-200 rounded px-4 py-2 focus:ring-2 focus:ring-soni-orange focus:outline-none"
            required
            min={0}
            step="0.01"
          />

          <label htmlFor="productStock" className="block font-semibold text-gray-700">Stock :</label>
          <input
            id="productStock"
            type="number"
            value={formData.stock !== undefined ? formData.stock : ''}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value === '' ? '' : Number(e.target.value) })
            }
            className="w-full border border-gray-200 rounded px-4 py-2 focus:ring-2 focus:ring-soni-orange focus:outline-none"
            required
            min={0}
            step="1"
          />

          <label htmlFor="productStatus" className="block font-semibold text-gray-700">Statut :</label>
          <select
            id="productStatus"
            value={formData.status || ''}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border border-gray-200 rounded px-4 py-2 focus:ring-2 focus:ring-soni-orange focus:outline-none"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{getStatusText(s)}</option>
            ))}
          </select>

          <label className="block font-semibold text-gray-700">Image :</label>
          <ImageInput
            imageInputType={imageInputType}
            setImageInputType={setImageInputType}
            imageURL={imageURL}
            setImageURL={setImageURL}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            setFormData={setFormData}
            formData={formData}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-soni-orange text-white rounded hover:bg-accent-700"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DashboardProductFormModal
