'use client';

import { useState } from 'react';

/** A copy-to-clipboard value for press desks: one tap, no retyping. */
export default function CopyValue({
  value,
  label,
  className = '',
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`group inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-white transition-colors hover:border-brand-electric/60 hover:bg-white/10 ${className}`}
      title={`Copy ${label}`}
    >
      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">{label}</span>
      <span className="font-mono text-[12px] text-white">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-electric-bright">
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}
