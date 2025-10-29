import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCurrentTenant } from '@/lib/tenant'
import { clients } from '../ingest/route'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    if (!tenant) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        const clientKey = `tenant-${tenant.id}`
        clients.set(clientKey, controller)

        // Send initial connection message
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)

        // Cleanup on close
        request.signal.addEventListener('abort', () => {
          clients.delete(clientKey)
          controller.close()
        })
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error setting up SSE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
