<template>
  <div class="orders-root">

    <!-- ── Main ── -->
    <div class="main">

      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h1 class="page-title">Commandes</h1>
          <p class="page-sub">{{ orders.length }} commande{{ orders.length !== 1 ? 's' : '' }} · actualisé à {{ lastRefresh }}</p>
        </div>
        <div class="topbar-actions">
          <!-- View toggle -->
          <div class="view-toggle">
            <button :class="{ active: view === 'kanban' }" @click="view = 'kanban'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="5" height="18" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <rect x="10" y="3" width="5" height="18" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              Kanban
            </button>
            <button :class="{ active: view === 'list' }" @click="view = 'list'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Liste
            </button>
          </div>

          <button class="btn-ghost" @click="loadOrders">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Actualiser
          </button>

          <button class="btn-primary" @click="openNewOrder">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Nouvelle commande
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input
          v-model="search"
          class="search-input"
          placeholder="Rechercher une commande, table..."
        />
        <div class="filter-chips">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            class="filter-chip"
            :class="{ active: activeFilter === f.value }"
            @click="activeFilter = f.value"
          >
            <span class="chip-dot" :class="f.value !== 'all' ? f.value : ''"></span>
            {{ f.label }}
            <span class="chip-count">{{ getStatusCount(f.value) }}</span>
          </button>
        </div>
      </div>

      <!-- ── LOADING SKELETON ── -->
      <div v-if="loading" class="skeleton-board">
        <div v-for="n in 4" :key="n" class="skeleton-col">
          <div class="sk-header"></div>
          <div v-for="m in 2" :key="m" class="sk-card"></div>
        </div>
      </div>

      <!-- ── KANBAN VIEW ── -->
      <div v-else-if="view === 'kanban'" class="kanban-board">
        <div v-for="col in kanbanCols" :key="col.status" class="kanban-col">
          <div class="col-header">
            <div class="col-title-row">
              <span class="col-dot" :class="col.status"></span>
              <span class="col-title">{{ col.label }}</span>
            </div>
            <span class="col-count">{{ getOrdersByStatus(col.status).length }}</span>
          </div>
          <div class="col-cards">
            <div
              v-for="order in getOrdersByStatus(col.status)"
              :key="order.id"
              class="order-card"
              @click="openDetail(order)"
            >
              <div class="card-top">
                <span class="card-num">#{{ order.order_number }}</span>
                <span class="card-time">{{ formatTime(order.created_at) }}</span>
              </div>
              <div class="card-table">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M3 18h18M6 6v12M18 6v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                Table {{ order.table?.number || '—' }}
              </div>
              <div class="card-items">
                {{ order.items?.length || 0 }} article{{ (order.items?.length || 0) !== 1 ? 's' : '' }}
              </div>
              <div class="card-footer">
                <span class="card-total">{{ formatMoney(order.total) }}</span>
                <div class="card-actions">
                  <button
                    v-for="next in getNextStatuses(order.status)"
                    :key="next.value"
                    class="card-btn"
                    :class="next.cls"
                    @click.stop="updateStatus(order, next.value)"
                  >{{ next.label }}</button>
                </div>
              </div>
            </div>
            <div v-if="getOrdersByStatus(col.status).length === 0" class="col-empty">
              Aucune commande
            </div>
          </div>
        </div>
      </div>

      <!-- ── LIST VIEW ── -->
      <div v-else-if="view === 'list'" class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th @click="sortBy('order_number')" class="sortable">
                N° commande
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke="currentColor" stroke-width="2"/></svg>
              </th>
              <th>Table</th>
              <th>Articles</th>
              <th @click="sortBy('total')" class="sortable">
                Total
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke="currentColor" stroke-width="2"/></svg>
              </th>
              <th>Statut</th>
              <th @click="sortBy('created_at')" class="sortable">
                Date
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke="currentColor" stroke-width="2"/></svg>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="data-row"
              @click="openDetail(order)"
            >
              <td class="order-num">#{{ order.order_number }}</td>
              <td>Table {{ order.table?.number || '—' }}</td>
              <td class="muted">{{ order.items?.length || 0 }} article{{ (order.items?.length || 0) !== 1 ? 's' : '' }}</td>
              <td class="order-total">{{ formatMoney(order.total) }}</td>
              <td>
                <span class="status-pill" :class="order.status">{{ getStatusLabel(order.status) }}</span>
              </td>
              <td class="order-date">{{ formatDate(order.created_at) }}</td>
              <td>
                <button class="row-action" @click.stop="openDetail(order)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="7" class="empty-row">Aucune commande trouvée</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Order Detail Modal ── -->
    <Transition name="modal">
      <div v-if="selectedOrder" class="modal-overlay" @click="closeDetail">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">Commande</p>
              <h2 class="modal-title">#{{ selectedOrder.order_number }}</h2>
            </div>
            <div class="modal-header-right">
              <span class="status-pill" :class="selectedOrder.status">{{ getStatusLabel(selectedOrder.status) }}</span>
              <button class="modal-close" @click="closeDetail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="modal-meta">
            <div class="meta-cell">
              <span class="meta-label">Table</span>
              <span class="meta-val">Table {{ selectedOrder.table?.number || '—' }}</span>
            </div>
            <div class="meta-cell">
              <span class="meta-label">Date</span>
              <span class="meta-val">{{ formatDate(selectedOrder.created_at) }}</span>
            </div>
            <div class="meta-cell">
              <span class="meta-label">Total</span>
              <span class="meta-val strong">{{ formatMoney(selectedOrder.total) }}</span>
            </div>
          </div>

          <!-- Items -->
          <div class="items-section">
            <p class="items-title">Articles commandés</p>
            <div class="items-list">
              <div
                v-for="item in selectedOrder.items"
                :key="item.id"
                class="item-row"
              >
                <div class="item-info">
                  <span class="item-qty">×{{ item.quantity }}</span>
                  <span class="item-name">{{ item.menu_item?.name || item.item_name || '—' }}</span>
                </div>
                <span class="item-price">{{ formatMoney((item.unit_price || 0) * (item.quantity || 1)) }}</span>
              </div>
              <div v-if="!selectedOrder.items || selectedOrder.items.length === 0" class="items-empty">
                Aucun article
              </div>
            </div>
            <div class="items-total">
              <span>Total</span>
              <span class="items-total-val">{{ formatMoney(selectedOrder.total) }}</span>
            </div>
          </div>

          <!-- Status transitions -->
          <div class="modal-transitions">
            <p class="items-title">Changer le statut</p>
            <div class="transitions-row">
              <button
                v-for="next in getAllNextStatuses(selectedOrder.status)"
                :key="next.value"
                class="trans-btn"
                :class="next.cls"
                @click="updateStatus(selectedOrder, next.value)"
              >
                {{ next.label }}
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="action-btn ghost" @click="closeDetail">Fermer</button>
            <button
              v-if="selectedOrder.status !== 'paid' && selectedOrder.status !== 'cancelled'"
              class="action-btn danger"
              @click="updateStatus(selectedOrder, 'cancelled')"
            >
              Annuler la commande
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── New Order Modal ── -->
    <Transition name="modal">
      <div v-if="showNewOrder" class="modal-overlay" @click="showNewOrder = false">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">Créer</p>
              <h2 class="modal-title">Nouvelle commande</h2>
            </div>
            <button class="modal-close" @click="showNewOrder = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="new-order-body">
            <p class="new-order-hint">Sélectionnez une table pour démarrer une nouvelle commande.</p>
            <div class="table-select-grid">
              <button
                v-for="table in availableTables"
                :key="table.id"
                class="table-select-btn"
                :class="{ selected: newOrderTableId === table.id }"
                @click="newOrderTableId = table.id"
              >
                <span class="ts-num">{{ table.number }}</span>
                <span class="ts-cap">{{ table.capacity }}p</span>
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn ghost" @click="showNewOrder = false">Annuler</button>
            <button
              class="action-btn primary"
              :disabled="!newOrderTableId"
              @click="createOrder"
            >
              Démarrer la commande
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import api from '@/services/api'

const orders = ref([])
const availableTables = ref([])
const loading = ref(true)
const view = ref('kanban')
const search = ref('')
const activeFilter = ref('all')
const selectedOrder = ref(null)
const showNewOrder = ref(false)
const newOrderTableId = ref(null)
const sortKey = ref('created_at')
const sortDir = ref(-1)
const lastRefresh = ref('')
let interval = null

const statusFilters = [
  { value: 'all',         label: 'Toutes' },
  { value: 'open',        label: 'Ouvertes' },
  { value: 'in_progress', label: 'En préparation' },
  { value: 'ready',       label: 'Prêtes' },
  { value: 'served',      label: 'Servies' },
  { value: 'paid',        label: 'Payées' },
  { value: 'cancelled',   label: 'Annulées' },
]

const kanbanCols = [
  { status: 'open',        label: 'Ouvertes' },
  { status: 'in_progress', label: 'En préparation' },
  { status: 'ready',       label: 'Prêtes' },
  { status: 'served',      label: 'Servies' },
  { status: 'paid',        label: 'Payées' },
]

const nextStatusMap = {
  open:        [{ value: 'in_progress', label: 'Préparer',  cls: 'blue'   }],
  in_progress: [{ value: 'ready',       label: 'Prêt',      cls: 'green'  }],
  ready:       [{ value: 'served',      label: 'Servir',    cls: 'purple' }],
  served:      [{ value: 'paid',        label: 'Encaisser', cls: 'dark'   }],
  paid:        [],
  cancelled:   [],
}

const activeCount = computed(() =>
  orders.value.filter(o => !['paid', 'cancelled'].includes(o.status)).length
)

const todayOrders = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return orders.value.filter(o => o.created_at?.split('T')[0] === today)
})

const todayRevenue = computed(() =>
  todayOrders.value
    .filter(o => o.status === 'paid')
    .reduce((s, o) => s + (o.total || 0), 0)
)

const filteredOrders = computed(() => {
  let list = orders.value
  if (activeFilter.value !== 'all') list = list.filter(o => o.status === activeFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(o =>
      o.order_number?.toString().includes(q) ||
      o.table?.number?.toString().includes(q)
    )
  }
  return [...list].sort((a, b) => {
    const va = a[sortKey.value], vb = b[sortKey.value]
    return va < vb ? sortDir.value : va > vb ? -sortDir.value : 0
  })
})

const getOrdersByStatus = (status) =>
  filteredOrders.value.filter(o => o.status === status)

const getStatusCount = (status) =>
  status === 'all' ? orders.value.length : orders.value.filter(o => o.status === status).length

const getNextStatuses = (status) => nextStatusMap[status] || []
const getAllNextStatuses = (status) => nextStatusMap[status] || []

const loadOrders = async () => {
  loading.value = true
  try {
    const res = await api.get('/orders')
    orders.value = res.data.data || res.data
    lastRefresh.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    console.error('Erreur commandes', e)
  } finally {
    loading.value = false
  }
}

const loadTables = async () => {
  try {
    const res = await api.get('/tables')
    availableTables.value = res.data.filter(t => t.status === 'free')
  } catch (e) { console.error('Erreur tables', e) }
}

const updateStatus = async (order, newStatus) => {
  try {
    await api.patch(`/orders/${order.id}/status`, { status: newStatus })
    order.status = newStatus
    if (selectedOrder.value?.id === order.id) selectedOrder.value.status = newStatus
    await loadOrders()
  } catch (e) { console.error('Erreur statut', e) }
}

const openDetail = (order) => { selectedOrder.value = order }
const closeDetail = () => { selectedOrder.value = null }

const openNewOrder = async () => {
  await loadTables()
  newOrderTableId.value = null
  showNewOrder.value = true
}

const createOrder = async () => {
  try {
    await api.post('/orders', { table_id: newOrderTableId.value })
    showNewOrder.value = false
    await loadOrders()
  } catch (e) { console.error('Erreur création', e) }
}

const sortBy = (key) => {
  if (sortKey.value === key) sortDir.value *= -1
  else { sortKey.value = key; sortDir.value = -1 }
}

const formatMoney = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount || 0)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const getStatusLabel = (s) => ({
  open: 'Ouverte', in_progress: 'En préparation', ready: 'Prête',
  served: 'Servie', paid: 'Payée', cancelled: 'Annulée',
}[s] || s)

onMounted(() => {
  loadOrders()
  interval = setInterval(loadOrders, 30000)
})
onBeforeUnmount(() => clearInterval(interval))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Root ── */
.orders-root {
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #f4f4f6;
  color: #0f0f12;
}

/* ── Main ── */
.main {
  flex: 1;
  min-width: 0;
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-x: hidden;
}

/* ── Topbar ── */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #0f0f12;
  letter-spacing: -0.03em;
  margin: 0 0 3px;
}
.page-sub { font-size: 13px; color: #9b9bab; margin: 0; }
.topbar-actions { display: flex; align-items: center; gap: 10px; }

.view-toggle {
  display: flex;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  overflow: hidden;
}
.view-toggle button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 500;
  color: #9b9bab;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.view-toggle button.active { background: #0f0f12; color: white; }
.view-toggle button:not(.active):hover { background: #f4f4f6; color: #3f3f4e; }

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
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.btn-ghost:hover { border-color: #c4b5fd; color: #7c3aed; background: #f5f3ff; }

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #0f0f12;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.btn-primary:hover { background: #2a2a35; }

/* ── Filters ── */
.filters-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.search-input {
  padding: 9px 14px;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
  background: white;
  outline: none;
  width: 220px;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
.search-input::placeholder { color: #c5c5d0; }
.filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  color: #6b6b7b;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.filter-chip:hover { border-color: #c4b5fd; color: #7c3aed; }
.filter-chip.active { background: #0f0f12; border-color: #0f0f12; color: white; }
.filter-chip.active .chip-dot { border-color: rgba(255,255,255,0.3); }
.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: transparent;
  border: 1.5px solid #e4e4ec;
}
.chip-dot.open        { background: #fbbf24; border-color: #fbbf24; }
.chip-dot.in_progress { background: #60a5fa; border-color: #60a5fa; }
.chip-dot.ready       { background: #34d399; border-color: #34d399; }
.chip-dot.served      { background: #a78bfa; border-color: #a78bfa; }
.chip-dot.paid        { background: #34d399; border-color: #34d399; }
.chip-dot.cancelled   { background: #f87171; border-color: #f87171; }
.chip-count {
  font-size: 10px;
  font-weight: 600;
  background: rgba(0,0,0,0.07);
  color: inherit;
  padding: 1px 6px;
  border-radius: 99px;
}
.filter-chip.active .chip-count { background: rgba(255,255,255,0.15); }

/* ── Kanban ── */
.kanban-board {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 16px;
  align-items: flex-start;
}
.kanban-col {
  width: 240px;
  flex-shrink: 0;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.col-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f5;
}
.col-title-row { display: flex; align-items: center; gap: 8px; }
.col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.col-dot.open        { background: #fbbf24; }
.col-dot.in_progress { background: #60a5fa; }
.col-dot.ready       { background: #34d399; }
.col-dot.served      { background: #a78bfa; }
.col-dot.paid        { background: #34d399; }
.col-dot.cancelled   { background: #f87171; }
.col-title { font-size: 13px; font-weight: 600; color: #0f0f12; }
.col-count {
  font-size: 11px;
  font-weight: 600;
  background: #f0f0f5;
  color: #6b6b7b;
  padding: 2px 7px;
  border-radius: 99px;
}
.col-cards {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
}
.col-empty {
  text-align: center;
  font-size: 12px;
  color: #c5c5d0;
  padding: 20px 0;
}

/* ── Order card ── */
.order-card {
  background: #fafafc;
  border: 1px solid #f0f0f5;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.15s;
}
.order-card:hover { border-color: #c4b5fd; background: white; transform: translateY(-1px); }
.card-top { display: flex; justify-content: space-between; align-items: center; }
.card-num { font-size: 13px; font-weight: 600; color: #0f0f12; }
.card-time { font-size: 11px; color: #9b9bab; }
.card-table {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6b6b7b;
}
.card-items { font-size: 11.5px; color: #9b9bab; }
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f5;
}
.card-total { font-size: 13px; font-weight: 600; color: #0f0f12; }
.card-actions { display: flex; gap: 5px; }
.card-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.card-btn.blue   { background: #dbeafe; color: #1e40af; }
.card-btn.green  { background: #dcfce7; color: #166534; }
.card-btn.purple { background: #ede9fe; color: #6d28d9; }
.card-btn.dark   { background: #0f0f12; color: white; }
.card-btn:hover  { filter: brightness(0.95); }

/* ── List table ── */
.table-wrap {
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  overflow: hidden;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.data-table thead th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
  background: #fafafc;
  border-bottom: 1px solid #e4e4ec;
}
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: #3f3f4e; }
.sortable svg { opacity: 0.5; }
.data-row td {
  padding: 13px 16px;
  border-bottom: 1px solid #f0f0f5;
  color: #3f3f4e;
}
.data-row:last-child td { border-bottom: none; }
.data-row:hover td { background: #fafafc; cursor: pointer; }
.order-num { font-weight: 600; color: #0f0f12 !important; }
.order-total { font-weight: 500; color: #0f0f12 !important; }
.order-date { color: #9b9bab !important; font-size: 12.5px; }
.muted { color: #9b9bab !important; }
.empty-row {
  text-align: center;
  padding: 40px !important;
  color: #c5c5d0 !important;
}
.row-action {
  background: none;
  border: 1px solid #e4e4ec;
  border-radius: 6px;
  padding: 5px 8px;
  cursor: pointer;
  color: #9b9bab;
  display: flex;
  align-items: center;
  transition: all 0.15s;
}
.row-action:hover { border-color: #c4b5fd; color: #7c3aed; background: #f5f3ff; }

/* ── Status pills ── */
.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 500;
}
.status-pill.open        { background: #fef9c3; color: #854d0e; }
.status-pill.in_progress { background: #dbeafe; color: #1e40af; }
.status-pill.ready       { background: #dcfce7; color: #166534; }
.status-pill.served      { background: #ede9fe; color: #6d28d9; }
.status-pill.paid        { background: #dcfce7; color: #166534; }
.status-pill.cancelled   { background: #fee2e2; color: #991b1b; }

/* ── Modal shared ── */
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
  padding: 28px;
  width: 90%;
  max-width: 460px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2);
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.modal-header-right { display: flex; align-items: center; gap: 10px; }
.modal-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
  margin: 0 0 4px;
}
.modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #0f0f12;
  letter-spacing: -0.03em;
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
  transition: all 0.15s;
}
.modal-close:hover { background: #f0f0f5; color: #3f3f4e; }

/* ── Modal meta ── */
.modal-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}
.meta-cell {
  background: #fafafc;
  border: 1px solid #f0f0f5;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
}
.meta-val { font-size: 14px; font-weight: 500; color: #0f0f12; }
.meta-val.strong { font-size: 15px; font-weight: 600; }

/* ── Items ── */
.items-section { margin-bottom: 20px; }
.items-title {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
  margin: 0 0 10px;
}
.items-list {
  border: 1px solid #f0f0f5;
  border-radius: 10px;
  overflow: hidden;
}
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f5;
}
.item-row:last-child { border-bottom: none; }
.item-info { display: flex; align-items: center; gap: 10px; }
.item-qty {
  font-size: 12px;
  font-weight: 600;
  color: #7c3aed;
  background: #f5f3ff;
  padding: 2px 8px;
  border-radius: 6px;
}
.item-name { font-size: 13.5px; color: #0f0f12; }
.item-price { font-size: 13px; font-weight: 500; color: #0f0f12; }
.items-empty {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #c5c5d0;
}
.items-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #0f0f12;
  border-radius: 0 0 10px 10px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  margin-top: -1px;
}
.items-total-val { font-size: 15px; font-weight: 600; color: white; }

/* ── Transitions row ── */
.modal-transitions { margin-bottom: 20px; }
.transitions-row { display: flex; gap: 8px; flex-wrap: wrap; }
.trans-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.trans-btn.blue   { background: #dbeafe; color: #1e40af; }
.trans-btn.green  { background: #dcfce7; color: #166534; }
.trans-btn.purple { background: #ede9fe; color: #6d28d9; }
.trans-btn.dark   { background: #0f0f12; color: white; }
.trans-btn:hover  { filter: brightness(0.94); }

/* ── Modal footer ── */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f5;
}
.action-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.action-btn.primary { background: #0f0f12; color: white; }
.action-btn.primary:hover:not(:disabled) { background: #2a2a35; }
.action-btn.primary:disabled { opacity: 0.4; cursor: not-allowed; }
.action-btn.ghost { background: none; border: 1px solid #e4e4ec; color: #6b6b7b; }
.action-btn.ghost:hover { background: #f4f4f6; }
.action-btn.danger { background: #fee2e2; color: #991b1b; }
.action-btn.danger:hover { background: #fecaca; }

/* ── New order modal ── */
.new-order-body { margin-bottom: 20px; }
.new-order-hint { font-size: 13.5px; color: #6b6b7b; margin: 0 0 16px; line-height: 1.6; }
.table-select-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
}
.table-select-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 12px 8px;
  background: #fafafc;
  border: 1px solid #e4e4ec;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}
.table-select-btn:hover { border-color: #c4b5fd; background: #f5f3ff; }
.table-select-btn.selected { background: #0f0f12; border-color: #0f0f12; }
.ts-num { font-size: 16px; font-weight: 600; color: #0f0f12; }
.ts-cap { font-size: 10px; color: #9b9bab; }
.table-select-btn.selected .ts-num { color: white; }
.table-select-btn.selected .ts-cap { color: rgba(255,255,255,0.4); }

/* ── Modal transition ── */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }

/* ── Responsive ── */
@media (max-width: 820px) {
  .main { padding: 20px 16px; }
  .modal-meta { grid-template-columns: 1fr 1fr; }
}
/* ── Loading skeleton ── */
.skeleton-board {
  display: flex;
  gap: 16px;
  padding: 0 0 24px;
}

.skeleton-col {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-header {
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e4e4ec 25%, #f0f0f7 50%, #e4e4ec 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.sk-card {
  height: 100px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e4e4ec 25%, #f0f0f7 50%, #e4e4ec 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>