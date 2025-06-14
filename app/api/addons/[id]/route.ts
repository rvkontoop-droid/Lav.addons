import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAddons, saveAddons } from "@/lib/storage"
import { createAuditLog, compareObjects } from "@/lib/audit"
import type { Addon } from "@/types/addon"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!session.user.isAddonsTeam) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const addonId = params.id
    const updateData = await request.json()

    const categorizedAddons = await getAddons()

    let found = false
    let updatedAddon: Addon | null = null
    let oldAddon: Addon | null = null

    for (const category in categorizedAddons) {
      const addonIndex = categorizedAddons[category].findIndex((addon) => addon.id === addonId)
      if (addonIndex !== -1) {
        oldAddon = { ...categorizedAddons[category][addonIndex] }

        updatedAddon = {
          ...categorizedAddons[category][addonIndex],
          ...updateData,
          updatedAt: new Date().toISOString().split("T")[0],
        }
        categorizedAddons[category][addonIndex] = updatedAddon
        found = true
        break
      }
    }

    if (!found || !updatedAddon || !oldAddon) {
      return NextResponse.json({ error: "Addon not found" }, { status: 404 })
    }

    await saveAddons(categorizedAddons)

    // Create audit log with changes
    const changes = compareObjects(oldAddon, updatedAddon)
    await createAuditLog({
      action: "UPDATE",
      entityType: "ADDON",
      entityId: updatedAddon.id,
      entityName: updatedAddon.name,
      userId: session.user.id,
      username: session.user.username,
      userAvatar: session.user.avatar,
      changes,
    })

    return NextResponse.json(updatedAddon)
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update addon" }, { status: 500 })
  }
}
