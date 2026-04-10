<template>
  <div class="tables-view">
    <header class="header">
      <h1>🍽️ Gestion des Tables</h1>
      <router-link to="/" class="back-btn">← Retour</router-link>
    </header>
    <div class="tables-grid">
      <div v-for="table in tables" :key="table.id" class="table-card" :class="table.status">
        <div class="table-number">{{ table.number }}</div>
        <div class="table-capacity">👥 {{ table.capacity }} pers.</div>
        <div class="table-status">{{ getStatusLabel(table.status) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  data() {
    return {
      tables: []
    }
  },
  async mounted() {
    await this.loadTables()
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
    getStatusLabel(status) {
      const labels = {
        free: '🟢 Libre',
        occupied: '🔴 Occupée',
        reserved: '🟡 Réservée',
        dirty: '🔵 À nettoyer'
      }
      return labels[status] || status
    }
  }
}
</script>

<style scoped>
.tables-view {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.back-btn {
  background: #667eea;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
}
.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.table-card.free { border-left: 4px solid #48bb78; }
.table-card.occupied { border-left: 4px solid #f56565; }
.table-card.reserved { border-left: 4px solid #ed8936; }
.table-number { font-size: 24px; font-weight: bold; color: #333; }
.table-capacity { font-size: 14px; color: #666; margin: 8px 0; }
.table-status { font-size: 12px; font-weight: 500; }
</style>