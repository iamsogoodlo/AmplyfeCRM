import { NextRequest, NextResponse } from 'next/server'
import { checkAvailability } from '@/lib/availability'
import { auth } from '@/lib/auth'
import { getCurrentTenant } from '@/lib/tenant'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    // Support both session auth and API key auth
    const session = await auth()
    const apiKey = request.headers.get('x-api-key')

    let tenant: any = null

    if (apiKey) {
      // Validate API key
      const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')
      const key = await prisma.apiKey.findUnique({
        where: { hashedKey },
        include: { tenant: true },
      })

      if (!key) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }

      tenant = key.tenant

      // Update last used
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      })
    } else if (session?.user?.id) {
      tenant = await getCurrentTenant()
      if (!tenant) {
        return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const duration = searchParams.get('duration')
    const barberId = searchParams.get('barberId')
    const timezone = searchParams.get('timezone') || tenant.timezone

    if (!date || !time || !duration) {
      return NextResponse.json(
        { error: 'Missing required parameters: date, time, duration' },
        { status: 400 }
      )
    }

    const result = await checkAvailability({
      tenantId: tenant.id,
      date,
      time,
      duration: parseInt(duration),
      timezone,
      barberId: barberId || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
