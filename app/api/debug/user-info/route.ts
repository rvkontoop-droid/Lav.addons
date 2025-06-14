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
      DISCORD_GUILD_ID_VALUE: process.env.DISCORD_GUILD_ID,
      DISCORD_UPLOAD_ROLE_ID_VALUE: process.env.DISCORD_UPLOAD_ROLE_ID,
    }

    // Try to fetch user's roles
    let userRoles = []
    let roleCheckError = null

    try {
      const GUILD_ID = process.env.DISCORD_GUILD_ID!
      const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${session.user.id}`, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      })

      if (response.ok) {
        const member = await response.json()
        userRoles = member.roles
      } else {
        roleCheckError = `HTTP ${response.status}: ${response.statusText}`
      }
    } catch (error) {
      roleCheckError = error instanceof Error ? error.message : "Unknown error"
    }

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
      requiredRoleId: process.env.DISCORD_UPLOAD_ROLE_ID,
      hasRequiredRole: userRoles.includes(process.env.DISCORD_UPLOAD_ROLE_ID),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Debug failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
