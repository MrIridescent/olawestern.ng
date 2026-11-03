import type { Metadata } from 'next';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { MEDIA_POSITIONS } from '@/lib/content';
import { storageState } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Campaign CMS',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Every image position the public site renders, so the desk can bind a photo to it. */
const POSITIONS = MEDIA_POSITIONS.map((p) => ({ slot: p.slot, label: p.label, ratio: p.ratio }));

/** /admin — the campaign's content management console (Truth Room, Newsroom, Record, Sources, Media, Video, Site copy, Help Desk, Leads). */
export default function AdminPage() {
  // Read at render time so the badge always tells the truth about this deploy:
  // file store, Supabase ready to write, or Supabase that cannot write yet.
  return <AdminDashboard positions={POSITIONS} storage={storageState()} />;
}
