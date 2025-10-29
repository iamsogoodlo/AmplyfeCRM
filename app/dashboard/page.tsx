'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Calendar, TrendingUp, Clock, MessageSquare, AlertCircle } from 'lucide-react'

interface KPIs {
  callsReceived: number
  bookingsCreated: number
  conversionRate: number
  avgCallDuration: number
  smsSent: number
  errors: number
}

interface Event {
  id: string
  type: string
  ts: string
  payload: any
}

export default function DashboardPage() {
  const [range, setRange] = useState('7d')
  const [kpis, setKpis] = useState<KPIs>({
    callsReceived: 0,
    bookingsCreated: 0,
    conversionRate: 0,
    avgCallDuration: 0,
    smsSent: 0,
    errors: 0,
  })
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKPIs()
    connectSSE()
  }, [range])

  const fetchKPIs = async () => {
    try {
      const res = await fetch(`/api/kpis?range=${range}`)
      const data = await res.json()
      setKpis(data.kpis)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching KPIs:', error)
      setLoading(false)
    }
  }

  const connectSSE = () => {
    const eventSource = new EventSource('/api/events')

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type !== 'connected') {
          setEvents((prev) => [data, ...prev].slice(0, 10))
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error)
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
    }

    return () => eventSource.close()
  }

  const kpiCards = [
    {
      title: 'Calls Received',
      value: kpis.callsReceived,
      icon: Phone,
      color: 'text-blue-600',
    },
    {
      title: 'Bookings',
      value: kpis.bookingsCreated,
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Conversion Rate',
      value: `${kpis.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Avg Call Duration',
      value: `${kpis.avgCallDuration}s`,
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'SMS Sent',
      value: kpis.smsSent,
      icon: MessageSquare,
      color: 'text-cyan-600',
    },
    {
      title: 'Errors',
      value: kpis.errors,
      icon: AlertCircle,
      color: 'text-red-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setRange('today')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              range === 'today' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setRange('7d')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              range === '7d' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setRange('30d')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              range === '30d' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : kpi.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Live Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Feed</CardTitle>
          <CardDescription>Real-time events from your AI receptionist</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-gray-500">No events yet. Waiting for activity...</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-md"
                >
                  <div
                    className={`w-2 h-2 mt-1.5 rounded-full ${
                      event.type === 'error'
                        ? 'bg-red-500'
                        : event.type === 'booking_created'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.ts).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
