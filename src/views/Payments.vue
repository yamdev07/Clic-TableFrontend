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
        <router-link to="/" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span>Tableau de bord</span>
        </router-link>
        <router-link to="/tables" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 18h18M6 6v12M18 6v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Tables</span>
        </router-link>
        <router-link to="/orders" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.5"/>
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Commandes</span>
        </router-link>
        <router-link to="/menu" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Menu</span>
        </router-link>
        <router-link v-if="authStore.isKitchen" to="/kitchen" class="nav-item">
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
      <div class="payments-layout">
        <div class="topbar">
          <div>
            <h1 class="page-title">💰 Paiements</h1>
            <p class="page-sub">Gestion des encaissements</p>
          </div>
          <div class="topbar-actions">
            <button class="btn-ghost" @click="loadData">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <h3>CA Total</h3>
              <p class="stat-number">{{ formatMoney(totalRevenue) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🟢</div>
            <div class="stat-info">
              <h3>Payé</h3>
              <p class="stat-number">{{ formatMoney(paidAmount) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔴</div>
            <div class="stat-info">
              <h3>Impayé</h3>
              <p class="stat-number">{{ formatMoney(dueAmount) }}</p>
            </div>
          </div>
        </div>

        <!-- Orders list -->
        <div class="orders-section">
          <div class="section-header">
            <h2 class="section-title">Commandes à encaisser</h2>
            <div class="filter-chips">
              <button
                v-for="filter in filters"
                :key="filter.value"
                class="filter-chip"
                :class="{ active: activeFilter === filter.value }"
                @click="activeFilter = filter.value"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <div class="orders-grid">
            <div
              v-for="order in filteredOrders"
              :key="order.id"
              class="order-card"
              @click="openPaymentModal(order)"
            >
              <div class="order-card-header">
                <span class="order-number">#{{ order.order_number }}</span>
                <span class="order-status" :class="getPaymentStatus(order).class">
                  {{ getPaymentStatus(order).label }}
                </span>
              </div>
              <div class="order-card-body">
                <div class="order-table">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M3 18h18M6 6v12M18 6v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  Table {{ order.table?.number }}
                </div>
                <div class="order-total">{{ formatMoney(order.total) }}</div>
                <div class="order-paid">
                  Payé: {{ formatMoney(order.paid_amount || 0) }}
                </div>
                <div class="order-due" :class="{ negative: (order.due_amount || 0) > 0 }">
                  Reste: {{ formatMoney(order.due_amount || 0) }}
                </div>
              </div>
              <div class="order-card-footer">
                <button class="pay-btn">
                  💰 Encaisser
                </button>
              </div>
            </div>
            <div v-if="filteredOrders.length === 0" class="empty-state">
              Aucune commande à afficher
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ── Payment Modal ── -->
    <Transition name="modal">
      <div v-if="selectedOrder" class="modal-overlay" @click="closeModal">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">Encaissement</p>
              <h2 class="modal-title">Commande #{{ selectedOrder.order_number }}</h2>
            </div>
            <button class="modal-close" @click="closeModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="order-summary">
              <div class="summary-row">
                <span>Table</span>
                <span class="strong">Table {{ selectedOrder.table?.number }}</span>
              </div>
              <div class="summary-row">
                <span>Total TTC</span>
                <span class="strong">{{ formatMoney(selectedOrder.total) }}</span>
              </div>
              <div class="summary-row">
                <span>Déjà payé</span>
                <span>{{ formatMoney(selectedOrder.paid_amount || 0) }}</span>
              </div>
              <div class="summary-row highlight">
                <span>Reste à payer</span>
                <span class="due-highlight">{{ formatMoney(selectedOrder.due_amount || 0) }}</span>
              </div>
            </div>

            <div class="payment-form">
              <div class="form-group">
                <label>Mode de paiement</label>
                <div class="method-buttons">
                  <button
                    v-for="method in paymentMethods"
                    :key="method.value"
                    class="method-btn"
                    :class="{ active: paymentMethod === method.value }"
                    @click="paymentMethod = method.value"
                  >
                    {{ method.icon }} {{ method.label }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Montant à payer</label>
                <input
                  type="number"
                  v-model="paymentAmount"
                  class="amount-input"
                  :max="selectedOrder.due_amount"
                  step="100"
                />
                <div class="quick-amounts">
                  <button @click="paymentAmount = selectedOrder.due_amount" class="quick-btn">
                    Montant exact
                  </button>
                  <button @click="paymentAmount = Math.ceil(selectedOrder.due_amount / 100) * 100" class="quick-btn">
                    Arrondir supérieur
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Référence (optionnel)</label>
                <input type="text" v-model="paymentReference" placeholder="N° transaction, chèque..." />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="action-btn ghost" @click="closeModal">Annuler</button>
            <button
              class="action-btn primary"
              :disabled="!paymentAmount || paymentAmount <= 0 || paymentAmount > (selectedOrder.due_amount || 0)"
              @click="processPayment"
            >
              Encaisser {{ formatMoney(paymentAmount) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const orders = ref([])
const activeFilter = ref('all')
const selectedOrder = ref(null)
const paymentMethod = ref('cash')
const paymentAmount = ref(0)
const paymentReference = ref('')

const filters = [
  { value: 'all', label: 'Toutes' },
  { value: 'due', label: 'En attente' },
  { value: 'paid', label: 'Payées' },
]

const paymentMethods = [
  { value: 'cash', label: 'Espèces', icon: '💵' },
  { value: 'card', label: 'Carte bancaire', icon: '💳' },
  { value: 'wave', label: 'Wave', icon: '📱' },
  { value: 'orange_money', label: 'Orange Money', icon: '📱' },
]

const initials = computed(() => {
  return (authStore.userName || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const totalRevenue = computed(() =>
  orders.value.reduce((sum, o) => sum + (o.total || 0), 0)
)

const paidAmount = computed(() =>
  orders.value.reduce((sum, o) => sum + (o.paid_amount || 0), 0)
)

const dueAmount = computed(() =>
  orders.value.reduce((sum, o) => sum + (o.due_amount || 0), 0)
)

const filteredOrders = computed(() => {
  if (activeFilter.value === 'paid') {
    return orders.value.filter(o => (o.due_amount || 0) <= 0)
  }
  if (activeFilter.value === 'due') {
    return orders.value.filter(o => (o.due_amount || 0) > 0)
  }
  return orders.value
})

const getPaymentStatus = (order) => {
  const due = order.due_amount || 0
  if (due <= 0) return { label: 'Payé', class: 'paid' }
  if (due === order.total) return { label: 'Impayé', class: 'unpaid' }
  return { label: 'Partiel', class: 'partial' }
}

const loadData = async () => {
  try {
    const response = await api.get('/orders')
    orders.value = response.data.data || response.data
  } catch (error) {
    console.error('Erreur chargement commandes', error)
  }
}

const openPaymentModal = (order) => {
  selectedOrder.value = order
  paymentMethod.value = 'cash'
  paymentAmount.value = order.due_amount || 0
  paymentReference.value = ''
}

const closeModal = () => {
  selectedOrder.value = null
}

const processPayment = async () => {
  if (!selectedOrder.value) return

  try {
    await api.post(`/orders/${selectedOrder.value.id}/payments`, {
      amount: paymentAmount.value,
      method: paymentMethod.value,
      reference: paymentReference.value || null
    })

    await loadData()
    closeModal()
  } catch (error) {
    console.error('Erreur paiement', error)
    alert('Erreur lors du paiement')
  }
}

const formatMoney = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadData()
  setInterval(loadData, 30000)
})
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
  padding: 32px 36px;
}

.payments-layout {
  max-width: 1400px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #0f0f12;
  margin: 0 0 3px;
  letter-spacing: -0.03em;
}

.page-sub {
  font-size: 13px;
  color: #9b9bab;
  margin: 0;
}

.btn-ghost {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: #6b6b7b;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-ghost:hover {
  border-color: #c4b5fd;
  color: #7c3aed;
  background: #f5f3ff;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 40px;
}

.stat-info h3 {
  font-size: 12px;
  font-weight: 500;
  color: #9b9bab;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #0f0f12;
  margin: 0;
}

/* Orders section */
.orders-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e4e4ec;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e4ec;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.filter-chips {
  display: flex;
  gap: 8px;
}

.filter-chip {
  padding: 6px 14px;
  background: #f4f4f6;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-chip.active {
  background: #0f0f12;
  color: white;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 20px;
}

.order-card {
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.15s;
  background: white;
}

.order-card:hover {
  border-color: #c4b5fd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-number {
  font-size: 15px;
  font-weight: 600;
  color: #0f0f12;
}

.order-status {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.order-status.paid {
  background: #dcfce7;
  color: #166534;
}

.order-status.unpaid {
  background: #fee2e2;
  color: #991b1b;
}

.order-status.partial {
  background: #fef9c3;
  color: #854d0e;
}

.order-card-body {
  margin-bottom: 16px;
}

.order-table {
  font-size: 12px;
  color: #9b9bab;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.order-total {
  font-size: 18px;
  font-weight: 600;
  color: #0f0f12;
  margin-bottom: 4px;
}

.order-paid {
  font-size: 12px;
  color: #48bb78;
}

.order-due {
  font-size: 12px;
  color: #f56565;
}

.order-due.negative {
  color: #48bb78;
}

.pay-btn {
  width: 100%;
  padding: 10px;
  background: #0f0f12;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.15s;
}

.pay-btn:hover {
  background: #2a2a35;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #c5c5d0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e4e4ec;
}

.modal-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
  margin: 0 0 4px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f0f12;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9b9bab;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
}

.modal-close:hover {
  background: #f0f0f5;
  color: #3f3f4e;
}

.modal-body {
  padding: 20px 24px;
}

.order-summary {
  background: #fafafc;
  border: 1px solid #f0f0f5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.summary-row.highlight {
  border-top: 1px solid #e4e4ec;
  margin-top: 8px;
  padding-top: 12px;
  font-weight: 600;
}

.due-highlight {
  color: #f56565;
  font-size: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #6b6b7b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.method-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.method-btn {
  padding: 8px 16px;
  background: #f4f4f6;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.method-btn.active {
  background: #0f0f12;
  border-color: #0f0f12;
  color: white;
}

.amount-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
}

.quick-amounts {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.quick-btn {
  padding: 6px 12px;
  background: #f4f4f6;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #e4e4ec;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn.ghost {
  background: none;
  border: 1px solid #e4e4ec;
  color: #6b6b7b;
}

.action-btn.ghost:hover {
  background: #f4f4f6;
}

.action-btn.primary {
  background: #0f0f12;
  color: white;
  border: none;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2a2a35;
}

.action-btn.primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Modal transition */
.modal-enter-active, .modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

@media (max-width: 820px) {
  .sidebar { display: none; }
  .main { padding: 20px 16px; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>