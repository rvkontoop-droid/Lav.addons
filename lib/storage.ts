// Simple storage solution for Vercel deployment
import type { Addon } from "@/types/addon"

type CategorizedAddons = {
  [category: string]: Addon[]
}

// In-memory storage (will reset on each deployment, but works for demo)
// In production, you'd want to use a real database like Supabase, PlanetScale, etc.
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
  // For demo purposes, return empty structure
  // In production, this would fetch from your database
  if (!addonsCache) {
    addonsCache = { ...EMPTY_STRUCTURE }
  }
  return addonsCache
}

export async function saveAddons(addons: CategorizedAddons): Promise<void> {
  // For demo purposes, just update the cache
  // In production, this would save to your database
  addonsCache = { ...addons }
}

export function flattenAddons(categorizedAddons: CategorizedAddons): Addon[] {
  const allAddons: Addon[] = []
  Object.values(categorizedAddons).forEach((categoryAddons) => {
    allAddons.push(...categoryAddons)
  })
  return allAddons
}
