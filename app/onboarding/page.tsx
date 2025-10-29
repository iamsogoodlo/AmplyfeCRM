'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Tenant info
  const [tenantName, setTenantName] = useState('')
  const [timezone, setTimezone] = useState('America/Toronto')

  // Services
  const [services, setServices] = useState<Array<{ name: string; duration: number; price: number }>>([
    { name: 'Haircut', duration: 30, price: 3000 },
  ])

  // Staff
  const [staff, setStaff] = useState<Array<{ name: string; color: string }>>([
    { name: 'Barber 1', color: '#3b82f6' },
  ])

  const handleCreateTenant = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantName,
          timezone,
          services,
          staff,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create tenant')
      }

      router.push('/dashboard')
    } catch (error) {
      alert('Error creating tenant')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to Salon CRM</CardTitle>
          <CardDescription>Let's set up your salon in a few steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Business Information</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Salon Name</label>
                <Input
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="My Barbershop"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="America/Toronto">Eastern Time (Toronto)</option>
                  <option value="America/New_York">Eastern Time (New York)</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Services</h3>
              {services.map((service, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Service name"
                    value={service.name}
                    onChange={(e) => {
                      const newServices = [...services]
                      newServices[idx].name = e.target.value
                      setServices(newServices)
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Duration (min)"
                    value={service.duration}
                    onChange={(e) => {
                      const newServices = [...services]
                      newServices[idx].duration = parseInt(e.target.value) || 0
                      setServices(newServices)
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Price (cents)"
                    value={service.price}
                    onChange={(e) => {
                      const newServices = [...services]
                      newServices[idx].price = parseInt(e.target.value) || 0
                      setServices(newServices)
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setServices([...services, { name: '', duration: 30, price: 0 }])}
                className="w-full"
              >
                Add Service
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Staff</h3>
              {staff.map((person, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Staff name"
                    value={person.name}
                    onChange={(e) => {
                      const newStaff = [...staff]
                      newStaff[idx].name = e.target.value
                      setStaff(newStaff)
                    }}
                  />
                  <Input
                    type="color"
                    value={person.color}
                    onChange={(e) => {
                      const newStaff = [...staff]
                      newStaff[idx].color = e.target.value
                      setStaff(newStaff)
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setStaff([...staff, { name: '', color: '#3b82f6' }])}
                className="w-full"
              >
                Add Staff Member
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleCreateTenant}
                  disabled={loading || !tenantName}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Finish Setup'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
