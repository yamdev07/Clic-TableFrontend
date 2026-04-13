/**
 * useEcho — composable pour Laravel Echo + Reverb (WebSocket)
 *
 * Usage :
 *   const { subscribeKitchen, subscribeRestaurant, disconnect } = useEcho()
 *
 *   // Dans onMounted :
 *   subscribeKitchen(restaurantId, {
 *     'item.status.changed': (data) => handleItemUpdate(data),
 *     'order.received':      (data) => handleNewOrder(data),
 *   })
 *
 *   // Dans onBeforeUnmount :
 *   disconnect()
 */

import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { ref } from 'vue'

// Singleton Echo — une seule connexion WS pour toute l'app
let echoInstance = null

function getEcho() {
  if (echoInstance) return echoInstance

  window.Pusher = Pusher

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key:         import.meta.env.VITE_REVERB_APP_KEY    ?? 'clicettable-key',
    wsHost:      import.meta.env.VITE_REVERB_HOST       ?? 'localhost',
    wsPort:      import.meta.env.VITE_REVERB_PORT       ?? 8080,
    wssPort:     import.meta.env.VITE_REVERB_PORT       ?? 8080,
    forceTLS:   (import.meta.env.VITE_REVERB_SCHEME     ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    // Authentification via le cookie/token Sanctum
    authEndpoint: (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api')
      + '/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      },
    },
  })

  return echoInstance
}

export function useEcho() {
  const connected = ref(false)
  const channels  = []

  /**
   * S'abonner aux événements cuisine d'un restaurant.
   * @param {string} restaurantId
   * @param {Object} listeners  { 'event.name': handler }
   */
  function subscribeKitchen(restaurantId, listeners) {
    const echo    = getEcho()
    const channel = echo.private(`kitchen.${restaurantId}`)

    for (const [event, handler] of Object.entries(listeners)) {
      channel.listen(`.${event}`, handler)
    }

    channels.push(channel)
    connected.value = true
    return channel
  }

  /**
   * S'abonner aux événements globaux du restaurant (commandes, paiements…).
   * @param {string} restaurantId
   * @param {Object} listeners  { 'event.name': handler }
   */
  function subscribeRestaurant(restaurantId, listeners) {
    const echo    = getEcho()
    const channel = echo.private(`restaurant.${restaurantId}`)

    for (const [event, handler] of Object.entries(listeners)) {
      channel.listen(`.${event}`, handler)
    }

    channels.push(channel)
    connected.value = true
    return channel
  }

  /**
   * Se désabonner de tous les canaux ouverts par ce composable.
   * Appeler dans onBeforeUnmount.
   */
  function disconnect() {
    channels.forEach(channel => channel.unsubscribe?.())
    channels.length = 0
    connected.value = false
  }

  return { connected, subscribeKitchen, subscribeRestaurant, disconnect }
}
