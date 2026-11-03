import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client.
 * Returns null when env vars are not configured — the app then falls back to
 * bundled seed content (see src/lib/content.ts) and logs form submissions.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Admin client (service role) — only used in trusted server routes
 * such as the War Room webhook. Never expose to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Client used for every write the data layer performs.
 *
 * The anon key may read exactly the rows RLS exposes, but the campaign tables are
 * write-protected: an anonymous insert, update or delete is rejected before a
 * policy can help it. So mutations take the service-role client when
 * SUPABASE_SERVICE_ROLE_KEY is configured, and fall back to the anon client —
 * which still holds the public INSERT policies for the volunteer, help-desk and
 * Ask-Ola forms — when it is not.
 *
 * Reads deliberately stay on `getSupabase()`: the anon key is the least privilege
 * that can serve a page, and RLS is the guard that unpublished rows never leak.
 */
export function getWriteClient(): SupabaseClient | null {
  return getSupabaseAdmin() ?? getSupabase();
}
