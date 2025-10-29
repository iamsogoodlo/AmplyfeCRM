import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getCurrentTenant } from '@/lib/tenant'
import { zonedTimeToUtc } from 'date-fns-tz'
import { addMinutes, parseISO, setHours, setMinutes } from 'date-fns'
import { parseTimeString } from '@/lib/utils'
import { autoAssignBarber } from '@/lib/availability'
import { BookingSource } from '@prisma/client'

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
    const status = searchParams.get('status')
    const barberId = searchParams.get('barberId')
    const serviceId = searchParams.get('serviceId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { tenantId: tenant.id }

    if (status) where.status = status
    if (barberId) where.barberId = barberId
    if (serviceId) where.serviceId = serviceId
    if (startDate) where.startAt = { ...where.startAt, gte: new Date(startDate) }
    if (endDate) where.endAt = { ...where.endAt, lte: new Date(endDate) }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
      orderBy: { startAt: 'asc' },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Error fetching appointments:', error)
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
    const { customer, serviceId, barberId, date, time, timezone, notes, source } = body

    // Validate required fields
    if (!customer || !serviceId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: customer, serviceId, date, time' },
        { status: 400 }
      )
    }

    // Get service to determine duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Parse date and time
    const { hour, minute } = parseTimeString(time)
    const localDate = parseISO(date)
    const localDateTime = setMinutes(setHours(localDate, hour), minute)

    // Convert to UTC
    const tz = timezone || tenant.timezone
    const startAtUTC = zonedTimeToUtc(localDateTime, tz)
    const endAtUTC = addMinutes(startAtUTC, service.durationMin)

    // Find or create customer
    let customerRecord = await prisma.customer.findFirst({
      where: {
        tenantId: tenant.id,
        phone: customer.phone,
      },
    })

    if (!customerRecord) {
      customerRecord = await prisma.customer.create({
        data: {
          tenantId: tenant.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
        },
      })
    }

    // Auto-assign barber if not provided
    let finalBarberId = barberId
    if (!finalBarberId) {
      finalBarberId = await autoAssignBarber(
        tenant.id,
        serviceId,
        startAtUTC,
        endAtUTC,
        localDate.getDay(),
        hour,
        minute,
        service.durationMin
      )

      if (!finalBarberId) {
        return NextResponse.json(
          { error: 'No available barber found for the requested time' },
          { status: 409 }
        )
      }
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        customerId: customerRecord.id,
        barberId: finalBarberId,
        serviceId,
        startAt: startAtUTC,
        endAt: endAtUTC,
        notes,
        source: (source as BookingSource) || BookingSource.MANUAL,
      },
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
