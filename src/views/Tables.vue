<template>
  <div class="tables-root">

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
        <router-link to="/tables" class="nav-item active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 18h18M6 6v12M18 6v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Tables</span>
          <span class="nav-badge">{{ occupiedCount }}/{{ tables.length }}</span>
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
        <div class="legend-block">
          <p class="legend-title">Légende</p>
          <div class="legend-items">
            <div class="legend-row"><span class="ldot free"></span> Libre</div>
            <div class="legend-row"><span class="ldot occupied"></span> Occupée</div>
            <div class="legend-row"><span class="ldot reserved"></span> Réservée</div>
            <div class="legend-row"><span class="ldot dirty"></span> À nettoyer</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── Main ── -->
    <div class="main">

      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h1 class="page-title">Plan des tables</h1>
          <p class="page-sub">
            <span class="occ-pill">{{ occupiedCount }} occupée{{ occupiedCount !== 1 ? 's' : '' }}</span>
            · {{ tables.length }} tables au total
          </p>
        </div>
        <div class="topbar-actions">
          <button class="btn-ghost" @click="loadTables">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Actualiser
          </button>
          <button
            class="btn-drag"
            :class="{ active: dragMode }"
            @click="toggleDragMode"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M12 12v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ dragMode ? 'Terminer déplacement' : 'Déplacer tables' }}
          </button>
        </div>
      </div>

      <!-- Floor plan -->
      <div class="floor-wrap">
        <div class="floor-plan" ref="floorPlan">
          <div
            v-for="table in tables"
            :key="table.id"
            class="table-item"
            :class="[table.status, { dragging: draggingTable === table.id, 'drag-mode': dragMode }]"
            :style="{ left: table.x_position + 'px', top: table.y_position + 'px' }"
            @mousedown="startDrag($event, table)"
            @click="!dragMode && selectTable(table)"
            @dblclick="!dragMode && openOrder(table)"
          >
            <!-- Table surface -->
            <div
              class="table-surface"
              :class="{ round: table.capacity <= 4, rect: table.capacity > 4 }"
            >
              <span class="table-num">{{ table.number }}</span>
              <span v-if="table.currentOrder" class="table-order-tag">#{{ table.currentOrder.order_number }}</span>
            </div>

            <!-- Chairs -->
            <div class="chairs-wrap">
              <div class="chair c-top"></div>
              <div class="chair c-bottom"></div>
              <div class="chair c-left"></div>
              <div class="chair c-right"></div>
              <template v-if="table.capacity > 4">
                <div class="chair c-top-left"></div>
                <div class="chair c-top-right"></div>
                <div class="chair c-bottom-left"></div>
                <div class="chair c-bottom-right"></div>
              </template>
            </div>

            <!-- Status dot -->
            <div class="status-dot" :class="table.status"></div>

            <!-- Drag handle -->
            <div v-if="dragMode" class="drag-handle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="5" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="5" r="1.5" fill="currentColor"/>
                <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="9" cy="19" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="19" r="1.5" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal ── -->
    <Transition name="modal">
      <div v-if="selectedTable && !dragMode" class="modal-overlay" @click="closeModal">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">Détails</p>
              <h2 class="modal-title">Table {{ selectedTable.number }}</h2>
            </div>
            <button class="modal-close" @click="closeModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-info-grid">
            <div class="info-cell">
              <span class="info-label">Statut</span>
              <span class="status-pill" :class="selectedTable.status">{{ getStatusLabel(selectedTable.status) }}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Capacité</span>
              <span class="info-val">{{ selectedTable.capacity }} personnes</span>
            </div>
            <div v-if="selectedTable.currentOrder" class="info-cell full">
              <span class="info-label">Commande en cours</span>
              <span class="info-val mono">#{{ selectedTable.currentOrder.order_number }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button v-if="selectedTable.status === 'free'" @click="newOrder" class="action-btn primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Nouvelle commande
            </button>
            <button v-if="selectedTable.status === 'occupied'" @click="viewOrder" class="action-btn secondary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              Voir commande
            </button>
            <button v-if="selectedTable.status === 'dirty'" @click="cleanTable" class="action-btn warning">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Marquer propre
            </button>
            <button @click="closeModal" class="action-btn ghost">Fermer</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'TablesView',
  data() {
    return {
      tables: [],
      selectedTable: null,
      dragMode: false,
      draggingTable: null,
      dragStartX: 0,
      dragStartY: 0,
    }
  },
  computed: {
    occupiedCount() {
      return this.tables.filter(t => t.status === 'occupied').length
    },
    authStore() {
      return useAuthStore()
    }
  },
  mounted() {
    this.loadTables()
    this.interval = setInterval(this.loadTables, 30000)
    window.addEventListener('mousemove', this.onDrag)
    window.addEventListener('mouseup', this.stopDrag)
  },
  beforeUnmount() {
    clearInterval(this.interval)
    window.removeEventListener('mousemove', this.onDrag)
    window.removeEventListener('mouseup', this.stopDrag)
  },
  methods: {
    async loadTables() {
      try {
        const response = await api.get('/tables')
        this.tables = response.data
      } catch (error) {
        console.error('Erreur chargement tables', error)
      }
    },
    toggleDragMode() {
      this.dragMode = !this.dragMode
      this.selectedTable = null
    },
    selectTable(table) {
      this.selectedTable = table
    },
    closeModal() {
      this.selectedTable = null
    },
    newOrder() {
      this.$router.push(`/orders/new/${this.selectedTable.id}`)
    },
    viewOrder() {
      this.$router.push(`/orders/${this.selectedTable.currentOrder?.id}`)
    },
    async cleanTable() {
      try {
        await api.patch(`/tables/${this.selectedTable.id}/status`, { status: 'free' })
        await this.loadTables()
        this.closeModal()
      } catch (error) {
        console.error('Erreur nettoyage', error)
      }
    },
    openOrder(table) {
      if (table.status === 'free') this.$router.push(`/orders/new/${table.id}`)
      else if (table.status === 'occupied') this.$router.push(`/orders/${table.currentOrder?.id}`)
    },
    getStatusLabel(status) {
      return { free: 'Libre', occupied: 'Occupée', reserved: 'Réservée', dirty: 'À nettoyer' }[status] || status
    },
    startDrag(event, table) {
      if (!this.dragMode) return
      event.preventDefault()
      this.draggingTable = table.id
      this.dragStartX = event.clientX - table.x_position
      this.dragStartY = event.clientY - table.y_position
    },
    onDrag(event) {
      if (!this.draggingTable) return
      const table = this.tables.find(t => t.id === this.draggingTable)
      if (!table) return
      table.x_position = Math.max(0, Math.min(event.clientX - this.dragStartX, 1000))
      table.y_position = Math.max(0, Math.min(event.clientY - this.dragStartY, 700))
    },
    async stopDrag() {
      if (!this.draggingTable) return
      const table = this.tables.find(t => t.id === this.draggingTable)
      if (table) {
        try {
          await api.put(`/tables/${table.id}`, {
            x_position: table.x_position,
            y_position: table.y_position,
          })
        } catch {
          await this.loadTables()
        }
      }
      this.draggingTable = null
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Root ── */
.tables-root {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #f4f4f6;
  color: #0f0f12;
}

/* ── Sidebar ── */
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

.sidebar-brand em { font-style: normal; color: #a78bfa; }

.brand-icon {
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
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
  font-size: 10px; font-weight: 500;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase; letter-spacing: 0.08em;
  padding: 8px 8px 6px;
}

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13.5px; font-weight: 400;
  color: rgba(255,255,255,0.5);
  transition: all 0.15s;
}

.nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }
.nav-item.active { background: rgba(124,58,237,0.18); color: #c4b5fd; }
.nav-item span:first-of-type { flex: 1; }
.nav-badge { font-size: 11px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 2px 7px; border-radius: 20px; font-weight: 500; }

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.legend-title {
  font-size: 10px; font-weight: 500;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase; letter-spacing: 0.08em;
  margin: 0 0 10px;
}

.legend-items { display: flex; flex-direction: column; gap: 7px; }
.legend-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: rgba(255,255,255,0.45);
}

.ldot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.ldot.free     { background: #34d399; }
.ldot.occupied { background: #f87171; }
.ldot.reserved { background: #fbbf24; }
.ldot.dirty    { background: #60a5fa; }

/* ── Main ── */
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 32px 36px;
  gap: 20px;
}

/* ── Topbar ── */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 22px; font-weight: 600;
  color: #0f0f12; letter-spacing: -0.03em;
  margin: 0 0 4px;
}

.page-sub {
  font-size: 13px; color: #9b9bab; margin: 0;
  display: flex; align-items: center; gap: 6px;
}

.occ-pill {
  display: inline-block;
  background: #fee2e2; color: #991b1b;
  font-size: 11px; font-weight: 500;
  padding: 2px 8px; border-radius: 99px;
}

.topbar-actions { display: flex; align-items: center; gap: 10px; }

.btn-ghost {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  font-size: 12.5px; font-weight: 500;
  color: #6b6b7b; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}

.btn-ghost:hover { border-color: #c4b5fd; color: #7c3aed; background: #f5f3ff; }

.btn-drag {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: #0f0f12;
  border: 1px solid #0f0f12;
  border-radius: 8px;
  font-size: 12.5px; font-weight: 500;
  color: white; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}

.btn-drag:hover { background: #2a2a35; }
.btn-drag.active {
  background: #7c3aed;
  border-color: #7c3aed;
  animation: pulse-btn 1.8s ease-in-out infinite;
}

@keyframes pulse-btn {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
}

/* ── Floor plan ── */
.floor-wrap {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e4e4ec;
  background: #1c1917;
  background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.03);
  min-height: 580px;
  position: relative;
}

.floor-plan {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 700px;
}

/* ── Table item ── */
.table-item {
  position: absolute;
  width: 110px;
  height: 110px;
  cursor: pointer;
  user-select: none;
  transition: filter 0.15s;
}

.table-item.drag-mode { cursor: grab; }
.table-item.dragging  { cursor: grabbing; z-index: 100; filter: brightness(1.1); }
.table-item:not(.drag-mode):hover .table-surface { filter: brightness(1.08); }

/* ── Table surface ── */
.table-surface {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #2c2017;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
  z-index: 2;
  transition: all 0.15s;
}

.table-surface.round {
  width: 72px; height: 72px;
  border-radius: 50%;
}

.table-surface.rect {
  width: 90px; height: 54px;
  border-radius: 10px;
}

.table-num {
  font-size: 17px; font-weight: 600;
  color: rgba(255,255,255,0.9);
  letter-spacing: -0.02em;
  line-height: 1;
}

.table-order-tag {
  font-size: 9px; font-weight: 500;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.03em;
}

/* ── Chairs ── */
.chairs-wrap { position: absolute; inset: 0; }
.chair {
  position: absolute;
  width: 18px; height: 18px;
  background: #3a2d1a;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 5px;
}

.c-top    { top: 4px;    left: 50%; transform: translateX(-50%); }
.c-bottom { bottom: 4px; left: 50%; transform: translateX(-50%); }
.c-left   { left: 4px;   top: 50%;  transform: translateY(-50%); }
.c-right  { right: 4px;  top: 50%;  transform: translateY(-50%); }
.c-top-left    { top: 8px;    left: 8px;    }
.c-top-right   { top: 8px;    right: 8px;   }
.c-bottom-left { bottom: 8px; left: 8px;    }
.c-bottom-right{ bottom: 8px; right: 8px;   }

/* ── Status dot ── */
.status-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 2px solid #1c1917;
  z-index: 5;
}

.status-dot.free     { background: #34d399; }
.status-dot.occupied { background: #f87171; }
.status-dot.reserved { background: #fbbf24; }
.status-dot.dirty    { background: #60a5fa; }

/* ── Drag handle ── */
.drag-handle {
  position: absolute;
  top: 4px; left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.3);
  z-index: 6;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 90%; max-width: 380px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px;
}

.modal-eyebrow {
  font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #9b9bab; margin: 0 0 4px;
}

.modal-title {
  font-size: 22px; font-weight: 600;
  color: #0f0f12; letter-spacing: -0.03em;
  margin: 0;
}

.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9b9bab; padding: 4px;
  border-radius: 6px; display: flex; align-items: center;
  transition: all 0.15s;
}

.modal-close:hover { background: #f0f0f5; color: #3f3f4e; }

.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.info-cell {
  display: flex; flex-direction: column; gap: 5px;
  background: #fafafc;
  border: 1px solid #f0f0f5;
  border-radius: 10px;
  padding: 12px 14px;
}

.info-cell.full { grid-column: 1 / -1; }

.info-label {
  font-size: 10px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #9b9bab;
}

.info-val {
  font-size: 14px; font-weight: 500; color: #0f0f12;
}

.info-val.mono { font-family: 'DM Sans', monospace; }

.status-pill {
  display: inline-block;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 500;
  align-self: flex-start;
}

.status-pill.free     { background: #dcfce7; color: #166534; }
.status-pill.occupied { background: #fee2e2; color: #991b1b; }
.status-pill.reserved { background: #fef3c7; color: #92400e; }
.status-pill.dirty    { background: #dbeafe; color: #1e40af; }

.modal-actions {
  display: flex; flex-direction: column; gap: 8px;
}

.action-btn {
  width: 100%; padding: 11px;
  border: none; border-radius: 9px;
  font-size: 13.5px; font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.15s;
}

.action-btn.primary { background: #0f0f12; color: white; }
.action-btn.primary:hover { background: #2a2a35; }
.action-btn.secondary { background: #ede9fe; color: #6d28d9; }
.action-btn.secondary:hover { background: #ddd6fe; }
.action-btn.warning { background: #fef3c7; color: #92400e; }
.action-btn.warning:hover { background: #fde68a; }
.action-btn.ghost {
  background: none;
  border: 1px solid #e4e4ec;
  color: #6b6b7b;
}
.action-btn.ghost:hover { background: #f4f4f6; }

/* ── Modal transition ── */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }

/* ── Responsive ── */
@media (max-width: 820px) {
  .sidebar { display: none; }
  .main { padding: 20px 16px; }
}
</style>