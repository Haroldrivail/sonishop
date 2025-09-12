# Améliorations ImageUploader - Drag & Drop + Clic

## Fonctionnalités implémentées

### 1. Double interaction utilisateur
- ✅ **Drag & Drop** : Glisser-déposer les images directement depuis l'explorateur
- ✅ **Clic pour parcourir** : Cliquer pour ouvrir l'explorateur de fichiers

### 2. Interface améliorée

#### Zone d'upload principale
- Texte explicatif clair : "Glissez et déposez vos images ici"
- Sous-texte : "ou cliquez n'importe où pour parcourir vos fichiers"
- Bouton dédié : "Choisir des fichiers" / "Choisir un fichier"
- Zone cliquable complète (pas seulement le bouton)

#### Zone de prévisualisation
- Bouton "+ Ajouter des images" quand il y a déjà des images uploadées
- Compteur d'images : (2/10) par exemple
- Actions par image : voir, définir comme principale, supprimer

### 3. Gestion des états
- État de chargement avec spinner animé
- État de survol (hover) avec changement de couleur
- État désactivé avec opacity réduite
- État de drag-over avec surbrillance orange

### 4. Validation et limites
- Validation des types de fichiers (PNG, JPG, WebP, SVG, GIF)
- Limitation de taille (5MB par fichier)
- Limitation du nombre de fichiers (configurable, défaut 10)
- Gestion d'erreurs avec messages explicites

## Utilisation

```jsx
// Image unique avec clic et drag & drop
<ImageUploader
  value={singleImage}
  onChange={setSingleImage}
  multiple={false}
  folder="categories"
  label="Image de catégorie"
/>

// Images multiples avec toutes les fonctionnalités
<ImageUploader
  value={multipleImages}
  onChange={setMultipleImages}
  multiple={true}
  folder="products"
  maxFiles={5}
  label="Images de produit"
/>
```

## Actions disponibles

### Pour l'utilisateur
1. **Drag & Drop** : Glisser des fichiers depuis l'OS
2. **Clic zone entière** : Cliquer n'importe où dans la zone d'upload
3. **Bouton dédié** : Cliquer sur "Choisir des fichiers"
4. **Ajouter plus** : Bouton "+ Ajouter des images" après upload
5. **Réorganiser** : Cliquer sur le cœur pour image principale
6. **Prévisualiser** : Cliquer sur l'œil pour voir en grand
7. **Supprimer** : Cliquer sur la croix rouge

### Retour visuel
- Zone devient orange au survol de fichiers (drag-over)
- Spinner animé pendant l'upload
- Preview immédiat des images uploadées
- Badge "Principal" sur la première image
- Modal de prévisualisation plein écran

## Compatibilité
- Fonctionne sur desktop et mobile
- Support drag & drop natif du navigateur
- Fallback clic pour tous les appareils
- Interface tactile friendly

## Test
Un composant de test est disponible dans `src/pages/TestImageUploader.jsx` pour valider toutes les fonctionnalités.
