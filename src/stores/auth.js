import { defineStore } from 'pinia'
import api from '@/services/api'
import { resetEcho } from '@/composables/useEcho'

const ROLE_LABELS = {
  admin: 'Administrateur',
  manager: 'Gérant',
  waiter: 'Serveur',
  kitchen: 'Cuisinier',
}

// Which routes each role can access (by route name)
const ROLE_PERMISSIONS = {
  admin: [
    'Dashboard',
    'Tables',
    'Menu',
    'Orders',
    'NewOrder',
    'Kitchen',
    'Payments',
    'Users',
    'Logs',
  ],
  manager: ['Dashboard', 'Tables', 'Menu', 'Orders', 'NewOrder', 'Kitchen', 'Payments'],
  waiter: ['WaiterDashboard', 'Tables', 'Menu', 'Orders', 'NewOrder'],
  kitchen: ['Kitchen', 'Menu'],
}

const ROLE_HOME = {
  admin: '/',
  manager: '/',
  waiter: '/waiter',
  kitchen: '/kitchen',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isWaiter: (state) => state.user?.role === 'waiter',
    isKitchen: (state) => state.user?.role === 'kitchen',
    isManager: (state) => state.user?.role === 'manager',
    userName: (state) => state.user?.name || '',
    userRole: (state) => state.user?.role || '',
    userRoleLabel: (state) => ROLE_LABELS[state.user?.role] || state.user?.role || '',
    homeRoute: (state) => ROLE_HOME[state.user?.role] || '/',
    restaurantId: (state) => state.user?.restaurant_id || '',
    restaurantName: (state) => state.user?.restaurant?.name || '',
    canAccess: (state) => (routeName) => {
      if (!state.user?.role) return false
      const allowed = ROLE_PERMISSIONS[state.user.role] || []
      return allowed.includes(routeName)
    },
  },

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const response = await api.post('/login', { email, password })
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', response.data.token)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Erreur de connexion',
        }
      } finally {
        this.loading = false
      }
    },

    logout({ remote = true } = {}) {
      const token = this.token

      // 1. Nettoyage local immédiat
      this.token = null
      this.user = null
      localStorage.removeItem('token')

      // 2. Fermer la connexion temps réel de l'ancien utilisateur
      resetEcho()

      // 3. Invalider le token côté serveur, sans bloquer la déconnexion
      if (remote && token) {
        api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
      }
    },

    async fetchMe() {
      try {
        const response = await api.get('/me')
        this.user = response.data
        return response.data
      } catch (error) {
        this.logout({ remote: false }) // token déjà invalide : inutile d'appeler le serveur
        return null
      }
    },
  },
})
