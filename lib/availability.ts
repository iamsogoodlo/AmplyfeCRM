import { prisma } from './db'
import { toZonedTime, fromZonedTime, format } from 'date-fns-tz'
import { addMinutes, parseISO, setHours, setMinutes } from 'date-fns'
import { parseTimeString } from './utils'

interface AvailabilityRequest {
  tenantId: string
  date: string // YYYY-MM-DD
  time: string // "H:MM AM/PM"
  duration: number // minutes
  timezone: string
  barberId?: string
}

interface AvailabilityResult {
  available: boolean
  barberId?: string
  alternatives: string[] // array of time strings
}

export async function checkAvailability(
  req: AvailabilityRequest
): Promise<AvailabilityResult> {
  const { tenantId, date, time, duration, timezone, barberId } = req

  // Parse the date and time in the tenant's timezone
  const { hour, minute } = parseTimeString(time)
  const localDate = parseISO(date)
  const localDateTime = setMinutes(setHours(localDate, hour), minute)

  // Convert to UTC for database queries
  const startAtUTC = fromZonedTime(localDateTime, timezone)
  const endAtUTC = addMinutes(startAtUTC, duration)

  // Get candidate barbers
  let candidates: Array<{ id: string; name: string }>

  if (barberId) {
    const barber = await prisma.barber.findFirst({
      where: { id: barberId, tenantId, active: true },
      select: { id: true, name: true },
    })
    candidates = barber ? [barber] : []
  } else {
    candidates = await prisma.barber.findMany({
      where: { tenantId, active: true },
      select: { id: true, name: true },
    })
  }

  // Check each candidate
  for (const candidate of candidates) {
    const isAvailable = await isBarberAvailable(
      candidate.id,
      startAtUTC,
      endAtUTC,
      localDate.getDay(),
      hour,
      minute,
      duration
    )

    if (isAvailable) {
      return {
        available: true,
        barberId: candidate.id,
        alternatives: [],
      }
    }
  }

  // If no one available, find alternatives
  const alternatives = await findAlternatives(
    tenantId,
    localDate,
    duration,
    timezone,
    candidates.map((c) => c.id)
  )

  return {
    available: false,
    alternatives,
  }
}

async function isBarberAvailable(
  barberId: string,
  startAtUTC: Date,
  endAtUTC: Date,
  weekday: number,
  hour: number,
  minute: number,
  durationMin: number
): Promise<boolean> {
  // 1. Check schedule rules for this weekday
  const scheduleRules = await prisma.scheduleRule.findMany({
    where: { barberId, weekday },
  })

  if (scheduleRules.length === 0) return false // Not working this day

  const requestStartMin = hour * 60 + minute
  const requestEndMin = requestStartMin + durationMin

  let withinSchedule = false
  for (const rule of scheduleRules) {
    const ruleStart = parseTimeString(rule.startTime)
    const ruleEnd = parseTimeString(rule.endTime)
    const ruleStartMin = ruleStart.hour * 60 + ruleStart.minute
    const ruleEndMin = ruleEnd.hour * 60 + ruleEnd.minute

    if (requestStartMin >= ruleStartMin && requestEndMin <= ruleEndMin) {
      withinSchedule = true
      break
    }
  }

  if (!withinSchedule) return false

  // 2. Check for overlapping appointments
  const overlappingAppointments = await prisma.appointment.findMany({
    where: {
      barberId,
      status: { in: ['CONFIRMED', 'TENTATIVE'] },
      OR: [
        {
          AND: [{ startAt: { lte: startAtUTC } }, { endAt: { gt: startAtUTC } }],
        },
        {
          AND: [{ startAt: { lt: endAtUTC } }, { endAt: { gte: endAtUTC } }],
        },
        {
          AND: [{ startAt: { gte: startAtUTC } }, { endAt: { lte: endAtUTC } }],
        },
      ],
    },
  })

  if (overlappingAppointments.length > 0) return false

  // 3. Check for time off
  const timeOffs = await prisma.timeOff.findMany({
    where: {
      barberId,
      startAt: { lte: endAtUTC },
      endAt: { gte: startAtUTC },
    },
  })

  if (timeOffs.length > 0) return false

  return true
}

async function findAlternatives(
  tenantId: string,
  localDate: Date,
  duration: number,
  timezone: string,
  barberIds: string[]
): Promise<string[]> {
  const alternatives: string[] = []
  const weekday = localDate.getDay()

  // Get all schedule rules for this day
  const scheduleRules = await prisma.scheduleRule.findMany({
    where: {
      tenantId,
      weekday,
      barberId: { in: barberIds },
    },
  })

  // Generate potential time slots (every 30 minutes)
  const slots: Array<{ hour: number; minute: number }> = []
  for (let h = 9; h <= 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 19 && m > 0) break // Don't go past 7 PM
      slots.push({ hour: h, minute: m })
    }
  }

  // Check each slot
  for (const slot of slots) {
    if (alternatives.length >= 3) break

    const localDateTime = setMinutes(setHours(localDate, slot.hour), slot.minute)
    const startAtUTC = fromZonedTime(localDateTime, timezone)
    const endAtUTC = addMinutes(startAtUTC, duration)

    for (const barberId of barberIds) {
      const available = await isBarberAvailable(
        barberId,
        startAtUTC,
        endAtUTC,
        weekday,
        slot.hour,
        slot.minute,
        duration
      )

      if (available) {
        const timeStr = format(localDateTime, 'h:mm a', { timeZone: timezone })
        if (!alternatives.includes(timeStr)) {
          alternatives.push(timeStr)
        }
        break
      }
    }
  }

  return alternatives
}

export async function autoAssignBarber(
  tenantId: string,
  serviceId: string,
  startAtUTC: Date,
  endAtUTC: Date,
  weekday: number,
  hour: number,
  minute: number,
  duration: number
): Promise<string | null> {
  // Get barbers who can perform this service
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  })

  if (!service) return null

  const candidates = await prisma.barber.findMany({
    where: {
      tenantId,
      active: true,
    },
  })

  for (const barber of candidates) {
    const available = await isBarberAvailable(
      barber.id,
      startAtUTC,
      endAtUTC,
      weekday,
      hour,
      minute,
      duration
    )

    if (available) {
      return barber.id
    }
  }

  return null
}
