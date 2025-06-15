import fs from "fs/promises"
import path from "path"
import type { CategorizedAddons } from "@/types/addon"
import { supabase, isSupabaseConfigured } from "./supabase"
import type { Addon } from "@/types/addon"

const ADDONS_FILE = path.join(process.cwd(), "data", "addons.json")

// In-memory storage fallback
let addonsCache: CategorizedAddons | null = null

const EMPTY_STRUCTURE: CategorizedAddons = {
  explanation: [],
  settings: [],
  sound: [],
  bloodfx: [],
  citizen: [],
  mods: [],
  skin: [],
  killfx: [],
  props: [],
  reshades: [],
}

export async function getAddons(): Promise<CategorizedAddons> {
  // Try Supabase first if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: addons, error } = await supabase
        .from("addons")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Group addons by category
      const categorizedAddons: CategorizedAddons = {}
      addons.forEach((addon) => {
        if (!categorizedAddons[addon.category]) {
          categorizedAddons[addon.category] = []
        }
        categorizedAddons[addon.category].push(addon)
      })

      return categorizedAddons
    } catch (error) {
      console.error("Supabase error, falling back to file storage:", error)
    }
  }

  // Fallback to file storage
  try {
    if (addonsCache) {
      return addonsCache
    }

    const data = await fs.readFile(ADDONS_FILE, "utf-8")
    const categorizedAddons = JSON.parse(data) as CategorizedAddons
    addonsCache = categorizedAddons
    return categorizedAddons
  } catch (error) {
    console.error("Error reading addons file:", error)
    // Return empty structure if file doesn't exist
    return {
      Home: [],
      Explanation: [],
      Settings: [],
      Sound: [],
      Bloodfx: [],
      Citizen: [],
      Mods: [],
      Skin: [],
      Killfx: [],
      Props: [],
      Reshades: [],
    }
  }
}

export async function saveAddons(categorizedAddons: CategorizedAddons): Promise<void> {
  // Try Supabase first if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      // Clear existing addons
      await supabase.from("addons").delete().neq("id", "")

      // Insert all addons
      const allAddons = Object.entries(categorizedAddons).flatMap(([category, addons]) =>
        addons.map((addon) => ({ ...addon, category })),
      )

      if (allAddons.length > 0) {
        const { error } = await supabase.from("addons").insert(allAddons)
        if (error) throw error
      }

      return
    } catch (error) {
      console.error("Supabase error, falling back to file storage:", error)
    }
  }

  // Fallback to file storage
  try {
    await fs.writeFile(ADDONS_FILE, JSON.stringify(categorizedAddons, null, 2))
    addonsCache = categorizedAddons
  } catch (error) {
    console.error("Error writing addons file:", error)
    throw error
  }
}

export async function addAddon(addon: Omit<Addon, "createdAt">): Promise<void> {
  const { error } = await supabase.from("addons").insert({
    id: addon.id,
    name: addon.name,
    description: addon.description,
    category: addon.category,
    tags: addon.tags,
    author: addon.author,
    download_url: addon.downloadUrl,
    preview_url: addon.previewUrl,
    video_url: addon.videoUrl,
    downloads: addon.downloads || 0,
  })

  if (error) {
    console.error("Error adding addon:", error)
    throw error
  }
}

export async function updateAddon(id: string, updates: Partial<Addon>): Promise<void> {
  const { error } = await supabase
    .from("addons")
    .update({
      name: updates.name,
      description: updates.description,
      category: updates.category,
      tags: updates.tags,
      download_url: updates.downloadUrl,
      preview_url: updates.previewUrl,
      video_url: updates.videoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating addon:", error)
    throw error
  }
}

export async function deleteAddon(id: string): Promise<void> {
  const { error } = await supabase.from("addons").delete().eq("id", id)

  if (error) {
    console.error("Error deleting addon:", error)
    throw error
  }
}

export function flattenAddons(categorizedAddons: CategorizedAddons): Addon[] {
  const allAddons: Addon[] = []
  Object.values(categorizedAddons).forEach((categoryAddons) => {
    allAddons.push(...categoryAddons)
  })
  return allAddons
}
