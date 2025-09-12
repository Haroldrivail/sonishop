// Mock data for settings API - À remplacer par de vraies API une fois le backend implémenté

export const mockSettingsData = {
  general: {
    appName: 'SoniShop',
    appVersion: '1.0.0',
    language: 'fr',
    timezone: 'Africa/Douala',
    debugMode: false,
    autoCache: true
  },
  
  profile: {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'admin@sonishop.com',
    phone: '+237 6 78 90 12 34',
    address: 'Douala, Cameroun',
    bio: 'Administrateur principal de SoniShop',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  
  notifications: {
    emailOrders: true,
    emailProducts: false,
    emailCustomers: true,
    pushOrders: true,
    pushProducts: false,
    pushCustomers: false,
    smsOrders: false,
    smsProducts: false,
    smsCustomers: false
  },
  
  shop: {
    shopName: 'SoniShop - Electronique & Technology',
    currency: 'XAF',
    description: 'SoniShop est votre boutique de référence pour l\'électronique et la technologie au Cameroun. Nous proposons les derniers smartphones, ordinateurs, accessoires et bien plus encore.',
    contactEmail: 'contact@sonishop.com',
    contactPhone: '+237 6 78 90 12 34',
    physicalAddress: '123 Boulevard de la Liberté, Douala, Cameroun',
    autoAcceptOrders: true,
    autoStockAlerts: true
  },
  
  security: {
    twoFactorEnabled: false,
    sessions: [
      { 
        id: 1, 
        device: 'Windows - Chrome', 
        location: 'Douala, Cameroun', 
        current: true,
        lastActive: '2025-01-19T10:30:00Z'
      },
      { 
        id: 2, 
        device: 'iPhone Safari', 
        location: 'Yaoundé, Cameroun', 
        current: false,
        lastActive: '2025-01-18T15:45:00Z'
      }
    ]
  },
  
  billing: {
    currentPlan: 'Professional',
    planPrice: '45,000 FCFA',
    nextBilling: '15 septembre 2025',
    paymentMethod: '•••• •••• •••• 1234',
    invoices: [
      { 
        date: '12 août 2025', 
        amount: '45,000 FCFA', 
        status: 'Payée', 
        invoice: '#INV-2025-08-001',
        downloadUrl: '/invoices/INV-2025-08-001.pdf'
      },
      { 
        date: '12 juillet 2025', 
        amount: '45,000 FCFA', 
        status: 'Payée', 
        invoice: '#INV-2025-07-001',
        downloadUrl: '/invoices/INV-2025-07-001.pdf'
      },
      { 
        date: '12 juin 2025', 
        amount: '45,000 FCFA', 
        status: 'Payée', 
        invoice: '#INV-2025-06-001',
        downloadUrl: '/invoices/INV-2025-06-001.pdf'
      }
    ]
  }
}

// Simuler des délais de réseau
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

// Simuler une erreur occasionnelle
const simulateError = () => {
  if (Math.random() < 0.1) { // 10% de chance d'erreur
    throw new Error('Erreur de simulation réseau')
  }
}

export const mockSettingsAPI = {
  async getGeneralSettings() {
    await simulateDelay()
    simulateError()
    return { data: mockSettingsData.general }
  },
  
  async updateGeneralSettings(data) {
    await simulateDelay()
    simulateError()
    Object.assign(mockSettingsData.general, data)
    return { data: mockSettingsData.general }
  },
  
  async getProfileSettings() {
    await simulateDelay()
    simulateError()
    return { data: mockSettingsData.profile }
  },
  
  async updateProfileSettings(data) {
    await simulateDelay()
    simulateError()
    Object.assign(mockSettingsData.profile, data)
    return { data: mockSettingsData.profile }
  },
  
  async getNotificationSettings() {
    await simulateDelay()
    simulateError()
    return { data: mockSettingsData.notifications }
  },
  
  async updateNotificationSettings(data) {
    await simulateDelay()
    simulateError()
    Object.assign(mockSettingsData.notifications, data)
    return { data: mockSettingsData.notifications }
  },
  
  async getShopSettings() {
    await simulateDelay()
    simulateError()
    return { data: mockSettingsData.shop }
  },
  
  async updateShopSettings(data) {
    await simulateDelay()
    simulateError()
    Object.assign(mockSettingsData.shop, data)
    return { data: mockSettingsData.shop }
  },
  
  async getSecuritySettings() {
    await simulateDelay()
    simulateError()
    return { data: mockSettingsData.security }
  },
  
  async updateSecuritySettings(data) {
    await simulateDelay()
    simulateError()
    Object.assign(mockSettingsData.security, data)
    return { data: mockSettingsData.security }
  },
  
  async getBillingSettings() {
    await simulateDelay()
    simulateError()
    return { data: mockSettingsData.billing }
  },
  
  async updateBillingSettings(data) {
    await simulateDelay()
    simulateError()
    Object.assign(mockSettingsData.billing, data)
    return { data: mockSettingsData.billing }
  },
  
  async getSessions() {
    await simulateDelay()
    simulateError()
    return { data: mockSettingsData.security.sessions }
  },
  
  async deleteSession(sessionId) {
    await simulateDelay()
    simulateError()
    mockSettingsData.security.sessions = mockSettingsData.security.sessions.filter(s => s.id !== sessionId)
    return { data: { success: true } }
  },
  
  async updatePassword(data) {
    await simulateDelay()
    simulateError()
    // Simulation de la validation du mot de passe
    if (!data.currentPassword || !data.newPassword) {
      throw new Error('Mots de passe requis')
    }
    return { data: { success: true } }
  }
}
