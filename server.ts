import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

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

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'saka-database.json');

const DEFAULT_SPREADSHEET_ID = '1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E';
const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit?usp=sharing`;

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
async function forwardToGoogleAppsScript(payload: any) {
  const scriptUrl = db.config.scriptUrl;
  if (!scriptUrl || scriptUrl.trim().length === 0) return;
  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`[GAS Forward] Action ${payload.action} sent to GAS. Status: ${res.status}`);
  } catch (err) {
    console.warn('[GAS Forward] Failed forwarding to GAS:', err);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Config GET & POST
app.get('/api/config', (req, res) => {
  res.json({
    config: db.config,
    lastUpdated: db.lastUpdated,
    version: db.version
  });
});

app.post('/api/config', (req, res) => {
  const updates = req.body || {};
  db.config = {
    ...db.config,
    ...updates
  };
  saveDatabase();
  console.log('[Config] Updated shared configuration:', db.config);
  res.json({ success: true, config: db.config });
});

// Central Data GET
app.get('/api/data', (req, res) => {
  res.json({
    members: db.members,
    tours: db.tours,
    culinaryItems: db.culinaryItems,
    activities: db.activities,
    kridaModules: db.kridaModules,
    users: db.users,
    auditLogs: db.auditLogs,
    config: db.config,
    lastUpdated: db.lastUpdated,
    version: db.version
  });
});

// Manual Sync Trigger
app.post('/api/sync-spreadsheet', async (req, res) => {
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

// Central Mutation API - Receives any create/update/delete from ANY device
app.post('/api/mutate', async (req, res) => {
  const { type, action, payload } = req.body || {};
  if (!type || !action) {
    return res.status(400).json({ success: false, message: 'Missing type or action' });
  }

  console.log(`[Mutation] Received ${type}:${action} from client.`);

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
        forwardToGoogleAppsScript({
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
            `https://sakapariwisata-nasional.vercel.app/?verifyId=${member.nationalMemberNumber || member.id}`
          ]
        });
      } else if (action === 'UPDATE' || action === 'STATUS' || action === 'PHOTO_UPDATE') {
        const idx = db.members.findIndex(m => m.id === member.id);
        if (idx !== -1) {
          db.members[idx] = { ...db.members[idx], ...member };
        } else {
          db.members.unshift(member);
        }
        forwardToGoogleAppsScript({
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
            `https://sakapariwisata-nasional.vercel.app/?verifyId=${member.nationalMemberNumber || member.id}`
          ]
        });
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

// Bulk sync endpoint from client to server
app.post('/api/sync-bulk', (req, res) => {
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
// VITE OR STATIC SERVING
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Saka Pariwisata Central Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
