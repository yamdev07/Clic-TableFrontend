import { defineStore } from 'pinia'
import api from '@/services/api'

const ROLE_LABELS = {
  super_admin: 'Plateforme',
  admin: 'Administrateur',
  manager: 'Gérant',
  waiter: 'Serveur',
  kitchen: 'Cuisinier',
  cashier: 'Caissier',
}

// Which routes each role can access (by route name)
const ROLE_PERMISSIONS = {
  super_admin: ['Platform'],
  admin:   ['Dashboard', 'Tables', 'Menu', 'Orders', 'NewOrder', 'Kitchen', 'Payments', 'Users', 'Logs', 'RestaurantSettings'],
  manager: ['Dashboard', 'Tables', 'Menu', 'Orders', 'NewOrder', 'Kitchen', 'Payments'],
  waiter:  ['WaiterDashboard', 'Tables', 'Menu', 'Orders', 'NewOrder'],
  kitchen: ['Kitchen', 'Menu'],
  cashier: ['Payments', 'Orders'],
}

const ROLE_HOME = {
  super_admin: '/platform',
  admin:   '/',
  manager: '/',
  waiter:  '/waiter',
  kitchen: '/kitchen',
  cashier: '/payments',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
    isAdmin: (state) => state.user?.role === 'admin',
    isWaiter: (state) => state.user?.role === 'waiter',
    isKitchen: (state) => state.user?.role === 'kitchen',
    isManager: (state) => state.user?.role === 'manager',
    userName: (state) => state.user?.name || '',
    userRole: (state) => state.user?.role || '',
    userRoleLabel: (state) => ROLE_LABELS[state.user?.role] || state.user?.role || '',
    homeRoute: (state) => ROLE_HOME[state.user?.role] || '/',
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

    // Inscription SaaS : crée le restaurant + son administrateur, puis connecte
    async register(payload) {
      this.loading = true
      try {
        const response = await api.post('/register', payload)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', response.data.token)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Erreur lors de l'inscription",
          errors: error.response?.data?.errors || {},
        }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },

    async fetchMe() {
      try {
        const response = await api.get('/me')
        this.user = response.data
        return response.data
      } catch (error) {
        this.logout()
        return null
      }
    },
  },
})