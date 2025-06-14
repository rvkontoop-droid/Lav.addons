import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check environment variables
    const envCheck = {
      DISCORD_BOT_TOKEN: !!process.env.DISCORD_BOT_TOKEN,
      DISCORD_GUILD_ID: !!process.env.DISCORD_GUILD_ID,
      DISCORD_UPLOAD_ROLE_ID: !!process.env.DISCORD_UPLOAD_ROLE_ID,
      DISCORD_GUILD_ID_VALUE: process.env.DISCORD_GUILD_ID || "NOT_SET",
      DISCORD_UPLOAD_ROLE_ID_VALUE: process.env.DISCORD_UPLOAD_ROLE_ID || "NOT_SET",
    }

    // Try to fetch user's roles
    let userRoles: string[] = []
    let roleCheckError: string | null = null

    try {
      const GUILD_ID = process.env.DISCORD_GUILD_ID!
      const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!

      if (!BOT_TOKEN || !GUILD_ID) {
        throw new Error("Missing bot token or guild ID")
      }

      console.log(`Checking roles for user ${session.user.id} in guild ${GUILD_ID}`)

      const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${session.user.id}`, {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          "User-Agent": "FiveMAddonsBot/1.0",
        },
      })

      console.log(`Discord API response status: ${response.status}`)

      if (response.ok) {
        const member = await response.json()
        userRoles = member.roles || []
        console.log(`User roles:`, userRoles)
      } else {
        const errorText = await response.text()
        roleCheckError = `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        console.error("Discord API error:", roleCheckError)
      }
    } catch (error) {
      roleCheckError = error instanceof Error ? error.message : "Unknown error"
      console.error("Role check error:", error)
    }

    const requiredRoleId = "1383315641632555018"
    const hasRequiredRole = userRoles.includes(requiredRoleId)

    return NextResponse.json({
      user: {
        id: session.user.id,
        username: session.user.username,
        discriminator: session.user.discriminator,
        hasUploadRole: session.user.hasUploadRole,
        isAddonsTeam: session.user.isAddonsTeam,
      },
      environment: envCheck,
      userRoles,
      roleCheckError,
      requiredRoleId,
      hasRequiredRole,
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      { error: "Debug failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
