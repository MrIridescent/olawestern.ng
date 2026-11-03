/**
 * cms.ts — client-side fetch + styling shared by the CMS tabs.
 *
 * Every mutation goes through `api`, which throws with the server's own message,
 * so a validation rejection ("orientation must be portrait, landscape or square")
 * appears in the dashboard exactly as the route wrote it.
 */

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (typeof init?.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(path, { ...init, headers });
  const json = await res.json().catch(() => ({ success: false }));
  if (!res.ok || json.success === false) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}

export async function postForm<T = any>(path: string, body: FormData): Promise<T> {
  const res = await fetch(path, { method: 'POST', body });
  const json = await res.json().catch(() => ({ success: false }));
  if (!res.ok || json.success === false) throw new Error(json.error ?? `Upload failed (${res.status})`);
  return json as T;
}

export const inputCls =
  'min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green';
export const btnCls =
  'min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:opacity-50';
export const btnGhost =
  'min-h-[40px] inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50';
export const btnDanger =
  'min-h-[40px] inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50';
export const cardCls = 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm';
export const labelCls = 'mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500';

export type Status = { kind: 'idle' | 'busy' | 'ok' | 'err'; msg?: string };
