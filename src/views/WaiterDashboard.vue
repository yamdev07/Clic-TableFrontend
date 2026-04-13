<template>
  <div class="waiter-space">

    <!-- ── HEADER ─────────────────────────────────────────────────── -->
    <header class="waiter-header">
      <div class="greeting">
        <div class="avatar">{{ initials }}</div>
        <div>
          <h1>Bonjour, {{ authStore.userName }} 👋</h1>
          <p class="sub-date">{{ dateLabel }}</p>
        </div>
      </div>
      <div class="header-right">
        <div class="live-clock">{{ liveTime }}</div>
        <button @click="refresh" class="icon-btn" :class="{ spinning: loading }" title="Actualiser">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- ── ALERTE PLATS PRÊTS ──────────────────────────────────────── -->
    <Transition name="slide-down">
      <div v-if="readyItems.length > 0" class="ready-alert">
        <div class="alert-left">
          <span class="alert-pulse"></span>
          <span class="alert-title">
            🔔 {{ readyItems.length }} plat{{ readyItems.length > 1 ? 's' : '' }}
            prêt{{ readyItems.length > 1 ? 's' : '' }} à servir
          </span>
        </div>
        <div class="alert-chips">
          <span v-for="item in readyItems" :key="item.id" class="ready-chip">
            Table {{ item.order?.table?.number }} — {{ item.item_name }}
            <span v-if="item.quantity > 1">×{{ item.quantity }}</span>
          </span>
        </div>
      </div>
    </Transition>

    <!-- ── KPI rapide ────────────────────────────────────────────────── -->
    <div class="kpi-strip">
      <div class="kpi-pill">
        <span class="kpi-val">{{ freeTables }}</span>
        <span class="kpi-lbl">Tables libres</span>
      </div>
      <div class="kpi-pill occupied">
        <span class="kpi-val">{{ occupiedTables }}</span>
        <span class="kpi-lbl">Occupées</span>
      </div>
      <div class="kpi-pill ready" :class="{ pulse: readyItems.length > 0 }">
        <span class="kpi-val">{{ readyItems.length }}</span>
        <span class="kpi-lbl">Prêts cuisine</span>
      </div>
      <div class="kpi-pill active">
        <span class="kpi-val">{{ myActiveOrders.length }}</span>
        <span class="kpi-lbl">Mes commandes</span>
      </div>
    </div>

    <!-- ── GRILLE DES TABLES ──────────────────────────────────────── -->
    <section class="section">
      <div class="section-hd">
        <h2>Tables</h2>
        <div class="legend">
          <span class="leg-dot free"></span>Libre
          <span class="leg-dot occupied"></span>Occupée
          <span class="leg-dot ready-dot"></span>Plats prêts
        </div>
      </div>

      <div v-if="tables.length === 0 && !loading" class="empty-tables">
        Aucune table configurée
      </div>

      <div class="tables-grid">
        <div
          v-for="table in tables"
          :key="table.id"
          class="table-card"
          :class="getTableClass(table)"
          @click="handleTableClick(table)"
        >
          <!-- Numéro + capacité -->
          <div class="tc-top">
            <span class="tc-num">{{ table.number }}</span>
            <span class="tc-cap">{{ table.capacity }}p</span>
            <span v-if="getReadyCount(table) > 0" class="tc-ready-badge pulse">
              🔔 {{ getReadyCount(table) }}
            </span>
          </div>

          <!-- TABLE LIBRE -->
          <template v-if="table.status === 'free'">
            <div class="tc-body free-body">
              <div class="free-icon">✓</div>
              <div class="free-label">Disponible</div>
            </div>
            <button class="tc-action-btn green">
              + Nouvelle commande
            </button>
          </template>

          <!-- TABLE OCCUPÉE -->
          <template v-else>
            <div class="tc-body occupied-body">
              <div class="oc-order-num">#{{ table.currentOrder?.order_number }}</div>
              <div class="oc-meta">
                <span class="oc-time">⏱ {{ formatElapsed(table.currentOrder?.created_at) }}</span>
                <span class="oc-items">{{ table.currentOrder?.items?.length || 0 }} art.</span>
              </div>
              <div class="oc-total">{{ formatMoney(table.currentOrder?.total) }}</div>
              <div v-if="getReadyCount(table) > 0" class="oc-ready-hint">
                🔔 {{ getReadyCount(table) }} prêt{{ getReadyCount(table) > 1 ? 's' : '' }} à servir
              </div>
            </div>
            <div class="tc-actions">
              <button class="tc-action-btn orange">+ Ajouter</button>
              <button
                v-if="getReadyCount(table) > 0"
                class="tc-action-btn teal pulse"
                @click.stop="markTableServed(table)"
              >
                ✓ Servir
              </button>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ── MES COMMANDES ACTIVES ──────────────────────────────────── -->
    <section class="section" v-if="myActiveOrders.length > 0">
      <div class="section-hd">
        <h2>Mes commandes actives</h2>
      </div>
      <div class="orders-list">
        <div
          v-for="order in myActiveOrders"
          :key="order.id"
          class="order-row"
          :class="{ 'has-ready': orderHasReady(order) }"
        >
          <div class="or-left">
            <span class="or-num">#{{ order.order_number }}</span>
            <span class="or-table">Table {{ order.table?.number }}</span>
          </div>
          <div class="or-status">
            <span class="status-dot-small" :class="order.status"></span>
            {{ statusLabel(order.status) }}
          </div>
          <div class="or-total">{{ formatMoney(order.total) }}</div>
          <div v-if="orderHasReady(order)" class="or-ready-badge pulse">🔔 Prêt</div>
        </div>
      </div>
    </section>

    <!-- ── MODAL ACTION TABLE ─────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="activeModal" class="modal-overlay" @click="closeModal">
        <div class="action-modal" @click.stop>
          <div class="am-header">
            <h3>Table {{ activeModal.number }}</h3>
            <span class="am-cap">{{ activeModal.capacity }} personnes</span>
          </div>

          <!-- Table libre -->
          <template v-if="activeModal.status === 'free'">
            <p class="am-sub">Table disponible — choisissez une action</p>
            <div class="am-actions">
              <router-link
                :to="`/orders/new/${activeModal.id}`"
                class="am-btn primary"
                @click="closeModal"
              >
                <span>🆕</span>
                <span>Nouvelle commande</span>
              </router-link>
            </div>
          </template>

          <!-- Table occupée -->
          <template v-else>
            <div class="am-order-summary">
              <div class="am-row">
                <span>Commande</span>
                <strong>#{{ activeModal.currentOrder?.order_number }}</strong>
              </div>
              <div class="am-row">
                <span>Ouverte depuis</span>
                <strong>{{ formatElapsed(activeModal.currentOrder?.created_at) }}</strong>
              </div>
              <div class="am-row">
                <span>Articles</span>
                <strong>{{ activeModal.currentOrder?.items?.length || 0 }}</strong>
              </div>
              <div class="am-row total">
                <span>Total estimé</span>
                <strong>{{ formatMoney(activeModal.currentOrder?.total) }}</strong>
              </div>
            </div>

            <!-- Items avec instructions -->
            <div v-if="activeModal.currentOrder?.items?.length" class="am-items">
              <div
                v-for="item in activeModal.currentOrder.items"
                :key="item.id"
                class="am-item"
                :class="item.kitchen_status"
              >
                <div class="am-item-left">
                  <span class="am-item-status-dot" :class="item.kitchen_status"></span>
                  <span>{{ item.item_name }}</span>
                  <span class="am-item-qty">×{{ item.quantity }}</span>
                </div>
                <div class="am-item-right">
                  <span v-if="item.special_instructions" class="am-item-note">
                    📝 {{ item.special_instructions }}
                  </span>
                  <span class="am-item-status-label">{{ kitchenStatusLabel(item.kitchen_status) }}</span>
                </div>
              </div>
            </div>

            <div class="am-actions">
              <router-link
                :to="`/orders/new/${activeModal.id}`"
                class="am-btn secondary"
                @click="closeModal"
              >
                <span>➕</span><span>Ajouter des articles</span>
              </router-link>
              <button
                v-if="getReadyCount(activeModal) > 0"
                class="am-btn teal"
                @click="markTableServed(activeModal)"
              >
                <span>✓</span><span>Marquer tout servi</span>
              </button>
            </div>
          </template>

          <button class="am-close" @click="closeModal">Fermer</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router    = useRouter()
const authStore = useAuthStore()

const tables          = ref([])
const kitchenItems    = ref([])
const myActiveOrders  = ref([])
const loading         = ref(false)
const activeModal     = ref(null)
const liveTime        = ref('')

let refreshTimer = null
let clockTimer   = null

// ── Computed ────────────────────────────────────────────────────────────────
const initials = computed(() => {
  return (authStore.userName || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const dateLabel = computed(() =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
)

const readyItems = computed(() =>
  kitchenItems.value.filter(i => i.kitchen_status === 'ready')
)

const freeTables     = computed(() => tables.value.filter(t => t.status === 'free').length)
const occupiedTables = computed(() => tables.value.filter(t => t.status !== 'free').length)

// ── Helpers ─────────────────────────────────────────────────────────────────
const getReadyCount = (table) => {
  if (!table.currentOrder) return 0
  return (table.currentOrder.items || []).filter(i => i.kitchen_status === 'ready').length
}

const getTableClass = (table) => {
  if (table.status === 'free') return 'tc-free'
  if (getReadyCount(table) > 0) return 'tc-occupied tc-has-ready'
  return 'tc-occupied'
}

const orderHasReady = (order) =>
  readyItems.value.some(i => i.order_id === order.id || i.order?.id === order.id)

const formatMoney = (amount) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'XOF', minimumFractionDigits: 0,
  }).format(amount || 0)

const formatElapsed = (date) => {
  if (!date) return '—'
  const diff = Math.floor((Date.now() - new Date(date)) / 60000)
  if (diff < 1)  return '< 1 min'
  if (diff < 60) return `${diff} min`
  return `${Math.floor(diff / 60)}h${String(diff % 60).padStart(2, '0')}`
}

const statusLabel = (s) => ({
  open: 'Ouvert', in_progress: 'En cuisine',
  ready: 'Prêt', served: 'Servi', paid: 'Payé', cancelled: 'Annulé',
}[s] || s)

const kitchenStatusLabel = (s) => ({
  pending: '⏳ En attente', cooking: '🔥 En cuisson',
  ready: '✅ Prêt', served: '✓ Servi',
}[s] || s)

const tickClock = () => {
  liveTime.value = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

// ── Data loading ─────────────────────────────────────────────────────────────
const loadData = async () => {
  loading.value = true
  try {
    const [tablesRes, kitchenRes, ordersRes] = await Promise.all([
      api.get('/tables'),
      api.get('/kitchen/pending'),
      api.get('/orders'),
    ])

    tables.value       = tablesRes.data
    kitchenItems.value = kitchenRes.data

    const allOrders = ordersRes.data.data || ordersRes.data
    myActiveOrders.value = allOrders.filter(
      o => !['paid', 'cancelled'].includes(o.status)
    )
  } finally {
    loading.value = false
  }
}

const refresh = () => loadData()

// ── Table actions ─────────────────────────────────────────────────────────────
const handleTableClick = (table) => {
  if (table.status === 'free') {
    router.push(`/orders/new/${table.id}`)
  } else {
    activeModal.value = table
  }
}

const closeModal = () => {
  activeModal.value = null
}

const markTableServed = async (table) => {
  const readyForTable = (table.currentOrder?.items || [])
    .filter(i => i.kitchen_status === 'ready')

  await Promise.all(
    readyForTable.map(item =>
      api.patch(`/kitchen/items/${item.id}/serve`)
    )
  )

  closeModal()
  await loadData()
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  loadData()
  tickClock()
  clockTimer   = setInterval(tickClock, 1000)
  refreshTimer = setInterval(loadData, 15000)
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearInterval(refreshTimer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

.waiter-space {
  min-height: 100vh;
  background: #f2f2f6;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
  padding: 0 0 40px;
}

/* ── Header ── */
.waiter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px 32px;
  color: white;
  gap: 16px;
}

.greeting { display: flex; align-items: center; gap: 16px; }

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.greeting h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 2px;
  color: white;
}

.sub-date {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin: 0;
  text-transform: capitalize;
}

.header-right { display: flex; align-items: center; gap: 12px; }

.live-clock {
  font-size: 22px;
  font-weight: 700;
  color: #a78bfa;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.icon-btn:hover { background: rgba(255,255,255,0.12); color: white; }
.icon-btn.spinning svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Ready alert ── */
.ready-alert {
  background: linear-gradient(90deg, #7f1d1d, #991b1b);
  color: white;
  padding: 12px 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.alert-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.alert-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fca5a5;
  animation: alertPulse 1s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes alertPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.6; }
}

.alert-title { font-weight: 600; font-size: 14px; }

.alert-chips { display: flex; gap: 8px; flex-wrap: wrap; }

.ready-chip {
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 12px;
  white-space: nowrap;
}

/* ── KPI strip ── */
.kpi-strip {
  display: flex;
  gap: 12px;
  padding: 16px 32px;
  background: white;
  border-bottom: 1px solid #e8e8f0;
  overflow-x: auto;
}

.kpi-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  border-radius: 10px;
  background: #f4f4f6;
  border: 1px solid #e8e8f0;
  min-width: 90px;
  flex-shrink: 0;
}

.kpi-pill.occupied { background: #fff7ed; border-color: #fed7aa; }
.kpi-pill.ready    { background: #f0fdf4; border-color: #bbf7d0; }
.kpi-pill.active   { background: #ede9fe; border-color: #c4b5fd; }

.kpi-val {
  font-size: 26px;
  font-weight: 700;
  color: #0f0f12;
  letter-spacing: -0.03em;
  line-height: 1;
}

.kpi-lbl {
  font-size: 11px;
  color: #9b9bab;
  text-align: center;
  margin-top: 4px;
}

/* ── Section ── */
.section { padding: 24px 32px 0; }

.section-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-hd h2 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.legend {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: #9b9bab;
}

.leg-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.leg-dot.free      { background: #10b981; }
.leg-dot.occupied  { background: #f59e0b; }
.leg-dot.ready-dot { background: #ef4444; }

/* ── Tables grid ── */
.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.empty-tables {
  text-align: center;
  padding: 40px;
  color: #c5c5d0;
}

.table-card {
  background: white;
  border: 2px solid #e8e8f0;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.table-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

/* Status colors */
.tc-free     { border-color: #a7f3d0; background: #f0fdf4; }
.tc-occupied { border-color: #fde68a; background: #fffbeb; }
.tc-has-ready { border-color: #fca5a5; background: #fff5f5; animation: readyGlow 2s ease-in-out infinite; }

@keyframes readyGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  50%       { box-shadow: 0 0 0 6px rgba(239,68,68,0.15); }
}

/* Top: number + capacity + ready badge */
.tc-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tc-num {
  font-size: 18px;
  font-weight: 700;
  color: #0f0f12;
  flex: 1;
}

.tc-cap {
  font-size: 11px;
  color: #9b9bab;
}

.tc-ready-badge {
  background: #ef4444;
  color: white;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
}

/* Free body */
.tc-body { flex: 1; }

.free-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  gap: 4px;
}

.free-icon {
  font-size: 24px;
  color: #10b981;
  font-weight: 700;
}

.free-label {
  font-size: 12px;
  color: #059669;
  font-weight: 500;
}

/* Occupied body */
.occupied-body { display: flex; flex-direction: column; gap: 4px; }

.oc-order-num {
  font-size: 13px;
  font-weight: 700;
  color: #0f0f12;
}

.oc-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #9b9bab;
}

.oc-total {
  font-size: 15px;
  font-weight: 600;
  color: #0f0f12;
}

.oc-ready-hint {
  font-size: 11px;
  color: #dc2626;
  font-weight: 600;
  background: #fee2e2;
  border-radius: 6px;
  padding: 3px 6px;
  margin-top: 2px;
}

/* Action buttons in card */
.tc-actions {
  display: flex;
  gap: 6px;
}

.tc-action-btn {
  flex: 1;
  padding: 7px 6px;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.tc-action-btn.green { background: #10b981; color: white; }
.tc-action-btn.green:hover { background: #059669; }
.tc-action-btn.orange { background: #f59e0b; color: white; }
.tc-action-btn.orange:hover { background: #d97706; }
.tc-action-btn.teal { background: #ef4444; color: white; }
.tc-action-btn.teal:hover { background: #dc2626; }

/* ── Pulse animation ── */
.pulse { animation: pulseBorder 1.5s ease-in-out infinite; }
@keyframes pulseBorder {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

/* ── Orders list ── */
.orders-list {
  background: white;
  border: 1px solid #e8e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.order-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f8;
  transition: background 0.15s;
}
.order-row:last-child { border-bottom: none; }
.order-row:hover { background: #fafafd; }
.order-row.has-ready { background: #fff5f5; }

.or-left { display: flex; align-items: center; gap: 10px; flex: 1; }

.or-num {
  font-size: 14px;
  font-weight: 700;
  color: #0f0f12;
}

.or-table {
  font-size: 12px;
  color: #9b9bab;
  background: #f4f4f6;
  padding: 2px 8px;
  border-radius: 20px;
}

.or-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b6b7b;
  min-width: 100px;
}

.status-dot-small {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.status-dot-small.open        { background: #f59e0b; }
.status-dot-small.in_progress { background: #3b82f6; }
.status-dot-small.ready       { background: #10b981; }
.status-dot-small.served      { background: #8b5cf6; }

.or-total {
  font-size: 14px;
  font-weight: 600;
  color: #0f0f12;
  min-width: 90px;
  text-align: right;
}

.or-ready-badge {
  background: #ef4444;
  color: white;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.action-modal {
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0,0,0,0.25);
  padding: 24px;
}

.am-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
}

.am-header h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.am-cap {
  font-size: 13px;
  color: #9b9bab;
}

.am-sub {
  font-size: 13px;
  color: #9b9bab;
  margin: 0 0 20px;
}

.am-order-summary {
  background: #fafafc;
  border: 1px solid #f0f0f5;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
}

.am-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: #6b6b7b;
  border-bottom: 1px solid #f5f5f8;
}
.am-row:last-child { border-bottom: none; }
.am-row.total { font-weight: 600; color: #0f0f12; }

/* Items list in modal */
.am-items {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.am-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  background: #fafafc;
  border: 1px solid #f0f0f5;
  font-size: 13px;
  gap: 8px;
}
.am-item.ready { background: #f0fdf4; border-color: #bbf7d0; }

.am-item-left { display: flex; align-items: center; gap: 8px; flex: 1; }
.am-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }

.am-item-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.am-item-status-dot.pending  { background: #9ca3af; }
.am-item-status-dot.cooking  { background: #f59e0b; }
.am-item-status-dot.ready    { background: #10b981; }
.am-item-status-dot.served   { background: #8b5cf6; }

.am-item-qty {
  font-size: 12px;
  color: #9b9bab;
}

.am-item-note {
  font-size: 11px;
  color: #6b6b7b;
  font-style: italic;
  text-align: right;
}

.am-item-status-label {
  font-size: 11px;
  color: #9b9bab;
}

/* Actions in modal */
.am-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.am-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
  border: none;
}

.am-btn.primary   { background: #0f0f12; color: white; }
.am-btn.primary:hover { background: #2a2a35; }
.am-btn.secondary { background: #f4f4f6; color: #0f0f12; border: 1px solid #e8e8f0; }
.am-btn.secondary:hover { background: #ede9fe; border-color: #c4b5fd; }
.am-btn.teal { background: #10b981; color: white; }
.am-btn.teal:hover { background: #059669; }

.am-close {
  width: 100%;
  padding: 10px;
  background: none;
  border: 1px solid #e8e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #9b9bab;
  cursor: pointer;
  transition: all 0.15s;
}
.am-close:hover { background: #f4f4f6; }

/* ── Transitions ── */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .waiter-header { padding: 16px 20px; }
  .kpi-strip { padding: 12px 20px; }
  .section { padding: 20px 20px 0; }
  .tables-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .live-clock { font-size: 18px; }
}
</style>
