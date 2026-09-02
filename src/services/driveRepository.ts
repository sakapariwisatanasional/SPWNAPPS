/**
 * Master Google Drive Cloud Repository Configuration
 * Folder Utama: https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh?usp=sharing
 */

export interface DriveCategoryFolder {
  id: string;
  name: string;
  category: 'KTA_CARD' | 'MEMBER_AVATAR' | 'TOUR_PACKAGES' | 'CULINARY_SOUVENIRS' | 'DOCUMENTS' | 'ICONS_LOGOS';
  folderUrl: string;
  description: string;
}

export const GOOGLE_DRIVE_MAIN_FOLDER = {
  url: 'https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh?usp=sharing',
  folderId: '16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh',
  title: 'Repository Aset & Gambar Saka Pariwisata Nasional',
  categories: [
    {
      id: 'cat-avatar',
      name: 'Foto Anggota & Pasfoto',
      category: 'MEMBER_AVATAR',
      description: 'Penyimpanan pasfoto resmi KTA anggota (Rasio 3:4, latar merah/biru/transparan).',
      folderUrl: 'https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh?usp=sharing',
    },
    {
      id: 'cat-tours',
      name: 'Foto Paket Wisata',
      category: 'TOUR_PACKAGES',
      description: 'Foto banner dan dokumentasi kegiatan paket wisata binaan Saka Pariwisata.',
      folderUrl: 'https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh?usp=sharing',
    },
    {
      id: 'cat-culinary',
      name: 'Foto Kuliner & Cinderamata',
      category: 'CULINARY_SOUVENIRS',
      description: 'Foto produk kuliner tradisional, kriya, dan cinderamata binaan anggota.',
      folderUrl: 'https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh?usp=sharing',
    },
    {
      id: 'cat-kta',
      name: 'Desain KTA & Latar Belakang',
      category: 'KTA_CARD',
      description: 'Latar belakang KTA digital, stempel resmi, tanda tangan, dan ornamen kartu.',
      folderUrl: 'https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh?usp=sharing',
    },
    {
      id: 'cat-logos',
      name: 'Logo, Lambang & Vektor',
      category: 'ICONS_LOGOS',
      description: 'Logo Saka Pariwisata, Tunas Kelapa, WOSM, dan lambang kwarda/kwarcab resmi.',
      folderUrl: 'https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh?usp=sharing',
    }
  ]
};

/**
 * Helper to convert any Google Drive file URL to direct viewable/downloadable image URL
 */
export function formatGoogleDriveUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Format 1: https://drive.google.com/file/d/ID/view...
  // Format 2: https://drive.google.com/open?id=ID
  // Format 3: https://drive.google.com/uc?id=ID
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  
  return trimmed;
}

/**
 * Extracts Google Drive ID if present
 */
export function extractGoogleDriveId(url?: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                url.trim().match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                url.trim().match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
