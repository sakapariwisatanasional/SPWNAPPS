import { Province, Member, TourPackage, CulinarySouvenirItem } from '../types';

export interface DetectedLocation {
  ip?: string;
  city: string;
  regionName: string; // e.g. "Jawa Barat"
  provinceId: string; // e.g. "32"
  country: string;
  isAutoDetected: boolean;
  source: 'IP_GEO' | 'BROWSER_GEO' | 'USER_SELECTED' | 'FALLBACK';
}

// Proximity map for Indonesian Provinces (Neighboring provinces)
export const PROVINCE_NEIGHBORS: Record<string, string[]> = {
  // Jawa Barat (32) -> DKI Jakarta (31), Banten (36), Jawa Tengah (33)
  '32': ['31', '36', '33'],
  'Jawa Barat': ['DKI Jakarta', 'Banten', 'Jawa Tengah'],

  // DKI Jakarta (31) -> Jawa Barat (32), Banten (36)
  '31': ['32', '36'],
  'DKI Jakarta': ['Jawa Barat', 'Banten'],

  // Banten (36) -> Jawa Barat (32), DKI Jakarta (31), Lampung (18)
  '36': ['32', '31', '18'],
  'Banten': ['Jawa Barat', 'DKI Jakarta', 'Lampung'],

  // Jawa Tengah (33) -> Jawa Barat (32), DI Yogyakarta (34), Jawa Timur (35)
  '33': ['32', '34', '35'],
  'Jawa Tengah': ['Jawa Barat', 'DI Yogyakarta', 'Jawa Timur'],

  // DI Yogyakarta (34) -> Jawa Tengah (33), Jawa Timur (35)
  '34': ['33', '35'],
  'DI Yogyakarta': ['Jawa Tengah', 'Jawa Timur'],

  // Jawa Timur (35) -> Jawa Tengah (33), DI Yogyakarta (34), Bali (51)
  '35': ['33', '34', '51'],
  'Jawa Timur': ['Jawa Tengah', 'DI Yogyakarta', 'Bali'],

  // Bali (51) -> Jawa Timur (35), NTB (52), NTT (53)
  '51': ['35', '52', '53'],
  'Bali': ['Jawa Timur', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur'],

  // Nusa Tenggara Barat (52) -> Bali (51), NTT (53)
  '52': ['51', '53'],
  'Nusa Tenggara Barat': ['Bali', 'Nusa Tenggara Timur'],

  // Nusa Tenggara Timur (53) -> NTB (52), Bali (51)
  '53': ['52', '51'],
  'Nusa Tenggara Timur': ['Nusa Tenggara Barat', 'Bali'],

  // Sumatera Utara (12) -> Aceh (11), Sumatera Barat (13), Riau (14)
  '12': ['11', '13', '14'],
  'Sumatera Utara': ['Aceh', 'Sumatera Barat', 'Riau'],

  // Sumatera Barat (13) -> Sumatera Utara (12), Riau (14), Jambi (15), Bengkulu (17)
  '13': ['12', '14', '15', '17'],
  'Sumatera Barat': ['Sumatera Utara', 'Riau', 'Jambi', 'Bengkulu'],

  // Kalimantan Timur (64) -> Kalimantan Selatan (63), Kalimantan Utara (65), Kalimantan Tengah (62)
  '64': ['63', '65', '62'],
  'Kalimantan Timur': ['Kalimantan Selatan', 'Kalimantan Utara', 'Kalimantan Tengah'],

  // Sulawesi Selatan (73) -> Sulawesi Barat (76), Sulawesi Tengah (72), Sulawesi Tenggara (74)
  '73': ['76', '72', '74'],
  'Sulawesi Selatan': ['Sulawesi Barat', 'Sulawesi Tengah', 'Sulawesi Tenggara'],

  // Papua Barat / Daya (92, 96) -> Papua (91), Maluku (81)
  '92': ['91', '96', '81'],
  'Papua Barat': ['Papua', 'Papua Barat Daya', 'Maluku']
};

export const POPULAR_DESTINATIONS = [
  { label: 'Bandung, Jawa Barat', city: 'Bandung', provinceName: 'Jawa Barat', provinceId: '32', highlight: 'Ekowisata Kawah Putih & Budaya Priangan' },
  { label: 'Yogyakarta', city: 'Kota Yogyakarta', provinceName: 'DI Yogyakarta', provinceId: '34', highlight: 'Warisan Kraton & Geowisata' },
  { label: 'Bali (Ubud & Kintamani)', city: 'Gianyar / Bangli', provinceName: 'Bali', provinceId: '51', highlight: 'Desa Adat & Ekowisata Bahari' },
  { label: 'DKI Jakarta (Kep. Seribu)', city: 'Jakarta', provinceName: 'DKI Jakarta', provinceId: '31', highlight: 'Wisata Sejarah & Bahari Urban' },
  { label: 'Labuan Bajo, NTT', city: 'Manggarai Barat', provinceName: 'Nusa Tenggara Timur', provinceId: '53', highlight: 'Taman Nasional Komodo' },
  { label: 'Sukabumi & Bogor, Jabar', city: 'Sukabumi / Bogor', provinceName: 'Jawa Barat', provinceId: '32', highlight: 'Geopark Ciletuh & Agrowisata' },
  { label: 'Malang & Bromo, Jatim', city: 'Malang', provinceName: 'Jawa Timur', provinceId: '35', highlight: 'Trekking Gunung & Petik Apel' },
  { label: 'Danau Toba, Sumut', city: 'Samosir', provinceName: 'Sumatera Utara', provinceId: '12', highlight: 'Geopark Kaldera Toba' }
];

const DEFAULT_LOCATION: DetectedLocation = {
  ip: '180.252.164.21',
  city: 'Bandung',
  regionName: 'Jawa Barat',
  provinceId: '32',
  country: 'Indonesia',
  isAutoDetected: true,
  source: 'FALLBACK'
};

class IpLocationService {
  private currentLocation: DetectedLocation = DEFAULT_LOCATION;
  private listeners: ((loc: DetectedLocation) => void)[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    // Try to load saved location
    try {
      const saved = localStorage.getItem('saka_user_ip_location');
      if (saved) {
        this.currentLocation = JSON.parse(saved);
      } else {
        // Attempt fast background detection
        this.detectPublicLocation();
      }
    } catch {
      this.currentLocation = DEFAULT_LOCATION;
    }
  }

  public getLocation(): DetectedLocation {
    return this.currentLocation;
  }

  public setLocation(location: DetectedLocation) {
    this.currentLocation = location;
    try {
      localStorage.setItem('saka_user_ip_location', JSON.stringify(location));
    } catch {}
    this.notify();
  }

  public subscribe(cb: (loc: DetectedLocation) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentLocation));
  }

  public async detectPublicLocation(): Promise<DetectedLocation> {
    try {
      // 1. First attempt via ipapi.co (JSON)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        let regionName = data.region || 'Jawa Barat';
        let provinceId = '32';

        // Normalize Indonesian province names
        if (regionName.toLowerCase().includes('west java') || regionName.toLowerCase().includes('jawa barat')) {
          regionName = 'Jawa Barat';
          provinceId = '32';
        } else if (regionName.toLowerCase().includes('jakarta')) {
          regionName = 'DKI Jakarta';
          provinceId = '31';
        } else if (regionName.toLowerCase().includes('central java') || regionName.toLowerCase().includes('jawa tengah')) {
          regionName = 'Jawa Tengah';
          provinceId = '33';
        } else if (regionName.toLowerCase().includes('east java') || regionName.toLowerCase().includes('jawa timur')) {
          regionName = 'Jawa Timur';
          provinceId = '35';
        } else if (regionName.toLowerCase().includes('yogyakarta')) {
          regionName = 'DI Yogyakarta';
          provinceId = '34';
        } else if (regionName.toLowerCase().includes('bali')) {
          regionName = 'Bali';
          provinceId = '51';
        } else if (regionName.toLowerCase().includes('banten')) {
          regionName = 'Banten';
          provinceId = '36';
        } else if (regionName.toLowerCase().includes('north sumatra') || regionName.toLowerCase().includes('sumatera utara')) {
          regionName = 'Sumatera Utara';
          provinceId = '12';
        }

        const detected: DetectedLocation = {
          ip: data.ip || '180.252.164.21',
          city: data.city || 'Bandung',
          regionName,
          provinceId,
          country: data.country_name || 'Indonesia',
          isAutoDetected: true,
          source: 'IP_GEO'
        };

        this.setLocation(detected);
        return detected;
      }
    } catch {
      // Ignore network errors and fallback gracefully
    }

    // Default fallback to Bandung, Jawa Barat (Hub Saka Pariwisata Nasional)
    this.setLocation(DEFAULT_LOCATION);
    return DEFAULT_LOCATION;
  }

  // --- Proximity & Matching Helpers ---
  public getNeighborProvinces(provinceName: string): string[] {
    return PROVINCE_NEIGHBORS[provinceName] || [];
  }

  /**
   * Evaluates how closely a member or product matches a target location/destination.
   * Returns a score: 100 (Exact Match), 75 (Same Province), 50 (Neighboring Province), 25 (National/Other).
   */
  public calculateLocationMatchScore(
    itemLocation: { provinceName: string; regencyName?: string; districtName?: string },
    targetLocation: { provinceName: string; regencyName?: string; city?: string }
  ): { score: number; label: string; isDirectMatch: boolean; isNeighborMatch: boolean } {
    const itemProv = (itemLocation.provinceName || '').toLowerCase().trim();
    const targetProv = (targetLocation.provinceName || '').toLowerCase().trim();
    const itemReg = (itemLocation.regencyName || '').toLowerCase().trim();
    const targetCity = (targetLocation.regencyName || targetLocation.city || '').toLowerCase().trim();

    // 1. Direct Regency/City exact match
    if (targetCity && (itemReg.includes(targetCity) || targetCity.includes(itemReg)) && itemProv === targetProv) {
      return { score: 100, label: 'Lokasi Tepat (Kota/Kabupaten Sama)', isDirectMatch: true, isNeighborMatch: false };
    }

    // 2. Same Province match
    if (itemProv && targetProv && (itemProv.includes(targetProv) || targetProv.includes(itemProv))) {
      return { score: 85, label: `Satu Provinsi (${itemLocation.provinceName})`, isDirectMatch: true, isNeighborMatch: false };
    }

    // 3. Neighboring Province match
    const neighbors = this.getNeighborProvinces(targetLocation.provinceName);
    const isNeighbor = neighbors.some(n => n.toLowerCase().trim() === itemProv);
    if (isNeighbor) {
      return { score: 60, label: `Wilayah Terdekat (${itemLocation.provinceName})`, isDirectMatch: false, isNeighborMatch: true };
    }

    // 4. General National coverage
    return { score: 30, label: `Lintas Wilayah (${itemLocation.provinceName})`, isDirectMatch: false, isNeighborMatch: false };
  }

  /**
   * Sorts and filters members based on proximity to target location and competencies.
   */
  public getRecommendedMembers(
    allMembers: Member[],
    targetLocation: { provinceName: string; regencyName?: string; city?: string },
    selectedTour?: TourPackage | null
  ): Array<Member & { matchScore: number; matchBadge: string; isDirectMatch: boolean }> {
    const activeMembers = allMembers.filter(m => m.status === 'ACTIVE');
    const pool = activeMembers.length > 0 ? activeMembers : allMembers;

    const scored = pool.map(m => {
      const { score, label, isDirectMatch } = this.calculateLocationMatchScore(
        { provinceName: m.provinceName, regencyName: m.regencyName, districtName: m.districtName },
        targetLocation
      );

      // Boost score if member has tour guiding or eco-skills matching the tour
      let competencyBonus = 0;
      if (m.skills?.some(s => s.category.includes('Pemanduan') || s.category.includes('Ekowisata'))) {
        competencyBonus += 10;
      }
      if (m.certifications?.length > 0) {
        competencyBonus += 5;
      }
      if (selectedTour && selectedTour.category) {
        if (selectedTour.category === 'Ekowisata' && m.skills?.some(s => s.skillName.toLowerCase().includes('ekowisata') || s.skillName.toLowerCase().includes('konservasi'))) {
          competencyBonus += 15;
        }
        if (selectedTour.category === 'Wisata Budaya' && m.skills?.some(s => s.skillName.toLowerCase().includes('storytelling') || s.skillName.toLowerCase().includes('sejarah'))) {
          competencyBonus += 15;
        }
        if (selectedTour.category === 'Wisata Kuliner' && m.krida === 'Krida Kuliner & Cinderamata') {
          competencyBonus += 15;
        }
      }

      const totalScore = Math.min(100, score + competencyBonus);

      return {
        ...m,
        matchScore: totalScore,
        matchBadge: label,
        isDirectMatch
      };
    });

    // Sort descending by score
    return scored.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export const ipLocationService = new IpLocationService();
