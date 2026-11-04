/**
 * Build-time mode flags.
 *
 * NEXT_PUBLIC_SITES_DEMO=1 is set only for the frozen static export used as
 * the Qoder Sites pitch preview. In that mode there is no server, so the
 * capture forms show an honest "preview build" notice instead of pretending
 * a submission was recorded. The production SSR build (olawestern.ng) is
 * unaffected and keeps full Supabase + War Room capture.
 */
export const IS_STATIC_DEMO = process.env.NEXT_PUBLIC_SITES_DEMO === '1';
