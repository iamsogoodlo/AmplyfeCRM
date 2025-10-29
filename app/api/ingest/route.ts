import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getCurrentTenant } from '@/lib/tenant'
import { broadcastEvent } from '@/lib/sse-clients'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    // For webhook ingestion, check API key or auth
    const session = await auth()
    const apiKey = request.headers.get('x-api-key')

    let tenantId: string | null = null

    if (apiKey) {
      // Validate API key
      const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')
      const key = await prisma.apiKey.findUnique({
        where: { hashedKey },
      })

      if (!key) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }

      tenantId = key.tenantId

      // Update last used
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      })
    } else if (session?.user?.id) {
      const tenant = await getCurrentTenant()
      if (!tenant) {
        return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
      }
      tenantId = tenant.id
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, payload } = body

    if (!type || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: type, payload' },
        { status: 400 }
      )
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        tenantId,
        type,
        payload,
      },
    })

    // Broadcast to SSE clients
    broadcastEvent(tenantId, event)

    return NextResponse.json({ ok: true, eventId: event.id })
  } catch (error) {
    console.error('Error ingesting event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
