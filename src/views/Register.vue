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
        <h2>Votre restaurant,<br>en quelques clics.</h2>
        <p>Créez l'espace de votre restaurant, ajoutez votre équipe et suivez vos tables et vos commandes depuis une seule interface.</p>
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
          <h1>Créer mon restaurant</h1>
          <p>Créez votre espace et votre compte administrateur. Vous ajouterez ensuite votre équipe.</p>
        </div>

        <form @submit.prevent="handleRegister" class="login-form">
          <div class="field-group">
            <label for="restaurantName">Nom du restaurant</label>
            <input id="restaurantName" type="text" v-model.trim="restaurantName"
                   placeholder="Chez Awa" maxlength="255" required />
          </div>

          <div class="field-group">
            <label for="name">Votre nom</label>
            <input id="name" type="text" v-model.trim="name"
                   placeholder="Awa Koffi" maxlength="255" autocomplete="name" required />
          </div>

          <div class="field-group">
            <label for="email">Adresse e-mail</label>
            <input id="email" type="email" v-model.trim="email"
                   placeholder="vous@restaurant.com" autocomplete="email" required />
          </div>

        <div class="field-group">
  <label for="password">Mot de passe</label>
  <div class="input-wrap">
    <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password"
           placeholder="8 caractères minimum" minlength="8"
           autocomplete="new-password" required />
    <button type="button" class="toggle-pw" @click="showPassword = !showPassword"
            tabindex="-1" :aria-label="showPassword ? 'Masquer' : 'Afficher'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
        <line v-if="showPassword" x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </button>
  </div>
  <ul v-if="password" class="pw-rules">
    <li v-for="rule in rules" :key="rule.label" :class="{ ok: rule.ok }">
      <span class="pw-dot"></span>{{ rule.label }}
    </li>
  </ul>
</div>

<div class="field-group">
  <label for="confirmPassword">Confirmer le mot de passe</label>
  <div class="input-wrap">
    <input id="confirmPassword" :type="showPassword ? 'text' : 'password'" v-model="confirmPassword"
           placeholder="Retapez le mot de passe" autocomplete="new-password" required />
    <button type="button" class="toggle-pw" @click="showPassword = !showPassword"
            tabindex="-1" :aria-label="showPassword ? 'Masquer' : 'Afficher'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
        <line v-if="showPassword" x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </button>
  </div>
  <p v-if="confirmPassword && !passwordsMatch" class="field-hint">
    Les mots de passe ne correspondent pas.
  </p>
</div>

          <p v-if="error" class="error-msg">{{ error }}</p>

      <button type="submit" class="submit-btn" :disabled="authStore.loading || !canSubmit">
            <span v-if="authStore.loading" class="loading-dots">
              <span></span><span></span><span></span>
            </span>
            <span v-else>Créer mon restaurant</span>
          </button>
        </form>

        <p class="switch-link">
          Déjà un compte ? <router-link to="/login">Se connecter</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const restaurantName = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const error = ref('')

const rules = computed(() => [
  { label: '8 caractères minimum', ok: password.value.length >= 8 },
  {
    label: 'Une majuscule et une minuscule',
    ok: /\p{Ll}/u.test(password.value) && /\p{Lu}/u.test(password.value),
  },
  { label: 'Un chiffre', ok: /\p{N}/u.test(password.value) },
])

const passwordsMatch = computed(
  () => confirmPassword.value !== '' && password.value === confirmPassword.value,
)

const canSubmit = computed(() => rules.value.every((r) => r.ok) && passwordsMatch.value)

const handleRegister = async () => {
  if (!canSubmit.value) return
  error.value = ''
  const result = await authStore.register({
    restaurantName: restaurantName.value,
    name: name.value,
    email: email.value,
    password: password.value,
    passwordConfirmation: confirmPassword.value,
  })
  if (result.success) {
    router.push(authStore.homeRoute)
  } else {
    error.value = result.message
  }
}
</script>

<style scoped>
.login-root {
  display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif;
  color: #0f0f12; background: #fafafa; position: relative; overflow: hidden;
}
.login-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.grid-lines {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ── Panneau gauche ── */
.login-left {
  position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column;
  justify-content: space-between; padding: 48px 56px; color: white; min-height: 100vh;
  background:
    linear-gradient(to bottom, rgba(10,8,20,0.55) 0%, rgba(10,8,20,0.3) 40%, rgba(10,8,20,0.72) 100%),
    url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80') center / cover no-repeat;
}
.brand-mark { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  width: 36px; height: 36px; background: rgba(255,255,255,0.12);
  backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
}
.brand-name { font-size: 18px; font-weight: 600; color: white; letter-spacing: -0.02em; }
.brand-name em { font-style: normal; color: #a78bfa; }
.tagline-block {
  flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 420px;
}
.tagline-block h2 {
  font-family: 'DM Serif Display', serif; font-size: 48px; line-height: 1.15;
  font-weight: 400; color: white; margin: 0 0 20px;
}
.tagline-block p {
  font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.5); margin: 0; font-weight: 300;
}
.stats-row {
  display: flex; align-items: center; gap: 24px; padding-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.stat { display: flex; flex-direction: column; gap: 4px; }
.stat-value { font-size: 20px; font-weight: 600; color: white; letter-spacing: -0.02em; }
.stat-label {
  font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.06em;
}
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.1); }

/* ── Panneau droit ── */
.login-right {
  position: relative; z-index: 1; width: 480px; flex-shrink: 0; display: flex;
  align-items: center; justify-content: center; padding: 48px 40px; background: #fafafa;
}
.login-card { width: 100%; max-width: 380px; }
.card-header { margin-bottom: 28px; }
.card-header h1 { font-size: 26px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.03em; }
.card-header p { font-size: 14px; color: #6b6b7b; margin: 0; line-height: 1.6; }

.login-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.field-group { display: flex; flex-direction: column; gap: 7px; }
.field-group label {
  font-size: 12px; font-weight: 500; color: #3f3f4e;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.field-group input {
  width: 100%; padding: 11px 12px; border: 1px solid #e4e4ec; border-radius: 10px;
  font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f0f12; background: white;
  outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;
}
.field-group input::placeholder { color: #b5b5c5; }
.field-group input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap input { padding-right: 40px; }
.toggle-pw {
  position: absolute; right: 12px; background: none; border: none; cursor: pointer;
  color: #9b9bab; display: flex; align-items: center; padding: 0; transition: color 0.15s;
}
.toggle-pw:hover { color: #3f3f4e; }

.pw-rules {
  list-style: none; margin: 2px 0 0; padding: 0; display: flex;
  flex-direction: column; gap: 4px; font-size: 12px; color: #9b9bab;
}
.pw-rules li { display: flex; align-items: center; gap: 8px; }
.pw-dot { width: 6px; height: 6px; border-radius: 50%; background: #d4d4de; }
.pw-rules li.ok { color: #047857; }
.pw-rules li.ok .pw-dot { background: #10b981; }
.field-hint { font-size: 12px; color: #b91c1c; margin: 0; }

.error-msg {
  font-size: 13px; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 8px; padding: 10px 12px; margin: 0;
}
.submit-btn {
  width: 100%; height: 44px; background: #7c3aed; color: white; border: none;
  border-radius: 10px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, transform 0.1s;
}
.submit-btn:hover:not(:disabled) { background: #6d28d9; }
.submit-btn:active:not(:disabled) { transform: scale(0.98); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.loading-dots { display: flex; gap: 5px; align-items: center; }
.loading-dots span {
  width: 6px; height: 6px; border-radius: 50%; background: white;
  animation: dot-bounce 1.2s infinite ease-in-out;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.switch-link { font-size: 13px; color: #6b6b7b; text-align: center; margin: 0; }
.switch-link a { color: #7c3aed; font-weight: 500; text-decoration: none; }

@media (max-width: 820px) {
  .login-left { display: none; }
  .login-right { width: 100%; padding: 40px 24px; }
}
</style>
