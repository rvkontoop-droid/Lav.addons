import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Addon } from "@/types/addon"

const DATA_FILE = path.join(process.cwd(), "data", "addons.json")

async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

async function readAddons(): Promise<Addon[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(DATA_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function writeAddons(addons: Addon[]) {
  await ensureDataDir()
  await fs.writeFile(DATA_FILE, JSON.stringify(addons, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and has upload role
    if (!session || !session.user.hasUploadRole) {
      return NextResponse.json({ error: "Unauthorized - Upload role required" }, { status: 403 })
    }

    const addon: Omit<Addon, "id" | "createdAt" | "downloads"> = await request.json()
    const addons = await readAddons()

    const newAddon: Addon = {
      ...addon,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      downloads: 0,
    }

    addons.push(newAddon)
    await writeAddons(addons)

    return NextResponse.json(newAddon, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload addon" }, { status: 500 })
  }
}
