<template>
  <div class="login-root">
    <div class="login-bg">
      <div class="grid-lines"></div>
    </div>

    <div class="login-left">
      <div class="brand-mark">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h12" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="20" cy="18" r="3" fill="#a78bfa"/>
          </svg>
        </div>
        <span class="brand-name">Clic<em>&</em>Table</span>
      </div>

      <div class="tagline-block">
        <h2>La restauration,<br>réinventée.</h2>
        <p>Gérez vos tables, commandes et équipes depuis une seule interface — conçue pour les professionnels de la salle.</p>
      </div>

      <div class="stats-row">
        <div class="stat">
          <span class="stat-value">2 400+</span>
          <span class="stat-label">Restaurants</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">98 %</span>
          <span class="stat-label">Satisfaction</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">24/7</span>
          <span class="stat-label">Support</span>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <div class="card-header">
          <h1>Connexion</h1>
          <p>Bienvenue. Entrez vos identifiants pour accéder à votre espace.</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field-group">
            <label for="email">Adresse e-mail</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M2 8l10 6 10-6" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <input
                id="email"
                type="email"
                v-model="email"
                placeholder="vous@restaurant.com"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <div class="field-group">
            <div class="label-row">
              <label for="password">Mot de passe</label>
              <a href="#" class="forgot-link">Oublié ?</a>
            </div>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" stroke-width="1.5"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </button>
            </div>
          </div>

          <p v-if="error" class="error-msg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ error }}
          </p>

          <button type="submit" class="submit-btn" :disabled="authStore.loading">
            <span v-if="authStore.loading" class="loading-dots">
              <span></span><span></span><span></span>
            </span>
            <span v-else>Continuer</span>
          </button>
        </form>

        <div class="demo-section">
          <div class="demo-label">
            <div class="demo-line"></div>
            <span>Comptes de démonstration</span>
            <div class="demo-line"></div>
          </div>
          <div class="role-list">
            <button
              v-for="role in roles"
              :key="role.email"
              class="role-btn"
              :class="{ active: email === role.email }"
              @click="setRole(role)"
              type="button"
            >
              <div class="role-avatar" :style="{ background: role.bg, color: role.color }">
                {{ role.initials }}
              </div>
              <div class="role-info">
                <span class="role-name">{{ role.name }}</span>
                <span class="role-email">{{ role.email }}</span>
              </div>
              <svg v-if="email === role.email" class="role-check" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
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
const showPassword = ref(false)

const roles = [
  {
    name: 'Administrateur',
    email: 'admin@clicettable.com',
    initials: 'AD',
    bg: '#ede9fe',
    color: '#6d28d9',
  },
  {
    name: 'Serveur',
    email: 'serveur@clicettable.com',
    initials: 'SR',
    bg: '#d1fae5',
    color: '#065f46',
  },
  {
    name: 'Cuisine',
    email: 'cuisine@clicettable.com',
    initials: 'CU',
    bg: '#fef3c7',
    color: '#92400e',
  },
]

const setRole = (role) => {
  email.value = role.email
  password.value = 'password123'
  error.value = ''
}

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
/* ── Fonts ── */

/* ── Root ── */
.login-root {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
  background: #fafafa;
  position: relative;
  overflow: hidden;
}

/* ── Background grid ── */
.login-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ── Left panel ── */
.login-left {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 56px;
  background:
    linear-gradient(
      to bottom,
      rgba(10, 8, 20, 0.55) 0%,
      rgba(10, 8, 20, 0.3) 40%,
      rgba(10, 8, 20, 0.72) 100%
    ),
    url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80') center / cover no-repeat;
  color: white;
  min-height: 100vh;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-icon {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.02em;
}
.brand-name em {
  font-style: normal;
  color: #a78bfa;
}

.tagline-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 420px;
}
.tagline-block h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 48px;
  line-height: 1.15;
  font-weight: 400;
  color: white;
  margin: 0 0 20px;
}
.tagline-block p {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255,255,255,0.5);
  margin: 0;
  font-weight: 300;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.02em;
}
.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.1);
}

/* ── Right panel ── */
.login-right {
  position: relative;
  z-index: 1;
  width: 480px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: #fafafa;
}

/* ── Card ── */
.login-card {
  width: 100%;
  max-width: 380px;
}

.card-header {
  margin-bottom: 32px;
}
.card-header h1 {
  font-size: 26px;
  font-weight: 600;
  color: #0f0f12;
  margin: 0 0 8px;
  letter-spacing: -0.03em;
}
.card-header p {
  font-size: 14px;
  color: #6b6b7b;
  margin: 0;
  line-height: 1.6;
}

/* ── Form ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 28px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.field-group label {
  font-size: 12px;
  font-weight: 500;
  color: #3f3f4e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.forgot-link {
  font-size: 12px;
  color: #7c3aed;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.15s;
}
.forgot-link:hover {
  opacity: 0.7;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 12px;
  color: #9b9bab;
  pointer-events: none;
  flex-shrink: 0;
}
.input-wrap input {
  width: 100%;
  padding: 11px 40px 11px 38px;
  border: 1px solid #e4e4ec;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
  background: white;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}
.input-wrap input::placeholder {
  color: #b5b5c5;
}
.input-wrap input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
}
.toggle-pw {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9b9bab;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.15s;
}
.toggle-pw:hover {
  color: #3f3f4e;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 0.15s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
}
.submit-btn:hover:not(:disabled) {
  background: #6d28d9;
}
.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Loading dots ── */
.loading-dots {
  display: flex;
  gap: 5px;
  align-items: center;
}
.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: dot-bounce 1.2s infinite ease-in-out;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* ── Demo section ── */
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.demo-label {
  display: flex;
  align-items: center;
  gap: 10px;
}
.demo-line {
  flex: 1;
  height: 1px;
  background: #e4e4ec;
}
.demo-label span {
  font-size: 11px;
  color: #9b9bab;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.role-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
  font-family: 'DM Sans', sans-serif;
}
.role-btn:hover {
  background: #f5f5ff;
  border-color: #c4b5fd;
}
.role-btn.active {
  background: #f5f3ff;
  border-color: #7c3aed;
}

.role-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.role-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.role-name {
  font-size: 13px;
  font-weight: 500;
  color: #0f0f12;
}
.role-email {
  font-size: 11px;
  color: #9b9bab;
}
.role-check {
  color: #7c3aed;
  flex-shrink: 0;
}

/* ── Responsive ── */
@media (max-width: 820px) {
  .login-left {
    display: none;
  }
  .login-right {
    width: 100%;
    padding: 40px 24px;
  }
}
</style>