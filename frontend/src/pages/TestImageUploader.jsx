import React, { useState } from 'react'
import ImageUploader from '../components/ImageUploader'

const TestImageUploader = () => {
  const [singleImage, setSingleImage] = useState('')
  const [multipleImages, setMultipleImages] = useState([])

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test ImageUploader</h1>
      
      <div className="space-y-8">
        {/* Test single image */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Image Unique</h2>
          <ImageUploader
            value={singleImage}
            onChange={setSingleImage}
            multiple={false}
            folder="categories"
            label="Image de catégorie"
          />
          
          {singleImage && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">URL image : {singleImage}</p>
            </div>
          )}
        </div>

        {/* Test multiple images */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Images Multiples</h2>
          <ImageUploader
            value={multipleImages}
            onChange={setMultipleImages}
            multiple={true}
            folder="products"
            maxFiles={5}
            label="Images de produit"
          />
          
          {multipleImages.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                Nombre d'images : {multipleImages.length}
              </p>
              <div className="mt-2">
                {multipleImages.map((url, index) => (
                  <p key={index} className="text-xs text-gray-500 truncate">
                    {index + 1}. {url}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Instructions de test :</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Drag & Drop :</strong> Glissez des images depuis votre explorateur directement sur les zones</li>
          <li>• <strong>Clic pour parcourir :</strong> Cliquez n'importe où dans la zone ou sur le bouton "Choisir des fichiers"</li>
          <li>• <strong>Ajout d'images :</strong> Utilisez le bouton "+ Ajouter des images" pour ajouter plus d'images</li>
          <li>• <strong>Réorganisation :</strong> Cliquez sur le cœur pour définir une image comme principale</li>
          <li>• <strong>Prévisualisation :</strong> Cliquez sur l'œil pour voir l'image en grand</li>
        </ul>
      </div>
    </div>
  )
}

export default TestImageUploader
