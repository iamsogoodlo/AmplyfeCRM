import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tenantName, timezone, services, staff } = body

    if (!tenantName) {
      return NextResponse.json({ error: 'Tenant name is required' }, { status: 400 })
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        timezone: timezone || 'America/Toronto',
      },
    })

    // Link user to tenant as OWNER
    await prisma.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        role: Role.OWNER,
      },
    })

    // Create services
    if (services && services.length > 0) {
      await prisma.service.createMany({
        data: services
          .filter((s: any) => s.name)
          .map((s: any, idx: number) => ({
            tenantId: tenant.id,
            name: s.name,
            durationMin: s.duration || 30,
            priceCents: s.price || 0,
            ordering: idx,
          })),
      })
    }

    // Create staff
    if (staff && staff.length > 0) {
      await prisma.barber.createMany({
        data: staff
          .filter((s: any) => s.name)
          .map((s: any) => ({
            tenantId: tenant.id,
            name: s.name,
            color: s.color || '#3b82f6',
          })),
      })

      // Create default schedule rules (Mon-Sat, 9-5)
      const barbers = await prisma.barber.findMany({
        where: { tenantId: tenant.id },
      })

      const scheduleRules = []
      for (const barber of barbers) {
        for (let weekday = 1; weekday <= 6; weekday++) {
          // Mon-Sat
          scheduleRules.push({
            tenantId: tenant.id,
            barberId: barber.id,
            weekday,
            startTime: '09:00',
            endTime: '17:00',
          })
        }
      }

      await prisma.scheduleRule.createMany({
        data: scheduleRules,
      })
    }

    return NextResponse.json({ tenant }, { status: 201 })
  } catch (error) {
    console.error('Error during onboarding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
