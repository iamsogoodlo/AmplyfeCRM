import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getCurrentTenant } from '@/lib/tenant'
import { subDays, startOfDay, endOfDay } from 'date-fns'

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

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'

    let daysBack = 7
    if (range === '30d') daysBack = 30
    else if (range === 'today') daysBack = 0

    const startDate = daysBack === 0 ? startOfDay(new Date()) : subDays(new Date(), daysBack)
    const endDate = endOfDay(new Date())

    // Fetch events for the range
    const events = await prisma.event.findMany({
      where: {
        tenantId: tenant.id,
        ts: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Calculate KPIs
    const callsReceived = events.filter((e) => e.type === 'call_received').length
    const bookingsParsed = events.filter((e) => e.type === 'booking_parsed').length
    const bookingsCreated = events.filter((e) => e.type === 'booking_created').length
    const smsSent = events.filter((e) => e.type === 'sms_sent').length
    const errors = events.filter((e) => e.type === 'error').length

    // Calculate average call duration
    const callDurations = events
      .filter((e) => e.type === 'call_received' && e.payload && typeof e.payload === 'object')
      .map((e: any) => e.payload.callDurationSec || 0)
      .filter((d: number) => d > 0)

    const avgCallDuration =
      callDurations.length > 0
        ? callDurations.reduce((a: number, b: number) => a + b, 0) / callDurations.length
        : 0

    // Conversion rate
    const conversionRate = callsReceived > 0 ? (bookingsCreated / callsReceived) * 100 : 0

    // Fetch confirmed appointments for the range
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        startAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'CONFIRMED',
      },
      include: {
        service: true,
      },
    })

    // Service mix
    const serviceMix: Record<string, number> = {}
    appointments.forEach((apt) => {
      const serviceName = apt.service.name
      serviceMix[serviceName] = (serviceMix[serviceName] || 0) + 1
    })

    // Peak hours (hour of day → count)
    const peakHours: Record<number, number> = {}
    appointments.forEach((apt) => {
      const hour = apt.startAt.getHours()
      peakHours[hour] = (peakHours[hour] || 0) + 1
    })

    return NextResponse.json({
      kpis: {
        callsReceived,
        bookingsCreated,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgCallDuration: Math.round(avgCallDuration),
        smsSent,
        errors,
      },
      charts: {
        serviceMix,
        peakHours,
      },
    })
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
