'use client'

import { useEffect, useState } from 'react'
import { startOfWeek, addDays, format, addWeeks, subWeeks } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Appointment {
  id: string
  startAt: string
  endAt: string
  customer: { name: string; phone: string }
  barber: { name: string; color: string }
  service: { name: string }
  status: string
}

export default function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    fetchAppointments()
  }, [currentWeek])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const startDate = weekStart.toISOString()
      const endDate = addDays(weekStart, 7).toISOString()

      const res = await fetch(`/api/appointments?startDate=${startDate}&endDate=${endDate}`)
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return appointments.filter((apt) => {
      const aptDate = format(new Date(apt.startAt), 'yyyy-MM-dd')
      return aptDate === dayStr
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCurrentWeek(new Date())}>Today</Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 text-sm font-medium text-gray-500">Time</div>
          {days.map((day) => (
            <div key={day.toISOString()} className="p-4 text-center border-l">
              <div className="text-sm font-medium text-gray-900">
                {format(day, 'EEE')}
              </div>
              <div className="text-sm text-gray-500">{format(day, 'MMM d')}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="relative">
            {Array.from({ length: 11 }, (_, i) => i + 9).map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b">
                <div className="p-4 text-sm text-gray-500">
                  {format(new Date().setHours(hour, 0), 'h:mm a')}
                </div>
                {days.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day).filter((apt) => {
                    const aptHour = new Date(apt.startAt).getHours()
                    return aptHour === hour
                  })

                  return (
                    <div key={day.toISOString()} className="p-2 border-l min-h-[80px]">
                      {dayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-2 rounded mb-1 text-xs"
                          style={{
                            backgroundColor: apt.barber.color + '20',
                            borderLeft: `3px solid ${apt.barber.color}`,
                          }}
                        >
                          <div className="font-medium">{apt.customer.name}</div>
                          <div className="text-gray-600">{apt.service.name}</div>
                          <div className="text-gray-500">{apt.barber.name}</div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
