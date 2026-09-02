import { Skill, Member, TourPackage, Activity, AuditLog, CurrentUser, CulinarySouvenirItem } from '../types';

export const MASTER_SKILLS: Skill[] = [
  {
    id: 'skill-tour-guide',
    name: 'Pemandu Wisata & Tour Guide',
    category: 'Pemanduan & Tour Guide',
    description: 'Keahlian memandu wisatawan domestik dan mancanegara dengan standar BNSP/HPI.'
  },
  {
    id: 'skill-storytelling',
    name: 'Cultural Storytelling & Sejarah',
    category: 'Budaya & Storytelling',
    description: 'Penyampaian narasi sejarah, cagar budaya, mitologi lokal, dan kearifan lokal.'
  },
  {
    id: 'skill-fotografi',
    name: 'Fotografi Destinasi & Landscape',
    category: 'Fotografi & Media',
    description: 'Pengambilan gambar estetika tinggi untuk promosi daya tarik wisata dan media sosial.'
  },
  {
    id: 'skill-videografi',
    name: 'Videografi & Drone Operator',
    category: 'Fotografi & Media',
    description: 'Pembuatan video sinematik pariwisata, reels, vlog perjalanan, dan pemetaan udara.'
  },
  {
    id: 'skill-ekowisata',
    name: 'Konservasi & Ekowisata Alam',
    category: 'Ekowisata & Alam',
    description: 'Manajemen jejak ekologis, trekking hutan lindung, edukasi flora-fauna, dan birdwatching.'
  },
  {
    id: 'skill-digital-marketing',
    name: 'Digital Marketing & Content Creator',
    category: 'Digital Marketing & UMKM',
    description: 'Promosi wisata berbasis TikTok/Instagram, SEO travel, dan kampanye digital destinasi.'
  },
  {
    id: 'skill-hospitality',
    name: 'Homestay & Hospitality Service',
    category: 'Hospitality & Kuliner',
    description: 'Standar kebersihan CHSE, pelayanan tamu desa wisata, dan manajemen akomodasi lokal.'
  },
  {
    id: 'skill-kuliner',
    name: 'Eksplorasi Kuliner Tradisional',
    category: 'Hospitality & Kuliner',
    description: 'Pengembangan produk oleh-oleh khas daerah dan gastro-tourism nusantara.'
  },
  {
    id: 'skill-mice',
    name: 'MICE & Event Organizer Wisata',
    category: 'MICE & Event',
    description: 'Penyelenggaraan festival budaya, perkemahan akbar kepariwisataan, dan expo travel.'
  },
  {
    id: 'skill-bahasa-inggris',
    name: 'Pemandu Bahasa Asing (English/Mandarin)',
    category: 'Pemanduan & Tour Guide',
    description: 'Komunikasi fasih untuk memandu turis mancanegara di objek wisata prioritas.'
  }
];

// Database Awal Murni (Kosong secara default, data dimuat secara langsung dari Google Spreadsheet)
export const INITIAL_MEMBERS: Member[] = [];

// Database Paket Wisata (Kosong secara default, bersumber dari Google Spreadsheet)
export const INITIAL_TOUR_PACKAGES: TourPackage[] = [];

// Database Agenda & Kegiatan Saka Pariwisata (Kosong secara default, bersumber dari Google Spreadsheet)
export const INITIAL_ACTIVITIES: Activity[] = [];

// Database Riwayat Audit Log (Kosong)
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Akun Pengguna Resmi
export const DEMO_USERS: CurrentUser[] = [
  {
    id: 'user-superadmin-rohadi',
    username: 'rohadiwijaya',
    password: 'rohadiwijaya',
    email: 'scoutpreneur@gmail.com',
    name: 'Rohadi Wijaya',
    role: 'SUPER_ADMIN',
    jurisdictionName: 'Kwartir Nasional (Pusat)',
    memberId: 'member-1788087636201',
    avatarUrl: 'https://lh3.googleusercontent.com/d/1Ml-oopzoEgnZ75ZoNuA79KytVhYf3qOV'
  },
  {
    id: 'user-public-guest',
    username: 'wisatawan',
    email: 'wisatawan@nusantara.id',
    name: 'Wisatawan / Pengunjung Publik',
    role: 'PUBLIC',
    jurisdictionName: 'Pengunjung Umum',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  }
];

// Database Kuliner & Cinderamata Daerah (Kosong secara default, bersumber dari Google Spreadsheet)
export const INITIAL_CULINARY_SOUVENIRS: CulinarySouvenirItem[] = [];
