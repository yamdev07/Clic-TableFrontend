<template>
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
        <h2 class="section-title">Commandes</h2>
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
          :class="{ 'card-paid': (order.due_amount || 0) <= 0 }"
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
              <span class="order-date">· {{ formatDate(order.created_at) }}</span>
            </div>
            <div class="order-total">{{ formatMoney(order.total) }}</div>
            <div class="order-paid">
              Payé: {{ formatMoney(order.paid_amount || 0) }}
            </div>
            <div class="order-due" :class="{ 'is-paid': (order.due_amount || 0) <= 0 }">
              {{ (order.due_amount || 0) > 0 ? 'Reste: ' + formatMoney(order.due_amount) : '✓ Soldé' }}
            </div>
          </div>
          <div class="order-card-footer">
            <button
              v-if="(order.due_amount || 0) > 0"
              class="pay-btn"
              @click="openPaymentModal(order)"
            >
              💰 Encaisser
            </button>
            <button
              class="invoice-btn"
              @click="viewInvoice(order)"
            >
              🧾 Facture
            </button>
          </div>
        </div>
        <div v-if="filteredOrders.length === 0" class="empty-state">
          Aucune commande à afficher
        </div>
      </div>
    </div>

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

    <!-- ── Invoice Modal ── -->
    <Transition name="modal">
      <div v-if="showInvoiceModal" class="modal-overlay" @click="showInvoiceModal = false">
        <div class="modal-card invoice-modal" @click.stop>
          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">Facture</p>
              <h2 class="modal-title">#{{ invoiceData?.order_number }}</h2>
            </div>
            <button class="modal-close" @click="showInvoiceModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="invoice-body" ref="invoiceContent">
            <div class="restaurant-header">
              <h3>Clic&Table Restaurant</h3>
              <p>Dakar, Sénégal</p>
              <p>Tel: +221 78 123 45 67</p>
            </div>

            <div class="invoice-details">
              <p><strong>N° Commande:</strong> {{ invoiceData?.order_number }}</p>
              <p><strong>Table:</strong> Table {{ invoiceData?.table?.number }}</p>
              <p><strong>Date:</strong> {{ formatDate(invoiceData?.created_at) }}</p>
              <p><strong>Serveur:</strong> {{ invoiceData?.user?.name }}</p>
            </div>

            <table class="invoice-items">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Qté</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoiceData?.items" :key="item.id">
                  <td>{{ item.item_name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatMoney(item.unit_price) }}</td>
                  <td>{{ formatMoney(item.total_price) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="invoice-totals">
              <p>Sous-total: {{ formatMoney(invoiceData?.subtotal) }}</p>
              <p>TVA 18%: {{ formatMoney(invoiceData?.tax) }}</p>
              <p>Service 5%: {{ formatMoney(invoiceData?.service_charge) }}</p>
              <p class="total"><strong>TOTAL: {{ formatMoney(invoiceData?.total) }}</strong></p>
              <p class="paid">Payé: {{ formatMoney(invoiceData?.paid_amount) }}</p>
            </div>

            <div class="invoice-footer">
              <p>Merci de votre visite !</p>
              <p>Règlement par espèces/carte/mobile money accepté</p>
            </div>
          </div>

          <div class="modal-footer invoice-actions">
            <button class="action-btn print" @click="printInvoice">🖨️ Imprimer</button>
            <button class="action-btn download" @click="downloadInvoice">📥 Télécharger PDF</button>
            <button class="action-btn ghost" @click="showInvoiceModal = false">Fermer</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const orders = ref([])
const activeFilter = ref('all')
const selectedOrder = ref(null)
const paymentMethod = ref('cash')
const paymentAmount = ref(0)
const paymentReference = ref('')
const showInvoiceModal = ref(false)
const invoiceData = ref(null)

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

const viewInvoice = async (order) => {
  try {
    const response = await api.get(`/orders/${order.id}`)
    invoiceData.value = response.data
    showInvoiceModal.value = true
  } catch (error) {
    console.error('Erreur chargement facture', error)
    alert('Impossible de charger la facture')
  }
}

const processPayment = async () => {
  if (!selectedOrder.value) return

  const orderId = selectedOrder.value.id  // sauvegarder avant closeModal()

  try {
    await api.post(`/orders/${orderId}/payments`, {
      amount: paymentAmount.value,
      method: paymentMethod.value,
      reference: paymentReference.value || null
    })

    closeModal()
    await loadData()

    const orderResponse = await api.get(`/orders/${orderId}`)
    invoiceData.value = orderResponse.data
    showInvoiceModal.value = true

  } catch (error) {
    console.error('Erreur paiement', error)
    alert('Erreur lors du paiement')
  }
}

const printInvoice = () => {
  const printContent = document.querySelector('.invoice-body').innerHTML
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>Facture ${invoiceData.value?.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .restaurant-header { text-align: center; margin-bottom: 20px; }
          .invoice-details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .invoice-totals { text-align: right; margin-top: 20px; }
          .total { font-size: 16px; font-weight: bold; }
          .invoice-footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `)
  printWindow.print()
  printWindow.close()
}

const downloadInvoice = () => {
  const inv = invoiceData.value
  if (!inv) return

  const formatM = (v) => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'XOF', minimumFractionDigits: 0
  }).format(v || 0)

  const rows = (inv.items || []).map(item => `
    <tr>
      <td>${item.item_name || ''}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatM(item.unit_price)}</td>
      <td style="text-align:right">${formatM(item.total_price)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Facture ${inv.order_number}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size:13px; color:#111; padding:32px; }
    .header { text-align:center; margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid #7c3aed; }
    .header h2 { color:#7c3aed; font-size:20px; margin-bottom:4px; }
    .header p { color:#555; font-size:12px; }
    .meta { display:flex; justify-content:space-between; margin-bottom:20px; font-size:12px; }
    .meta div { line-height:1.7; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    th { background:#f4f4f6; padding:8px 10px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.05em; border-bottom:2px solid #e4e4ec; }
    td { padding:9px 10px; border-bottom:1px solid #f0f0f5; }
    .totals { margin-left:auto; width:260px; }
    .totals tr td { padding:5px 10px; }
    .totals tr td:last-child { text-align:right; }
    .totals .sep td { border-top:1px solid #e4e4ec; padding-top:10px; }
    .totals .grand td { font-weight:700; font-size:15px; }
    .totals .paid td { color:#10b981; }
    .footer { text-align:center; margin-top:32px; font-size:11px; color:#999; border-top:1px solid #f0f0f5; padding-top:16px; }
    @media print { body { padding:16px; } }
  </style>
</head>
<body>
  <div class="header">
    <h2>Clic&amp;Table</h2>
    <p>Dakar, Sénégal &nbsp;|&nbsp; Tel: +221 78 123 45 67</p>
  </div>
  <div class="meta">
    <div>
      <strong>N° Commande:</strong> ${inv.order_number}<br/>
      <strong>Table:</strong> Table ${inv.table?.number || '—'}<br/>
      <strong>Serveur:</strong> ${inv.user?.name || '—'}
    </div>
    <div style="text-align:right">
      <strong>Date:</strong> ${new Date(inv.created_at).toLocaleString('fr-FR')}<br/>
      <strong>Statut:</strong> ${inv.status === 'paid' ? 'Payée' : 'En cours'}
    </div>
  </div>
  <table>
    <thead>
      <tr><th>Article</th><th style="text-align:center">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals">
    <tr><td>Sous-total</td><td>${formatM(inv.subtotal)}</td></tr>
    <tr><td>TVA 18%</td><td>${formatM(inv.tax)}</td></tr>
    <tr><td>Service 5%</td><td>${formatM(inv.service_charge)}</td></tr>
    <tr class="sep grand"><td>TOTAL</td><td>${formatM(inv.total)}</td></tr>
    <tr class="paid"><td>Payé</td><td>${formatM(inv.paid_amount)}</td></tr>
  </table>
  <div class="footer">Merci de votre visite ! &nbsp;·&nbsp; Règlement espèces / carte / mobile money accepté</div>
</body>
</html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

const formatMoney = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  loadData()
  setInterval(loadData, 30000)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

.payments-layout {
  min-height: 100vh;
  background: #f4f4f6;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
  padding: 32px 36px;
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

.stat-icon { font-size: 40px; }

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

.order-status.paid { background: #dcfce7; color: #166534; }
.order-status.unpaid { background: #fee2e2; color: #991b1b; }
.order-status.partial { background: #fef9c3; color: #854d0e; }

.order-card-body { margin-bottom: 16px; }
.order-table {
  font-size: 12px;
  color: #9b9bab;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.order-date { color: #c5c5d0; margin-left: 2px; }
.order-total {
  font-size: 18px;
  font-weight: 600;
  color: #0f0f12;
  margin-bottom: 4px;
}
.order-paid { font-size: 12px; color: #48bb78; }
.order-due { font-size: 12px; color: #f56565; }
.order-due.is-paid { color: #10b981; font-weight: 500; }

.card-paid { border-left: 3px solid #10b981; }

.order-card-footer {
  display: flex;
  gap: 8px;
}

.pay-btn {
  flex: 1;
  padding: 9px;
  background: #0f0f12;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: background 0.15s;
}
.pay-btn:hover { background: #2a2a35; }

.invoice-btn {
  flex: 1;
  padding: 9px;
  background: #f4f4f6;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  color: #6b6b7b;
  transition: all 0.15s;
}
.invoice-btn:hover { background: #f5f3ff; border-color: #c4b5fd; color: #7c3aed; }

.empty-state {
  text-align: center;
  padding: 60px;
  color: #c5c5d0;
}

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
  max-width: 550px;
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
.modal-close:hover { background: #f0f0f5; color: #3f3f4e; }

.modal-body { padding: 20px 24px; }

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

.due-highlight { color: #f56565; font-size: 16px; }

.form-group { margin-bottom: 20px; }
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
.method-btn.active { background: #0f0f12; border-color: #0f0f12; color: white; }

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
.action-btn.ghost:hover { background: #f4f4f6; }

.action-btn.primary {
  background: #0f0f12;
  color: white;
  border: none;
}
.action-btn.primary:hover:not(:disabled) { background: #2a2a35; }
.action-btn.primary:disabled { opacity: 0.4; cursor: not-allowed; }

.action-btn.print { background: #4299e1; color: white; border: none; }
.action-btn.print:hover { background: #3182ce; }

.action-btn.download { background: #48bb78; color: white; border: none; }
.action-btn.download:hover { background: #38a169; }

.invoice-modal { max-width: 600px; }
.invoice-body { padding: 24px; }

.restaurant-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e4e4ec;
}
.restaurant-header h3 { color: #7c3aed; margin-bottom: 8px; }
.restaurant-header p { margin: 4px 0; color: #6b6b7b; font-size: 12px; }

.invoice-details {
  margin-bottom: 20px;
  padding: 12px;
  background: #fafafc;
  border-radius: 8px;
}
.invoice-details p { margin: 6px 0; font-size: 13px; }

.invoice-items {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.invoice-items th, .invoice-items td {
  border: 1px solid #e4e4ec;
  padding: 8px;
  text-align: left;
  font-size: 13px;
}

.invoice-totals { text-align: right; margin-top: 20px; }
.invoice-totals p { margin: 6px 0; }
.invoice-totals .total { font-size: 16px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e4e4ec; }
.invoice-totals .paid { color: #10b981; }

.invoice-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 16px;
  border-top: 1px solid #e4e4ec;
  font-size: 12px;
  color: #9b9bab;
}

.invoice-actions { justify-content: center; gap: 16px; }

@media (max-width: 820px) {
  .payments-layout {
    padding: 20px 16px;
  }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>