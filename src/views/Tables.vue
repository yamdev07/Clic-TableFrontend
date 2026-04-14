<template>
  <div class="tables-root">

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
          <button class="btn-config" @click="openConfig">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Configurer les tables
          </button>
        </div>
      </div>

      <!-- Skeleton chargement -->
      <div v-if="loading" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:16px;padding:24px;">
        <div v-for="n in 10" :key="n" class="sk" style="height:100px;border-radius:12px;"></div>
      </div>

      <!-- Floor plan -->
      <div v-else class="floor-wrap">
        <!-- Légende statut -->
        <div class="floor-legend">
          <div class="legend-item"><span class="ldot free"></span>Libre</div>
          <div class="legend-item"><span class="ldot occupied"></span>Occupée</div>
          <div class="legend-item"><span class="ldot reserved"></span>Réservée</div>
          <div class="legend-item"><span class="ldot dirty"></span>À nettoyer</div>
        </div>
        <div class="floor-plan" ref="floorPlan">

          <!-- ── Comptoir ── -->
          <div
            class="comptoir"
            :class="{ dragging: draggingComptoir, 'drag-mode': dragMode }"
            :style="{ left: comptoir.x + 'px', top: comptoir.y + 'px' }"
            @mousedown="startDragComptoir"
          >
            <!-- Bar stools (tabourets) -->
            <div class="bar-stools">
              <div v-for="i in 5" :key="i" class="bar-stool"></div>
            </div>
            <!-- Counter surface -->
            <div class="counter-surface">
              <div class="counter-inner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="counter-icon">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                <span class="counter-label">Comptoir</span>
              </div>
              <div class="counter-edge"></div>
            </div>
            <div v-if="dragMode" class="drag-handle comptoir-handle">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="5" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="5" r="1.5" fill="currentColor"/>
                <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="9" cy="19" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="19" r="1.5" fill="currentColor"/>
              </svg>
            </div>
          </div>

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

    <!-- ── Modale configuration des tables ── -->
    <Transition name="modal">
      <div v-if="showConfig" class="modal-overlay" @click="closeConfig">
        <div class="config-card" @click.stop>
          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">Salle de restaurant</p>
              <h2 class="modal-title">Configuration des tables</h2>
            </div>
            <button class="modal-close" @click="closeConfig">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Paramètres généraux -->
          <div class="config-section">
            <p class="config-section-label">Paramètres généraux</p>
            <div class="config-row">
              <div class="config-row-label">
                <span>Nombre de tables</span>
                <small>Total des tables dans la salle</small>
              </div>
              <div class="stepper">
                <button class="stepper-btn" @click="configForm.tableCount = Math.max(1, configForm.tableCount - 1)">−</button>
                <input class="stepper-input" type="number" v-model.number="configForm.tableCount" min="1" max="50" />
                <button class="stepper-btn" @click="configForm.tableCount = Math.min(50, configForm.tableCount + 1)">+</button>
              </div>
            </div>
            <div class="config-row">
              <div class="config-row-label">
                <span>Couverts par défaut</span>
                <small>Appliqué aux nouvelles tables</small>
              </div>
              <div class="stepper">
                <button class="stepper-btn" @click="configForm.defaultCapacity = Math.max(1, configForm.defaultCapacity - 1)">−</button>
                <input class="stepper-input" type="number" v-model.number="configForm.defaultCapacity" min="1" max="20" />
                <button class="stepper-btn" @click="configForm.defaultCapacity = Math.min(20, configForm.defaultCapacity + 1)">+</button>
              </div>
            </div>
          </div>

          <!-- Couverts par table -->
          <div class="config-section">
            <div class="config-section-head">
              <p class="config-section-label">Couverts par table</p>
              <button class="btn-apply-all" @click="applyDefaultToAll">
                Tout mettre à {{ configForm.defaultCapacity }}
              </button>
            </div>
            <div class="config-table-list">
              <div v-for="(t, i) in configForm.tables" :key="i" class="config-table-row">
                <div class="config-table-num">
                  <span class="table-num-badge">{{ i + 1 }}</span>
                  <span>Table {{ i + 1 }}</span>
                </div>
                <div class="stepper small">
                  <button class="stepper-btn" @click="t.capacity = Math.max(1, t.capacity - 1)">−</button>
                  <span class="stepper-val">{{ t.capacity }}</span>
                  <button class="stepper-btn" @click="t.capacity = Math.min(20, t.capacity + 1)">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Avertissement tables occupées -->
          <div v-if="occupiedExcessCount > 0" class="config-warning">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ occupiedExcessCount }} table{{ occupiedExcessCount > 1 ? 's' : '' }} occupée{{ occupiedExcessCount > 1 ? 's' : '' }} ne seront pas supprimées
          </div>

          <div class="modal-actions">
            <button class="action-btn primary" @click="applyConfig" :disabled="configLoading">
              <svg v-if="!configLoading" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ configLoading ? 'Application en cours…' : 'Appliquer la configuration' }}
            </button>
            <button class="action-btn ghost" @click="closeConfig">Annuler</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Modal détail table ── -->
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
              Voir commandes
            </button>
            <button v-if="selectedTable.status === 'occupied' && !selectedTable.currentOrder" @click="forceFreeTabe" class="action-btn warning">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Libérer la table
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

export default {
  name: 'TablesView',
  data() {
    const savedComptoir = JSON.parse(localStorage.getItem('comptoir_position') || 'null')
    return {
      tables: [],
      loading: true,
      selectedTable: null,
      dragMode: false,
      draggingTable: null,
      dragStartX: 0,
      dragStartY: 0,
      // Comptoir
      comptoir: savedComptoir || { x: 40, y: 520 },
      draggingComptoir: false,
      comptoirDragStartX: 0,
      comptoirDragStartY: 0,
      // Modal de configuration
      showConfig: false,
      configLoading: false,
      configForm: {
        tableCount: 0,
        defaultCapacity: 4,
        tables: [],
      },
    }
  },
  computed: {
    occupiedCount() {
      return this.tables.filter(t => t.status === 'occupied').length
    },
    occupiedExcessCount() {
      const target = this.configForm.tableCount
      if (!this.tables.length || this.tables.length <= target) return 0
      const sorted = [...this.tables].sort((a, b) => a.number - b.number)
      return sorted.slice(target).filter(t => t.status !== 'free').length
    },
  },
  watch: {
    'configForm.tableCount'(newVal) {
      const target = Math.max(1, Math.min(50, parseInt(newVal) || 1))
      const current = this.configForm.tables.length
      if (target > current) {
        for (let i = current; i < target; i++) {
          this.configForm.tables.push({ capacity: this.configForm.defaultCapacity })
        }
      } else {
        this.configForm.tables = this.configForm.tables.slice(0, target)
      }
    },
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
      this.loading = true
      try {
        const response = await api.get('/tables')
        this.tables = response.data
      } catch (error) {
        console.error('Erreur chargement tables', error)
      } finally {
        this.loading = false
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
      this.$router.push('/orders')
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
    async forceFreeTabe() {
      try {
        await api.patch(`/tables/${this.selectedTable.id}/status`, { status: 'free' })
        await this.loadTables()
        this.closeModal()
      } catch (error) {
        console.error('Erreur libération table', error)
      }
    },
    openOrder(table) {
      if (table.status === 'free') this.$router.push(`/orders/new/${table.id}`)
      else if (table.status === 'occupied') this.$router.push('/orders')
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
      // Drag comptoir
      if (this.draggingComptoir) {
        this.comptoir.x = Math.max(0, Math.min(event.clientX - this.comptoirDragStartX, 1100))
        this.comptoir.y = Math.max(0, Math.min(event.clientY - this.comptoirDragStartY, 700))
        return
      }
      // Drag table
      if (!this.draggingTable) return
      const table = this.tables.find(t => t.id === this.draggingTable)
      if (!table) return
      table.x_position = Math.max(0, Math.min(event.clientX - this.dragStartX, 1000))
      table.y_position = Math.max(0, Math.min(event.clientY - this.dragStartY, 700))
    },
    async stopDrag() {
      // Stop comptoir drag — sauvegarder position en localStorage
      if (this.draggingComptoir) {
        this.draggingComptoir = false
        localStorage.setItem('comptoir_position', JSON.stringify({ x: this.comptoir.x, y: this.comptoir.y }))
        return
      }
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

    // ── Comptoir drag ──
    startDragComptoir(event) {
      if (!this.dragMode) return
      event.preventDefault()
      event.stopPropagation()
      this.draggingComptoir = true
      this.comptoirDragStartX = event.clientX - this.comptoir.x
      this.comptoirDragStartY = event.clientY - this.comptoir.y
    },

    // ── Configuration des tables ──
    openConfig() {
      const sorted = [...this.tables].sort((a, b) => a.number - b.number)
      this.configForm.tableCount = sorted.length || 5
      this.configForm.defaultCapacity = sorted.length > 0
        ? Math.round(sorted.reduce((s, t) => s + t.capacity, 0) / sorted.length)
        : 4
      this.configForm.tables = sorted.length > 0
        ? sorted.map(t => ({ capacity: t.capacity }))
        : Array(5).fill(null).map(() => ({ capacity: 4 }))
      this.showConfig = true
    },
    closeConfig() {
      this.showConfig = false
    },
    applyDefaultToAll() {
      this.configForm.tables.forEach(t => { t.capacity = this.configForm.defaultCapacity })
    },
    async applyConfig() {
      this.configLoading = true
      try {
        const target = this.configForm.tableCount
        const sorted = [...this.tables].sort((a, b) => a.number - b.number)

        // Supprimer les tables en excès (seulement si libres)
        if (sorted.length > target) {
          const excess = sorted.slice(target)
          for (const t of excess) {
            if (t.status === 'free') await api.delete(`/tables/${t.id}`)
          }
        }

        // Mettre à jour les tables existantes
        const updateCount = Math.min(target, sorted.length)
        for (let i = 0; i < updateCount; i++) {
          await api.put(`/tables/${sorted[i].id}`, {
            number: sorted[i].number,
            capacity: this.configForm.tables[i].capacity,
            x_position: sorted[i].x_position,
            y_position: sorted[i].y_position,
          })
        }

        // Créer les nouvelles tables
        for (let i = sorted.length; i < target; i++) {
          const col = i % 6
          const row = Math.floor(i / 6)
          await api.post('/tables', {
            number: i + 1,
            capacity: this.configForm.tables[i].capacity,
            x_position: 40 + col * 145,
            y_position: 40 + row * 145,
          })
        }

        await this.loadTables()
        this.showConfig = false
      } catch (error) {
        console.error('Erreur configuration tables', error)
      } finally {
        this.configLoading = false
      }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

/* ── Root ── */
.tables-root {
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #f4f4f6;
  color: #0f0f12;
}

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
  font-size: 22px;
  font-weight: 600;
  color: #0f0f12;
  letter-spacing: -0.03em;
  margin: 0 0 4px;
}

.page-sub {
  font-size: 13px;
  color: #9b9bab;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.occ-pill {
  display: inline-block;
  background: #fee2e2;
  color: #991b1b;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 99px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}

.btn-ghost:hover {
  border-color: #c4b5fd;
  color: #7c3aed;
  background: #f5f3ff;
}

.btn-drag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #0f0f12;
  border: 1px solid #0f0f12;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}

.btn-drag:hover {
  background: #2a2a35;
}

.btn-drag.active {
  background: #7c3aed;
  border-color: #7c3aed;
  animation: pulse-btn 1.8s ease-in-out infinite;
}

@keyframes pulse-btn {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
}

/* ── Floor plan — parquet chaud ── */
.floor-wrap {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #0e0806;
  background-color: #1a0e06;
  /* Lattes de parquet : lignes verticales fines + vignette centrale */
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 79px,
      rgba(255, 200, 100, 0.045) 79px,
      rgba(255, 200, 100, 0.045) 80px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 59px,
      rgba(255, 200, 100, 0.028) 59px,
      rgba(255, 200, 100, 0.028) 60px
    ),
    radial-gradient(ellipse at 50% 45%, #26150a 0%, #120804 100%);
  box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.55);
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
  transition: filter 0.2s;
}

.table-item.drag-mode { cursor: grab; }
.table-item.dragging  { cursor: grabbing; z-index: 100; }

/* Halo coloré selon le statut */
.table-item.free     { filter: drop-shadow(0 0 10px rgba(34, 211, 122, 0.18)); }
.table-item.occupied { filter: drop-shadow(0 0 14px rgba(255, 70,  70,  0.30)); }
.table-item.reserved { filter: drop-shadow(0 0 14px rgba(255, 204,  0,  0.25)); }
.table-item.dirty    { filter: drop-shadow(0 0 14px rgba(77, 166, 255, 0.25)); }
.table-item.dragging { filter: brightness(1.2) drop-shadow(0 8px 24px rgba(0,0,0,0.7)) !important; }

/* Légère élévation au survol */
.table-item:not(.drag-mode):hover .table-surface {
  filter: brightness(1.08);
  transform: translate(-50%, -50%) scale(1.05);
}

/* ── Table surface ── */
.table-surface {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  z-index: 2;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/*
 * TABLE RONDE (≤ 4 personnes)
 * Bordure en bois sombre → nappe crème en arrière-plan CSS multicouche
 * Couche 1 (devant) : nappe ovale crème avec liseré ambré
 * Couche 2 (derrière): grain de bois radial chaud
 */
.table-surface.round {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background:
    /* Nappe crème avec liseré */
    radial-gradient(
      circle at center,
      #fffdf8 0%,
      #f6e9d2 72%,
      #ecd4a8 86%,
      rgba(160, 108, 48, 0.55) 91%,
      transparent 100%
    ) center / 62px 62px no-repeat,
    /* Bois : grain radial chaud */
    radial-gradient(
      ellipse at 38% 30%,
      #eca874 0%,
      #c07a3e 22%,
      #8c4e20 52%,
      #52280e 80%,
      #2c1406 100%
    );
  border: 2.5px solid #1c0c02;
  box-shadow:
    0 0 0 1px rgba(255, 165, 60, 0.2),
    0 3px 8px  rgba(0, 0, 0, 0.75),
    0 10px 28px rgba(0, 0, 0, 0.55),
    0 20px 50px rgba(0, 0, 0, 0.28),
    inset 0 1px 0  rgba(255, 205, 100, 0.25),
    inset 0 -3px 8px rgba(0, 0, 0, 0.5);
}

/*
 * TABLE RECTANGULAIRE (> 4 personnes)
 * Même principe : nappe centrale + bois en fond
 */
.table-surface.rect {
  width: 98px;
  height: 58px;
  border-radius: 9px;
  background:
    /* Nappe crème */
    linear-gradient(
      160deg,
      #fffdf8 0%,
      #f6e9d2 60%,
      #ecd4a8 90%
    ) center / 76px 38px no-repeat,
    /* Bois : grain linéaire */
    linear-gradient(
      148deg,
      #d8966e 0%,
      #b26838 22%,
      #7e401c 52%,
      #4e260e 80%,
      #2c1406 100%
    );
  border: 2.5px solid #1c0c02;
  box-shadow:
    0 0 0 1px rgba(255, 165, 60, 0.2),
    0 3px 8px  rgba(0, 0, 0, 0.75),
    0 10px 28px rgba(0, 0, 0, 0.55),
    0 20px 50px rgba(0, 0, 0, 0.28),
    inset 0 1px 0  rgba(255, 205, 100, 0.25),
    inset 0 -3px 8px rgba(0, 0, 0, 0.5);
}

/* Numéro de table — texte sombre lisible sur la nappe crème */
.table-num {
  font-size: 16px;
  font-weight: 700;
  color: #3c2010;
  letter-spacing: -0.02em;
  line-height: 1;
}

.table-order-tag {
  font-size: 8px;
  font-weight: 600;
  color: rgba(80, 44, 12, 0.6);
  letter-spacing: 0.04em;
}

/* ── Chaises — vue de dessus avec dossier visible ── */
.chairs-wrap {
  position: absolute;
  inset: 0;
}

.chair {
  position: absolute;
  border: 1.5px solid #1a0c02;
  border-radius: 5px;
  box-shadow:
    0 3px 7px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 180, 80, 0.1);
}

/*
 * Chaque chaise : gradient 2 zones
 *   zone "dossier" (côté extérieur, sombre) ≈ 38%
 *   zone "assise"  (côté table, caramel chaud)
 * Les border-radius asymétriques renforcent l'orientation
 */

/* Chaise en haut — dossier vers le haut */
.c-top {
  width: 30px;
  height: 22px;
  top: 3px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(180deg,
    #251006 0%,  #251006 36%,
    #7e5030 36%, #a87040 100%
  );
  border-radius: 6px 6px 4px 4px;
}

/* Chaise en bas — dossier vers le bas */
.c-bottom {
  width: 30px;
  height: 22px;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(0deg,
    #251006 0%,  #251006 36%,
    #7e5030 36%, #a87040 100%
  );
  border-radius: 4px 4px 6px 6px;
}

/* Chaise à gauche — dossier vers la gauche */
.c-left {
  width: 22px;
  height: 30px;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(90deg,
    #251006 0%,  #251006 36%,
    #7e5030 36%, #a87040 100%
  );
  border-radius: 6px 4px 4px 6px;
}

/* Chaise à droite — dossier vers la droite */
.c-right {
  width: 22px;
  height: 30px;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(270deg,
    #251006 0%,  #251006 36%,
    #7e5030 36%, #a87040 100%
  );
  border-radius: 4px 6px 6px 4px;
}

/* Chaises de coin (tables 6+ couverts) */
.c-top-left {
  top: 7px; left: 7px;
  width: 20px; height: 20px;
  background: linear-gradient(135deg, #251006 0%, #251006 44%, #7e5030 44%, #a87040 100%);
  border: 1.5px solid #1a0c02;
  border-radius: 5px;
}
.c-top-right {
  top: 7px; right: 7px;
  width: 20px; height: 20px;
  background: linear-gradient(225deg, #251006 0%, #251006 44%, #7e5030 44%, #a87040 100%);
  border: 1.5px solid #1a0c02;
  border-radius: 5px;
}
.c-bottom-left {
  bottom: 7px; left: 7px;
  width: 20px; height: 20px;
  background: linear-gradient(315deg, #251006 0%, #251006 44%, #7e5030 44%, #a87040 100%);
  border: 1.5px solid #1a0c02;
  border-radius: 5px;
}
.c-bottom-right {
  bottom: 7px; right: 7px;
  width: 20px; height: 20px;
  background: linear-gradient(45deg,  #251006 0%, #251006 44%, #7e5030 44%, #a87040 100%);
  border: 1.5px solid #1a0c02;
  border-radius: 5px;
}

/* ── Indicateur de statut — point lumineux ── */
.status-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #1a0e06;
  z-index: 5;
}

.status-dot.free {
  background: #22d37a;
  box-shadow: 0 0 0 2px rgba(34, 211, 122, 0.3), 0 0 9px rgba(34, 211, 122, 0.7);
}
.status-dot.occupied {
  background: #ff4848;
  box-shadow: 0 0 0 2px rgba(255, 72, 72, 0.3), 0 0 9px rgba(255, 72, 72, 0.7);
}
.status-dot.reserved {
  background: #ffcc00;
  box-shadow: 0 0 0 2px rgba(255, 204, 0, 0.3), 0 0 9px rgba(255, 204, 0, 0.7);
}
.status-dot.dirty {
  background: #4da8ff;
  box-shadow: 0 0 0 2px rgba(77, 168, 255, 0.3), 0 0 9px rgba(77, 168, 255, 0.7);
}

/* ── Drag handle ── */
.drag-handle {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.35);
  z-index: 6;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 380px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
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

.modal-close:hover {
  background: #f0f0f5;
  color: #3f3f4e;
}

.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: #fafafc;
  border: 1px solid #f0f0f5;
  border-radius: 10px;
  padding: 12px 14px;
}

.info-cell.full {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
}

.info-val {
  font-size: 14px;
  font-weight: 500;
  color: #0f0f12;
}

.info-val.mono {
  font-family: 'DM Sans', monospace;
}

.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  align-self: flex-start;
}

.status-pill.free { background: #dcfce7; color: #166534; }
.status-pill.occupied { background: #fee2e2; color: #991b1b; }
.status-pill.reserved { background: #fef3c7; color: #92400e; }
.status-pill.dirty { background: #dbeafe; color: #1e40af; }

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

/* ═══════════════════════════════════════
   COMPTOIR
═══════════════════════════════════════ */
.comptoir {
  position: absolute;
  width: 230px;
  user-select: none;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.comptoir.drag-mode {
  cursor: grab;
}
.comptoir.dragging {
  cursor: grabbing;
  z-index: 20;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5)) brightness(1.08);
}

/* Tabourets (bar stools) */
.bar-stools {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 0 20px;
}

.bar-stool {
  width: 28px;
  height: 14px;
  border-radius: 50% 50% 5px 5px / 8px 8px 5px 5px;
  background: radial-gradient(ellipse at 40% 35%, #a07850 0%, #6b4c2a 55%, #4a3218 100%);
  box-shadow:
    0 2px 4px rgba(0,0,0,0.5),
    inset 0 1px 2px rgba(255,255,255,0.15);
  position: relative;
}

.bar-stool::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 7px;
  background: linear-gradient(to bottom, #6b4c2a, #4a3218);
  border-radius: 0 0 2px 2px;
}

/* Surface principale du comptoir */
.counter-surface {
  width: 100%;
  height: 56px;
  border-radius: 10px;
  background:
    repeating-linear-gradient(
      88deg,
      transparent 0px,
      transparent 18px,
      rgba(0,0,0,0.06) 18px,
      rgba(0,0,0,0.06) 19px
    ),
    repeating-linear-gradient(
      2deg,
      transparent 0px,
      transparent 40px,
      rgba(255,255,255,0.03) 40px,
      rgba(255,255,255,0.03) 41px
    ),
    linear-gradient(160deg, #8b5e3c 0%, #5c3317 30%, #3d1f0a 65%, #2a1508 100%);
  box-shadow:
    0 4px 16px rgba(0,0,0,0.55),
    0 1px 0 rgba(255,255,255,0.08) inset,
    0 -2px 0 rgba(0,0,0,0.3) inset;
  border: 1px solid rgba(255,255,255,0.07);
  position: relative;
  overflow: hidden;
}

/* Reflet brillant sur le dessus */
.counter-surface::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to bottom,
    rgba(255,255,255,0.12) 0%,
    rgba(255,255,255,0.04) 60%,
    transparent 100%);
  border-radius: 10px 10px 0 0;
  pointer-events: none;
}

/* Bord avant du comptoir (profil) */
.counter-edge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(to bottom, #1a0a03, #0d0502);
  border-radius: 0 0 10px 10px;
}

/* Contenu intérieur */
.counter-inner {
  position: absolute;
  inset: 0;
  bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  z-index: 1;
}

.counter-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 220, 170, 0.9);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
}

.counter-icon {
  color: rgba(255, 200, 130, 0.7);
  flex-shrink: 0;
}

/* Drag handle positionné en haut à droite du comptoir */
.comptoir-handle {
  position: absolute;
  top: 16px;
  right: 6px;
  background: rgba(0,0,0,0.35);
  border-radius: 5px;
  padding: 3px;
  color: rgba(255,255,255,0.5);
  z-index: 10;
}

/* ── Modal transition ── */
.modal-enter-active, .modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

/* ── Bouton configurer ── */
.btn-config {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35);
}
.btn-config:hover {
  background: linear-gradient(135deg, #6d28d9, #5b21b6);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.5);
  transform: translateY(-1px);
}

/* ── Légende statut ── */
.floor-legend {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  padding: 7px 18px;
  z-index: 10;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: rgba(255,255,255,0.65);
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}
.ldot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ldot.free     { background: #22d37a; box-shadow: 0 0 5px rgba(34,211,122,0.7); }
.ldot.occupied { background: #ff4848; box-shadow: 0 0 5px rgba(255,72,72,0.7); }
.ldot.reserved { background: #ffcc00; box-shadow: 0 0 5px rgba(255,204,0,0.7); }
.ldot.dirty    { background: #4da8ff; box-shadow: 0 0 5px rgba(77,168,255,0.7); }

/* ── Config card (modale large) ── */
.config-card {
  background: white;
  border-radius: 18px;
  padding: 28px;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.config-section {
  margin: 20px 0 0;
}
.config-section + .config-section {
  border-top: 1px solid #f0f0f5;
  padding-top: 20px;
}

.config-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.config-section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #9b9bab;
  margin: 0 0 14px;
}
.config-section-head .config-section-label {
  margin-bottom: 0;
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  background: #fafafc;
  border: 1px solid #f0f0f5;
  border-radius: 10px;
  margin-bottom: 8px;
}
.config-row-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.config-row-label span {
  font-size: 13.5px;
  font-weight: 500;
  color: #0f0f12;
}
.config-row-label small {
  font-size: 11.5px;
  color: #9b9bab;
}

/* ── Stepper ── */
.stepper {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}
.stepper-btn {
  width: 32px;
  height: 32px;
  background: #f4f4f6;
  border: none;
  font-size: 17px;
  font-weight: 400;
  color: #3f3f4e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.1s;
  line-height: 1;
}
.stepper-btn:hover { background: #e4e4ec; }
.stepper-input {
  width: 52px;
  height: 32px;
  border: none;
  border-left: 1px solid #e4e4ec;
  border-right: 1px solid #e4e4ec;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #0f0f12;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  background: white;
}
.stepper-input::-webkit-inner-spin-button,
.stepper-input::-webkit-outer-spin-button { -webkit-appearance: none; }

.stepper.small .stepper-btn { width: 26px; height: 26px; font-size: 15px; }
.stepper.small .stepper-val {
  width: 32px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #0f0f12;
  background: white;
  border-left: 1px solid #e4e4ec;
  border-right: 1px solid #e4e4ec;
}

/* ── Liste tables ── */
.btn-apply-all {
  font-size: 11.5px;
  font-weight: 500;
  color: #7c3aed;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.12s;
}
.btn-apply-all:hover { background: #ede9fe; }

.config-table-list {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #f0f0f5;
  border-radius: 10px;
  overflow: hidden;
  overflow-y: auto;
}
.config-table-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  border-bottom: 1px solid #f5f5f8;
  transition: background 0.1s;
}
.config-table-row:last-child { border-bottom: none; }
.config-table-row:hover { background: #fafafc; }

.config-table-num {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #3f3f4e;
}
.table-num-badge {
  width: 24px;
  height: 24px;
  background: #f0f0f5;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #6b6b7b;
}

/* ── Avertissement ── */
.config-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fef9c3;
  border: 1px solid #fde68a;
  border-radius: 8px;
  font-size: 12.5px;
  color: #92400e;
  margin-top: 16px;
}

/* ── Responsive ── */
@media (max-width: 820px) {
  .main { padding: 20px 16px; }
  .floor-legend { gap: 12px; padding: 6px 14px; }
}
</style>