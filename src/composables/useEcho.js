/**
 * useEcho — composable Laravel Echo + Reverb (WebSocket)
 *
 * Import dynamique : si laravel-echo / pusher-js ne sont pas installés
 * (npm install pas encore fait), l'app continue de fonctionner normalement
 * avec le polling comme seul mécanisme de refresh.
 */

import { ref } from 'vue'

let echoInstance = null

async function getEcho() {
  if (echoInstance) return echoInstance

  try {
    const [{ default: Echo }, { default: Pusher }] = await Promise.all([
      import('laravel-echo'),
      import('pusher-js'),
    ])

    window.Pusher = Pusher

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key:         import.meta.env.VITE_REVERB_APP_KEY  ?? 'clicettable-key',
      wsHost:      import.meta.env.VITE_REVERB_HOST     ?? 'localhost',
      wsPort:      Number(import.meta.env.VITE_REVERB_PORT  ?? 8080),
      wssPort:     Number(import.meta.env.VITE_REVERB_PORT  ?? 8080),
      forceTLS:   (import.meta.env.VITE_REVERB_SCHEME   ?? 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      // Désactiver les retries automatiques de Pusher
      activityTimeout:  30000,
      pongTimeout:      10000,
      authEndpoint: (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api')
        + '/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
      },
    })

    // Si Reverb est indisponible : log propre, pas de spam
    const pusher = echoInstance.connector.pusher
    pusher.connection.bind('unavailable', () => {
      console.warn('[WebSocket] Reverb indisponible — polling actif. Démarrez : php artisan reverb:start')
      pusher.disconnect()
      echoInstance = null
    })
    pusher.connection.bind('failed', () => {
      console.warn('[WebSocket] Connexion Reverb échouée — polling actif.')
      pusher.disconnect()
      echoInstance = null
    })

    return echoInstance
  } catch (err) {
    console.warn(
      '[useEcho] Laravel Echo non disponible — polling actif comme fallback.\n' +
      'Exécutez : npm install',
      err.message,
    )
    return null
  }
}

export function useEcho() {
  const connected = ref(false)
  const subscriptions = []

  async function subscribeKitchen(restaurantId, listeners) {
    const echo = await getEcho()
    if (!echo) return null

    const channel = echo.private(`kitchen.${restaurantId}`)
    for (const [event, handler] of Object.entries(listeners)) {
      channel.listen(`.${event}`, handler)
    }
    subscriptions.push(channel)
    connected.value = true
    return channel
  }

  async function subscribeRestaurant(restaurantId, listeners) {
    const echo = await getEcho()
    if (!echo) return null

    const channel = echo.private(`restaurant.${restaurantId}`)
    for (const [event, handler] of Object.entries(listeners)) {
      channel.listen(`.${event}`, handler)
    }
    subscriptions.push(channel)
    connected.value = true
    return channel
  }

  function disconnect() {
    subscriptions.forEach(ch => ch.unsubscribe?.())
    subscriptions.length = 0
    connected.value = false
  }

  return { connected, subscribeKitchen, subscribeRestaurant, disconnect }
}
