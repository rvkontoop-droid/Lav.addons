"use client"

import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthDebug() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Status:</strong> {status}
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div>
            <strong>Environment Check:</strong>
            <ul className="list-disc ml-4">
              <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Missing"}</li>
              <li>DISCORD_CLIENT_ID: {process.env.DISCORD_CLIENT_ID ? "✅ Set" : "❌ Missing"}</li>
            </ul>
          </div>

          {session && (
            <div>
              <strong>Session Data:</strong>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
