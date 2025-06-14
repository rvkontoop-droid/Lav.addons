import type { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.discordId = profile.id
        token.username = (profile as any).username
        token.discriminator = (profile as any).discriminator
        token.avatar = (profile as any).avatar
        token.email = (profile as any).email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string
        session.user.id = token.discordId as string
        session.user.username = token.username as string
        session.user.discriminator = token.discriminator as string
        session.user.avatar = token.avatar as string
        session.user.email = token.email as string

        // Check if user has Addons Team role
        session.user.hasUploadRole = await checkUserRole(token.discordId as string)
        session.user.isAddonsTeam = session.user.hasUploadRole // Alias for clarity
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
}

async function checkUserRole(userId: string): Promise<boolean> {
  try {
    const GUILD_ID = process.env.DISCORD_GUILD_ID!
    const ADDONS_TEAM_ROLE_ID = "1383315641632555018" // Your specific role ID

    if (!process.env.DISCORD_BOT_TOKEN || !GUILD_ID) {
      console.warn("Missing Discord configuration for role checking")
      return false
    }

    // Get user's roles in the guild
    const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch user roles:", response.status, response.statusText)
      return false
    }

    const member = await response.json()
    return member.roles.includes(ADDONS_TEAM_ROLE_ID)
  } catch (error) {
    console.error("Error checking user role:", error)
    return false
  }
}
