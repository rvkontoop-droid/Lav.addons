import { supabase } from "./supabase"
import type { Addon } from "@/types/addon"

type CategorizedAddons = {
  [category: string]: Addon[]
}

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
  try {
    const { data: addons, error } = await supabase.from("addons").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching addons:", error)
      return { ...EMPTY_STRUCTURE }
    }

    // Group addons by category
    const categorized: CategorizedAddons = { ...EMPTY_STRUCTURE }

    addons?.forEach((addon) => {
      if (categorized[addon.category]) {
        categorized[addon.category].push({
          id: addon.id,
          name: addon.name,
          description: addon.description,
          category: addon.category,
          tags: addon.tags || [],
          author: addon.author,
          downloadUrl: addon.download_url,
          previewUrl: addon.preview_url,
          videoUrl: addon.video_url,
          downloads: addon.downloads,
          createdAt: addon.created_at,
        })
      }
    })

    return categorized
  } catch (error) {
    console.error("Error in getAddons:", error)
    return { ...EMPTY_STRUCTURE }
  }
}

export async function saveAddons(addons: CategorizedAddons): Promise<void> {
  // This function is kept for compatibility but individual addon operations
  // should use addAddon, updateAddon, deleteAddon instead
  console.warn("saveAddons is deprecated, use individual addon operations")
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
