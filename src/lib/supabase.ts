import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let supabase: SupabaseClient;

if (supabaseUrl && supabaseUrl.startsWith("http")) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Provide a dummy client during build time / when env vars are not set
  supabase = createClient("https://placeholder.supabase.co", "placeholder");
}

export { supabase };

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.startsWith("http") && !supabaseUrl.includes("placeholder");
}
