const DB_NAME = 'commerceos-offline'
const DB_VERSION = 1

const STORES = ['kv', 'outbox', 'meta'] as const

type StoreName = (typeof STORES)[number]

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB no disponible'))
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: store === 'outbox' ? 'localId' : 'key' })
          }
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return dbPromise
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function dbGet<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  try {
    const db = await openDB()
    const tx = db.transaction(store, 'readonly')
    const result = await requestToPromise(tx.objectStore(store).get(key))
    return result as T | undefined
  } catch {
    return undefined
  }
}

export async function dbGetAll<T>(store: StoreName): Promise<T[]> {
  try {
    const db = await openDB()
    const tx = db.transaction(store, 'readonly')
    const result = await requestToPromise(tx.objectStore(store).getAll())
    return (result as T[]) ?? []
  } catch {
    return []
  }
}

export async function dbPut(store: StoreName, value: unknown): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).put(value)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // almacenamiento no disponible
  }
}

export async function dbDelete(store: StoreName, key: IDBValidKey): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).delete(key)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // almacenamiento no disponible
  }
}

export async function dbClear(store: StoreName): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).clear()
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // almacenamiento no disponible
  }
}
