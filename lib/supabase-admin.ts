// lib/supabase-admin.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

// (اختياري) أدق وأأمن في بيئة السيرفر
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,      // ما نحتاج جلسات على السيرفر
      autoRefreshToken: false,    // ولا تجديد تلقائي
      detectSessionInUrl: false,  // اختصارًا لأي لوجك متصفح
    },
  }
)
