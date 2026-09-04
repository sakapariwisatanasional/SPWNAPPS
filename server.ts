import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Security & Compliance Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-ancestors *;"
  );
  next();
});

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS handler for cross-device access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// PASSWORD HASHING & SESSION MANAGEMENT
// ==========================================
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, key] = storedHash.split(':');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  } catch {
    return false;
  }
}

interface ActiveSession {
  token: string;
  userId: string;
  username: string;
  role: string;
  name: string;
  jurisdictionName?: string;
  jurisdictionId?: string;
  avatarUrl?: string;
  memberId?: string;
  expiresAt: number;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// IMPORTANT: set SESSION_SECRET in production (especially Vercel) so every
// serverless instance can verify the same bearer token.
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-change-this-session-secret';

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signSessionPayload(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

function createSession(user: any): string {
  const payload = {
    userId: String(user.id),
    username: String(user.username || user.email || ''),
    role: String(user.role || 'MEMBER'),
    name: String(user.name || user.fullName || ''),
    jurisdictionName: user.jurisdictionName,
    jurisdictionId: user.jurisdictionId,
    avatarUrl: user.avatarUrl,
    memberId: user.memberId,
    exp: Date.now() + SESSION_TTL_MS
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${signSessionPayload(encoded)}`;
}

function getSessionUser(req: express.Request): ActiveSession | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = signSessionPayload(encodedPayload);

  try {
    const a = Buffer.from(providedSignature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload || typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;

    return {
      token,
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      name: payload.name,
      jurisdictionName: payload.jurisdictionName,
      jurisdictionId: payload.jurisdictionId,
      avatarUrl: payload.avatarUrl,
      memberId: payload.memberId,
      expiresAt: payload.exp
    };
  } catch {
    return null;
  }
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'saka-database.json');

const DEFAULT_SPREADSHEET_ID = '1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E';
const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit?usp=sharing`;
const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz0ZFGBmN3Hwt26lnUmpgXtwhs6f1PyWkezNsaU9OzSpKnIqxCaDnVcmJbl2sTaKJw4FQ/exec';

function hashPasswordForGoogleAppsScript(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const digest = crypto.createHash('sha256').update(`${salt}|${password}`, 'utf8').digest('hex');
  return `GAS2:${salt}:${digest}`;
}

interface DatabaseSchema {
  config: {
    spreadsheetId: string;
    spreadsheetUrl: string;
    scriptUrl: string;
    autoSync: boolean;
    autoRefreshIntervalSeconds: number;
    lastSyncedAt: string;
    status: string;
  };
  members: any[];
  tours: any[];
  culinaryItems: any[];
  activities: any[];
  kridaModules?: any[];
  users: any[];
  auditLogs: any[];
  lastUpdated: string;
  version: number;
}

// Initial in-memory database
let db: DatabaseSchema = {
  config: {
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
    scriptUrl: '',
    autoSync: true,
    autoRefreshIntervalSeconds: 6,
    lastSyncedAt: new Date().toISOString(),
    status: 'CONNECTED'
  },
  members: [],
  tours: [],
  culinaryItems: [],
  activities: [],
  kridaModules: [],
  users: [],
  auditLogs: [],
  lastUpdated: new Date().toISOString(),
  version: 1
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create data dir:', e);
  }
}

// Load database from file
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      db = {
        ...db,
        ...parsed,
        config: {
          ...db.config,
          ...(parsed.config || {})
        }
      };
      console.log(`[DB] Loaded ${db.members.length} members, ${db.tours.length} tours, ${db.activities.length} activities from file.`);
    }
  } catch (err) {
    console.error('[DB] Error loading database file:', err);
  }
}

// Ensure users and Super Admin account are securely initialized with password hashes
function initializeUsersAndSuperAdmin() {
  if (!Array.isArray(db.users)) {
    db.users = [];
  }

  // Scrub any legacy plain text passwords or insecure demo users
  db.users = db.users.filter(u => u.username !== 'rohadiwijaya' && u.password !== 'rohadiwijaya');

  const adminUsername = process.env.ADMIN_USERNAME || 'admin_saka';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SakaPariwisata#2026!';

  let superAdmin = db.users.find(u => u.role === 'SUPER_ADMIN');
  if (!superAdmin) {
    superAdmin = {
      id: 'user-superadmin-nasional',
      username: adminUsername,
      passwordHash: hashPassword(adminPassword),
      email: 'admin@sakapariwisata.id',
      name: 'Super Admin Kwartir Nasional',
      role: 'SUPER_ADMIN',
      jurisdictionName: 'Kwartir Nasional (Pusat)',
      jurisdictionId: '00',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };
    db.users.push(superAdmin);
    saveDatabase();
    console.log(`[Security] Super Admin account initialized with secure hashed password (Username: ${adminUsername}).`);
  } else if (!superAdmin.passwordHash) {
    superAdmin.passwordHash = hashPassword(adminPassword);
    delete (superAdmin as any).password;
    saveDatabase();
  }
}

// Save database to file
function saveDatabase() {
  try {
    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 0) + 1;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving database file:', err);
  }
}

loadDatabase();
initializeUsersAndSuperAdmin();

// GViz API fetcher helper
async function fetchSheetGViz(sheetName: string): Promise<Record<string, any>[]> {
  const spreadsheetId = db.config.spreadsheetId || DEFAULT_SPREADSHEET_ID;
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&_t=${Date.now()}`;
  try {
    const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) return [];
    const text = await res.text();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return [];

    const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    if (!json.table || !json.table.rows) return [];

    const cols = (json.table.cols || []).map((c: any, i: number) => (c && c.label && c.label.trim()) || `col_${i}`);
    return json.table.rows.map((row: any) => {
      const item: Record<string, any> = {};
      if (row.c) {
        row.c.forEach((cell: any, idx: number) => {
          const key = cols[idx] || `col_${idx}`;
          item[key] = cell ? (cell.v !== null && cell.v !== undefined ? cell.v : cell.f || '') : '';
        });
      }
      return item;
    }).filter((r: any) => Object.values(r).some(v => v !== '' && v !== null && v !== undefined));
  } catch (err) {
    console.warn(`[Sync] GViz fetch error for ${sheetName}:`, err);
    return [];
  }
}

function cleanDriveUrl(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) return trimmed;
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}

function getColVal(row: Record<string, any>, aliases: string[]): string {
  if (!row) return '';
  for (const a of aliases) {
    if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== '') {
      return String(row[a]).trim();
    }
  }
  const keys = Object.keys(row);
  for (const a of aliases) {
    const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const k of keys) {
      const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanK === cleanA) {
        const v = row[k];
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          return String(v).trim();
        }
      }
    }
  }
  return '';
}

// Full sync from Google Spreadsheet to Central Server DB
async function syncFromGoogleSpreadsheet(): Promise<{ success: boolean; message: string }> {
  console.log('[Sync] Starting full sync from Google Spreadsheet...');
  try {
    // 1. Sync Anggota
    const memberRows = await fetchSheetGViz('Anggota');
    if (memberRows && memberRows.length > 0) {
      const importedMembers = memberRows.map((row, idx) => {
        const fullName = getColVal(row, ['Nama Lengkap', 'Nama', 'Full Name', 'col_2']) || `Anggota ${idx + 1}`;
        const kta = getColVal(row, ['Nomor KTA', 'Nomor Anggota', 'NTA', 'KTA', 'No KTA', 'col_1']);
        const prov = getColVal(row, ['Provinsi', 'Kwartir Daerah', 'col_5']) || 'Jawa Barat';
        const reg = getColVal(row, ['Kabupaten/Kota', 'Kwarcab', 'col_6']) || 'Kota Bandung';
        const branch = getColVal(row, ['Kwarran/Kecamatan', 'Kwartir Ranting', 'col_7']) || 'Ranting Saka';
        const gudep = getColVal(row, ['Gudep', 'Gugus Depan', 'col_8']) || 'Gudep Saka Pariwisata';
        const krida = getColVal(row, ['Krida', 'Peminatan Krida', 'col_9']) || 'Krida Pemandu';
        const status = (getColVal(row, ['Status', 'col_10']) || 'ACTIVE').toUpperCase();
        const photo = cleanDriveUrl(getColVal(row, ['Foto URL', 'Foto', 'col_11'])) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80';
        const email = getColVal(row, ['Email', 'col_3']) || `member${idx + 1}@pramuka.id`;
        const phone = getColVal(row, ['Nomor WA', 'Telepon', 'col_4']) || '081234567890';
        const id = getColVal(row, ['ID', 'id', 'col_0']) || `member-${idx + 1}`;
        const registeredAt = getColVal(row, ['Tanggal Daftar', 'col_12']) || new Date().toISOString();

        return {
          id,
          userId: `user-${id}`,
          nationalMemberNumber: kta || undefined,
          fullName,
          nikMasked: '3201**********01',
          avatarUrl: photo,
          gender: 'LAKI_LAKI',
          birthPlace: 'Indonesia',
          birthDate: '2000-01-01',
          email,
          phone,
          address: `${branch}, ${reg}, ${prov}`,
          provinceId: '32',
          provinceName: prov,
          regencyId: '32.73',
          regencyName: reg,
          districtId: '32.73.01',
          districtName: branch,
          branchId: `branch-${idx + 1}`,
          branchName: branch,
          gugusDepan: gudep,
          currentPosition: fullName.includes('Rohadi') ? 'Ketua Pimpinan Saka Pariwisata Nasional' : `Anggota ${krida}`,
          krida,
          joinYear: 2024,
          educationLevel: 'SMA/SMK',
          occupation: 'Anggota Pramuka',
          bio: `Anggota resmi Saka Pariwisata ${prov}. Terdata langsung dari Google Spreadsheet.`,
          status: status === 'ACTIVE' || status === 'PENDING' ? status : 'ACTIVE',
          registeredAt,
          verificationToken: `VERIFY-SP-${kta ? kta.replace(/\./g, '') : id}`,
          isOperator: fullName.includes('Rohadi'),
          operatorRole: fullName.includes('Rohadi') ? 'SUPER_ADMIN' : undefined,
          skills: [],
          certifications: [],
          locationHistory: []
        };
      });

      // Deduplicate and merge members
      const existing = [...db.members];
      importedMembers.forEach(im => {
        const idx = existing.findIndex(e => e.id === im.id || (e.nationalMemberNumber && e.nationalMemberNumber === im.nationalMemberNumber));
        if (idx !== -1) {
          existing[idx] = { ...existing[idx], ...im };
        } else {
          existing.push(im);
        }
      });
      db.members = existing;
    }

    // 2. Sync Paket_Wisata
    const tourRows = await fetchSheetGViz('Paket_Wisata');
    if (tourRows && tourRows.length > 0) {
      db.tours = tourRows.map((row, idx) => {
        const id = getColVal(row, ['ID', 'id', 'col_0']) || `tour-sheet-${idx + 1}`;
        const title = getColVal(row, ['Nama Paket', 'title', 'col_1']) || `Paket Wisata ${idx + 1}`;
        const category = getColVal(row, ['Kategori', 'category', 'col_2']) || 'Ekowisata';
        const price = parseFloat(getColVal(row, ['Harga', 'price', 'col_3'])) || 450000;
        const duration = parseInt(getColVal(row, ['Durasi (Hari)', 'duration', 'col_4']), 10) || 2;
        const location = getColVal(row, ['Lokasi', 'location', 'col_5']) || '';
        const prov = getColVal(row, ['Provinsi', 'province', 'col_6']) || 'Jawa Barat';
        const reg = getColVal(row, ['Kabupaten/Kota', 'regency', 'col_7']) || 'Kabupaten Bandung';
        const organizer = getColVal(row, ['Penyelenggara', 'organizer', 'col_8']) || 'Saka Pariwisata';
        const phone = getColVal(row, ['Kontak WA', 'phone', 'col_9']) || '081223344556';
        const banner = cleanDriveUrl(getColVal(row, ['Foto Banner', 'col_10'])) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80';

        return {
          id,
          title,
          slug: id,
          category,
          pricePerPerson: price,
          durationDays: duration,
          locationAddress: location,
          provinceId: '32',
          provinceName: prov,
          regencyId: '32.04',
          regencyName: reg,
          districtName: 'Sentra Saka',
          ownerType: 'MEMBER',
          ownerId: 'mem-jabar-01',
          ownerName: organizer,
          contactPhone: phone,
          contactEmail: 'info@sakapariwisata.id',
          coverImage: banner,
          galleryImages: [banner],
          description: `Paket wisata edukasi dan petualangan ${title}. Dipandu oleh kader Pramuka Saka Pariwisata tersertifikasi.`,
          facilities: ['Pemandu Wisata Saka Pariwisata BNSP', 'Tiket Masuk Destinasi', 'Dokumentasi', 'Asuransi'],
          minCapacity: 2,
          maxCapacity: 30,
          guideProvided: true,
          itinerary: [{ day: 1, title: 'Eksplorasi Destinasi', description: 'Kunjungan dan pendampingan pemandu Saka Pariwisata' }],
          status: 'APPROVED_PUBLISHED',
          submittedAt: new Date().toISOString(),
          viewsCount: 20,
          featured: true
        };
      });
    }

    // 3. Sync Kuliner_Cinderamata
    const culinaryRows = await fetchSheetGViz('Kuliner_Cinderamata');
    if (culinaryRows && culinaryRows.length > 0) {
      db.culinaryItems = culinaryRows.map((row, idx) => {
        const id = getColVal(row, ['ID', 'id', 'col_0']) || `prod-sheet-${idx + 1}`;
        const name = getColVal(row, ['Nama Produk', 'name', 'col_1']) || `Produk Saka ${idx + 1}`;
        const kind = (getColVal(row, ['Jenis', 'kind', 'col_2']) || 'KULINER').toUpperCase() === 'CINDERAMATA' ? 'CINDERAMATA' : 'KULINER';
        const krida = getColVal(row, ['Kategori', 'krida', 'col_3']) || 'Krida Kuliner & Cinderamata';
        const price = parseFloat(getColVal(row, ['Harga', 'price', 'col_4'])) || 50000;
        const author = getColVal(row, ['Produsen/Pengrajin', 'author', 'col_5']) || 'Kader Saka Pariwisata';
        const phone = getColVal(row, ['Kontak WA', 'phone', 'col_6']) || '081223344556';
        const prov = getColVal(row, ['Provinsi', 'province', 'col_7']) || 'Jawa Barat';
        const reg = getColVal(row, ['Kabupaten/Kota', 'regency', 'col_8']) || 'Kabupaten Bandung';
        const img = cleanDriveUrl(getColVal(row, ['Foto Produk', 'col_9'])) || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';
        const catLabel = getColVal(row, ['Sertifikasi Halal', 'col_10']) || 'Produk UMKM Saka Pariwisata';

        return {
          id,
          name,
          kind,
          krida,
          kridaCategory: kind === 'KULINER' ? 'Kuliner & Minuman Daerah' : 'Kriya & Cinderamata Khas',
          categoryLabel: catLabel,
          description: `Produk karya kader Saka Pariwisata: ${name}. Terjamin mutu dan cita rasa lokal.`,
          priceEstimate: price,
          priceUnit: 'per kemasan / pcs',
          imageUrl: img,
          provinceId: '32',
          provinceName: prov,
          regencyId: '32.04',
          regencyName: reg,
          districtId: '32.04.01',
          districtName: 'Sentra Saka',
          authorMemberId: 'mem-jabar-01',
          authorName: author,
          contactPhone: phone,
          tags: ['UMKM', 'Saka Pariwisata', 'Lokal'],
          status: 'APPROVED',
          createdAt: new Date().toISOString(),
          likesCount: 20,
          featured: true
        };
      });
    }

    // 4. Sync Agenda_Kegiatan
    const actRows = await fetchSheetGViz('Agenda_Kegiatan');
    if (actRows && actRows.length > 0) {
      db.activities = actRows.map((row, idx) => {
        const id = getColVal(row, ['ID', 'id', 'col_0']) || `act-sheet-${idx + 1}`;
        const title = getColVal(row, ['Nama Agenda', 'Judul Kegiatan', 'Nama Kegiatan', 'title', 'col_1']) || `Kegiatan Saka ${idx + 1}`;
        const category = getColVal(row, ['Kategori', 'category', 'col_2']) || 'Pelatihan';
        const scale = (getColVal(row, ['Skala Tingkat', 'Tingkat', 'Level', 'col_3']) || 'NASIONAL').toUpperCase();
        const organizer = getColVal(row, ['Penyelenggara', 'col_4']) || 'Pimpinan Saka Pariwisata';
        const location = getColVal(row, ['Lokasi', 'Tempat', 'col_5']) || 'Bumi Perkemahan';
        const prov = getColVal(row, ['Provinsi', 'province', 'col_6']) || 'Jawa Barat';
        const startD = getColVal(row, ['Tanggal Mulai', 'startDate', 'col_7']) || '2026-09-18';
        const endD = getColVal(row, ['Tanggal Selesai', 'endDate', 'col_8']) || '2026-09-22';
        const feeType = (getColVal(row, ['Jenis Biaya', 'Biaya', 'col_9']) || 'GRATIS').toUpperCase();
        const fee = parseFloat(getColVal(row, ['Nominal Biaya', 'col_10'])) || 0;
        const phone = getColVal(row, ['Kontak Narahubung', 'Kontak WA', 'phone', 'col_11']) || '081299881122';

        return {
          id,
          title,
          slug: id,
          description: `Kegiatan resmi Saka Pariwisata: ${title}. Terbuka untuk seluruh anggota Gerakan Pramuka dan masyarakat.`,
          bannerUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80',
          coverImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80',
          category,
          organizerLevel: scale.includes('INTER') ? 'INTERNASIONAL' : scale.includes('PROV') ? 'PROVINSI' : scale.includes('KAB') ? 'KABUPATEN' : 'NASIONAL',
          organizerName: organizer,
          locationName: location,
          locationAddress: `${location}, ${prov}`,
          provinceName: prov,
          regencyName: 'Pusat Kegiatan',
          startDate: startD.includes('Date(') ? '2026-09-18' : startD,
          endDate: endD.includes('Date(') ? '2026-09-22' : endD,
          timeString: '08:00 - 17:00 WIB',
          capacity: 250,
          registeredCount: 0,
          isPublic: true,
          status: 'OPEN_REGISTRATION',
          requirements: ['Anggota Aktif Gerakan Pramuka / Saka Pariwisata'],
          contactPhone: phone,
          feeType: feeType.includes('SUBSIDI') ? 'SUBSIDI' : feeType.includes('BERBAYAR') ? 'BERBAYAR' : 'GRATIS',
          feeAmount: fee,
          uploadedByName: 'Pimpinan Saka Pariwisata',
          uploadedByRole: 'SUPER_ADMIN'
        };
      });
    }

    db.config.lastSyncedAt = new Date().toISOString();
    db.config.status = 'CONNECTED';
    saveDatabase();
    console.log(`[Sync] Full sync complete: ${db.members.length} members, ${db.tours.length} tours, ${db.culinaryItems.length} culinary, ${db.activities.length} activities.`);
    return { success: true, message: 'Sinkronisasi berhasil' };
  } catch (e: any) {
    console.error('[Sync] Error syncing from spreadsheet:', e);
    return { success: false, message: e.message };
  }
}

// Initial background sync
syncFromGoogleSpreadsheet().catch(err => console.warn('[Sync] Initial sync notice:', err));

// Periodic sync every 25 seconds
setInterval(() => {
  syncFromGoogleSpreadsheet().catch(() => {});
}, 25000);

// Proxy mutation to Google Apps Script Web App
async function forwardToGoogleAppsScript(payload: any): Promise<any> {
  const scriptUrl = String(db.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL).trim();
  if (!scriptUrl) throw new Error('Google Apps Script Web App URL belum dikonfigurasi.');

  const res = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!res.ok) {
    throw new Error(`Google Apps Script HTTP ${res.status}${data?.message ? `: ${data.message}` : ''}`);
  }
  if (data?.status === 'error') {
    throw new Error(data.message || 'Google Apps Script menolak permintaan.');
  }
  return data || { status: 'success' };
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ------------------------------------------
// AUTHENTICATION ROUTES
// ------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Nama pengguna dan kata sandi wajib diisi.' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const rawPass = String(password);

  // 1) Try the central Users sheet first for persistent member accounts.
  try {
    const gasResult = await forwardToGoogleAppsScript({
      action: 'AUTH_LOGIN',
      username: cleanUser,
      password: rawPass
    });
    if (gasResult?.status === 'success' && gasResult.user) {
      const gu = gasResult.user;
      const persistentUser = {
        id: gu.id || `user-${gu.memberId || Date.now()}`,
        username: gu.username || cleanUser,
        email: gu.email || '',
        name: gu.name || gu.username || cleanUser,
        role: gu.role || 'MEMBER',
        jurisdictionName: gu.jurisdictionName || '',
        jurisdictionId: gu.jurisdictionId || '',
        avatarUrl: gu.avatarUrl || '',
        memberId: gu.memberId || undefined,
        passwordHash: ''
      };

      const token = createSession(persistentUser);
      return res.json({
        success: true,
        token,
        user: {
          id: persistentUser.id,
          username: persistentUser.username,
          name: persistentUser.name,
          email: persistentUser.email,
          role: persistentUser.role,
          jurisdictionName: persistentUser.jurisdictionName,
          jurisdictionId: persistentUser.jurisdictionId,
          avatarUrl: persistentUser.avatarUrl,
          memberId: persistentUser.memberId
        }
      });
    }
  } catch (gasErr: any) {
    console.warn('[Auth] Persistent Users login unavailable:', gasErr?.message || gasErr);
  }

  // 2) Fallback for existing Super Admin / legacy local accounts.
  let matchedUser = db.users.find(u =>
    (u.username && u.username.toLowerCase() === cleanUser) ||
    (u.email && u.email.toLowerCase() === cleanUser)
  );

  if (!matchedUser) {
    const member = db.members.find(m =>
      (m.email && m.email.toLowerCase() === cleanUser) ||
      (m.nationalMemberNumber && m.nationalMemberNumber.toLowerCase() === cleanUser)
    );
    if (member && member.passwordHash) {
      matchedUser = {
        id: member.userId || `user-${member.id}`,
        username: member.email.split('@')[0],
        email: member.email,
        name: member.fullName,
        role: member.isOperator ? (member.operatorRole || 'ADMIN_REGENCY') : 'MEMBER',
        jurisdictionName: `${member.branchName || ''}, ${member.regencyName || ''}`,
        jurisdictionId: member.regencyId,
        avatarUrl: member.avatarUrl,
        memberId: member.id,
        passwordHash: member.passwordHash
      };
    }
  }

  if (!matchedUser || !matchedUser.passwordHash || !verifyPassword(rawPass, matchedUser.passwordHash)) {
    console.warn(`[Auth] Failed login attempt for user: ${cleanUser}`);
    return res.status(401).json({ success: false, message: 'Kombinasi nama pengguna atau kata sandi tidak valid.' });
  }

  const token = createSession(matchedUser);
  res.json({
    success: true,
    token,
    user: {
      id: matchedUser.id, username: matchedUser.username, name: matchedUser.name,
      email: matchedUser.email, role: matchedUser.role,
      jurisdictionName: matchedUser.jurisdictionName, jurisdictionId: matchedUser.jurisdictionId,
      avatarUrl: matchedUser.avatarUrl, memberId: matchedUser.memberId
    }
  });
});

// GET /api/auth/me - Verify current session token
app.get('/api/auth/me', (req, res) => {
  const session = getSessionUser(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Sesi tidak valid atau telah kedaluwarsa.' });
  }
  res.json({
    success: true,
    user: {
      id: session.userId,
      username: session.username,
      name: session.name,
      role: session.role,
      jurisdictionName: session.jurisdictionName,
      jurisdictionId: session.jurisdictionId,
      avatarUrl: session.avatarUrl,
      memberId: session.memberId
    }
  });
});

// POST /api/auth/logout - Invalidate session
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]?.trim();
    // Sessions are stateless. Clearing the bearer token on the client is the
    // logout action; persistent revocation would require a shared session store.
  }
  res.json({ success: true, message: 'Berhasil keluar.' });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', (req, res) => {
  const session = getSessionUser(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Harap masuk terlebih dahulu.' });
  }
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 6 karakter.' });
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
    return res.status(400).json({ success: false, message: 'Kata sandi saat ini tidak sesuai.' });
  }

  user.passwordHash = hashPassword(newPassword);
  saveDatabase();

  res.json({ success: true, message: 'Kata sandi berhasil diperbarui.' });
});

// POST /api/auth/register - Public new member registration
app.post('/api/auth/register', (req, res) => {
  const { memberData, password } = req.body || {};

  if (!memberData || !memberData.fullName) {
    return res.status(400).json({ success: false, message: 'Data anggota wajib dilengkapi.' });
  }

  const rawPassword = typeof password === 'string' ? password : '';
  if (rawPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Kata sandi minimal 6 karakter.' });
  }

  const email = String(memberData.email || '').trim().toLowerCase();
  const requestedUsername = String(memberData.username || '').trim().toLowerCase();
  const username = requestedUsername || (email ? email.split('@')[0] : '');

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email wajib diisi untuk membuat akun.' });
  }
  if (!username) {
    return res.status(400).json({ success: false, message: 'Nama pengguna tidak dapat ditentukan dari data pendaftaran.' });
  }

  const duplicateUser = db.users.find(u =>
    (u.username && String(u.username).toLowerCase() === username) ||
    (u.email && String(u.email).toLowerCase() === email)
  );
  if (duplicateUser) {
    return res.status(409).json({ success: false, message: 'Username atau email sudah terdaftar. Silakan gunakan akun yang sudah ada.' });
  }

  const duplicateMember = db.members.find(m =>
    (m.email && String(m.email).toLowerCase() === email) ||
    (memberData.nationalMemberNumber && m.nationalMemberNumber &&
      String(m.nationalMemberNumber).toLowerCase() === String(memberData.nationalMemberNumber).toLowerCase())
  );
  if (duplicateMember) {
    return res.status(409).json({ success: false, message: 'Email atau Nomor KTA sudah terdaftar.' });
  }

  // Preserve a client-generated ID when supplied so the frontend/local cache,
  // server DB and Spreadsheet row refer to the same member.
  const memberId = String(memberData.id || `member-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`);
  const userId = String(memberData.userId || `user-${memberId}`);
  const registeredAt = new Date().toISOString();
  const passHash = hashPassword(rawPassword);

  const newMember = {
    ...memberData,
    id: memberId,
    userId,
    email,
    status: 'PENDING',
    registeredAt,
    passwordHash: passHash
  };

  const newUser = {
    id: userId,
    username,
    email,
    passwordHash: passHash,
    name: newMember.fullName,
    role: 'MEMBER',
    jurisdictionName: `${newMember.branchName || ''}${newMember.regencyName ? `, ${newMember.regencyName}` : ''}`.replace(/^,\s*|\s*,\s*$/g, ''),
    jurisdictionId: newMember.regencyId,
    avatarUrl: newMember.avatarUrl,
    memberId,
    createdAt: registeredAt
  };

  db.members.unshift(newMember);
  db.users.push(newUser);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: 'public-register',
    userName: newMember.fullName,
    userRole: 'PUBLIC',
    action: 'REGISTER',
    targetType: 'MEMBER',
    targetId: memberId,
    description: `Pendaftaran mandiri calon anggota baru: ${newMember.fullName}`,
    timestamp: registeredAt
  });
  if (db.auditLogs.length > 500) db.auditLogs.pop();
  saveDatabase();

  // Persist BOTH authentication and member data to Google Spreadsheet.
  // Vercel's local filesystem is not a durable source of truth, so registration
  // must succeed at the central Apps Script endpoint before returning success.
  try {
    const gasPasswordHash = hashPasswordForGoogleAppsScript(rawPassword);

    await forwardToGoogleAppsScript({
      action: 'AUTH_REGISTER',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        jurisdictionName: newUser.jurisdictionName,
        jurisdictionId: newUser.jurisdictionId,
        avatarUrl: newUser.avatarUrl,
        memberId: newUser.memberId,
        status: 'PENDING',
        createdAt: registeredAt
      },
      passwordHash: gasPasswordHash
    });

    await forwardToGoogleAppsScript({
      action: 'UPSERT_MEMBER',
      sheet: 'Anggota',
      memberId: newMember.id,
      secondaryId: newMember.nationalMemberNumber || '',
      rowData: [
        newMember.id,
        newMember.nationalMemberNumber || '',
        newMember.fullName,
        newMember.email || '',
        newMember.phone || '',
        newMember.provinceName || '',
        newMember.regencyName || '',
        newMember.branchName || '',
        newMember.gugusDepan || '',
        newMember.krida || '',
        'PENDING',
        newMember.avatarUrl || '',
        newMember.registeredAt,
        `https://spwnapps.vercel.app/?verifyId=${newMember.nationalMemberNumber || newMember.id}`
      ]
    });
  } catch (gasErr: any) {
    // Roll back the transient Vercel records if the central write failed.
    db.members = db.members.filter(m => m.id !== memberId);
    db.users = db.users.filter(u => u.id !== userId);
    db.auditLogs = db.auditLogs.filter(l => l.targetId !== memberId);
    saveDatabase();
    console.error('[Auth Register] Central persistence failed:', gasErr);
    return res.status(502).json({
      success: false,
      message: `Pendaftaran belum disimpan ke Google Spreadsheet: ${gasErr?.message || 'koneksi Apps Script gagal.'}`
    });
  }

  // Registration creates a real server account and immediately establishes
  // a stateless session, so the newly registered user is already logged in.
  const token = createSession(newUser);
  const sanitizedUser = {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    jurisdictionName: newUser.jurisdictionName,
    jurisdictionId: newUser.jurisdictionId,
    avatarUrl: newUser.avatarUrl,
    memberId: newUser.memberId
  };

  res.status(201).json({
    success: true,
    message: 'Pendaftaran keanggotaan berhasil diajukan dan sedang menunggu verifikasi.',
    memberId,
    member: newMember,
    user: sanitizedUser,
    token
  });
});

// ------------------------------------------
// DATA & CONFIGURATION ROUTES (ROLE-ENFORCED)
// ------------------------------------------

// Config GET & POST
app.get('/api/config', (req, res) => {
  const session = getSessionUser(req);
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin) {
    // Only return safe public operational status
    return res.json({
      config: {
        status: db.config.status || 'CONNECTED',
        autoSync: db.config.autoSync,
        autoRefreshIntervalSeconds: db.config.autoRefreshIntervalSeconds || 6,
        lastSyncedAt: db.config.lastSyncedAt
      },
      lastUpdated: db.lastUpdated,
      version: db.version
    });
  }

  // Full config for Super Admin
  res.json({
    config: db.config,
    lastUpdated: db.lastUpdated,
    version: db.version
  });
});

app.post('/api/config', (req, res) => {
  const session = getSessionUser(req);
  if (session?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Wewenang Super Admin diperlukan untuk memperbarui konfigurasi pusat.' });
  }

  const updates = req.body || {};
  db.config = {
    ...db.config,
    ...updates
  };
  saveDatabase();
  console.log('[Config] Updated shared configuration by Super Admin:', session.name);
  res.json({ success: true, config: db.config });
});

// Central Data GET with strict Privacy and Role Enforcement
app.get('/api/data', (req, res) => {
  const session = getSessionUser(req);
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';
  const isOperator = session && ['ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(session.role);

  // Mask member data for public viewers to prevent data leaks
  const sanitizedMembers = db.members.map(m => {
    if (isSuperAdmin || isOperator) {
      return m; // Full data for authorized administration
    }
    // Public directory data only:
    return {
      id: m.id,
      nationalMemberNumber: m.nationalMemberNumber,
      fullName: m.fullName,
      nikMasked: m.nikMasked || '3201********0001',
      avatarUrl: m.avatarUrl,
      gender: m.gender,
      provinceName: m.provinceName,
      regencyName: m.regencyName,
      branchName: m.branchName,
      gugusDepan: m.gugusDepan,
      krida: m.krida,
      currentPosition: m.currentPosition,
      joinYear: m.joinYear,
      status: m.status,
      registeredAt: m.registeredAt,
      verificationToken: m.verificationToken,
      skills: m.skills,
      certifications: m.certifications
    };
  });

  // Only return users list if Super Admin
  const sanitizedUsers = isSuperAdmin 
    ? db.users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        role: u.role,
        jurisdictionName: u.jurisdictionName,
        jurisdictionId: u.jurisdictionId,
        avatarUrl: u.avatarUrl
      }))
    : [];

  // Only return audit logs if Super Admin or Operator
  const sanitizedAuditLogs = isSuperAdmin 
    ? db.auditLogs.slice(0, 100) 
    : isOperator 
      ? db.auditLogs.filter(l => l.userId === session.userId).slice(0, 50) 
      : [];

  // Sanitize spreadsheet config for public
  const sanitizedConfig = isSuperAdmin
    ? db.config
    : {
        status: db.config.status || 'CONNECTED',
        autoSync: db.config.autoSync,
        autoRefreshIntervalSeconds: db.config.autoRefreshIntervalSeconds || 6,
        lastSyncedAt: db.config.lastSyncedAt
      };

  res.json({
    members: sanitizedMembers,
    tours: db.tours.filter(t => isSuperAdmin || isOperator || t.status === 'APPROVED_PUBLISHED'),
    culinaryItems: db.culinaryItems.filter(c => isSuperAdmin || isOperator || c.status === 'APPROVED'),
    activities: db.activities,
    kridaModules: db.kridaModules || [],
    users: sanitizedUsers,
    auditLogs: sanitizedAuditLogs,
    config: sanitizedConfig,
    lastUpdated: db.lastUpdated,
    version: db.version
  });
});

// Manual Sync Trigger
app.post('/api/sync-spreadsheet', async (req, res) => {
  const session = getSessionUser(req);
  if (!session || (session.role !== 'SUPER_ADMIN' && !['ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(session.role))) {
    return res.status(403).json({ success: false, message: 'Autentikasi administrator diperlukan untuk sinkronisasi database.' });
  }

  const result = await syncFromGoogleSpreadsheet();
  res.json({
    ...result,
    membersCount: db.members.length,
    toursCount: db.tours.length,
    activitiesCount: db.activities.length,
    culinaryCount: db.culinaryItems.length,
    lastUpdated: db.lastUpdated
  });
});

// Central Mutation API - Receives any create/update/delete with Server Role Enforcement
app.post('/api/mutate', async (req, res) => {
  const session = getSessionUser(req);
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';
  const isOperator = session && ['ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(session.role);

  const { type, action, payload } = req.body || {};
  if (!type || !action) {
    return res.status(400).json({ success: false, message: 'Parameter type atau action tidak lengkap.' });
  }

  // Role Validation for sensitive actions
  if (type === 'MEMBER') {
    if (action === 'DELETE') {
      if (!isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'Hanya Super Admin Nasional yang berhak menghapus data anggota.' });
      }
    } else if (action === 'UPDATE' || action === 'STATUS' || action === 'BATCH_DELETE_DUMMY') {
      if (!isSuperAdmin && !isOperator) {
        return res.status(403).json({ success: false, message: 'Wewenang administrator diperlukan untuk memperbarui data anggota.' });
      }
    }
  }

  // Audit Logging
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: session?.userId || 'guest-user',
    userName: session?.name || 'Pengunjung / Publik',
    userRole: session?.role || 'PUBLIC',
    action: `${type}_${action}`,
    targetType: type,
    targetId: payload?.id || payload?.memberId || 'unknown',
    description: `Operasi mutasi ${action} pada ${type} (${payload?.fullName || payload?.title || payload?.name || payload?.id || ''})`,
    timestamp: new Date().toISOString()
  });
  if (db.auditLogs.length > 500) db.auditLogs.pop();

  console.log(`[Mutation] [${session?.role || 'PUBLIC'}] Received ${type}:${action} from client.`);

  try {
    if (type === 'MEMBER') {
      const member = payload;
      if (action === 'CREATE' || action === 'REGISTER') {
        const idx = db.members.findIndex(m => m.id === member.id || (member.nationalMemberNumber && m.nationalMemberNumber === member.nationalMemberNumber));
        if (idx !== -1) {
          db.members[idx] = { ...db.members[idx], ...member };
        } else {
          db.members.unshift(member);
        }
        await forwardToGoogleAppsScript({
          action: 'UPSERT_MEMBER',
          sheet: 'Anggota',
          memberId: member.id,
          rowData: [
            member.id,
            member.nationalMemberNumber || '',
            member.fullName,
            member.email,
            member.phone,
            member.provinceName,
            member.regencyName,
            member.branchName,
            member.gugusDepan,
            member.krida || '',
            member.status || 'PENDING',
            member.avatarUrl,
            member.registeredAt,
            `https://spwnapps.vercel.app/?verifyId=${member.nationalMemberNumber || member.id}`
          ]
        });
      } else if (action === 'UPDATE' || action === 'STATUS' || action === 'PHOTO_UPDATE') {
        const idx = db.members.findIndex(m => m.id === member.id);
        if (idx !== -1) {
          db.members[idx] = { ...db.members[idx], ...member };
        } else {
          db.members.unshift(member);
        }
        await forwardToGoogleAppsScript({
          action: 'UPSERT_MEMBER',
          sheet: 'Anggota',
          memberId: member.id,
          rowData: [
            member.id,
            member.nationalMemberNumber || '',
            member.fullName,
            member.email,
            member.phone,
            member.provinceName,
            member.regencyName,
            member.branchName,
            member.gugusDepan,
            member.krida || '',
            member.status,
            member.avatarUrl,
            member.registeredAt,
            `https://spwnapps.vercel.app/?verifyId=${member.nationalMemberNumber || member.id}`
          ]
        });
        if ((action === 'STATUS' || action === 'UPDATE') && member.id && member.status) {
          await forwardToGoogleAppsScript({
            action: 'UPDATE_AUTH_STATUS',
            memberId: member.id,
            status: member.status
          });
        }
      } else if (action === 'DELETE') {
        const memberId = payload.id || payload.memberId;
        db.members = db.members.filter(m => m.id !== memberId);
        forwardToGoogleAppsScript({
          action: 'DELETE_ROW',
          sheet: 'Anggota',
          id: memberId,
          secondaryId: payload.kta || payload.nationalMemberNumber
        });
      }
    } else if (type === 'TOUR') {
      const tour = payload;
      if (action === 'CREATE' || action === 'UPDATE') {
        const idx = db.tours.findIndex(t => t.id === tour.id);
        if (idx !== -1) {
          db.tours[idx] = { ...db.tours[idx], ...tour };
        } else {
          db.tours.unshift(tour);
        }
        forwardToGoogleAppsScript({
          action: 'UPSERT_ROW',
          sheet: 'Paket_Wisata',
          id: tour.id,
          rowData: [
            tour.id,
            tour.title,
            tour.category,
            tour.pricePerPerson,
            tour.durationDays,
            tour.locationAddress || '',
            tour.provinceName,
            tour.regencyName,
            tour.ownerName,
            tour.contactPhone,
            tour.coverImage,
            new Date().toISOString()
          ]
        });
      } else if (action === 'DELETE') {
        db.tours = db.tours.filter(t => t.id !== payload.id);
        forwardToGoogleAppsScript({
          action: 'DELETE_ROW',
          sheet: 'Paket_Wisata',
          id: payload.id
        });
      }
    } else if (type === 'CULINARY') {
      const item = payload;
      if (action === 'CREATE' || action === 'UPDATE') {
        const idx = db.culinaryItems.findIndex(c => c.id === item.id);
        if (idx !== -1) {
          db.culinaryItems[idx] = { ...db.culinaryItems[idx], ...item };
        } else {
          db.culinaryItems.unshift(item);
        }
        forwardToGoogleAppsScript({
          action: 'UPSERT_ROW',
          sheet: 'Kuliner_Cinderamata',
          id: item.id,
          rowData: [
            item.id,
            item.name,
            item.kind,
            item.krida,
            item.priceEstimate,
            item.authorName,
            item.contactPhone,
            item.provinceName,
            item.regencyName,
            item.imageUrl,
            item.categoryLabel || 'Produk UMKM Saka Pariwisata',
            new Date().toISOString()
          ]
        });
      } else if (action === 'DELETE') {
        db.culinaryItems = db.culinaryItems.filter(c => c.id !== payload.id);
        forwardToGoogleAppsScript({
          action: 'DELETE_ROW',
          sheet: 'Kuliner_Cinderamata',
          id: payload.id
        });
      }
    } else if (type === 'ACTIVITY') {
      const act = payload;
      if (action === 'CREATE' || action === 'UPDATE') {
        const idx = db.activities.findIndex(a => a.id === act.id);
        if (idx !== -1) {
          db.activities[idx] = { ...db.activities[idx], ...act };
        } else {
          db.activities.unshift(act);
        }
        forwardToGoogleAppsScript({
          action: 'UPSERT_ROW',
          sheet: 'Agenda_Kegiatan',
          id: act.id,
          rowData: [
            act.id,
            act.title,
            act.category,
            act.organizerLevel,
            act.organizerName,
            act.locationName,
            act.provinceName,
            act.startDate,
            act.endDate,
            act.feeType,
            act.feeAmount,
            act.contactPhone,
            act.uploadedByName || 'Pimpinan Saka Pariwisata',
            new Date().toISOString()
          ]
        });
      } else if (action === 'DELETE') {
        db.activities = db.activities.filter(a => a.id !== payload.id);
        forwardToGoogleAppsScript({
          action: 'DELETE_ROW',
          sheet: 'Agenda_Kegiatan',
          id: payload.id
        });
      }
    } else if (type === 'KRIDA_MODULE') {
      const moduleItem = payload;
      if (!Array.isArray(db.kridaModules)) db.kridaModules = [];
      if (action === 'UPDATE' || action === 'CREATE') {
        const idx = db.kridaModules.findIndex(m => m.id === moduleItem.id);
        if (idx !== -1) {
          db.kridaModules[idx] = { ...db.kridaModules[idx], ...moduleItem };
        } else {
          db.kridaModules.push(moduleItem);
        }
      } else if (action === 'BATCH_UPDATE') {
        if (Array.isArray(payload)) {
          db.kridaModules = payload;
        }
      }
    }

    saveDatabase();
    res.json({
      success: true,
      lastUpdated: db.lastUpdated,
      version: db.version
    });
  } catch (err: any) {
    console.error('[Mutation Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk sync endpoint from client to server (Super Admin only)
app.post('/api/sync-bulk', (req, res) => {
  const session = getSessionUser(req);
  if (session?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang berhak melakukan sinkronisasi massal.' });
  }

  const { members, tours, culinaryItems, activities, config } = req.body || {};

  if (config) {
    db.config = { ...db.config, ...config };
  }

  if (Array.isArray(members) && members.length > 0) {
    const map = new Map<string, any>();
    db.members.forEach(m => map.set(m.id, m));
    members.forEach(m => map.set(m.id, { ...map.get(m.id), ...m }));
    db.members = Array.from(map.values());
  }

  if (Array.isArray(tours) && tours.length > 0) {
    const map = new Map<string, any>();
    db.tours.forEach(t => map.set(t.id, t));
    tours.forEach(t => map.set(t.id, { ...map.get(t.id), ...t }));
    db.tours = Array.from(map.values());
  }

  if (Array.isArray(culinaryItems) && culinaryItems.length > 0) {
    const map = new Map<string, any>();
    db.culinaryItems.forEach(c => map.set(c.id, c));
    culinaryItems.forEach(c => map.set(c.id, { ...map.get(c.id), ...c }));
    db.culinaryItems = Array.from(map.values());
  }

  if (Array.isArray(activities) && activities.length > 0) {
    const map = new Map<string, any>();
    db.activities.forEach(a => map.set(a.id, a));
    activities.forEach(a => map.set(a.id, { ...map.get(a.id), ...a }));
    db.activities = Array.from(map.values());
  }

  saveDatabase();
  res.json({ success: true, lastUpdated: db.lastUpdated, version: db.version });
});

// ==========================================
// VITE OR STATIC SERVING (WITH SPA FALLBACK)
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Saka Pariwisata Central Full-Stack Server running on port ${PORT}`);
    });
  }
}

startServer();

export { app };
