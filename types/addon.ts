export interface Addon {
  id: string
  name: string
  description: string
  category: string
  downloadUrl: string
  imageUrl: string
  videoUrl?: string
  author: {
    discordTag: string
    discordId: string
    discordUsername: string
    discordAvatar: string
  }
  createdAt: string
  updatedAt?: string
  downloads: number
  featured?: boolean
  tags?: string[]
}

export interface User {
  id: string
  username: string
  discriminator: string
  avatar: string
  email: string
  isAddonsTeam: boolean
}

export type UserPermissions = {
  canView: boolean
  canDownload: boolean
  canUpload: boolean
}
