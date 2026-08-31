export interface UploadResult {
  url: string
  path: string
  filename: string
}

export function useImageUpload() {
  const uploading = ref(false)
  const error = ref<string | null>(null)

  async function upload(file: File, folder = 'sections'): Promise<UploadResult | null> {
    uploading.value = true
    error.value = null

    try {
      const { request } = useApi()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await request<UploadResult>('/admin/upload', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })

      return res.data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al subir archivo'
      return null
    } finally {
      uploading.value = false
    }
  }

  async function remove(path: string): Promise<boolean> {
    try {
      const { request } = useApi()
      await request('/admin/upload', { method: 'DELETE', body: { path } })
      return true
    } catch {
      return false
    }
  }

  return { upload, remove, uploading, error }
}
