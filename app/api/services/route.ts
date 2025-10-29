import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getCurrentTenant } from '@/lib/tenant'
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

    const services = await prisma.service.findMany({
      where: {
        tenantId: tenant.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        durationMin: true,
        priceCents: true,
        active: true,
      },
      orderBy: { ordering: 'asc' },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    if (!tenant) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, durationMin, priceCents } = body

    const service = await prisma.service.create({
      data: {
        tenantId: tenant.id,
        name,
        durationMin,
        priceCents,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
