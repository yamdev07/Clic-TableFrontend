// Adresses du backend.
//
// Par défaut, on vise la même machine que celle qui sert le frontend :
// si la tablette ouvre http://192.168.1.20:5173, l'API est appelée sur
// http://192.168.1.20:8000/api. L'app fonctionne ainsi depuis n'importe quel
// appareil du réseau local sans configuration.
// Les variables VITE_* (.env) restent prioritaires, par exemple en production.

const host = window.location.hostname || 'localhost'
const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${protocol}//${host}:8000/api`

export const REVERB = {
  key: import.meta.env.VITE_REVERB_APP_KEY || 'clicettable-key',
  host: import.meta.env.VITE_REVERB_HOST || host,
  port: Number(import.meta.env.VITE_REVERB_PORT || 6001),
  scheme: import.meta.env.VITE_REVERB_SCHEME || protocol.replace(':', ''),
}
