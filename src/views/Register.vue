<template>
  <div class="register-root">
    <div class="register-card">
      <router-link to="/login" class="brand-mark">
        <span class="brand-name">Clic<em>&</em>Table</span>
      </router-link>

      <div class="card-header">
        <h1>Créer mon restaurant</h1>
        <p>{{ TRIAL_DAYS }} jours d'essai gratuit, sans engagement.</p>
      </div>

      <form class="register-form" @submit.prevent="handleRegister">
        <fieldset>
          <legend>Votre restaurant</legend>
          <div class="field-group">
            <label for="restaurant_name">Nom du restaurant</label>
            <input id="restaurant_name" v-model="form.restaurant_name" placeholder="Chez Fatou" required />
            <span v-if="errors.restaurant_name" class="field-error">{{ errors.restaurant_name[0] }}</span>
          </div>
          <div class="field-group">
            <label for="phone">Téléphone <span class="optional">(optionnel)</span></label>
            <input id="phone" v-model="form.phone" type="tel" placeholder="+221 77 000 00 00" />
          </div>
        </fieldset>

        <fieldset>
          <legend>Votre compte administrateur</legend>
          <div class="field-group">
            <label for="name">Nom complet</label>
            <input id="name" v-model="form.name" autocomplete="name" required />
            <span v-if="errors.name" class="field-error">{{ errors.name[0] }}</span>
          </div>
          <div class="field-group">
            <label for="email">Adresse e-mail</label>
            <input id="email" v-model="form.email" type="email" autocomplete="email" placeholder="vous@restaurant.com" required />
            <span v-if="errors.email" class="field-error">{{ errors.email[0] }}</span>
          </div>
          <div class="field-row">
            <div class="field-group">
              <label for="password">Mot de passe</label>
              <input id="password" v-model="form.password" type="password" autocomplete="new-password" minlength="8" required />
            </div>
            <div class="field-group">
              <label for="password_confirmation">Confirmation</label>
              <input id="password_confirmation" v-model="form.password_confirmation" type="password" autocomplete="new-password" minlength="8" required />
            </div>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password[0] }}</span>
        </fieldset>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="submit-btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'Création…' : 'Démarrer mon essai gratuit' }}
        </button>
      </form>

      <p class="login-link">
        Déjà un compte ?
        <router-link to="/login">Se connecter</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const TRIAL_DAYS = 14

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  restaurant_name: '',
  phone: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})
const errors = ref({})
const error = ref('')

const handleRegister = async () => {
  errors.value = {}
  error.value = ''

  if (form.password !== form.password_confirmation) {
    errors.value = { password: ['Les mots de passe ne correspondent pas.'] }
    return
  }

  const result = await authStore.register({ ...form })
  if (result.success) {
    await authStore.fetchMe()
    router.push(authStore.homeRoute)
  } else {
    errors.value = result.errors
    if (!Object.keys(result.errors).length) error.value = result.message
  }
}
</script>

<style scoped>
.register-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
  background:
    linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px),
    #fafafa;
  background-size: 40px 40px, 40px 40px, auto;
}

.register-card {
  width: 100%;
  max-width: 480px;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 10px 30px rgba(15, 15, 18, 0.05);
}

.brand-mark {
  display: inline-block;
  margin-bottom: 24px;
  text-decoration: none;
}
.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: #0f0f12;
  letter-spacing: -0.02em;
}
.brand-name em {
  font-style: normal;
  color: #7c3aed;
}

.card-header {
  margin-bottom: 24px;
}
.card-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 6px;
  letter-spacing: -0.03em;
}
.card-header p {
  font-size: 14px;
  color: #6b6b7b;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

fieldset {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
legend {
  font-size: 13px;
  font-weight: 600;
  color: #7c3aed;
  margin-bottom: 12px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-group label {
  font-size: 12px;
  font-weight: 500;
  color: #3f3f4e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.optional {
  text-transform: none;
  color: #9b9bab;
  font-weight: 400;
}
.field-group input {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #e4e4ec;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-group input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
}

.field-error {
  font-size: 12px;
  color: #b91c1c;
}
.error-msg {
  font-size: 13px;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
}

.submit-btn {
  height: 46px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}
.submit-btn:hover:not(:disabled) {
  background: #6d28d9;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  margin: 20px 0 0;
  text-align: center;
  font-size: 13px;
  color: #6b6b7b;
}
.login-link a {
  color: #7c3aed;
  font-weight: 600;
  text-decoration: none;
}

@media (max-width: 480px) {
  .register-card {
    padding: 28px 20px;
  }
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
