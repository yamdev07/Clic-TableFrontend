import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia }           from 'pinia'
import { useAuthStore }                          from '@/stores/auth'

// ── Mock de l'API axios ────────────────────────────────────────────────────
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get:  vi.fn(),
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import api from '@/services/api'

// ─────────────────────────────────────────────────────────────────────────────

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── État initial ──────────────────────────────────────────────────────────
  it('démarre non authentifié sans token', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
  })

  it('est authentifié si token en localStorage', () => {
    localStorage.setItem('token', 'fake-token')
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(true)
  })

  // ── Login ─────────────────────────────────────────────────────────────────
  it('login réussi stocke le token et l\'utilisateur', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        token: 'jwt-token-123',
        user:  { id: '1', name: 'Alice', email: 'alice@test.com', role: 'admin' },
      },
    })

    const store  = useAuthStore()
    const result = await store.login('alice@test.com', 'password')

    expect(result.success).toBe(true)
    expect(store.token).toBe('jwt-token-123')
    expect(store.user.name).toBe('Alice')
    expect(localStorage.getItem('token')).toBe('jwt-token-123')
  })

  it('login échoué retourne success: false', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Identifiants incorrects' } },
    })

    const store  = useAuthStore()
    const result = await store.login('x@x.com', 'wrong')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Identifiants incorrects')
    expect(store.token).toBeNull()
  })

  // ── Logout ────────────────────────────────────────────────────────────────
  it('logout efface token et user', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: 'tok', user: { id: '1', name: 'Bob', role: 'waiter' } },
    })

    const store = useAuthStore()
    await store.login('bob@test.com', 'pass')
    store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  // ── RBAC — canAccess ──────────────────────────────────────────────────────
  it('admin a accès à toutes les routes', () => {
    const store = useAuthStore()
    store.user  = { role: 'admin' }

    expect(store.canAccess('Dashboard')).toBe(true)
    expect(store.canAccess('Users')).toBe(true)
    expect(store.canAccess('Logs')).toBe(true)
    expect(store.canAccess('Kitchen')).toBe(true)
  })

  it('waiter a accès à son dashboard et commandes, pas aux users ni logs', () => {
    const store = useAuthStore()
    store.user  = { role: 'waiter' }

    expect(store.canAccess('WaiterDashboard')).toBe(true)
    expect(store.canAccess('NewOrder')).toBe(true)
    expect(store.canAccess('Users')).toBe(false)
    expect(store.canAccess('Logs')).toBe(false)
    expect(store.canAccess('Kitchen')).toBe(false)
    expect(store.canAccess('Payments')).toBe(false)
  })

  it('cuisinier a accès cuisine et menu uniquement', () => {
    const store = useAuthStore()
    store.user  = { role: 'kitchen' }

    expect(store.canAccess('Kitchen')).toBe(true)
    expect(store.canAccess('Menu')).toBe(true)
    expect(store.canAccess('Orders')).toBe(false)
    expect(store.canAccess('Payments')).toBe(false)
    expect(store.canAccess('Dashboard')).toBe(false)
  })

  it('retourne false si utilisateur non connecté', () => {
    const store = useAuthStore()
    expect(store.canAccess('Dashboard')).toBe(false)
  })

  // ── homeRoute ─────────────────────────────────────────────────────────────
  it('homeRoute waiter pointe vers /waiter', () => {
    const store = useAuthStore()
    store.user  = { role: 'waiter' }
    expect(store.homeRoute).toBe('/waiter')
  })

  it('homeRoute kitchen pointe vers /kitchen', () => {
    const store = useAuthStore()
    store.user  = { role: 'kitchen' }
    expect(store.homeRoute).toBe('/kitchen')
  })

  it('homeRoute admin pointe vers /', () => {
    const store = useAuthStore()
    store.user  = { role: 'admin' }
    expect(store.homeRoute).toBe('/')
  })

  // ── Labels ────────────────────────────────────────────────────────────────
  it('userRoleLabel retourne le bon libellé', () => {
    const store = useAuthStore()
    store.user  = { name: 'Test', role: 'waiter' }
    expect(store.userRoleLabel).toBe('Serveur')
  })

  // ── SaaS : super admin, caissier, inscription ─────────────────────────────
  it('super_admin n\'accède qu\'à la plateforme', () => {
    const store = useAuthStore()
    store.user  = { role: 'super_admin' }
    expect(store.isSuperAdmin).toBe(true)
    expect(store.homeRoute).toBe('/platform')
    expect(store.canAccess('Platform')).toBe(true)
    expect(store.canAccess('Dashboard')).toBe(false)
    expect(store.canAccess('Tables')).toBe(false)
  })

  it('admin de restaurant n\'accède pas à la plateforme', () => {
    const store = useAuthStore()
    store.user  = { role: 'admin' }
    expect(store.canAccess('Platform')).toBe(false)
  })

  it('caissier accède aux paiements', () => {
    const store = useAuthStore()
    store.user  = { role: 'cashier' }
    expect(store.homeRoute).toBe('/payments')
    expect(store.canAccess('Payments')).toBe(true)
    expect(store.canAccess('Users')).toBe(false)
  })

  it('register réussi connecte le nouvel administrateur', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: 'new-tok', user: { id: '9', name: 'Fatou', role: 'admin', restaurant_id: 'r1' } },
    })

    const store  = useAuthStore()
    const result = await store.register({ restaurant_name: 'Chez Fatou' })

    expect(api.post).toHaveBeenCalledWith('/register', { restaurant_name: 'Chez Fatou' })
    expect(result.success).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.homeRoute).toBe('/')
    expect(localStorage.getItem('token')).toBe('new-tok')
  })

  it('register échoué renvoie les erreurs de validation', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalide', errors: { email: ['Déjà utilisé'] } } },
    })

    const store  = useAuthStore()
    const result = await store.register({})

    expect(result.success).toBe(false)
    expect(result.errors.email[0]).toBe('Déjà utilisé')
    expect(store.token).toBeNull()
  })
})
