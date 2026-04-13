import axios from 'axios'
import { toast } from 'vue-sonner'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: inject token ──────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: global error handling ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const data    = error.response?.data

    // 401 — session expirée
    if (status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token')
      toast.error('Session expirée', { description: 'Veuillez vous reconnecter.' })
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // 403 — accès refusé
    if (status === 403) {
      toast.error('Accès refusé', {
        description: data?.message || 'Vous n\'avez pas les droits nécessaires.',
      })
      return Promise.reject(error)
    }

    // 422 — erreurs de validation → extraire le premier message
    if (status === 422) {
      const firstError = data?.errors
        ? Object.values(data.errors).flat()[0]
        : data?.message || 'Données invalides.'
      toast.error('Erreur de validation', { description: firstError })
      return Promise.reject(error)
    }

    // 500+ — erreur serveur
    if (status >= 500) {
      toast.error('Erreur serveur', {
        description: 'Une erreur inattendue est survenue. Réessayez.',
      })
      return Promise.reject(error)
    }

    // Réseau (pas de réponse)
    if (!error.response) {
      toast.error('Connexion impossible', {
        description: 'Vérifiez votre connexion ou que le serveur est démarré.',
      })
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api