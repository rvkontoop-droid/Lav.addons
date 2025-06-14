import { NextResponse } from "next/server"

export async function GET() {
  const envCheck = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
  }

  return NextResponse.json({
    message: "Environment variables check",
    variables: envCheck,
    allSet: Object.values(envCheck).every(Boolean),
  })
}
