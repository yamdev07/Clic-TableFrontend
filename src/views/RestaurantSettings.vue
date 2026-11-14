<template>
  <div class="settings-view">
    <header class="page-header">
      <h1>Mon restaurant</h1>
      <p>Ces informations apparaissent en en-tête des factures.</p>
    </header>

    <div v-if="loading" class="card">Chargement…</div>

    <form v-else class="card" @submit.prevent="save">
      <div class="field">
        <label for="r-name">Nom de l'établissement</label>
        <input id="r-name" v-model="form.name" required maxlength="255" />
      </div>
      <div class="field">
        <label for="r-address">Adresse</label>
        <input id="r-address" v-model="form.address" maxlength="500" placeholder="Quartier, ville, pays" />
      </div>
      <div class="row">
        <div class="field">
          <label for="r-phone">Téléphone</label>
          <input id="r-phone" v-model="form.phone" type="tel" maxlength="30" />
        </div>
        <div class="field">
          <label for="r-email">E-mail</label>
          <input id="r-email" v-model="form.email" type="email" required maxlength="255" />
        </div>
      </div>

      <div class="preview">
        <span class="preview-label">Aperçu de l'en-tête de facture</span>
        <strong>{{ form.name || '—' }}</strong>
        <span v-if="form.address">{{ form.address }}</span>
        <span v-if="form.phone">Tél : {{ form.phone }}</span>
      </div>

      <div class="actions">
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '@/services/api'
import { toast } from '@/composables/useNotif'

const form = reactive({ name: '', address: '', phone: '', email: '' })
const loading = ref(true)
const saving = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get('/restaurant')
    Object.assign(form, {
      name: data.name || '',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
    })
  } catch {
    // erreur déjà notifiée par l'intercepteur
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    await api.put('/restaurant', { ...form })
    toast.success('Informations enregistrées')
  } catch {
    // erreur déjà notifiée par l'intercepteur
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.settings-view {
  padding: 24px 16px;
  max-width: 640px;
  margin: 0 auto;
  font-family: 'DM Sans', -apple-system, sans-serif;
  color: #0f0f12;
}
.page-header {
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.page-header p {
  font-size: 14px;
  color: #6b6b7b;
  margin-top: 4px;
}
.card {
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field label {
  font-size: 12px;
  font-weight: 500;
  color: #3f3f4e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.field input {
  padding: 10px 12px;
  border: 1px solid #e4e4ec;
  border-radius: 10px;
  font: inherit;
  font-size: 14px;
  outline: none;
}
.field input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
}
.preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 16px;
  border: 1px dashed #d4d4de;
  border-radius: 10px;
  font-size: 13px;
  color: #555;
  text-align: center;
}
.preview strong {
  font-size: 16px;
  color: #0f0f12;
}
.preview-label {
  font-size: 11px;
  color: #9b9bab;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
.btn-primary {
  padding: 10px 18px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 10px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@media (max-width: 520px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
