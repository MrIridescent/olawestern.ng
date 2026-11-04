'use client';

/**
 * Ui.tsx — the two layout atoms every CMS tab repeats: a labelled field and a
 * status line that announces the server's own validation message.
 */
import type { ReactNode } from 'react';
import { labelCls, type Status } from './cms';

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] leading-snug text-gray-600">{hint}</span> : null}
    </label>
  );
}

export function StatusLine({ st }: { st: Status }) {
  if (st.kind === 'err') return <p className="mt-3 text-sm font-semibold text-red-600">{st.msg}</p>;
  if (st.kind === 'ok') return <p className="mt-3 text-sm font-semibold text-green-700">{st.msg}</p>;
  if (st.kind === 'busy') return <p className="mt-3 text-sm font-semibold text-gray-600">Working…</p>;
  return null;
}
