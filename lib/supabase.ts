// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = url && anon ? createClient(url, anon) : null

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anon)
}
