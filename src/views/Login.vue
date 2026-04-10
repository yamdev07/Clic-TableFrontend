<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <h1>🍽️ Clic&Table</h1>
        <p>Solution POS Professionnelle</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            v-model="email"
            placeholder="admin@clicettable.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            v-model="password"
            placeholder="••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit" :disabled="authStore.loading">
          <span v-if="authStore.loading">Connexion...</span>
          <span v-else>Se connecter</span>
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <div class="demo-accounts">
        <p>Comptes de démonstration :</p>
        <div class="demo-list">
          <span>admin@clicettable.com</span>
          <span>serveur@clicettable.com</span>
          <span>cuisine@clicettable.com</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@clicettable.com')
const password = ref('password123')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.message
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

.logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo h1 {
  color: #667eea;
  font-size: 32px;
  margin-bottom: 8px;
}

.logo p {
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

button {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #5a67d8;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #e53e3e;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
}

.demo-accounts {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  text-align: center;
}

.demo-accounts p {
  color: #666;
  font-size: 12px;
  margin-bottom: 8px;
}

.demo-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.demo-list span {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-family: monospace;
  color: #667eea;
}
</style>