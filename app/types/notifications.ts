export interface AppNotification {
  id: number
  type?: string
  title: string
  body?: string | null
  data?: Record<string, unknown>
  read_at?: string | null
  created_at?: string
}

export interface AppNotificationResponse {
  items: AppNotification[]
}

export interface PushSubscriptionPayload {
  endpoint: string
  auth: string,
  p256dh: string
}
