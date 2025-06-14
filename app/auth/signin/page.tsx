"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const authError = searchParams.get("error")

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push(callbackUrl)
      }
    })
  }, [router, callbackUrl])

  useEffect(() => {
    if (authError) {
      setError("Authentication failed. Please try again.")
    }
  }, [authError])

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("discord", {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError("Failed to sign in with Discord. Please try again.")
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
              <img
                src="/images/server-avatar.jpg"
                alt="ŁAF Server Avatar"
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to ŁAF | لـاَف</CardTitle>
          <CardDescription>Sign in with Discord to access our exclusive addon collection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button onClick={handleSignIn} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? "Signing in..." : "Continue with Discord"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You need to be a member of ŁAF Discord server to access this site
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
