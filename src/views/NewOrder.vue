<template>
  <div class="dash">

    <!-- ── Sidebar ── -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h12" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="20" cy="18" r="3" fill="#a78bfa"/>
          </svg>
        </div>
        <span>Clic<em>&</em>Table</span>
      </div>

      <nav class="sidebar-nav">
        <span class="nav-section-label">Espace de travail</span>

        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span>Tableau de bord</span>
        </router-link>

        <router-link to="/tables" class="nav-item" :class="{ active: $route.path === '/tables' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 18h18M6 6v12M18 6v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Tables</span>
          <span class="nav-badge">{{ stats.occupiedTables }}/{{ stats.tables }}</span>
        </router-link>

        <router-link to="/orders" class="nav-item" :class="{ active: $route.path === '/orders' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.5"/>
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Commandes</span>
          <span v-if="stats.activeOrders > 0" class="nav-badge accent">{{ stats.activeOrders }}</span>
        </router-link>

        <router-link to="/menu" class="nav-item" :class="{ active: $route.path === '/menu' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Menu</span>
        </router-link>

        <router-link v-if="authStore.isKitchen" to="/kitchen" class="nav-item" :class="{ active: $route.path === '/kitchen' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 2v6a3 3 0 0 0 6 0V2M9 2v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M18 2c0 0 0 6-3 6s-3-6-3-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M3 14h18v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span>Cuisine</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-meta">
            <span class="user-name">{{ authStore.userName }}</span>
            <span class="user-role">{{ authStore.userRole }}</span>
          </div>
        </div>
        <button @click="logout" class="logout-btn" title="Déconnexion">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M3 12V7a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- ── Main content ── -->
    <main class="main">
      <div class="new-order-page">
        <div class="order-header">
          <div class="order-header-left">
            <h1>🆕 Nouvelle commande</h1>
            <div class="table-badge">
              <span class="table-icon">🍽️</span>
              <span class="table-number">Table {{ table?.number }}</span>
              <span class="table-capacity">{{ table?.capacity }} personnes</span>
            </div>
          </div>
          <div class="order-header-actions">
            <button @click="confirmOrder" :disabled="cart.length === 0" class="confirm-btn">
              <span>✅</span>
              <span>Valider</span>
              <span class="total-amount">{{ formatMoney(total) }}</span>
            </button>
          </div>
        </div>

        <div class="order-container">
          <!-- Menu Section -->
          <div class="menu-section">
            <div class="category-tabs">
              <button
                v-for="cat in categories"
                :key="cat.id"
                @click="selectedCategory = cat.id"
                :class="{ active: selectedCategory === cat.id }"
                class="category-tab"
              >
                <span class="category-icon">{{ getCategoryIcon(cat.name) }}</span>
                {{ cat.name }}
              </button>
            </div>

            <div class="items-grid">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                class="menu-item"
                :class="{ unavailable: !item.is_available }"
                @click="item.is_available && addToCart(item)"
              >
                <div class="item-info">
                  <h3>{{ item.name }}</h3>
                  <p class="item-description">{{ item.description || 'Plat délicieux' }}</p>
                  <div class="item-footer">
                    <span class="item-price">{{ formatMoney(item.price) }}</span>
                    <span v-if="item.preparation_time" class="prep-time">⏱️ {{ item.preparation_time }} min</span>
                  </div>
                </div>
                <button class="add-btn" :disabled="!item.is_available">+</button>
              </div>
              <div v-if="filteredItems.length === 0" class="empty-items">
                <span>📭</span>
                <p>Aucun plat dans cette catégorie</p>
              </div>
            </div>
          </div>

          <!-- Cart Section -->
          <div class="cart-section">
            <div class="cart-header">
              <h2>🛒 Votre commande</h2>
              <span class="cart-count">{{ cart.length }} article{{ cart.length !== 1 ? 's' : '' }}</span>
            </div>

            <div v-if="cart.length === 0" class="empty-cart">
              <span>🛍️</span>
              <p>Votre panier est vide</p>
              <small>Cliquez sur un plat pour l'ajouter</small>
            </div>

            <div v-else class="cart-items">
              <div v-for="(item, index) in cart" :key="index" class="cart-item">
                <div class="cart-item-info">
                  <h4>{{ item.name }}</h4>
                  <div class="cart-item-price">
                    {{ formatMoney(item.price) }} x {{ item.quantity }}
                  </div>
                </div>
                <div class="cart-item-actions">
                  <button @click="decrementQuantity(index)" class="qty-btn">-</button>
                  <span class="qty">{{ item.quantity }}</span>
                  <button @click="incrementQuantity(index)" class="qty-btn">+</button>
                  <button @click="removeItem(index)" class="remove-btn">🗑️</button>
                </div>
                <div class="cart-item-total">
                  {{ formatMoney(item.price * item.quantity) }}
                </div>
              </div>

              <div class="cart-summary">
                <div class="summary-line">
                  <span>Sous-total</span>
                  <span>{{ formatMoney(subtotal) }}</span>
                </div>
                <div class="summary-line">
                  <span>TVA (18%)</span>
                  <span>{{ formatMoney(tax) }}</span>
                </div>
                <div class="summary-line">
                  <span>Service (5%)</span>
                  <span>{{ formatMoney(service) }}</span>
                </div>
                <div class="summary-line total">
                  <span>TOTAL</span>
                  <span class="total-amount">{{ formatMoney(total) }}</span>
                </div>
              </div>

              <button @click="confirmOrder" class="checkout-btn">
                ✅ Confirmer la commande
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { toast } from 'vue-sonner'

export default {
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const table = ref(null)
    const categories = ref([])
    const allItems = ref([])
    const cart = ref([])
    const selectedCategory = ref(null)

    const stats = ref({
      tables: 0,
      occupiedTables: 0,
      activeOrders: 0,
    })

    const initials = computed(() => {
      return (authStore.userName || 'U')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const filteredItems = computed(() => {
      if (!selectedCategory.value) return []
      return allItems.value.filter(item => item.category_id === selectedCategory.value && item.is_available)
    })

    const subtotal = computed(() => {
      return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })

    const tax = computed(() => {
      return Math.floor(subtotal.value * 0.18)
    })

    const service = computed(() => {
      return Math.floor(subtotal.value * 0.05)
    })

    const total = computed(() => {
      return subtotal.value + tax.value + service.value
    })

    const formatMoney = (amount) => {
      return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
    }

    const getCategoryIcon = (categoryName) => {
      const icons = {
        'Entrées': '🥗',
        'Plats Principaux': '🍲',
        'Grillades': '🥩',
        'Desserts': '🍰',
        'Boissons': '🥤'
      }
      return icons[categoryName] || '🍽️'
    }

    const loadStats = async () => {
      try {
        const tables = await api.get('/tables')
        stats.value.tables = tables.data.length
        stats.value.occupiedTables = tables.data.filter(t => t.status === 'occupied').length
        const orders = await api.get('/orders')
        const allOrders = orders.data.data || orders.data
        stats.value.activeOrders = allOrders.filter(o => !['paid', 'cancelled'].includes(o.status)).length
      } catch (error) {
        console.error('Erreur chargement stats', error)
      }
    }

    const loadMenu = async () => {
      try {
        const res = await api.get('/menu')
        categories.value = res.data
        allItems.value = []
        for (const cat of categories.value) {
          if (cat.menu_items) {
            for (const item of cat.menu_items) {
              allItems.value.push({
                ...item,
                category_id: cat.id
              })
            }
          }
        }
        if (categories.value.length > 0) {
          selectedCategory.value = categories.value[0].id
        }
      } catch (error) {
        console.error('Erreur chargement menu:', error)
      }
    }

    const addToCart = (item) => {
      const existing = cart.value.find(i => i.id === item.id)
      if (existing) {
        existing.quantity++
      } else {
        cart.value.push({ ...item, quantity: 1 })
      }
    }

    const incrementQuantity = (index) => {
      cart.value[index].quantity++
    }

    const decrementQuantity = (index) => {
      if (cart.value[index].quantity > 1) {
        cart.value[index].quantity--
      } else {
        cart.value.splice(index, 1)
      }
    }

    const removeItem = (index) => {
      cart.value.splice(index, 1)
    }

    const confirmOrder = async () => {
      if (cart.value.length === 0) {
        toast.error('Panier vide', {
          description: 'Ajoutez des articles avant de valider',
          duration: 3000,
        })
        return
      }
      
      try {
        console.log('📝 Création commande pour table:', table.value.id)
        
        // Créer la commande
        const orderResponse = await api.post('/orders', { table_id: table.value.id })
        console.log('📦 Réponse brute:', orderResponse.data)
        
        // Récupérer l'ID correctement
        const orderId = orderResponse.data.data?.id || orderResponse.data.id
        console.log('✅ Order ID récupéré:', orderId)
        
        if (!orderId) {
          throw new Error('Impossible de récupérer l\'ID de la commande')
        }
        
        // Ajouter chaque article
        for (const item of cart.value) {
          console.log(`➕ Ajout: ${item.name} x${item.quantity}`)
          await api.post(`/orders/${orderId}/items`, {
            menu_item_id: item.id,
            quantity: item.quantity
          })
        }
        
        // Envoyer en cuisine
        console.log('👨‍🍳 Envoi en cuisine...')
        await api.post(`/orders/${orderId}/send-to-kitchen`)
        
        console.log('🎉 Commande terminée !')
        
        // ✅ TOAST DE SUCCÈS
        toast.success('Commande créée avec succès !', {
          description: `Table ${table.value.number} - Total ${formatMoney(total.value)} - ${cart.value.length} article(s)`,
          duration: 4000,
          action: {
            label: 'Voir les commandes',
            onClick: () => router.push('/orders')
          }
        })
        
        // Rediriger après 1.5s
        setTimeout(() => {
          router.push('/tables')
        }, 1500)
        
      } catch (error) {
        console.error('❌ ERREUR:', error)
        console.error('📋 Détails:', error.response?.data)
        
        // ❌ TOAST D'ERREUR
        toast.error('Erreur lors de la création', {
          description: error.response?.data?.message || error.message,
          duration: 4000,
        })
      }
    }

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    onMounted(async () => {
      const tableId = router.currentRoute.value.params.tableId
      try {
        const tables = await api.get('/tables')
        table.value = tables.data.find(t => t.id === tableId)
        await loadMenu()
        await loadStats()
        setInterval(loadStats, 30000)
      } catch (error) {
        console.error('Erreur chargement:', error)
      }
    })

    return {
      table,
      categories,
      allItems,
      cart,
      selectedCategory,
      filteredItems,
      subtotal,
      tax,
      service,
      total,
      stats,
      initials,
      authStore,
      formatMoney,
      getCategoryIcon,
      addToCart,
      incrementQuantity,
      decrementQuantity,
      removeItem,
      confirmOrder,
      logout
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

.dash {
  display: flex;
  min-height: 100vh;
  background: #f4f4f6;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
}

/* Sidebar */
.sidebar {
  width: 232px;
  flex-shrink: 0;
  background: #0f0f12;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 16px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.02em;
}

.sidebar-brand em {
  font-style: normal;
  color: #a78bfa;
}

.brand-icon {
  width: 30px;
  height: 30px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 8px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 400;
  color: rgba(255,255,255,0.5);
  transition: all 0.15s;
}

.nav-item:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.9);
}

.nav-item.active {
  background: rgba(124,58,237,0.18);
  color: #c4b5fd;
}

.nav-item span:first-of-type {
  flex: 1;
}

.nav-badge {
  font-size: 11px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  padding: 2px 7px;
  border-radius: 20px;
  font-weight: 500;
}

.nav-badge.accent {
  background: rgba(124,58,237,0.3);
  color: #c4b5fd;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-chip {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(124,58,237,0.3);
  color: #c4b5fd;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  text-transform: capitalize;
}

.logout-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(239,68,68,0.15);
  color: #fca5a5;
}

/* Main */
.main {
  flex: 1;
  min-width: 0;
  padding: 24px 32px;
  overflow-y: auto;
}

.new-order-page {
  max-width: 1400px;
  margin: 0 auto;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.order-header-left h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a2e;
}

.table-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px 20px;
  border-radius: 40px;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.table-icon {
  font-size: 16px;
}

.table-number {
  font-weight: 600;
  color: #7c3aed;
}

.table-capacity {
  font-size: 12px;
  color: #6b7280;
}

.order-header-actions {
  display: flex;
  gap: 16px;
}

.confirm-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16,185,129,0.3);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.total-amount {
  font-size: 16px;
  font-weight: 700;
}

.order-container {
  display: flex;
  gap: 24px;
  height: calc(100vh - 140px);
}

/* Menu Section */
.menu-section {
  flex: 2;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.category-tabs {
  display: flex;
  gap: 8px;
  padding: 20px 20px 0 20px;
  border-bottom: 2px solid #f0f0f5;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: none;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s;
}

.category-tab:hover {
  background: #f3f4f6;
  color: #374151;
}

.category-tab.active {
  background: #7c3aed;
  color: white;
}

.category-icon {
  font-size: 16px;
}

.items-grid {
  padding: 20px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #faf9ff;
  border: 1px solid #e9e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover:not(.unavailable) {
  transform: translateY(-2px);
  border-color: #7c3aed;
  box-shadow: 0 8px 20px rgba(124,58,237,0.1);
}

.menu-item.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #1f2937;
}

.item-description {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 8px 0;
}

.item-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-price {
  font-weight: 700;
  color: #10b981;
  font-size: 14px;
}

.prep-time {
  font-size: 11px;
  color: #9ca3af;
}

.add-btn {
  width: 36px;
  height: 36px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-btn:hover:not(:disabled) {
  background: #6d28d9;
  transform: scale(1.05);
}

.add-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* Cart Section */
.cart-section {
  flex: 1;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #f0f0f5;
}

.cart-header h2 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.cart-count {
  background: #7c3aed;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f5;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1f2937;
}

.cart-item-price {
  font-size: 12px;
  color: #9ca3af;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 12px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: #e5e7eb;
}

.qty {
  min-width: 30px;
  text-align: center;
  font-weight: 500;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  transition: all 0.2s;
  border-radius: 8px;
}

.remove-btn:hover {
  background: #fee2e2;
}

.cart-item-total {
  font-weight: 600;
  min-width: 80px;
  text-align: right;
  color: #10b981;
}

.cart-summary {
  background: #faf9ff;
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.summary-line.total {
  font-weight: 700;
  font-size: 16px;
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 12px;
  color: #1f2937;
}

.total-amount {
  color: #10b981;
  font-weight: 700;
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16,185,129,0.3);
}

.empty-cart, .empty-items {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-cart span, .empty-items span {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty-cart p, .empty-items p {
  margin: 0;
  font-size: 16px;
}

.empty-cart small {
  font-size: 12px;
  display: block;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .sidebar { display: none; }
  .main { padding: 20px 16px; }
  .order-container { flex-direction: column; height: auto; }
  .order-header { flex-direction: column; gap: 16px; align-items: flex-start; }
  .confirm-btn { width: 100%; justify-content: center; }
}
</style>