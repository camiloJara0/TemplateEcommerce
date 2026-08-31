/* CommerceOS Service Worker — Push notifications + Background sync */

const CACHE_NAME = 'commerceos-v1'
const OFFQUEUE = 'commerceos-outbox'

/* ===== Push Notification ===== */
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'CommerceOS', body: event.data.text() }
  }

  const title = payload.title || 'CommerceOS'
  const options = {
    body: payload.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: payload.actions || [],
    tag: payload.tag || 'default',
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

/* ===== Notification Click ===== */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})

/* ===== Background Sync ===== */
self.addEventListener('sync', (event) => {
  if (event.tag === 'commerceos-sync') {
    event.waitUntil(syncOutbox())
  }
})

async function syncOutbox() {
  try {
    const db = await openDB()
    const tx = db.transaction(OFFQUEUE, 'readonly')
    const store = tx.objectStore(OFFQUEUE)
    const items = await getAllFromStore(store)

    for (const item of items) {
      try {
        const response = await fetch(item.url, {
          method: item.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(item.headers || {}),
          },
          body: item.body ? JSON.stringify(item.body) : undefined,
        })

        if (response.ok) {
          await removeFromStore(item.id)
        }
      } catch {
        // Will retry on next sync
      }
    }
  } catch {
    // IndexedDB not available
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('commerceos-offline')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function removeFromStore(id) {
  return openDB().then((db) => {
    const tx = db.transaction(OFFQUEUE, 'readwrite')
    tx.objectStore(OFFQUEUE).delete(id)
  })
}

/* ===== Activate — clean old caches ===== */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

/* ===== Fetch — network first for API, cache first for assets ===== */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and API calls
  if (request.method !== 'GET') return

  // API: network first
  if (url.origin === 'http://localhost:8000') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Assets: cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return response
      })
    })
  )
})
