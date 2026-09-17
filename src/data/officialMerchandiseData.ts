import { OfficialMerchandiseProduct } from '../types';

/**
 * Sampel katalog Official Merchandise Saka Pariwisata.
 * Produk masih coming soon; launchAt dapat diubah saat tanggal peluncuran resmi ditetapkan.
 */
export const OFFICIAL_MERCHANDISE_PRODUCTS: OfficialMerchandiseProduct[] = [
  {
    id: 'spw-merch-polo-nasional',
    name: 'Polo Official Saka Pariwisata Nasional',
    shortName: 'Polo Official',
    category: 'APPAREL',
    description: 'Polo berkarakter smart-outdoor dengan identitas Saka Pariwisata Nasional untuk kegiatan resmi maupun lapangan.',
    price: 189000,
    accentClass: 'from-emerald-950 via-emerald-700 to-teal-400',
    iconName: 'shirt',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    tags: ['Official', 'Nasional', 'Apparel'],
    comingSoon: true,
    launchAt: '2026-10-10T09:00:00+07:00',
    featured: true,
    active: true
  },
  {
    id: 'spw-merch-jaket-jelajah',
    name: 'Jaket Jelajah Nusantara',
    shortName: 'Jaket Jelajah',
    category: 'OUTDOOR',
    description: 'Jaket ringan untuk eksplorasi destinasi, kegiatan Krida, perjalanan, dan agenda Saka Pariwisata.',
    price: 329000,
    accentClass: 'from-violet-950 via-purple-800 to-fuchsia-500',
    iconName: 'jacket',
    sizes: ['M', 'L', 'XL', '2XL'],
    tags: ['Outdoor', 'Jelajah', 'Limited'],
    comingSoon: true,
    launchAt: '2026-10-17T09:00:00+07:00',
    featured: true,
    active: true
  },
  {
    id: 'spw-merch-topi-petualang',
    name: 'Topi Petualang Saka Pariwisata',
    shortName: 'Topi Petualang',
    category: 'ACCESSORIES',
    description: 'Topi lapangan bergaya kasual dengan aksen identitas Saka Pariwisata untuk aktivitas luar ruang.',
    price: 99000,
    accentClass: 'from-amber-950 via-orange-700 to-yellow-400',
    iconName: 'cap',
    tags: ['Outdoor', 'Aksesori'],
    comingSoon: true,
    launchAt: '2026-10-24T09:00:00+07:00',
    featured: true,
    active: true
  },
  {
    id: 'spw-merch-tumbler-nusantara',
    name: 'Tumbler Jelajah Nusantara',
    shortName: 'Tumbler Nusantara',
    category: 'ACCESSORIES',
    description: 'Tumbler reusable untuk mendukung gaya hidup perjalanan yang lebih bertanggung jawab terhadap lingkungan.',
    price: 139000,
    accentClass: 'from-sky-950 via-cyan-700 to-emerald-400',
    iconName: 'bottle',
    tags: ['Eco', 'Travel', 'Aksesori'],
    comingSoon: true,
    launchAt: '2026-10-31T09:00:00+07:00',
    active: true
  },
  {
    id: 'spw-merch-lanyard-kta',
    name: 'Lanyard KTA Official',
    shortName: 'Lanyard KTA',
    category: 'IDENTITY',
    description: 'Lanyard identitas resmi untuk KTA, kegiatan, pelatihan, dan pertemuan Saka Pariwisata.',
    price: 59000,
    accentClass: 'from-pink-950 via-rose-700 to-orange-400',
    iconName: 'lanyard',
    tags: ['KTA', 'Identity', 'Official'],
    comingSoon: true,
    launchAt: '2026-11-07T09:00:00+07:00',
    active: true
  },
  {
    id: 'spw-merch-kit-pemandu',
    name: 'Explorer Kit Krida Pemandu',
    shortName: 'Explorer Kit',
    category: 'OUTDOOR',
    description: 'Paket identitas perjalanan untuk anggota Krida Pemandu yang berisi aksesori pilihan untuk kegiatan lapangan.',
    price: 279000,
    accentClass: 'from-slate-950 via-slate-700 to-emerald-500',
    iconName: 'compass',
    tags: ['Krida Pemandu', 'Explorer', 'Bundle'],
    comingSoon: true,
    launchAt: '2026-11-14T09:00:00+07:00',
    active: true
  }
];
