// SSE clients tracking - shared module
export const clients = new Map<string, ReadableStreamDefaultController>()

export function broadcastEvent(tenantId: string, event: any) {
  const clientKey = `tenant-${tenantId}`
  const controller = clients.get(clientKey)

  if (controller) {
    try {
      const data = JSON.stringify(event)
      controller.enqueue(`data: ${data}\n\n`)
    } catch (error) {
      console.error('Error broadcasting event:', error)
    }
  }
}
