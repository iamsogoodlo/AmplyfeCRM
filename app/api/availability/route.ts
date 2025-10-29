import { NextRequest, NextResponse } from 'next/server'
import { checkAvailability } from '@/lib/availability'
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
