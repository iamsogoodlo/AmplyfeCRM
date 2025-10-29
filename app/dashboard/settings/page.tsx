'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Settings</CardTitle>
            <CardDescription>Manage your salon information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Tenant settings configuration coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect external services like Twilio and Vapi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Twilio</h4>
                <p className="text-sm text-gray-500">Configure SMS notifications</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Vapi</h4>
                <p className="text-sm text-gray-500">Configure AI voice agent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys for n8n integration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">API key management coming soon...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users & Permissions</CardTitle>
            <CardDescription>Manage team access and roles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">User management coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
