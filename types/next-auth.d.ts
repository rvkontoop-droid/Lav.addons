import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken: string
    user: {
      id: string
      username: string
      discriminator: string
      avatar: string
      email: string
      hasUploadRole: boolean
      isAddonsTeam: boolean
    } & DefaultSession["user"]
  }

  interface JWT {
    accessToken: string
    discordId: string
    username: string
    discriminator: string
    avatar: string
    email: string
  }
}
