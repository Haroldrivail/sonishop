# Dashboard Layout System - SoniShop

## Vue d'ensemble

Le système de layout dashboard de SoniShop fournit une architecture modulaire et réutilisable pour créer des interfaces d'administration modernes avec une sidebar collapsible et responsive.

## Composants principaux

### 1. DashboardLayout

Le composant wrapper principal qui gère la structure générale du dashboard.

**Props :**
- `children` : Contenu principal à afficher
- `activeTab` : Onglet actuellement actif
- `setActiveTab` : Fonction pour changer d'onglet
- `sidebarItems` : Array des éléments de navigation
- `pageTitle` : Titre personnalisé de la page (optionnel)
- `showNotifications` : Afficher les notifications (défaut: true)
- `showUserMenu` : Afficher le menu utilisateur (défaut: true)

**Exemple d'utilisation :**
```jsx
import DashboardLayout from '../../components/dashboard/DashboardLayout'

const sidebarItems = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: HomeIcon },
    { id: 'orders', name: 'Commandes', icon: ShoppingBagIcon },
    // ...
]

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    
    return (
        <DashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarItems={sidebarItems}
            pageTitle="Dashboard Admin"
        >
            {/* Votre contenu ici */}
        </DashboardLayout>
    )
}
```

### 2. DashboardSidebar

Composant sidebar réutilisable avec support de la responsivité et état collapsible.

**Fonctionnalités :**
- Collapsible sur desktop
- Overlay mobile
- Navigation interactive
- Section utilisateur avec logout
- Indicateur d'onglet actif
- Transitions animées

**Props :**
- `isCollapsed` : État collapsé (desktop)
- `setIsCollapsed` : Fonction pour toggler l'état collapsé
- `isMobileOpen` : État ouvert (mobile)
- `setIsMobileOpen` : Fonction pour toggler l'état mobile
- `activeTab` : Onglet actif
- `setActiveTab` : Fonction pour changer d'onglet
- `sidebarItems` : Items de navigation

## Structure des sidebar items

```jsx
const sidebarItems = [
    {
        id: 'unique-id',        // Identifiant unique
        name: 'Nom affiché',    // Texte affiché
        icon: IconComponent     // Composant icône
    }
]
```

## Fonctionnalités

### 🎯 Responsive Design
- Desktop : Sidebar fixe avec option collapse
- Mobile : Sidebar overlay avec bouton menu
- Transitions fluides entre les modes

### 🔧 Modulaire et Réutilisable
- Composants découplés
- Configuration facile via props
- Extensible pour nouveaux besoins

### 🎨 Design moderne
- Interface SoniShop branded
- Animations et transitions
- États visuels clairs

### 🚀 Performance
- Rendering optimisé
- État local géré efficacement
- Pas de re-renders inutiles

## Intégration dans votre projet

1. **Importer les composants :**
```jsx
import DashboardLayout from './components/dashboard/DashboardLayout'
```

2. **Configurer la navigation :**
```jsx
const sidebarItems = [
    { id: 'tab1', name: 'Tab 1', icon: HomeIcon },
    { id: 'tab2', name: 'Tab 2', icon: ChartBarIcon }
]
```

3. **Gérer l'état de navigation :**
```jsx
const [activeTab, setActiveTab] = useState('tab1')
```

4. **Rendu conditionnel du contenu :**
```jsx
const renderContent = () => {
    switch (activeTab) {
        case 'tab1': return <Component1 />
        case 'tab2': return <Component2 />
        default: return <DefaultComponent />
    }
}
```

## Personnalisation

### Couleurs et thème
Le système utilise les couleurs SoniShop définies dans Tailwind :
- `soni-navy` : #1a237e
- `soni-orange` : #ff6d00

### Icônes
Utilisez les icônes du système `src/components/icons/` pour une cohérence visuelle.

### Layout adaptatif
Le layout s'adapte automatiquement selon l'état de la sidebar :
- Collapsed : Plus d'espace pour le contenu
- Expanded : Navigation complète visible

## Exemples d'usage

### Dashboard simple
```jsx
<DashboardLayout
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    sidebarItems={items}
>
    <SimpleContent />
</DashboardLayout>
```

### Dashboard avec titre personnalisé
```jsx
<DashboardLayout
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    sidebarItems={items}
    pageTitle="Gestion des Commandes"
    showNotifications={false}
>
    <OrdersManagement />
</DashboardLayout>
```

## Avantages

✅ **Réutilisable** : Un seul composant pour tous vos dashboards
✅ **Responsive** : Fonctionne sur tous les appareils
✅ **Moderne** : Interface utilisateur contemporaine
✅ **Accessible** : Navigation au clavier, états focus
✅ **Performant** : Optimisé pour de grandes applications
✅ **Branded** : Cohérent avec l'identité SoniShop

---

*Documentation mise à jour - Version 1.0*
