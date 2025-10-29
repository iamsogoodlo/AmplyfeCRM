import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getCurrentTenant } from '@/lib/tenant'

export const dynamic = 'force-dynamic'
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

    const barbers = await prisma.barber.findMany({
      where: {
        tenantId: tenant.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        color: true,
        calendarEmail: true,
        skills: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ barbers })
  } catch (error) {
    console.error('Error fetching barbers:', error)
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
    const { name, color, calendarEmail, skills } = body

    const barber = await prisma.barber.create({
      data: {
        tenantId: tenant.id,
        name,
        color: color || '#3b82f6',
        calendarEmail,
        skills: skills || [],
      },
    })

    return NextResponse.json(barber, { status: 201 })
  } catch (error) {
    console.error('Error creating barber:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
