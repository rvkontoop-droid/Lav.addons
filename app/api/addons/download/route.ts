import { type NextRequest, NextResponse } from "next/server"
import { getAddons, saveAddons } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const addonId = searchParams.get("id")

    if (!addonId) {
      return NextResponse.json({ error: "Addon ID is required" }, { status: 400 })
    }

    const categorizedAddons = await getAddons()

    let found = false
    for (const category in categorizedAddons) {
      const addon = categorizedAddons[category].find((addon) => addon.id === addonId)
      if (addon) {
        addon.downloads = (addon.downloads || 0) + 1
        found = true
        break
      }
    }

    if (!found) {
      return NextResponse.json({ error: "Addon not found" }, { status: 404 })
    }

    await saveAddons(categorizedAddons)

    return NextResponse.json({ message: "Download tracked successfully" })
  } catch (error) {
    console.error("Download tracking error:", error)
    return NextResponse.json({ error: "Failed to track download" }, { status: 500 })
  }
}
