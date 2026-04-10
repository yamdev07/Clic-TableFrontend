<template>
  <div class="tables-layout">
    <header class="header">
      <h1>🍽️ Plan des Tables</h1>
      <div class="header-actions">
        <div class="legend">
          <span class="legend-dot free"></span> Libre
          <span class="legend-dot occupied"></span> Occupée
          <span class="legend-dot reserved"></span> Réservée
          <span class="legend-dot dirty"></span> À nettoyer
        </div>
        <button @click="refreshTables" class="refresh-btn">🔄 Actualiser</button>
        <router-link to="/" class="back-btn">← Retour</router-link>
      </div>
    </header>

    <div class="floor-plan" ref="floorPlan">
      <div class="room-shape">
        <!-- Tables avec chaises -->
        <div
          v-for="table in tables"
          :key="table.id"
          class="table-wrapper"
          :class="[table.status, { selected: selectedTable === table.id }]"
          :style="{
            left: table.x_position + 'px',
            top: table.y_position + 'px'
          }"
          @click="selectTable(table)"
          @dblclick="openOrder(table)"
        >
          <!-- Table ronde ou rectangulaire selon capacité -->
          <div class="table-shape" :class="{ round: table.capacity <= 4, rectangle: table.capacity > 4 }">
            <div class="table-top"></div>
            <div class="table-number">{{ table.number }}</div>
          </div>
          
          <!-- Chaises autour de la table -->
          <div class="chairs">
            <!-- Chaise haut -->
            <div class="chair top" :class="{ occupied: table.status === 'occupied' }"></div>
            <!-- Chaise bas -->
            <div class="chair bottom" :class="{ occupied: table.status === 'occupied' }"></div>
            <!-- Chaise gauche -->
            <div class="chair left" :class="{ occupied: table.status === 'occupied' }"></div>
            <!-- Chaise droite -->
            <div class="chair right" :class="{ occupied: table.status === 'occupied' }"></div>
            <!-- Chaises diagonales pour grandes tables -->
            <div v-if="table.capacity > 4" class="chair top-left" :class="{ occupied: table.status === 'occupied' }"></div>
            <div v-if="table.capacity > 4" class="chair top-right" :class="{ occupied: table.status === 'occupied' }"></div>
            <div v-if="table.capacity > 4" class="chair bottom-left" :class="{ occupied: table.status === 'occupied' }"></div>
            <div v-if="table.capacity > 4" class="chair bottom-right" :class="{ occupied: table.status === 'occupied' }"></div>
          </div>
          
          <!-- Statut badge -->
          <div class="status-badge" :class="table.status">
            {{ getStatusIcon(table.status) }}
          </div>
          
          <!-- Commande active -->
          <div v-if="table.currentOrder" class="order-tooltip">
            🧾 {{ table.currentOrder.order_number }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Actions Table -->
    <div v-if="selectedTable" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h2>Table {{ selectedTable.number }}</h2>
        <div class="modal-info">
          <p><strong>Statut:</strong> {{ getStatusLabel(selectedTable.status) }}</p>
          <p><strong>Capacité:</strong> {{ selectedTable.capacity }} personnes</p>
          <p v-if="selectedTable.currentOrder">
            <strong>Commande en cours:</strong> {{ selectedTable.currentOrder.order_number }}
          </p>
        </div>
        <div class="modal-actions">
          <button 
            v-if="selectedTable.status === 'free'" 
            @click="newOrder" 
            class="btn-new-order"
          >
            🍽️ Nouvelle commande
          </button>
          <button 
            v-if="selectedTable.status === 'occupied'" 
            @click="viewOrder" 
            class="btn-view-order"
          >
            📋 Voir la commande
          </button>
          <button 
            v-if="selectedTable.status === 'dirty'" 
            @click="cleanTable" 
            class="btn-clean"
          >
            🧹 Marquer comme propre
          </button>
          <button @click="closeModal" class="btn-close">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'TablesView',
  data() {
    return {
      tables: [],
      selectedTable: null,
      loading: false
    }
  },
  mounted() {
    this.loadTables()
    // Rafraîchir toutes les 10 secondes
    this.interval = setInterval(this.loadTables, 10000)
  },
  beforeUnmount() {
    if (this.interval) clearInterval(this.interval)
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
    async refreshTables() {
      await this.loadTables()
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
        console.error('Erreur nettoyage table', error)
      }
    },
    openOrder(table) {
      if (table.status === 'free') {
        this.$router.push(`/orders/new/${table.id}`)
      } else if (table.status === 'occupied') {
        this.$router.push(`/orders/${table.currentOrder?.id}`)
      }
    },
    getStatusLabel(status) {
      const labels = {
        free: '🟢 Libre',
        occupied: '🔴 Occupée',
        reserved: '🟡 Réservée',
        dirty: '🔵 À nettoyer'
      }
      return labels[status] || status
    },
    getStatusIcon(status) {
      const icons = {
        free: '🟢',
        occupied: '🔴',
        reserved: '🟡',
        dirty: '🔵'
      }
      return icons[status] || '⚪'
    }
  }
}
</script>

<style scoped>
.tables-layout {
  min-height: 100vh;
  background: #1a202c;
  padding: 20px;
}

.header {
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  color: #2d3748;
  font-size: 24px;
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
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 4px;
}

.legend-dot.free { background: #48bb78; }
.legend-dot.occupied { background: #f56565; }
.legend-dot.reserved { background: #ed8936; }
.legend-dot.dirty { background: #4299e1; }

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

/* Plan du restaurant */
.floor-plan {
  background: #2d1f0e;
  background-image: radial-gradient(circle, #4a3720 1px, transparent 1px);
  background-size: 30px 30px;
  border-radius: 24px;
  min-height: calc(100vh - 120px);
  position: relative;
  overflow: auto;
  box-shadow: inset 0 0 0 4px #5c3d1a, 0 10px 20px rgba(0,0,0,0.3);
}

.room-shape {
  position: relative;
  width: 100%;
  min-height: 700px;
  height: 800px;
}

/* Wrapper de la table */
.table-wrapper {
  position: absolute;
  width: 140px;
  height: 140px;
  cursor: pointer;
  transition: transform 0.2s ease;
  z-index: 10;
}

.table-wrapper:hover {
  transform: scale(1.05);
  z-index: 20;
}

.table-wrapper.selected {
  z-index: 30;
}

/* Forme de la table */
.table-shape {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #c49a6c, #a07848);
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  z-index: 2;
  border: 1px solid #e8c48a;
}

.table-shape.round {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.table-shape.rectangle {
  width: 100px;
  height: 60px;
  border-radius: 12px;
}

.table-top {
  position: absolute;
  top: -6px;
  left: 5px;
  right: 5px;
  height: 8px;
  background: linear-gradient(135deg, #e8c48a, #d4a574);
  border-radius: 4px;
}

.table-number {
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
  z-index: 3;
}

/* Chaises */
.chairs {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.chair {
  position: absolute;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #8b6914, #6b4e10);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.2s ease;
  border: 1px solid #c8a030;
}

.chair::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #c8a030, #a07820);
  border-radius: 50%;
  top: -8px;
  left: 5px;
}

.chair::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 12px;
  background: #5a3e0a;
  bottom: -8px;
  left: 12px;
}

.chair.occupied {
  background: linear-gradient(135deg, #e53e3e, #c53030);
}

.chair.occupied::before {
  background: linear-gradient(135deg, #fc8181, #f56565);
}

/* Positions des chaises */
.chair.top {
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.chair.bottom {
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.chair.left {
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
}

.chair.right {
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
}

.chair.top-left {
  top: -20px;
  left: -20px;
}

.chair.top-right {
  top: -20px;
  right: -20px;
}

.chair.bottom-left {
  bottom: -20px;
  left: -20px;
}

.chair.bottom-right {
  bottom: -20px;
  right: -20px;
}

/* Badge de statut */
.status-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  z-index: 5;
  border: 2px solid white;
}

.status-badge.free {
  background: #48bb78;
}

.status-badge.occupied {
  background: #f56565;
}

.status-badge.reserved {
  background: #ed8936;
}

.status-badge.dirty {
  background: #4299e1;
}

/* Tooltip commande */
.order-tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d3748;
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  white-space: nowrap;
  z-index: 6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 25px 40px rgba(0,0,0,0.3);
}

.modal h2 {
  color: #2d3748;
  margin-bottom: 20px;
  font-size: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
}

.modal-info {
  margin-bottom: 24px;
}

.modal-info p {
  margin: 10px 0;
  color: #4a5568;
  font-size: 15px;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-actions button {
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-new-order {
  background: #48bb78;
  color: white;
}

.btn-new-order:hover {
  background: #38a169;
}

.btn-view-order {
  background: #4299e1;
  color: white;
}

.btn-view-order:hover {
  background: #3182ce;
}

.btn-clean {
  background: #ed8936;
  color: white;
}

.btn-clean:hover {
  background: #dd6b20;
}

.btn-close {
  background: #718096;
  color: white;
}

.btn-close:hover {
  background: #4a5568;
}
</style>