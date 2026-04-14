# Clic&Table — Frontend

> Vue 3 SPA for the Clic&Table restaurant management system.  
> Vite · Pinia · Vue Router · Laravel Echo · Real-time WebSocket

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Pages & Routing](#pages--routing)
- [State Management](#state-management)
- [Real-time (WebSocket)](#real-time-websocket)
- [Notification System](#notification-system)
- [Testing](#testing)
- [Build & Production](#build--production)

---

## Requirements

| Dependency | Version |
|------------|---------|
| Node | 20+ |
| npm | 10+ |

---

## Installation

```bash
# Install dependencies (use ci for reproducible installs)
npm ci

# Dev server (hot reload)
npm run dev

# Run tests
npm run test

# Production build
npm run build
```

---

## Environment Variables

Create a `.env` file at the root (copy from `.env.example`):

```dotenv
VITE_API_URL=http://localhost:8000/api

VITE_REVERB_APP_KEY=clicettable-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

`VITE_API_URL` must match the Laravel backend URL. All `VITE_REVERB_*` values must match the backend `.env` Reverb configuration.

---

## Architecture

```
src/
├── assets/
│   └── skeleton.css          # Global shimmer skeleton animation classes
│
├── components/
│   ├── Notification.vue      # Centered popup notification (used by useNotif)
│   └── Sidebar.vue           # Navigation sidebar with role-based menu items
│
├── composables/
│   ├── useEcho.js            # Singleton Laravel Echo instance + fallback logic
│   ├── useNavLoader.js       # Top progress bar during route transitions
│   └── useNotif.js           # Global notification state (toast API)
│
├── router/
│   └── index.js              # 12 routes, auth guard, role-based access
│
├── services/
│   └── api.js                # Axios instance with Sanctum token interceptor
│
├── stores/
│   └── auth.js               # Pinia store: token, user, login/logout
│
└── views/                    # 12 page components
```

### API Service

`src/services/api.js` is an Axios instance that automatically:
- Attaches `Authorization: Bearer <token>` from the Pinia auth store
- Redirects to `/login` on 401 responses

### Skeleton loading

All pages use the global `.sk`, `.sk-card`, `.sk-text`, `.sk-kpi` CSS classes from `skeleton.css` to display shimmer placeholders while data loads. This avoids layout shift and communicates loading state consistently.

---

## Pages & Routing

| Route | View | Required role |
|-------|------|--------------|
| `/login` | Login.vue | Guest only |
| `/` | Dashboard.vue | All authenticated |
| `/tables` | Tables.vue | admin, manager, waiter |
| `/orders/new/:tableId` | NewOrder.vue | admin, manager, waiter |
| `/orders` | Orders.vue | admin, manager |
| `/waiter` | WaiterDashboard.vue | waiter |
| `/kitchen` | Kitchen.vue | kitchen, admin |
| `/menu` | Menu.vue | admin, manager |
| `/payments` | Payments.vue | admin, manager |
| `/users` | Users.vue | admin |
| `/logs` | Logs.vue | admin |

### Navigation guard

`router.beforeEach` checks:
1. Route requires auth → redirect to `/login` if no token
2. Route is guest-only → redirect to `/` if already authenticated
3. Role check via `canAccess()` → redirect to role default view if unauthorized

---

## State Management

Single Pinia store: `src/stores/auth.js`

```js
// Key state
token      // Sanctum bearer token (persisted in localStorage)
user       // { id, name, email, role, restaurant_id }

// Key actions
login(credentials)   // POST /login, store token, fetch user
logout()             // POST /logout, clear state
fetchMe()            // GET /me, hydrate user on page refresh
```

---

## Real-time (WebSocket)

`src/composables/useEcho.js` manages a **singleton** Laravel Echo instance:

```js
const { subscribeKitchen, subscribeRestaurant, disconnect } = useEcho()

subscribeKitchen(restaurantId, {
  'item.status.changed': (data) => { /* update KDS */ },
  'order.received':      (data) => { /* add new items */ },
})
```

**Graceful degradation** — if Laravel Reverb is not running, the composable detects the `unavailable` or `failed` Pusher connection state, disconnects immediately, and sets the instance to `null`. Each page that uses real-time data falls back to polling (60-second interval) automatically.

---

## Notification System

A lightweight custom notification system replaces third-party toast libraries.

**`src/composables/useNotif.js`** exports a `toast` object:

```js
import { toast } from '@/composables/useNotif'

toast.success('Commande créée', { description: 'Table 5 · 3 articles' })
toast.error('Erreur', { description: 'Message du serveur' })
toast.warning('Position occupée')
```

**`src/components/Notification.vue`** renders the active notification as a **centered popup** with a scale animation. It auto-dismisses after 2.8 seconds. The component is mounted once in `App.vue`.

---

## Testing

Tests are located in `src/tests/` and run with **Vitest**:

```bash
# Run once
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

Test files:
- `auth.store.test.js` — Pinia auth store unit tests
- `utils.test.js` — utility function tests
- `setup.js` — global test setup (mocks, stubs)

---

## Build & Production

```bash
npm run build
# Output → dist/
```

Key Vite optimisations in `vite.config.js`:

| Optimisation | Detail |
|-------------|--------|
| `manualChunks` | Splits into `vendor-vue`, `vendor-ui`, `vendor-echo`, `vendor-utils` |
| `optimizeDeps.include` | Pre-bundles `laravel-echo` and `pusher-js` |
| `esbuild.drop` | Strips all `console.*` and `debugger` in production |

Serve `dist/` from any static host. Configure the server to rewrite all paths to `index.html` for Vue Router history mode:

```nginx
# Nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
