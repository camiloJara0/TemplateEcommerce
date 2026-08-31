export interface AppNotification {
  id: number
  type?: string
  title: string
  body?: string | null
  data?: Record<string, unknown>
  read_at?: string | null
  created_at?: string
}

export interface PushSubscriptionPayload {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}
