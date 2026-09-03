import { KridaCategoryInfo, KridaModuleItem } from '../types';
import { OFFICIAL_2026_KRIDA_MODULES } from './kridaModules2026';

export * from './kridaHandbookData';
export { OFFICIAL_2026_KRIDA_MODULES } from './kridaModules2026';

export const KRIDA_CATEGORIES: KridaCategoryInfo[] = [
  {
    id: 'pemandu',
    name: 'Krida Pemandu Wisata',
    shortTitle: 'Krida Pemandu',
    subtitle: 'Bina Pemandu Wisata & Storyteller',
    badge: 'Tour Guide & Storyteller (PM-01 s/d PM-08)',
    color: 'from-amber-500 via-orange-500 to-amber-600',
    borderGlow: 'border-amber-500/50 hover:border-amber-400 group-hover:shadow-amber-500/20',
    description: 'Keahlian kepemanduan wisata alam, sejarah, budaya, interpretasi objek wisata, manajemen tur rombongan, wisata minat khusus (selam, gunung, outbond), dan keselamatan tirta.',
    topicsCount: 8
  },
  {
    id: 'penyuluh',
    name: 'Krida Penyuluh Wisata',
    shortTitle: 'Krida Penyuluh',
    subtitle: 'Bina Sadar Wisata & Sapta Pesona',
    badge: 'Sapta Pesona & Edukasi (PY-01 s/d PY-06)',
    color: 'from-emerald-500 via-teal-500 to-emerald-600',
    borderGlow: 'border-emerald-500/50 hover:border-emerald-400 group-hover:shadow-emerald-500/20',
    description: 'Penyuluhan sadar wisata dan 7 unsur Sapta Pesona, ekowisata konservasi, wisata tirta berkelanjutan, wisata minat khusus, wisata religi, dan mitigasi krisis destinasi.',
    topicsCount: 6
  },
  {
    id: 'mice',
    name: 'Krida MICE & Event Wisata',
    shortTitle: 'Krida MICE & Event',
    subtitle: 'Bina Atraksi & Penyelenggaraan Event',
    badge: 'Event Organizer & Atraksi (ME-01 s/d ME-04)',
    color: 'from-purple-500 via-indigo-500 to-purple-600',
    borderGlow: 'border-purple-500/50 hover:border-purple-400 group-hover:shadow-purple-500/20',
    description: 'Pengelolaan atraksi budaya, promosi MICE, fotografi-videografi dan dokumentasi udara drone, perencanaan event, serta manajemen operasional panggung.',
    topicsCount: 4
  },
  {
    id: 'kuliner',
    name: 'Krida Kuliner & Cinderamata',
    shortTitle: 'Krida Kuliner & Kriya',
    subtitle: 'Karya Khas Daerah & Gastronomi',
    badge: 'Gastronomi & Kriya UMKM (KC-01 s/d KC-05)',
    color: 'from-rose-500 via-pink-500 to-rose-600',
    borderGlow: 'border-rose-500/50 hover:border-rose-400 group-hover:shadow-rose-500/20',
    description: 'Pengembangan masakan autentik daerah, panganan ringan tradisional nusantara, kriya kerajinan tangan lokal, pemanfaatan bahan terbarukan, dan pemasaran UMKM pariwisata.',
    topicsCount: 5
  }
];

export const INITIAL_KRIDA_MODULES: KridaModuleItem[] = OFFICIAL_2026_KRIDA_MODULES;
