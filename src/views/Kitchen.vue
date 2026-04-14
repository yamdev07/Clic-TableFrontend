<template>
  <div class="kitchen-view">
    <header class="header">
      <h1>👨‍🍳 Écran Cuisine</h1>
      <div class="header-actions">
        <div class="legend">
          <span class="legend-dot pending"></span> En attente
          <span class="legend-dot cooking"></span> En cuisson
          <span class="legend-dot ready"></span> Prêt
        </div>
        <button @click="refreshOrders" class="refresh-btn">🔄 Actualiser</button>
        <router-link to="/" class="back-btn">← Retour</router-link>
      </div>
    </header>

    <!-- Skeleton -->
    <div v-if="loading" class="kitchen-grid">
      <div v-for="col in 3" :key="col" class="kitchen-column">
        <div class="sk sk-btn sk-full" style="margin-bottom:12px"></div>
        <div v-for="n in 3" :key="n" class="sk sk-big sk-full" style="margin-bottom:10px"></div>
      </div>
    </div>

    <div v-else class="kitchen-grid">
      <!-- Commandes en attente -->
      <div class="kitchen-column">
        <div class="column-header pending">
          <h2>⏳ En attente</h2>
          <span class="count">{{ pendingItems.length }}</span>
        </div>
        <div class="items-list">
          <div v-for="item in pendingItems" :key="item.id" class="kitchen-card pending">
            <div class="card-header">
              <span class="order-number">#{{ item.order?.order_number }}</span>
              <span class="table-number">Table {{ item.order?.table?.number }}</span>
            </div>
            <div class="card-body">
              <div class="item-name">{{ item.item_name }}</div>
              <div class="item-details">
                <span class="quantity">x{{ item.quantity }}</span>
                <span v-if="item.special_instructions" class="notes">📝 {{ item.special_instructions }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="time">{{ formatTime(item.created_at) }}</span>
              <div class="card-actions">
                <button @click="startCooking(item)" class="action-btn start">Commencer</button>
                <button @click="confirmRupture(item)" class="action-btn rupture" title="Signaler rupture de stock">🚫</button>
              </div>
            </div>
          </div>
          <div v-if="pendingItems.length === 0" class="empty-state">Aucune commande en attente</div>
        </div>
      </div>

      <!-- En cuisson -->
      <div class="kitchen-column">
        <div class="column-header cooking">
          <h2>🔥 En cuisson</h2>
          <span class="count">{{ cookingItems.length }}</span>
        </div>
        <div class="items-list">
          <div v-for="item in cookingItems" :key="item.id" class="kitchen-card cooking">
            <div class="card-header">
              <span class="order-number">#{{ item.order?.order_number }}</span>
              <span class="table-number">Table {{ item.order?.table?.number }}</span>
            </div>
            <div class="card-body">
              <div class="item-name">{{ item.item_name }}</div>
              <div class="item-details">
                <span class="quantity">x{{ item.quantity }}</span>
                <span v-if="item.special_instructions" class="notes">📝 {{ item.special_instructions }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="time">En cours...</span>
              <button @click="markReady(item)" class="action-btn ready">Prêt</button>
            </div>
          </div>
          <div v-if="cookingItems.length === 0" class="empty-state">Aucune commande en cuisson</div>
        </div>
      </div>

      <!-- Prêts -->
      <div class="kitchen-column">
        <div class="column-header ready">
          <h2>✅ Prêts</h2>
          <span class="count">{{ readyItems.length }}</span>
        </div>
        <div class="items-list">
          <div v-for="item in readyItems" :key="item.id" class="kitchen-card ready">
            <div class="card-header">
              <span class="order-number">#{{ item.order?.order_number }}</span>
              <span class="table-number">Table {{ item.order?.table?.number }}</span>
            </div>
            <div class="card-body">
              <div class="item-name">{{ item.item_name }}</div>
              <div class="item-details">
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="time">{{ formatTime(item.updated_at) }}</span>
              <button @click="serveItem(item)" class="action-btn serve">Servi</button>
            </div>
          </div>
          <div v-if="readyItems.length === 0" class="empty-state">Aucun plat prêt</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useEcho } from '@/composables/useEcho'

const authStore = useAuthStore()
const { subscribeKitchen, disconnect: disconnectEcho } = useEcho()

const allItems = ref([])
const loading  = ref(true)

const pendingItems = computed(() => allItems.value.filter(i => i.kitchen_status === 'pending'))
const cookingItems = computed(() => allItems.value.filter(i => i.kitchen_status === 'cooking'))
const readyItems   = computed(() => allItems.value.filter(i => i.kitchen_status === 'ready'))

let refreshInterval = null

// ── WebSocket handler ─────────────────────────────────────────────────────────
function handleItemStatusChanged(data) {
  const idx = allItems.value.findIndex(i => i.id === data.id)
  if (idx !== -1) {
    if (data.kitchen_status === 'served') {
      allItems.value.splice(idx, 1)
    } else {
      allItems.value[idx] = { ...allItems.value[idx], ...data }
    }
  }
}

function handleNewOrder(data) {
  // Nouvelle commande envoyée en cuisine : ajoute les items en attente
  const newItems = (data.items || []).map(item => ({
    ...item,
    order: {
      id:           data.id,
      order_number: data.order_number,
      table:        data.table,
    },
  }))
  newItems.forEach(item => {
    if (!allItems.value.some(i => i.id === item.id)) {
      allItems.value.push(item)
    }
  })
}

// ── HTTP ──────────────────────────────────────────────────────────────────────
const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

async function loadOrders() {
  loading.value = true
  try {
    const response = await api.get('/kitchen/pending')
    allItems.value = response.data
  } catch (error) {
    console.error('Erreur chargement cuisine', error)
  } finally {
    loading.value = false
  }
}

const refreshOrders = () => loadOrders()

async function startCooking(item) {
  await api.patch(`/kitchen/items/${item.id}/cooking`)
  // Optimistic update — WS will confirm
  const idx = allItems.value.findIndex(i => i.id === item.id)
  if (idx !== -1) allItems.value[idx] = { ...allItems.value[idx], kitchen_status: 'cooking' }
}

async function markReady(item) {
  await api.patch(`/kitchen/items/${item.id}/ready`)
  const idx = allItems.value.findIndex(i => i.id === item.id)
  if (idx !== -1) allItems.value[idx] = { ...allItems.value[idx], kitchen_status: 'ready' }
}

async function serveItem(item) {
  await api.patch(`/kitchen/items/${item.id}/serve`)
  allItems.value = allItems.value.filter(i => i.id !== item.id)
}

async function confirmRupture(item) {
  const confirmed = window.confirm(
    `🚫 Signaler rupture de stock pour "${item.item_name}" ?\n\nCela va retirer ce plat du menu jusqu'à réactivation.`
  )
  if (!confirmed) return
  await api.patch(`/kitchen/items/${item.id}/rupture`)
  allItems.value = allItems.value.filter(i => i.id !== item.id)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  loadOrders()
  // Polling de secours toutes les 60 s (le WS est la source principale)
  refreshInterval = setInterval(loadOrders, 60000)

  const restaurantId = authStore.user?.restaurant_id
  if (restaurantId) {
    subscribeKitchen(restaurantId, {
      'item.status.changed': handleItemStatusChanged,
      'order.received':      handleNewOrder,
    })
  }
})

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  disconnectEcho()
})
</script>

<style scoped>
.kitchen-view {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
}

.header {
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  color: #2d3748;
  font-size: 24px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
}

.legend-dot.pending { background: #f56565; }
.legend-dot.cooking { background: #ed8936; }
.legend-dot.ready { background: #48bb78; }

.refresh-btn, .back-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
}

.refresh-btn {
  background: #4299e1;
  color: white;
}

.back-btn {
  background: #718096;
  color: white;
}

.kitchen-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.kitchen-column {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
}

.column-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid;
}

.column-header.pending { border-color: #f56565; background: #fff5f5; }
.column-header.cooking { border-color: #ed8936; background: #fffaf0; }
.column-header.ready { border-color: #48bb78; background: #f0fff4; }

.column-header h2 {
  font-size: 16px;
  margin: 0;
}

.count {
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.items-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kitchen-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  transition: all 0.2s;
}

.kitchen-card.pending { border-left: 4px solid #f56565; }
.kitchen-card.cooking { border-left: 4px solid #ed8936; }
.kitchen-card.ready { border-left: 4px solid #48bb78; }

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.order-number {
  font-weight: bold;
  color: #2d3748;
}

.table-number {
  color: #718096;
}

.card-body {
  margin-bottom: 10px;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
}

.item-details {
  display: flex;
  gap: 10px;
  margin-top: 4px;
  font-size: 12px;
  color: #718096;
}

.notes {
  font-style: italic;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.card-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.time {
  font-size: 11px;
  color: #a0aec0;
}

.action-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.action-btn.start { background: #f56565; color: white; }
.action-btn.start:hover { background: #e53e3e; }

.action-btn.ready { background: #ed8936; color: white; }
.action-btn.ready:hover { background: #dd6b20; }

.action-btn.serve { background: #48bb78; color: white; }
.action-btn.serve:hover { background: #38a169; }

.action-btn.rupture {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 4px 8px;
}
.action-btn.rupture:hover { background: #fecaca; }

.empty-state {
  text-align: center;
  padding: 40px;
  color: #a0aec0;
  font-size: 13px;
}

@media (max-width: 900px) {
  .kitchen-grid {
    grid-template-columns: 1fr;
  }
  .kitchen-column {
    height: auto;
    max-height: 400px;
  }
}
</style>